import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { orderNumber, email, reason, notes } = req.body;

  if (!orderNumber || !email) {
    return res.status(400).json({ success: false, message: 'Order number and email address are required.' });
  }

  const rawOrderNum = String(orderNumber).trim();
  const cleanOrderNum = rawOrderNum.replace(/^#/, '');
  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: cleanOrderNum, mode: 'insensitive' } },
          { orderNumber: { equals: rawOrderNum, mode: 'insensitive' } },
          { orderNumber: { equals: '#' + cleanOrderNum, mode: 'insensitive' } },
          { id: cleanOrderNum },
          { id: rawOrderNum },
        ],
        email: { equals: cleanEmail, mode: 'insensitive' },
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No matching order found for this Order Number and Email address. Please verify your order details.',
      });
    }

    // Check if return request already exists
    const existing = await prisma.returnRequest.findFirst({
      where: { orderId: order.id },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        alreadySubmitted: true,
        message: 'A return request for this order is already being processed.',
        returnId: existing.id,
        trackingCode: existing.trackingCode,
        orderNumber: order.orderNumber,
        status: existing.status,
      });
    }

    // Resolve or create user ID to satisfy foreign key requirement
    let targetUserId = order.userId;
    if (!targetUserId) {
      let existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: `${order.firstName || 'Customer'} ${order.lastName || ''}`.trim() || cleanEmail.split('@')[0],
            role: 'user',
          },
        });
      }
      targetUserId = existingUser.id;
    }

    const trackingCode = `RET-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create real return request in PostgreSQL with items
    const returnReq = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: targetUserId,
        orderNumber: order.orderNumber,
        status: 'PENDING',
        reason: reason || 'Customer Return Request via Online Portal',
        resolution: 'REFUND',
        customerNote: notes || 'Submitted through online Returns & Exchanges portal.',
        refundAmount: order.total,
        trackingCode: trackingCode,
        items: {
          create: order.items.map((it) => ({
            orderItemId: it.id,
            quantity: it.quantity,
            condition: 'NEW',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create Admin notification
    await prisma.notification.create({
      data: {
        type: 'RETURN_REQUEST',
        title: `New Return Request #${order.orderNumber}`,
        message: `Return submitted for Order #${order.orderNumber} (Amount: ₹${order.total}). Status: PENDING`,
        link: '/admin/orders',
        icon: 'RotateCcw',
      },
    }).catch(() => null);

    return res.status(201).json({
      success: true,
      message: 'Return request verified and created successfully!',
      returnId: returnReq.id,
      trackingCode: returnReq.trackingCode,
      orderNumber: order.orderNumber,
      refundAmount: order.total,
      itemCount: order.items.length,
    });
  } catch (error: any) {
    console.error('Return request creation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process return request. Please try again.' });
  }
}
