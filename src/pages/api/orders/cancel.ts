import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getToken } from 'next-auth/jwt'; // 🔥 NAYA FIX: Direct cookie reader
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Sirf POST request allow hogi (405 error rokne ke liye)
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // 🔥 THE BULLETPROOF AUTHENTICATION
        // getSession API routes mein fail ho sakta hai, isliye getToken backup hai
        const session = await getSession({ req });
        const token = await getToken({ req });

        // User ID nikalne ka sabse safe tareeka
        const userId = session?.user?.id || token?.sub || token?.id;
        const userRole = session?.user?.role || token?.role || 'user';

        if (!userId) {
            console.error("🔥 [DEBUG] Auth Failed. Session:", session, "Token:", token);
            return res.status(401).json({ message: 'Unauthorized: Session or Token missing' });
        }

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Missing orderId parameter' });
        }

        // Database se order dhoondho
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security: Check karo ki user apna hi order cancel kar raha hai
        if (order.userId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only cancel your own orders.' });
        }

        // Status: Sirf PENDING ya CONFIRMED order cancel ho sakte hain
        if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
            return res.status(400).json({ message: 'Order cannot be cancelled at this stage.' });
        }

        // Final Action: Order ko database mein CANCELLED mark karo
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        return res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
    } catch (error) {
        console.error('API Error in Order Cancellation:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}