import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, Package, ArrowRight, TrendingUp, Activity, Box } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
// 👈 1. Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 1457.67,
    orders: 14,
    users: 4,
    products: 6
  });

  // 👈 2. Initialize hook
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const statCards = [
    // 👈 3. Applied convertPrice to Total Revenue
    { title: 'Total Revenue', value: currencyLoading ? '...' : convertPrice(stats.revenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+12.5%' },
    { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+5.2%' },
    { title: 'Registered Users', value: stats.users, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', trend: '+2.1%' },
    { title: 'Active Products', value: stats.products, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', trend: 'Stable' },
  ];

  const quickActions = [
    { title: 'Manage Products', desc: 'Add or edit inventory', href: '/admin/products', icon: Box },
    { title: 'View Orders', desc: 'Process customer orders', href: '/admin/orders', icon: ShoppingCart },
    { title: 'Manage Users', desc: 'View customer accounts', href: '/admin/users', icon: Users },
    { title: 'Manage Coupons', desc: 'Create discount codes', href: '/admin/coupons', icon: Activity },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AdminLayout>
      <div className="p-6 sm:p-10">
        <Head><title>Dashboard | Store Admin</title></Head>

        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Overview</p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
              <TrendingUp size={18} className="text-emerald-500" /> Store is performing well
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={index} variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Decorative background element */}
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out`}></div>

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${stat.bg} ${stat.color} ${stat.border}`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
                    <div className="flex items-end gap-3">
                      <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <Link key={index} href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer group flex flex-col h-full"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <ActionIcon size={20} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                      <p className="text-sm text-slate-500 font-medium flex-grow">{action.desc}</p>
                      <div className="mt-4 flex items-center text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                        Go to {action.title.split(' ')[1]} <ArrowRight size={16} className="ml-1" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}