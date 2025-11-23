import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingCart, 
  FiUsers, 
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiTag
} from 'react-icons/fi';
import { useState } from 'react';

interface AdminPageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
  };
}

export default function AdminDashboard({ user, stats }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, href: '/admin' },
    { id: 'products', label: 'Products', icon: FiPackage, href: '/admin/products' },
    { id: 'orders', label: 'Orders', icon: FiShoppingCart, href: '/admin/orders' },
    { id: 'users', label: 'Users', icon: FiUsers, href: '/admin/users' },
    { id: 'coupons', label: 'Coupons', icon: FiTag, href: '/admin/coupons' },
    { id: 'settings', label: 'Settings', icon: FiSettings, href: '/admin/settings' },
  ];

  const statCards = [
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: FiPackage, 
      color: 'from-blue-500 to-blue-600',
      change: '+12%'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: FiShoppingCart, 
      color: 'from-purple-500 to-purple-600',
      change: '+8%'
    },
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: FiUsers, 
      color: 'from-green-500 to-green-600',
      change: '+23%'
    },
    { 
      title: 'Revenue', 
      value: `$${stats.totalRevenue.toFixed(2)}`, 
      icon: FiDollarSign, 
      color: 'from-orange-500 to-orange-600',
      change: '+15%'
    },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard - ShoeStyle</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}!</p>
              </div>
              <Link 
                href="/"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Back to Store
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === item.id
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="text-lg" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="text-3xl opacity-80" />
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/products/new"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FiPackage className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Add New Product</h3>
                  <p className="text-sm text-gray-600">Create a new product listing</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FiShoppingCart className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Manage Orders</h3>
                  <p className="text-sm text-gray-600">View and process orders</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/coupons/new"
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <FiTag className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Create Coupon</h3>
                  <p className="text-sm text-gray-600">Add promotional codes</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiShoppingCart className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">New order received</p>
                  <p className="text-sm text-gray-600">Order #12345 - $150.00</p>
                </div>
                <span className="text-sm text-gray-500">2 min ago</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiUsers className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">New user registered</p>
                  <p className="text-sm text-gray-600">john@example.com</p>
                </div>
                <span className="text-sm text-gray-500">15 min ago</span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiPackage className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Product stock low</p>
                  <p className="text-sm text-gray-600">Nike Air Max - 3 items left</p>
                </div>
                <span className="text-sm text-gray-500">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Check if user is authenticated
  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/admin',
        permanent: false,
      },
    };
  }

  // Check if user is admin
  if (session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Fetch stats (you'll need to import prisma)
  const prisma = (await import('@/lib/prisma')).default;

  const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { total: true },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return {
    props: {
      user: {
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || '',
      },
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
      },
    },
  };
};