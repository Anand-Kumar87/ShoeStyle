import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
      return res.status(401).json({ message: 'You must be logged in to review.' });
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Create the new review
    const newReview = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        productId,
        userId: user.id,
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    // 2. Update the product's average rating & review count
    const allReviews = await prisma.review.findMany({
      where: { productId }
    });

    const totalReviews = allReviews.length;
    const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: averageRating,
        reviewCount: totalReviews
      }
    });

    return res.status(201).json(newReview);
  } catch (error: any) {
    console.error('Review submission error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}