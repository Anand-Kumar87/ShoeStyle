'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const stagger = { animate: { transition: { staggerChildren: 0.12 } } };
const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function PremiumHero() {
  return (
    <section className="relative h-screen min-h-[680px] max-h-[900px] overflow-hidden bg-black">
      {/* BG image */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
      </motion.div>

      {/* Content */}
      <div className="relative h-full flex items-center mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <motion.div variants={stagger} initial="initial" animate="animate" className="max-w-2xl">

          <motion.p variants={fadeUp} className="mb-5 inline-flex items-center gap-2">
            <span className="h-px w-8 bg-lime-400" />
            <span className="text-lime-400 text-xs font-black uppercase tracking-[0.2em]">New Season 2026</span>
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-['Poppins'] text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.92] tracking-tight text-white uppercase"
          >
            Built For
            <br />
            <span className="text-lime-400">Champions</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-lg text-neutral-300 max-w-md leading-relaxed">
            Engineered at the intersection of sport and culture. Every step, a statement.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-black text-sm uppercase tracking-wider hover:bg-lime-400 transition-all duration-300 rounded-full"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products?isNew=true"
              className="inline-flex items-center gap-3 border-2 border-white/40 text-white px-8 py-4 font-bold text-sm uppercase tracking-wider hover:border-white hover:bg-white/10 transition-all duration-300 rounded-full backdrop-blur-sm"
            >
              New Arrivals
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="mt-14 flex gap-10">
            {[['500+', 'Styles'], ['50+', 'Brands'], ['4.9★', 'Rating']].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs text-neutral-400 uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-9 border-2 border-white/40 rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
        <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Scroll</span>
      </motion.div>
    </section>
  );
}
