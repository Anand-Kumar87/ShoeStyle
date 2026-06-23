import { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        return res.status(500).json({ error: 'Razorpay keys are missing on the server.' });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    try {
        const { amount, orderId } = req.body;

        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

        let exchangeRate = 83.50; // Fallback / Safe Rate

        try {
            // 🔥 RAZORPAY LIVE INR CONVERSION
            const exResponse = await fetch('https://open.er-api.com/v6/latest/USD');
            const exData = await exResponse.json();

            if (exData && exData.rates && exData.rates.INR) {
                exchangeRate = exData.rates.INR;
            }
        } catch (fetchError) {
            console.error("Failed to fetch live exchange rate", fetchError);
        }

        // Razorpay always charges in INR, so we convert Base USD -> INR
        const finalAmountInINR = amount * exchangeRate;
        const finalPaiseAmount = Math.round(finalAmountInINR * 100);

        const options = {
            amount: finalPaiseAmount,
            currency: "INR",
            receipt: orderId.toString().substring(0, 40),
            payment_capture: 1
        };

        const response = await razorpay.orders.create(options);

        return res.status(200).json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
        });

    } catch (error: any) {
        console.error('Razorpay Order Creation Error:', error);
        return res.status(500).json({ error: 'Failed to create Razorpay order', details: error.message });
    }
}