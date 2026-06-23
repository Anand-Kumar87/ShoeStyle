'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { Receipt, Tag, Package } from 'lucide-react';
// 👈 1. Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

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
  // 👈 2. Initialize hook
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Receipt size={20} />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Summary</h2>
      </div>

      {/* Items List */}
      <div className="mb-8 space-y-5">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 group">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-visible">
              <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative">
                <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
              </div>
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white shadow-sm ring-2 ring-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm font-bold text-slate-900 truncate pr-4">{item.name}</p>
              {(item.size || item.color) && (
                <p className="mt-0.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.size && `Size: ${item.size}`}
                  {item.size && item.color && ' • '}
                  {item.color && `Color: ${item.color}`}
                </p>
              )}
            </div>
            <p className="text-sm font-black text-slate-900 flex items-center">
              {/* 👈 3. Convert Individual Item Total */}
              {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="space-y-4 border-t border-slate-100 pt-6">
        <div className="flex justify-between text-sm items-center">
          <span className="font-bold text-slate-500">Subtotal</span>
          {/* 👈 4. Convert Subtotal */}
          <span className="font-black text-slate-900">
            {currencyLoading ? '...' : convertPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm items-center">
          <span className="font-bold text-slate-500 flex items-center gap-1.5">
            <Package size={14} /> Shipping
          </span>
          {/* 👈 5. Convert Shipping (Or show FREE) */}
          <span className={`font-black ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {shipping === 0 ? 'FREE' : (currencyLoading ? '...' : convertPrice(shipping))}
          </span>
        </div>

        <div className="flex justify-between text-sm items-center">
          <span className="font-bold text-slate-500">Tax</span>
          {/* 👈 6. Convert Tax */}
          <span className="font-black text-slate-900">
            {currencyLoading ? '...' : convertPrice(tax)}
          </span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
            <span className="font-bold text-emerald-600 flex items-center gap-1.5">
              <Tag size={14} /> Discount
            </span>
            {/* 👈 7. Convert Discount */}
            <span className="font-black text-emerald-600">
              -{currencyLoading ? '...' : convertPrice(couponDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between border-t border-slate-100 pt-5 mt-2">
          <span className="font-black text-slate-900 uppercase tracking-widest text-sm self-center">Total</span>
          <div className="text-right">
            {/* 👈 8. Convert Final Total */}
            <span className="text-2xl font-black text-blue-600">
              {currencyLoading ? '...' : convertPrice(total)}
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Including Taxes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;