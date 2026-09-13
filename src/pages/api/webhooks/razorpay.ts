import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// 🛡️ Disable Next.js body parser to preserve raw payload for cryptographic HMAC-SHA256 verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to stream raw body into UTF-8 buffer string
async function getRawBody(readable: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['x-razorpay-signature'] as string;

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.error('[RAZORPAY WEBHOOK ERROR] RAZORPAY_WEBHOOK_SECRET and RAZORPAY_KEY_SECRET are not configured');
      return res.status(500).json({ error: 'Webhook secret is not configured' });
    }

    if (!signature) {
      console.warn('[RAZORPAY WEBHOOK WARNING] Missing x-razorpay-signature header');
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    // 🛡️ Verify Cryptographic Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[RAZORPAY WEBHOOK SECURITY] Signature verification failed');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Parse verified JSON event
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`[RAZORPAY WEBHOOK RECEIVED] Event: ${eventType} at ${new Date().toISOString()}`);

    // 🔥 HANDLE: order.paid or payment.captured (Instant Payment Success)
    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const razorpayOrderId =
        event.payload?.order?.entity?.id ||
        event.payload?.payment?.entity?.order_id ||
        null;
      const razorpayPaymentId =
        event.payload?.payment?.entity?.id ||
        null;

      if (!razorpayOrderId) {
        console.warn('[RAZORPAY WEBHOOK] Event did not contain a valid order_id', event);
        return res.status(200).json({ status: 'ignored', reason: 'no order_id' });
      }

      // Find order in database by paymentIntentId OR orderNumber
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { paymentIntentId: razorpayOrderId },
            { orderNumber: razorpayOrderId },
          ],
        },
      });

      if (!order) {
        console.warn(`[RAZORPAY WEBHOOK] No matching database order found for Razorpay Order ID: ${razorpayOrderId}`);
        return res.status(200).json({ status: 'unmatched', razorpayOrderId });
      }

      // ⚡ Idempotency Guard: If already confirmed, don't duplicate processing
      if (order.paymentStatus === 'PAID') {
        console.log(`[RAZORPAY WEBHOOK] Order ${order.id} was already marked PAID. Idempotent return.`);
        return res.status(200).json({ status: 'ok', message: 'Order already completed', orderId: order.id });
      }

      // Update Order to PAID & CONFIRMED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paymentIntentId: razorpayPaymentId || order.paymentIntentId,
        },
      });

      // Increment Coupon usage if one was applied
      if (order.couponCode) {
        try {
          await prisma.coupon.updateMany({
            where: { code: { equals: order.couponCode, mode: 'insensitive' } },
            data: { usageCount: { increment: 1 } },
          });
        } catch (e) {
          console.error('[RAZORPAY WEBHOOK] Failed to increment coupon usageCount:', e);
        }
      }

      console.log(`[RAZORPAY WEBHOOK SUCCESS] Order ${order.id} (${order.orderNumber}) confirmed as PAID via server webhook!`);
      return res.status(200).json({ status: 'ok', message: 'Order successfully updated to PAID', orderId: order.id });
    }

    // 🔥 HANDLE: payment.failed
    if (eventType === 'payment.failed') {
      const razorpayOrderId = event.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { paymentIntentId: razorpayOrderId, paymentStatus: 'PENDING' },
          data: { paymentStatus: 'FAILED' },
        });
      }
      return res.status(200).json({ status: 'ok', event: 'payment.failed handled' });
    }

    // Acknowledge any other events safely
    return res.status(200).json({ status: 'ok', message: `Event ${eventType} acknowledged` });
  } catch (error: any) {
    console.error('[RAZORPAY WEBHOOK UNHANDLED EXCEPTION]:', error);
    return res.status(500).json({ error: 'Internal webhook error', message: error?.message });
  }
}
