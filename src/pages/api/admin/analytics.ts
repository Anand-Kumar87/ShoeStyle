import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  // 🔥 Z+ SECURITY: Case-Insensitive Admin Check
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }

  if (req.method === 'GET') {
    try {
      // 1. Core aggregates (optimized)
      const [totalUsers, totalProducts, allOrders, orderItems] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.findMany({
          select: {
            id: true,
            total: true,
            status: true,
            paymentStatus: true,
            paymentMethod: true,
            country: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.orderItem.findMany({
          select: {
            productId: true,
            name: true,
            image: true,
            quantity: true,
            price: true,
          },
        }),
      ]);

      const rev = allOrders.reduce((acc, o) => acc + (o.total || 0), 0);
      const totalOrders = allOrders.length;
      const avgOrderValue = totalOrders > 0 ? rev / totalOrders : 0;
      const totalUnitsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);

      // 2. Order Status Funnel
      const statusCounts: Record<string, { count: number; revenue: number }> = {
        PENDING: { count: 0, revenue: 0 },
        CONFIRMED: { count: 0, revenue: 0 },
        PROCESSING: { count: 0, revenue: 0 },
        SHIPPED: { count: 0, revenue: 0 },
        DELIVERED: { count: 0, revenue: 0 },
        CANCELLED: { count: 0, revenue: 0 },
      };

      // 3. Geographic Breakdown
      let domesticCount = 0;
      let domesticRevenue = 0;
      let internationalCount = 0;
      let internationalRevenue = 0;

      // 4. Payment Method Breakdown
      const paymentMethods: Record<string, number> = {};

      allOrders.forEach(o => {
        // Status counts
        const st = (o.status || 'PENDING').toUpperCase();
        if (statusCounts[st]) {
          statusCounts[st].count += 1;
          statusCounts[st].revenue += o.total;
        } else {
          statusCounts[st] = { count: 1, revenue: o.total };
        }

        // 🇮🇳 Geo breakdown: Robust domestic detection (IN, India, INDIA (IN), etc.)
        const rawCountry = (o.country || 'IN').toUpperCase().trim();
        const isDomestic =
          rawCountry === 'IN' ||
          rawCountry === 'IND' ||
          rawCountry.includes('INDIA') ||
          rawCountry.includes('(IN)') ||
          rawCountry.startsWith('IN ');

        if (isDomestic) {
          domesticCount += 1;
          domesticRevenue += o.total;
        } else {
          internationalCount += 1;
          internationalRevenue += o.total;
        }

        // Payment Method
        const pm = o.paymentMethod || 'Online Payment';
        paymentMethods[pm] = (paymentMethods[pm] || 0) + 1;
      });

      // 5. Revenue Trend (Past 7 Days)
      const days = 7;
      const timeline: { date: string; label: string; revenue: number; orders: number }[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

        const dayOrders = allOrders.filter(o => o.createdAt.toISOString().slice(0, 10) === dateKey);
        const dayRev = dayOrders.reduce((sum, o) => sum + o.total, 0);

        timeline.push({
          date: dateKey,
          label: dayLabel,
          revenue: dayRev,
          orders: dayOrders.length,
        });
      }

      // 6. Top Selling Products Leaderboard
      const productSalesMap = new Map<string, { name: string; image: string; unitsSold: number; totalRevenue: number }>();

      orderItems.forEach(item => {
        const key = item.productId || item.name;
        const existing = productSalesMap.get(key);
        if (existing) {
          existing.unitsSold += item.quantity;
          existing.totalRevenue += item.price * item.quantity;
          if (!existing.image && item.image) existing.image = item.image;
        } else {
          productSalesMap.set(key, {
            name: item.name,
            image: item.image || '',
            unitsSold: item.quantity,
            totalRevenue: item.price * item.quantity,
          });
        }
      });

      const topProducts = Array.from(productSalesMap.values())
        .sort((a, b) => b.unitsSold - a.unitsSold)
        .slice(0, 5);

      res.setHeader('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
      return res.status(200).json({
        revenue: rev,
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts,
        avgOrderValue,
        totalUnitsSold,
        statusCounts,
        timeline,
        topProducts,
        geo: {
          domestic: { count: domesticCount, revenue: domesticRevenue },
          international: { count: internationalCount, revenue: internationalRevenue },
        },
        paymentMethods,
      });
    } catch (error) {
      console.error('Analytics API Error:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}