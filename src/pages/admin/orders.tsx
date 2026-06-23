import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, RefreshCw, Package, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface OrderItem { id: string; name: string; quantity: number; price: number; }
interface Order { id: string; orderNumber: string; email: string; firstName: string; lastName: string; total: number; status: string; paymentStatus: string; createdAt: string; items: OrderItem[]; }

// Order Status Styling
const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
};
const STATUSES = Object.keys(STATUS_STYLE);

// 🔥 NEW: Payment Status Styling
const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-red-50 text-red-600 border-red-200',
  REFUNDED: 'bg-slate-100 text-slate-600 border-slate-300',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};
const PAYMENT_STATUSES = Object.keys(PAYMENT_STATUS_STYLE);

// Modern Skeleton Loader
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-5 py-5">
          <div className={`h-4 rounded-md animate-pulse bg-slate-200 ${i === 2 ? 'w-12' : i === 3 ? 'w-24 rounded-full' : 'w-full max-w-[120px]'}`} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const r = await fetch('/api/admin/orders');
      const d = await r.json();
      setOrders(Array.isArray(d) ? d : []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // 🔥 UPDATED: Generic Update Function for Both Order Status & Payment Status
  const updateOrderField = async (id: string, field: 'status' | 'paymentStatus', value: string) => {
    const fieldName = field === 'status' ? 'Order Status' : 'Payment Status';
    const t = toast.loading(`Updating ${fieldName}…`);
    try {
      const r = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value }) // Dynamically sends 'status' or 'paymentStatus'
      });
      if (r.ok) {
        toast.success(`${fieldName} updated successfully`, { id: t });
        load(true); // Silently refresh data
      } else {
        throw new Error('Failed');
      }
    } catch (e) {
      toast.error(`Failed to update ${fieldName}`, { id: t });
    }
  };

  // Local Search Filter
  const filteredOrders = useMemo(() => {
    return orders.filter(o =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  return (
    <AdminLayout>
      <div className="min-h-screen p-6 sm:p-10">
        <Head><title>Orders Management | Admin</title></Head>

        <div className="max-w-7xl mx-auto space-y-8">

          {/* Premium Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Order Management</p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Live Orders</h1>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                />
              </div>
              <button
                onClick={() => load(true)}
                disabled={refreshing || loading}
                className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin text-blue-600' : ''} />
              </button>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Order #', 'Customer', 'Total', 'Order Status', 'Payment Status', 'Date', ''].map(h => (
                      <th key={h} className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                          <Package size={28} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-base font-medium">No orders found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o, index) => {
                      const statusClass = STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDING;
                      const paymentClass = PAYMENT_STATUS_STYLE[o.paymentStatus] ?? PAYMENT_STATUS_STYLE.PENDING;
                      const isExpanded = expanded === o.id;

                      return (
                        <AnimatePresence key={o.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className={`group transition-colors ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/50'}`}
                          >
                            <td className="px-6 py-5">
                              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">{o.orderNumber}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 flex items-center justify-center text-blue-700 font-bold text-xs ring-1 ring-blue-200">
                                  {o.firstName[0]}{o.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-[14px]">{o.firstName} {o.lastName}</p>
                                  <p className="text-xs font-medium text-slate-500">{o.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 font-black text-slate-900">
                              {currencyLoading ? '...' : convertPrice(o.total)}
                            </td>

                            {/* ORDER STATUS DROPDOWN */}
                            <td className="px-6 py-5">
                              <select
                                value={o.status}
                                onChange={e => updateOrderField(o.id, 'status', e.target.value)}
                                className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${statusClass} pr-8 relative bg-no-repeat bg-[right_0.5rem_center] bg-[length:14px_14px] transition-all hover:opacity-80`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                              >
                                {STATUSES.map(st => <option key={st} value={st} className="bg-white text-slate-900">{st}</option>)}
                              </select>
                            </td>

                            {/* 🔥 NEW: PAYMENT STATUS DROPDOWN */}
                            <td className="px-6 py-5">
                              <select
                                value={o.paymentStatus}
                                onChange={e => updateOrderField(o.id, 'paymentStatus', e.target.value)}
                                className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${paymentClass} pr-8 relative bg-no-repeat bg-[right_0.5rem_center] bg-[length:14px_14px] transition-all hover:opacity-80`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                              >
                                {PAYMENT_STATUSES.map(st => <option key={st} value={st} className="bg-white text-slate-900">{st}</option>)}
                              </select>
                            </td>

                            <td className="px-6 py-5 text-xs font-bold text-slate-500">
                              {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setExpanded(isExpanded ? null : o.id)}
                                className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}
                              >
                                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                                  <ChevronDown size={18} />
                                </motion.div>
                              </motion.button>
                            </td>
                          </motion.tr>

                          {/* Expanded Row (Order Details) */}
                          {isExpanded && (
                            <motion.tr
                              key={`${o.id}-exp`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-50/50"
                            >
                              <td colSpan={7} className="p-0 border-b border-slate-100">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: 'auto' }}
                                  exit={{ height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 sm:px-10 py-8 m-4 mt-0 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
                                      <ShoppingCart size={18} className="text-slate-400" />
                                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Order Summary</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                                      {o.items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:border-slate-200">
                                          <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                              <Package size={20} />
                                            </div>
                                            <div>
                                              <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                                                Qty: {item.quantity} × {currencyLoading ? '...' : convertPrice(item.price)}
                                              </p>
                                            </div>
                                          </div>
                                          <span className="font-black text-lg text-slate-900">
                                            {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
                                      <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Amount</span>
                                        <span className="font-black text-2xl text-blue-600">
                                          {currencyLoading ? '...' : convertPrice(o.total)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || session.user?.role !== 'admin') return { redirect: { destination: '/auth/signin', permanent: false } };
  return { props: {} };
};