'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { formatPrice } from '@/utils/formatting';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  couponDiscount?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  tax,
  total,
  couponDiscount = 0,
}) => {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
      <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

      {/* Items */}
      <div className="mb-6 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">{item.name}</p>
              {(item.size || item.color) && (
                <p className="mt-1 text-xs text-neutral-600">
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && ' • '}
                  {item.color && `Color: ${item.color}`}
                </p>
              )}
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 border-t border-neutral-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Shipping</span>
          <span className="font-medium text-neutral-900">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Tax</span>
          <span className="font-medium text-neutral-900">{formatPrice(tax)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount</span>
            <span className="font-medium text-green-600">
              -{formatPrice(couponDiscount)}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
          <span className="font-semibold text-neutral-900">Total</span>
          <span className="text-xl font-bold text-neutral-900">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;