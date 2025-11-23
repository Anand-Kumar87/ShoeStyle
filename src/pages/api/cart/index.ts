import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // GET - Retrieve cart items
  if (req.method === 'GET') {
    try {
      // If user is authenticated, get cart from database
      if (session?.user) {
        const userId = (session.user as any).id || (session.user as any)._id;

        if (!userId) {
          return res.status(401).json({ error: 'User ID not found' });
        }

        const cartItems = await prisma.cartItem.findMany({
          where: {
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
                slug: true,
              },
            },
          },
        });

        // Format response to match CartItem interface
        const formattedItems = cartItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || item.product.images?.[0] || '/placeholder.jpg',
          size: item.size || '',
          color: item.color || '',
          quantity: item.quantity,
        }));

        return res.status(200).json({ items: formattedItems });
      }

      // For guest users, return empty cart
      return res.status(200).json({ items: [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({ error: 'Failed to fetch cart' });
    }
  }

  // POST - Add item to cart
  if (req.method === 'POST') {
    try {
      const { productId, quantity, size, color } = req.body;

      // Validate input
      if (!productId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if product exists and has enough stock
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

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (!product.isActive) {
        return res.status(400).json({ error: 'Product is not available' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          availableStock: product.stock,
        });
      }

      // If user is authenticated, save to database
      if (session?.user) {
        const userId = (session.user as any).id || (session.user as any)._id;

        if (!userId) {
          return res.status(401).json({ error: 'User ID not found' });
        }

        // Check if item already exists in cart
        const existingCartItem = await prisma.cartItem.findFirst({
          where: {
            userId: userId,
            productId: productId,
            size: size || null,
            color: color || null,
          },
        });

        if (existingCartItem) {
          // Update quantity
          const newQuantity = existingCartItem.quantity + quantity;

          if (newQuantity > product.stock) {
            return res.status(400).json({
              error: 'Insufficient stock',
              availableStock: product.stock,
            });
          }

          const updatedItem = await prisma.cartItem.update({
            where: { id: existingCartItem.id },
            data: { quantity: newQuantity },
          });

          return res.status(200).json({
            id: updatedItem.id,
            productId: updatedItem.productId,
            name: product.name,
            price: product.price,
            image: product.image || product.images?.[0] || '/placeholder.jpg',
            size: updatedItem.size || '',
            color: updatedItem.color || '',
            quantity: updatedItem.quantity,
          });
        }

        // Create new cart item
        const cartItem = await prisma.cartItem.create({
          data: {
            userId: userId,
            productId: productId,
            quantity: quantity,
            size: size || null,
            color: color || null,
          },
        });

        return res.status(201).json({
          id: cartItem.id,
          productId: cartItem.productId,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0] || '/placeholder.jpg',
          size: cartItem.size || '',
          color: cartItem.color || '',
          quantity: cartItem.quantity,
        });
      }

      // For guest users, return success
      return res.status(200).json({
        success: true,
        message: 'Item added to cart (guest mode)',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({ error: 'Failed to add item to cart' });
    }
  }

  // DELETE - Clear entire cart
  if (req.method === 'DELETE') {
    try {
      if (!session?.user) {
        return res.status(200).json({ success: true, message: 'Guest cart cleared' });
      }

      const userId = (session.user as any).id || (session.user as any)._id;

      if (!userId) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      await prisma.cartItem.deleteMany({
        where: { userId: userId },
      });

      return res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      return res.status(500).json({ error: 'Failed to clear cart' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}