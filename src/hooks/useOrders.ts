import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: any[];
}

export function useOrders() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (status !== 'authenticated') {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  // 🔥 NAYA FIX: Connecting to the flat POST endpoint securely
  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        // Instant UI State Update: Refreshing local state immediately
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: 'CANCELLED' } : order
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  };

  return {
    orders,
    loading,
    cancelOrder,
    refetch: fetchOrders,
  };
}