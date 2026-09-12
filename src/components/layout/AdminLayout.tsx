import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  Tag,
  BarChart2,
  LogOut,
  Moon,
  Sun,
  Layers,
  Settings,
  Star,
  Menu,
  X,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useAdminTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('shoestyle-admin-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light';
    setTheme(initial);
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('shoestyle-admin-theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return { theme, isDark: theme === 'dark', toggleTheme, mounted };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isDark, toggleTheme, mounted } = useAdminTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(router.asPath);

  useEffect(() => {
    setActiveRoute(router.asPath);
    setMobileMenuOpen(false);
  }, [router.asPath]);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Box },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    { name: 'Observability', href: '/admin/observability', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm group-hover:bg-blue-700 transition-colors shadow-sm">
            S
          </div>
          <span className="font-black tracking-tighter text-slate-900 dark:text-white text-lg">
            SHOESTYLE <span className="text-slate-300 dark:text-slate-600 font-medium ml-1">↗</span>
          </span>
        </Link>
        {mobileMenuOpen && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 overflow-y-auto scroll-smooth space-y-1.5 admin-nav-scrollbar">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3">
          Menu
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const currentPath = activeRoute || router.asPath;
          const isActive = currentPath === item.href || (item.href !== '/admin' && currentPath.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onClick={() => setActiveRoute(item.href)}
              className="block group relative"
            >
              <div
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-black shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white group-hover:translate-x-0.5'
                }`}
              >
                {/* 🚀 Smooth GPU-accelerated active line indicator (no jump/stutter) */}
                <div
                  className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-500 transition-all duration-250 ease-out ${
                    isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
                  }`}
                />
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
            {session?.user?.name ? session.user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-white truncate">
              {session?.user?.name || 'Admin'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          {/* 🔥 Functional Dark / Light Mode Button */}
          <button
            onClick={toggleTheme}
            type="button"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-2 p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
          >
            {mounted && isDark ? (
              <>
                <Sun size={18} className="text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={18} className="text-slate-600 dark:text-slate-300" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5 text-xs font-bold"
            title="Sign Out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#080d1a] overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 🚀 DESKTOP FIXED SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 flex flex-col hidden lg:flex flex-shrink-0 transition-colors duration-200">
        <SidebarContent />
      </aside>

      {/* 📱 MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 🚀 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto scroll-smooth w-full relative flex flex-col bg-slate-50 dark:bg-[#080d1a] transition-colors duration-200 admin-nav-scrollbar">
        {/* Mobile Header */}
        <div className="lg:hidden h-16 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 flex items-center px-4 justify-between sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <div className="font-black tracking-tighter text-slate-900 dark:text-white text-base">
              SHOESTYLE
            </div>
          </div>

          {/* Top header quick theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mounted && isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex-1">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .admin-nav-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .admin-nav-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-nav-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.25);
          border-radius: 9999px;
        }
        .admin-nav-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        .dark .admin-nav-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.35);
        }
        .dark .admin-nav-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(51, 65, 85, 0.6);
        }
      `}</style>
    </div>
  );
}