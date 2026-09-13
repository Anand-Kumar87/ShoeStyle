import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

        // ⚡ Fast Idempotency Guard: If already marked PAID via server webhook, return immediately!
        if (dbOrderId) {
            const existingOrder = await prisma.order.findUnique({
                where: { id: dbOrderId },
            });

            if (existingOrder && existingOrder.paymentStatus === 'PAID') {
                return res.status(200).json({
                    message: "Payment already verified via instant server webhook",
                    success: true,
                });
            }
        }

        // 🛡️ Z+ Security: Signature Verify karna
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
        const expectedSign = crypto
            .createHmac("sha256", keySecret)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // ✅ Payment Genuine Hai! Database mein status "PAID" kar do
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