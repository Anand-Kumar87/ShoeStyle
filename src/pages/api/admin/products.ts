import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);

    console.log('=== ADMIN PRODUCTS API ===');
    console.log('Session:', session);
    console.log('User:', session?.user);
    console.log('Role:', session?.user?.role);

    // Check authentication
    if (!session || !session.user) {
      console.log('❌ No session found');
      return res.status(401).json({ 
        message: 'Not authenticated',
        error: 'No session' 
      });
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      console.log('❌ User is not admin. Role:', session.user.role);
      return res.status(403).json({ 
        message: 'Access denied',
        error: 'Not admin',
        yourRole: session.user.role,
        requiredRole: 'admin'
      });
    }

    console.log('✅ Admin access granted');

    // GET - List all products
    if (req.method === 'GET') {
      const { search, category, limit = '50' } = req.query;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { sku: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (category && category !== 'all') {
        where.category = category;
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
      });

      const total = await prisma.product.count({ where });

      return res.status(200).json({ products, total });
    }

    // POST - Create new product
    if (req.method === 'POST') {
      console.log('📦 Creating product');

      const productData = req.body;

      // Validation
      if (!productData.name || !productData.price || !productData.image) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          error: 'Name, price, and image are required' 
        });
      }

      // Generate SKU if not provided
      if (!productData.sku) {
        productData.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Generate slug from name if not provided
      if (!productData.slug) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Clean data
      const cleanData = {
        name: productData.name,
        slug: productData.slug,
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        compareAtPrice: productData.compareAtPrice ? parseFloat(productData.compareAtPrice) : null,
        image: productData.image,
        images: Array.isArray(productData.images) ? productData.images : [],
        category: productData.category || 'Sneakers',
        brand: productData.brand || null,
        colors: Array.isArray(productData.colors) ? productData.colors : [],
        sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
        stock: parseInt(productData.stock) || 0,
        sku: productData.sku,
        isNew: Boolean(productData.isNew),
        isFeatured: Boolean(productData.isFeatured),
        isActive: productData.isActive !== false,
        rating: 0,
        reviewCount: 0,
        tags: [],
      };

      console.log('Creating with data:', cleanData);

      // Check for duplicate SKU
      const existingSku = await prisma.product.findUnique({
        where: { sku: cleanData.sku },
      });

      if (existingSku) {
        cleanData.sku = `${cleanData.sku}-${Math.random().toString(36).substr(2, 6)}`;
      }

      // Check for duplicate slug
      const existingSlug = await prisma.product.findUnique({
        where: { slug: cleanData.slug },
      });

      if (existingSlug) {
        cleanData.slug = `${cleanData.slug}-${Math.random().toString(36).substr(2, 6)}`;
      }

      const product = await prisma.product.create({
        data: cleanData,
      });

      console.log('✅ Product created:', product.id);
      return res.status(201).json(product);
    }

    // PUT - Update product
    if (req.method === 'PUT') {
      const { id, ...data } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Product ID required' });
      }

      const cleanData: any = {};
      
      if (data.name) cleanData.name = data.name;
      if (data.description !== undefined) cleanData.description = data.description;
      if (data.price !== undefined) cleanData.price = parseFloat(data.price);
      if (data.compareAtPrice !== undefined) cleanData.compareAtPrice = data.compareAtPrice ? parseFloat(data.compareAtPrice) : null;
      if (data.image) cleanData.image = data.image;
      if (data.images) cleanData.images = data.images;
      if (data.category) cleanData.category = data.category;
      if (data.brand !== undefined) cleanData.brand = data.brand || null;
      if (data.colors) cleanData.colors = data.colors;
      if (data.sizes) cleanData.sizes = data.sizes;
      if (data.stock !== undefined) cleanData.stock = parseInt(data.stock);
      if (data.isNew !== undefined) cleanData.isNew = Boolean(data.isNew);
      if (data.isFeatured !== undefined) cleanData.isFeatured = Boolean(data.isFeatured);
      if (data.isActive !== undefined) cleanData.isActive = Boolean(data.isActive);

      const product = await prisma.product.update({
        where: { id },
        data: cleanData,
      });

      console.log('✅ Product updated');
      return res.status(200).json(product);
    }

    // DELETE
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Product ID required' });
      }

      await prisma.product.delete({
        where: { id },
      });

      console.log('✅ Product deleted');
      return res.status(200).json({ message: 'Product deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('❌ Admin products API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
}