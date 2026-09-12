export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateZipCode = (zipCode: string, countryCode: string = 'IN'): boolean => {
  if (!zipCode || typeof zipCode !== 'string') return false;
  const trimmed = zipCode.trim();
  const country = (countryCode || 'IN').toUpperCase();

  // 🇮🇳 India PIN Code: Exactly 6 digits, cannot start with 0 (e.g. 271313, 110001)
  if (country === 'IN') {
    return /^[1-9][0-9]{5}$/.test(trimmed);
  }

  // 🇺🇸 United States: 5 digits or 5+4 (e.g. 90210 or 90210-1234)
  if (country === 'US') {
    return /^\d{5}(-\d{4})?$/.test(trimmed);
  }

  // 🇬🇧 United Kingdom
  if (country === 'GB' || country === 'UK') {
    return /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i.test(trimmed);
  }

  // 🇨🇦 Canada (e.g. K1A 0B1)
  if (country === 'CA') {
    return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(trimmed);
  }

  // 🇦🇺 Australia (4 digits)
  if (country === 'AU') {
    return /^\d{4}$/.test(trimmed);
  }

  // 🇦🇪 UAE (often 00000 or N/A or custom, allow 2-10 chars)
  if (country === 'AE') {
    return trimmed.length >= 2;
  }

  // Worldwide general postal codes (3 to 10 alphanumeric characters)
  return /^[A-Za-z0-9\s\-]{3,10}$/.test(trimmed);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};