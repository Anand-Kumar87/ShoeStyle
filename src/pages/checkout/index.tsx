'use client';

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCart } from '@/hooks/useCart';
import { ShippingAddress } from '@/types/order';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (shippingData: ShippingAddress) => {
    setIsProcessing(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: shippingData,
          subtotal,
          shipping,
          tax,
          total,
        }),
      });

      const order = await orderResponse.json();

      // Clear cart
      clearCart();

      // Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <>
      <Head>
        <title>Checkout | ShoeStyle</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-white p-6">
                <CheckoutForm onSubmit={handleSubmit} isLoading={isProcessing} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}