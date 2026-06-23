import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// 🔥 Zero-decimal currencies jisme * 100 NAHI karna hota
const ZERO_DECIMAL_CURRENCIES = ['jpy', 'krw', 'vnd', 'bif', 'clp', 'djf', 'gnf', 'kmf', 'mga', 'pyg', 'rwf', 'ugx', 'vuv', 'xaf', 'xof', 'xpf'];

export const formatAmountForStripe = (amount: number, currency: string): number => {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase())) {
    return Math.round(amount); // JPY/KRW wagera ke liye exact amount
  }
  return Math.round(amount * 100); // USD/EUR/INR ke liye * 100
};

export const formatAmountFromStripe = (amount: number, currency: string): number => {
  if (ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase())) {
    return amount;
  }
  return amount / 100;
};