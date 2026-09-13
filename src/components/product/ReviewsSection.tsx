import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, CheckCircle, ThumbsUp, Camera, Play, X,
  ChevronLeft, ChevronRight, Filter, MessageSquare,
  Sparkles, ShieldCheck, AlertCircle, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewUser {
  id?: string;
  name?: string | null;
  image?: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  images: string[];
  isVerifiedPurchase?: boolean;
  isApproved?: boolean;
  helpfulCount?: number;
  createdAt: string;
  user?: ReviewUser | null;
}

interface ReviewsSectionProps {
  productId: string;
  initialReviews: ReviewItem[];
  productName: string;
}

const isVideo = (url: string): boolean => {
  if (!url) return false;
  return Boolean(url.startsWith('data:video') || url.match(/\.(mp4|webm|ogg)$/i));
};

export default function ReviewsSection({ productId, initialReviews, productName }: ReviewsSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || []);
  const [activeStarFilter, setActiveStarFilter] = useState<number | null>(null);
  const [onlyVerifiedFilter, setOnlyVerifiedFilter] = useState(false);
  const [helpfulMarkedIds, setHelpfulMarkedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shoestyle_helpful_reviews');
      if (saved) {
        setHelpfulMarkedIds(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToggleHelpful = async (e: React.MouseEvent, reviewId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const isMarked = helpfulMarkedIds.includes(reviewId);
    const newMarked = isMarked
      ? helpfulMarkedIds.filter(id => id !== reviewId)
      : [...helpfulMarkedIds, reviewId];

    setHelpfulMarkedIds(newMarked);
    try {
      localStorage.setItem('shoestyle_helpful_reviews', JSON.stringify(newMarked));
    } catch (err) {
      // ignore
    }

    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          const currentCount = r.helpfulCount || 0;
          return {
            ...r,
            helpfulCount: isMarked ? Math.max(0, currentCount - 1) : currentCount + 1,
          };
        }
        return r;
      })
    );

    if (!isMarked) {
      toast.success('Thank you! Marked as helpful.', {
        icon: '👍',
        style: { borderRadius: '12px', background: '#000', color: '#fff', fontSize: '13px' },
      });
    }

    try {
      await fetch('/api/reviews/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action: isMarked ? 'decrement' : 'increment' }),
      });
    } catch (err) {
      console.error('Failed to sync helpful vote:', err);
    }
  };

  // Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Media
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; isVideo: boolean } | null>(null);

  // Auto-scroll Carousel State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      if (activeStarFilter !== null && rev.rating !== activeStarFilter) return false;
      if (onlyVerifiedFilter && !rev.isVerifiedPurchase) return false;
      return true;
    });
  }, [reviews, activeStarFilter, onlyVerifiedFilter]);

  // Only animate and duplicate if there are MORE than 3 reviews
  const shouldAnimate = filteredReviews.length > 3;

  // Duplicated reviews list ONLY when animating (> 3 reviews); otherwise 1x exact reviews
  const displayReviews = useMemo(() => {
    if (filteredReviews.length === 0) return [];
    if (!shouldAnimate) return filteredReviews; // Exactly 1x without any duplication
    return [...filteredReviews, ...filteredReviews, ...filteredReviews, ...filteredReviews];
  }, [filteredReviews, shouldAnimate]);

  // Compute rating statistics & breakdown (Saadaa Style)
  const stats = useMemo(() => {
    const total = reviews.length;
    let sum = 0;
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(r => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[star] = (breakdown[star] || 0) + 1;
      sum += r.rating;
    });

    const average = total > 0 ? Number((sum / total).toFixed(1)) : 5.0;
    return { total, average, breakdown };
  }, [reviews]);

  // Continuous Smooth Infinite Auto-Scrolling (ONLY when > 3 reviews)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !shouldAnimate || displayReviews.length === 0) return;

    const scrollSpeed = 0.8; // Smooth 60fps velocity
    let animationFrameId: number;

    const autoScroll = () => {
      if (container && !isPausedRef.current) {
        container.scrollLeft += scrollSpeed;
        // Halfway through the 4x duplicated set, seamlessly wrap back
        const wrapPoint = container.scrollWidth / 2;
        if (wrapPoint > 0 && container.scrollLeft >= wrapPoint) {
          container.scrollLeft -= wrapPoint;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldAnimate, displayReviews.length]);

  // Manual scroll buttons with seamless looping
  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 350;
    const wrapPoint = container.scrollWidth / 2;

    if (direction === 'left') {
      container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      if (wrapPoint > 0 && container.scrollLeft < 0) {
        container.scrollLeft += wrapPoint;
      }
    } else {
      container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      if (wrapPoint > 0 && container.scrollLeft >= wrapPoint) {
        container.scrollLeft -= wrapPoint;
      }
    }
  };

  // Media upload handler
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(f => {
        if (f.size > 25 * 1024 * 1024) {
          toast.error(`${f.name} is too large. Max 25MB allowed.`);
          return false;
        }
        return true;
      });

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setMediaFiles(prev => [...prev, reader.result as string]);
        };
      });
    }
  };

  const removeMedia = (idx: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Submit Review with Client Validation (Min 20 characters as requested!)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error('Please sign in to write a review');
      router.push('/auth/signin');
      return;
    }

    const trimmed = comment.trim();
    if (trimmed.length < 20) {
      toast.error(`Please write at least 20 characters (current: ${trimmed.length})`, {
        icon: '⚠️',
      });
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Uploading media to bucket and saving review...');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: trimmed,
          media: mediaFiles,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to post review');
      }

      toast.dismiss(toastId);
      toast.success('Review submitted successfully!', { duration: 3000 });
      setReviews(prev => [data, ...prev]);
      setShowReviewModal(false);
      setComment('');
      setMediaFiles([]);
      setRating(5);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || 'Could not submit review', { duration: 4000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border-t border-slate-200 py-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* ======================================================== */}
        {/* 🌟 1. SAADAA-STYLE RATING BREAKDOWN HEADER */}
        {/* ======================================================== */}
        <div className="bg-[#fafafa] rounded-3xl p-6 sm:p-10 border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left: Overall Score (Saadaa Style Large Star & Score) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center lg:border-r lg:border-slate-200/80 pr-0 lg:pr-8">
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={22}
                    className={i <= Math.round(stats.average) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
                  />
                ))}
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-slate-600 mb-1">
                {stats.total} Reviews
              </p>

              {/* Huge Rating Number */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star size={48} className="fill-amber-400 text-amber-400" />
                <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                  {stats.average}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-2">
                Out of 5.0 Rating
              </p>
            </div>

            {/* Center: Rating Distribution Progress Bars */}
            <div className="lg:col-span-5 space-y-2.5">
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.breakdown[star] || 0;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const isSelected = activeStarFilter === star;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setActiveStarFilter(isSelected ? null : star)}
                    className={`w-full flex items-center gap-3 p-1 rounded-xl transition-all text-left group ${
                      isSelected ? 'bg-slate-200/60' : 'hover:bg-slate-100/50'
                    }`}
                  >
                    {/* Star Icons */}
                    <div className="flex items-center gap-0.5 w-24 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= star ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
                        />
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-700 rounded-full transition-all duration-500 group-hover:bg-black"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Count */}
                    <span className="w-10 text-right text-xs font-bold text-slate-600">
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Write Review & Actions */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-stretch justify-center gap-3">
              <button
                onClick={() => setShowReviewModal(true)}
                className="w-full py-4 px-6 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} />
                Write a Review
              </button>

              {activeStarFilter !== null && (
                <button
                  onClick={() => setActiveStarFilter(null)}
                  className="text-xs font-bold text-slate-500 hover:text-black underline underline-offset-4"
                >
                  Clear star filter ({activeStarFilter}★)
                </button>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>100% Verified Customer Reviews</span>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 🌟 2. HORIZONTAL ANIMATED MOTION CAROUSEL */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
                Customer Stories & Feedback
              </h3>
              {activeStarFilter && (
                <span className="px-3 py-1 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider">
                  {activeStarFilter} Stars Only
                </span>
              )}
            </div>

            {/* Left/Right Navigation Arrows (Only when > 3 reviews) */}
            {shouldAnimate && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 active:scale-90 flex items-center justify-center text-slate-700 transition-all shadow-sm cursor-pointer select-none"
                  aria-label="Previous Reviews"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 active:scale-90 flex items-center justify-center text-slate-700 transition-all shadow-sm cursor-pointer select-none"
                  aria-label="Next Reviews"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Track (Infinite Seamless Loop when >3 reviews; Clean Static Row when 1-3 reviews) */}
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => { if (shouldAnimate) isPausedRef.current = true; }}
            onMouseLeave={() => { if (shouldAnimate) isPausedRef.current = false; }}
            onTouchStart={() => { if (shouldAnimate) isPausedRef.current = true; }}
            onTouchEnd={() => { if (shouldAnimate) isPausedRef.current = false; }}
            className={`flex gap-4 ${
              shouldAnimate
                ? 'overflow-x-auto pb-4 scrollbar-hide select-none cursor-grab active:cursor-grabbing'
                : 'flex-wrap sm:flex-nowrap overflow-x-auto pb-4'
            }`}
          >
            {filteredReviews.length === 0 ? (
              <div className="w-full text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400">
                  No reviews match your selected filter.
                </p>
                {activeStarFilter && (
                  <button
                    onClick={() => setActiveStarFilter(null)}
                    className="mt-2 text-xs font-black text-black underline underline-offset-4"
                  >
                    View all reviews
                  </button>
                )}
              </div>
            ) : (
              displayReviews.map((review, idx) => (
                <div
                  key={shouldAnimate ? `${review.id}-loop-${idx}` : `${review.id}-${idx}`}
                  className="flex-shrink-0 w-[300px] sm:w-[350px] p-6 rounded-3xl bg-[#fafafa] border border-slate-100 shadow-sm flex flex-col justify-between snap-start hover:shadow-md hover:border-slate-200 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Header: Name, Verified Badge, Rating */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          {review.user?.name || 'Verified Customer'}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                          <CheckCircle size={12} />
                          <span>Verified Purchase</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium line-clamp-4 group-hover:line-clamp-none transition-all">
                      {review.comment}
                    </p>

                    {/* Customer Photos / Videos */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        {review.images.map((mediaUrl, idx) => {
                          const isVid = isVideo(mediaUrl);
                          return (
                            <button
                              key={idx}
                              onClick={() => setLightboxMedia({ url: mediaUrl, isVideo: isVid })}
                              className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200 hover:scale-105 transition-transform"
                            >
                              {isVid ? (
                                <>
                                  <video src={mediaUrl} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Play size={14} className="fill-white text-white ml-0.5" />
                                  </div>
                                </>
                              ) : (
                                <img src={mediaUrl} alt="review media" className="w-full h-full object-cover" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer: Date & Helpful Thumbs Up */}
                  <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    {(() => {
                      const isMarked = helpfulMarkedIds.includes(review.id);
                      const count = review.helpfulCount || 0;
                      return (
                        <button
                          type="button"
                          onClick={(e) => handleToggleHelpful(e, review.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isMarked
                              ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                              : 'text-slate-500 hover:text-black hover:bg-slate-100'
                          }`}
                          title={isMarked ? 'Marked helpful (Click to remove)' : 'Mark as helpful'}
                        >
                          <ThumbsUp size={13} className={isMarked ? 'fill-blue-600 text-blue-600' : ''} />
                          <span>Helpful{count > 0 ? ` (${count})` : ''}</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 🌟 3. WRITE A REVIEW MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Write a Review
                </h3>
                <p className="text-xs text-slate-500">
                  Sharing your thoughts on <span className="font-bold text-slate-800">{productName}</span>
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Rating Selector */}
                <div className="text-center space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                    Overall Rating
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea (Min 20 characters) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <label>Your Review (Min 20 characters)</label>
                    <span className={comment.trim().length < 20 ? 'text-amber-600' : 'text-emerald-600'}>
                      {comment.trim().length} / 500 chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us about the size, fit, comfort, and build quality of this shoe..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white"
                  />
                  {comment.trim().length > 0 && comment.trim().length < 20 && (
                    <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Need {20 - comment.trim().length} more characters to submit.
                    </p>
                  )}
                </div>

                {/* Media Upload (Bucket Direct Storage) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 block">
                    Add Photos or Video (Saved directly in Cloud Storage bucket)
                  </label>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                        {isVideo(m) ? (
                          <video src={m} className="w-full h-full object-cover" />
                        ) : (
                          <img src={m} alt="preview" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-black flex flex-col items-center justify-center text-slate-400 hover:text-black transition-colors"
                    >
                      <Camera size={20} />
                      <span className="text-[9px] font-black uppercase mt-1">Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || comment.trim().length < 20}
                  className="w-full py-4 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-40 transition-all shadow-md"
                >
                  {submitting ? 'Uploading to Bucket & Submitting...' : 'Post Review'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 🌟 4. LIGHTBOX MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {lightboxMedia && (
          <div
            className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightboxMedia(null)}
          >
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute top-6 right-6 text-white hover:text-slate-300"
            >
              <X size={28} />
            </button>
            <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
              {lightboxMedia.isVideo ? (
                <video src={lightboxMedia.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl" />
              ) : (
                <img src={lightboxMedia.url} alt="Review full image" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
