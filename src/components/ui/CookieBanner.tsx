'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only check in browser
    if (typeof window === 'undefined') return;
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // 0.8s smooth entrance delay so page mounts seamlessly
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'essential');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-[99999] pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] text-white">
            
            {/* Ambient Background Gradient Accent */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header & Close */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-inner">
                  <Cookie size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                    Privacy & Cookie Notice
                    <ShieldCheck size={14} className="text-emerald-400" />
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    ShoeStyle Experience
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDecline}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss cookie notice"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              We use essential cookies to maintain your shopping cart, secure authentication, and tailor our luxury footwear showcase.{' '}
              <Link
                href="/privacy"
                className="text-amber-300 hover:text-amber-200 underline font-semibold transition-colors"
              >
                Learn more in Privacy Policy
              </Link>
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 bg-white hover:bg-slate-100 active:scale-95 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md text-center cursor-pointer"
              >
                Accept All
              </button>

              <button
                type="button"
                onClick={handleDecline}
                className="bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 font-semibold py-2.5 px-3.5 rounded-xl text-xs transition-all border border-white/10 text-center cursor-pointer whitespace-nowrap"
              >
                Essential Only
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;