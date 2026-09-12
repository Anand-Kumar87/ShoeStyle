import { useState, useEffect, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Search, Trash2, CheckCircle2, XCircle, Eye, EyeOff,
  Filter, MessageSquare, AlertCircle, RefreshCw, ChevronLeft,
  ChevronRight, ExternalLink, ShieldCheck, ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

interface ReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  reportCount: number;
  createdAt: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  product: {
    id: string;
    name: string;
    image: string;
    slug: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  approvedCount: number;
  pendingCount: number;
  avgRating: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    approvedCount: 0,
    pendingCount: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & previews
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        status: statusFilter,
        rating: ratingFilter,
        search: searchQuery.trim(),
      });

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load reviews');

      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || { totalReviews: 0, approvedCount: 0, pendingCount: 0, avgRating: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(data.pagination?.currentPage || 1);
    } catch (err) {
      toast.error('Could not fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchReviews(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, statusFilter, ratingFilter]);

  // Handle Toggle Approval Status
  const handleToggleApproval = async (review: ReviewItem) => {
    try {
      const nextStatus = !review.isApproved;
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setReviews(prev =>
        prev.map(r => (r.id === review.id ? { ...r, isApproved: nextStatus } : r))
      );

      // Update local stats
      setStats(prev => ({
        ...prev,
        approvedCount: nextStatus ? prev.approvedCount + 1 : prev.approvedCount - 1,
        pendingCount: nextStatus ? prev.pendingCount - 1 : prev.pendingCount + 1,
      }));

      toast.success(nextStatus ? 'Review approved & visible' : 'Review hidden from store');
    } catch (err) {
      toast.error('Failed to change approval status');
    }
  };

  // Handle Delete Review
  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/reviews/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete review');

      toast.success('Review permanently deleted');
      setReviews(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      fetchReviews(currentPage);
    } catch (err) {
      toast.error('Failed to delete review');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Reviews Moderation | ShoeStyle Admin</title>
      </Head>

      <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">

        {/* 🌟 HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Customer Reviews
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Moderate client reviews, filter spam, and ensure authentic feedback for your products.
            </p>
          </div>
          <button
            onClick={() => fetchReviews(currentPage)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* 📊 METRICS BANNER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Reviews</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalReviews}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgRating}</h3>
                <div className="flex items-center text-amber-400">
                  <Star size={18} className="fill-amber-400" />
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star size={22} className="fill-amber-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Approved & Live</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.approvedCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Moderation</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pendingCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
          </div>
        </div>

        {/* 🔍 SEARCH & FILTERS BAR */}
        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reviews, user, product..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl w-full md:w-auto overflow-x-auto">
              {(['ALL', 'APPROVED', 'PENDING'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'ALL' ? 'All Reviews' : tab === 'APPROVED' ? 'Approved' : 'Pending'}
                </button>
              ))}
            </div>

            {/* Star Rating Filter */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              {['ALL', '5', '4', '3', '2', '1'].map(star => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(star)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                    ratingFilter === star
                      ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {star === 'ALL' ? 'Any Rating' : `${star} ★`}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* 📋 REVIEWS TABLE / LIST */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw size={32} className="animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No reviews found</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL' || ratingFilter !== 'ALL'
                  ? 'Try clearing your search or adjusting filters.'
                  : 'Customer product reviews will show up here once submitted.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map(review => (
                <div key={review.id} className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                    {/* Left: User & Product */}
                    <div className="flex items-start gap-4">
                      {/* Product Thumbnail */}
                      <Link href={`/products/${review.product?.slug || ''}`} target="_blank" className="relative w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 group">
                        {review.product?.image ? (
                          <img src={review.product.image} alt={review.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-[10px]">No Pic</div>
                        )}
                      </Link>

                      <div className="space-y-1">
                        {/* Product Name */}
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${review.product?.slug || ''}`} target="_blank" className="font-black text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 line-clamp-1">
                            {review.product?.name}
                            <ExternalLink size={12} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          </Link>
                        </div>

                        {/* Reviewer Details */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{review.user?.name || 'Anonymous User'}</span>
                          <span>•</span>
                          <span>{review.user?.email}</span>
                          {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                              <ShieldCheck size={12} /> Verified
                            </span>
                          )}
                        </div>

                        {/* Stars & Date */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                size={14}
                                className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 dark:fill-slate-700 text-slate-200 dark:text-slate-700'}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Moderation Actions & Status */}
                    <div className="flex items-center gap-2 self-end sm:self-start flex-shrink-0">
                      <button
                        onClick={() => handleToggleApproval(review)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          review.isApproved
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                        }`}
                      >
                        {review.isApproved ? (
                          <>
                            <CheckCircle2 size={14} /> Approved
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} /> Hidden / Pending
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setDeleteTarget(review)}
                        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>

                  {/* Review Text */}
                  <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                    {review.title && <h5 className="font-bold text-slate-900 dark:text-white mb-1">{review.title}</h5>}
                    <p className="whitespace-pre-line">{review.comment}</p>
                  </div>

                  {/* Review Media (Photos/Videos) */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                      {review.images.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setPreviewMedia(imgUrl)}
                          className="relative w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity flex-shrink-0 group"
                        >
                          <img src={imgUrl} alt="review media" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye size={16} className="text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => fetchReviews(currentPage - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => fetchReviews(currentPage + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 🖼️ MEDIA PREVIEW LIGHTBOX */}
      <AnimatePresence>
        {previewMedia && (
          <div className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewMedia(null)}>
            <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-black">
              <img src={previewMedia} alt="Review full preview" className="w-full h-full object-contain" />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Delete this review?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete this review? Any associated images will also be removed from storage and product rating will recalculate.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return {
      redirect: {
        destination: '/auth/signin?error=AccessDenied',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
