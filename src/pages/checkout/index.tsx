'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCart } from '@/hooks/useCart';
import { useGlobalCurrency } from '@/context/CurrencyContext';
import toast, { Toaster } from 'react-hot-toast'; // 🔥 Premium Notifications

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  apartment?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  zip?: string;
  country?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 COUPON STATES
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const { taxRate, freeShippingThreshold, convertPrice, loading: currencyLoading } = useGlobalCurrency();

  useEffect(() => {
    if (items.length === 0 && router.isReady) {
      router.push('/cart');
    } else {
      setIsLoading(false);
    }
  }, [items, router]);

  const subtotal = getSubtotal();

  // 🔥 FIX 1: Free Shipping Coupon Check Add Kiya
  const isFreeShipping = appliedCoupon?.type === 'FREE_SHIPPING';
  const shipping = isFreeShipping || subtotal >= freeShippingThreshold ? 0 : 10;

  const tax = subtotal * (taxRate / 100);

  // 🔥 Total mein se discount minus kar diya gaya hai
  const total = Math.max(0, subtotal + shipping + tax - discount);

  // 🔥 COUPON HANDLERS
  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    const loadToast = toast.loading('Applying coupon...');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.toUpperCase(), orderAmount: subtotal })
      });

      const data = await res.json();

      if (res.ok && data.coupon) {
        setAppliedCoupon(data.coupon);

        // 🔥 FIX 2: Frontend math hata kar direct backend ka exact amount use kiya
        setDiscount(data.coupon.discountAmount || 0);

        toast.success(`Coupon ${data.coupon.code} applied! 🎉`, { id: loadToast });
      } else {
        setCouponError(data.message || 'Invalid or expired Coupon Code');
        setDiscount(0);
        setAppliedCoupon(null);
        toast.error('Invalid Coupon Code', { id: loadToast });
      }
    } catch (err) {
      setCouponError('Something went wrong!');
      toast.error('Error applying coupon', { id: loadToast });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setDiscount(0);
    setCouponError('');
    toast.success('Coupon removed');
  };

  const handleSubmit = async (shippingData: ShippingAddress) => {
    setIsProcessing(true);

    try {
      const formattedAddress = {
        name: `${shippingData.firstName || ''} ${shippingData.lastName || ''}`.trim() || shippingData.name || 'Customer',
        email: shippingData.email || '',
        phone: shippingData.phone || '',
        street: `${shippingData.address || ''} ${shippingData.apartment || ''}`.trim() || shippingData.street || '',
        city: shippingData.city || '',
        state: shippingData.state || '',
        zip: shippingData.zipCode || shippingData.zip || '',
        country: shippingData.country || 'Not Specified',
      };

      // Create Order API Call
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: formattedAddress,
          subtotal,
          shipping,
          tax,
          discount,
          couponCode: appliedCoupon?.code || null,
          total,
          paymentStatus: 'PENDING',
          status: 'PENDING'
        }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create order');
      const order = await orderResponse.json();
      const orderId = order.id || order._id;

      clearCart();
      router.push(`/checkout/payment?orderId=${orderId}`);

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout | ShoeStyle Premium</title>
      </Head>

      <Toaster position="top-center" />
      <Header />

      <main className="min-h-screen bg-slate-50 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-slate-500 font-medium mt-2">Almost there! Complete your order securely below.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 xl:gap-12">

            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl bg-white p-6 md:p-10 shadow-sm border border-slate-100">
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-8 border-b border-slate-100 pb-4">Contact & Delivery</h2>
                <CheckoutForm onSubmit={handleSubmit} isLoading={isProcessing} />
              </div>
            </div>

            {/* Sticky Right Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">

                {/* THE COUPON CARD */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                    🏷️ Have a Coupon?
                  </h3>

                  {!appliedCoupon ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="e.g. SAVE20"
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-600 uppercase tracking-wider transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-xs font-bold text-red-500 mt-3 pl-1">❌ {couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-emerald-600 text-white font-black px-2.5 py-1 rounded-md tracking-wider">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">Applied Successfully!</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-bold text-slate-500">Discount Added:</span>
                        <span className="text-sm font-black text-emerald-600">-{currencyLoading ? '...' : convertPrice(discount)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ORDER SUMMARY */}
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  shipping={shipping}
                  tax={tax}
                  total={total}
                />

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}