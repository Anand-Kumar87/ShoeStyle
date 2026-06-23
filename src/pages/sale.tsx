import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';

export default function Sale() {
  const [discount, setDiscount] = useState('all');

  // 🔥 Data States
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Timer States
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 23, seconds: 45 });
  const [isSaleActive, setIsSaleActive] = useState(true);
  const [mounted, setMounted] = useState(false);

  // =====================================
  // 1. FETCH PRODUCTS FROM DATABASE
  // =====================================
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // =====================================
  // 2. LIVE TICKING TIMER LOGIC
  // =====================================
  useEffect(() => {
    setMounted(true); // Next.js Hydration Fix

    let endTime = localStorage.getItem('shoeStoreSaleEndTime');
    if (!endTime) {
      // 48 Hours Timer set karo agar pehli baar visit kar raha hai
      const targetTime = new Date().getTime() + (48 * 60 * 60 * 1000);
      localStorage.setItem('shoeStoreSaleEndTime', targetTime.toString());
      endTime = targetTime.toString();
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = parseInt(endTime!) - now;

      if (distance <= 0) {
        clearInterval(timer);
        setIsSaleActive(false); // Hide sale products when time is 0
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Smart Discount Calculator
  const calculateDiscount = (price: number, salePrice: number) => {
    if (!price || !salePrice || price <= salePrice) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  };

  // 🔥 Strictly filter Sale Products (Aur check karo ki Sale active hai ya nahi)
  const saleProducts = isSaleActive ? products.filter(p =>
    p.isSale === true && p.salePrice && p.price > p.salePrice
  ) : [];

  const filteredProducts = discount === 'all'
    ? saleProducts
    : saleProducts.filter(p => {
      const discountPercent = calculateDiscount(p.price, p.salePrice);
      if (discount === '50+') return discountPercent >= 50;
      if (discount === '30-50') return discountPercent >= 30 && discountPercent < 50;
      if (discount === '10-30') return discountPercent >= 10 && discountPercent < 30;
      return true;
    });

  // Action for CTA Button
  const handleShopAllSales = () => {
    if (!isSaleActive) return; // Agar sale khatam toh scroll mat karo
    setDiscount('all');
    document.getElementById('sale-products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <Head>
        <title>Sale - Up to 70% Off | Shoe Store</title>
        <meta name="description" content="Huge discounts on premium footwear. Limited time offers!" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className={`relative text-white py-24 overflow-hidden transition-all duration-700 ${isSaleActive ? 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-10 right-10 text-9xl font-bold opacity-20"
          >
            {isSaleActive ? 'SALE' : 'ENDED'}
          </motion.div>
          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-block px-6 py-2 rounded-full font-bold mb-6 shadow-md ${isSaleActive ? 'bg-white text-red-600' : 'bg-slate-700 text-white'}`}>
                {isSaleActive ? '🔥 LIMITED TIME OFFER' : '⏳ SALE HAS ENDED'}
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tight drop-shadow-md">
                {isSaleActive ? 'UP TO 70% OFF' : 'MISSED IT!'}
              </h1>
              <p className="text-2xl md:text-3xl mb-8 font-medium drop-shadow-sm">
                {isSaleActive ? 'Massive savings on premium footwear' : 'Stay tuned for our next big event'}
              </p>

              {/* 🔥 LIVE TICKING TIMER UI */}
              <div className="flex gap-4 justify-center text-lg">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl shadow-xl min-w-[100px]">
                  <div className="font-black text-3xl sm:text-4xl">
                    {mounted ? String(timeLeft.hours).padStart(2, '0') : '48'}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider opacity-90">Hours</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl shadow-xl min-w-[100px]">
                  <div className="font-black text-3xl sm:text-4xl">
                    {mounted ? String(timeLeft.minutes).padStart(2, '0') : '23'}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider opacity-90">Mins</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl shadow-xl min-w-[100px]">
                  <div className="font-black text-3xl sm:text-4xl">
                    {mounted ? String(timeLeft.seconds).padStart(2, '0') : '45'}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider opacity-90">Secs</div>
                </div>
              </div>

            </motion.div>
          </div>
        </section>

        {/* Discount Filter */}
        <section id="sale-products-grid" className="max-w-7xl mx-auto px-4 py-16 scroll-mt-20">
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {[
              { value: 'all', label: 'All Deals' },
              { value: '50+', label: '50% & Above' },
              { value: '30-50', label: '30% - 50%' },
              { value: '10-30', label: '10% - 30%' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDiscount(option.value)}
                disabled={!isSaleActive}
                className={`px-8 py-3.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 ${!isSaleActive ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : discount === option.value
                  ? 'bg-red-600 text-white shadow-xl shadow-red-200 scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Sale Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-3xl text-center border border-red-100 shadow-sm">
              <div className={`text-5xl font-black mb-3 ${isSaleActive ? 'text-red-600' : 'text-slate-400'}`}>
                {saleProducts.length}+
              </div>
              <div className="text-slate-700 font-bold uppercase tracking-widest text-xs">Products on Sale</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-3xl text-center border border-orange-100 shadow-sm">
              <div className={`text-5xl font-black mb-3 ${isSaleActive ? 'text-orange-600' : 'text-slate-400'}`}>
                {saleProducts.length > 0 ? `${Math.max(...saleProducts.map(p => calculateDiscount(p.price, p.salePrice)))}%` : (isSaleActive ? '70%' : '0%')}
              </div>
              <div className="text-slate-700 font-bold uppercase tracking-widest text-xs">Maximum Discount</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 p-8 rounded-3xl text-center border border-yellow-100 shadow-sm">
              <div className={`text-5xl font-black mb-3 ${isSaleActive ? 'text-yellow-600' : 'text-slate-400'}`}>
                {mounted && isSaleActive ? `${timeLeft.hours}h` : '0h'}
              </div>
              <div className="text-slate-700 font-bold uppercase tracking-widest text-xs">Time Remaining</div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 h-[350px] rounded-2xl mb-4" />
                  <div className="bg-slate-200 h-4 rounded-md mb-2 w-3/4" />
                  <div className="bg-slate-200 h-4 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product, index) => {
                const discPercent = calculateDiscount(product.price, product.salePrice);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="relative group"
                  >
                    {/* Dynamic Premium Discount Badge */}
                    {discPercent > 0 && (
                      <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1.5 rounded-full font-black text-xs tracking-wider shadow-lg shadow-red-200">
                        {discPercent}% OFF
                      </div>
                    )}
                    <ProductCard product={product} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* 🔥 Dynamic Empty State based on Timer */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <div className="text-5xl mb-4">{isSaleActive ? '🏷️' : '⏳'}</div>
              <p className="text-xl font-bold text-slate-400">
                {isSaleActive ? 'No sale items found in this range.' : 'The Sale has Ended! Please check back later for new offers.'}
              </p>
              {isSaleActive && (
                <button
                  onClick={() => setDiscount('all')}
                  className="mt-6 text-red-600 font-bold hover:underline underline-offset-4"
                >
                  View all deals
                </button>
              )}
            </div>
          )}
        </section>

        {/* CTA Section */}
        {isSaleActive && (
          <section className="bg-slate-950 text-white py-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600 to-transparent"></div>

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-5xl font-black mb-6 tracking-tight">Don't Miss Out!</h2>
              <p className="text-xl text-slate-400 mb-10 font-medium">
                These deals won't last forever. Upgrade your sneaker game and save big!
              </p>
              <button
                onClick={handleShopAllSales}
                className="bg-red-600 hover:bg-red-700 hover:scale-105 px-12 py-5 rounded-full font-black text-lg tracking-widest uppercase transition-all duration-300 shadow-xl shadow-red-900/50"
              >
                Shop All Sale Items
              </button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}