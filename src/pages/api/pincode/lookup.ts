import { NextApiRequest, NextApiResponse } from 'next';
import { validateZipCode } from '@/utils/validation';

// In-memory cache for fast lookups (0ms latency on repeated queries)
const pincodeCache = new Map<string, any>();

// Official Postal Circle state mapping for Indian 2-digit PIN prefixes
const PIN_PREFIX_STATE_MAP: Record<string, string> = {
  '11': 'Delhi',
  '12': 'Haryana',
  '13': 'Haryana',
  '14': 'Punjab',
  '15': 'Punjab',
  '16': 'Chandigarh / Punjab',
  '17': 'Himachal Pradesh',
  '18': 'Jammu & Kashmir',
  '19': 'Jammu & Kashmir',
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '24': 'Uttar Pradesh / Uttarakhand',
  '25': 'Uttar Pradesh',
  '26': 'Uttar Pradesh / Uttarakhand',
  '27': 'Uttar Pradesh', // Gonda, Gorakhpur, Basti, etc.
  '28': 'Uttar Pradesh',
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  '40': 'Maharashtra / Goa',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  '70': 'West Bengal',
  '71': 'West Bengal',
  '72': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Odisha',
  '78': 'Assam',
  '79': 'North East (Meghalaya, Manipur, Tripura, Mizoram, Nagaland, Arunachal)',
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Bihar / Jharkhand',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { pincode, country = 'IN', city = '' } = req.query;

  if (!pincode || typeof pincode !== 'string') {
    return res.status(400).json({ valid: false, message: 'PIN / Postal code is required' });
  }

  const countryCode = (country as string).toUpperCase();
  const trimmedPin = pincode.trim();

  // Basic regex validation first
  const isFormatValid = validateZipCode(trimmedPin, countryCode);
  if (!isFormatValid) {
    return res.status(200).json({
      valid: false,
      message:
        countryCode === 'IN'
          ? 'Must be a valid 6-digit Indian PIN code (e.g. 271313, 110001)'
          : 'Invalid postal code format for selected country',
    });
  }

  // 🇮🇳 For India: Live Postal Directory verification & State mapping
  if (countryCode === 'IN') {
    const prefix2 = trimmedPin.substring(0, 2);
    const expectedState = PIN_PREFIX_STATE_MAP[prefix2];

    // If prefix is not in known postal circles (e.g. 99xxxx or 01xxxx)
    if (!expectedState) {
      return res.status(200).json({
        valid: false,
        verified: true,
        message: 'Invalid PIN code prefix. No postal circle exists for this code.',
      });
    }

    // Check memory cache
    if (pincodeCache.has(trimmedPin)) {
      const cached = pincodeCache.get(trimmedPin);
      return res.status(200).json(cached);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(`https://api.postalpincode.in/pincode/${trimmedPin}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (
          Array.isArray(data) &&
          data[0]?.Status === 'Success' &&
          Array.isArray(data[0]?.PostOffice) &&
          data[0].PostOffice.length > 0
        ) {
          const firstOffice = data[0].PostOffice[0];
          const district = firstOffice.District || '';
          const state = firstOffice.State || expectedState;

          const result = {
            valid: true,
            verified: true,
            district,
            state,
            postOffice: firstOffice.Name || '',
            message: `Verified: ${district}, ${state}`,
          };

          // Cache for fast future lookups
          pincodeCache.set(trimmedPin, result);
          return res.status(200).json(result);
        }

        if (Array.isArray(data) && data[0]?.Status === 'Error') {
          const errorResult = {
            valid: false,
            verified: true,
            message: 'PIN code not found in Indian Postal Directory.',
          };
          return res.status(200).json(errorResult);
        }
      }
    } catch (err) {
      // If external postal directory times out, return valid based on official postal prefix
      const fallbackResult = {
        valid: true,
        verified: false,
        district: '',
        state: expectedState,
        message: `Valid PIN code (${expectedState})`,
      };
      return res.status(200).json(fallbackResult);
    }
  }

  // For other countries (US, UK, CA, etc.)
  return res.status(200).json({
    valid: true,
    verified: false,
    message: 'Valid postal code format',
  });
}
