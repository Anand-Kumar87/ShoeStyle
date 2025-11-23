'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

const features: Feature[] = [
  {
    id: '1',
    icon: <Truck className="h-5 w-5" />,
    title: 'Free Shipping',
    description: 'On orders over $100',
  },
  {
    id: '2',
    icon: <RefreshCw className="h-5 w-5" />,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    id: '3',
    icon: <Shield className="h-5 w-5" />,
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    id: '4',
    icon: <Headphones className="h-5 w-5" />,
    title: '24/7 Support',
    description: 'Dedicated customer service',
  },
];

const PromoTickerMulti: React.FC = () => {
  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex items-start gap-3 text-left"
            >
              <div className="flex-shrink-0 text-neutral-900">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-xs text-neutral-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoTickerMulti;