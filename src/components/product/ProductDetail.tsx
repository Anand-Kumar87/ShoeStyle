'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Truck, RefreshCw, ShieldCheck, Star, X } from 'lucide-react';
import Button from '@/components/common/Button';
import SizeSelector from './SizeSelector';
import ColorSwatch from './ColorSwatch'; // 👈 Naya ColorSwatch import kiya
import { Product } from '@/types/product';
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false); // 👈 Size Guide Modal State

  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const images = product.images || [product.image];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onAddToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {hasDiscount && (
              <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg ${selectedImage === index ? 'ring-2 ring-neutral-900' : 'ring-1 ring-neutral-200'
                    }`}
                >
                  <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-neutral-600">{product.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-neutral-900">{product.name}</h1>

            {product.rating && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">
                  {product.rating} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              {currencyLoading ? '...' : convertPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-neutral-500 line-through">
                {currencyLoading ? '...' : convertPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* 👈 NAYA FIX: Premium Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-2">
              <label className="mb-3 block text-sm font-semibold text-neutral-900">
                Color: <span className="font-normal capitalize">{selectedColor || 'Select'}</span>
              </label>
              <ColorSwatch
                colors={product.colors}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
              />
            </div>
          )}

          {/* Size Selector with Size Guide Button */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-neutral-900">
                  Size: <span className="font-normal">{selectedSize || 'Select a size'}</span>
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSizeGuideOpen(true);
                  }}
                  className="text-sm text-neutral-600 underline hover:text-neutral-900 focus:outline-none"
                >
                  Size Guide
                </button>
              </div>
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
              />
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-neutral-900">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-neutral-300 font-semibold hover:border-neutral-900"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-neutral-300 font-semibold hover:border-neutral-900"
              >
                +
              </button>
              <span className="text-sm text-neutral-600">({product.stock} available)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleAddToCart} disabled={product.stock === 0} size="lg" className="flex-1">
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsInWishlist(!isInWishlist)}
              leftIcon={<Heart className="h-5 w-5" fill={isInWishlist ? 'currentColor' : 'none'} />}
            />
            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-neutral-600">{product.description}</p>

          {/* Features */}
          <div className="space-y-3 border-t border-neutral-200 pt-6">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-5 w-5 text-neutral-600" />
              <span className="text-neutral-900">
                Free shipping on orders over {currencyLoading ? '...' : convertPrice(100)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RefreshCw className="h-5 w-5 text-neutral-600" />
              <span className="text-neutral-900">30-day easy returns</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="h-5 w-5 text-neutral-600" />
              <span className="text-neutral-900">2-year warranty</span>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-neutral-900">
                Product Details
                <span className="transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-sm text-neutral-600">
                <ul className="space-y-2">
                  <li>• Premium quality materials</li>
                  <li>• Breathable and comfortable</li>
                  <li>• Durable construction</li>
                  <li>• True to size fit</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* 👈 NAYA FIX: Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-6 py-4">
                <h3 className="font-['Poppins'] text-lg font-black uppercase text-neutral-900">Size Guide</h3>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-neutral-900">
                      <th className="pb-3 font-bold uppercase tracking-wider text-neutral-900">US Size</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-neutral-900">UK Size</th>
                      <th className="pb-3 font-bold uppercase tracking-wider text-neutral-900">CM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {[
                      { us: '7', uk: '6', cm: '25.0' },
                      { us: '8', uk: '7', cm: '26.0' },
                      { us: '9', uk: '8', cm: '27.0' },
                      { us: '10', uk: '9', cm: '28.0' },
                      { us: '11', uk: '10', cm: '29.0' },
                      { us: '12', uk: '11', cm: '30.0' },
                    ].map((row) => (
                      <tr key={row.us} className="transition-colors hover:bg-neutral-50">
                        <td className="py-3 font-medium text-neutral-900">{row.us}</td>
                        <td className="py-3 text-neutral-600">{row.uk}</td>
                        <td className="py-3 text-neutral-600">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-xs text-neutral-500">
                  <p><strong>Note:</strong> Fit may vary depending on the style or brand. For half sizes, we recommend ordering the next size up.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetail;