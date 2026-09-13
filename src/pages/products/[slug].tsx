import { useState, useRef, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, User, X, Camera, Play, Zap, ChevronDown, FileText, Share2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import ColorSwatch from '@/components/product/ColorSwatch';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { prisma } from '@/lib/prisma';
import toast from 'react-hot-toast';
import { useGlobalCurrency } from '@/context/CurrencyContext';
import MobileProductHero from '@/components/product/MobileProductHero';
import ReviewsSection from '@/components/product/ReviewsSection';
import ProductDetailsSection from '@/components/product/ProductDetailsSection';
import SizeGuideModal from '@/components/product/SizeGuideModal';

const isVideo = (url: string) => {
  if (!url) return false;
  return url.startsWith('data:video') || url.match(/\.(mp4|webm|ogg)$/i);
};

export default function ProductDetailPage({ product, related }: any) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  const availableColors = product.colors && product.colors.length > 0 ? product.colors : [];
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '');

  const [sizeWarning, setSizeWarning] = useState(false);
  const [colorWarning, setColorWarning] = useState(false);
  const sizeSectionRef = useRef<HTMLDivElement>(null);
  const colorSectionRef = useRef<HTMLDivElement>(null);

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'about' | 'details' | 'brand'>('about');
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const specsSectionRef = useRef<HTMLDivElement>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const inWishlist = isInWishlist(product.id);
  const images = [product.image, ...(product.images || [])].filter(Boolean) as string[];
  const outOfStock = (product.stock ?? 0) <= 0;

  // 🔥 SMART SALE & PRICING LOGIC
  const hasSale = Boolean(product.isSale && product.salePrice && product.price > product.salePrice);
  const effectivePrice = hasSale ? Number(product.salePrice) : Number(product.price);
  const originalPrice = hasSale ? Number(product.price) : Number(product.compareAtPrice || product.price);
  const discount = hasSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : (product.compareAtPrice && product.compareAtPrice > product.price
        ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
        : 0);

  const validSizes = (product.sizes || []).filter((s: string) => s && s.trim() !== '');

  // 🔥 COLOR CHANGE -> IMAGE CHANGE LOGIC
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setColorWarning(false);
    const colorIndex = availableColors.indexOf(color);
    // Agar color ka index image array mein match karta hai toh image change kar do
    if (colorIndex !== -1 && colorIndex < images.length) {
      setActiveImage(colorIndex);
    }
  };

  // 🔥 STRICT VALIDATION FOR CART & BUY NOW
  const validateSelection = () => {
    if (validSizes.length > 0 && !selectedSize) {
      setSizeWarning(true);
      sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error('⚠️ Please choose a Size first!', {
        id: 'size-warning',
        duration: 3500,
        style: { borderRadius: '12px', background: '#000', color: '#fff', fontWeight: 'bold' }
      });
      setTimeout(() => setSizeWarning(false), 3500);
      return false;
    }
    if (availableColors.length > 0 && !selectedColor) {
      setColorWarning(true);
      colorSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast.error('⚠️ Please choose a Color first!', {
        id: 'color-warning',
        duration: 3500,
        style: { borderRadius: '12px', background: '#000', color: '#fff', fontWeight: 'bold' }
      });
      setTimeout(() => setColorWarning(false), 3500);
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (outOfStock) {
      toast.error('Sorry, this product is currently Out of Stock!');
      return;
    }
    if (!validateSelection()) return;
    setAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.image,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
      slug: product.slug,
      stock: product.stock
    });
    await new Promise(r => setTimeout(r, 400));
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (outOfStock) {
      toast.error('Sorry, this product is currently Out of Stock!');
      return;
    }
    if (!validateSelection()) return;
    setBuying(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.image,
      quantity: qty,
      size: selectedSize,
      color: selectedColor,
      slug: product.slug,
      stock: product.stock
    });
    toast.loading('Redirecting to checkout...', { duration: 1000 });
    router.push('/cart');
  };

  const handleWishlist = () => {
    if (!session) { router.push('/auth/signin'); return; }
    toggleWishlist(product.id, product);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | ShoeStyle`,
      text: `Check out ${product.name} on ShoeStyle!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
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

  return (
    <>
      <Head>
        <title>{`${product.name} | ShoeStyle`}</title>
      </Head>
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="bg-white min-h-screen font-['Inter',sans-serif]">
        {/* 📱 MOBILE VIEW: CONCEPT A (Omar UX) */}
        <MobileProductHero
          product={product}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          adding={adding}
          buying={buying}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        />

        {/* 💻 DESKTOP VIEW: CLASSIC LUXURY HERO */}
        <div className="hidden lg:block">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-6 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
              <Link href="/" className="hover:text-black transition-colors">Home</Link><span>/</span>
              <Link href="/products" className="hover:text-black transition-colors">Shop</Link><span>/</span>
              <span className="text-black truncate">{product.name}</span>
            </div>
          </div>

          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative">

            {/* 🔥 CLASSIC LAYOUT: THUMBNAILS ON LEFT, ONE BIG IMAGE ON RIGHT */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 h-full lg:sticky lg:top-24">

              {/* Thumbnails (Vertical) */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 scrollbar-hide pb-2 sm:pb-0 sm:max-h-[700px] snap-y">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-20 h-20 bg-[#f6f6f6] border transition-all snap-start ${activeImage === i ? 'border-black opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover mix-blend-multiply" alt="thumb" />
                  </button>
                ))}
              </div>

              {/* Main Big Image (No internal padding, edge-to-edge) */}
              <div className="relative flex-1 bg-[#f6f6f6] aspect-[4/5] sm:aspect-auto sm:h-[700px] flex items-center justify-center group overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                    src={images[activeImage] || 'https://via.placeholder.com/800'}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-multiply cursor-crosshair transition-transform duration-700 group-hover:scale-105"
                  />
                </AnimatePresence>
                {/* 🔥 PILL SHAPED DISCOUNT BADGE */}
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10 shadow-md">
                    -{discount}% {hasSale ? 'SALE' : 'OFF'}
                  </span>
                )}
              </div>
            </div>

            {/* RIGHT: PRODUCT DETAILS */}
            <div className="lg:col-span-5 pb-10">
              {product.brand && <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{product.brand}</p>}

              <h1 className="text-3xl sm:text-4xl font-black text-black leading-[1.1] mb-4 uppercase tracking-tight">
                {product.name}
              </h1>

              <div className="mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                    {currencyLoading ? '...' : convertPrice(effectivePrice)}
                  </span>
                  {(hasSale || (product.compareAtPrice && product.compareAtPrice > effectivePrice)) && (
                    <span className="text-lg text-slate-400 line-through font-medium">
                      {currencyLoading ? '...' : convertPrice(originalPrice)}
                    </span>
                  )}
                  {hasSale && (
                    <span className="text-xs font-black text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                      Sale Active
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclusive of all taxes</p>

                {/* 📦 Live Stock Inventory Status Badge */}
                {outOfStock ? (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span>Out of Stock — Currently Unavailable</span>
                  </div>
                ) : product.stock > 0 && product.stock <= 3 ? (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Hurry! Only {product.stock} units left in stock</span>
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>In Stock — Ready to Ship</span>
                  </div>
                )}
              </div>

              {availableColors.length > 0 && (
                <div
                  ref={colorSectionRef}
                  className={`mb-6 p-3 rounded-2xl transition-all duration-300 ${
                    colorWarning ? 'bg-red-50 ring-2 ring-red-500 shadow-md shadow-red-200' : ''
                  }`}
                >
                  <label className="mb-3 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-black">
                    <span>
                      Color: <span className="text-slate-500 ml-1">{selectedColor}</span>
                    </span>
                    {colorWarning && (
                      <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                        Required
                      </span>
                    )}
                  </label>
                  <ColorSwatch colors={availableColors} selectedColor={selectedColor} onColorChange={handleColorChange} />
                </div>
              )}

              {validSizes.length > 0 && (
                <div
                  ref={sizeSectionRef}
                  className={`mb-8 p-3 rounded-2xl transition-all duration-300 ${
                    sizeWarning ? 'bg-red-50 ring-2 ring-red-500 shadow-md shadow-red-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-black">Shoe Size (UK)</span>
                      {sizeWarning && (
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                          Required
                        </span>
                      )}
                    </div>
                    <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-bold text-slate-500 hover:text-black uppercase tracking-[0.1em] underline underline-offset-4">
                      Size Chart
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {validSizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeWarning(false);
                        }}
                        className={`h-11 min-w-[3rem] px-3 flex items-center justify-center text-xs font-black transition-all ${
                          selectedSize === size
                            ? 'bg-black text-white border border-black shadow-md'
                            : sizeWarning
                            ? 'bg-white border-2 border-red-400 text-red-700 hover:border-red-600'
                            : 'bg-white border border-slate-200 text-slate-900 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔥 PREMIUM PILL BUTTONS */}
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={outOfStock || adding}
                    className={`flex-1 h-14 rounded-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-colors ${
                      outOfStock
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-slate-800 disabled:opacity-50'
                    }`}
                  >
                    {adding ? 'Adding...' : outOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className="w-14 h-14 bg-white border border-slate-300 rounded-full flex items-center justify-center hover:border-black transition-colors group cursor-pointer"
                    title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart size={20} className={`${inWishlist ? 'fill-red-500 text-red-500' : 'text-black group-hover:fill-black'}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-14 h-14 bg-white border border-slate-300 rounded-full flex items-center justify-center hover:border-black transition-colors group cursor-pointer text-black hover:text-black"
                    title="Share Product"
                  >
                    <Share2 size={19} className="text-black group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {product.isSale && <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">No exchange/return on sale items</p>}

                <button
                  onClick={handleBuyNow}
                  disabled={outOfStock || buying}
                  className={`w-full h-14 rounded-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg transition-colors mt-1 ${
                    outOfStock
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-[#1e40af] text-white hover:bg-[#1e3a8a] shadow-blue-900/20 disabled:opacity-50'
                  }`}
                >
                  <Zap size={16} className="fill-current" /> {buying ? 'Processing...' : outOfStock ? 'Currently Unavailable' : 'Buy Now'}
                </button>
              </div>

              {/* TABS */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="flex gap-6 border-b border-slate-200 mb-6">
                  <button onClick={() => setActiveTab('about')} className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'about' ? 'border-b-2 border-black text-black' : 'text-slate-400 hover:text-black'}`}>About Product</button>
                  <button onClick={() => setActiveTab('details')} className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'details' ? 'border-b-2 border-black text-black' : 'text-slate-400 hover:text-black'}`}>Product Details</button>
                  <button onClick={() => setActiveTab('brand')} className={`pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'brand' ? 'border-b-2 border-black text-black' : 'text-slate-400 hover:text-black'}`}>Brand Info</button>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed font-medium min-h-[150px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'about' && <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><p className="whitespace-pre-line">{product.description}</p></motion.div>}
                    {activeTab === 'details' && (
                      <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ul className="space-y-3">
                          <li className="flex"><span className="w-32 font-bold text-black">Manufacturer:</span> <span>{product.brand || 'Premium Brand'}</span></li>
                          <li className="flex"><span className="w-32 font-bold text-black">Category:</span> <span className="capitalize">{product.category}</span></li>
                          <li className="flex"><span className="w-32 font-bold text-black">Country:</span> <span>Imported</span></li>
                        </ul>
                      </motion.div>
                    )}
                    {activeTab === 'brand' && <motion.div key="brand" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><p>Authentic merchandise. Designed for performance, comfort, and unmatched street style.</p></motion.div>}
                  </AnimatePresence>
                </div>

                {/* 🔥 MORE DETAILS ACCORDION TOGGLE */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !showFullSpecs;
                      setShowFullSpecs(nextState);
                      if (nextState) {
                        setTimeout(() => {
                          specsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 120);
                      }
                    }}
                    className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider text-black transition-all group border border-slate-200 cursor-pointer shadow-sm"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText size={16} className="text-slate-700 group-hover:text-black" />
                      {showFullSpecs ? 'Hide Complete Specifications' : 'More Details & Full Specifications'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${showFullSpecs ? 'rotate-180 text-black' : 'text-slate-400 group-hover:text-black'}`}
                    />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 📦 PRODUCT DETAILS & SPECIFICATIONS: ALWAYS VISIBLE ON MOBILE, EXPANDABLE ON DESKTOP */}
      <div ref={specsSectionRef}>
        {/* Mobile View: Always visible directly above reviews */}
        <div className="block lg:hidden">
          <ProductDetailsSection product={product} />
        </div>

        {/* Desktop View: Expands when user clicks More Details */}
        <div className="hidden lg:block">
          <AnimatePresence>
            {showFullSpecs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <ProductDetailsSection product={product} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 🌟 SAADAA-STYLE REVIEWS & HORIZONTAL ANIMATED MARQUEE */}
      <ReviewsSection
        productId={product.id}
        initialReviews={product.reviews || []}
        productName={product.name}
      />

        {/* 🔥 YOU MAY ALSO LIKE */}
        {related.length > 0 && (
          <div className="border-t border-slate-200 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-10 text-center">You May Also Like</h2>
              <ProductGrid products={related} />
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Lightbox for Images/Videos */}
      <AnimatePresence>
        {lightboxMedia && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <button onClick={() => setLightboxMedia(null)} className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors"><X size={32} /></button>
            <div className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">
              {lightboxMedia.type === 'video' ? (
                <video src={lightboxMedia.url} controls autoPlay className="max-w-full max-h-[85vh] shadow-2xl outline-none rounded-xl" />
              ) : (
                <img src={lightboxMedia.url} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-xl" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 ULTRA-LUXURY SIZE GUIDE MODAL */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        selectedSize={selectedSize}
        onSelectSize={(size) => {
          setSelectedSize(size);
          toast.success(`Selected Size: UK ${size}`, {
            style: { borderRadius: '12px', background: '#000', color: '#fff', fontWeight: 'bold' }
          });
        }}
      />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  try {
    const slug = (params?.slug || params?.id) as string;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        }
      }
    });

    if (!product) return { notFound: true };

    if (res) {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    }

    const selectFields = {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      image: true,
      category: true,
      rating: true,
      reviewCount: true,
      isSale: true,
      salePrice: true,
      isNew: true,
      stock: true,
    };

    let related = await prisma.product.findMany({
      where: { category: product.category, id: { not: product.id }, isActive: true },
      select: selectFields,
      take: 6,
    });

    if (related.length < 4) {
      const moreProducts = await prisma.product.findMany({
        where: {
          id: { notIn: [product.id, ...related.map((r: any) => r.id)] },
          isActive: true,
        },
        select: selectFields,
        take: 6 - related.length,
        orderBy: { createdAt: 'desc' },
      });
      related = [...related, ...moreProducts];
    }

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        related: JSON.parse(JSON.stringify(related)),
      },
    };
  } catch (err) {
    console.error("Error fetching product:", err);
    return { notFound: true };
  }
};