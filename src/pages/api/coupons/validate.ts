import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { couponValidateSchema } from '@/lib/validations/schemas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const validation = couponValidateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.errors[0]?.message || 'Invalid coupon request' });
        }

        const { code, orderAmount, email } = validation.data;

        // 1. Coupon Dhoondho
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid Coupon Code' });
        }

        // 2. Active status aur Dates check karo
        if (!coupon.isActive) {
            return res.status(400).json({ message: 'This coupon is no longer active' });
        }

        const now = new Date();
        if (coupon.startsAt && new Date(coupon.startsAt) > now) {
            return res.status(400).json({ message: 'This coupon is not active yet' });
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
            return res.status(400).json({ message: 'This coupon has expired' });
        }

        // 3. Limits aur Conditions check karo
        if (coupon.minPurchase && orderAmount < coupon.minPurchase) {
            return res.status(400).json({ message: `Minimum order amount of ₹${coupon.minPurchase} is required.` });
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit has been reached' });
        }

        // 3b. Per-User Limit Check (Single-use enforcement)
        const session = await getServerSession(req, res, authOptions);
        const checkEmail = session?.user?.email || email;
        let checkUserId = (session?.user as any)?.id;

        if (checkEmail && !checkUserId) {
            const userRecord = await prisma.user.findUnique({
                where: { email: checkEmail },
                select: { id: true },
            });
            if (userRecord) checkUserId = userRecord.id;
        }

        const perUserLimit = coupon.perUserLimit || 1;
        if (checkEmail || checkUserId) {
            const previousUses = await prisma.order.count({
                where: {
                    couponCode: { equals: coupon.code, mode: 'insensitive' },
                    OR: [
                        checkUserId ? { userId: checkUserId } : undefined,
                        checkEmail ? { email: { equals: checkEmail, mode: 'insensitive' } } : undefined,
                    ].filter(Boolean) as any[],
                    status: { notIn: ['CANCELLED', 'FAILED'] },
                },
            });

            if (previousUses >= perUserLimit) {
                return res.status(400).json({
                    message: `You have already used coupon "${coupon.code}". This coupon is limited to ${perUserLimit} use per customer.`,
                });
            }
        }

        // 4. Exact Discount Calculate Karo (Backend Par)
        let calculatedDiscount = 0;

        if (coupon.discountType === 'PERCENTAGE') {
            calculatedDiscount = (orderAmount * coupon.discountValue) / 100;
            // Agar Max Discount limit lagani hai (Jaise: 50% off UPTO ₹500)
            if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
                calculatedDiscount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
            // Direct amount minus karo
            calculatedDiscount = coupon.discountValue;
            // Ensure karo ki discount order amount se bada na ho jaye
            if (calculatedDiscount > orderAmount) {
                calculatedDiscount = orderAmount;
            }
        }
        // Agar FREE_SHIPPING hai, toh amount discount 0 rahega, frontend par delivery zero karenge

        // 5. Success Response
        return res.status(200).json({
            message: 'Coupon applied successfully',
            coupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.discountType,
                discountAmount: calculatedDiscount, // Sidha ready-made discount frontend ko bhej diya
            }
        });

    } catch (error) {
        console.error('Coupon Validation Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}