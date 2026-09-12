import { NextApiRequest, NextApiResponse } from 'next';
import { checkCourierServiceability } from '@/lib/shiprocket';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      countryCode = 'IN',
      pincode = '110001',
      subtotal = 0,
      itemCount = 1,
      shippingMethod = 'standard',
      isFreeShippingCoupon = false,
    } = req.body;

    // Fetch store settings for Admin Free Shipping Threshold
    const settings = await prisma.storeSettings.findFirst();
    const adminFreeThreshold = settings?.freeShippingAmount ?? 10000;

    const isIndia = (countryCode || 'IN').toUpperCase() === 'IN';

    // Query Shiprocket (or local fallback)
    const serviceability = await checkCourierServiceability({
      deliveryPincode: pincode,
      deliveryCountryCode: countryCode,
      subtotalInr: Number(subtotal),
      itemCount: Number(itemCount) || 1,
    });

    // Determine standard and express fee
    let standardFee = serviceability.cheapestRateInr;
    let expressFee = serviceability.expressRateInr;

    // Apply Admin Free Shipping Threshold if India & qualifying
    if (isIndia && Number(subtotal) >= adminFreeThreshold) {
      standardFee = 0;
    }

    if (isFreeShippingCoupon) {
      standardFee = 0;
    }

    const finalShippingFee = shippingMethod === 'express' ? expressFee : standardFee;

    return res.status(200).json({
      success: true,
      provider: serviceability.provider,
      shippingFee: finalShippingFee,
      standardFee,
      expressFee,
      isFree: standardFee === 0,
      adminFreeThreshold,
      couriers: serviceability.couriers,
      recommendedCourier: serviceability.recommendedCourier,
    });
  } catch (error: any) {
    console.error('Shipping calculation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate live shipping rates',
      shippingFee: 99,
    });
  }
}
