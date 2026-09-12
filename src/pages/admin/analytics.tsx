import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Globe2,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  RefreshCw,
  ShoppingBag,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface TimelinePoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  image: string;
  unitsSold: number;
  totalRevenue: number;
}

interface Stats {
  revenue: number;
  orders: number;
  users: number;
  products: number;
  avgOrderValue: number;
  totalUnitsSold: number;
  statusCounts: Record<string, { count: number; revenue: number }>;
  timeline: TimelinePoint[];
  topProducts: TopProduct[];
  geo: {
    domestic: { count: number; revenue: number };
    international: { count: number; revenue: number };
  };
  paymentMethods: Record<string, number>;
}

import { useAdminData } from '@/lib/adminCache';

const containerVariants = { animate: { transition: { staggerChildren: 0.08 } } };
const itemVariants = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'orders'>('revenue');
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const {
    data: stats,
    loading,
    refreshing,
    refresh: fetchAnalytics,
  } = useAdminData<Stats>('admin_analytics', async () => {
    const res = await fetch('/api/admin/analytics');
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  });

  const metrics = stats ? [
    { label: 'Total Revenue', value: currencyLoading ? '...' : convertPrice(stats.revenue), sub: 'Lifetime gross earnings', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-100 dark:border-emerald-900/50' },
    { label: 'Total Orders', value: stats.orders.toLocaleString(), sub: 'All completed & live orders', icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-100 dark:border-blue-900/50' },
    { label: 'Registered Customers', value: stats.users.toLocaleString(), sub: 'Customer accounts on file', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-100 dark:border-purple-900/50' },
    { label: 'Active Catalog Items', value: stats.products.toLocaleString(), sub: 'Live shoe styles in store', icon: Package, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-100 dark:border-orange-900/50' },
  ] : [];

  // Max value calculation for timeline chart
  const maxRevenue = stats?.timeline ? Math.max(...stats.timeline.map(t => t.revenue), 1) : 1;
  const maxOrders = stats?.timeline ? Math.max(...stats.timeline.map(t => t.orders), 1) : 1;

  // Status mapping
  const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
    DELIVERED: { label: 'Delivered', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
    SHIPPED: { label: 'Shipped / In Transit', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500' },
    PROCESSING: { label: 'Processing', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500' },
    CONFIRMED: { label: 'Confirmed', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500' },
    PENDING: { label: 'Pending Payment/Review', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' },
  };

  // Domestic vs International percentage
  const totalGeoOrders = (stats?.geo.domestic.count || 0) + (stats?.geo.international.count || 0);
  const domesticPct = totalGeoOrders > 0 ? Math.round(((stats?.geo.domestic.count || 0) / totalGeoOrders) * 100) : 100;
  const internationalPct = 100 - domesticPct;

  return (
    <>
      <Head><title>Executive Analytics | ShoeStyle Admin</title></Head>
      <AdminLayout>
        <div className="min-h-screen p-6 sm:p-10 bg-slate-50 dark:bg-[#080d1a] transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Premium Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Store Performance</p>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Executive Analytics</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTab('revenue')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'revenue' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                  >
                    Revenue View
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                  >
                    Order Volume
                  </button>
                </div>

                <button
                  onClick={() => fetchAnalytics(true)}
                  disabled={refreshing || loading}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50"
                  title="Refresh Live Analytics"
                >
                  <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                </button>
              </div>
            </motion.div>

            {/* Core 4 Metric Cards */}
            <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {!stats
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-3xl p-6 h-[160px] animate-pulse bg-slate-200 dark:bg-slate-800" />
                ))
                : metrics.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      variants={itemVariants}
                      className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all relative overflow-hidden group"
                    >
                      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 dark:opacity-20 group-hover:scale-150 transition-transform duration-500 ease-in-out`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.bg} ${stat.color} ${stat.border}`}>
                            <Icon size={24} strokeWidth={2.5} />
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                            <ArrowUpRight size={13} /> Live
                          </div>
                        </div>
                        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2 mb-1">
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                        </div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{stat.sub}</p>
                      </div>
                    </motion.div>
                  );
                })
              }
            </motion.div>

            {/* Quick KPI Strip */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Average Order Value</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {currencyLoading ? '...' : convertPrice(stats.avgOrderValue)}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Units Sold</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {stats.totalUnitsSold} pairs
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Globe2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Domestic vs Global</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {domesticPct}% IN / {internationalPct}% Intl
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Primary Payment</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">Razorpay Live</p>
                  </div>
                </div>
              </div>
            )}

            {/* 7-Day Revenue Trend Chart */}
            {stats && stats.timeline && (
              <div className="bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                      7-Day Sales & Demand Trend
                    </h2>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Visual breakdown of daily transactions and store velocity.
                    </p>
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    Mode: {activeTab === 'revenue' ? 'Gross Revenue' : 'Order Count'}
                  </span>
                </div>

                {/* Interactive SVG / CSS Chart */}
                <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-8 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
                  {stats.timeline.map((point, index) => {
                    const value = activeTab === 'revenue' ? point.revenue : point.orders;
                    const maxVal = activeTab === 'revenue' ? maxRevenue : maxOrders;
                    const heightPercent = maxVal > 0 ? Math.max(Math.round((value / maxVal) * 100), 10) : 10;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl z-20 whitespace-nowrap">
                          {activeTab === 'revenue' ? (currencyLoading ? '...' : convertPrice(point.revenue)) : `${point.orders} orders`}
                          <span className="block text-[9px] text-slate-300 font-normal">{point.date}</span>
                        </div>

                        {/* Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`w-full max-w-[48px] rounded-t-2xl transition-all ${
                            activeTab === 'revenue'
                              ? 'bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-700 group-hover:to-indigo-600 shadow-lg shadow-blue-500/20'
                              : 'bg-gradient-to-t from-purple-600 to-pink-500 group-hover:from-purple-700 group-hover:to-pink-600 shadow-lg shadow-purple-500/20'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Day Labels */}
                <div className="flex items-center justify-between gap-3 sm:gap-6 pt-3 px-2">
                  {stats.timeline.map((point, index) => (
                    <div key={index} className="flex-1 text-center">
                      <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">{point.label.split(',')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {activeTab === 'revenue' ? (currencyLoading ? '...' : convertPrice(point.revenue)) : `${point.orders} ord`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid: Order Status Funnel + Top Products Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* 1. Order Status Funnel / Pipeline */}
              <div className="bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Order Pipeline & Fulfillment</h2>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Live order status distribution across your store</p>
                  </div>
                </div>

                {stats && stats.statusCounts && (
                  <div className="space-y-4">
                    {Object.entries(statusMeta).map(([statusKey, meta]) => {
                      const data = stats.statusCounts[statusKey] || { count: 0, revenue: 0 };
                      const pct = stats.orders > 0 ? Math.round((data.count / stats.orders) * 100) : 0;

                      return (
                        <div key={statusKey} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${meta.bg}`} />
                              {meta.label}
                            </span>
                            <span className="font-bold text-slate-500 dark:text-slate-400">
                              {data.count} orders ({pct}%) • {currencyLoading ? '...' : convertPrice(data.revenue)}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6 }}
                              className={`h-full ${meta.bg} rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Top Selling Products Leaderboard */}
              <div className="bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Award size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Top Performing Shoes</h2>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Highest volume models by customer demand</p>
                  </div>
                </div>

                {stats && stats.topProducts && stats.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topProducts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <div className="flex items-center gap-3.5">
                          <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            #{idx + 1}
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                            ) : (
                              <Package size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                              {p.unitsSold} pairs ordered
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sales</p>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {currencyLoading ? '...' : convertPrice(p.totalRevenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-bold text-sm">
                    No product purchase data recorded yet.
                  </div>
                )}
              </div>

            </div>

            {/* Geographic & International Deliveries Card */}
            {stats && (
              <div className="bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Globe2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Territory & Cross-Border Delivery Reach</h2>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Domestic Indian orders vs Shiprocket X International shipments</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">🇮🇳 Domestic (India)</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">{domesticPct}% Share</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                      {stats.geo.domestic.count} Orders
                    </p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Total Domestic Revenue: <strong>{currencyLoading ? '...' : convertPrice(stats.geo.domestic.revenue)}</strong>
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300">🌍 International (220+ Countries)</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{internationalPct}% Share</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                      {stats.geo.international.count} Orders
                    </p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Total Cross-Border Revenue: <strong>{currencyLoading ? '...' : convertPrice(stats.geo.international.revenue)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return { redirect: { destination: '/auth/signin', permanent: false } };
  }

  return { props: {} };
};