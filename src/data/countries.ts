export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  zone: 'DOMESTIC' | 'TIER_1' | 'REST_OF_WORLD';
  defaultCurrency: string;
}

export const COUNTRIES: CountryInfo[] = [
  // 🇮🇳 Priority Domestic
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', zone: 'DOMESTIC', defaultCurrency: 'INR' },

  // 🌍 Tier 1 International (Major Ecommerce hubs)
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', zone: 'TIER_1', defaultCurrency: 'USD' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', zone: 'TIER_1', defaultCurrency: 'GBP' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', zone: 'TIER_1', defaultCurrency: 'AED' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', zone: 'TIER_1', defaultCurrency: 'CAD' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', zone: 'TIER_1', defaultCurrency: 'AUD' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', zone: 'TIER_1', defaultCurrency: 'SGD' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', zone: 'TIER_1', defaultCurrency: 'SAR' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', zone: 'TIER_1', defaultCurrency: 'JPY' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', zone: 'TIER_1', defaultCurrency: 'NZD' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', zone: 'TIER_1', defaultCurrency: 'CHF' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974', zone: 'TIER_1', defaultCurrency: 'QAR' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965', zone: 'TIER_1', defaultCurrency: 'KWD' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '+968', zone: 'TIER_1', defaultCurrency: 'OMR' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dialCode: '+973', zone: 'TIER_1', defaultCurrency: 'BHD' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46', zone: 'TIER_1', defaultCurrency: 'SEK' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47', zone: 'TIER_1', defaultCurrency: 'NOK' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45', zone: 'TIER_1', defaultCurrency: 'DKK' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43', zone: 'TIER_1', defaultCurrency: 'EUR' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82', zone: 'TIER_1', defaultCurrency: 'KRW' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852', zone: 'TIER_1', defaultCurrency: 'HKD' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', zone: 'TIER_1', defaultCurrency: 'MYR' },

  // 🌐 Rest of World / Global Reach
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', zone: 'REST_OF_WORLD', defaultCurrency: 'THB' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', zone: 'REST_OF_WORLD', defaultCurrency: 'IDR' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', zone: 'REST_OF_WORLD', defaultCurrency: 'PHP' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', zone: 'REST_OF_WORLD', defaultCurrency: 'VND' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', dialCode: '+886', zone: 'REST_OF_WORLD', defaultCurrency: 'TWD' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', zone: 'REST_OF_WORLD', defaultCurrency: 'EUR' },
  { code: 'PL', name: 'Poland', flag: 'PLN', dialCode: '+48', zone: 'REST_OF_WORLD', defaultCurrency: 'PLN' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', zone: 'REST_OF_WORLD', defaultCurrency: 'CZK' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30', zone: 'REST_OF_WORLD', defaultCurrency: 'EUR' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358', zone: 'REST_OF_WORLD', defaultCurrency: 'EUR' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90', zone: 'REST_OF_WORLD', defaultCurrency: 'TRY' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972', zone: 'REST_OF_WORLD', defaultCurrency: 'ILS' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', zone: 'REST_OF_WORLD', defaultCurrency: 'ZAR' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', zone: 'REST_OF_WORLD', defaultCurrency: 'BRL' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', zone: 'REST_OF_WORLD', defaultCurrency: 'MXN' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', zone: 'REST_OF_WORLD', defaultCurrency: 'ARS' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', zone: 'REST_OF_WORLD', defaultCurrency: 'CLP' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57', zone: 'REST_OF_WORLD', defaultCurrency: 'COP' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51', zone: 'REST_OF_WORLD', defaultCurrency: 'PEN' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', zone: 'REST_OF_WORLD', defaultCurrency: 'EGP' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', dialCode: '+230', zone: 'REST_OF_WORLD', defaultCurrency: 'MUR' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94', zone: 'REST_OF_WORLD', defaultCurrency: 'LKR' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dialCode: '+977', zone: 'REST_OF_WORLD', defaultCurrency: 'NPR' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880', zone: 'REST_OF_WORLD', defaultCurrency: 'BDT' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻', dialCode: '+960', zone: 'REST_OF_WORLD', defaultCurrency: 'MVR' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹', dialCode: '+975', zone: 'REST_OF_WORLD', defaultCurrency: 'INR' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', zone: 'REST_OF_WORLD', defaultCurrency: 'NGN' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', zone: 'REST_OF_WORLD', defaultCurrency: 'KES' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233', zone: 'REST_OF_WORLD', defaultCurrency: 'GHS' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', dialCode: '+212', zone: 'REST_OF_WORLD', defaultCurrency: 'MAD' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', dialCode: '+354', zone: 'REST_OF_WORLD', defaultCurrency: 'ISK' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', dialCode: '+352', zone: 'REST_OF_WORLD', defaultCurrency: 'EUR' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨', dialCode: '+377', zone: 'REST_OF_WORLD', defaultCurrency: 'EUR' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', dialCode: '+357', zone: 'REST_OF_WORLD', defaultCurrency: 'EUR' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', dialCode: '+356', zone: 'REST_OF_WORLD', defaultCurrency: 'EUR' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '+36', zone: 'REST_OF_WORLD', defaultCurrency: 'HUF' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', dialCode: '+40', zone: 'REST_OF_WORLD', defaultCurrency: 'RON' },
];

