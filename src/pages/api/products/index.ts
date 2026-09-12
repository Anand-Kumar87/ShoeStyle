import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getCachedProducts, setCachedProducts, invalidateProductCache } from '@/lib/productCache';
import { reportServerError } from '@/lib/telemetry';

// 🔥 YEH BLOCK CONNECTION RESET ERROR KO ROKEGA (Size limit 50MB kar di gayi hai)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authentication Check
  const session = await getServerSession(req, res, authOptions);

  // GET Route: Fetch products for Storefront / Admin listings
  if (req.method === 'GET') {
    try {
      // High Concurrency Caching Headers (Edge/CDN + Browser)
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');

      // Ultra-fast in-memory cache check (<1ms)
      const cached = getCachedProducts();
      if (cached) {
        return res.status(200).json(cached);
      }

      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          sku: true,
          category: true,
          price: true,
          compareAtPrice: true,
          isSale: true,
          salePrice: true,
          image: true,
          colors: true,
          sizes: true,
          stock: true,
          isNew: true,
          isFeatured: true,
          isActive: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Save to memory cache
      setCachedProducts(products);
      return res.status(200).json(products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      reportServerError(error, req);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // POST Route: Create a new product from the Admin Form
  if (req.method === 'POST') {
    // 🔥 Z+ SECURITY: Case-Insensitive Admin Check
    const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';
    if (!session || !isAdmin) {
      return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
    }

    try {
      const {
        name, slug, description, price, compareAtPrice,
        isSale, salePrice, // 🔥 NEW: Added Sale Fields
        stock, sku, category, categoryId, categoryIds, brand, image, images,
        sizes, colors, isActive, isFeatured, isNew
      } = req.body;

      // Basic Validation
      if (!name || !slug || !price || !image) {
        return res.status(400).json({ message: 'Missing required fields (Name, Price, Image)' });
      }

      // Ensure slug is unique
      const existingProduct = await prisma.product.findUnique({ where: { slug } });
      if (existingProduct) {
        return res.status(400).json({ message: 'A product with this name/slug already exists.' });
      }

      const finalCategoryId = (Array.isArray(categoryIds) && categoryIds.length > 0) ? categoryIds[0] : (categoryId || null);

      // Create in Database
      const newProduct = await prisma.product.create({
        data: {
          name,
          slug,
          description: description || '',
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,

          // 🔥 NEW: Sale Logic Integration
          isSale: Boolean(isSale),
          salePrice: isSale && salePrice ? parseFloat(salePrice) : null,

          stock: parseInt(stock) || 0,
          sku: sku || null,
          category: category || 'sneakers',
          categoryId: finalCategoryId,
          brand: brand || null,
          image,
          images: Array.isArray(images) ? images : [],
          sizes: Array.isArray(sizes) ? sizes : [],
          colors: Array.isArray(colors) ? colors : [],
          isActive: Boolean(isActive),
          isFeatured: Boolean(isFeatured),
          isNew: Boolean(isNew),
        }
      });

      // Invalidate product cache so store reflects new item instantly
      invalidateProductCache();

      return res.status(201).json(newProduct);
    } catch (error: any) {
      console.error('Error creating product:', error);
      reportServerError(error, req);
      return res.status(500).json({ message: error.message || 'Failed to create product' });
    }
  }

  // Handle other methods
  return res.status(405).json({ message: 'Method not allowed' });
}