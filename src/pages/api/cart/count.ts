import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get total count of items in cart
 * Returns the sum of all item quantities
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    // For guest users, return 0 (they use localStorage)
    if (!session?.user) {
      return res.status(200).json({ count: 0 });
    }

    // Get user ID (MongoDB compatible)
    const userId = (session.user as any).id || (session.user as any)._id;

    if (!userId) {
      return res.status(200).json({ count: 0 });
    }

    // Get all cart items for user
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: userId,
      },
      select: {
        quantity: true,
      },
    });

    // Calculate total count (sum of all quantities)
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({ count: totalCount });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return res.status(500).json({ error: 'Failed to fetch cart count' });
  }
}