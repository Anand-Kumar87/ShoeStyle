'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Package, ShoppingCart, Tag, BarChart3, Users, Settings } from 'lucide-react';
import ProductManager from '@/components/admin/ProductManager';
import OrderManager from '@/components/admin/OrderManager';
import CouponManager from '@/components/admin/CouponManager';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    router.push('/auth/signin');
    return null;
  }

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard | ShoeStyle</title>
      </Head>

      <div className="flex min-h-screen bg-neutral-50">
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-200 bg-white">
          <div className="sticky top-0">
            <div className="border-b border-neutral-200 p-6">
              <Link href="/" className="text-xl font-bold text-neutral-900">
                ShoeStyle Admin
              </Link>
            </div>

            <nav className="p-4">
              <ul className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'coupons' && <CouponManager />}
          {activeTab === 'analytics' && (
            <div className="text-center text-neutral-500">Analytics coming soon...</div>
          )}
          {activeTab === 'customers' && (
            <div className="text-center text-neutral-500">Customer management coming soon...</div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center text-neutral-500">Settings coming soon...</div>
          )}
        </main>
      </div>
    </>
  );
}