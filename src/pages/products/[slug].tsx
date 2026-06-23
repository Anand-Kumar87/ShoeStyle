import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, ShoppingBag, Star, MessageSquare, User, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import ColorSwatch from '@/components/product/ColorSwatch'; // 👈 NAYA FIX: ColorSwatch Import
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { prisma } from '@/lib/prisma';
import toast from 'react-hot-toast';
import { useGlobalCurrency } from '@/context/CurrencyContext';

// Helper Accordion Component
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-slate-200 py-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm font-black text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors focus:outline-none">
        {title}
        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-5 text-[15px] text-slate-600 leading-relaxed font-medium">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetailPage({ product, related }: any) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  // 👈 NAYA FIX: Colors handle karne ka logic
  const availableColors = product.colors && product.colors.length > 0 ? product.colors : [];
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '');

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false); // 👈 NAYA FIX: Size Guide Modal State

  // Real Review States
  const [reviews, setReviews] = useState(product.reviews || []);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const images = [product.image, ...(product.images || [])].filter(Boolean) as string[];
  const inWishlist = isInWishlist(product.id);
  const outOfStock = product.stock === 0;
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  // Sizes array empty string filter
  const validSizes = (product.sizes || []).filter((s: string) => s && s.trim() !== '');

  const handleAddToCart = async () => {
    if (!selectedSize && validSizes.length > 0) {
      toast.error('Please select a size to continue');
      return;
    }
    setAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
      size: selectedSize,
      color: selectedColor, // Cart me color jayega
      slug: product.slug,
      stock: product.stock
    });
    await new Promise(r => setTimeout(r, 600));
    setAdding(false);
    toast.success('Added to your cart!');
  };

  const handleWishlist = async () => {
    if (!session) { router.push('/auth/signin'); return; }
    await toggleWishlist(product.id);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error('Please sign in to write a review'); router.push('/auth/signin'); return; }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return; }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, rating: reviewRating, comment: reviewComment })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      toast.success('Review submitted successfully!');
      setReviewComment(''); setReviewRating(5);
    } catch (error) {
      toast.error('Could not submit review. Try again.');
      console.error(error);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <Head>
        <title>{product.name} | ShoeStyle Premium</title>
        <meta name="description" content={product.description} />
      </Head>

      <Header />

      <main className="bg-white min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-blue-600 transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-slate-800 truncate">{product.name}</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

            {/* LEFT SIDE: GALLERY */}
            <div className="space-y-6">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-square bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group"
              >
                <img
                  src={images[activeImage] || 'https://via.placeholder.com/800'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                />
                {discount > 0 && (
                  <span className="absolute top-6 left-6 bg-red-500 text-white text-sm font-black px-4 py-2 rounded-full shadow-lg shadow-red-200 tracking-wider z-10">
                    {discount}% OFF
                  </span>
                )}
              </motion.div>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 transition-all bg-slate-100 snap-start outline-none ${activeImage === i
                      ? 'border-blue-600 shadow-lg shadow-blue-100 ring-4 ring-blue-50 scale-100'
                      : 'border-transparent hover:border-slate-300 hover:shadow-md scale-95 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover mix-blend-multiply" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: PRODUCT INFO */}
            <div className="lg:py-4">
              <div className="flex items-center justify-between mb-4">
                {product.brand && (
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                    {product.brand}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${outOfStock ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                    {outOfStock ? 'Sold Out' : `${product.stock} Available`}
                  </span>
                </div>
              </div>

              <h1 className="font-['Poppins'] text-3xl sm:text-4xl xl:text-5xl font-black text-slate-900 leading-[1.1] mb-4 tracking-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <p className="text-sm text-slate-400 font-mono font-medium">SKU: {product.sku || 'N/A'}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                {reviews.length > 0 ? (
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={16} className={`${i <= Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-400 underline underline-offset-4">({reviews.length} reviews)</span>
                  </div>
                ) : (
                  <span
                    className="text-sm font-medium text-blue-600 flex items-center gap-1 cursor-pointer hover:underline underline-offset-4"
                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Star size={16} /> Be the first to review
                  </span>
                )}
              </div>

              <div className="flex items-end gap-4 mb-8 pb-8 border-b border-slate-100">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {currencyLoading ? '...' : convertPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-slate-400 line-through font-bold mb-1">
                    {currencyLoading ? '...' : convertPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* 👈 NAYA FIX: COLOR SWATCH UI */}
              {availableColors.length > 0 && (
                <div className="mb-8">
                  <label className="mb-3 block text-sm font-black uppercase tracking-widest text-slate-900">
                    Select Color <span className="font-medium text-slate-500 ml-2 capitalize">({selectedColor})</span>
                  </label>
                  <ColorSwatch colors={availableColors} selectedColor={selectedColor} onColorChange={setSelectedColor} />
                </div>
              )}

              {/* Size selector & Size Guide */}
              {validSizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-black uppercase tracking-widest text-slate-900">Select Size</span>
                    {/* 👈 NAYA FIX: SIZE GUIDE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider underline underline-offset-4 focus:outline-none"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {validSizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[4rem] h-12 px-4 text-sm font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 ${selectedSize === size
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-10">
                <span className="text-sm font-black uppercase tracking-widest text-slate-900 block mb-4">Quantity</span>
                <div className="inline-flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-10 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm font-black text-lg flex items-center justify-center transition-all focus:outline-none">−</button>
                  <span className="w-12 text-center font-black text-lg text-slate-900">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-12 h-10 rounded-xl text-slate-600 hover:bg-white hover:shadow-sm font-black text-lg flex items-center justify-center transition-all focus:outline-none">+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-12">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={outOfStock || adding}
                  className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white py-4 sm:py-5 rounded-2xl font-black text-[15px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  {adding ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <ShoppingBag size={22} />
                    </motion.div>
                  ) : (
                    <><ShoppingBag size={22} /> {outOfStock ? 'Sold Out' : 'Add to Cart'}</>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleWishlist}
                  className={`w-14 sm:w-16 h-auto rounded-2xl border-2 flex items-center justify-center transition-all focus:outline-none ${inWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  <Heart size={24} className={inWishlist ? 'fill-current' : ''} />
                </motion.button>
              </div>

              {/* Accordions */}
              <div className="border-b border-slate-200" id="reviews-section">
                <Accordion title="Description" defaultOpen={true}>
                  <p>{product.description || 'Elevate your style with this premium footwear. Crafted for maximum comfort and durability.'}</p>
                </Accordion>
                <Accordion title="Product Details">
                  <ul className="grid grid-cols-2 gap-4">
                    {product.brand && <li><span className="text-slate-400 text-xs uppercase block">Brand</span> <span className="font-bold">{product.brand}</span></li>}
                    <li><span className="text-slate-400 text-xs uppercase block">Category</span> <span className="font-bold capitalize">{product.category}</span></li>
                    {availableColors.length > 0 && (
                      <li><span className="text-slate-400 text-xs uppercase block">Colors</span> <span className="font-bold">{availableColors.join(', ')}</span></li>
                    )}
                  </ul>
                </Accordion>

                {/* REVIEWS SECTION */}
                <Accordion title="Customer Reviews">
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><MessageSquare size={18} /> Write a Review</h4>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button type="button" key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                                <Star size={24} className={`${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} hover:scale-110 transition-transform`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Your Experience</label>
                          <textarea rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Tell us what you think about this product..." className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm focus:border-blue-600 focus:ring-0 transition-colors outline-none"></textarea>
                        </div>
                        <button type="submit" disabled={submittingReview} className="px-6 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {reviews.length > 0 ? (
                        reviews.map((review: any) => (
                          <div key={review.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                  {review.user?.image ? (
                                    <img src={review.user.image} alt={review.user.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <User size={14} />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{review.user?.name || 'Anonymous'}</p>
                                  <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} size={12} className={`${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 italic text-center py-4">No customer reviews yet. Be the first!</p>
                      )}
                    </div>
                  </div>
                </Accordion>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-24 pt-16 border-t border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-['Poppins'] text-3xl font-black uppercase tracking-tight text-slate-900">You May Also Like</h2>
              </div>
              <ProductGrid products={related} />
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* 👈 NAYA FIX: PURE CSS MODAL HOVERING OVER EVERYTHING */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl z-[10000]">
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-6 py-4">
              <h3 className="text-lg font-black uppercase text-neutral-900 tracking-wider">Size Guide</h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="rounded-full bg-white p-2 text-neutral-400 shadow-sm border border-neutral-200 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-neutral-900">
                    <th className="pb-3 font-bold uppercase text-neutral-900 tracking-wider">US</th>
                    <th className="pb-3 font-bold uppercase text-neutral-900 tracking-wider">UK</th>
                    <th className="pb-3 font-bold uppercase text-neutral-900 tracking-wider">CM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[{ us: '7', uk: '6', cm: '25.0' }, { us: '8', uk: '7', cm: '26.0' }, { us: '9', uk: '8', cm: '27.0' }, { us: '10', uk: '9', cm: '28.0' }, { us: '11', uk: '10', cm: '29.0' }].map((row) => (
                    <tr key={row.us} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 font-black text-neutral-900">{row.us}</td>
                      <td className="py-3 font-medium text-neutral-500">{row.uk}</td>
                      <td className="py-3 font-medium text-neutral-500">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4 text-xs text-blue-800">
                <p><strong>Note:</strong> We recommend ordering the next size up for half sizes.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const slug = (params?.slug || params?.id) as string;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true, image: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) return { notFound: true };

    const related = await prisma.product.findMany({
      where: { category: product.category, id: { not: product.id }, isActive: true },
      take: 4,
    });

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