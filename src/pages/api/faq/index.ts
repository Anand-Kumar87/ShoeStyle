import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const DEFAULT_FAQS = [
  {
    category: 'Orders & Shipping',
    iconName: 'Package',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard delivery across India takes 3-5 business days. Express shipping is delivered within 1-2 business days. International orders typically arrive within 7-14 business days.'
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free standard shipping on all qualifying orders over ₹999 / $50 across all serviceable pin codes. Express delivery options are available during checkout.'
      },
      {
        q: 'Can I track my order?',
        a: 'Absolutely! As soon as your order is dispatched, you will receive real-time tracking updates via SMS & Email. You can also track your shipment live anytime on our Shipping Info page.'
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, ShoeStyle ships worldwide to over 100 countries with express international courier partners like DHL and FedEx.'
      }
    ]
  },
  {
    category: 'Returns & Exchanges',
    iconName: 'RefreshCw',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a hassle-free 30-day return policy. Items must be unworn, in original condition with tags and original shoe box intact. Return pickups are arranged free of cost.'
      },
      {
        q: 'How do I initiate a return?',
        a: 'Visit our Returns & Exchanges portal, enter your Order Number and registered Email, select the items, and submit. Our courier will automatically schedule a doorstep reverse pickup.'
      },
      {
        q: 'Can I exchange for a different size?',
        a: 'Yes! We provide complimentary size exchanges within 30 days. If your shoes feel tight or loose, simply submit an exchange request for the preferred size.'
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 24-48 hours once the returned pair undergoes our quick quality verification. Funds are credited directly to your original payment method or bank account.'
      }
    ]
  },
  {
    category: 'Products & Sizing',
    iconName: 'Info',
    questions: [
      {
        q: 'How do I find my exact shoe size?',
        a: 'Check our dedicated Size Guide page. We feature a Smart Sizing Calculator where you enter your foot length in centimeters to get exact US, UK, and EU size recommendations.'
      },
      {
        q: 'Are your shoes true to size?',
        a: 'Our shoes fit true to standard international sizing. Individual fit recommendations (e.g. fits true, runs half-size small) are clearly noted on each footwear product page.'
      },
      {
        q: 'What materials do you use?',
        a: 'We craft footwear using premium full-grain leather, breathable engineered mesh, memory foam insoles, and high-traction non-slip rubber outsoles.'
      },
      {
        q: 'Do you offer wide width options?',
        a: 'Yes! Multiple collections feature relaxed fit and wide-toe box ergonomics designed for superior all-day walking and running comfort.'
      }
    ]
  },
  {
    category: 'Account & Payment',
    iconName: 'HelpCircle',
    questions: [
      {
        q: 'Do I need an account to place an order?',
        a: 'No, guest checkout is supported! However, registering a free ShoeStyle account gives you order tracking, faster one-click checkout, and VIP loyalty rewards.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking, Cash on Delivery (COD), and international payments via Stripe/PayPal.'
      },
      {
        q: 'Is my payment secure?',
        a: 'Yes! We use 256-bit bank-grade SSL encryption and RBI-compliant PCI-DSS Level 1 certified payment gateways. We never store your full card or banking credentials.'
      },
      {
        q: 'Can I apply promotional coupons?',
        a: 'Yes, you can apply valid coupon codes directly on the checkout page before completing payment. The highest discount will be auto-calculated.'
      }
    ]
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'faq_data' },
      });

      if (setting && setting.value) {
        try {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return res.status(200).json({ success: true, faqs: parsed });
          }
        } catch {
          // Fall back to default
        }
      }

      // Seed default FAQs into database setting if not present
      await prisma.setting.upsert({
        where: { key: 'faq_data' },
        create: {
          key: 'faq_data',
          value: JSON.stringify(DEFAULT_FAQS),
          type: 'json',
          category: 'content',
          description: 'Help Center & Frequently Asked Questions',
          isPublic: true,
        },
        update: {},
      }).catch(() => null);

      return res.status(200).json({ success: true, faqs: DEFAULT_FAQS });
    } catch (error: any) {
      console.error('FAQ GET error:', error);
      return res.status(200).json({ success: true, faqs: DEFAULT_FAQS });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || (session.user as any)?.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized. Admin access required.' });
      }

      const { faqs } = req.body;
      if (!Array.isArray(faqs)) {
        return res.status(400).json({ message: 'Invalid FAQ data structure.' });
      }

      await prisma.setting.upsert({
        where: { key: 'faq_data' },
        create: {
          key: 'faq_data',
          value: JSON.stringify(faqs),
          type: 'json',
          category: 'content',
          description: 'Help Center & Frequently Asked Questions',
          isPublic: true,
        },
        update: {
          value: JSON.stringify(faqs),
        },
      });

      return res.status(200).json({ success: true, message: 'FAQs updated successfully!' });
    } catch (error: any) {
      console.error('FAQ update error:', error);
      return res.status(500).json({ message: 'Failed to update FAQ data.' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
