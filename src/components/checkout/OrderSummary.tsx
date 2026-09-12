'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { Receipt, Tag, Package, ChevronDown, ChevronUp, Globe, Sparkles } from 'lucide-react';
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  taxRate?: number;
  total: number;
  couponDiscount?: number;
  destinationCountryName?: string;
  destinationCountryFlag?: string;
  shippingServiceName?: string;
}

const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', label: 'GBP (£)' },
  { code: 'CAD', symbol: 'C$', flag: '🇨🇦', label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺', label: 'AUD (A$)' },
];

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  tax,
  taxRate,
  total,
  couponDiscount = 0,
  destinationCountryName = 'India',
  destinationCountryFlag = '🇮🇳',
  shippingServiceName,
}) => {
  const { currency, changeCurrency, convertPrice, loading: currencyLoading } = useGlobalCurrency();
  const [isItemsExpanded, setIsItemsExpanded] = useState(true);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-3.5 sm:p-7 shadow-sm w-full max-w-full min-w-0 box-border overflow-hidden">
      {/* Header with Title & Quick Currency Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Receipt size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Summary</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {items.length} {items.length === 1 ? 'item' : 'items'} in cart
            </p>
          </div>
        </div>

        {/* Clean Items Badge */}
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {items.reduce((sum, item) => sum + item.quantity, 0)} Items
        </span>
      </div>

      {/* Mobile Toggle Items Visibility */}
      <div className="pt-3 pb-1 flex items-center justify-between sm:hidden">
        <button
          type="button"
          onClick={() => setIsItemsExpanded(!isItemsExpanded)}
          className="text-xs font-bold text-slate-600 flex items-center gap-1.5 py-1"
        >
          <span>{isItemsExpanded ? 'Hide item details' : 'Show item details'}</span>
          {isItemsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <span className="text-xs font-black text-slate-900">
          {currencyLoading ? '...' : convertPrice(subtotal)}
        </span>
      </div>

      {/* Items List */}
      {isItemsExpanded && (
        <div className="my-4 space-y-4 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3.5 group">
              <div className="relative h-14 w-14 flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative">
                  <Image
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized={typeof item.image === 'string' && item.image.startsWith('http')}
                  />
                </div>
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate pr-2">{item.name}</p>
                {(item.size || item.color) && (
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && ' • '}
                    {item.color && `Color: ${item.color}`}
                  </p>
                )}
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-900 flex items-center whitespace-nowrap">
                {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Totals Section */}
      <div className="space-y-3.5 border-t border-slate-100 pt-4 mt-2">
        {/* Subtotal */}
        <div className="flex justify-between text-xs sm:text-sm items-center">
          <span className="font-semibold text-slate-500">Subtotal</span>
          <span className="font-black text-slate-900">
            {currencyLoading ? '...' : convertPrice(subtotal)}
          </span>
        </div>

        {/* Shipping Row with Dynamic Country Destination */}
        <div className="flex justify-between text-xs sm:text-sm items-center">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Package size={14} className="text-slate-400" />
              <span>Shipping</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
              <span>{destinationCountryFlag}</span>
              <span>to {destinationCountryName}</span>
              {shippingServiceName && <span className="text-slate-400">• {shippingServiceName}</span>}
            </span>
          </div>

          <span className={`font-black ${shipping === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {shipping === 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                <Sparkles size={11} /> FREE
              </span>
            ) : currencyLoading ? (
              '...'
            ) : (
              convertPrice(shipping)
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-xs sm:text-sm items-center">
          <span className="font-semibold text-slate-500">
            Estimated Tax {taxRate !== undefined && taxRate > 0 ? `(${taxRate}% GST)` : ''}
          </span>
          <span className="font-black text-slate-900">
            {currencyLoading ? '...' : convertPrice(tax)}
          </span>
        </div>

        {/* Coupon Discount */}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm items-center bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <Tag size={13} /> Coupon Discount
            </span>
            <span className="font-black text-emerald-700">
              -{currencyLoading ? '...' : convertPrice(couponDiscount)}
            </span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between border-t-2 border-slate-100 pt-4 mt-3">
          <div className="self-center">
            <span className="font-black text-slate-900 uppercase tracking-wider text-xs sm:text-sm block">
              Total Due
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Converted in {currency}
            </span>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
              {currencyLoading ? '...' : convertPrice(total)}
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              All Duties & Taxes Included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;