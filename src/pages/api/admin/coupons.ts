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
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json(coupons);
  }

  if (req.method === 'POST') {
    const coupon = await prisma.coupon.create({ data: req.body });
    return res.status(201).json(coupon);
  }

  if (req.method === 'PUT') {
    const { id, ...data } = req.body;
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return res.status(200).json(coupon);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    await prisma.coupon.delete({ where: { id } });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
