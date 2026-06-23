import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 🔥 Header Banner sirf GET request bhejta hai
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const now = new Date();

        // 1. Database se saare Active aur Non-Expired coupons uthao
        const activeCoupons = await prisma.coupon.findMany({
            where: {
                isActive: true,
                // Ensure karte hain ki coupon ki expiry date abhi aayi nahi hai
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                ]
            },
            orderBy: {
                createdAt: 'desc' // Sabse latest coupon banner mein pehle dikhega
            }
        });

        // 2. Header ko data bhej do
        return res.status(200).json(activeCoupons);

    } catch (error) {
        console.error('Error fetching coupons for banner:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}