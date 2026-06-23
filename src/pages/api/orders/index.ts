import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    // Handle unauthenticated requests
    if (!session || !session.user || !session.user.email) {
      if (req.method === 'GET') {
        return res.status(200).json([]);
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // GET - Fetch user's orders
    if (req.method === 'GET') {
      const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
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
            country: order.country || ''
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

    // POST - Create new order
    if (req.method === 'POST') {
      // Extract everything passed from CheckoutPage
      const {
        items,
        shippingAddress,
        subtotal: bodySubtotal,
        tax: bodyTax,
        shipping: bodyShipping,
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

      // 🔥 USE DYNAMIC AMOUNTS: Use the exact amounts calculated by the Global Context in frontend
      const calculatedSubtotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      const finalSubtotal = bodySubtotal ?? calculatedSubtotal;
      const finalTax = bodyTax ?? 0;
      const finalShipping = bodyShipping ?? 0;
      const finalTotal = bodyTotal ?? (finalSubtotal + finalTax + finalShipping);

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Smart Mapping: Extract Name to First/Last
      const fullName = shippingAddress.name || '';
      const nameParts = fullName.split(' ');
      const firstName = shippingAddress.firstName || nameParts[0] || '';
      const lastName = shippingAddress.lastName || nameParts.slice(1).join(' ') || '';

      // Create order with items
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
          country: shippingAddress.country || 'Not Specified',

          // Calculated Totals
          subtotal: finalSubtotal,
          tax: finalTax,
          shipping: finalShipping,
          total: finalTotal,

          // Status Fields
          paymentMethod: paymentMethod || 'pending',
          paymentStatus: paymentStatus || 'PENDING', // Will be PENDING initially
          status: status || 'PENDING',

          items: {
            create: items.map((item: any) => ({
              productId: item.productId || item.id,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return res.status(201).json(order);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Orders API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}