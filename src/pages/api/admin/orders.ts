import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]'; // Path check kar lena agar alag ho
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Security Check: Only Admin can access this API
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.role !== 'admin') {
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
      return res.status(200).json(orders);
    }

    // PUT: Update Order Status OR Payment Status
    if (req.method === 'PUT') {
      const { id, status, paymentStatus } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

      // 🔥 SMART UPDATE LOGIC: Prepare dynamic update object
      // Isse agar sirf 'paymentStatus' update hoga toh 'status' delete nahi hoga, aur vice-versa.
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

      // Update in Database
      const updatedOrder = await prisma.order.update({
        where: { id: id },
        data: updateData,
      });

      return res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Admin Orders API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}