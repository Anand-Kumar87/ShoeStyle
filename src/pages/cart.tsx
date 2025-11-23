'use client';

import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/cart/CartItem';
import Button from '@/components/common/Button';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <>
      <Head>
        <title>Shopping Cart | ShoeStyle</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-neutral-50 py-12">
        <div className="container-custom">
          <h1 className="mb-8 text-3xl font-semibold text-neutral-900">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
              <h2 className="text-xl font-semibold text-neutral-900">Your cart is empty</h2>
              <p className="mt-2 text-neutral-600">Add some products to get started</p>
              <Link href="/products">
                <Button className="mt-6">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 rounded-lg bg-white p-6">
                  <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
                  
                  <div className="space-y-3 border-b border-neutral-200 pb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button className="mt-6" fullWidth size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}