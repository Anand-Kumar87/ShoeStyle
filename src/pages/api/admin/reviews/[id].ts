import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { deleteFromStorage } from '@/lib/storage';

async function updateProductRatingStats(productId: string) {
  const approvedReviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    select: { rating: true },
  });

  const totalReviews = approvedReviews.length;
  const averageRating = totalReviews > 0
    ? Number((approvedReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
    : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: averageRating,
      reviewCount: totalReviews,
    },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid review ID' });
  }

  // ==========================================
  // PUT: Update Review Status (Approve / Hide)
  // ==========================================
  if (req.method === 'PUT') {
    try {
      const { isApproved } = req.body;

      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ message: 'isApproved boolean is required.' });
      }

      const existing = await prisma.review.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Review not found.' });
      }

      const updated = await prisma.review.update({
        where: { id },
        data: { isApproved },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          product: { select: { id: true, name: true, image: true, slug: true } },
        },
      });

      // Recalculate product rating
      await updateProductRatingStats(existing.productId);

      return res.status(200).json(updated);
    } catch (error: any) {
      console.error('Error updating review status:', error);
      return res.status(500).json({ message: 'Failed to update review status' });
    }
  }

  // ==========================================
  // DELETE: Delete Review permanently
  // ==========================================
  if (req.method === 'DELETE') {
    try {
      const existing = await prisma.review.findUnique({
        where: { id },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Review not found.' });
      }

      // Cleanup review images from Supabase Storage if any
      if (Array.isArray(existing.images) && existing.images.length > 0) {
        for (const imgUrl of existing.images) {
          try {
            await deleteFromStorage(imgUrl);
          } catch (storageErr) {
            console.warn('Storage cleanup warning:', storageErr);
          }
        }
      }

      await prisma.review.delete({
        where: { id },
      });

      // Recalculate product rating
      await updateProductRatingStats(existing.productId);

      return res.status(200).json({ message: 'Review deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting review:', error);
      return res.status(500).json({ message: 'Failed to delete review' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
