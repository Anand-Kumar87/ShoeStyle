import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const DEFAULT_SIZE_CHARTS = {
  men: [
    { us: '6', uk: '5.5', eu: '39', cm: '24' },
    { us: '6.5', uk: '6', eu: '39.5', cm: '24.5' },
    { us: '7', uk: '6.5', eu: '40', cm: '25' },
    { us: '7.5', uk: '7', eu: '40.5', cm: '25.5' },
    { us: '8', uk: '7.5', eu: '41', cm: '26' },
    { us: '8.5', uk: '8', eu: '42', cm: '26.5' },
    { us: '9', uk: '8.5', eu: '42.5', cm: '27' },
    { us: '9.5', uk: '9', eu: '43', cm: '27.5' },
    { us: '10', uk: '9.5', eu: '44', cm: '28' },
    { us: '10.5', uk: '10', eu: '44.5', cm: '28.5' },
    { us: '11', uk: '10.5', eu: '45', cm: '29' },
    { us: '11.5', uk: '11', eu: '45.5', cm: '29.5' },
    { us: '12', uk: '11.5', eu: '46', cm: '30' },
    { us: '13', uk: '12.5', eu: '47', cm: '31' },
    { us: '14', uk: '13.5', eu: '48', cm: '32' }
  ],
  women: [
    { us: '5', uk: '3', eu: '35.5', cm: '22' },
    { us: '5.5', uk: '3.5', eu: '36', cm: '22.5' },
    { us: '6', uk: '4', eu: '36.5', cm: '23' },
    { us: '6.5', uk: '4.5', eu: '37', cm: '23.5' },
    { us: '7', uk: '5', eu: '37.5', cm: '24' },
    { us: '7.5', uk: '5.5', eu: '38', cm: '24.5' },
    { us: '8', uk: '6', eu: '38.5', cm: '25' },
    { us: '8.5', uk: '6.5', eu: '39', cm: '25.5' },
    { us: '9', uk: '7', eu: '40', cm: '26' },
    { us: '9.5', uk: '7.5', eu: '40.5', cm: '27' },
    { us: '10', uk: '8', eu: '41', cm: '27.5' },
    { us: '10.5', uk: '8.5', eu: '42', cm: '28' },
    { us: '11', uk: '9', eu: '42.5', cm: '28.5' },
    { us: '12', uk: '10', eu: '43', cm: '29' }
  ],
  kids: [
    { us: '10C', uk: '9.5', eu: '27', cm: '16.5' },
    { us: '10.5C', uk: '10', eu: '27.5', cm: '17' },
    { us: '11C', uk: '10.5', eu: '28', cm: '17.5' },
    { us: '11.5C', uk: '11', eu: '29', cm: '18' },
    { us: '12C', uk: '11.5', eu: '30', cm: '18.5' },
    { us: '12.5C', uk: '12', eu: '30.5', cm: '19' },
    { us: '13C', uk: '12.5', eu: '31', cm: '19.5' },
    { us: '13.5C', uk: '13', eu: '31.5', cm: '20' },
    { us: '1Y', uk: '13.5', eu: '32', cm: '20.5' },
    { us: '1.5Y', uk: '1', eu: '33', cm: '21' },
    { us: '2Y', uk: '1.5', eu: '33.5', cm: '21.5' },
    { us: '2.5Y', uk: '2', eu: '34', cm: '22' },
    { us: '3Y', uk: '2.5', eu: '35', cm: '22.5' }
  ]
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'size_guide_charts' },
      });

      if (setting && setting.value) {
        try {
          const parsed = JSON.parse(setting.value);
          if (parsed && typeof parsed === 'object' && parsed.men) {
            return res.status(200).json({ success: true, charts: parsed });
          }
        } catch {}
      }

      // Seed default charts
      await prisma.setting.upsert({
        where: { key: 'size_guide_charts' },
        create: {
          key: 'size_guide_charts',
          value: JSON.stringify(DEFAULT_SIZE_CHARTS),
          type: 'json',
          category: 'sizing',
          description: 'Official International Shoe Size Conversion Charts',
          isPublic: true,
        },
        update: {},
      }).catch(() => null);

      return res.status(200).json({ success: true, charts: DEFAULT_SIZE_CHARTS });
    } catch (error: any) {
      console.error('Size guide GET error:', error);
      return res.status(200).json({ success: true, charts: DEFAULT_SIZE_CHARTS });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || (session.user as any)?.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
      }

      const { charts } = req.body;
      if (!charts || typeof charts !== 'object' || !charts.men) {
        return res.status(400).json({ message: 'Invalid size chart format.' });
      }

      await prisma.setting.upsert({
        where: { key: 'size_guide_charts' },
        create: {
          key: 'size_guide_charts',
          value: JSON.stringify(charts),
          type: 'json',
          category: 'sizing',
          description: 'Official International Shoe Size Conversion Charts',
          isPublic: true,
        },
        update: {
          value: JSON.stringify(charts),
        },
      });

      return res.status(200).json({ success: true, message: 'Size charts updated successfully!' });
    } catch (error: any) {
      console.error('Size guide update error:', error);
      return res.status(500).json({ message: 'Failed to update size charts.' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
