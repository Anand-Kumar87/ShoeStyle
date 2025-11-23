'use client';

import React, { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils/formatting';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

const OrderManager: React.FC = () => {
  const [orders] = useState<Order[]>([]);

  const statusIcons = {
    pending: <Package className="h-5 w-5 text-yellow-600" />,
    processing: <Truck className="h-5 w-5 text-blue-600" />,
    shipped: <Truck className="h-5 w-5 text-purple-600" />,
    delivered: <CheckCircle className="h-5 w-5 text-green-600" />,
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Order Management</h1>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-neutral-900">
                    #{order.orderNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {order.customer}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusIcons[order.status]}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManager;