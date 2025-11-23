'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Nike', logo: '/brands/nike.svg' },
  { name: 'Adidas', logo: '/brands/adidas.svg' },
  { name: 'Puma', logo: '/brands/puma.svg' },
  { name: 'New Balance', logo: '/brands/newbalance.svg' },
  { name: 'Converse', logo: '/brands/converse.svg' },
  { name: 'Vans', logo: '/brands/vans.svg' },
];

const BrandCarousel: React.FC = () => {
  return (
    <section className="border-y border-neutral-200 bg-neutral-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-neutral-600">
          Featured Brands
        </h2>
        <div className="grid grid-cols-3 gap-8 md:grid-cols-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center grayscale transition-all hover:grayscale-0"
            >
              <div className="relative h-12 w-full">
                <span className="flex h-full items-center justify-center text-2xl font-bold text-neutral-400">
                  {brand.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;