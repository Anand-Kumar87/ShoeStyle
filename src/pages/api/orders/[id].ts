import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET and PUT methods
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
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

    // 🔥 Z+ Security: Ensure the user owns this order OR is an ADMIN
    const isAdmin = user.role?.toUpperCase() === 'ADMIN';
    if (order.userId !== user.id && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden. You do not have access to this order.' });
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
          country: legacyOrder.country || 'IN' // 🔥 Fixed default to IN
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
    // 🚀 PUT REQUEST - Securely Update Payment Method
    // ==========================================
    if (req.method === 'PUT') {
      const { paymentMethod } = req.body;

      // 🛡️ Guard against modifying already paid or finalized orders
      if (order.paymentStatus === 'PAID') {
        return res.status(400).json({ message: 'Order is already paid and cannot be modified.' });
      }

      if (['DELIVERED', 'CANCELLED'].includes(order.status.toUpperCase())) {
        return res.status(400).json({ message: 'Order is closed and cannot be modified.' });
      }

      const rawMethod = (paymentMethod || '').toString().toUpperCase();
      const allowedMethods = ['COD', 'RAZORPAY', 'CARD', 'UPI', 'NETBANKING', 'ONLINE'];
      const sanitizedMethod = allowedMethods.includes(rawMethod) ? rawMethod : order.paymentMethod;

      const updatedOrder = await prisma.order.update({
        where: { id: id },
        data: {
          paymentMethod: sanitizedMethod,
          ...(sanitizedMethod === 'COD' ? { status: 'CONFIRMED' } : {}),
        }
      });

      return res.status(200).json(updatedOrder);
    }

  } catch (error: any) {
    console.error('Order Detail API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}