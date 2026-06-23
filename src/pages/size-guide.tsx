import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
// 🔥 Premium Icons
import {
  Ruler, Footprints, Info, Clock, CheckCircle2, ArrowRight,
  MessageCircle, HelpCircle, Expand, SplitSquareHorizontal, MoveHorizontal
} from 'lucide-react';

const sizeCharts = {
  men: [
    { us: '6', uk: '5.5', eu: '39', cm: '24' },
    { us: '6.5', uk: '6', eu: '39.5', cm: '24.5' },
    { us: '7', uk: '6.5', eu: '40', cm: '25' },
    { us: '7.5', uk: '7', eu: '40.5', cm: '25.5' },
    { us: '8', uk: '7.5', eu: '41', cm: '26' },
    { us: '8.5', uk: '8', eu: '42', cm: '26.5' },
    { us: '9', uk: '8.5', eu: '42.5', cm: '27' },
    { us: '9.5', uk: '9', eu: '43', cm: '27.5' },
    { us: '10', uk: '9.5', eu: '44', cm: '28' },
    { us: '10.5', uk: '10', eu: '44.5', cm: '28.5' },
    { us: '11', uk: '10.5', eu: '45', cm: '29' },
    { us: '11.5', uk: '11', eu: '45.5', cm: '29.5' },
    { us: '12', uk: '11.5', eu: '46', cm: '30' },
    { us: '13', uk: '12.5', eu: '47', cm: '31' },
    { us: '14', uk: '13.5', eu: '48', cm: '32' }
  ],
  women: [
    { us: '5', uk: '3', eu: '35.5', cm: '22' },
    { us: '5.5', uk: '3.5', eu: '36', cm: '22.5' },
    { us: '6', uk: '4', eu: '36.5', cm: '23' },
    { us: '6.5', uk: '4.5', eu: '37', cm: '23.5' },
    { us: '7', uk: '5', eu: '37.5', cm: '24' },
    { us: '7.5', uk: '5.5', eu: '38', cm: '24.5' },
    { us: '8', uk: '6', eu: '38.5', cm: '25' },
    { us: '8.5', uk: '6.5', eu: '39', cm: '25.5' },
    { us: '9', uk: '7', eu: '40', cm: '26' },
    { us: '9.5', uk: '7.5', eu: '40.5', cm: '26.5' },
    { us: '10', uk: '8', eu: '41', cm: '27' },
    { us: '10.5', uk: '8.5', eu: '42', cm: '27.5' },
    { us: '11', uk: '9', eu: '42.5', cm: '28' },
    { us: '12', uk: '10', eu: '43', cm: '29' }
  ],
  kids: [
    { us: '10C', uk: '9.5', eu: '27', cm: '16.5' },
    { us: '10.5C', uk: '10', eu: '27.5', cm: '17' },
    { us: '11C', uk: '10.5', eu: '28', cm: '17.5' },
    { us: '11.5C', uk: '11', eu: '29', cm: '18' },
    { us: '12C', uk: '11.5', eu: '30', cm: '18.5' },
    { us: '12.5C', uk: '12', eu: '30.5', cm: '19' },
    { us: '13C', uk: '12.5', eu: '31', cm: '19.5' },
    { us: '13.5C', uk: '13', eu: '31.5', cm: '20' },
    { us: '1Y', uk: '13.5', eu: '32', cm: '20.5' },
    { us: '1.5Y', uk: '1', eu: '33', cm: '21' },
    { us: '2Y', uk: '1.5', eu: '33.5', cm: '21.5' },
    { us: '2.5Y', uk: '2', eu: '34', cm: '22' },
    { us: '3Y', uk: '2.5', eu: '35', cm: '22.5' }
  ]
};

