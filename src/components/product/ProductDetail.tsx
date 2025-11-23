'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Share2, Truck, RefreshCw, ShieldCheck, Star } from 'lucide-react';
import Button from '@/components/common/Button';
import SizeSelector from './SizeSelector';
import ColorSwatch from './ColorSwatch';
import { Product } from '@/types/product';

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
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
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

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square overflow-hidden rounded-lg ${
                  selectedImage === index
                    ? 'ring-2 ring-neutral-900'
                    : 'ring-1 ring-neutral-200'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm text-neutral-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">{product.name}</h1>
          
          {/* Rating */}
          {product.rating && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-neutral-300'
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

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-neutral-900">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xl text-neutral-500 line-through">
              ${product.compareAtPrice?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-neutral-600">{product.description}</p>

        {/* Color Selector */}
        {product.colors && product.colors.length > 0 && (
          <div>
            <label className="mb-3 block text-sm font-semibold text-neutral-900">
              Color: <span className="font-normal">{selectedColor}</span>
            </label>
            <ColorSwatch
              colors={product.colors}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </div>
        )}

        {/* Size Selector */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-900">
                Size: <span className="font-normal">{selectedSize || 'Select a size'}</span>
              </label>
              <button className="text-sm text-neutral-600 underline hover:text-neutral-900">
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
          <label className="mb-3 block text-sm font-semibold text-neutral-900">
            Quantity
          </label>
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
            <span className="text-sm text-neutral-600">
              ({product.stock} available)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="lg"
            className="flex-1"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsInWishlist(!isInWishlist)}
            leftIcon={
              <Heart
                className="h-5 w-5"
                fill={isInWishlist ? 'currentColor' : 'none'}
              />
            }
          />
          <Button variant="outline" size="lg" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="space-y-3 border-t border-neutral-200 pt-6">
          <div className="flex items-center gap-3 text-sm">
            <Truck className="h-5 w-5 text-neutral-600" />
            <span className="text-neutral-900">Free shipping on orders over $100</span>
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

        {/* Product Details */}
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
  );
};

export default ProductDetail;