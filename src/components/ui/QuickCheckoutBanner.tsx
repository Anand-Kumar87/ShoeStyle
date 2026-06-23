'use client';

import { motion } from 'framer-motion';
import { Zap, CreditCard, Smartphone } from 'lucide-react';

export default function QuickCheckoutBanner() {
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-12 bg-gradient-to-r from-lime-400 to-lime-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-black" />
            <div>
              <h3 className="font-display text-2xl font-bold text-black">Lightning Fast Checkout</h3>
              <p className="text-black/80 text-sm">Complete your purchase in seconds</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full">
              <Smartphone className="h-5 w-5 text-black" />
              <span className="font-semibold text-black text-sm">Apple Pay</span>
            </div>
            <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full">
              <CreditCard className="h-5 w-5 text-black" />
              <span className="font-semibold text-black text-sm">Google Pay</span>
            </div>
            <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full">
              <CreditCard className="h-5 w-5 text-black" />
              <span className="font-semibold text-black text-sm">PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
