import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = (session.user as any).id || (session.user as any)._id;

    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items format' });
    }

    // Get existing cart items for user
    const existingCartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
    });

    const mergedItems = [];

    for (const item of items) {
      const { productId, quantity, size, color } = item;

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
          images: true,
          stock: true,
          isActive: true,
        },
      });

      if (!product || !product.isActive) {
        console.log(`Skipping invalid/inactive product: ${productId}`);
        continue;
      }

      // Check if item already exists in user's cart
      const existingItem = existingCartItems.find(
        (cartItem) =>
          cartItem.productId === productId &&
          cartItem.size === (size || null) &&
          cartItem.color === (color || null)
      );

      if (existingItem) {
        // Update quantity (don't exceed stock)
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock
        );

        const updatedItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });

        mergedItems.push({
          id: updatedItem.id,
          productId: updatedItem.productId,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0] || '/placeholder.jpg',
          size: updatedItem.size || '',
          color: updatedItem.color || '',
          quantity: updatedItem.quantity,
        });
      } else {
        // Create new cart item
        const newQuantity = Math.min(quantity, product.stock);

        const newItem = await prisma.cartItem.create({
          data: {
            userId: userId,
            productId: productId,
            quantity: newQuantity,
            size: size || null,
            color: color || null,
          },
        });

        mergedItems.push({
          id: newItem.id,
          productId: newItem.productId,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0] || '/placeholder.jpg',
          size: newItem.size || '',
          color: newItem.color || '',
          quantity: newItem.quantity,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Cart synced successfully',
      items: mergedItems,
      count: mergedItems.length,
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return res.status(500).json({ error: 'Failed to sync cart' });
  }
}