'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ShieldCheck, ChevronRight, Building2, Wallet, LockKeyhole } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalCurrency } from '@/context/CurrencyContext';

export default function PaymentSelectionPage() {
    const router = useRouter();
    const { orderId } = router.query;
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [banks, setBankDetails] = useState<any[]>([]);

    const { convertPrice, loading: currencyLoading, currency } = useGlobalCurrency();

    // Fetch Order & Bank Details
    useEffect(() => {
        if (orderId) {
            fetch(`/api/orders/${orderId}`)
                .then(res => res.json())
                .then(data => setOrderDetails(data))
                .catch(err => console.error("Error fetching order:", err));

            fetch('/api/settings/bank')
                .then(res => res.ok ? res.json() : [])
                .then(data => setBankDetails(Array.isArray(data) ? data : []))
                .catch(() => setBankDetails([]));
        }
    }, [orderId]);

    const paymentMethods = [
        { id: 'upi', name: 'UPI / GPay / PhonePe', desc: 'Instant secure payment via Razorpay', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg', isImage: true },
        { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex via Stripe', logos: ['https://api.iconify.design/logos:visa.svg', 'https://api.iconify.design/logos:mastercard.svg', 'https://api.iconify.design/logos:amex.svg'], isMultiple: true },
        { id: 'applepay', name: 'Apple Pay', desc: 'Fast and secure 1-click checkout', logo: 'https://api.iconify.design/logos:apple-pay.svg', isImage: true },
        { id: 'bank', name: 'Direct Bank Transfer', desc: 'NEFT/IMPS. Order shipped after clearance', icon: Building2, isImage: false },
        { id: 'cod', name: 'Cash on Delivery', desc: 'Pay safely when you receive the order', icon: Wallet, isImage: false },
    ];

    const handlePayment = async () => {
        if (!selectedMethod || !orderId) return;
        setIsProcessing(true);

        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethod: selectedMethod })
            });

            // 1. STRIPE (Card / Apple Pay)
            if (selectedMethod === 'card' || selectedMethod === 'applepay') {
                const stripeResponse = await fetch('/api/checkout/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: orderDetails?.total || 0, // Base USD
                        orderId,
                        currency
                    })
                });
                const stripeData = await stripeResponse.json();
                if (stripeData.url) window.location.href = stripeData.url;

                // 2. RAZORPAY (UPI)
            } else if (selectedMethod === 'upi') {
                const rzpResponse = await fetch('/api/checkout/razorpay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: orderDetails?.total || 0, // Base USD
                        orderId
                    })
                });

                if (!rzpResponse.ok) throw new Error('Razorpay setup failed');

                const rzpData = await rzpResponse.json();
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                    amount: rzpData.amount,
                    currency: "INR",
                    name: "ShoeStyle Premium",
                    order_id: rzpData.id,
                    handler: function (response: any) {
                        router.push(`/checkout/success?orderId=${orderId}&payment_id=${response.razorpay_payment_id}&method=upi`);
                    },
                    theme: { color: "#0f172a" }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();

                // 3. BANK TRANSFER & COD
            } else if (selectedMethod === 'bank') {
                router.push(`/checkout/success?orderId=${orderId}&method=bank&status=awaiting_payment`);
            } else if (selectedMethod === 'cod') {
                router.push(`/checkout/success?orderId=${orderId}&method=cod`);
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            alert(`Error: ${error.message}`);
            setIsProcessing(false);
        }
    };

    if (!orderId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-slate-600 tracking-wider uppercase text-sm">Initializing Secure Portal...</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Secure Checkout | ShoeStyle Premium</title>
            </Head>

            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <Header />

            <main className="min-h-screen bg-[#F4F7FB] py-10 lg:py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-center gap-2 mb-8 bg-emerald-50 w-max mx-auto px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                        <LockKeyhole size={16} className="text-emerald-600" strokeWidth={2.5} />
                        <span className="font-black tracking-[0.15em] uppercase text-[10px] text-emerald-700">SSL Secure Checkout</span>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black p-10 sm:p-12 text-white text-center relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]"></div>

                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-4 relative z-10">Amount to Pay</p>

                            <h1 className="text-5xl sm:text-7xl font-black relative z-10 tracking-tight text-white drop-shadow-xl">
                                {currencyLoading || !orderDetails ? '...' : convertPrice(orderDetails.total)}
                            </h1>

                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full mt-6 relative z-10 border border-white/5 shadow-inner">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <p className="text-slate-200 text-xs font-bold tracking-widest uppercase">Order #{String(orderId).substring(0, 8)}</p>
                            </div>
                        </div>

                        <div className="p-6 sm:p-10">
                            <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-6 uppercase tracking-widest text-center sm:text-left">Select Payment Method</h2>

                            <div className="space-y-4">
                                {paymentMethods.map((method) => {
                                    const isSelected = selectedMethod === method.id;
                                    const IconComponent = method.icon;

                                    return (
                                        <motion.div
                                            key={method.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => setSelectedMethod(method.id)}
                                            className={`cursor-pointer flex flex-col p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                                                ? 'border-blue-600 bg-blue-50/40 shadow-lg shadow-blue-600/10 ring-4 ring-blue-50'
                                                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:bg-slate-50/50'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`flex items-center justify-center min-w-[64px] h-12 rounded-xl transition-all duration-300 flex-shrink-0 ${isSelected ? 'bg-white shadow-sm ring-1 ring-blue-100' : 'bg-transparent'} px-3`}>
                                                    {method.isMultiple ? (
                                                        <div className="flex items-center justify-center gap-2 w-full h-full">
                                                            {method.logos?.map((logo, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={logo}
                                                                    alt="Card Logo"
                                                                    className={`h-5 w-auto object-contain transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : method.isImage ? (
                                                        <img
                                                            src={method.logo}
                                                            alt={method.name}
                                                            className={`h-6 w-auto object-contain transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                                                        />
                                                    ) : (
                                                        IconComponent && <IconComponent size={24} className={`transition-colors duration-300 ${isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={2} />
                                                    )}
                                                </div>

                                                <div className="ml-5 flex-1">
                                                    <h3 className={`font-black text-[16px] sm:text-[17px] ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{method.name}</h3>
                                                    <p className={`text-[12px] sm:text-[13px] font-bold mt-0.5 ${isSelected ? 'text-blue-600/80' : 'text-slate-500'}`}>{method.desc}</p>
                                                </div>

                                                <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm ${isSelected ? 'border-blue-600 bg-blue-600 scale-110' : 'border-slate-300 bg-slate-50'
                                                    }`}>
                                                    <motion.div
                                                        initial={false}
                                                        animate={{ scale: isSelected ? 1 : 0 }}
                                                        className="w-2 h-2 rounded-full bg-white"
                                                    />
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isSelected && method.id === 'bank' && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "circOut" }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-5 pt-5 border-t border-blue-100 flex flex-col gap-4">
                                                            {banks.length > 0 ? banks.map((bank, i) => (
                                                                <div key={i} className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
                                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                                                    <div className="flex items-center justify-between mb-5">
                                                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Bank Account {i + 1}</h4>
                                                                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-black tracking-widest px-2.5 py-1 rounded-md uppercase">Official</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                                                        <div>
                                                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Account Name</p>
                                                                            <p className="font-black text-slate-900">{bank.accountName}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Account Number</p>
                                                                            <p className="font-black text-blue-600 font-mono tracking-wider">{bank.accountNumber}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Bank Name</p>
                                                                            <p className="font-black text-slate-900">{bank.bankName}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">IFSC Code</p>
                                                                            <p className="font-black text-slate-900 font-mono tracking-wider">{bank.ifscCode}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )) : (
                                                                <p className="text-sm text-slate-500 italic">No bank details configured.</p>
                                                            )}

                                                            <div className="mt-2 bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                                                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                                                                <p className="text-[13px] text-amber-900 leading-relaxed font-semibold">
                                                                    Please transfer exactly <span className="font-black">({currencyLoading || !orderDetails ? '...' : convertPrice(orderDetails.total)})</span> to any of our accounts. Your order stays <span className="uppercase font-black text-amber-600 bg-amber-100 px-1 rounded">Pending</span> until verification.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="mt-10">
                                <button
                                    onClick={handlePayment}
                                    disabled={!selectedMethod || isProcessing}
                                    className={`w-full flex items-center justify-center gap-3 py-4 min-h-[64px] rounded-2xl font-black text-[16px] uppercase tracking-[0.15em] transition-all duration-300 ${!selectedMethod
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        : 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30 hover:bg-black hover:shadow-slate-900/50 hover:-translate-y-1'
                                        }`}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <>
                                            {selectedMethod === 'cod' || selectedMethod === 'bank' ? 'Confirm Order' : 'Proceed to Secure Pay'} <ChevronRight size={22} strokeWidth={3} />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[11px] font-black uppercase tracking-widest text-slate-400 mt-5 flex items-center justify-center gap-1.5">
                                    <ShieldCheck size={14} /> Encrypted & Secure Checkout
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}