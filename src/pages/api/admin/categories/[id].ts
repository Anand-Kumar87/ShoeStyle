import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  // 1. GET Single Category
  if (req.method === 'GET') {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: { select: { products: true } },
          parent: true,
          children: true,
        },
      });

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      return res.status(200).json(category);
    } catch (error: any) {
      console.error('Error fetching category:', error);
      return res.status(500).json({ message: 'Failed to fetch category' });
    }
  }

  // 2. PUT - Update Category
  if (req.method === 'PUT') {
    try {
      const { name, slug, description, image, isActive, parentId, productIds } = req.body;

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check if new slug conflicts with another category
      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.category.findUnique({ where: { slug } });
        if (slugExists && slugExists.id !== id) {
          return res.status(400).json({ message: `A category with slug "${slug}" already exists.` });
        }
      }

      // Prevent parent loop
      if (parentId && parentId === id) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }

      const updated = await prisma.category.update({
        where: { id },
        data: {
          name: name !== undefined ? name.trim() : existing.name,
          slug: slug !== undefined ? slug.trim().toLowerCase() : existing.slug,
          description: description !== undefined ? description : existing.description,
          image: image !== undefined ? image : existing.image,
          isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
          parentId: parentId !== undefined ? parentId : existing.parentId,
        },
      });

      // Synchronize product associations if productIds is provided
      if (Array.isArray(productIds)) {
        // 1. Unlink products previously belonging to this category that were unselected
        await prisma.product.updateMany({
          where: {
            categoryId: id,
            id: { notIn: productIds },
          },
          data: {
            categoryId: null,
          },
        });

        // 2. Link all selected products to this category
        if (productIds.length > 0) {
          await prisma.product.updateMany({
            where: {
              id: { in: productIds },
            },
            data: {
              categoryId: id,
            },
          });
        }
      }

      return res.status(200).json(updated);
    } catch (error: any) {
      console.error('Error updating category:', error);
      return res.status(500).json({ message: error.message || 'Failed to update category' });
    }
  }

  // 3. DELETE - Delete Category safely
  if (req.method === 'DELETE') {
    try {
      const existing = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Unlink products safely before deleting category
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });

      // Unlink children categories
      await prisma.category.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });

      await prisma.category.delete({ where: { id } });

      return res.status(200).json({
        message: `Category "${existing.name}" deleted successfully. Any linked products were safely unlinked.`,
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ message: error.message || 'Failed to delete category' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
