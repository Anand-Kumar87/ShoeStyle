import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reviewId, action = 'increment' } = req.body;
    if (!reviewId || typeof reviewId !== 'string') {
      return res.status(400).json({ message: 'Review ID is required' });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, helpfulCount: true },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const newCount = action === 'decrement'
      ? Math.max(0, (review.helpfulCount || 0) - 1)
      : (review.helpfulCount || 0) + 1;

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: newCount },
      select: { id: true, helpfulCount: true },
    });

    return res.status(200).json({ success: true, helpfulCount: updated.helpfulCount });
  } catch (error: any) {
    console.error('Error updating review helpful count:', error);
    return res.status(500).json({ message: 'Failed to update helpful count' });
  }
}
