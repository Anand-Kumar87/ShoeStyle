import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// 1. Hook imported
import { useGlobalCurrency } from '@/context/CurrencyContext';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Product } from '@/types/product';

// Skeleton exported for reuse
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-neutral-200 aspect-[4/5] rounded-xl mb-4" />
      <div className="space-y-2 px-1">
        <div className="bg-neutral-200 h-3 w-1/3 rounded" />
        <div className="bg-neutral-200 h-4 w-3/4 rounded" />
        <div className="bg-neutral-200 h-5 w-1/4 rounded" />
      </div>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product & { isSale?: boolean, salePrice?: number } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // 2. Initialize global currency hook
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const [wishlisting, setWishlisting] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock === 0;

  // 🔥 NEW: Smart Sale & Discount Calculation Logic
  let discount = 0;
  let currentPrice = product.price;
  let originalPrice = product.compareAtPrice;

  if (product.isSale && product.salePrice && product.price > product.salePrice) {
    // Agar product naye Sale system ke under hai
    discount = Math.round(((product.price - product.salePrice) / product.price) * 100);
    currentPrice = product.salePrice;
    originalPrice = product.price;
  } else if (product.compareAtPrice && product.compareAtPrice > product.price) {
    // Purana compareAtPrice logic (Fallback)
    discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) { router.push('/auth/signin'); return; }
    setWishlisting(true);
    await toggleWishlist(product.id);
    setWishlisting(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[4/5] bg-neutral-100 rounded-xl overflow-hidden mb-4">
          <Image
            src={product.image || '/placeholder.png'}
            alt={product.name}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
            loading="lazy"
          // ✅ Fixed fetchpriority warning implicitly by keeping it clean and using lazy loading
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="bg-black text-white text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">New</span>
            )}
            {/* 🔥 Dynamic Sale Badge */}
            {product.isSale && discount > 0 ? (
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md shadow-red-200">-{discount}% SALE</span>
            ) : discount > 0 ? (
              <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">-{discount}%</span>
            ) : null}
            {outOfStock && (
              <span className="bg-neutral-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">Sold Out</span>
            )}
          </div>

          {/* Wishlist */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleWishlist}
            disabled={wishlisting}
            aria-label="Toggle wishlist"
            className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 ${inWishlist ? 'bg-red-500 text-white shadow-lg' : 'bg-white/80 text-neutral-700 hover:bg-red-500 hover:text-white shadow-md'
              }`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>

          {/* Quick add - slides up on hover */}
          {!outOfStock && (
            <motion.div
              initial={{ y: '100%' }}
              whileHover={{ y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute bottom-0 left-0 right-0"
              style={{ originY: 1 }}
            >
              <div className="mx-3 mb-3">
                <button className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors">
                  <ShoppingBag className="h-4 w-4" />
                  Quick Add
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Info */}
        <div className="px-1 space-y-1.5">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.12em]">
            {product.brand || product.category}
          </p>
          <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-neutral-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && product.rating > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-3 w-3 ${i <= Math.round(product.rating!) ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}`} />
                ))}
              </div>
              <span className="text-[11px] text-neutral-400">({product.reviewCount ?? 0})</span>
            </div>
          ) : null}

          {/* 3. 🔥 Global Currency & Dynamic Sale Price Display */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className={`text-base font-black ${outOfStock ? 'text-neutral-400' : product.isSale ? 'text-red-600' : 'text-neutral-900'}`}>
              {currencyLoading ? '...' : convertPrice(currentPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm font-bold text-neutral-400 line-through">
                {currencyLoading ? '...' : convertPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}