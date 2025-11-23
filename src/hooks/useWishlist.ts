import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistItem {
  id: string;
  productId: string;
  product: any;
  createdAt: string;
}

export function useWishlist() {
  const { data: session, status } = useSession();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    // Don't fetch if not authenticated
    if (status !== 'authenticated') {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const data = await response.json();
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
  };

  useEffect(() => {
    fetchWishlist();
  }, [status]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.productId === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (status !== 'authenticated') {
      alert('Please sign in to add items to your wishlist');
      return false;
    }

    try {
      const response = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const clearWishlist = async () => {
    try {
      await Promise.all(
        wishlist.map(item => removeFromWishlist(item.productId))
      );
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  };

  return {
    wishlist,
    loading,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    refetch: fetchWishlist,
  };
}