export default function SizeGuide() {
  const [selectedCategory, setSelectedCategory] = useState<'men' | 'women' | 'kids'>('men');
  const [tableCategory, setTableCategory] = useState<'men' | 'women' | 'kids'>('men');
  const [footLength, setFootLength] = useState('');

  const getSizeRecommendation = () => {
    if (!footLength || isNaN(parseFloat(footLength))) return null;
    const length = parseFloat(footLength);
    const chart = sizeCharts[selectedCategory];
    const match = chart.find(size => parseFloat(size.cm) >= length);
    return match || null;
  };

  const recommendation = getSizeRecommendation();

  return (
    <Layout>
      <Head>
        <title>Size Guide - ShoeStyle Premium</title>
        <meta name="description" content="Complete shoe sizing guide with measurements and fit tips." />
      </Head>

      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20 selection:bg-indigo-500 selection:text-white">

        {/* 🔥 Premium Minimalist Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-100">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center justify-center p-4 bg-indigo-50 border border-indigo-100 rounded-full mb-8 shadow-sm">
                <Ruler size={32} className="text-indigo-600" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gray-900">
                Size <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Guide</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto">
                Find your perfect fit with our comprehensive sizing calculator and measurement guide.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Interactive Size Calculator */}
        <section className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-gray-100"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 mb-3">Smart Calculator</h2>
              <p className="text-gray-500 font-medium">Enter your foot length and we'll compute your exact size.</p>
            </div>

            <div className="max-w-2xl mx-auto">
              {/* Custom iOS-style Tab Switcher */}
              <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8">
                {(['men', 'women', 'kids'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-xl transition-all ${selectedCategory === cat
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Footprints className="text-gray-400" size={20} />
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={footLength}
                  onChange={(e) => setFootLength(e.target.value)}
                  placeholder="Enter foot length in CM (e.g., 26.5)"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl text-gray-900 text-lg font-bold placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <AnimatePresence mode="wait">
                {recommendation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2rem] text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full mb-6 text-sm font-bold text-indigo-600 shadow-sm uppercase tracking-widest">
                        <CheckCircle2 size={16} /> Recommended Fit
                      </div>

                      <div className="grid grid-cols-4 gap-4 divide-x divide-indigo-200/50">
                        <div>
                          <div className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-widest">US</div>
                          <div className="text-3xl md:text-4xl font-black text-indigo-900">{recommendation.us}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-widest">UK</div>
                          <div className="text-3xl md:text-4xl font-black text-indigo-900">{recommendation.uk}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-widest">EU</div>
                          <div className="text-3xl md:text-4xl font-black text-indigo-900">{recommendation.eu}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-widest">CM</div>
                          <div className="text-3xl md:text-4xl font-black text-indigo-900">{recommendation.cm}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        {/* 🔥 How to Measure */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black tracking-[0.2em] text-indigo-600 uppercase mb-3">DIY Guide</h2>
            <h3 className="text-4xl font-black text-gray-900">How to Measure Your Feet</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                { step: '1', title: 'Prepare', desc: 'Place a piece of paper on a hard floor against a wall. Wear the socks you plan to wear.' },
                { step: '2', title: 'Position', desc: 'Stand on the paper with your heel firmly against the wall. Keep your weight evenly distributed.' },
                { step: '3', title: 'Mark', desc: 'Have someone mark the longest part of your foot on the paper (usually your big toe).' },
                { step: '4', title: 'Measure', desc: 'Use a ruler to measure from the wall to the mark. This is your foot length in centimeters.' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-white border border-gray-200 text-gray-900 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-1 text-gray-900 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sleek CSS Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-indigo-50 rounded-[3rem] p-12 h-full flex flex-col items-center justify-center relative overflow-hidden border border-indigo-100"
            >
              <div className="w-full max-w-[200px] aspect-[1/2] border-4 border-indigo-200 rounded-t-full rounded-b-[4rem] relative bg-white/50 backdrop-blur shadow-inner">
                {/* Wall line */}
                <div className="absolute bottom-[-4px] left-[-20%] right-[-20%] h-2 bg-indigo-300 rounded-full" />
                {/* Measurement line */}
                <div className="absolute top-8 left-[-30px] bottom-0 w-px border-l-2 border-dashed border-indigo-400" />
                <div className="absolute top-8 left-[-40px] w-6 h-px bg-indigo-400" />
                <div className="absolute bottom-0 left-[-40px] w-6 h-px bg-indigo-400" />
                <div className="absolute top-1/2 left-[-80px] -translate-y-1/2 -rotate-90 text-sm font-bold text-indigo-600 tracking-widest">LENGTH (CM)</div>
                {/* Abstract Foot */}
                <div className="absolute inset-4 bg-indigo-600/10 rounded-t-full rounded-b-[3rem]" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Size Conversion Tables */}
        <section className="bg-white py-24 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black text-gray-900 mb-8">Master Conversion Chart</h3>

              {/* Table Tabs */}
              <div className="flex flex-wrap justify-center gap-3">
                {(['men', 'women', 'kids'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTableCategory(cat)}
                    className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all ${tableCategory === cat
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    {cat}'s Sizes
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              key={tableCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">US Size</th>
                      <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">UK Size</th>
                      <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">EU Size</th>
                      <th className="px-6 py-5 text-xs font-black text-gray-500 uppercase tracking-widest">Length (CM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sizeCharts[tableCategory].map((size, index) => (
                      <tr key={index} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-900">{size.us}</td>
                        <td className="px-6 py-4 font-medium text-gray-600">{size.uk}</td>
                        <td className="px-6 py-4 font-medium text-gray-600">{size.eu}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{size.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Width Guide (Premium Dark Section) */}
        <section className="bg-gray-900 text-white py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-sm font-black tracking-[0.2em] text-indigo-400 uppercase mb-3">Fit Types</h2>
              <h3 className="text-4xl font-black text-white">Understanding Widths</h3>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { code: 'N', name: 'Narrow', desc: 'For slimmer foot profiles', icon: <SplitSquareHorizontal size={24} /> },
                { code: 'M', name: 'Medium', desc: 'Standard industry width', icon: <Footprints size={24} /> },
                { code: 'W', name: 'Wide', desc: 'Extra room in the toe box', icon: <Expand size={24} /> },
                { code: 'XW', name: 'Extra Wide', desc: 'Maximum available width', icon: <MoveHorizontal size={24} /> }
              ].map((width, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 text-center hover:bg-white/10 transition-colors"
                >
                  <div className="w-16 h-16 mx-auto bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                    {width.icon}
                  </div>
                  <div className="text-3xl font-black mb-2 text-white">{width.code}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-200">{width.name}</h3>
                  <p className="text-gray-400 text-sm font-medium">{width.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 🔥 Premium CTA Section */}
        <section className="max-w-7xl mx-auto px-4 mt-16 mb-10">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <HelpCircle size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">Still Unsure?</h3>
                <p className="text-gray-500 text-lg font-medium">Connect with our styling experts for personalized sizing advice.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <button
                onClick={() => window.dispatchEvent(new Event('open-live-chat'))}
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg hover:scale-105"
              >
                <MessageCircle size={22} /> Live Chat
              </button>
              <a href="/contact" className="px-8 py-4 bg-transparent border-2 border-gray-200 hover:border-gray-900 text-gray-900 rounded-full font-black text-lg transition-colors text-center">
                Contact Us
              </a>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}