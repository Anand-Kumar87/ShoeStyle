import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PremiumHero from '@/components/hero/PremiumHero';
import ProductGrid from '@/components/product/ProductGrid';
import { Product } from '@/types/product';
import { prisma } from '@/lib/prisma';

interface HomeProps {
  featuredProducts: Product[];
  newArrivals: Product[];
}

export default function Home({ featuredProducts, newArrivals }: HomeProps) {
  // 🔥 Newsletter & Hydration States
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔥 Hydration Error Fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 Handle Subscribe Form
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Bhai, email toh daal!');
      return;
    }

    setLoading(true);

    // Fake API call delay (Future mein tum yahan backend API jod sakte ho)
    setTimeout(() => {
      toast.success('Welcome to the Movement! 🚀');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>ShoeStyle — Premium Footwear</title>
        <meta name="description" content="Shop the latest collection of premium footwear at ShoeStyle. Engineered for performance, designed for style." />
      </Head>

      {/* ✅ Hydration Error Fix: Sirf browser pe load hoga */}
      {mounted && (
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '100px',
              padding: '16px 24px',
              fontWeight: 'bold'
            }
          }}
        />
      )}

      <Header />

      <main>
        <PremiumHero />

        {/* Flash sale banner */}
        <div className="bg-black text-white py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-black text-base uppercase tracking-wide">Flash Sale: Buy 2 Get 1 Free</p>
              <p className="text-neutral-400 text-sm">On selected styles. While stocks last.</p>
            </div>
            <Link href="/sale" className="flex-shrink-0 bg-lime-400 text-black px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-lime-300 transition-colors">
              Shop Sale
            </Link>
          </div>
        </div>

        {/* Featured products (Most Wanted) */}
        {featuredProducts.length > 0 && (
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-end justify-between mb-10"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Trending Now</p>
                  <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">Most Wanted</h2>
                </div>
                <Link href="/products?isFeatured=true" className="hidden sm:flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <ProductGrid products={featuredProducts} />

              <div className="mt-10 text-center sm:hidden">
                <Link href="/products" className="inline-flex items-center gap-2 border-2 border-black text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-all">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Editorial banner */}
        <section className="py-0">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
            <div className="relative overflow-hidden bg-neutral-950 flex items-center">
              <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556906781-9cba4a5f6f4e?w=900&q=80')" }} />
              <div className="relative z-10 px-10 py-16 text-white">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-400 mb-3">Performance</p>
                <h3 className="font-['Poppins'] text-4xl font-black uppercase leading-tight mb-6">Built to<br />Run Faster</h3>
                <Link href="/products?category=running" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider hover:bg-lime-400 transition-colors">
                  Shop Running <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden bg-lime-400 flex items-center">
              <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80')" }} />
              <div className="relative z-10 px-10 py-16 text-black">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-3">New Season</p>
                <h3 className="font-['Poppins'] text-4xl font-black uppercase leading-tight mb-6">Fresh<br />Styles</h3>
                <Link href="/products?isNew=true" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider hover:bg-neutral-800 transition-colors">
                  New Arrivals <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* New arrivals */}
        {newArrivals.length > 0 && (
          <section className="py-20 bg-neutral-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-end justify-between mb-10"
              >
                <div>
                  <span className="inline-block bg-black text-white text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full mb-3">Just Dropped</span>
                  <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900">New Arrivals</h2>
                </div>
                <Link href="/products" className="hidden sm:flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <ProductGrid products={newArrivals} />
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="relative py-24 bg-neutral-950 overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80')", backgroundSize: 'cover' }} />
          <div className="relative mx-auto max-w-2xl px-4 sm:px-6 text-center text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-400 mb-4">Members Only</p>
              <h2 className="font-['Poppins'] text-4xl font-black uppercase mb-4">
                Join the <span className="text-lime-400">Movement</span>
              </h2>
              <p className="text-neutral-400 mb-8">Exclusive drops, early access, and member-only deals.</p>

              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 rounded-full px-6 py-4 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-lime-400 text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-lime-300 transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Wait...' : 'Sign Up'}
                </button>
              </form>

            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // 1. Fetch Most Wanted (Featured)
  let featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  // SMART FALLBACK
  if (featuredProducts.length < 4) {
    const extraProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: featuredProducts.map(p => p.id) }
      },
      take: 8 - featuredProducts.length,
      orderBy: { createdAt: 'desc' }
    });

    featuredProducts = [...featuredProducts, ...extraProducts];
  }

  // 2. Fetch New Arrivals
  const newArrivals = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  return {
    props: {
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      newArrivals: JSON.parse(JSON.stringify(newArrivals)),
    },
    revalidate: 10,
  };
};