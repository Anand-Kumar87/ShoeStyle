import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 Premium Icons
import { Heart, ShoppingBag, Trash2, X, Sparkles, ArrowRight, HeartCrack } from 'lucide-react';

import { useWishlist } from '@/hooks/useWishlist';
// 🔥 Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface WishlistPageProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function WishlistPage({ user }: WishlistPageProps) {
  const router = useRouter();
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();

  // 🔥 Extract convertPrice from hook
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  return (
    <>
      <Head>
        <title>My Wishlist - ShoeStyle Premium</title>
        <meta name="description" content="Your saved favorite shoes" />
      </Head>

      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20 selection:bg-red-500 selection:text-white">

        {/* 🔥 Premium Minimalist Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-100">
          {/* Subtle soft blobs for background depth */}
          <div className="absolute top-[-20%] left-[10%] w-[400px] h-[400px] bg-red-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-orange-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full mb-6 shadow-sm text-sm font-bold text-red-500 uppercase tracking-widest">
                <Heart size={16} className="fill-red-500" /> Your Favorites
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter text-gray-900">
                My <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Wishlist</span>
              </h1>
              <p className="text-lg md:text-xl font-medium text-gray-500">
                {wishlist.length === 0
                  ? 'Curate your perfect collection.'
                  : `You have ${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} saved for later.`}
              </p>
            </motion.div>

            {wishlist.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleClearAll}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-full font-bold hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm shrink-0"
              >
                <Trash2 size={18} /> Clear All
              </motion.button>
            )}
          </div>
        </section>

        {/* 🔥 Wishlist Content Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          {loading ? (
            // 🔥 Premium Skeleton Loader
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-4 rounded-[2rem] shadow-sm border border-gray-50">
                  <div className="bg-gray-100 h-72 rounded-2xl mb-6" />
                  <div className="bg-gray-100 h-6 rounded-md w-3/4 mb-3" />
                  <div className="bg-gray-100 h-5 rounded-md w-1/2 mb-6" />
                  <div className="flex gap-3">
                    <div className="bg-gray-100 h-12 rounded-xl w-full" />
                    <div className="bg-gray-100 h-12 rounded-xl w-14 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            // 🔥 Premium Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-12 md:p-24 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center max-w-3xl mx-auto"
            >
              <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <HeartCrack size={40} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Nothing to see here</h2>
              <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                Your wishlist is currently empty. Start exploring our premium collection and save your favorites!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Shopping <ArrowRight size={20} />
                </button>
                {user && (
                  <button
                    onClick={() => router.push('/account')}
                    className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-full font-black text-lg hover:bg-gray-50 transition-all"
                  >
                    My Account
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            // 🔥 Wishlist Items Grid with Framer Motion Layout
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {wishlist.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
                  >
                    {/* Product Image */}
                    <Link href={`/products/${item.product.slug}`}>
                      <div className="relative h-72 bg-[#F4F4F4] rounded-2xl overflow-hidden mb-6 cursor-pointer">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Remove Button (Glassmorphism) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemove(item.productId);
                          }}
                          className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md text-gray-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                        >
                          <X size={18} />
                        </button>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                          {item.product.stock === 0 && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              Out of Stock
                            </span>
                          )}
                          {item.product.isNew && item.product.stock > 0 && (
                            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="px-2">
                      <Link href={`/products/${item.product.slug}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate hover:text-red-500 transition-colors cursor-pointer">
                          {item.product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-black text-gray-900">
                            {currencyLoading ? '...' : convertPrice(item.product.price)}
                          </p>
                          {item.product.compareAtPrice && (
                            <p className="text-sm font-bold text-gray-400 line-through mt-1">
                              {currencyLoading ? '...' : convertPrice(item.product.compareAtPrice)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-amber-50 px-2 py-1 rounded-md">
                          ⭐ {item.product.rating ? item.product.rating.toFixed(1) : '5.0'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link href={`/products/${item.product.slug}`} className="flex-1">
                          <button
                            disabled={item.product.stock === 0}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-black transition-all ${item.product.stock > 0
                                ? 'bg-gray-900 text-white hover:bg-black hover:shadow-lg hover:-translate-y-0.5'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            <ShoppingBag size={18} />
                            {item.product.stock > 0 ? 'View Details' : 'Out of Stock'}
                          </button>
                        </Link>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="px-4 py-4 bg-gray-50 border border-gray-100 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center shrink-0"
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 🔥 Continue Shopping Section (Premium CTA) */}
          {wishlist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-20 bg-gray-900 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Looking for More?</h3>
                <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                  Discover our latest collection of premium footwear. New styles drop every week.
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="px-10 py-4 bg-white text-gray-900 rounded-full font-black text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2 mx-auto"
                >
                  Continue Shopping <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  return {
    props: {
      user: session?.user ? {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
      } : null,
    },
  };
};