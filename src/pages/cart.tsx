'use client';

import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/cart/CartItem';
import Button from '@/components/common/Button';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useGlobalCurrency } from '@/context/CurrencyContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function CartPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();
  const { convertPrice, loading: currencyLoading, taxRate, currency, freeShippingThreshold } = useGlobalCurrency();

  const subtotal = getSubtotal();
  const estimatedTax = subtotal * (taxRate / 100);
  const estimatedTotal = subtotal + estimatedTax;

  return (
    <>
      <Head>
        <title>Shopping Cart | ShoeStyle Premium</title>
        <meta name="description" content="View your cart and proceed to checkout" />
      </Head>

      <Header />

      <main className="min-h-screen bg-slate-50 py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
            {items.length > 0 && (
              <span className="text-sm font-bold text-slate-500">
                {items.length} item{items.length !== 1 ? 's' : ''} in your bag
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-400">
                <ShoppingBag size={36} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty</h2>
              <p className="text-slate-500 text-sm mb-8 font-medium">
                Looks like you haven't added any pairs yet. Explore our curated drop!
              </p>
              <Link href="/products">
                <Button className="w-full py-4 text-xs font-black uppercase tracking-widest bg-slate-950 hover:bg-black text-white rounded-xl shadow-md">
                  Explore Footwear <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {/* Cart Items */}
              <div className="lg:col-span-7 xl:col-span-8">
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                {/* Trust Badges */}
                <div className="mt-8 grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Truck size={18} className="text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Worldwide Shipping</p>
                      <p className="text-[10px] text-slate-400 font-medium">Fast & insured delivery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <RotateCcw size={18} className="text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Easy Returns</p>
                      <p className="text-[10px] text-slate-400 font-medium">7-day hassle-free policy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} className="text-purple-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">100% Authentic</p>
                      <p className="text-[10px] text-slate-400 font-medium">Guaranteed genuine</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-28 rounded-3xl bg-white p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3.5 border-b border-slate-100 pb-5">
                    <div className="flex justify-between text-sm items-center">
                      <span className="font-bold text-slate-500">Subtotal</span>
                      <span className="font-black text-slate-900 text-base">
                        {currencyLoading ? '...' : convertPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm items-center">
                      <div>
                        <span className="font-bold text-slate-500 block">Shipping</span>
                        <span className="text-[11px] text-slate-400 block font-normal">
                          {subtotal >= freeShippingThreshold ? 'Standard delivery unlocked' : 'Calculated by destination'}
                        </span>
                      </div>
                      {subtotal >= freeShippingThreshold ? (
                        <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 uppercase tracking-wider">
                          FREE
                        </span>
                      ) : (
                        <span className="text-[11px] font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60 uppercase tracking-wider">
                          Calculated at checkout
                        </span>
                      )}
                    </div>

                    {taxRate > 0 && (
                      <div className="flex justify-between text-sm items-center">
                        <span className="font-bold text-slate-500">Estimated Tax ({taxRate}% GST)</span>
                        <span className="font-black text-slate-900">
                          {currencyLoading ? '...' : convertPrice(estimatedTax)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-base font-black text-slate-900">Estimated Total</span>
                      <span className="text-2xl font-black text-slate-950 tracking-tight">
                        {currencyLoading ? '...' : convertPrice(estimatedTotal)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Exact shipping fees, customs & discounts calculated on checkout screen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (status === 'unauthenticated') {
                        router.push('/auth/signin?callbackUrl=/checkout');
                      } else {
                        router.push('/checkout');
                      }
                    }}
                    className="block w-full pt-2"
                  >
                    <Button className="w-full py-4 text-xs font-black uppercase tracking-widest bg-slate-950 hover:bg-black text-white rounded-xl shadow-lg transition-all active:scale-[0.98]">
                      Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      Encrypted 256-Bit SSL Checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}