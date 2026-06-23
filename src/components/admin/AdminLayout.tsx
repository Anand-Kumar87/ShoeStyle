import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  BarChart2, LogOut, ExternalLink, ChevronRight, Sun, Moon,
  Menu, X, Bell, Search, Loader2
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
];

function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    setDark(d => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('admin-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return { dark, toggle };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { dark, toggle } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- NEW: Real-Time Search & Notification States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowSearchDropdown(false);
  }, [router.pathname]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- NEW: Debounce Logic for Search ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- NEW: Real API Fetch for Search ---
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        // Replace this URL with your actual backend search API endpoint
        const res = await fetch(`/api/admin/search?q=${debouncedTerm}`);
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowSearchDropdown(true);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };
    fetchSearchResults();
  }, [debouncedTerm]);

  // --- NEW: WebSocket connection for Live Notifications ---
  useEffect(() => {
    // Replace with your actual Node.js Server URL
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    socket.on('new-order', (orderData) => {
      setUnreadCount(prev => prev + 1);
      // Optional: Play a sound
      // new Audio('/notification.mp3').play().catch(() => {});
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const activePage = navItems.find(item => item.href === router.pathname)?.label || 'Dashboard';

  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-white/[0.05]">
        <Link href="/" className="flex items-center gap-2 group w-full">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-white text-sm">S</span>
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-sm tracking-wide text-slate-900 dark:text-white flex items-center gap-1.5">
              SHOESTYLE
              <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </h1>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href} className="relative block">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  </motion.div>
                )}
                <Icon size={18} className={`relative z-10 transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                <span className="relative z-10">{label}</span>
                {active && <ChevronRight size={14} className="relative z-10 ml-auto opacity-60" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile & Controls */}
      <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#0A0A0B]/50 mt-auto">
        {session?.user && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-sm mb-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center ring-2 ring-white dark:ring-[#111] shadow-sm">
              {session.user.image ? (
                <Image src={session.user.image} alt="" width={36} height={36} className="object-cover" />
              ) : (
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {(session.user.name || session.user.email || 'A')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {session.user.name || 'Admin User'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex items-center justify-center p-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#050505] overflow-hidden selection:bg-blue-500/30">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: dark ? 'rgba(24, 24, 27, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            color: dark ? '#f8fafc' : '#0f172a',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          },
        }}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] flex-shrink-0 bg-white/70 dark:bg-[#0A0A0B]/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/[0.05] z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[260px] bg-white dark:bg-[#0A0A0B] border-r border-slate-200/50 dark:border-white/[0.05] z-50 flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-slate-200/50 dark:border-white/[0.05] bg-white/50 dark:bg-[#0A0A0B]/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white/90 hidden sm:block">
              {activePage}
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">

            {/* Real Dynamic Search Area */}
            <div className="relative w-full max-w-md" ref={searchRef}>
              <div className="flex items-center px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-white/5 border border-transparent focus-within:border-blue-500/50 dark:focus-within:border-blue-500/50 transition-all">
                <Search size={16} className="text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search orders, SKU..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
                />
                {isSearching && <Loader2 size={14} className="animate-spin text-blue-500 ml-2" />}
              </div>

              {/* Real Search Dropdown Results */}
              <AnimatePresence>
                {showSearchDropdown && searchTerm.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 left-0 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    {searchResults.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Results</div>
                        {searchResults.map((item, idx) => (
                          <Link href={item.url || '#'} key={idx}>
                            <div className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title || item.name}</span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">ID: {item.id}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      !isSearching && (
                        <div className="p-4 text-sm text-slate-500 text-center">
                          No results found for "{searchTerm}"
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Real Notification Bell */}
            <button
              onClick={() => setUnreadCount(0)} // Resets notifications on click
              className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex-shrink-0"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-[#0A0A0B] shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth relative z-0">
          <div className="max-w-7xl mx-auto h-full">
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="min-h-full rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.02] shadow-sm backdrop-blur-sm p-4 sm:p-6"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}