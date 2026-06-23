import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Authentication Check (Optional: You can restrict this to Admin only)
  const session = await getServerSession(req, res, authOptions);

  // GET Route: Fetch all products for the Admin List
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // POST Route: Create a new product from the Admin Form
  if (req.method === 'POST') {
    // Basic Security Check
    if (!session || session.user.role !== 'admin') {
      // NOTE: Ensure your session user has a role property. 
      // If not, you can remove `|| session.user.role !== 'admin'` for testing.
      return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
    }

    try {
      const {
        name, slug, description, price, compareAtPrice,
        isSale, salePrice, // 🔥 NEW: Added Sale Fields
        stock, sku, category, brand, image, images,
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

      return res.status(201).json(newProduct);
    } catch (error: any) {
      console.error('Error creating product:', error);
      return res.status(500).json({ message: error.message || 'Failed to create product' });
    }
  }

  // Handle other methods
  return res.status(405).json({ message: 'Method not allowed' });
}