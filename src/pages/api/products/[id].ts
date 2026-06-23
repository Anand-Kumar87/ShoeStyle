import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]'; // Ensure this path matches your auth file

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    // ==========================================
    // GET: Fetch a single product (For Edit Form)
    // ==========================================
    if (req.method === 'GET') {
        try {
            const product = await prisma.product.findUnique({
                where: { id }
            });

            if (!product) return res.status(404).json({ message: 'Product not found in database' });
            return res.status(200).json(product);
        } catch (error: any) {
            console.error('API GET Error:', error.message);
            return res.status(500).json({ message: 'Failed to fetch product' });
        }
    }

    // ==========================================
    // AUTHENTICATION CHECK (For PUT & DELETE)
    // ==========================================
    let session;
    try {
        session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ message: 'Unauthorized. Please log in.' });
        }
    } catch (error: any) {
        console.error('Session Error:', error.message);
        // If auth fails completely, we throw 500 to let you know authOptions path might be wrong
        return res.status(500).json({ message: 'Authentication configuration error' });
    }

    // ==========================================
    // PUT: Update Product
    // ==========================================
    if (req.method === 'PUT') {
        try {
            const {
                name, slug, description, price, compareAtPrice,
                isSale, salePrice, // 🔥 NEW: Added Sale Fields
                stock, sku, category, brand, image, images,
                sizes, colors, isActive, isFeatured, isNew
            } = req.body;

            const updatedProduct = await prisma.product.update({
                where: { id },
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

            return res.status(200).json(updatedProduct);
        } catch (error: any) {
            console.error('API PUT Error:', error);
            if (error.code === 'P2002') {
                return res.status(400).json({ message: 'A product with this slug already exists.' });
            }
            return res.status(500).json({ message: 'Failed to update product' });
        }
    }

    // ==========================================
    // DELETE: Remove Product
    // ==========================================
    if (req.method === 'DELETE') {
        try {
            await prisma.product.delete({
                where: { id }
            });
            return res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error: any) {
            console.error('API DELETE Error:', error.message);
            return res.status(500).json({ message: 'Failed to delete product' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}