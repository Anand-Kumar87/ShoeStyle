import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
// 👈 1. Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface Stats { revenue: number; orders: number; users: number; products: number; }

const containerVariants = { animate: { transition: { staggerChildren: 0.1 } } };
const itemVariants = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);

  // 👈 2. Initialize hook
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(setStats)
      .catch(err => console.error("Failed to load analytics", err));
  }, []);

  // 👈 3. Applied convertPrice to Revenue metrics
  const metrics = stats ? [
    { label: 'Total Revenue', value: currencyLoading ? '...' : convertPrice(stats.revenue), sub: 'All time earnings', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Orders', value: stats.orders.toLocaleString(), sub: 'All time orders', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Registered Users', value: stats.users.toLocaleString(), sub: 'Total accounts', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { label: 'Active Products', value: stats.products.toLocaleString(), sub: 'In catalog', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
  ] : [];

  // 👈 4. Applied convertPrice to Summary Rows
  const summaryRows = stats ? [
    { label: 'Average Order Value', value: stats.orders > 0 ? (currencyLoading ? '...' : convertPrice(stats.revenue / stats.orders)) : '—' },
    { label: 'Revenue per User', value: stats.users > 0 ? (currencyLoading ? '...' : convertPrice(stats.revenue / stats.users)) : '—' },
    { label: 'Orders per User', value: stats.users > 0 ? (stats.orders / stats.users).toFixed(2) : '—' },
    { label: 'Revenue per Product', value: stats.products > 0 ? (currencyLoading ? '...' : convertPrice(stats.revenue / stats.products)) : '—' },
  ] : [];

  return (
    <>
      <Head><title>Analytics | Admin</title></Head>
      <AdminLayout>
        <div className="min-h-screen p-6 sm:p-10">
          <div className="max-w-7xl mx-auto space-y-10">

            {/* Premium Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Insights</p>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Analytics</h1>
              </div>
            </motion.div>

            {/* Metric Cards Grid */}
            <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {!stats
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-3xl p-6 h-[160px] animate-pulse bg-slate-200" />
                ))
                : metrics.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      variants={itemVariants}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      {/* Decorative background element */}
                      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out`}></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.bg} ${stat.color} ${stat.border}`}>
                            <Icon size={24} strokeWidth={2.5} />
                          </div>
                          <TrendingUp size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-2 mb-1">
                          <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                        </div>
                        <p className="text-xs font-semibold text-slate-500">{stat.sub}</p>
                      </div>
                    </motion.div>
                  );
                })
              }
            </motion.div>

            {/* Performance Summary Table */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Performance Summary
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {summaryRows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-8 py-6 transition-colors hover:bg-slate-50">
                      <span className="text-sm font-bold text-slate-500">{label}</span>
                      <span className="text-lg font-black tabular-nums text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

// Authentication Check
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || session.user?.role !== 'admin') {
    return { redirect: { destination: '/auth/signin', permanent: false } };
  }
  return { props: {} };
};