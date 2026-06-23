import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const totalRevenue = await prisma.order.aggregate({
        _sum: { total: true }
      });
      const totalOrders = await prisma.order.count();
      const totalUsers = await prisma.user.count();
      const totalProducts = await prisma.product.count();

      return res.status(200).json({
        revenue: totalRevenue._sum.total || 0,
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
