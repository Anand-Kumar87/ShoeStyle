import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]'; // Path confirm kar lena
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    // =================================================================
    // 1. POST: CREATE ORDER & AUTOMATIC STOCK DEDUCTION
    // =================================================================
    if (req.method === 'POST') {
      if (!session) {
        return res.status(401).json({ message: 'Please login to place an order.' });
      }

      const { items, shippingAddress, subtotal, shipping, tax, discount, couponCode, total, paymentStatus, status } = req.body;

      // Order Create in Database
      const newOrder = await prisma.order.create({
        data: {
          userId: session.user.id,
          shippingAddress,
          subtotal,
          shipping,
          tax,
          discount,
          couponCode,
          total,
          paymentStatus: paymentStatus || 'PENDING',
          status: status || 'PENDING',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size || '',
              color: item.color || '',
              image: item.image,
            })),
          },
        },
      });

      // 🔥 PREMIUM FIX: AUTOMATIC STOCK DEDUCTION 🔥
      // Jaise hi order success hua, sabhi items ka stock unki quantity ke hisaab se minus kar do
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity // Stock automatically reduce ho jayega
            }
          }
        });
      }

      return res.status(201).json(newOrder);
    }

    // =================================================================
    // SECURITY GATE: BAQI METHODS KE LIYE LOGIN ZAROORI HAI
    // =================================================================
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized access.' });
    }

    // =================================================================
    // 2. GET: FETCH ORDERS (Admin gets all, Customer gets own)
    // =================================================================
    if (req.method === 'GET') {
      if (session.user.role === 'admin') {
        // ADMIN PANEL: Show all orders
        const allOrders = await prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        });
        return res.status(200).json(allOrders);
      } else {
        // CUSTOMER ACCOUNT: Show only their own orders
        const userOrders = await prisma.order.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        });
        return res.status(200).json(userOrders);
      }
    }

    // =================================================================
    // 3. PUT: UPDATE ORDER STATUS (Strictly ADMIN Only)
    // =================================================================
    if (req.method === 'PUT') {
      if (session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden. Admins only.' });
      }

      const { id, status, paymentStatus } = req.body;

      if (!id) return res.status(400).json({ message: 'Order ID is required' });

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

      const updatedOrder = await prisma.order.update({
        where: { id: id },
        data: updateData,
      });

      return res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Orders API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
