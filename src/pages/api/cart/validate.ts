import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ validItems: [], removedCount: 0 });
    }

    const productIds = items
      .map((item: any) => item.productId || item.id)
      .filter((id): id is string => typeof id === 'string' && Boolean(id));

    if (productIds.length === 0) {
      return res.status(200).json({ validItems: [], removedCount: items.length });
    }

    const activeProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        isSale: true,
        salePrice: true,
        image: true,
        images: true,
        stock: true,
      },
    });

    const productMap = new Map(activeProducts.map((p) => [p.id, p]));

    const validItems = items
      .filter((item: any) => productMap.has(item.productId || item.id))
      .map((item: any) => {
        const prod = productMap.get(item.productId || item.id)!;
        const livePrice =
          prod.isSale && prod.salePrice && prod.price > prod.salePrice
            ? prod.salePrice
            : prod.price;

        return {
          ...item,
          name: prod.name,
          price: livePrice,
          image: prod.image || prod.images?.[0] || item.image,
          quantity: Math.min(item.quantity || 1, prod.stock > 0 ? prod.stock : 1),
        };
      });

    const removedCount = items.length - validItems.length;

    return res.status(200).json({
      validItems,
      removedCount,
    });
  } catch (error: any) {
    console.error('Cart validate error:', error);
    return res.status(500).json({ error: 'Failed to validate cart' });
  }
}
