import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return res.status(500).json({ error: 'Failed to fetch coupons' });
    }
  }

  if (req.method === 'POST') {
    try {
      const coupon = await prisma.coupon.create({
        data: req.body,
      });

      return res.status(201).json(coupon);
    } catch (error) {
      console.error('Error creating coupon:', error);
      return res.status(500).json({ error: 'Failed to create coupon' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}