import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import { ToastContainer } from '@/components/common/Toast';
import CookieBanner from '@/components/ui/CookieBanner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [toasts, setToasts] = useState<any[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <SessionProvider session={session}>
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
        <CookieBanner />
      </div>
    </SessionProvider>
  );
}