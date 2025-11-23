import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // GET - Fetch single order
    if (req.method === 'GET') {
      const order = await prisma.order.findFirst({
        where: {
          id,
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json(order);
    }

    // PATCH - Update order (cancel)
    if (req.method === 'PATCH') {
      const { status } = req.body;

      const order = await prisma.order.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Only allow cancelling pending/confirmed orders
      if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
        return res.status(400).json({ message: 'Cannot cancel this order' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status },
        include: {
          items: true,
        },
      });

      return res.status(200).json(updatedOrder);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Order API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}