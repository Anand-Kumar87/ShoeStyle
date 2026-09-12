import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, ShoppingBag, Zap, Wind,
  Feather, Sparkles, Shield, AlertCircle, Share2,
  Maximize2, X, Search, Star, Send
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useGlobalCurrency } from '@/context/CurrencyContext';
import toast from 'react-hot-toast';

interface MobileProductHeroProps {
  product: any;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  adding: boolean;
  buying: boolean;
  onOpenSizeGuide: () => void;
}

export default function MobileProductHero({
  product,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  onAddToCart,
  onBuyNow,
  adding,
  buying,
  onOpenSizeGuide,
}: MobileProductHeroProps) {
  const router = useRouter();
  const { items } = useCart();
  const totalItems = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 40;

  const images = [product.image, ...(product.images || [])].filter(Boolean) as string[];
  const currentImageUrl = images[activeImageIdx] || 'https://via.placeholder.com/600';
  const validSizes = (product.sizes || []).filter((s: string) => s && s.trim() !== '');
  const availableColors = product.colors && product.colors.length > 0 ? product.colors : [];
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock === 0;

  // 🔥 SMART SALE & PRICING LOGIC
  const hasSale = Boolean(product.isSale && product.salePrice && product.price > product.salePrice);
  const effectivePrice = hasSale ? Number(product.salePrice) : Number(product.price);
  const originalPrice = hasSale ? Number(product.price) : Number(product.compareAtPrice || product.price);
  const discount = hasSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : (product.compareAtPrice && product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0);

  const [sizeWarning, setSizeWarning] = useState(false);
  const [colorWarning, setColorWarning] = useState(false);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);

  // Preload all images into browser cache so switching is instantaneous
  useEffect(() => {
    images.forEach((src) => {
      if (src && typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = src;
      }
    });
  }, [images]);

  // Active color name to display (matches Image 2: "Selected Color: White, Green")
  const activeColorDisplay = selectedColor || availableColors[activeImageIdx] || availableColors[0] || '';

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | ShoeStyle`,
      text: `Check out ${product.name} on ShoeStyle!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('🔗 Product link copied to clipboard!', {
          icon: '📋',
          style: { borderRadius: '12px', background: '#000', color: '#fff', fontSize: '13px' },
        });
      } catch (e) {
        toast.error('Could not copy link');
      }
    }
  };

  const handleSelectImage = (idx: number, matchingColor?: string | null) => {
    setActiveImageIdx(idx);
    if (matchingColor) {
      setSelectedColor(matchingColor);
      setColorWarning(false);
    } else if (availableColors.length > 0 && availableColors[idx]) {
      setSelectedColor(availableColors[idx]);
      setColorWarning(false);
    }
  };

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeImageIdx < images.length - 1) {
      handleSelectImage(activeImageIdx + 1);
    } else if (isRightSwipe && activeImageIdx > 0) {
      handleSelectImage(activeImageIdx - 1);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMobileAddToCart = () => {
    if (validSizes.length > 0 && !selectedSize) {
      setSizeWarning(true);
      toast.error('⚠️ Please select a shoe size (UK) first!');
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setColorWarning(true);
      toast.error('⚠️ Please select a color first!');
      colorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSizeWarning(false);
    setColorWarning(false);
    onAddToCart();
  };

  const handleMobileBuyNow = () => {
    if (validSizes.length > 0 && !selectedSize) {
      setSizeWarning(true);
      toast.error('⚠️ Please select a shoe size (UK) first!');
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setColorWarning(true);
      toast.error('⚠️ Please select a color first!');
      colorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSizeWarning(false);
    setColorWarning(false);
    onBuyNow();
  };

  return (
    <div className="block lg:hidden bg-[#FBFBFB] pb-2 font-sans">

      {/* ======================================================== */}
      {/* 📱 1. TOP APP BAR (Back Button + Search + Cart, Matching Image 2) */}
      {/* ======================================================== */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-3 py-2.5 flex items-center justify-between border-b border-slate-100 gap-2">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products"
            className="w-full bg-[#F0F2F5] hover:bg-[#E9ECEF] focus:bg-white text-xs font-semibold text-slate-900 placeholder:text-slate-400 pl-8 pr-3 py-2 rounded-xl border border-transparent focus:border-slate-300 outline-none transition-all"
          />
        </form>

        {/* Cart Icon with Counter */}
        <Link
          href="/cart"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* ======================================================== */}
      {/* 👟 2. EDGE-TO-EDGE HERO PRODUCT IMAGE (Rock-solid fixed height, no layout shift) */}
      {/* ======================================================== */}
      <div
        className="relative w-full h-[360px] sm:h-[420px] bg-[#F4F4F6] overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Main Photo with stable fade transition */}
        <motion.div
          key={activeImageIdx}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full flex items-center justify-center cursor-zoom-in"
          onClick={() => setIsZoomOpen(true)}
        >
          <img
            src={currentImageUrl}
            alt={product.name}
            className="w-full h-full object-cover select-none"
          />
        </motion.div>

        {/* Floating Top Right Buttons: Wishlist & Share */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product.id, product)}
            className="w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-white/60 flex items-center justify-center text-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart
              size={18}
              className={inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-800'}
            />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-white/60 flex items-center justify-center text-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Share"
          >
            <Send size={15} className="-rotate-12 translate-x-0.5 -translate-y-0.5 text-slate-800" />
          </button>
        </div>

        {/* Floating Bottom Left: Rating Badge Pill (Matching Image 2: "3.8 ★ | 14.2K+") */}
        <div className="absolute bottom-3.5 left-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-sm border border-slate-200/60 text-xs font-black text-slate-900 pointer-events-none">
          <span>{product.rating > 0 ? product.rating.toFixed(1) : '4.2'}</span>
          <Star size={11} className="fill-emerald-600 text-emerald-600 -translate-y-px" />
          <span className="text-slate-300 font-normal">|</span>
          <span className="text-slate-600 font-semibold text-[11px]">
            {product.reviewCount > 0 ? `${(product.reviewCount / 1000).toFixed(1)}K+` : '1.4K+'}
          </span>
        </div>

        {/* Zoom Button Trigger (Top-Left) */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-white/60 text-[10px] font-black uppercase tracking-wider text-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Zoom"
        >
          <Maximize2 size={11} />
          <span>Zoom</span>
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute bottom-3.5 right-3.5 z-20 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md pointer-events-none">
            -{discount}% {hasSale ? 'SALE' : 'OFF'}
          </span>
        )}
      </div>

      {/* ======================================================== */}
      {/* 📏 3. SLIDER LINE INDICATOR (Directly Under Image, Matching Image 2) */}
      {/* ======================================================== */}
      {images.length > 1 && (
        <div className="w-full bg-white py-2 flex items-center justify-center border-b border-slate-100">
          <div className="w-24 h-1 bg-slate-200 rounded-full relative overflow-hidden">
            <motion.div
              className="h-full bg-slate-950 rounded-full"
              animate={{
                width: `${100 / images.length}%`,
                x: `${activeImageIdx * 100}%`,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🎨 4. COLOR VARIANT THUMBNAIL GALLERY (Matching Image 2) */}
      {/* ======================================================== */}
      <div ref={colorSectionRef} className="bg-white px-4 py-3 border-b border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-black text-slate-900">
            Selected Color:{' '}
            <span className="font-semibold text-slate-600 capitalize">
              {activeColorDisplay || 'Standard'}
            </span>
          </span>
          {colorWarning && (
            <span className="text-xs font-bold text-red-500 animate-pulse">
              Please choose a color
            </span>
          )}
        </div>

        {/* Thumbnail Gallery Strip */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
          {images.map((img, idx) => {
            const isSelected = activeImageIdx === idx;
            const matchingColor = availableColors[idx] || (availableColors.length > 0 ? availableColors[idx % availableColors.length] : null);
            return (
              <button
                key={idx}
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).blur();
                  handleSelectImage(idx, matchingColor);
                }}
                className={`relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden bg-slate-50 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-slate-950 ring-2 ring-slate-950/20 shadow-md scale-105'
                    : 'border border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🏷️ 5. PRICE & PRODUCT INFO */}
      {/* ======================================================== */}
      <div className="bg-white px-4 py-4 space-y-4 border-b border-slate-100">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              PRICE
            </span>
            <div>
              {outOfStock ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider">
                  Out of Stock
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                  IN STOCK
                </span>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-950 tracking-tight">
              {currencyLoading ? '...' : convertPrice(effectivePrice)}
            </span>
            {(hasSale || (product.compareAtPrice && product.compareAtPrice > effectivePrice)) && (
              <span className="text-base text-slate-400 line-through font-semibold">
                {currencyLoading ? '...' : convertPrice(originalPrice)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-black text-red-600">
                (-{discount}% {hasSale ? 'SALE' : 'OFF'})
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 👟 6. SELECT SIZE & SIZE CHART (Matching Image 2) */}
        {/* ======================================================== */}
        {validSizes.length > 0 && (
          <div ref={sizeSectionRef} className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                Select Size (UK)
              </span>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="text-xs font-bold text-slate-600 hover:text-black underline underline-offset-4 cursor-pointer"
              >
                Size Chart
              </button>
            </div>

            {sizeWarning && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold animate-pulse">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>Please choose your shoe size to continue!</span>
              </div>
            )}

            <div className={`flex flex-wrap gap-2 p-1 rounded-2xl transition-all ${sizeWarning ? 'ring-2 ring-red-400 bg-red-50/40' : ''}`}>
              {validSizes.map((size: string) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeWarning(false);
                    }}
                    className={`h-11 min-w-[3.25rem] px-3.5 rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white shadow-md border-2 border-slate-950 scale-105'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-950'
                    }`}
                  >
                    UK {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 🛒 7. INLINE ACTIONS (Matching Image 2 Flow, Fills Empty Space) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleMobileAddToCart}
            disabled={outOfStock || adding}
            className="flex-1 h-12 rounded-xl bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <ShoppingBag size={16} />
            <span>{adding ? 'Adding...' : 'Add to cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleMobileBuyNow}
            disabled={outOfStock || buying}
            className="flex-1 h-12 rounded-xl bg-slate-950 hover:bg-black text-white border-2 border-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Zap size={15} className="fill-current" />
            <span>{buying ? 'Processing...' : 'Buy now'}</span>
          </button>
        </div>

        {/* Highlights */}
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50">
              <Sparkles size={14} className="text-blue-600 mb-1" />
              <span className="text-[9px] font-black text-slate-700">Air Cushion</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50">
              <Feather size={14} className="text-emerald-600 mb-1" />
              <span className="text-[9px] font-black text-slate-700">Lightweight</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50">
              <Wind size={14} className="text-amber-600 mb-1" />
              <span className="text-[9px] font-black text-slate-700">Breathable</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50">
              <Shield size={14} className="text-purple-600 mb-1" />
              <span className="text-[9px] font-black text-slate-700">Comfort Fit</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🛒 8. STICKY BOTTOM ACTIONS (Authentic ShoeStyle Brand Colors) */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 z-40 flex items-center gap-3 shadow-xl">
        <button
          type="button"
          onClick={handleMobileAddToCart}
          disabled={outOfStock || adding}
          className="flex-1 h-12 rounded-xl bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <ShoppingBag size={16} />
          <span>{adding ? 'Adding...' : 'Add to cart'}</span>
        </button>

        <button
          type="button"
          onClick={handleMobileBuyNow}
          disabled={outOfStock || buying}
          className="flex-1 h-12 rounded-xl bg-slate-950 hover:bg-black text-white border-2 border-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Zap size={15} className="fill-current" />
          <span>{buying ? 'Processing...' : 'Buy now'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 🔍 9. FULLSCREEN ZOOM MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-white flex flex-col justify-between select-none"
          >
            {/* Top Bar */}
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 truncate max-w-[200px]">
                  {product.name}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  ({activeImageIdx + 1}/{images.length})
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
                  className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {zoomLevel}x Zoom
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsZoomOpen(false);
                    setZoomLevel(1);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Close Zoom"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Zoomable Image Canvas */}
            <div
              className="flex-1 overflow-auto flex items-center justify-center p-4 touch-pan-x touch-pan-y cursor-zoom-in"
              onClick={() => setZoomLevel(prev => (prev === 1 ? 2 : 1))}
            >
              <motion.img
                key={activeImageIdx}
                animate={{ scale: zoomLevel }}
                transition={{ duration: 0.25 }}
                src={images[activeImageIdx]}
                alt={product.name}
                className="max-w-full max-h-[75vh] object-contain select-none"
              />
            </div>

            {/* Bottom Thumbnail Strip */}
            {images.length > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-center gap-2.5 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIdx(idx);
                      setZoomLevel(1);
                    }}
                    className={`w-14 h-14 rounded-xl border-2 p-1 overflow-hidden transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-black scale-105 shadow-sm' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
