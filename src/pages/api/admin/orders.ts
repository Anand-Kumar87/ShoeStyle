import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Security Check: Only Admin can access this API
    const session = await getServerSession(req, res, authOptions);

    // 🔥 Z+ SECURITY: Case-Insensitive Admin Check
    const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

    if (!session || !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized access. Admin only.' });
    }

    // GET: Fetch all orders for Admin Panel
    if (req.method === 'GET') {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      });
      res.setHeader('Cache-Control', 'private, max-age=10, stale-while-revalidate=60');
      return res.status(200).json(orders);
    }

    // PUT: Update Order Status, Payment Status, Tracking Info
    if (req.method === 'PUT') {
      const { id, status, paymentStatus, trackingNumber, carrier } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

      // 🔥 SMART UPDATE LOGIC: Prepare dynamic update object
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (carrier !== undefined) updateData.carrier = carrier;

      let previousOrder = null;
      if (status === 'CANCELLED') {
        previousOrder = await prisma.order.findUnique({
          where: { id },
          include: { items: true },
        });
      }

      // Update in Database
      const updatedOrder = await prisma.order.update({
        where: { id: id },
        data: updateData,
        include: { items: true },
      });

      // 📦 If status transitioned to CANCELLED, restore product stock in DB
      if (status === 'CANCELLED' && previousOrder && previousOrder.status !== 'CANCELLED') {
        for (const item of previousOrder.items) {
          if (item.productId) {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: Number(item.quantity) || 1 } },
            }).catch(() => {});
          }
        }
      }

      return res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Admin Orders API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}