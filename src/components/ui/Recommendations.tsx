'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';

interface RecommendationsProps {
  products: Product[];
  title?: string;
}

export default function Recommendations({ products, title = 'You May Also Like' }: RecommendationsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6 text-lime-500" />
            <h2 className="font-display text-3xl font-bold text-neutral-900">{title}</h2>
          </div>
          <p className="text-neutral-600">Handpicked just for you</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
