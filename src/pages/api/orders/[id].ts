import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET and PUT methods
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch single order details
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure the user owns this order (Security check)
    if (order.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // ==========================================
    // 🚀 GET REQUEST - Fetch Order Details
    // ==========================================
    if (req.method === 'GET') {
      let formattedShippingAddress = (order as any).shippingAddress;

      if (!formattedShippingAddress || typeof formattedShippingAddress !== 'object') {
        const legacyOrder = order as any;
        formattedShippingAddress = {
          name: `${legacyOrder.firstName || ''} ${legacyOrder.lastName || ''}`.trim() || 'Customer',
          email: legacyOrder.email || session.user.email || '',
          phone: legacyOrder.phone || '',
          street: `${legacyOrder.address || ''} ${legacyOrder.apartment || ''}`.trim(),
          city: legacyOrder.city || '',
          state: legacyOrder.state || '',
          zip: legacyOrder.zipCode || legacyOrder.zip || '',
          country: legacyOrder.country || 'Not Specified'
        };
      }

      const formattedOrder = {
        ...order,
        shippingAddress: formattedShippingAddress,
        paymentStatus: order.paymentStatus || 'PENDING',
        paymentMethod: order.paymentMethod || 'cod',
        status: order.status || 'PENDING',
      };

      return res.status(200).json(formattedOrder);
    }

    // ==========================================
    // 🚀 PUT REQUEST - Automatically Update Payment Method
    // ==========================================
    if (req.method === 'PUT') {
      const { paymentMethod } = req.body;

      const updatedOrder = await prisma.order.update({
        where: { id: id },
        data: {
          ...(paymentMethod && { paymentMethod }),
        }
      });

      return res.status(200).json(updatedOrder);
    }

  } catch (error: any) {
    console.error('Order Detail API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}