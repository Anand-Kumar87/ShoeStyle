import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

        // 🛡️ Z+ Security: Signature Verify karna
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // ✅ Payment Genuine Hai! Database mein status "PAID" kar do
            await prisma.order.update({
                where: { id: dbOrderId },
                data: {
                    paymentStatus: "PAID",
                    status: "CONFIRMED",
                    paymentIntentId: razorpay_payment_id,
                },
            });

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