import { NextApiRequest, NextApiResponse } from 'next';
import { stripe, formatAmountForStripe } from '@/lib/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sirf amount aur currency frontend se lenge
    const { amount, orderId, currency = 'usd' } = req.body;

    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ error: 'Order amount is zero or invalid.' });
    }

    const targetCurrency = currency.toUpperCase();
    let finalConvertedAmount = amount; // Base USD Amount

    // 🌍 BACKEND LIVE FETCH: Stripe ko exact Euro/INR dene ke liye
    if (targetCurrency !== 'USD') {
      try {
        const exResponse = await fetch('https://open.er-api.com/v6/latest/USD');
        const exData = await exResponse.json();

        // Agar EUR (ya koi aur) rate mil gaya, toh usse multiply karo
        if (exData && exData.rates && exData.rates[targetCurrency]) {
          finalConvertedAmount = amount * exData.rates[targetCurrency];
          console.log(`Stripe Live Rate Applied: ${exData.rates[targetCurrency]}`);
        }
      } catch (err) {
        console.error("Stripe exchange rate fetch failed", err);
      }
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: targetCurrency.toLowerCase(),
            product_data: {
              name: `Order #${orderId || 'New'}`,
              description: 'ShoeStyle Premium Products',
            },
            // Converted amount ko Stripe ke cents logic me format kiya
            unit_amount: formatAmountForStripe(finalConvertedAmount, targetCurrency),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/checkout/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/checkout`,
      metadata: {
        orderId: orderId?.toString() || '',
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create payment session', details: error.message });
  }
}