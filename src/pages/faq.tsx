import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
// 🔥 Premium Icons
import {
  Search, Zap, Package, RefreshCw, ChevronDown,
  MessageCircle, HelpCircle, PhoneCall, Info
} from 'lucide-react';

import type { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';
import { DEFAULT_FAQS } from './api/faq';

const getCategoryIcon = (iconOrCat: string) => {
  const lower = (iconOrCat || '').toLowerCase();
  if (lower.includes('package') || lower.includes('shipping') || lower.includes('order')) {
    return <Package size={20} />;
  }
  if (lower.includes('refresh') || lower.includes('return') || lower.includes('exchange')) {
    return <RefreshCw size={20} />;
  }
  if (lower.includes('info') || lower.includes('product') || lower.includes('sizing')) {
    return <Info size={20} />;
  }
  return <HelpCircle size={20} />;
};

interface FAQProps {
  initialFaqs?: Array<{
    category: string;
    iconName?: string;
    questions: Array<{ q: string; a: string }>;
  }>;
}

export default function FAQ({ initialFaqs }: FAQProps) {
  const faqs = (initialFaqs && initialFaqs.length > 0) ? initialFaqs : DEFAULT_FAQS;
  const [activeCategory, setActiveCategory] = useState(0);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Smart Filtering Logic
  const filteredFaqs = searchQuery
    ? faqs.map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.questions.length > 0)
    : [faqs[Math.min(activeCategory, Math.max(0, faqs.length - 1))]];


  return (
    <Layout>
      <Head>
        <title>Help Center & FAQ - ShoeStyle Premium</title>
        <meta name="description" content="Find answers to common questions about orders, shipping, returns, and more." />
      </Head>

      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20 selection:bg-blue-500 selection:text-white">

        {/* 🔥 Premium Hero & Search Section */}
        <section className="relative pt-32 pb-24 overflow-hidden bg-white border-b border-gray-100">
          <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8 shadow-sm text-sm font-bold text-blue-600 uppercase tracking-widest">
                <HelpCircle size={16} /> Help Center
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gray-900">
                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">help you?</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium">
                Search our knowledge base or browse categories below to find quick answers.
              </p>

              {/* Premium Spotlight Search */}
              <div className="max-w-2xl mx-auto relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={22} />
                </div>
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white rounded-full text-gray-900 text-lg font-bold placeholder-gray-400 border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Quick Features Cards */}
        <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={28} className="text-amber-500" />, title: 'Instant Answers', desc: '24/7 AI & Human Support' },
              { icon: <Package size={28} className="text-emerald-500" />, title: 'Order Tracking', desc: 'Real-time GPS updates' },
              { icon: <RefreshCw size={28} className="text-blue-500" />, title: 'Easy Returns', desc: 'Hassle-free 30-day policy' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 hover:-translate-y-1 transition-transform"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{item.title}</h3>
                  <p className="text-sm font-medium text-gray-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🔥 FAQ Content Section */}
        <section className="max-w-4xl mx-auto px-4 py-24">

          {/* iOS-Style Category Tabs (Hidden if searching) */}
          {!searchQuery && (
            <div className="flex flex-wrap justify-center p-1.5 bg-white border border-gray-200 rounded-2xl mb-12 shadow-sm">
              {faqs.map((cat, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveCategory(index);
                    setOpenQuestion(null); // Reset open question on category change
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeCategory === index
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {getCategoryIcon((cat as any).iconName || cat.category)} {cat.category}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Accordions */}
          <div className="space-y-10">
            {filteredFaqs.map((category, catIndex) => (
              <div key={catIndex}>
                {searchQuery && <h2 className="text-2xl font-black mb-6 text-gray-900 border-b border-gray-200 pb-4">{category.category}</h2>}

                <div className="space-y-4">
                  {category.questions.map((faq, index) => {
                    const questionId = catIndex * 100 + index;
                    const isOpen = openQuestion === questionId;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-2xl border transition-all duration-300 ${isOpen ? 'border-blue-500 shadow-[0_8px_30px_rgba(59,130,246,0.12)]' : 'border-gray-200 hover:border-gray-300 shadow-sm'}`}
                      >
                        <button
                          onClick={() => setOpenQuestion(isOpen ? null : questionId)}
                          className="w-full px-6 py-5 text-left flex justify-between items-center outline-none"
                        >
                          <span className={`font-bold text-lg pr-4 transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-900'}`}>
                            {faq.q}
                          </span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                              <ChevronDown size={20} />
                            </motion.div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 pt-2 text-gray-600 font-medium leading-relaxed border-t border-gray-50 mx-6">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Empty Search State */}
          {searchQuery && filteredFaqs.every(cat => cat.questions.length === 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 font-medium">We couldn't find any articles matching "{searchQuery}". Try different keywords.</p>
              <button onClick={() => setSearchQuery('')} className="mt-6 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full font-bold transition-colors">
                Clear Search
              </button>
            </motion.div>
          )}
        </section>

        {/* 🔥 Premium Dark CTA Section */}
        <section className="max-w-7xl mx-auto px-4 mb-10">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-2xl relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center shrink-0 border border-white/10">
                <PhoneCall size={32} />
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-2">Can't find what you're looking for?</h3>
                <p className="text-gray-400 text-lg font-medium">Our premium support team is available 24/7 to assist you instantly.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 relative z-10 mt-6 md:mt-0">
              <button
                onClick={() => window.dispatchEvent(new Event('open-live-chat'))}
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-black text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-lg hover:scale-105"
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'faq_data' },
    });

    let faqs = DEFAULT_FAQS;
    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          faqs = parsed;
        }
      } catch {}
    } else {
      // Seed default FAQs into database setting if not present
      await prisma.setting.upsert({
        where: { key: 'faq_data' },
        create: {
          key: 'faq_data',
          value: JSON.stringify(DEFAULT_FAQS),
          type: 'json',
          category: 'content',
          description: 'Help Center & Frequently Asked Questions',
          isPublic: true,
        },
        update: {},
      }).catch(() => null);
    }

    return {
      props: {
        initialFaqs: faqs,
      },
    };
  } catch (error) {
    console.error('FAQ getServerSideProps error:', error);
    return {
      props: {
        initialFaqs: DEFAULT_FAQS,
      },
    };
  }
};