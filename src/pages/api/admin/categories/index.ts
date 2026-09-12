import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // 1. GET - Fetch categories
  if (req.method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
          parent: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return res.status(200).json(categories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ message: 'Failed to fetch categories' });
    }
  }

  // 2. POST - Create new category (Admin Only)
  if (req.method === 'POST') {
    const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';
    if (!session || !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
    }

    try {
      let { name, slug, description, image, isActive = true, parentId = null, productIds } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      name = name.trim();

      // Generate slug if not provided
      if (!slug || typeof slug !== 'string' || !slug.trim()) {
        slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      } else {
        slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      }

      // Check unique slug
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        return res.status(400).json({ message: `A category with slug "${slug}" already exists.` });
      }

      const newCategory = await prisma.category.create({
        data: {
          name,
          slug,
          description: description || null,
          image: image || null,
          isActive: Boolean(isActive),
          parentId: parentId || null,
        },
      });

      // Link selected products to this new category
      if (Array.isArray(productIds) && productIds.length > 0) {
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: {
            categoryId: newCategory.id,
          },
        });
      }

      return res.status(201).json(newCategory);
    } catch (error: any) {
      console.error('Error creating category:', error);
      return res.status(500).json({ message: error.message || 'Failed to create category' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
