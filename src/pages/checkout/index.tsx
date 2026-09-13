'use client';

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutForm, { ShippingFormData } from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCart } from '@/hooks/useCart';
import { useGlobalCurrency } from '@/context/CurrencyContext';
import { calculateShippingFee, getCountryByCode, COUNTRIES } from '@/data/countries';
import toast from 'react-hot-toast';
import { ArrowLeft, Globe, ShieldCheck, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const { items, getSubtotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // 🛡️ Flag to prevent redirect to /cart when successfully proceeding to payment
  const isNavigatingToPaymentRef = useRef(false);

  // 👤 Pre-fill Logged In User Info
  const userName = session?.user?.name || '';
  const nameParts = userName.trim().split(' ');
  const userFirstName = nameParts[0] || '';
  const userLastName = nameParts.slice(1).join(' ') || '';
  const userEmail = session?.user?.email || '';

  // 🌍 Country & Shipping Method State
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // 🏠 Saved Addresses State for Authenticated User
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetch('/api/user/addresses')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              if (defaultAddr.country) {
                const c = defaultAddr.country.toLowerCase();
                if (c.includes('india') || c === 'in') setSelectedCountry('IN');
              }
              if (defaultAddr.zipCode || defaultAddr.zip) {
                setPincode(defaultAddr.zipCode || defaultAddr.zip);
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [authStatus]);

  // 🏷️ Coupon States
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const {
    currency,
    changeCurrency,
    taxRate,
    freeShippingThreshold,
    convertPrice,
    loading: currencyLoading,
  } = useGlobalCurrency();

  // 🔥 Authentication Guard & Cart Check
  useEffect(() => {
    if (router.isReady && !isNavigatingToPaymentRef.current) {
      if (authStatus === 'loading') return;

      if (authStatus === 'unauthenticated') {
        toast.error('Please sign in to proceed with checkout');
        router.replace('/auth/signin?callbackUrl=/checkout');
        return;
      }

      if (items.length === 0) {
        router.push('/cart');
      } else {
        setIsLoading(false);
        // ⚡ Pre-warm payment page chunk for instant transition
        router.prefetch('/checkout/payment');
      }
    }
  }, [router.isReady, authStatus, items.length]);

  const subtotal = getSubtotal();
  const currentCountry = getCountryByCode(selectedCountry);
  const isFreeShippingCoupon = appliedCoupon?.type === 'FREE_SHIPPING';

  // 🚀 Fallback Instant Rates (Guarantees zero UI shift and instant render)
  const shippingCalc = calculateShippingFee({
    countryCode: selectedCountry,
    subtotalInr: subtotal,
    freeShippingThresholdInr: freeShippingThreshold,
    method: shippingMethod,
    isFreeShippingCoupon,
  });

  const standardCalc = calculateShippingFee({
    countryCode: selectedCountry,
    subtotalInr: subtotal,
    freeShippingThresholdInr: freeShippingThreshold,
    method: 'standard',
    isFreeShippingCoupon,
  });

  const expressCalc = calculateShippingFee({
    countryCode: selectedCountry,
    subtotalInr: subtotal,
    freeShippingThresholdInr: freeShippingThreshold,
    method: 'express',
    isFreeShippingCoupon,
  });

  // ⚡ Live Courier Rates State (Shiprocket or Smart Store Engine)
  const [pincode, setPincode] = useState('');
  const [liveRates, setLiveRates] = useState<{
    standardFee?: number;
    expressFee?: number;
    couriers?: any[];
    provider?: string;
    recommendedCourier?: any;
  } | null>(null);

  const fetchLiveShipping = async (country: string, pin: string) => {
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: country,
          pincode: pin || (country === 'IN' ? '110001' : '10001'),
          subtotal,
          itemCount: items.length,
          shippingMethod,
          isFreeShippingCoupon,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLiveRates({
            standardFee: data.standardFee,
            expressFee: data.expressFee,
            couriers: data.couriers,
            provider: data.provider,
            recommendedCourier: data.recommendedCourier,
          });
        }
      }
    } catch {
      // Gracefully silent; fallback static rates remain active
    }
  };

  const standardFeeInr = liveRates?.standardFee !== undefined ? liveRates.standardFee : standardCalc.shippingFeeInr;
  const expressFeeInr = liveRates?.expressFee !== undefined ? liveRates.expressFee : expressCalc.shippingFeeInr;
  const shipping = shippingMethod === 'express' ? expressFeeInr : standardFeeInr;

  const tax = subtotal * (taxRate / 100);
  const total = Math.max(0, subtotal + shipping + tax - discount);

  // 🏷️ COUPON HANDLERS
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
        body: JSON.stringify({
          code: couponInput.toUpperCase(),
          orderAmount: subtotal,
          email: userEmail || undefined,
        }),
      });

      const data = await res.json();
      toast.dismiss(loadToast);

      if (res.ok && data.coupon) {
        setAppliedCoupon(data.coupon);
        setDiscount(data.coupon.discountAmount || 0);
        toast.success(`Coupon ${data.coupon.code} applied! 🎉`, { duration: 3000 });
      } else {
        setCouponError(data.message || 'Invalid or expired Coupon Code');
        setDiscount(0);
        setAppliedCoupon(null);
        toast.error(data.message || 'Invalid Coupon Code', { duration: 4000 });
      }
    } catch (err) {
      toast.dismiss(loadToast);
      setCouponError('Something went wrong!');
      toast.error('Error applying coupon', { duration: 4000 });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setDiscount(0);
    setCouponError('');
    toast.success('Coupon removed');
  };

  const handleSubmit = async (shippingData: ShippingFormData) => {
    setIsProcessing(true);

    try {
      const formattedAddress = {
        name: `${shippingData.firstName || ''} ${shippingData.lastName || ''}`.trim() || 'Valued Customer',
        email: shippingData.email || '',
        phone: shippingData.phone || '',
        street: `${shippingData.address || ''} ${shippingData.apartment || ''}`.trim(),
        city: shippingData.city || '',
        state: shippingData.state || '',
        zip: shippingData.zipCode || '',
        country: `${currentCountry.name} (${currentCountry.code})`,
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
          status: 'PENDING',
        }),
      });

      if (!orderResponse.ok) {
        const errData = await orderResponse.json().catch(() => ({}));
        if (orderResponse.status === 401) {
          toast.error('Your session has expired. Please sign in to complete checkout.');
          router.push('/auth/signin?callbackUrl=/checkout');
          setIsProcessing(false);
          return;
        }
        toast.error(errData.message || 'Failed to create order. Please try again.');
        setIsProcessing(false);
        return;
      }

      const order = await orderResponse.json();
      const orderId = order.id || order._id;

      // 🏠 Auto-save address to user address book if they don't have any saved yet
      if (session?.user && (!savedAddresses || savedAddresses.length === 0)) {
        fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            street: shippingData.address,
            apartment: shippingData.apartment || '',
            city: shippingData.city,
            state: shippingData.state,
            zipCode: shippingData.zipCode,
            phone: shippingData.phone,
            country: currentCountry.name || 'India',
            isDefault: true,
          }),
        }).catch(() => {});
      }

      // 🛡️ Flag navigation so useEffect does not push to /cart
      isNavigatingToPaymentRef.current = true;

      // ⚡ Store order snapshot in sessionStorage for 0ms payment page render
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`pendingOrder_${orderId}`, JSON.stringify({
            id: orderId,
            orderNumber: order.orderNumber || orderId,
            total,
            subtotal,
            shipping,
            tax,
            discount,
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            email: shippingData.email,
            phone: shippingData.phone,
            items,
          }));
        } catch {}
      }

      // Navigate straight to payment! Cart is kept intact until payment is completed.
      router.push(`/checkout/payment?orderId=${orderId}&amount=${encodeURIComponent(total)}`);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading || authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout | ShoeStyle Luxury</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-slate-50 py-3 sm:py-8 lg:py-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full max-w-full min-w-0 box-border">
          {/* Breadcrumb & Navigation Bar */}
          <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2 min-w-0">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} /> Return to Cart
            </Link>

            <span className="text-[11px] sm:text-xs font-bold text-emerald-600 flex items-center gap-1 truncate">
              <ShieldCheck size={14} className="flex-shrink-0" /> 256-bit SSL Secure Checkout
            </span>
          </div>

          {/* Heading with The ONLY Currency Switcher on Checkout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-2 border-b border-slate-200/60 min-w-0">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Worldwide delivery to 65+ countries with live currency rates.
              </p>
            </div>

            {/* 🔥 SINGLE CURRENCY SELECTOR ON CHECKOUT */}
            <div className="self-start sm:self-auto flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3 py-1.5 shadow-sm max-w-full">
              <Globe size={14} className="text-blue-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-500">Currency:</span>
              <select
                value={currency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="bg-transparent font-black text-xs sm:text-sm text-slate-900 outline-none cursor-pointer pr-1"
              >
                <option value="INR">🇮🇳 INR (₹)</option>
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="EUR">🇪🇺 EUR (€)</option>
                <option value="GBP">🇬🇧 GBP (£)</option>
                <option value="CAD">🇨🇦 CAD (C$)</option>
                <option value="AUD">🇦🇺 AUD (A$)</option>
              </select>
            </div>
          </div>

          {/* 🔥 MOBILE TOP ORDER SUMMARY DRAWER (Accessible on Mobile) */}
          <div className="lg:hidden mb-4 bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ShoppingBag size={15} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1 uppercase tracking-wide">
                    {mobileSummaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}
                    {mobileSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 truncate block">
                    {items.length} {items.length === 1 ? 'item' : 'items'} in order
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  {currencyLoading ? '...' : convertPrice(total)}
                </span>
              </div>
            </button>

            {mobileSummaryOpen && (
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-3">
                {/* Items List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size || ''}-${item.color || ''}`} className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/60">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">👟</div>
                        )}
                        <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Size: {item.size || 'Standard'} {item.color ? `• ${item.color}` : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-slate-900">
                          {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{currencyLoading ? '...' : convertPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span className="font-bold text-slate-900">
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-black">FREE</span>
                      ) : (
                        currencyLoading ? '...' : convertPrice(shipping)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{currencyLoading ? '...' : convertPrice(discount)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Tax</span>
                      <span className="font-bold text-slate-900">{currencyLoading ? '...' : convertPrice(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>{currencyLoading ? '...' : convertPrice(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 xl:gap-8 items-start w-full max-w-full min-w-0">
            {/* Left: Form Section */}
            <div className="lg:col-span-2 w-full max-w-full min-w-0">
              <div className="rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-7 md:p-8 shadow-sm border border-slate-200/80 w-full max-w-full min-w-0 overflow-hidden box-border">
                <div className="border-b border-slate-100 pb-3 mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                  <h2 className="text-xs sm:text-base font-black uppercase tracking-wider text-slate-900 break-words min-w-0">
                    Delivery & Contact Details
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500 truncate">
                    Delivering to: <span className="text-slate-900 font-black">{currentCountry.flag} {currentCountry.name}</span>
                  </span>
                </div>

                {/* 📍 Saved Address Quick Selector */}
                {savedAddresses.length > 0 && (
                  <div className="mb-5 p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <span>📍</span> Select Saved Residence ({savedAddresses.length})
                      </span>
                      <Link href="/account" className="text-[10px] font-bold text-slate-500 hover:text-black underline">
                        Manage in Account
                      </Link>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                      {savedAddresses.map((addr) => {
                        const isSelected = (selectedAddressId ? selectedAddressId === addr.id : addr.isDefault);
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              if (addr.zipCode || addr.zip) {
                                setPincode(addr.zipCode || addr.zip);
                                fetchLiveShipping(selectedCountry, addr.zipCode || addr.zip);
                              }
                            }}
                            className={`p-3 rounded-xl text-left border text-xs transition-all flex-shrink-0 cursor-pointer min-w-[190px] max-w-[240px] ${
                              isSelected
                                ? 'bg-black text-white border-black shadow-md'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold truncate">{addr.name || 'Resident'}</span>
                              {addr.isDefault && (
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {addr.street}
                            </p>
                            <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {addr.city}, {addr.zip || addr.zipCode}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(() => {
                  const activeAddress = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;
                  return (
                    <CheckoutForm
                      key={activeAddress?.id || 'manual-entry'}
                      onSubmit={handleSubmit}
                      isLoading={isProcessing}
                      initialValues={{
                        firstName: activeAddress?.firstName || userFirstName,
                        lastName: activeAddress?.lastName || userLastName,
                        email: userEmail,
                        phone: activeAddress?.phone || '',
                        address: activeAddress?.street || '',
                        apartment: activeAddress?.apartment || '',
                        city: activeAddress?.city || '',
                        state: activeAddress?.state || '',
                        zipCode: activeAddress?.zipCode || activeAddress?.zip || '',
                        country: selectedCountry,
                      }}
                      selectedCountry={selectedCountry}
                      onCountryChange={(code) => {
                        setSelectedCountry(code);
                        fetchLiveShipping(code, pincode);
                      }}
                      shippingMethod={shippingMethod}
                      onShippingMethodChange={(method) => setShippingMethod(method)}
                      shippingResult={shippingCalc}
                      standardFeeInr={standardFeeInr}
                      expressFeeInr={expressFeeInr}
                      onPincodeChange={(pin) => {
                        setPincode(pin);
                        fetchLiveShipping(selectedCountry, pin);
                      }}
                    />
                  );
                })()}
              </div>
            </div>

            {/* Right: Sticky Summary & Coupon Section */}
            <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-24 w-full max-w-full min-w-0">
              {/* THE COUPON CARD */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm border border-slate-200/80 w-full max-w-full min-w-0 box-border">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                  🏷️ Apply Coupon Code
                </h3>

                {!appliedCoupon ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="e.g. SHOE10 / FREE"
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-slate-900 focus:bg-white uppercase tracking-wider transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs font-bold text-red-500 mt-2 pl-1">❌ {couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-600 text-white font-black px-2 py-0.5 rounded-md tracking-wider">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">Applied!</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs font-black text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500">Savings:</span>
                      <span className="text-xs font-black text-emerald-600">
                        -{currencyLoading ? '...' : convertPrice(discount)}
                      </span>
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
                taxRate={taxRate}
                total={total}
                couponDiscount={discount}
                destinationCountryName={currentCountry.name}
                destinationCountryFlag={currentCountry.flag}
                shippingServiceName={
                  shippingMethod === 'express'
                    ? 'Priority Air Express'
                    : (liveRates?.recommendedCourier?.courierName || shippingCalc.serviceName)
                }
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}