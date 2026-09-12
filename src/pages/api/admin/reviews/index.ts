import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  // ==========================================
  // GET: Fetch all reviews with filters & stats
  // ==========================================
  if (req.method === 'GET') {
    try {
      const { status, rating, search, page = '1', limit = '20' } = req.query;

      const whereClause: any = {};

      // Status filter
      if (status === 'APPROVED') {
        whereClause.isApproved = true;
      } else if (status === 'PENDING') {
        whereClause.isApproved = false;
      }

      // Rating filter
      if (rating && rating !== 'ALL') {
        whereClause.rating = Number(rating);
      }

      // Search filter
      if (search && typeof search === 'string' && search.trim() !== '') {
        const query = search.trim();
        whereClause.OR = [
          { comment: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { product: { name: { contains: query, mode: 'insensitive' } } },
        ];
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [reviews, totalCount, allReviewsSummary] = await Promise.all([
        prisma.review.findMany({
          where: whereClause,
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
            product: { select: { id: true, name: true, image: true, slug: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.review.count({ where: whereClause }),
        prisma.review.findMany({
          select: { rating: true, isApproved: true },
        }),
      ]);

      // Calculate global stats
      const totalAll = allReviewsSummary.length;
      const approvedCount = allReviewsSummary.filter(r => r.isApproved).length;
      const pendingCount = totalAll - approvedCount;
      const avgRating = totalAll > 0
        ? Number((allReviewsSummary.reduce((acc, curr) => acc + curr.rating, 0) / totalAll).toFixed(1))
        : 0;

      return res.status(200).json({
        reviews,
        pagination: {
          totalCount,
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          limit: limitNum,
        },
        stats: {
          totalReviews: totalAll,
          approvedCount,
          pendingCount,
          avgRating,
        },
      });
    } catch (error: any) {
      console.error('Error fetching admin reviews:', error);
      return res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
