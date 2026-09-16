import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

        if (!dbOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing required payment verification fields", success: false });
        }

        const existingOrder = await prisma.order.findUnique({
            where: { id: dbOrderId },
        });

        if (!existingOrder) {
            return res.status(404).json({ message: "Order not found", success: false });
        }

        // ⚡ Fast Idempotency Guard: If already marked PAID via server webhook, return immediately!
        if (existingOrder.paymentStatus === 'PAID') {
            return res.status(200).json({
                message: "Payment already verified via instant server webhook",
                success: true,
            });
        }

        // 🛡️ Cross-Order Replay Attack Guard:
        // Ensure the Razorpay order ID matches this order's paymentIntentId or orderNumber (if set)
        if (existingOrder.paymentIntentId && 
            existingOrder.paymentIntentId !== razorpay_order_id && 
            existingOrder.orderNumber !== razorpay_order_id) {
            return res.status(400).json({ 
                message: "Razorpay order reference mismatch", 
                success: false 
            });
        }

        // 🛡️ User authorization check (if authenticated)
        const session = await getServerSession(req, res, authOptions);
        if (session?.user?.email && existingOrder.email && existingOrder.email.toLowerCase() !== session.user.email.toLowerCase()) {
            const isAdmin = (session.user as any)?.role?.toUpperCase() === 'ADMIN';
            if (!isAdmin) {
                return res.status(403).json({ message: "Unauthorized to verify this order", success: false });
            }
        }

        // 🛡️ Z+ Security: Verify HMAC-SHA256 Cryptographic Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        const expectedSign = crypto
            .createHmac("sha256", keySecret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // ✅ Genuine payment confirmed!
            const updatedOrder = await prisma.order.update({
                where: { id: dbOrderId },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    paymentIntentId: razorpay_payment_id,
                },
            });

            // Increment coupon usage if applied
            if (updatedOrder.couponCode) {
                try {
                    await prisma.coupon.updateMany({
                        where: { code: { equals: updatedOrder.couponCode, mode: 'insensitive' } },
                        data: { usageCount: { increment: 1 } },
                    });
                } catch (e) {
                    console.error("Failed to increment coupon count:", e);
                }
            }

            return res.status(200).json({ message: "Payment verified successfully", success: true });
        } else {
            // ❌ Fake Payment Attempt
            return res.status(400).json({ message: "Invalid signature sent!", success: false });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}