import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }

    // Fetch custom shipping rate overrides
    const settingRows = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'shipping_standard_rate',
            'shipping_express_rate',
            'shipping_overnight_rate',
          ],
        },
      },
    });

    const dbMap = settingRows.reduce((acc, r) => {
      acc[r.key] = r.value;
      return acc;
    }, {} as Record<string, string>);

    const standardShippingRate = dbMap['shipping_standard_rate'] ? parseFloat(dbMap['shipping_standard_rate']) : 99;
    const expressShippingRate = dbMap['shipping_express_rate'] ? parseFloat(dbMap['shipping_express_rate']) : 199;
    const overnightShippingRate = dbMap['shipping_overnight_rate'] ? parseFloat(dbMap['shipping_overnight_rate']) : 299;

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');

    return res.status(200).json({
      ...settings,
      standardShippingRate,
      expressShippingRate,
      overnightShippingRate,
    });
  } catch (error) {
    console.error('Public settings fetch error:', error);
    return res.status(200).json({
      storeName: 'ShoeStyle',
      defaultCurrency: 'INR',
      freeShippingAmount: 1500,
      taxRate: 18,
      shippingIndia: 15,
      standardShippingRate: 99,
      expressShippingRate: 199,
      overnightShippingRate: 299,
    });
  }
}
