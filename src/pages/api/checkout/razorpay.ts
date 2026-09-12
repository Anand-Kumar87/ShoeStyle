import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Razorpay instance initialize karna
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        const { amount, orderId, items, shippingAddress } = req.body;

        // Mode 1: Order already exists in DB (Primary Flow from /checkout/payment)
        if (orderId) {
            const existingOrder = await prisma.order.findUnique({
                where: { id: orderId },
            });

            if (!existingOrder) {
                return res.status(404).json({ error: "Order not found" });
            }

            const finalAmount = existingOrder.total > 0 ? existingOrder.total : (amount || 0);

            // Razorpay takes amount in paise (1 INR = 100 paise)
            const options = {
                amount: Math.round(finalAmount * 100),
                currency: "INR",
                receipt: `rcpt_${Date.now()}_${orderId.slice(0, 8)}`,
            };

            const razorpayOrder = await razorpay.orders.create(options);

            // Attach Razorpay Order ID to the DB order
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentIntentId: razorpayOrder.id,
                    paymentMethod: "RAZORPAY",
                },
            });

            return res.status(200).json({
                id: razorpayOrder.id,
                currency: razorpayOrder.currency,
                amount: razorpayOrder.amount,
                dbOrderId: existingOrder.id,
            });
        }

        // Mode 2: Direct creation if orderId is not yet generated
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid order amount" });
        }

        const options = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${session?.user?.id || 'guest'}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // If shippingAddress is provided, save order
        let newOrderId = null;
        if (shippingAddress) {
            const newOrder = await prisma.order.create({
                data: {
                    orderNumber: razorpayOrder.id,
                    userId: session?.user?.id || null,
                    firstName: shippingAddress.firstName || shippingAddress.name?.split(" ")[0] || "Customer",
                    lastName: shippingAddress.lastName || shippingAddress.name?.split(" ")[1] || "",
                    email: shippingAddress.email || session?.user?.email || "customer@shoestyle.com",
                    phone: shippingAddress.phone || "0000000000",
                    address: shippingAddress.street || shippingAddress.address || "",
                    city: shippingAddress.city || "",
                    state: shippingAddress.state || "",
                    zipCode: shippingAddress.zipCode || shippingAddress.zip || "",
                    country: shippingAddress.country || "IN",
                    subtotal: amount,
                    total: amount,
                    status: "PENDING",
                    paymentStatus: "PENDING",
                    paymentMethod: "RAZORPAY",
                    paymentIntentId: razorpayOrder.id,
                },
            });
            newOrderId = newOrder.id;
        }

        return res.status(200).json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            dbOrderId: newOrderId,
        });

    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        return res.status(500).json({ error: "Something went wrong during order creation.", details: error?.message });
    }
}