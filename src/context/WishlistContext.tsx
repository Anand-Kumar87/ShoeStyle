import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export interface WishlistItem {
  id: string;
  productId: string;
  product: any;
  createdAt?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, product?: any) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (status !== 'authenticated') {
      // Load guest wishlist from localStorage
      try {
        const local = localStorage.getItem('shoestyle_guest_wishlist');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setWishlist(parsed);
          }
        }
      } catch (e) {
        setWishlist([]);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlist(Array.isArray(data) ? data : []);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  }, [wishlist]);

  const toggleWishlist = useCallback(async (productId: string, product?: any): Promise<boolean> => {
    const previousWishlist = [...wishlist];
    const isCurrentlySaved = previousWishlist.some((item) => item.productId === productId);

    // ⚡ 0ms Optimistic UI Update
    let updatedWishlist: WishlistItem[];
    if (isCurrentlySaved) {
      updatedWishlist = previousWishlist.filter((item) => item.productId !== productId);
      setWishlist(updatedWishlist);
      toast.success('Removed from wishlist');
    } else {
      const optimisticItem: WishlistItem = {
        id: `optimistic-${Date.now()}`,
        productId,
        product: product || { id: productId },
        createdAt: new Date().toISOString(),
      };
      updatedWishlist = [optimisticItem, ...previousWishlist];
      setWishlist(updatedWishlist);
      toast.success('Added to wishlist ❤️');
    }

    // If guest user, persist to localStorage
    if (status !== 'authenticated') {
      try {
        localStorage.setItem('shoestyle_guest_wishlist', JSON.stringify(updatedWishlist));
      } catch (e) {}
      return !isCurrentlySaved;
    }

    // Background server sync for authenticated user
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn('Wishlist server sync response:', res.status, errData);
        if (res.status === 401) {
          toast.error('Session expired. Please sign in to sync wishlist.');
        } else {
          toast.error(errData.message || 'Could not update wishlist on server.');
        }
        setWishlist(previousWishlist);
        return isCurrentlySaved;
      }

      const data = await res.json();
      return data.inWishlist ?? !isCurrentlySaved;
    } catch (error) {
      console.error('Wishlist sync failed:', error);
      setWishlist(previousWishlist);
      toast.error('Network error updating wishlist. Please try again.');
      return isCurrentlySaved;
    }
  }, [status, wishlist]);

  const removeFromWishlist = useCallback(async (productId: string): Promise<boolean> => {
    const previousWishlist = [...wishlist];
    const updated = previousWishlist.filter((item) => item.productId !== productId);
    setWishlist(updated);
    toast.success('Removed from wishlist');

    if (status !== 'authenticated') {
      try {
        localStorage.setItem('shoestyle_guest_wishlist', JSON.stringify(updated));
      } catch (e) {}
      return true;
    }

    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.warn('Failed to delete item from server');
        setWishlist(previousWishlist);
        toast.error('Failed to remove item. Please try again.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error removing wishlist item:', error);
      setWishlist(previousWishlist);
      toast.error('Failed to remove item. Please try again.');
      return false;
    }
  }, [status, wishlist]);

  const clearWishlist = useCallback(async (): Promise<boolean> => {
    const previousWishlist = [...wishlist];
    setWishlist([]);

    try {
      await Promise.all(
        previousWishlist.map((item) =>
          fetch(`/api/wishlist?productId=${item.productId}`, { method: 'DELETE' })
        )
      );
      toast.success('Wishlist cleared');
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setWishlist(previousWishlist);
      toast.error('Failed to clear wishlist');
      return false;
    }
  }, [wishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        refetch: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
