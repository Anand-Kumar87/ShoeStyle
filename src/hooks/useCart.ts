'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  validateCart: () => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find(
          (item) =>
            item.productId === newItem.productId &&
            item.size === newItem.size &&
            item.color === newItem.color
        );

        let updatedItems: CartItem[];

        if (existingItem) {
          updatedItems = items.map((item) =>
            item.id === existingItem.id
              ? { ...item, price: newItem.price, quantity: item.quantity + newItem.quantity }
              : item
          );
          toast.success('Quantity updated in cart!');
        } else {
          const newCartItem: CartItem = {
            ...newItem,
            id: `${Date.now()}-${Math.random()}`,
          };
          updatedItems = [...items, newCartItem];
          toast.success('Added to cart!');
        }

        // Update local state immediately
        set({ items: updatedItems });

        // Sync with API in background (don't await)
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem),
        }).catch((error) => {
          console.error('Failed to sync cart with server:', error);
          // Don't show error to user, cart still works locally
        });
      },

      removeItem: (id) => {
        const updatedItems = get().items.filter((item) => item.id !== id);
        set({ items: updatedItems });
        toast.success('Removed from cart');

        // Sync with API in background
        fetch(`/api/cart/${id}`, { method: 'DELETE' }).catch((error) => {
          console.error('Failed to remove item from server:', error);
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: updatedItems });

        // Sync with API in background
        fetch(`/api/cart/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity }),
        }).catch((error) => {
          console.error('Failed to update quantity on server:', error);
        });
      },

      clearCart: () => {
        set({ items: [] });
        toast.success('Cart cleared');

        // Sync with API in background
        fetch('/api/cart', { method: 'DELETE' }).catch((error) => {
          console.error('Failed to clear cart on server:', error);
        });
      },

      syncCart: async () => {
        try {
          const localItems = get().items;

          const response = await fetch('/api/cart');

          if (!response.ok) {
            console.log('User not authenticated or API error, using local cart');
            return; // Keep local cart
          }

          const data = await response.json();
          const serverItems = data.items || [];

          // If we have local items but server is empty, push local to server
          if (localItems.length > 0 && serverItems.length === 0) {
            await fetch('/api/cart/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: localItems }),
            });
            console.log('Synced local cart to server');
          }
          // If server has items, merge with local
          else if (serverItems.length > 0) {
            // Merge logic: prefer server data
            set({ items: serverItems });
            console.log('Loaded cart from server');
          }
        } catch (error) {
          console.error('Failed to sync cart:', error);
          // Keep local cart on error
        }
      },

      validateCart: async () => {
        const currentItems = get().items;
        if (!currentItems || currentItems.length === 0) return;

        try {
          const res = await fetch('/api/cart/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: currentItems }),
          });

          if (!res.ok) return;

          const data = await res.json();
          if (Array.isArray(data.validItems)) {
            if (data.removedCount > 0 || JSON.stringify(data.validItems) !== JSON.stringify(currentItems)) {
              set({ items: data.validItems });
              console.log(`[Cart Hygiene] Auto-pruned ${data.removedCount} unavailable item(s) from cart.`);
            }
          }
        } catch (e) {
          console.error('[Cart Validation Error]:', e);
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      // Upgraded to v2: Automatically migrates away obsolete legacy items from previous DB engines
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return { ...(persistedState || {}), items: [] };
        }
        return persistedState;
      },
    }
  )
);

// Hook to sync and validate cart across client lifecycle
export const useCartSync = () => {
  const { data: session, status } = useSession();
  const syncCart = useCart((state) => state.syncCart);
  const validateCart = useCart((state) => state.validateCart);

  // 🛡️ Auto-validate cart on client mount to drop ghost/deleted products
  useEffect(() => {
    validateCart();
  }, []);

  // 🛡️ Sync with user profile on login
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      syncCart().then(() => validateCart());
    }
  }, [status]);
};