export function getCountryByCode(code: string): CountryInfo {
  return COUNTRIES.find(c => c.code.toUpperCase() === code?.toUpperCase()) || COUNTRIES[0];
}

export interface ShippingCalculationOptions {
  countryCode: string;
  subtotalInr: number;
  freeShippingThresholdInr: number;
  method?: 'standard' | 'express';
  isFreeShippingCoupon?: boolean;
}

export interface ShippingCalculationResult {
  shippingFeeInr: number;
  isFree: boolean;
  zone: 'DOMESTIC' | 'TIER_1' | 'REST_OF_WORLD';
  estimatedDays: string;
  serviceName: string;
}

/**
 * Calculates live shipping cost in base INR based on destination country,
 * admin settings free shipping threshold (for India), and selected method.
 */
export function calculateShippingFee({
  countryCode,
  subtotalInr,
  freeShippingThresholdInr,
  method = 'standard',
  isFreeShippingCoupon = false,
}: ShippingCalculationOptions): ShippingCalculationResult {
  const country = getCountryByCode(countryCode || 'IN');

  // If coupon explicitly gives 100% free shipping
  if (isFreeShippingCoupon) {
    return {
      shippingFeeInr: 0,
      isFree: true,
      zone: country.zone,
      estimatedDays: country.zone === 'DOMESTIC' ? '2-4 Business Days' : '4-7 Business Days',
      serviceName: 'Free Promotional Delivery',
    };
  }

  // 🇮🇳 DOMESTIC INDIA
  if (country.zone === 'DOMESTIC') {
    // Admin Panel Setting: if subtotal >= freeShippingThreshold, standard is FREE
    const qualifiesForAdminFree = freeShippingThresholdInr > 0 && subtotalInr >= freeShippingThresholdInr;

    if (method === 'express') {
      return {
        shippingFeeInr: 199,
        isFree: false,
        zone: 'DOMESTIC',
        estimatedDays: '1-2 Business Days',
        serviceName: 'ShoeStyle Priority Air Express',
      };
    }

    if (qualifiesForAdminFree) {
      return {
        shippingFeeInr: 0,
        isFree: true,
        zone: 'DOMESTIC',
        estimatedDays: '2-4 Business Days',
        serviceName: 'Standard Free Delivery',
      };
    }

    return {
      shippingFeeInr: 99,
      isFree: false,
      zone: 'DOMESTIC',
      estimatedDays: '2-4 Business Days',
      serviceName: 'Standard Surface Delivery',
    };
  }

  // 🌍 TIER 1 INTERNATIONAL (US, UK, UAE, CA, AU, EU, etc.)
  if (country.zone === 'TIER_1') {
    if (method === 'express') {
      return {
        shippingFeeInr: 1999, // ~$24 USD
        isFree: false,
        zone: 'TIER_1',
        estimatedDays: '3-5 Business Days',
        serviceName: 'DHL / FedEx Express Worldwide',
      };
    }

    return {
      shippingFeeInr: 1499, // ~$18 USD
      isFree: false,
      zone: 'TIER_1',
      estimatedDays: '5-8 Business Days',
      serviceName: 'International Tracked Courier',
    };
  }

  // 🌐 REST OF WORLD
  if (method === 'express') {
    return {
      shippingFeeInr: 2999, // ~$36 USD
      isFree: false,
      zone: 'REST_OF_WORLD',
      estimatedDays: '5-8 Business Days',
      serviceName: 'Global Priority Express',
    };
  }

  return {
    shippingFeeInr: 2499, // ~$30 USD
    isFree: false,
    zone: 'REST_OF_WORLD',
    estimatedDays: '8-14 Business Days',
    serviceName: 'Global Tracked Postal',
  };
}
