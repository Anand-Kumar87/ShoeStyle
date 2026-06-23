import React from 'react';
import Header from './Header';
import Footer from './Footer';
import LiveChat from '@/components/chat/LiveChat';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <LiveChat /> {/* 🔥 Yeh line add karni hai */}
      <Footer />
    </>
  );
}
