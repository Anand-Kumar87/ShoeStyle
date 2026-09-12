import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const queryNumber = req.method === 'GET' 
    ? (req.query.number as string) 
    : req.body.number || req.body.orderNumber || req.body.trackingNumber;

  if (!queryNumber || typeof queryNumber !== 'string' || !queryNumber.trim()) {
    return res.status(400).json({ message: 'Please provide a valid Order ID or Tracking Number' });
  }

  const rawQuery = queryNumber.trim();
  const cleanQuery = rawQuery.replace(/^#/, '');

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: cleanQuery, mode: 'insensitive' } },
          { orderNumber: { equals: rawQuery, mode: 'insensitive' } },
          { orderNumber: { equals: '#' + cleanQuery, mode: 'insensitive' } },
          { id: { equals: rawQuery } },
          { trackingNumber: { equals: cleanQuery, mode: 'insensitive' } },
          { trackingNumber: { equals: rawQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
            image: true,
            size: true,
            color: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found with tracking reference: "${queryNumber.trim()}". Please check your Order ID.`,
      });
    }

    const createdAt = new Date(order.createdAt);
    const estDeliveryDate = new Date(createdAt);
    estDeliveryDate.setDate(estDeliveryDate.getDate() + (order.country === 'IN' ? 4 : 7));

    const estDeliveryFormatted = estDeliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const isConfirmed = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status.toUpperCase());
    const isShipped = ['SHIPPED', 'DELIVERED'].includes(order.status.toUpperCase());
    const isDelivered = order.status.toUpperCase() === 'DELIVERED';

    const steps = [
      {
        title: 'Order Placed',
        desc: `Order received with ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}`,
        time: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        done: true,
      },
      {
        title: 'Order Confirmed & Processed',
        desc: isConfirmed ? 'Verified & packed at fulfillment center' : 'Processing order details',
        time: isConfirmed ? 'Verified' : 'Pending',
        done: isConfirmed,
      },
      {
        title: 'In Transit with Courier',
        desc: isShipped 
          ? `Dispatched via ${order.carrier || 'Express Logistics'} (AWB: ${order.trackingNumber || order.orderNumber})` 
          : 'Awaiting courier dispatch',
        time: isShipped ? (order.shippedAt ? new Date(order.shippedAt).toLocaleDateString() : 'In Transit') : 'Pending',
        done: isShipped,
      },
      {
        title: 'Delivered',
        desc: isDelivered 
          ? `Delivered to ${order.city || 'destination'}, ${order.state || ''}` 
          : `Expected by ${estDeliveryFormatted}`,
        time: isDelivered ? (order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Delivered') : 'Pending',
        done: isDelivered,
      },
    ];

    return res.status(200).json({
      success: true,
      orderNumber: order.orderNumber,
      status: order.status,
      carrier: order.carrier || 'Delhivery / Blue Dart Standard',
      trackingNumber: order.trackingNumber || order.orderNumber,
      estimatedDelivery: estDeliveryFormatted,
      location: `${order.city || 'Regional Center'}, ${order.state || order.country || 'India'}`,
      destination: `${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}, ${order.country || ''}`.trim(),
      total: order.total,
      items: order.items,
      steps,
    });
  } catch (error: any) {
    console.error('Order tracking API error:', error);
    return res.status(500).json({ success: false, message: 'Failed to look up order tracking.' });
  }
}
