import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
// 1. Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface OrdersPageProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrdersPage({ user }: OrdersPageProps) {
  const router = useRouter();
  const { orders, loading, cancelOrder } = useOrders();

  // 2. Initialize Currency Hook
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="text-amber-500" size={24} strokeWidth={2.5} />;
      case 'CONFIRMED': return <CheckCircle className="text-blue-500" size={24} strokeWidth={2.5} />;
      case 'PROCESSING': return <Package className="text-purple-500" size={24} strokeWidth={2.5} />;
      case 'SHIPPED': return <Truck className="text-indigo-500" size={24} strokeWidth={2.5} />;
      case 'DELIVERED': return <CheckCircle className="text-emerald-500" size={24} strokeWidth={2.5} />;
      case 'CANCELLED': return <XCircle className="text-red-500" size={24} strokeWidth={2.5} />;
      default: return <Package className="text-slate-500" size={24} strokeWidth={2.5} />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PROCESSING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      const success = await cancelOrder(orderId);
      if (success) {
        alert('Order cancelled successfully');
      } else {
        alert('Failed to cancel order');
      }
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders - ShoeStyle Premium</title>
        <meta name="description" content="Track and manage your orders" />
      </Head>

      <main className="min-h-screen bg-[#F4F7FB] py-10 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-blue-600">
                <Package size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
                <p className="text-slate-500 font-medium mt-1">
                  {orders.length === 0
                    ? 'No orders yet'
                    : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} found`}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Content */}
          {orders.length === 0 ? (
            // Premium Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-12 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
              <div className="relative z-10 max-w-md mx-auto">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                  <ShoppingBag size={40} strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">No Orders Yet</h2>
                <p className="text-slate-500 font-medium mb-8">
                  Looks like you haven't made your first purchase yet. Explore our latest collection!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all"
                  >
                    Start Shopping <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => router.push('/account')}
                    className="w-full py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-xl font-black text-sm uppercase tracking-widest hover:border-slate-200 hover:text-slate-900 transition-all"
                  >
                    Go to My Account
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Orders List
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  variants={itemVariants}
                  key={order.id}
                  className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header */}
                  <div className="bg-slate-50/50 p-6 sm:px-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        {/* 3. Global Currency applied to Total */}
                        {currencyLoading ? '...' : convertPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6 sm:px-8">
                    <div className="space-y-4 mb-6">
                      {order.items.slice(0, 2).map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl bg-slate-50 border border-slate-100 p-1"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                            <p className="text-xs font-semibold text-slate-500 mt-1">
                              Qty: {item.quantity}
                              {item.size && ` • Size: ${item.size}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-900">
                              {/* 4. Global Currency applied to individual items */}
                              {currencyLoading ? '...' : convertPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-20">
                          + {order.items.length - 2} more items
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                      <Link href={`/orders/${order.id}`} className="flex-1 sm:flex-none">
                        <button className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-black font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                          View Details <ChevronRight size={16} />
                        </button>
                      </Link>

                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex-1 sm:flex-none px-6 py-3 bg-white text-red-600 border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 font-black text-[11px] uppercase tracking-widest transition-all"
                        >
                          Cancel Order
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <Link href={`/orders/${order.id}`} className="flex-1 sm:flex-none">
                          <button className="w-full sm:w-auto px-6 py-3 bg-emerald-50 text-emerald-700 border-2 border-emerald-100 rounded-xl hover:bg-emerald-100 font-black text-[11px] uppercase tracking-widest transition-all">
                            Buy Again
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Continue Shopping Section */}
          {orders.length > 0 && (
            <div className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-10 sm:p-12 text-white text-center relative overflow-hidden shadow-xl shadow-blue-600/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 relative z-10">Looking for More?</h3>
              <p className="text-blue-100 font-medium mb-8 max-w-md mx-auto relative z-10">
                Discover our latest collection of premium footwear and exclusive drops.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-8 py-4 bg-white text-blue-900 rounded-xl hover:bg-slate-50 transition-all duration-300 shadow-lg transform hover:-translate-y-1 font-black text-sm uppercase tracking-widest relative z-10 inline-flex items-center gap-2"
              >
                Continue Shopping <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/orders',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
      },
    },
  };
};