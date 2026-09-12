import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  RefreshCw,
  Package,
  ShoppingCart,
  Eye,
  X,
  MapPin,
  Mail,
  Phone,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  Tag,
  CreditCard,
  User,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { useGlobalCurrency } from '@/context/CurrencyContext';
import { useAdminData } from '@/lib/adminCache';

function numberToWordsINR(amount: number): string {
  const num = Math.round(amount);
  if (num === 0) return 'Zero Rupees Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  return `Rupees ${convert(num)} Only`;
}

interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  slug?: string | null;
  image?: string;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
  sku?: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  apartment?: string | null;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentIntentId?: string | null;
  couponCode?: string | null;
  couponDiscount?: number | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

// Order Status Styling
const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50',
};
const STATUSES = Object.keys(STATUS_STYLE);

// Payment Status Styling
const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
  FAILED: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50',
  REFUNDED: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};
const PAYMENT_STATUSES = Object.keys(PAYMENT_STATUS_STYLE);

// Modern Skeleton Loader
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-5 py-5">
          <div className={`h-4 rounded-md animate-pulse bg-slate-200 dark:bg-slate-800 ${i === 2 ? 'w-12' : i === 3 ? 'w-24 rounded-full' : 'w-full max-w-[120px]'}`} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminOrders() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [trackingForm, setTrackingForm] = useState({ carrier: '', trackingNumber: '' });
  const [updatingTracking, setUpdatingTracking] = useState(false);

  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const {
    data: cachedOrders,
    setData: setOrders,
    loading,
    refreshing,
    refresh: load,
  } = useAdminData<Order[]>('admin_orders', async () => {
    const r = await fetch('/api/admin/orders');
    if (!r.ok) throw new Error('Failed to load orders');
    const d = await r.json();
    return Array.isArray(d) ? d : [];
  });

  const orders = cachedOrders || [];

  // Sync inspecting order with updated list
  useEffect(() => {
    if (inspectingOrder && orders.length > 0) {
      const fresh = orders.find(o => o.id === inspectingOrder.id);
      if (fresh) setInspectingOrder(fresh);
    }
  }, [orders]);

  // Generic Update Function for Order & Payment Status
  const updateOrderField = async (id: string, field: 'status' | 'paymentStatus', value: string) => {
    const fieldName = field === 'status' ? 'Order Status' : 'Payment Status';
    const t = toast.loading(`Updating ${fieldName}…`);
    try {
      const r = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value })
      });
      if (r.ok) {
        toast.success(`${fieldName} updated successfully`, { id: t });
        setOrders(prev => (prev || []).map(o => o.id === id ? { ...o, [field]: value } : o));
        if (inspectingOrder && inspectingOrder.id === id) {
          setInspectingOrder(prev => prev ? { ...prev, [field]: value } : null);
        }
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error(`Failed to update ${fieldName}`, { id: t });
    }
  };

  // Update Tracking Number and Carrier
  const handleSaveTracking = async () => {
    if (!inspectingOrder) return;
    setUpdatingTracking(true);
    const t = toast.loading('Saving tracking details…');
    try {
      const r = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inspectingOrder.id,
          carrier: trackingForm.carrier.trim(),
          trackingNumber: trackingForm.trackingNumber.trim(),
          status: inspectingOrder.status === 'PENDING' || inspectingOrder.status === 'CONFIRMED' ? 'SHIPPED' : inspectingOrder.status,
        })
      });
      if (r.ok) {
        toast.success('Tracking information saved & status synced!', { id: t });
        load(true);
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast.error('Failed to update tracking', { id: t });
    } finally {
      setUpdatingTracking(false);
    }
  };

  const openOrderDetails = (order: Order) => {
    setInspectingOrder(order);
    setTrackingForm({
      carrier: order.carrier || 'Shiprocket / Delhivery',
      trackingNumber: order.trackingNumber || '',
    });
  };

  // Local Search Filter
  const filteredOrders = useMemo(() => {
    return orders.filter(o =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.phone && o.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [orders, searchTerm]);

  return (
    <AdminLayout>
      <div className="min-h-screen p-6 sm:p-10 bg-slate-50 dark:bg-[#080d1a] transition-colors duration-200">
        <Head><title>Orders Management | Admin</title></Head>

        <div className="max-w-7xl mx-auto space-y-8">

          {/* Premium Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Fulfillment & Operations</p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Orders Management</h1>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search order #, customer, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              <button
                onClick={() => load(true)}
                disabled={refreshing || loading}
                title="Refresh Orders"
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''} />
              </button>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    {['Order #', 'Customer', 'Total', 'Order Status', 'Payment', 'Date', 'Action', ''].map((h, idx) => (
                      <th key={idx} className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-20 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
                          <Package size={28} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-bold">No orders found.</p>
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
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            className={`group transition-colors ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}`}
                          >
                            {/* Order Number */}
                            <td className="px-6 py-5">
                              <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                {o.orderNumber}
                              </span>
                            </td>

                            {/* Customer */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-xs ring-1 ring-blue-200 dark:ring-blue-800">
                                  {o.firstName?.[0] || 'C'}{o.lastName?.[0] || ''}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white text-[14px]">{o.firstName} {o.lastName}</p>
                                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">{o.email}</p>
                                </div>
                              </div>
                            </td>

                            {/* Total */}
                            <td className="px-6 py-5 font-black text-slate-900 dark:text-white">
                              {currencyLoading ? '...' : convertPrice(o.total)}
                            </td>

                            {/* Order Status Select */}
                            <td className="px-6 py-5">
                              <select
                                value={o.status}
                                onChange={e => updateOrderField(o.id, 'status', e.target.value)}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${statusClass} pr-7 relative bg-no-repeat bg-[right_0.4rem_center] bg-[length:12px_12px] transition-all hover:opacity-90`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                              >
                                {STATUSES.map(st => <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{st}</option>)}
                              </select>
                            </td>

                            {/* Payment Status Select */}
                            <td className="px-6 py-5">
                              <select
                                value={o.paymentStatus}
                                onChange={e => updateOrderField(o.id, 'paymentStatus', e.target.value)}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none ${paymentClass} pr-7 relative bg-no-repeat bg-[right_0.4rem_center] bg-[length:12px_12px] transition-all hover:opacity-90`}
                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                              >
                                {PAYMENT_STATUSES.map(st => <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{st}</option>)}
                              </select>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                              {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>

                            {/* 🔥 Dedicated View Details Button */}
                            <td className="px-6 py-5">
                              <button
                                onClick={() => openOrderDetails(o)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-black transition-all shadow-sm group-hover:scale-105"
                              >
                                <Eye size={14} />
                                <span>Details</span>
                              </button>
                            </td>

                            {/* Expand Chevron */}
                            <td className="px-4 py-5 text-right">
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setExpanded(isExpanded ? null : o.id)}
                                className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
                              >
                                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown size={18} />
                                </motion.div>
                              </motion.button>
                            </td>
                          </motion.tr>

                          {/* Quick Expandable Row */}
                          {isExpanded && (
                            <motion.tr
                              key={`${o.id}-exp`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-50/50 dark:bg-slate-900/40"
                            >
                              <td colSpan={8} className="p-0 border-b border-slate-100 dark:border-slate-800">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: 'auto' }}
                                  exit={{ height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 sm:px-10 py-6 m-4 mt-0 bg-white dark:bg-[#080d1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                      <div className="flex items-center gap-2">
                                        <ShoppingCart size={16} className="text-slate-400" />
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Quick Summary</h4>
                                      </div>
                                      <button
                                        onClick={() => openOrderDetails(o)}
                                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                      >
                                        Full Order View & Shipping Specs <ExternalLink size={12} />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {o.items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                                          <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                              {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                                              ) : (
                                                <Package size={16} className="text-slate-400" />
                                              )}
                                            </div>
                                            <div>
                                              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                                              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                                Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''} {item.color ? `• ${item.color}` : ''}
                                              </p>
                                            </div>
                                          </div>
                                          <span className="font-black text-sm text-slate-900 dark:text-white">
                                            {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
                                          </span>
                                        </div>
                                      ))}
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

      {/* ========================================================
          🔥 ULTRA-PREMIUM ORDER DETAILS MODAL / DRAWER
          ======================================================== */}
      <AnimatePresence>
        {inspectingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingOrder(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-10 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
            >
              {/* Header */}
              <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Order Details
                    </h2>
                    <span className="font-mono text-xs font-black bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                      {inspectingOrder.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2">
                    <Clock size={13} />
                    Placed on {new Date(inspectingOrder.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    title="Print Official Tax Invoice"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-sm group cursor-pointer"
                  >
                    <Printer size={16} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>Print Bill</span>
                  </button>
                  <button
                    onClick={() => setInspectingOrder(null)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 space-y-6">

                {/* 1. Quick Financial KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Subtotal</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {currencyLoading ? '...' : convertPrice(inspectingOrder.subtotal ?? inspectingOrder.total)}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Shipping Fee</p>
                    <p className={`text-base font-black ${(!inspectingOrder.shipping || inspectingOrder.shipping === 0) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {(!inspectingOrder.shipping || inspectingOrder.shipping === 0) ? 'Free Shipping' : (currencyLoading ? '...' : convertPrice(inspectingOrder.shipping))}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Tax / GST</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {(!inspectingOrder.tax || inspectingOrder.tax === 0) ? '₹0.00' : (currencyLoading ? '...' : convertPrice(inspectingOrder.tax))}
                    </p>
                  </div>
                  <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-1">Total Paid</p>
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {currencyLoading ? '...' : convertPrice(inspectingOrder.total)}
                    </p>
                  </div>
                </div>

                {/* 2. Customer Information & Shipping Destination Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Customer Card */}
                  <div className="bg-white dark:bg-[#080d1a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-blue-600 dark:text-blue-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Customer Profile</h3>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                        {inspectingOrder.userId ? 'Registered User' : 'Guest Checkout'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Name</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {inspectingOrder.firstName} {inspectingOrder.lastName}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</p>
                        <a
                          href={`mailto:${inspectingOrder.email}`}
                          className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          <Mail size={13} /> {inspectingOrder.email}
                        </a>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Phone Number</p>
                        <a
                          href={`tel:${inspectingOrder.phone}`}
                          className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                        >
                          <Phone size={13} /> {inspectingOrder.phone || 'Not provided'}
                        </a>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Payment Gateway</p>
                        <div className="flex items-center gap-2 mt-1">
                          <CreditCard size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {inspectingOrder.paymentMethod || 'Online / Razorpay'}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${PAYMENT_STATUS_STYLE[inspectingOrder.paymentStatus] ?? PAYMENT_STATUS_STYLE.PENDING}`}>
                            {inspectingOrder.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Card */}
                  <div className="bg-white dark:bg-[#080d1a] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Shipping Address</h3>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                        {inspectingOrder.country || 'IN'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {inspectingOrder.address || 'Standard Delivery'}
                      </p>
                      {inspectingOrder.apartment && (
                        <p className="font-medium text-slate-600 dark:text-slate-400">
                          {inspectingOrder.apartment}
                        </p>
                      )}
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {inspectingOrder.city || ''}{inspectingOrder.city && inspectingOrder.state ? ', ' : ''}{inspectingOrder.state || ''} {inspectingOrder.zipCode ? `— ` : ''}<strong className="font-mono text-slate-900 dark:text-white">{inspectingOrder.zipCode || ''}</strong>
                      </p>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Country: {inspectingOrder.country === 'IN' ? 'India' : (inspectingOrder.country || 'India')}
                      </p>

                      {inspectingOrder.customerNotes && (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/50">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 dark:text-amber-300">Customer Note</p>
                          <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">{inspectingOrder.customerNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* 3. Items Ordered Breakdown */}
                <div className="bg-white dark:bg-[#080d1a] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-slate-500 dark:text-slate-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Ordered Items ({inspectingOrder.items.length})
                      </h3>
                    </div>
                    {inspectingOrder.couponCode && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                        <Tag size={12} /> Coupon: {inspectingOrder.couponCode} (-{currencyLoading ? '...' : convertPrice(inspectingOrder.discount ?? 0)})
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {inspectingOrder.items.map((item) => (
                      <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                            ) : (
                              <Package size={22} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {item.size && (
                                <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                                  Color: {item.color}
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                                {currencyLoading ? '...' : convertPrice(item.price)} × {item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right self-end sm:self-center">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Line Total</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">
                            {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Fulfillment & Logistics Controls */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Fulfillment & Tracking Controls
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Order Status</label>
                      <select
                        value={inspectingOrder.status}
                        onChange={e => updateOrderField(inspectingOrder.id, 'status', e.target.value)}
                        className="mt-1.5 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment Status</label>
                      <select
                        value={inspectingOrder.paymentStatus}
                        onChange={e => updateOrderField(inspectingOrder.id, 'paymentStatus', e.target.value)}
                        className="mt-1.5 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Shipping Carrier</label>
                      <input
                        type="text"
                        placeholder="e.g. Blue Dart, Shiprocket"
                        value={trackingForm.carrier}
                        onChange={e => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                        className="mt-1.5 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">AWB / Tracking #</label>
                      <input
                        type="text"
                        placeholder="e.g. 14205882910"
                        value={trackingForm.trackingNumber}
                        onChange={e => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                        className="mt-1.5 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveTracking}
                      disabled={updatingTracking}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {updatingTracking ? 'Saving...' : 'Save Tracking Information'}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🧾 OFFICIAL PROFESSIONAL TAX INVOICE (Rendered strictly for @media print) */}
      {inspectingOrder && (
        <div id="shoestyle-printable-invoice" className="hidden print:block text-black bg-white">
          {/* Header & Company Brand Strip */}
          <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-black tracking-tight text-black uppercase">SHOESTYLE</span>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded">Store</span>
              </div>
              <p className="text-xs font-black text-slate-900">ShoeStyle Retail Private Limited</p>
              <p className="text-[11px] text-slate-700">CIN: U52100DL2024PTC394851 | GSTIN: 09AAACS1429B1Z0</p>
              <p className="text-[11px] text-slate-700">Plot 42, Sector 18, Commercial Hub, New Delhi - 110001, India</p>
              <p className="text-[11px] text-slate-700">Customer Support: support@shoestyle.com | Toll-Free: 1800-200-7463</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-black text-white font-black text-sm uppercase tracking-wider px-3 py-1 rounded mb-1">
                TAX INVOICE
              </div>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Original For Recipient</p>
              <div className="mt-2 text-xs space-y-0.5 text-slate-900">
                <p><span className="font-bold">Invoice No:</span> INV-{inspectingOrder.orderNumber.replace(/[^A-Z0-9]/gi, '').slice(0, 12)}</p>
                <p><span className="font-bold">Order Number:</span> {inspectingOrder.orderNumber}</p>
                <p><span className="font-bold">Invoice Date:</span> {new Date(inspectingOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                <p><span className="font-bold">Place of Supply:</span> {inspectingOrder.state || 'Delhi (07)'}</p>
              </div>
            </div>
          </div>

          {/* Billed To & Shipped To Cards */}
          <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
            <div className="border border-slate-400 rounded-lg p-3 bg-slate-50/40">
              <p className="font-black text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">Billed To (Customer Details)</p>
              <p className="font-black text-sm text-black">{inspectingOrder.firstName} {inspectingOrder.lastName}</p>
              <p className="text-slate-800 mt-0.5">{inspectingOrder.address}{inspectingOrder.apartment ? `, ${inspectingOrder.apartment}` : ''}</p>
              <p className="text-slate-800">{inspectingOrder.city}, {inspectingOrder.state} - {inspectingOrder.zipCode}</p>
              <p className="text-slate-800">Country: {inspectingOrder.country || 'India'}</p>
              <p className="text-slate-800 mt-1"><span className="font-bold">Phone:</span> {inspectingOrder.phone || 'N/A'}</p>
              <p className="text-slate-800"><span className="font-bold">Email:</span> {inspectingOrder.email}</p>
            </div>

            <div className="border border-slate-400 rounded-lg p-3 bg-slate-50/40">
              <p className="font-black text-[11px] uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-1 mb-2">Shipped To (Delivery Destination)</p>
              <p className="font-black text-sm text-black">{inspectingOrder.firstName} {inspectingOrder.lastName}</p>
              <p className="text-slate-800 mt-0.5">{inspectingOrder.address}{inspectingOrder.apartment ? `, ${inspectingOrder.apartment}` : ''}</p>
              <p className="text-slate-800">{inspectingOrder.city}, {inspectingOrder.state} - {inspectingOrder.zipCode}</p>
              <p className="text-slate-800">Country: {inspectingOrder.country || 'India'}</p>
              <div className="mt-2 pt-1 border-t border-slate-300 grid grid-cols-2 gap-1 text-[11px]">
                <p><span className="font-bold">Carrier:</span> {inspectingOrder.carrier || 'Standard Express'}</p>
                <p><span className="font-bold">AWB Tracking:</span> {inspectingOrder.trackingNumber || 'Pending Dispatch'}</p>
                <p><span className="font-bold">Payment Mode:</span> {inspectingOrder.paymentMethod || 'Online'}</p>
                <p><span className="font-bold">Payment Status:</span> <span className="font-black uppercase">{inspectingOrder.paymentStatus}</span></p>
              </div>
            </div>
          </div>

          {/* Itemized Footwear Goods Table */}
          <div className="mb-5 border border-slate-400 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-black font-black uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-8 text-center border-r border-slate-300">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">Description of Footwear Goods</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">HSN</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Size</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Color</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-300">Qty</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-300">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right border-r border-slate-300">GST</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {inspectingOrder.items.map((item, idx) => {
                  const unitPrice = item.price;
                  const lineTotal = unitPrice * item.quantity;
                  return (
                    <tr key={item.id || idx} className="text-slate-900">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600 border-r border-slate-200">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-black text-black border-r border-slate-200">
                        {item.name}
                        {item.sku && <span className="block text-[10px] font-mono text-slate-600">SKU: {item.sku}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 font-mono text-[11px] border-r border-slate-200">6404</td>
                      <td className="py-2.5 px-3 text-center font-black border-r border-slate-200">{item.size || 'Standard'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-700 border-r border-slate-200">{item.color || 'Standard'}</td>
                      <td className="py-2.5 px-3 text-center font-black border-r border-slate-200">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono border-r border-slate-200">₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700 border-r border-slate-200">5% GST</td>
                      <td className="py-2.5 px-3 text-right font-black font-mono">₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Calculation & Amount in Words */}
          <div className="grid grid-cols-12 gap-4 mb-6 text-xs">
            <div className="col-span-7 border border-slate-300 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Invoice Amount in Words:</p>
                <p className="font-black text-black text-sm leading-snug">{numberToWordsINR(inspectingOrder.total)}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-300 text-[10px] text-slate-700 space-y-0.5">
                <p className="font-black uppercase tracking-wider text-black mb-0.5">Terms & Conditions:</p>
                <p>1. Goods covered under 7-day genuine return and replacement policy.</p>
                <p>2. Subject to Delhi jurisdiction. This is a computer generated digitally verified Tax Invoice.</p>
              </div>
            </div>

            <div className="col-span-5 border border-slate-400 rounded-lg p-3 bg-white space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal (Net):</span>
                <span>₹{(inspectingOrder.subtotal ?? inspectingOrder.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {(inspectingOrder.discount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Discount {inspectingOrder.couponCode ? `(${inspectingOrder.couponCode})` : ''}:</span>
                  <span>-₹{(inspectingOrder.discount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-700">
                <span>Shipping & Handling:</span>
                <span>{(!inspectingOrder.shipping || inspectingOrder.shipping === 0) ? 'FREE' : `₹${inspectingOrder.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Estimated GST (5%):</span>
                <span>₹{(inspectingOrder.tax ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t-2 border-black pt-2 flex justify-between font-black text-base text-black">
                <span>Grand Total:</span>
                <span>₹{inspectingOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Authorized Signatory & Digital Verification */}
          <div className="border-t border-slate-400 pt-4 flex justify-between items-end text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 border-2 border-emerald-700 rounded-full flex items-center justify-center text-emerald-800 font-black text-[9px] uppercase tracking-tighter text-center leading-none">
                SEAL<br/>VERIFIED
              </div>
              <div>
                <p className="font-black text-slate-900 text-[11px]">Digitally Authenticated Tax Invoice</p>
                <p className="text-[10px] text-slate-600">ShoeStyle Automated Order Fulfillment Center</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-black text-slate-900 text-[11px]">For SHOESTYLE RETAIL PVT. LTD.</p>
              <div className="h-10 flex items-center justify-end">
                <span className="font-serif italic text-base text-slate-800 tracking-wider">Authorized Signatory</span>
              </div>
              <p className="text-[10px] text-slate-600 border-t border-slate-400 pt-0.5">Authorised Signatory</p>
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ PRINT STYLESHEET */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #shoestyle-printable-invoice,
          #shoestyle-printable-invoice * {
            visibility: visible !important;
          }
          #shoestyle-printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-sizing: border-box !important;
            z-index: 999999 !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

// Security Check: Only allow admins to access this page
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  // 🔥 Case-Insensitive Check
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return { redirect: { destination: '/auth/signin', permanent: false } };
  }

  return { props: {} };
};