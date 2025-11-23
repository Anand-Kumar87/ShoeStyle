import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET products
  if (req.method === 'GET') {
    try {
      const {
        category,
        brand,
        minPrice,
        maxPrice,
        search,
        sortBy = 'newest',
        colors,
        sizes,
        isNew,
        isFeatured,
        limit = '20',
        offset = '0',
      } = req.query;

      // Build where clause
      const where: any = { isActive: true };

      if (category && category !== 'all') {
        where.category = category;
      }

      if (brand) {
        where.brand = brand;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }

      if (colors && typeof colors === 'string' && colors !== '') {
        where.colors = { hasSome: colors.split(',') };
      }

      if (sizes && typeof sizes === 'string' && sizes !== '') {
        where.sizes = { hasSome: sizes.split(',') };
      }

      if (isNew === 'true') {
        where.isNew = true;
      }

      if (isFeatured === 'true') {
        where.isFeatured = true;
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Build orderBy
      let orderBy: any = { createdAt: 'desc' };

      if (sortBy === 'price-asc') orderBy = { price: 'asc' };
      else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
      else if (sortBy === 'popular') orderBy = { reviewCount: 'desc' };
      else if (sortBy === 'rating') orderBy = { rating: 'desc' };
      else if (sortBy === 'name') orderBy = { name: 'asc' };

      // Fetch products
      const products = await prisma.product.findMany({
        where,
        orderBy,
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
      });

      const total = await prisma.product.count({ where });

      return res.status(200).json({
        products,
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        error: 'Failed to fetch products',
        message: error.message,
      });
    }
  }

  // POST - Create product
  if (req.method === 'POST') {
    try {
      const product = await prisma.product.create({
        data: req.body,
      });
      return res.status(201).json(product);
    } catch (error: any) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        error: 'Failed to create product',
        message: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}