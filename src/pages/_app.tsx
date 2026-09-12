// @ts-ignore: allow global CSS import without module declarations
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer } from '@/components/common/Toast';
import { Toaster } from 'react-hot-toast';
import CookieBanner from '@/components/ui/CookieBanner';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { WishlistProvider } from '@/context/WishlistContext';

import ErrorBoundary from '@/components/common/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const [toasts, setToasts] = useState<any[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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

            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>

            {/* Custom Legacy Toast Container */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* 🔥 GLOBAL REACT-HOT-TOASTER: Always visible on mobile and desktop */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '16px',
                  background: '#111827',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '13px',
                  padding: '14px 20px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
                error: {
                  style: {
                    background: '#1f1315',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  },
                },
                success: {
                  style: {
                    background: '#0e1f17',
                    color: '#86efac',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                  },
                },
              }}
              containerStyle={{
                zIndex: 999999,
              }}
            />

            <CookieBanner />
          </div>
        </WishlistProvider>
      </CurrencyProvider>
    </SessionProvider>
  );
}