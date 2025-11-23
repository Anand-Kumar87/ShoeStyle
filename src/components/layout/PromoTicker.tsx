'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Tag, 
  Gift, 
  Sparkles, 
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PromoMessage {
  id: string;
  message: string;
  icon?: React.ReactNode;
  link?: string;
  linkText?: string;
  type?: 'default' | 'sale' | 'info' | 'success' | 'warning';
}

interface PromoTickerProps {
  messages?: PromoMessage[];
  autoRotate?: boolean;
  rotationInterval?: number;
  showControls?: boolean;
  dismissible?: boolean;
  className?: string;
}

const defaultMessages: PromoMessage[] = [
  {
    id: '1',
    message: 'Free shipping on orders over $100',
    icon: <Truck className="h-4 w-4" />,
    link: '/products',
    linkText: 'Shop Now',
    type: 'info',
  },
  {
    id: '2',
    message: 'Summer Sale - Up to 50% off selected items',
    icon: <Tag className="h-4 w-4" />,
    link: '/products?tag=sale',
    linkText: 'View Sale',
    type: 'sale',
  },
  {
    id: '3',
    message: 'New Arrivals - Check out the latest styles',
    icon: <Sparkles className="h-4 w-4" />,
    link: '/products?tag=new',
    linkText: 'Discover',
    type: 'default',
  },
  {
    id: '4',
    message: 'Buy 2 Get 1 Free on selected sneakers',
    icon: <Gift className="h-4 w-4" />,
    link: '/products?category=sneakers',
    linkText: 'Learn More',
    type: 'success',
  },
];

const PromoTicker: React.FC<PromoTickerProps> = ({
  messages = defaultMessages,
  autoRotate = true,
  rotationInterval = 5000,
  showControls = true,
  dismissible = true,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const currentMessage = messages[currentIndex];

  // Auto-rotation logic
  useEffect(() => {
    if (!autoRotate || isPaused || messages.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, rotationInterval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, autoRotate, rotationInterval, messages.length]);

  const handleNext = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  const handlePrevious = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store in localStorage to remember dismissal
    localStorage.setItem('promoTickerDismissed', 'true');
  };

  // Check if previously dismissed
  useEffect(() => {
    const isDismissed = localStorage.getItem('promoTickerDismissed');
    if (isDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const getBackgroundColor = (type: PromoMessage['type']) => {
    switch (type) {
      case 'sale':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-amber-600';
      default:
        return 'bg-neutral-900';
    }
  };

  if (!isVisible || messages.length === 0) return null;

  return (
    <div className={`relative overflow-hidden ${getBackgroundColor(currentMessage.type)} ${className}`}>
      <div
        className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between gap-4">
          
          {/* Previous Button */}
          {showControls && messages.length > 1 && (
            <button
              onClick={handlePrevious}
              className="hidden flex-shrink-0 text-white/70 transition-colors hover:text-white sm:block"
              aria-label="Previous message"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Message Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentMessage.id}
                initial={{ 
                  x: direction === 'left' ? 20 : -20, 
                  opacity: 0 
                }}
                animate={{ 
                  x: 0, 
                  opacity: 1 
                }}
                exit={{ 
                  x: direction === 'left' ? -20 : 20, 
                  opacity: 0 
                }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4"
              >
                {/* Icon */}
                {currentMessage.icon && (
                  <div className="flex-shrink-0 text-white">
                    {currentMessage.icon}
                  </div>
                )}

                {/* Message Text */}
                <p className="text-center text-sm font-medium text-white sm:text-left">
                  {currentMessage.message}
                </p>

                {/* CTA Link */}
                {currentMessage.link && currentMessage.linkText && (
                  <Link
                    href={currentMessage.link}
                    className="group flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline"
                  >
                    {currentMessage.linkText}
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          {showControls && messages.length > 1 && (
            <button
              onClick={handleNext}
              className="hidden flex-shrink-0 text-white/70 transition-colors hover:text-white sm:block"
              aria-label="Next message"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Dismiss Button */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-white/70 transition-colors hover:text-white"
              aria-label="Dismiss banner"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Progress Indicators */}
        {messages.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5">
            {messages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 'left' : 'right');
                  setCurrentIndex(index);
                }}
                className={`h-1 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to message ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pause Indicator */}
      {isPaused && autoRotate && (
        <div className="absolute bottom-1 right-1 rounded bg-black/20 px-2 py-0.5 text-xs text-white">
          Paused
        </div>
      )}
    </div>
  );
};

export default PromoTicker;