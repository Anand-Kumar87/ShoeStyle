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

      return res.status(200).json(orders);
    }

    // POST - Create new order
    if (req.method === 'POST') {
      const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: 'Order items are required' });
      }

      if (!shippingAddress) {
        return res.status(400).json({ message: 'Shipping address is required' });
      }

      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1; // 10% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const total = subtotal + tax + shipping;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order with items
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user.id,
          firstName: shippingAddress.firstName || '',
          lastName: shippingAddress.lastName || '',
          email: shippingAddress.email || user.email,
          phone: shippingAddress.phone || '',
          address: shippingAddress.address || '',
          apartment: shippingAddress.apartment,
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          zipCode: shippingAddress.zipCode || '',
          country: shippingAddress.country || 'US',
          subtotal,
          tax,
          shipping,
          total,
          paymentMethod: paymentMethod || 'card',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
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