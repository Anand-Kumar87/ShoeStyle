import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clearShiprocketTokenCache } from '@/lib/shiprocket';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // GET: Fetch Settings (Publicly accessible so the frontend can read the currency)
    if (req.method === 'GET') {
        try {
            let settings = await prisma.storeSettings.findFirst();
            // If no settings exist, create default ones
            if (!settings) {
                settings = await prisma.storeSettings.create({ data: {} });
            }

            // Fetch custom settings (Shiprocket & Shipping Rates)
            const customKeys = [
                'shiprocket_enabled',
                'shiprocket_email',
                'shiprocket_password',
                'shiprocket_pickup_pincode',
                'shipping_standard_rate',
                'shipping_express_rate',
                'shipping_overnight_rate',
            ];
            const settingRows = await prisma.setting.findMany({
                where: { key: { in: customKeys } },
            });
            const dbMap = settingRows.reduce((acc, r) => {
                acc[r.key] = r.value;
                return acc;
            }, {} as Record<string, string>);

            const standardShippingRate = dbMap['shipping_standard_rate'] ? parseFloat(dbMap['shipping_standard_rate']) : 99;
            const expressShippingRate = dbMap['shipping_express_rate'] ? parseFloat(dbMap['shipping_express_rate']) : 199;
            const overnightShippingRate = dbMap['shipping_overnight_rate'] ? parseFloat(dbMap['shipping_overnight_rate']) : 299;

            const shiprocket = {
                enabled: dbMap['shiprocket_enabled'] !== undefined
                    ? dbMap['shiprocket_enabled'] === 'true'
                    : Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD),
                email: dbMap['shiprocket_email'] || process.env.SHIPROCKET_EMAIL || '',
                pickupPincode: dbMap['shiprocket_pickup_pincode'] || process.env.SHIPROCKET_PICKUP_PINCODE || '110001',
                hasPassword: Boolean(dbMap['shiprocket_password'] || process.env.SHIPROCKET_PASSWORD),
            };

            return res.status(200).json({
                ...settings,
                standardShippingRate,
                expressShippingRate,
                overnightShippingRate,
                shiprocket,
            });
        } catch (error) {
            console.error('Settings fetch error:', error);
            return res.status(500).json({ message: 'Failed to fetch settings' });
        }
    }

    // PUT: Update Settings (Protected, Admin Only)
    if (req.method === 'PUT') {
        const session = await getServerSession(req, res, authOptions);

        // 🔥 Z+ SECURITY: Case-Insensitive Admin Check
        const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

        if (!session || !isAdmin) {
            return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
        }

        try {
            const {
                storeName,
                contactEmail,
                defaultCurrency,
                taxRate,
                freeShippingAmount,
                standardShippingRate,
                expressShippingRate,
                overnightShippingRate,
                shiprocket,
            } = req.body;

            const existingSettings = await prisma.storeSettings.findFirst();

            const updatedSettings = await prisma.storeSettings.update({
                where: { id: existingSettings?.id },
                data: {
                    storeName,
                    contactEmail,
                    defaultCurrency,
                    taxRate: parseFloat(taxRate) || 0,
                    freeShippingAmount: parseFloat(freeShippingAmount) || 0,
                },
            });

            // If Shiprocket payload provided, save to Setting table
            if (shiprocket) {
                await prisma.setting.upsert({
                    where: { key: 'shiprocket_enabled' },
                    update: { value: String(Boolean(shiprocket.enabled)) },
                    create: { key: 'shiprocket_enabled', value: String(Boolean(shiprocket.enabled)), isPublic: false },
                });

                if (shiprocket.email !== undefined) {
                    await prisma.setting.upsert({
                        where: { key: 'shiprocket_email' },
                        update: { value: shiprocket.email.trim() },
                        create: { key: 'shiprocket_email', value: shiprocket.email.trim(), isPublic: false },
                    });
                }

                if (shiprocket.pickupPincode !== undefined) {
                    await prisma.setting.upsert({
                        where: { key: 'shiprocket_pickup_pincode' },
                        update: { value: shiprocket.pickupPincode.trim() },
                        create: { key: 'shiprocket_pickup_pincode', value: shiprocket.pickupPincode.trim(), isPublic: false },
                    });
                }

                if (shiprocket.password && shiprocket.password.trim().length > 0) {
                    await prisma.setting.upsert({
                        where: { key: 'shiprocket_password' },
                        update: { value: shiprocket.password.trim() },
                        create: { key: 'shiprocket_password', value: shiprocket.password.trim(), isPublic: false },
                    });
                }

                // Invalidate cached token so new credentials take effect immediately
                clearShiprocketTokenCache();
            }

            // Save custom shipping rates
            if (standardShippingRate !== undefined) {
                const stdVal = String(parseFloat(standardShippingRate) || 99);
                await prisma.setting.upsert({
                    where: { key: 'shipping_standard_rate' },
                    update: { value: stdVal },
                    create: { key: 'shipping_standard_rate', value: stdVal, isPublic: true },
                });
            }

            if (expressShippingRate !== undefined) {
                const expVal = String(parseFloat(expressShippingRate) || 199);
                await prisma.setting.upsert({
                    where: { key: 'shipping_express_rate' },
                    update: { value: expVal },
                    create: { key: 'shipping_express_rate', value: expVal, isPublic: true },
                });
            }

            if (overnightShippingRate !== undefined) {
                const ovnVal = String(parseFloat(overnightShippingRate) || 299);
                await prisma.setting.upsert({
                    where: { key: 'shipping_overnight_rate' },
                    update: { value: ovnVal },
                    create: { key: 'shipping_overnight_rate', value: ovnVal, isPublic: true },
                });
            }

            // Sync with ShippingZone table for backward compatibility
            try {
                if (expressShippingRate !== undefined) {
                    const expCost = parseFloat(expressShippingRate) || 199;
                    const expZone = await prisma.shippingZone.findFirst({ where: { name: { contains: 'Express', mode: 'insensitive' } } });
                    if (expZone) {
                        await prisma.shippingZone.update({ where: { id: expZone.id }, data: { baseCost: expCost } });
                    } else {
                        await prisma.shippingZone.create({
                            data: { name: 'Express Delivery', baseCost: expCost, countries: ['IN'], isActive: true },
                        });
                    }
                }
                if (overnightShippingRate !== undefined) {
                    const ovnCost = parseFloat(overnightShippingRate) || 299;
                    const ovnZone = await prisma.shippingZone.findFirst({ where: { name: { contains: 'Overnight', mode: 'insensitive' } } });
                    if (ovnZone) {
                        await prisma.shippingZone.update({ where: { id: ovnZone.id }, data: { baseCost: ovnCost } });
                    } else {
                        await prisma.shippingZone.create({
                            data: { name: 'Overnight Priority', baseCost: ovnCost, countries: ['IN'], isActive: true },
                        });
                    }
                }
            } catch (syncErr) {
                console.warn('Shipping zone sync warning:', syncErr);
            }

            return res.status(200).json(updatedSettings);
        } catch (error) {
            console.error('Settings update error:', error);
            return res.status(500).json({ message: 'Failed to update settings' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}