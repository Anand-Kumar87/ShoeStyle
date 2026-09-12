import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateReviewContent } from '@/lib/reviewModeration';
import { uploadBase64ToStorage } from '@/lib/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Allows high quality customer photo/video uploads
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ==========================================
  // 1. GET - Fetch reviews & breakdown for a product
  // ==========================================
  if (req.method === 'GET') {
    try {
      const { productId } = req.query;

      if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      const reviews = await prisma.review.findMany({
        where: {
          productId,
          isApproved: true,
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Compute rating distribution breakdown
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRatingSum = 0;

      reviews.forEach(r => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
        breakdown[star] = (breakdown[star] || 0) + 1;
        totalRatingSum += r.rating;
      });

      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

      return res.status(200).json({
        reviews,
        stats: {
          totalReviews,
          averageRating,
          breakdown,
        },
      });
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  }

  // ==========================================
  // 2. POST - Submit a new review
  // ==========================================
  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ message: 'You must be logged in to review.' });
      }

      const { productId, rating, comment, media = [], title } = req.body;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required.' });
      }

      // 🔥 Content Quality & Moderation Check (Gibberish, Profanity, Minimum 20 Chars)
      const moderation = validateReviewContent(comment, Number(rating));
      if (!moderation.isValid) {
        return res.status(400).json({ message: moderation.error || 'Invalid review content' });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has a verified purchase for this product
      const purchasedOrderItem = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: {
            userId: user.id,
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
        },
      });
      const isVerified = !!purchasedOrderItem;

      // 🔥 UPLOAD MEDIA DIRECTLY TO SUPABASE STORAGE BUCKET 'Image'
      // This avoids saving huge base64 payloads into PostgreSQL database
      const uploadedMediaUrls: string[] = [];
      if (Array.isArray(media) && media.length > 0) {
        for (let i = 0; i < media.length; i++) {
          const item = media[i];
          if (!item) continue;

          if (item.startsWith('http://') || item.startsWith('https://')) {
            uploadedMediaUrls.push(item);
          } else if (item.startsWith('data:')) {
            try {
              const ext = item.startsWith('data:video') ? 'mp4' : 'jpg';
              const publicUrl = await uploadBase64ToStorage(
                item,
                `review-${user.id.slice(0, 6)}-${i}.${ext}`,
                'reviews'
              );
              uploadedMediaUrls.push(publicUrl);
            } catch (err) {
              console.error('Failed to upload review media to Supabase:', err);
              // Fallback to storing or skipping if upload fails
            }
          }
        }
      }

      // Create review in database with isApproved: true
      const newReview = await prisma.review.create({
        data: {
          rating: Number(rating),
          title: title?.trim() || null,
          comment: comment.trim(),
          images: uploadedMediaUrls,
          isVerifiedPurchase: isVerified,
          isApproved: true,
          productId,
          userId: user.id,
        },
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
      });

      // Update product's aggregate rating & review count
      const allApprovedReviews = await prisma.review.findMany({
        where: { productId, isApproved: true },
      });

      const totalReviews = allApprovedReviews.length;
      const averageRating = totalReviews > 0
        ? Number((allApprovedReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
        : 0;

      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: averageRating,
          reviewCount: totalReviews,
        },
      });

      return res.status(201).json(newReview);
    } catch (error: any) {
      console.error('Review submission error:', error);
      return res.status(500).json({ message: 'Internal server error while saving review' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}