import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // GET: Fetch Settings (Publicly accessible so the frontend can read the currency)
    if (req.method === 'GET') {
        try {
            let settings = await prisma.storeSettings.findFirst();
            // If no settings exist, create default ones
            if (!settings) {
                settings = await prisma.storeSettings.create({ data: {} });
            }
            return res.status(200).json(settings);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch settings' });
        }
    }

    // PUT: Update Settings (Protected, Admin Only)
    if (req.method === 'PUT') {
        const session = await getServerSession(req, res, authOptions);
        if (!session || session.user?.role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            // 🔥 NAYE FIELDS EXTRACT KIYE: shippingIndia, shippingTier1, shippingRow
            const { storeName, contactEmail, defaultCurrency, taxRate, freeShippingAmount, shippingIndia, shippingTier1, shippingRow } = req.body;

            const existingSettings = await prisma.storeSettings.findFirst();

            const updatedSettings = await prisma.storeSettings.update({
                where: { id: existingSettings?.id },
                data: {
                    storeName,
                    contactEmail,
                    defaultCurrency,
                    taxRate: parseFloat(taxRate) || 0,
                    freeShippingAmount: parseFloat(freeShippingAmount) || 0,
                    // 🔥 NAYA FIX: Database mein dynamic shipping amounts save ho rahe hain
                    shippingIndia: parseFloat(shippingIndia) || 15,
                    shippingTier1: parseFloat(shippingTier1) || 50,
                    shippingRow: parseFloat(shippingRow) || 80,
                }
            });

            return res.status(200).json(updatedSettings);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to update settings' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
