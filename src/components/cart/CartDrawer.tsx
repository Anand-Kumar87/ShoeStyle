'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart';
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemType[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: Props) {
  // 🔥 FIX: `shippingIndia` ko bhi extract kar liya
  const { convertPrice, loading: currencyLoading, freeShippingThreshold, shippingIndia } = useGlobalCurrency();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // 🔥 FIX: Hardcoded 10 ko hatakar Admin ka `shippingIndia` default laga diya
  const defaultShippingRate = shippingIndia || 15;
  const shipping = subtotal >= freeShippingThreshold ? 0 : defaultShippingRate;

  const total = subtotal + shipping;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = freeShippingThreshold - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 35 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-black text-base uppercase tracking-wide">
                  Cart <span className="text-neutral-400 font-normal">({items.length})</span>
                </h2>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {items.length > 0 && (
              <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100">
                {subtotal >= freeShippingThreshold ? (
                  <p className="text-xs font-bold text-green-600 flex items-center gap-1">
                    🎉 You've unlocked FREE shipping!
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mb-2">
                    Add <span className="font-bold text-black">{currencyLoading ? '...' : convertPrice(remaining)}</span> more for free shipping
                  </p>
                )}
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-black rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-20">
                  <ShoppingBag className="h-16 w-16 text-neutral-200 mb-4" />
                  <h3 className="font-bold text-neutral-900 mb-2">Your cart is empty</h3>
                  <p className="text-sm text-neutral-400 mb-6">Start shopping to fill it up.</p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-neutral-800 transition-colors"
                  >
                    Explore Products
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-5">
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-4"
                      >
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                          <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" sizes="80px" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">{item.name}</p>
                          {item.size && <p className="text-xs text-neutral-400 mt-0.5">Size: {item.size}</p>}
                          <p className="text-sm font-black text-neutral-900 mt-1">
                            {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 border border-neutral-200 rounded-full flex items-center justify-center hover:border-black transition-colors">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 border border-neutral-200 rounded-full flex items-center justify-center hover:border-black transition-colors">
                              <Plus className="h-3 w-3" />
                            </button>
                            <button onClick={() => onRemoveItem(item.id)} className="ml-2 p-1.5 text-neutral-400 hover:text-red-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-100 px-6 py-5 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>{currencyLoading ? '...' : convertPrice(subtotal)}</span>
                  </div>
                  {/* 🔥 FIX: Estimated Shipping dikhaya taaki user ko pata rahe checkout par change ho sakta hai */}
                  <div className="flex justify-between text-neutral-500">
                    <span>Estimated Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'FREE' : (currencyLoading ? '...' : convertPrice(shipping))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span className="font-black text-base uppercase tracking-wide">Total</span>
                  <span className="font-black text-2xl">
                    {currencyLoading ? '...' : convertPrice(total)}
                  </span>
                </div>
                <Link href="/checkout" onClick={onClose}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-center hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Checkout
                  </motion.div>
                </Link>
                <button onClick={onClose} className="w-full text-center text-sm text-neutral-400 hover:text-black transition-colors py-1">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
