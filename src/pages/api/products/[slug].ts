import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { slug: slug as string },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
        },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ error: 'Failed to fetch product' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const product = await prisma.product.update({
        where: { slug: slug as string },
        data: req.body,
      });

      return res.status(200).json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.product.delete({
        where: { slug: slug as string },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}