import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get session with better error handling
    const session = await getServerSession(req, res, authOptions);

    // Handle unauthenticated requests
    if (!session) {
      if (req.method === 'GET') {
        return res.status(200).json([]);
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if session.user exists
    if (!session.user || !session.user.email) {
      if (req.method === 'GET') {
        return res.status(200).json([]);
      }
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // GET - Fetch user's wishlist
    if (req.method === 'GET') {
      const wishlist = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        include: {
          product: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(wishlist);
    }

    // POST - Add to wishlist
    if (req.method === 'POST') {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if already in wishlist
      const existingItem = await prisma.wishlistItem.findFirst({
        where: {
          userId: user.id,
          productId: productId,
        },
      });

      if (existingItem) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      // Add to wishlist
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId: user.id,
          productId: productId,
        },
        include: {
          product: true,
        },
      });

      return res.status(201).json(wishlistItem);
    }

    // DELETE - Remove from wishlist
    if (req.method === 'DELETE') {
      const { productId } = req.query;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      try {
        await prisma.wishlistItem.delete({
          where: {
            userId_productId: {
              userId: user.id,
              productId: productId,
            },
          },
        });

        return res.status(200).json({ message: 'Removed from wishlist' });
      } catch (error) {
        return res.status(404).json({ message: 'Item not found in wishlist' });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Wishlist API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}