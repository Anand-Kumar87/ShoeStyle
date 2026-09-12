import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
// 🔥 Premium Icons
import {
  PackageSearch, Truck, Zap, Rocket, Globe, FileCheck,
  CheckCircle2, MapPin, Clock, ArrowRight, Search, Box
} from 'lucide-react';
// 🔥 Currency Hook for dynamic shipping costs
import { useGlobalCurrency } from '@/context/CurrencyContext';
import type { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';

interface ShippingProps {
  freeShippingThreshold?: number;
  standardRate?: number;
  expressRate?: number;
  overnightRate?: number;
}

export default function Shipping({
  freeShippingThreshold = 1500,
  standardRate = 99,
  expressRate = 199,
  overnightRate = 299,
}: ShippingProps) {
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();


  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackError, setTrackError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsTracking(true);
    setTrackingResult(null);
    setTrackError('');

    try {
      const res = await fetch(`/api/orders/track?number=${encodeURIComponent(trackingNumber.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTrackingResult(data);
      } else {
        setTrackError(data.message || 'No order found with this tracking reference. Please check your Order ID.');
      }
    } catch {
      setTrackError('Failed to connect to tracking server. Please try again.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Shipping Information - ShoeStyle Premium</title>
        <meta name="description" content="Learn about our shipping options, delivery times, and rates." />
      </Head>

      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20 selection:bg-emerald-500 selection:text-white">

        {/* 🔥 Premium Minimalist Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-100">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center justify-center p-4 bg-emerald-50 border border-emerald-100 rounded-full mb-8 shadow-sm">
                <PackageSearch size={32} className="text-emerald-500" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gray-900">
                Shipping <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Information</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto">
                Fast, secure, and reliable delivery to your doorstep. Track your journey every step of the way.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Free Shipping Banner */}
        <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-800"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <Truck size={24} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wide text-emerald-400">Free Standard Shipping</h2>
                <p className="text-gray-300 font-medium">
                  On all domestic orders over <span className="text-white font-bold">{currencyLoading ? '...' : convertPrice(freeShippingThreshold)}</span>
                </p>
              </div>
            </div>
            <div className="px-6 py-3 bg-white/10 rounded-full font-bold text-sm tracking-widest uppercase border border-white/20">
              Auto-applied at checkout
            </div>
          </motion.div>
        </section>

        {/* 🔥 Shipping Options - Dynamic Pricing */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black tracking-[0.2em] text-emerald-600 uppercase mb-3">Delivery Speeds</h2>
            <h3 className="text-4xl font-black text-gray-900">Shipping Options</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Standard Delivery',
                time: '3-5 Business Days',
                cost: `FREE over ${convertPrice(freeShippingThreshold)}`,
                subCost: `Otherwise ${convertPrice(standardRate)}`,
                icon: <Truck size={32} />,
                features: ['Full Tracking included', 'Signature not required', 'Eco-friendly packaging'],
                popular: false,
                bg: 'bg-blue-50', color: 'text-blue-600'
              },
              {
                name: 'Express Delivery',
                time: '1-2 Business Days',
                cost: convertPrice(expressRate),
                subCost: 'Flat rate nationwide',
                icon: <Zap size={32} />,
                features: ['Priority order handling', 'Full Tracking included', 'Signature required'],
                popular: true,
                bg: 'bg-emerald-50', color: 'text-emerald-600'
              },
              {
                name: 'Overnight Priority',
                time: 'Next Business Day',
                cost: convertPrice(overnightRate),
                subCost: 'Order before 2 PM',
                icon: <Rocket size={32} />,
                features: ['Fastest option available', 'Real-time GPS tracking', 'Secure hand-delivery'],
                popular: false,
                bg: 'bg-amber-50', color: 'text-amber-600'
              }
            ].map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all duration-300 hover:-translate-y-2 ${option.popular ? 'border-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.15)] ring-4 ring-emerald-500/10' : 'border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
                  }`}
              >
                {option.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest uppercase shadow-md">
                    Most Popular
                  </div>
                )}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${option.bg} ${option.color}`}>
                  {option.icon}
                </div>
                <h3 className="text-2xl font-black mb-2 text-gray-900">{option.name}</h3>
                <p className="text-gray-500 font-bold mb-6 flex items-center gap-2">
                  <Clock size={16} /> {option.time}
                </p>

                <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-2xl font-black text-gray-900">{currencyLoading ? '...' : option.cost}</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">{currencyLoading ? '...' : option.subCost}</p>
                </div>

                <ul className="space-y-4">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className={option.color} />
                      <span className="text-gray-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🔥 Interactive Order Tracker Section */}
        <section className="bg-gray-900 py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
          <div className="max-w-4xl mx-auto px-4 relative z-10">

            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Track Your Order</h2>
              <p className="text-xl text-gray-400">Enter your tracking number for real-time delivery updates.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl">
              <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter Tracking Number (e.g. TRK12345)"
                    className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl text-gray-900 text-lg font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTracking || !trackingNumber.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all disabled:opacity-50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  {isTracking ? (
                    <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    'Track Package'
                  )}
                </button>
              </form>

              {trackError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3">
                  <span>❌</span>
                  <span>{trackError}</span>
                </div>
              )}

              {/* Live Tracking Result */}
              <AnimatePresence mode="wait">
                {trackingResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    className="bg-white rounded-3xl p-8 shadow-inner overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-8 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <h3 className="text-3xl font-black text-emerald-500">{trackingResult.status}</h3>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                        <h3 className="text-2xl font-bold text-gray-900">{trackingResult.estimatedDelivery}</h3>
                      </div>
                    </div>

                    <div className="relative">
                      {/* Vertical line connecting steps */}
                      <div className="absolute left-6 top-6 bottom-6 w-1 bg-gray-100 rounded-full" />

                      <div className="space-y-8 relative">
                        {trackingResult.steps.map((step: any, idx: number) => (
                          <div key={idx} className="flex gap-6 items-start">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${step.done ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-300'}`}>
                              {step.done ? <CheckCircle2 size={20} /> : <Box size={20} />}
                            </div>
                            <div className="pt-2 flex-1">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                                <h4 className={`text-lg font-black ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h4>
                                <span className="text-sm font-bold text-gray-400">{step.time}</span>
                              </div>
                              <p className={`font-medium ${step.done ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 🔥 International & Customs - Split Layout */}
        <section className="max-w-7xl mx-auto px-4 py-24 border-b border-gray-100">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe size={32} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-gray-900">Worldwide Delivery</h3>
              <p className="text-gray-500 font-medium mb-8 text-lg">
                We proudly ship to over 100 countries. Delivery times vary by region.
              </p>

              <div className="space-y-4">
                {[
                  { region: 'Canada & Mexico', time: '7-10 Business Days' },
                  { region: 'Europe', time: '10-14 Business Days' },
                  { region: 'Asia & Pacific', time: '12-18 Business Days' },
                  { region: 'Rest of World', time: '14-21 Business Days' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-bold text-gray-900">{item.region}</span>
                    <span className="text-blue-600 font-bold">{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <FileCheck size={32} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-gray-900">Customs & Duties</h3>
              <p className="text-gray-500 font-medium mb-8 text-lg">
                International orders may be subject to customs duties and taxes upon arrival.
              </p>

              <ul className="space-y-5">
                {[
                  'All packages include official customs documentation',
                  'Duties and taxes are calculated directly at checkout',
                  'No hidden fees upon delivery for DDP supported countries',
                  'Full tracking available across borders'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 size={24} className="text-amber-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Shipping FAQs */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black tracking-[0.2em] text-gray-400 uppercase mb-3">Got Questions?</h2>
            <h3 className="text-4xl font-black text-gray-900">Shipping FAQs</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { q: 'Can I change my shipping address?', a: 'Yes, please contact our support team within 2 hours of placing your order to redirect the package.' },
              { q: 'Do you ship to PO boxes?', a: 'Yes, we can ship to PO boxes using Standard Shipping only. Express options require a physical address.' },
              { q: 'What if my package gets lost?', a: 'All shipments are fully insured. Contact us immediately and we will dispatch a replacement right away.' },
              { q: 'Can I pick up my order in-store?', a: 'Absolutely! Select "Store Pickup" at checkout for free same-day collection at any of our flagship locations.' }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <h3 className="font-black text-xl mb-3 text-gray-900">{faq.q}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const storeSettings = await prisma.storeSettings.findFirst();
    const settingRows = await prisma.setting.findMany({
      where: {
        key: { in: ['shipping_standard_rate', 'shipping_express_rate', 'shipping_overnight_rate'] }
      }
    });
    const settingMap = settingRows.reduce((acc, r) => {
      acc[r.key] = parseFloat(r.value);
      return acc;
    }, {} as Record<string, number>);

    const expressZone = await prisma.shippingZone.findFirst({
      where: { name: { contains: 'Express', mode: 'insensitive' }, isActive: true },
    });
    const overnightZone = await prisma.shippingZone.findFirst({
      where: { name: { contains: 'Overnight', mode: 'insensitive' }, isActive: true },
    });

    const freeShippingThreshold = storeSettings?.freeShippingAmount ?? 1500;
    const standardRate = settingMap['shipping_standard_rate'] ?? 99;
    const expressRate = settingMap['shipping_express_rate'] ?? (expressZone?.baseCost && expressZone.baseCost > 30 ? expressZone.baseCost : 199);
    const overnightRate = settingMap['shipping_overnight_rate'] ?? (overnightZone?.baseCost && overnightZone.baseCost > 30 ? overnightZone.baseCost : 299);

    return {
      props: {
        freeShippingThreshold,
        standardRate,
        expressRate,
        overnightRate,
      },
    };
  } catch (err) {
    console.error('Shipping getServerSideProps error:', err);
    return {
      props: {
        freeShippingThreshold: 1500,
        standardRate: 99,
        expressRate: 199,
        overnightRate: 299,
      },
    };
  }
};