import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', search = '', category = '' } = req.query;
      
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, parseInt(limit as string));
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (search) where.OR = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];
      if (category) where.category = category;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          select: { id: true, name: true, sku: true, price: true, stock: true, category: true, image: true, createdAt: true },
          orderBy: { [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.product.count({ where }),
      ]);

      return res.status(200).json({ data: products, total, page: pageNum, limit: limitNum });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, price, stock, category, description, image } = req.body;
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const sku = `SKU-${Date.now()}`;
      const product = await prisma.product.create({
        data: { name, slug, sku, price: parseFloat(price), stock: parseInt(stock), category, description, image }
      });
      return res.status(201).json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, name, price, stock, category, description, image } = req.body;
      const product = await prisma.product.update({
        where: { id },
        data: { name, price: parseFloat(price), stock: parseInt(stock), category, description, image }
      });
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await prisma.product.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
