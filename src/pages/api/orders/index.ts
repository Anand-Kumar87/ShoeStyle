import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    // Handle unauthenticated requests
    if (!session || !session.user || !session.user.email) {
      if (req.method === 'GET') {
        return res.status(200).json([]);
      }
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ==========================================
    // GET - Fetch user's orders
    // ==========================================
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=30');
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // 🔥 SMART DATA FORMATTING: Ensure frontend gets everything correctly
      const formattedOrders = orders.map(order => {
        let formattedShippingAddress = (order as any).shippingAddress;

        if (!formattedShippingAddress || typeof formattedShippingAddress !== 'object') {
          formattedShippingAddress = {
            name: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer',
            email: order.email || '',
            phone: order.phone || '',
            street: `${order.address || ''} ${order.apartment || ''}`.trim(),
            city: order.city || '',
            state: order.state || '',
            zip: order.zipCode || '',
            country: order.country || 'IN'
          };
        }

        return {
          ...order,
          shippingAddress: formattedShippingAddress,
          paymentStatus: order.paymentStatus || 'PENDING',
          paymentMethod: order.paymentMethod || 'cod',
          status: order.status || 'PENDING',
        };
      });

      return res.status(200).json(formattedOrders);
    }

    // ==========================================
    // POST - Create new order
    // ==========================================
    if (req.method === 'POST') {
      // Extract everything passed from CheckoutPage
      const {
        items,
        shippingAddress,
        subtotal: bodySubtotal,
        tax: bodyTax,
        shipping: bodyShipping,
        discount: bodyDiscount, // 🔥 Captured discount
        couponCode: bodyCouponCode, // 🔥 Captured coupon code
        total: bodyTotal,
        paymentMethod,
        paymentStatus,
        status
      } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Order items are required' });
      }

      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }

      // 🛡️ SECURITY HARDENING: Fetch authentic product prices from database to prevent price tampering
      const productIds = items.map((item: any) => item.productId || item.id).filter(Boolean);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, name: true, image: true, stock: true, isSale: true, salePrice: true }
      });
      const productMap = new Map(dbProducts.map(p => [p.id, p]));

      // 🛡️ Ensure all items in the order actually exist in the database (guards against obsolete/deleted products)
      const invalidItems = items.filter((item: any) => !productMap.has(item.productId || item.id));
      if (invalidItems.length > 0) {
        return res.status(400).json({
          message: `Some items in your cart are no longer available (${invalidItems.map((i: any) => i.name || 'Unavailable Item').join(', ')}). Please remove them from your cart to proceed.`,
        });
      }

      const getAuthenticPrice = (p: any) => {
        if (!p) return 0;
        if (p.isSale && p.salePrice && p.price > p.salePrice) {
          return p.salePrice;
        }
        return p.price;
      };

      // 🛡️ INVENTORY STOCK VALIDATION: Ensure all items have sufficient stock
      for (const item of items) {
        const prodId = item.productId || item.id;
        const dbProduct = productMap.get(prodId);
        if (dbProduct) {
          const qty = item.quantity || 1;
          if (dbProduct.stock <= 0) {
            return res.status(400).json({
              message: `Sorry, "${dbProduct.name}" is currently Out of Stock! Please remove it from your cart.`,
              outOfStockProductId: prodId
            });
          }
          if (dbProduct.stock < qty) {
            return res.status(400).json({
              message: `Only ${dbProduct.stock} unit(s) available in stock for "${dbProduct.name}". Please adjust quantity.`,
              availableStock: dbProduct.stock,
              productId: prodId
            });
          }
        }
      }

      // Compute authentic subtotal using server-side product prices
      const calculatedSubtotal = items.reduce((sum: number, item: any) => {
        const dbProduct = productMap.get(item.productId || item.id);
        const authenticPrice = dbProduct ? getAuthenticPrice(dbProduct) : (item.price || 0);
        return sum + (authenticPrice * (item.quantity || 1));
      }, 0);

      // Verify coupon discount on server
      let serverDiscount = 0;
      if (bodyCouponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: bodyCouponCode.toUpperCase() }
        });
        const now = new Date();
        if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) >= now)) {
          const perUserLimit = coupon.perUserLimit || 1;
          const userOrderCount = await prisma.order.count({
            where: {
              couponCode: { equals: coupon.code, mode: 'insensitive' },
              status: { notIn: ['CANCELLED', 'FAILED'] },
              OR: [
                { userId: user.id },
                { email: { equals: user.email, mode: 'insensitive' } },
                shippingAddress.email ? { email: { equals: shippingAddress.email, mode: 'insensitive' } } : undefined,
              ].filter(Boolean) as any[],
              // 🛡️ Only count orders that were actually PAID or confirmed/processing/shipped/delivered
              AND: [
                {
                  OR: [
                    { paymentStatus: 'PAID' },
                    { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
                    { AND: [{ paymentMethod: 'cod' }, { status: { notIn: ['CANCELLED', 'FAILED'] } }] },
                  ]
                }
              ]
            },
          });

          if (userOrderCount >= perUserLimit) {
            return res.status(400).json({
              message: `You have already used coupon code "${coupon.code}". This coupon is limited to ${perUserLimit} use per customer.`,
            });
          }

          if (!coupon.minPurchase || calculatedSubtotal >= coupon.minPurchase) {
            if (coupon.discountType === 'PERCENTAGE') {
              serverDiscount = (calculatedSubtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscount && serverDiscount > coupon.maxDiscount) {
                serverDiscount = coupon.maxDiscount;
              }
            } else if (coupon.discountType === 'FIXED_AMOUNT') {
              serverDiscount = Math.min(calculatedSubtotal, coupon.discountValue);
            }
          }
        }
      }

      const finalSubtotal = calculatedSubtotal;
      const finalDiscount = bodyCouponCode ? serverDiscount : (bodyDiscount ?? 0);
      const finalTax = bodyTax ?? (finalSubtotal * 0.10); // Standard tax
      const finalShipping = bodyShipping ?? 0;

      // Calculate final total ensuring it doesn't go below 0
      const finalTotal = Math.max(0, (finalSubtotal + finalTax + finalShipping - finalDiscount));

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Smart Mapping: Extract Name to First/Last
      const fullName = shippingAddress.name || '';
      const nameParts = fullName.split(' ');
      const firstName = shippingAddress.firstName || nameParts[0] || '';
      const lastName = shippingAddress.lastName || nameParts.slice(1).join(' ') || '';

      // Create order with items in PostgreSQL Database
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          firstName: firstName,
          lastName: lastName,
          email: shippingAddress.email || user.email,
          phone: shippingAddress.phone || '',

          // Address Fields mapping
          address: shippingAddress.street || shippingAddress.address || '',
          apartment: shippingAddress.apartment || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zipCode: shippingAddress.zip || shippingAddress.zipCode || '',
          country: (() => {
            const raw = (shippingAddress.country || 'IN').toUpperCase();
            if (raw === 'IN' || raw === 'IND' || raw.includes('INDIA') || raw.includes('(IN)')) {
              return 'IN';
            }
            return shippingAddress.country || 'IN';
          })(),

          // Calculated Totals
          subtotal: finalSubtotal,
          tax: finalTax,
          shipping: finalShipping,
          discount: finalDiscount,
          couponCode: bodyCouponCode || null,
          total: finalTotal,

          // Status Fields
          paymentMethod: paymentMethod || 'pending',
          paymentStatus: paymentStatus || 'PENDING',
          status: status || 'PENDING',

          items: {
            create: items.map((item: any) => {
              const dbProduct = productMap.get(item.productId || item.id);
              return {
                productId: item.productId || item.id,
                name: dbProduct?.name || item.name,
                image: dbProduct?.image || item.image,
                price: dbProduct ? getAuthenticPrice(dbProduct) : (item.price || 0),
                quantity: item.quantity,
                size: item.size || null,
                color: item.color || null,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });

      // 📦 INVENTORY AUTO-DECREMENT: Decrement product stock in PostgreSQL
      for (const item of items) {
        const prodId = item.productId || item.id;
        const qty = Number(item.quantity) || 1;
        if (prodId && productMap.has(prodId)) {
          await prisma.product.update({
            where: { id: prodId },
            data: {
              stock: {
                decrement: qty,
              },
            },
          }).catch((err) => {
            console.error(`Error decrementing stock for product ${prodId}:`, err);
          });
        }
      }

      // Increment coupon usage count
      if (bodyCouponCode) {
        await prisma.coupon.update({
          where: { code: bodyCouponCode.toUpperCase() },
          data: { usageCount: { increment: 1 } },
        }).catch(() => {});
      }

      return res.status(201).json(order);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Orders API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}