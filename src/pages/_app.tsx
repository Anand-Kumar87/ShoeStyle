// @ts-ignore: allow global CSS import without module declarations
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast, { Toaster, ToastBar, useToasterStore } from 'react-hot-toast';

import CookieBanner from '@/components/ui/CookieBanner';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { WishlistProvider } from '@/context/WishlistContext';

import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useCartSync } from '@/hooks/useCart';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// 🛡️ Global Cart Hygiene & Sync Manager
function CartSyncManager() {
  useCartSync();
  return null;
}

// 🛡️ Enterprise Toast Lifecycle & Queue Manager (Guarantees max 2 toasts and prevents sticky toasts)
function ToastLifecycleManager({ limit = 2 }: { limit?: number }) {
  const { toasts } = useToasterStore();

  useEffect(() => {
    // 1. Enforce max queue limit (at most `limit` visible toasts)
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= limit)
      .forEach((t) => toast.dismiss(t.id));

    // 2. Safety watchdog: Ensure no completed toast (success/error/custom) stays indefinitely
    toasts.forEach((t) => {
      if (t.visible && t.type !== 'loading' && (t.duration === Infinity || !t.duration || t.duration > 5000)) {
        const timer = setTimeout(() => {
          toast.dismiss(t.id);
        }, 3500);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, limit]);

  return null;
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // 🔥 Centralized Client-Side Unhandled Error & Promise Rejection Observability
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      // Don't report browser extension or resize observer benign errors
      if (event.message?.includes('ResizeObserver') || event.filename?.startsWith('chrome-extension')) {
        return;
      }

      const payload = {
        message: event.message || 'Uncaught window error',
        stack: event.error?.stack || null,
        source: 'client',
        severity: 'error',
        url: window.location.href,
        route: window.location.pathname,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/telemetry/errors', blob);
        }
      } catch (e) {}
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : null;

      const payload = {
        message: `Unhandled Promise Rejection: ${message}`,
        stack,
        source: 'client',
        severity: 'error',
        url: window.location.href,
        route: window.location.pathname,
      };

      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/telemetry/errors', blob);
        }
      } catch (e) {}
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // 🔥 INSTANT FEEDBACK: Top route progress indicator for instant response on mobile/desktop
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);
    const handleError = () => setIsNavigating(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);

  // 🛡️ Safety Guard: Prevent browser NotFoundError when releasePointerCapture is called on an element without active pointer
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Element !== 'undefined' && Element.prototype.releasePointerCapture) {
      const originalReleasePointerCapture = Element.prototype.releasePointerCapture;
      Element.prototype.releasePointerCapture = function (pointerId: number) {
        try {
          if (this.hasPointerCapture && this.hasPointerCapture(pointerId)) {
            originalReleasePointerCapture.call(this, pointerId);
          }
        } catch (err) {
          // Gracefully suppress NotFoundError when pointer was already cancelled or not captured
        }
      };
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      </Head>
      <CurrencyProvider>
        <WishlistProvider>
          <div className={`${inter.variable} font-sans`}>
            {/* Top Navigation Loading Bar */}
            {isNavigating && (
              <div className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 z-[9999999] animate-pulse" />
            )}

            {/* 🛡️ Cart Lifecycle Manager: Auto-prunes deleted products and syncs cart */}
            <CartSyncManager />

            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>

            {/* 🔥 Toast Lifecycle Watchdog: Guarantees max 2 toasts on mobile/desktop and auto-dismisses sticky toasts */}
            <ToastLifecycleManager limit={2} />

            {/* 🔥 GLOBAL REACT-HOT-TOASTER: Single source of truth for the entire app */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              containerStyle={{
                top: 20,
                zIndex: 999999,
              }}
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '9999px',
                  background: '#0f172a',
                  color: '#f8fafc',
                  fontWeight: '600',
                  fontSize: '13px',
                  padding: '10px 18px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  maxWidth: '92vw',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#0f172a',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#0f172a',
                  },
                },
                loading: {
                  duration: 6000,
                },
              }}
            >
              {(t) => (
                <div
                  onClick={() => toast.dismiss(t.id)}
                  className="cursor-pointer transition-transform active:scale-95 touch-manipulation"
                  title="Tap to dismiss"
                >
                  <ToastBar toast={t}>
                    {({ icon, message }) => (
                      <div className="flex items-center gap-2.5 select-none">
                        {icon}
                        <div className="text-xs sm:text-sm font-semibold tracking-tight pr-1">
                          {message}
                        </div>
                        {t.type !== 'loading' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.dismiss(t.id);
                            }}
                            className="p-1 -mr-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Close notification"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </ToastBar>
                </div>
              )}
            </Toaster>

            <CookieBanner />
          </div>
        </WishlistProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}