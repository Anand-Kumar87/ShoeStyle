'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Tag } from 'lucide-react';
import CartDrawer from '@/components/cart/CartDrawer';
import CurrencySwitcher from '@/components/common/CurrencySwitcher';
import { useSession, signOut } from 'next-auth/react';

// 🔥 1. Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

const Header: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotalItems } = useCart();
  const { wishlist } = useWishlist();

  // 🔥 2. Extract convertPrice aur Shipping Threshold
  const { convertPrice, freeShippingThreshold } = useGlobalCurrency();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState<string | null>(null);

  // Mounted state & Coupon state
  const [mounted, setMounted] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<{ code: string, discount: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    // 🔥 3. Fetch Active Coupon from DB on Mount
    const fetchBannerCoupon = async () => {
      try {
        const res = await fetch('/api/coupons'); // Assuming this returns all coupons
        if (res.ok) {
          const data = await res.json();
          const validCoupon = data.find((c: any) => c.isActive); // Find first active coupon

          if (validCoupon) {
            let discountText = 'FLAT DISCOUNT';
            if (validCoupon.discountType === 'PERCENTAGE') discountText = `${validCoupon.discountValue}% OFF`;
            else if (validCoupon.discountType === 'FREE_SHIPPING') discountText = `FREE SHIPPING`;

            setActiveCoupon({ code: validCoupon.code, discount: discountText });
          }
        }
      } catch (error) {
        console.log("No active coupons found for banner");
      }
    };

    fetchBannerCoupon();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navigation = [
    {
      name: 'New Arrivals',
      href: '/products?isNew=true',
      mega: [
        { title: 'Latest Drops', items: ['Sneakers', 'Running', 'Basketball', 'Lifestyle'] },
        { title: 'Trending', items: ['Limited Edition', 'Collaborations', 'Best Sellers'] }
      ]
    },
    {
      name: 'Men',
      href: '/products?category=men',
      mega: [
        { title: 'Categories', items: ['Running', 'Training', 'Basketball', 'Lifestyle', 'Sandals'] },
        { title: 'Collections', items: ['Performance', 'Sportswear', 'Classics'] }
      ]
    },
    {
      name: 'Women',
      href: '/products?category=women',
      mega: [
        { title: 'Categories', items: ['Running', 'Training', 'Yoga', 'Lifestyle', 'Sandals'] },
        { title: 'Collections', items: ['Performance', 'Sportswear', 'Classics'] }
      ]
    },
    { name: 'Sale', href: '/sale', highlight: true },
  ];

  return (
    <>
      {/* 🔥 PREMIUM: Floating Currency Switcher */}
      <CurrencySwitcher />

      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'}`}>

        {/* 🔥 PREMIUM DYNAMIC BANNER */}
        <div className="bg-black text-white text-center py-2 text-xs sm:text-sm font-medium tracking-wide">
          {mounted ? (
            <div className="flex items-center justify-center gap-2 flex-wrap px-4">
              <span>Free Shipping on Orders Over {convertPrice(freeShippingThreshold)}</span>
              <span className="hidden sm:inline text-neutral-600">|</span>

              {activeCoupon ? (
                <span className="text-lime-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <Tag size={14} className="text-lime-400" />
                  Use code <span className="bg-white text-black px-1.5 py-0.5 rounded text-[10px] uppercase tracking-widest font-black shadow-[0_0_10px_rgba(255,255,255,0.3)]">{activeCoupon.code}</span> for {activeCoupon.discount}!
                </span>
              ) : (
                <span className="text-lime-400 font-bold">New Arrivals Daily</span>
              )}
            </div>
          ) : (
            <span>Free Shipping on Orders Over $100 | <span className="text-lime-400 font-bold">New Arrivals Daily</span></span>
          )}
        </div>

        <div className="border-b border-neutral-200/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6 text-neutral-800" /> : <Menu className="h-6 w-6 text-neutral-800" />}
              </button>

              {/* Logo */}
              <Link href="/" className="flex items-center group">
                <span className="text-2xl sm:text-3xl font-display font-black tracking-tighter text-neutral-900 group-hover:text-black transition-colors">
                  SHOESTYLE
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex lg:gap-8 h-full">
                {navigation.map((item) => (
                  <div
                    key={item.name}
                    className="relative flex items-center h-full group"
                    onMouseEnter={() => item.mega && setMegaMenuOpen(item.name)}
                    onMouseLeave={() => setMegaMenuOpen(null)}
                  >
                    <Link
                      href={item.href}
                      className={`text-sm font-bold tracking-wide transition-colors flex items-center gap-1.5 ${item.highlight ? 'text-red-600 hover:text-red-700' : 'text-neutral-600 hover:text-black'}`}
                    >
                      {item.name}
                      {item.mega && <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaMenuOpen === item.name ? 'rotate-180' : ''}`} />}
                    </Link>

                    {/* Mega Menu */}
                    <AnimatePresence>
                      {item.mega && megaMenuOpen === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute left-0 top-full pt-2 w-[400px]"
                        >
                          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-neutral-100 p-8 overflow-hidden">
                            <div className="grid grid-cols-2 gap-8">
                              {item.mega.map((section) => (
                                <div key={section.title}>
                                  <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-4">{section.title}</h3>
                                  <ul className="space-y-3">
                                    {section.items.map((subItem) => (
                                      <li key={subItem}>
                                        <Link
                                          href={`${item.href}${item.href.includes('?') ? '&' : '?'}subcategory=${encodeURIComponent(subItem.toLowerCase())}`}
                                          className="text-sm font-medium text-neutral-600 hover:text-black hover:translate-x-1 inline-block transition-all duration-200"
                                        >
                                          {subItem}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-neutral-700" />
                </button>

                <Link href="/wishlist" className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors group">
                  <Heart className="h-5 w-5 text-neutral-700 group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                  {mounted && wishlist.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white"
                    >
                      {wishlist.length}
                    </motion.span>
                  )}
                </Link>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  aria-label="Cart"
                >
                  <ShoppingBag className="h-5 w-5 text-neutral-700" />
                  {mounted && totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold border-2 border-white"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </button>

                <div className="hidden sm:block relative group ml-2">
                  {session?.user ? (
                    <>
                      <button className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-full border border-transparent hover:border-neutral-200 transition-all">
                        {session.user.image ? (
                          <Image src={session.user.image} alt={session.user.name || 'User'} width={28} height={28} className="rounded-full" />
                        ) : (
                          <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 text-neutral-500 mr-1" />
                      </button>
                      <div className="absolute right-0 mt-2 hidden w-48 rounded-xl bg-white py-2 shadow-xl border border-neutral-100 group-hover:block z-50">
                        <div className="px-4 py-2 border-b border-neutral-100 mb-2">
                          <p className="text-sm font-bold text-neutral-900 truncate">{session.user.name}</p>
                          <p className="text-xs text-neutral-500 truncate">{session.user.email}</p>
                        </div>
                        <Link href="/account" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-black font-medium">My Account</Link>
                        <Link href="/orders" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-black font-medium">Orders</Link>
                        {session.user.role === 'admin' && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-bold">Admin Panel</Link>
                        )}
                        <button
                          onClick={() => signOut()}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 font-medium mt-2 border-t border-neutral-100 pt-3"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <Link href="/auth/signin" className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-full transition-colors text-sm font-bold text-neutral-700">
                      <User className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-neutral-200 bg-neutral-50/90 backdrop-blur-sm absolute w-full"
            >
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 group-focus-within:text-black transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for sneakers, brands, styles..."
                    className="w-full rounded-full border-2 border-neutral-200 bg-white py-4 pl-12 pr-12 focus:border-black focus:ring-0 focus:outline-none transition-all text-sm font-medium shadow-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-neutral-200 lg:hidden bg-white shadow-xl absolute w-full h-[calc(100vh-100px)] overflow-y-auto"
            >
              <nav className="px-4 py-6 space-y-2 max-w-md mx-auto">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-4 rounded-xl font-bold text-lg ${item.highlight ? 'text-red-600 bg-red-50/50' : 'text-neutral-800 hover:bg-neutral-50'}`}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="h-px bg-neutral-100 my-6"></div>

                {session?.user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-3 flex items-center gap-3 bg-neutral-50 rounded-xl mb-4">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{session.user.name}</p>
                        <p className="text-xs text-neutral-500">{session.user.email}</p>
                      </div>
                    </div>
                    <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 hover:text-black">My Account</Link>
                    <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-medium text-neutral-600 hover:bg-neutral-50 hover:text-black">Orders</Link>
                    {session.user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-blue-600 hover:bg-blue-50">Admin Panel</Link>
                    )}
                    <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-4 py-3 mt-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Sign Out</button>
                  </div>
                ) : (
                  <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-4 rounded-xl font-bold bg-black text-white text-center shadow-md">
                    Sign In / Create Account
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </>
  );
};

export default Header;
