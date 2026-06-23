import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { Flame, Sparkles, ArrowRight, Frown } from 'lucide-react';

export default function NewArrivals() {
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 DIRECT API FETCH (Bypassing the buggy useProducts hook)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        // Direct call to get all products without any confusing query params
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          // API returns { products: [...] } or just an array [...] depending on your backend
          const productList = Array.isArray(data) ? data : (data.products || []);
          setProducts(productList);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // 🔥 SMART FILTERING LOGIC
  const { displayProducts, availableCategories } = useMemo(() => {
    if (!products || products.length === 0) return { displayProducts: [], availableCategories: ['all'] };

    // 1. Get products explicitly marked as 'isNew' (safely checking isActive too)
    let newProducts = products.filter(p => p.isNew === true && p.isActive !== false);

    // 2. Fallback: If no products are marked as 'isNew', just take the latest 8 products
    if (newProducts.length === 0) {
      newProducts = [...products].reverse().slice(0, 8);
    }

    // 3. Extract unique categories dynamically based on what's ACTUALLY available
    const categoriesSet = new Set(newProducts.map(p => (p.category || 'other').toLowerCase()));
    const categories = ['all', ...Array.from(categoriesSet)];

    // 4. Apply selected category filter
    const filtered = filter === 'all'
      ? newProducts
      : newProducts.filter(p => (p.category || 'other').toLowerCase() === filter);

    return { displayProducts: filtered, availableCategories: categories };
  }, [products, filter]);

  return (
    <Layout>
      <Head>
        <title>New Arrivals - ShoeStyle Premium</title>
        <meta name="description" content="Discover our latest shoe arrivals. Fresh styles and trending designs." />
      </Head>

      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20 selection:bg-orange-500 selection:text-white">

        {/* 🔥 Premium Minimalist Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-100">
          <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full mb-8 shadow-sm text-sm font-bold text-gray-600 uppercase tracking-widest">
                <Flame size={16} className="text-orange-500" /> Just Dropped
              </div>

              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-gray-900">
                New <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Arrivals</span>
              </h1>

              <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto">
                Fresh styles just landed. Be the first to step into the latest trends.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Dynamic Filter Section */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          {!loading && availableCategories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 justify-center mb-12 bg-white p-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-w-fit mx-auto"
            >
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 ${filter === cat
                      ? 'bg-gray-900 text-white shadow-md scale-105'
                      : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {cat === 'all' ? 'All Styles' : cat}
                </button>
              ))}
            </motion.div>
          )}

          {/* 🔥 Products Grid */}
          <div className="relative min-h-[400px]">
            {loading ? (
              // Premium Skeleton Loader
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white p-4 rounded-[2rem] shadow-sm border border-gray-50">
                    <div className="bg-gray-100 h-64 rounded-2xl mb-6" />
                    <div className="bg-gray-100 h-5 rounded-md w-3/4 mb-3" />
                    <div className="bg-gray-100 h-4 rounded-md w-1/2 mb-6" />
                    <div className="bg-gray-100 h-12 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : displayProducts.length > 0 ? (
              // Actual Products
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                <AnimatePresence>
                  {displayProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="group"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-6">
                  <Frown size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">No styles found</h3>
                <p className="text-gray-500 mb-6">We couldn't find any products in this category.</p>
                <button
                  onClick={() => setFilter('all')}
                  className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-black transition-colors"
                >
                  View All Arrivals
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* 🔥 Premium Newsletter CTA */}
        <section className="max-w-7xl mx-auto px-4 mt-10">
          <div className="bg-gray-900 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-orange-500/20 rounded-full blur-[80px]" />

            <div className="relative z-10 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 text-white border border-white/20">
                <Sparkles size={28} />
              </div>
              <h2 className="text-4xl font-black text-white mb-4">Stay Ahead of the Curve</h2>
              <p className="text-gray-400 text-lg">
                Drop your email to get VIP access to limited releases, exclusive colorways, and early sale notifications.
              </p>
            </div>

            <div className="relative z-10 w-full md:w-auto flex-shrink-0">
              <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full sm:w-[300px] px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-orange-500 outline-none transition-all"
                />
                <button type="submit" className="px-8 py-4 bg-white text-gray-900 rounded-full font-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  Subscribe <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}