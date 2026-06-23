import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
// 🔥 Premium Icons
import {
  RotateCcw, CalendarClock, Truck, Zap, CheckCircle2,
  XCircle, ArrowRight, Printer, Package, CreditCard,
  MessageCircle, HelpCircle, Search
} from 'lucide-react';

export default function Returns() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReturnRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setOrderNumber('');
        setEmail('');
      }, 5000);
    }, 1500);
  };

  return (
    <Layout>
      <Head>
        <title>Returns & Exchanges - ShoeStyle Premium</title>
        <meta name="description" content="Hassle-free returns and exchanges. 30-day return policy with free return shipping." />
      </Head>

      {/* 🔥 ULTRA-CLEAN LIGHT MODE */}
      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20 selection:bg-orange-500 selection:text-white">

        {/* 🔥 Hero Section - Minimalist White */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-100">
          {/* Subtle soft blobs for background depth */}
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center justify-center p-4 bg-gray-50 border border-gray-100 rounded-full mb-8 shadow-sm">
                <RotateCcw size={32} className="text-orange-500" />
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase text-gray-900">
                Returns <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">& Exchanges</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto">
                Not the perfect fit? We've got you covered with our hassle-free 30-day return policy.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Features - Soft Shadow Cards */}
        <section className="max-w-7xl mx-auto px-4 py-20 relative z-20 -mt-10">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <CalendarClock size={32} />, title: '30-Day Returns', desc: 'Full refund within 30 days of delivery', bg: 'bg-blue-50', color: 'text-blue-600' },
              { icon: <Truck size={32} />, title: 'Free Shipping', desc: 'Prepaid return labels included', bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { icon: <Zap size={32} />, title: 'Lightning Refunds', desc: 'Processed instantly upon receipt', bg: 'bg-amber-50', color: 'text-amber-600' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className={`mb-6 p-4 rounded-2xl inline-block ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-2xl mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🔥 The Policy - Clean & Crisp */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Accept */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2rem] border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full" />
              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">We Accept</h3>
              </div>
              <ul className="space-y-6 relative z-10">
                {[
                  'Items returned within 30 days of delivery',
                  'Unworn shoes with original tags attached',
                  'Original packaging and box included',
                  'Items in new, resalable condition'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-600 text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Reject */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2rem] border border-red-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full" />
              <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle size={28} className="text-red-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900">We Don't Accept</h3>
              </div>
              <ul className="space-y-6 relative z-10">
                {[
                  'Items returned after 30 days',
                  'Worn, altered, or damaged shoes',
                  'Items without original tags or box',
                  'Final sale or clearance items'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <XCircle size={24} className="text-red-400 flex-shrink-0" />
                    <span className="text-gray-600 text-lg font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* 🔥 How to Return Process */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black tracking-[0.3em] text-orange-600 uppercase mb-4">Simple Steps</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900">The Process</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Background connecting line for desktop */}
            <div className="hidden md:block absolute top-[40px] left-[12%] right-[12%] h-[2px] bg-gray-200 -z-10" />

            {[
              { step: '01', title: 'Request', desc: 'Enter order details below', icon: <Search size={28} /> },
              { step: '02', title: 'Print Label', desc: 'Download free shipping label', icon: <Printer size={28} /> },
              { step: '03', title: 'Pack & Ship', desc: 'Drop off at any courier', icon: <Package size={28} /> },
              { step: '04', title: 'Refund', desc: 'Money back in 3 days', icon: <CreditCard size={28} /> }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center group hover:border-orange-200 transition-colors"
              >
                <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-900 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors border-4 border-white shadow-sm">
                  {item.icon}
                </div>
                <div className="text-xs font-black text-gray-400 mb-2 tracking-widest uppercase">Step {item.step}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🔥 Interactive Return Form - Premium White Form */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative overflow-hidden">

            <div className="relative z-10 text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">Start Your Return</h2>
              <p className="text-gray-500 text-lg">Enter your order details to fetch your items.</p>
            </div>

            <div className="relative z-10 min-h-[220px]">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleReturnRequest}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-600 block">Order Number</label>
                        <input
                          type="text"
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                          required
                          placeholder="#10245"
                          className="w-full bg-gray-50 border-2 border-transparent text-gray-900 px-6 py-4 text-lg rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-gray-600 block">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="john@example.com"
                          className="w-full bg-gray-50 border-2 border-transparent text-gray-900 px-6 py-4 text-lg rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="pt-8 text-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-3 bg-gray-900 text-white px-12 py-5 rounded-full font-black text-lg hover:bg-black transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                        {isLoading ? (
                          <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>Locate Order <ArrowRight size={20} /></>
                        )}
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center h-full"
                  >
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-3">Request Verified!</h3>
                    <p className="text-gray-500 text-lg">Your return label has been generated. Check your email for the next steps.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 🔥 Contact Support CTA - Contrasting Dark Footer */}
        <section className="max-w-7xl mx-auto px-4 mt-8 mb-10">
          <div className="bg-gray-900 rounded-[2.5rem] p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-2xl relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center shrink-0 border border-white/10">
                <HelpCircle size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-2">Still Need Help?</h3>
                <p className="text-gray-400 text-lg font-medium">Our premium support team is available 24/7 to assist you instantly.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 relative z-10">
              <button
                onClick={() => window.dispatchEvent(new Event('open-live-chat'))}
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-black text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 hover:scale-105"
              >
                <MessageCircle size={22} /> Live Chat
              </button>
              <a href="/contact" className="px-8 py-4 bg-transparent border-2 border-white/20 hover:border-white text-white rounded-full font-black text-lg transition-colors text-center">
                Contact Us
              </a>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}