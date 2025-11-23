'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import Button from '@/components/common/Button';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="mx-auto max-w-7xl rounded-lg bg-neutral-900 p-6 shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <Cookie className="h-6 w-6 flex-shrink-0 text-white" />
                <div className="text-sm text-neutral-200">
                  <p className="font-semibold text-white">Cookie Notice</p>
                  <p className="mt-1">
                    We use cookies to improve your experience on our site. By
                    continuing to use our site, you accept our use of cookies.{' '}
                    <a href="/privacy" className="underline hover:text-white">
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleDecline}>
                  Decline
                </Button>
                <Button onClick={handleAccept}>Accept</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;