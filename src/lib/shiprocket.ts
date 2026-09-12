/**
 * Shiprocket & Shiprocket X API Integration Library for ShoeStyle
 * Features:
 * 1. 23-Hour JWT Token Caching (Zero redundant login requests)
 * 2. Domestic courier serviceability check (Blue Dart, Delhivery, DTDC, etc.)
 * 3. International serviceability check (Shiprocket X across 220+ countries)
 * 4. Shoe-box volumetric dimensions (30x20x12 cm) to prevent weight discrepancy charges
 * 5. Automatic order creation push to Shiprocket
 * 6. High-reliability fallback to local smart rate engine if API is unconfigured/offline
 */

import prisma from '@/lib/prisma';

// In-memory token cache (valid for 23 hours)
let cachedShiprocketToken: string | null = null;
let tokenExpiryTimestamp: number = 0;

export function clearShiprocketTokenCache() {
  cachedShiprocketToken = null;
  tokenExpiryTimestamp = 0;
}

export interface ShoeDimensions {
  length: number;  // in cm (Standard shoe box: ~30 cm)
  breadth: number; // in cm (Standard shoe box: ~20 cm)
  height: number;  // in cm (Standard shoe box: ~12 cm)
  weight: number;  // in kg (~0.9kg - 1.2kg per pair)
}

export const DEFAULT_SHOE_BOX: ShoeDimensions = {
  length: 30,
  breadth: 20,
  height: 12,
  weight: 1.0,
};

export interface ServiceabilityRequest {
  deliveryPincode: string;
  deliveryCountryCode: string;
  pickupPincode?: string;
  subtotalInr: number;
  cod?: boolean;
  itemCount?: number;
  customDimensions?: Partial<ShoeDimensions>;
}

export interface CourierOption {
  courierId: number;
  courierName: string;
  rateInr: number;
  estimatedDeliveryDays: string;
  isCodAvailable: boolean;
  trackingType: string;
}

export interface ServiceabilityResponse {
  success: boolean;
  provider: 'SHIPROCKET' | 'FALLBACK_LOCAL';
  couriers: CourierOption[];
  recommendedCourier?: CourierOption;
  cheapestRateInr: number;
  expressRateInr: number;
  serviceable: boolean;
  message?: string;
}

/**
 * Retrieves Shiprocket configuration from database settings or environment variables.
 */
export async function getShiprocketConfig(): Promise<{
  enabled: boolean;
  email: string | null;
  password: string | null;
  pickupPincode: string;
}> {
  let dbSettings: Record<string, string> = {};
  try {
    const rows = await prisma.setting.findMany({
      where: {
        key: {
          in: ['shiprocket_enabled', 'shiprocket_email', 'shiprocket_password', 'shiprocket_pickup_pincode'],
        },
      },
    });
    dbSettings = rows.reduce((acc, r) => {
      acc[r.key] = r.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (err) {
    console.warn('Could not read shiprocket settings from DB:', err);
  }

  const enabled =
    dbSettings['shiprocket_enabled'] !== undefined
      ? dbSettings['shiprocket_enabled'] === 'true'
      : Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);

  const email = dbSettings['shiprocket_email'] || process.env.SHIPROCKET_EMAIL || null;
  const password = dbSettings['shiprocket_password'] || process.env.SHIPROCKET_PASSWORD || null;
  const pickupPincode =
    dbSettings['shiprocket_pickup_pincode'] || process.env.SHIPROCKET_PICKUP_PINCODE || '110001';

  return { enabled, email, password, pickupPincode };
}

/**
 * Retrieves cached Shiprocket authentication JWT token.
 * Re-authenticates only when token has expired (>23 hours) or is missing.
 */
export async function getShiprocketToken(): Promise<string | null> {
  const config = await getShiprocketConfig();

  if (!config.enabled || !config.email || !config.password) {
    return null;
  }

  const now = Date.now();
  if (cachedShiprocketToken && now < tokenExpiryTimestamp) {
    return cachedShiprocketToken;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: config.email, password: config.password }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn('Shiprocket login failed:', response.status);
      return null;
    }

    const data = await response.json();
    if (data && data.token) {
      cachedShiprocketToken = data.token;
      // Cache for 23 hours (23 * 60 * 60 * 1000 ms)
      tokenExpiryTimestamp = now + 23 * 60 * 60 * 1000;
      console.log('Shiprocket token successfully cached for 23 hours');
      return cachedShiprocketToken;
    }
  } catch (error) {
    console.error('Shiprocket authentication error:', error);
  }

  return null;
}

/**
 * Checks domestic or international courier serviceability and rates.
 */
