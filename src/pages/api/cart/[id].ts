import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid cart item ID' });
  }

  // GET - Get specific cart item
  if (req.method === 'GET') {
    try {
      if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = (session.user as any).id || (session.user as any)._id;

      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: id,
          userId: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              images: true,
              stock: true,
              isActive: true,
            },
          },
        },
      });

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      return res.status(200).json({
        id: cartItem.id,
        productId: cartItem.productId,
        name: cartItem.product.name,
        price: cartItem.product.price,
        image: cartItem.product.image || cartItem.product.images?.[0] || '/placeholder.jpg',
        size: cartItem.size || '',
        color: cartItem.color || '',
        quantity: cartItem.quantity,
      });
    } catch (error) {
      console.error('Error fetching cart item:', error);
      return res.status(500).json({ error: 'Failed to fetch cart item' });
    }
  }

  // PATCH - Update cart item quantity
  if (req.method === 'PATCH') {
    try {
      const { quantity, size, color } = req.body;

      // For guest users
      if (!session?.user) {
        return res.status(200).json({
          success: true,
          message: 'Guest cart updated'
        });
      }

      const userId = (session.user as any).id || (session.user as any)._id;

      // Verify cart item belongs to user
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          id: id,
          userId: userId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              image: true,
              images: true,
              stock: true,
              isActive: true,
            },
          },
        },
      });

      if (!existingItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      if (!existingItem.product.isActive) {
        return res.status(400).json({ error: 'Product is no longer available' });
      }

      // Validate quantity against stock
      if (quantity !== undefined) {
        if (quantity < 1) {
          return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        if (quantity > existingItem.product.stock) {
          return res.status(400).json({
            error: 'Insufficient stock',
            availableStock: existingItem.product.stock,
          });
        }
      }

      // Update cart item
      const updatedItem = await prisma.cartItem.update({
        where: { id: id },
        data: {
          ...(quantity !== undefined && { quantity }),
          ...(size !== undefined && { size }),
          ...(color !== undefined && { color }),
        },
      });

      return res.status(200).json({
        id: updatedItem.id,
        productId: updatedItem.productId,
        name: existingItem.product.name,
        price: existingItem.product.price,
        image: existingItem.product.image || existingItem.product.images?.[0] || '/placeholder.jpg',
        size: updatedItem.size || '',
        color: updatedItem.color || '',
        quantity: updatedItem.quantity,
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      return res.status(500).json({ error: 'Failed to update cart item' });
    }
  }

  // DELETE - Remove item from cart
  if (req.method === 'DELETE') {
    try {
      // For guest users
      if (!session?.user) {
        return res.status(200).json({
          success: true,
          message: 'Guest cart item removed'
        });
      }

      const userId = (session.user as any).id || (session.user as any)._id;

      // Verify cart item belongs to user
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          id: id,
          userId: userId,
        },
      });

      if (!existingItem) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      await prisma.cartItem.delete({
        where: { id: id },
      });

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart'
      });
    } catch (error) {
      console.error('Error deleting cart item:', error);
      return res.status(500).json({ error: 'Failed to delete cart item' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}