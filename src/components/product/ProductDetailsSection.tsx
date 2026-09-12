import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, ShieldCheck, Truck, RotateCcw,
  Sparkles, Layers, Info, ChevronDown
} from 'lucide-react';

interface ProductDetailsSectionProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    brand?: string | null;
    category?: string | null;
    colors?: string[];
    sizes?: string[];
    stock?: number;
    isSale?: boolean;
  };
}

export default function ProductDetailsSection({ product }: ProductDetailsSectionProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'specs' | 'shipping'>('about');

  const specifications = [
    { label: 'Brand / Maker', value: product.brand || 'ShoeStyle Premium' },
    { label: 'Model Name', value: product.name },
    { label: 'Category', value: (product.category || 'Footwear').toUpperCase() },
    { label: 'Available Sizes', value: product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') + ' (UK)' : 'Standard UK Sizing' },
    { label: 'Available Colors', value: product.colors && product.colors.length > 0 ? product.colors.join(', ') : 'Standard Edition' },
    { label: 'Availability', value: (product.stock ?? 1) > 0 ? 'In Stock (Ready to Dispatch)' : 'Sold Out' },
    { label: 'Authenticity', value: '100% Genuine & Verified Merchandise' },
    { label: 'Origin', value: 'Imported Quality Craftsmanship' },
  ];

  const assurances = [
    {
      icon: Truck,
      title: 'Express Delivery',
      desc: 'Dispatched within 24 hours. Delivered in 3-5 business days across India.',
      color: 'text-blue-500 bg-blue-50',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      desc: 'Hassle-free size exchange and returns if unworn with original packaging.',
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      icon: ShieldCheck,
      title: '100% Authentic Guarantee',
      desc: 'Every pair is verified for premium build quality, comfort, and authenticity.',
      color: 'text-purple-500 bg-purple-50',
    },
    {
      icon: Sparkles,
      title: 'Cash On Delivery & Razorpay',
      desc: 'Pay securely via UPI, Cards, NetBanking, or COD at your doorstep.',
      color: 'text-amber-500 bg-amber-50',
    },
  ];

  return (
    <section className="bg-white border-t border-slate-100 pt-3 pb-8 sm:py-14 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 block mb-1">
              Overview & Specifications
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
              Product Details
            </h3>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: 'about', label: 'Story & Description', icon: FileText },
              { id: 'specs', label: 'Specifications', icon: Layers },
              { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-black text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-[#fafafa] rounded-3xl p-6 sm:p-8 border border-slate-100 min-h-[160px]">
          <AnimatePresence mode="wait">

            {/* TAB 1: ABOUT */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    ★
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-slate-900">{product.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">Crafted for everyday comfort and athletic performance</p>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                  {product.description ||
                    `${product.name} delivers modern silhouette with cloud-soft cushioning. Built with high-grade breathable uppers and durable grip outsoles, engineered to accompany you through long walks, gym workouts, and casual streetwear flexing.`}
                </p>

                {/* Micro tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700">
                    ✔ Breathable Mesh Upper
                  </span>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700">
                    ✔ High-Traction Grip Sole
                  </span>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700">
                    ✔ Ergonomic Arch Support
                  </span>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700">
                    ✔ All-Day Wearable
                  </span>
                </div>
              </motion.div>
            )}

            {/* TAB 2: SPECIFICATIONS */}
            {activeTab === 'specs' && (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {specifications.map((spec, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-xs"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {spec.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 text-right">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 3: SHIPPING & RETURNS */}
            {activeTab === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {assurances.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 flex items-start gap-4 shadow-xs">
                      <div className={`p-2.5 rounded-xl ${item.color} flex-shrink-0`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
                          {item.title}
                        </h5>
                        <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* 4 Trust Badges Grid (Always visible for quick reassurance) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {assurances.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3"
              >
                <div className={`p-2 rounded-xl ${item.color} flex-shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-slate-900 truncate uppercase">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    Verified ShoeStyle Guarantee
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
