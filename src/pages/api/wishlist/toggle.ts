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
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if item exists in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      // Remove from wishlist
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId: productId,
          },
        },
      });

      return res.status(200).json({ inWishlist: false, message: 'Removed from wishlist' });
    } else {
      // Add to wishlist
      await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId: productId,
        },
      });

      return res.status(201).json({ inWishlist: true, message: 'Added to wishlist' });
    }
  } catch (error: any) {
    console.error('Wishlist toggle error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}