export async function checkCourierServiceability({
  deliveryPincode,
  deliveryCountryCode = 'IN',
  pickupPincode,
  subtotalInr,
  cod = false,
  itemCount = 1,
  customDimensions,
}: ServiceabilityRequest): Promise<ServiceabilityResponse> {
  const isIndia = (deliveryCountryCode || 'IN').toUpperCase() === 'IN';
  const config = await getShiprocketConfig();
  const effectivePickupPincode = pickupPincode || config.pickupPincode;
  const token = await getShiprocketToken();

  // Calculate package dimensions & weight based on shoe quantity
  const totalWeight = (customDimensions?.weight || DEFAULT_SHOE_BOX.weight) * Math.max(1, itemCount);
  const length = customDimensions?.length || DEFAULT_SHOE_BOX.length;
  const breadth = customDimensions?.breadth || DEFAULT_SHOE_BOX.breadth;
  const height = (customDimensions?.height || DEFAULT_SHOE_BOX.height) * (itemCount > 1 ? 1.5 : 1);

  // If Shiprocket token is available, query live API
  if (token) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      let url: string;
      if (isIndia) {
        // Domestic endpoint
        url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${encodeURIComponent(
          effectivePickupPincode
        )}&delivery_postcode=${encodeURIComponent(
          deliveryPincode
        )}&weight=${totalWeight}&cod=${cod ? 1 : 0}&length=${length}&breadth=${breadth}&height=${height}`;
      } else {
        // Shiprocket X International endpoint
        url = `https://apiv2.shiprocket.in/v1/external/courier/international/serviceability/?delivery_country=${encodeURIComponent(
          deliveryCountryCode
        )}&weight=${totalWeight}&length=${length}&breadth=${breadth}&height=${height}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const availableCouriers = data?.data?.available_courier_companies || [];

        if (Array.isArray(availableCouriers) && availableCouriers.length > 0) {
          const couriers: CourierOption[] = availableCouriers.map((c: any) => ({
            courierId: c.courier_company_id,
            courierName: c.courier_name || 'Express Courier',
            rateInr: Math.round(Number(c.rate || c.freight_charge || 99)),
            estimatedDeliveryDays: c.etd || '3-5 Business Days',
            isCodAvailable: Boolean(c.cod),
            trackingType: 'REALTIME',
          }));

          // Sort by rate
          couriers.sort((a, b) => a.rateInr - b.rateInr);
          const cheapest = couriers[0];
          const express = couriers.find(c => c.courierName.toLowerCase().includes('air') || c.courierName.toLowerCase().includes('express')) || couriers[couriers.length - 1];

          return {
            success: true,
            provider: 'SHIPROCKET',
            serviceable: true,
            couriers,
            recommendedCourier: cheapest,
            cheapestRateInr: cheapest.rateInr,
            expressRateInr: express.rateInr || cheapest.rateInr + 100,
          };
        }
      }
    } catch (err) {
      console.warn('Shiprocket serviceability query failed, using smart local rate engine:', err);
    }
  }

  // 🛡️ High-Reliability Local Smart Rate Engine Fallback
  if (isIndia) {
    return {
      success: true,
      provider: 'FALLBACK_LOCAL',
      serviceable: true,
      couriers: [
        {
          courierId: 1,
          courierName: 'Delhivery / Blue Dart Standard',
          rateInr: 99,
          estimatedDeliveryDays: '2-4 Business Days',
          isCodAvailable: true,
          trackingType: 'TRACKED',
        },
        {
          courierId: 2,
          courierName: 'Blue Dart Priority Air',
          rateInr: 199,
          estimatedDeliveryDays: '1-2 Business Days',
          isCodAvailable: true,
          trackingType: 'REALTIME',
        },
      ],
      cheapestRateInr: 99,
      expressRateInr: 199,
    };
  }

  // International Tier 1 (US, GB, AE, etc.)
  const isTier1 = ['US', 'GB', 'AE', 'CA', 'AU', 'DE', 'FR', 'SG', 'SA'].includes(deliveryCountryCode.toUpperCase());
  const internationalRate = isTier1 ? 1499 : 2499;
  const internationalExpress = isTier1 ? 1999 : 2999;

  return {
    success: true,
    provider: 'FALLBACK_LOCAL',
    serviceable: true,
    couriers: [
      {
        courierId: 10,
        courierName: 'Shiprocket X International Standard',
        rateInr: internationalRate,
        estimatedDeliveryDays: '5-8 Business Days',
        isCodAvailable: false,
        trackingType: 'TRACKED',
      },
      {
        courierId: 11,
        courierName: 'DHL / FedEx Express Worldwide',
        rateInr: internationalExpress,
        estimatedDeliveryDays: '3-5 Business Days',
        isCodAvailable: false,
        trackingType: 'REALTIME',
      },
    ],
    cheapestRateInr: internationalRate,
    expressRateInr: internationalExpress,
  };
}

/**
 * Pushes an order into Shiprocket for courier assignment and AWB generation.
 */
export async function pushOrderToShiprocket(orderPayload: any) {
  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, message: 'Shiprocket credentials not configured. Order saved locally.' };
  }

  try {
    const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, shiprocketOrderId: data.order_id, data };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData };
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
