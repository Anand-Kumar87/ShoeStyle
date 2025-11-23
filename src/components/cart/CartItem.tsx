'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex gap-4 rounded-lg border border-neutral-200 p-4">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/products/${item.slug}`}
              className="font-semibold text-neutral-900 hover:text-neutral-600"
            >
              {item.name}
            </Link>
            <div className="mt-1 flex gap-2 text-sm text-neutral-600">
              {item.color && <span>Color: {item.color}</span>}
              {item.size && <span>• Size: {item.size}</span>}
            </div>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-neutral-400 hover:text-red-600"
            aria-label="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 hover:border-neutral-900"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 hover:border-neutral-900"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-neutral-900">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-neutral-500">
                ${item.price.toFixed(2)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;