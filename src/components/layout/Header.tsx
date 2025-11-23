'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { FiHeart } from 'react-icons/fi';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import CartDrawer from '@/components/cart/CartDrawer';
import { useSession, signOut } from 'next-auth/react';

const Header: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, updateQuantity, removeItem, getTotalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { wishlist } = useWishlist();

  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navigation = [
    { name: 'New Arrivals', href: '/products?tag=new' },
    { name: 'Men', href: '/products?category=men' },
    { name: 'Women', href: '/products?category=women' },
    { name: 'Sale', href: '/products?tag=sale' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${isScrolled
          ? 'bg-white shadow-md'
          : 'bg-white/95 backdrop-blur-sm'
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-neutral-900 hover:bg-neutral-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-neutral-900">
                ShoeStyle
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-neutral-600 ${router.pathname === item.href
                    ? 'text-neutral-900'
                    : 'text-neutral-700'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="rounded-lg p-2 text-neutral-900 hover:bg-neutral-100"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative flex items-center gap-2 text-neutral-900 hover:text-pink-600 transition-colors">
                  <FiHeart className="text-xl" />
                  <span className="hidden md:inline">Wishlist</span>
                  {wishlist.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative rounded-lg p-2 text-neutral-900 hover:bg-neutral-100"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-gray-100">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative hidden sm:block">
                {session?.user ? (
                  <div className="group">
                    <button className="flex items-center gap-2 rounded-lg p-2 text-neutral-900 hover:bg-neutral-100">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 hidden w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Orders
                      </Link>
                      {session.user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={() => signOut()}
                        className="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="rounded-lg p-2 text-neutral-900 hover:bg-neutral-100"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-neutral-200"
            >
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full rounded-lg border border-neutral-300 py-3 pl-10 pr-4 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    autoFocus
                  />
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
              className="border-t border-neutral-200 lg:hidden"
            >
              <nav className="space-y-1 px-4 py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-100"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-2" />
                {session?.user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-100"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-100"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-neutral-900 hover:bg-neutral-100"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-100"
                  >
                    Sign In
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
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