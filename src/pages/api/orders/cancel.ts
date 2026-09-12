import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma'; // 🔥 Fixed import path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Sirf POST request allow hogi
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // 🔥 Z+ Security: Use getServerSession instead of getSession for maximum performance
        const session = await getServerSession(req, res, authOptions);

        if (!session || !session.user || !session.user.email) {
            console.error("🔥 [DEBUG] Auth Failed. Session missing.");
            return res.status(401).json({ message: 'Unauthorized: Session missing' });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Missing orderId parameter' });
        }

        // Database se order dhoondho with items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // 🔥 Security: Check karo ki user apna hi order cancel kar raha hai ya fir wo ADMIN hai
        const isAdmin = user.role?.toUpperCase() === 'ADMIN';
        if (order.userId !== user.id && !isAdmin) {
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

        // 📦 RESTORE INVENTORY: Re-increment product stock in PostgreSQL
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                if (item.productId) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: Number(item.quantity) || 1 } }
                    }).catch(err => console.error(`Failed to restore stock for ${item.productId}:`, err));
                }
            }
        }

        return res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
    } catch (error) {
        console.error('API Error in Order Cancellation:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}