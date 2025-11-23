'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  CreditCard,
  ShieldCheck
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <footer className="mt-auto bg-neutral-900 text-neutral-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <h2 className="text-2xl font-bold text-white">ShoeStyle</h2>
            </Link>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-neutral-400">
              Your ultimate destination for premium footwear. Discover the latest trends and timeless classics with exceptional quality and style.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
                <span className="text-neutral-400">123 Fashion Street, NY 10001, USA</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                <a href="tel:+1234567890" className="text-neutral-400 hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-neutral-500" />
                <a href="mailto:support@shoestyle.com" className="text-neutral-400 hover:text-white transition-colors">
                  support@shoestyle.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/sale" className="hover:text-white transition-colors">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-white transition-colors">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Categories
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products?category=sneakers" className="hover:text-white transition-colors">
                  Sneakers
                </Link>
              </li>
              <li>
                <Link href="/products?category=boots" className="hover:text-white transition-colors">
                  Boots
                </Link>
              </li>
              <li>
                <Link href="/products?category=casual" className="hover:text-white transition-colors">
                  Casual Shoes
                </Link>
              </li>
              <li>
                <Link href="/products?category=athletic" className="hover:text-white transition-colors">
                  Athletic
                </Link>
              </li>
              <li>
                <Link href="/products?category=formal" className="hover:text-white transition-colors">
                  Formal Shoes
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Subscribe to our Newsletter
              </h3>
              <p className="text-sm text-neutral-400">
                Get the latest updates on new products and upcoming sales
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg bg-neutral-800 px-4 py-3 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              </div>
              <button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-all hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribeStatus === 'loading' ? (
                  'Subscribing...'
                ) : subscribeStatus === 'success' ? (
                  '✓ Subscribed!'
                ) : (
                  <>
                    Subscribe
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Social Media & Payment Methods */}
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-400">Follow Us:</span>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-neutral-800 p-2 text-neutral-400 transition-all hover:bg-neutral-700 hover:text-white"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-neutral-800 p-2 text-neutral-400 transition-all hover:bg-neutral-700 hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-neutral-800 p-2 text-neutral-400 transition-all hover:bg-neutral-700 hover:text-white"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-neutral-800 p-2 text-neutral-400 transition-all hover:bg-neutral-700 hover:text-white"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-400">We Accept:</span>
              <div className="flex gap-2">
                <div className="rounded bg-white px-2 py-1">
                  <CreditCard className="h-5 w-8 text-neutral-700" />
                </div>
                <div className="rounded bg-white px-2 py-1 text-xs font-bold text-neutral-700 flex items-center">
                  VISA
                </div>
                <div className="rounded bg-white px-2 py-1 text-xs font-bold text-neutral-700 flex items-center">
                  MC
                </div>
                <div className="rounded bg-white px-2 py-1 text-xs font-bold text-blue-600 flex items-center">
                  PayPal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
            <p className="text-neutral-500">
              © {new Date().getFullYear()} ShoeStyle. All rights reserved.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link 
                href="/privacy" 
                className="text-neutral-500 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-neutral-500 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/cookies" 
                className="text-neutral-500 hover:text-white transition-colors"
              >
                Cookie Policy
              </Link>
              <div className="flex items-center gap-2 text-neutral-500">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure Shopping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;