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
    // Don't fetch if not authenticated
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

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        await fetchOrders();
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