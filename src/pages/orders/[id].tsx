import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, CreditCard, Clock, CalendarDays, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
// 1. Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

interface OrderDetailPageProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function OrderDetailPage({ user }: OrderDetailPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  // 2. Initialize Currency Hook
  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  // Smart Live Polling System
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const response = await fetch(`/api/orders/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else if (!silent) {
          router.push('/orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        if (!silent) router.push('/orders');
      } finally {
        setLoading(false);
        setIsPolling(true);
      }
    };

    fetchOrder();

    // Live polling every 5 seconds
    const interval = setInterval(() => fetchOrder(true), 5000);
    return () => clearInterval(interval);
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Locating Order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Package size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-600 mb-6 font-bold text-lg">Order not found.</p>
        <Link href="/orders">
          <button className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-600/20">
            Go Back to Orders
          </button>
        </Link>
      </div>
    );
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === order?.status);

  const formatPaymentMethod = (method: string) => {
    if (!method) return 'Standard Checkout (COD/Bank)';
    const methodMap: Record<string, string> = {
      upi: 'UPI / GPay / PhonePe',
      card: 'Credit / Debit Card',
      applepay: 'Apple Pay',
      bank: 'Direct Bank Transfer',
      cod: 'Cash on Delivery'
    };
    return methodMap[method.toLowerCase()] || method.toUpperCase();
  };

  const getEstimatedDelivery = () => {
    if (!order?.createdAt) return 'To be updated';
    const date = new Date(order.createdAt);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const displayAddress = order?.shippingAddress || order?.address;

  return (
    <>
      <Head>
        <title>Order #{order?.orderNumber || 'Details'} - ShoeStyle Premium</title>
      </Head>

      <div className="min-h-screen bg-[#F4F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          {/* Back Button & Live Status */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/orders">
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors text-sm uppercase tracking-wider">
                <ArrowLeft size={18} /> Back to Orders
              </button>
            </Link>
            {isPolling && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100">
                <Activity size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
              </div>
            )}
          </div>

          {/* Premium Order Header */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sm:p-10 mb-8 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-6 mb-12 relative z-10">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Order Details</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 tracking-tight">
                  #{order?.orderNumber || 'N/A'}
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <CalendarDays size={16} />
                  Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  }) : 'Unknown Date'}
                </p>
              </div>
              <div className="text-left sm:text-right bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 min-w-[220px] shadow-lg shadow-slate-900/20">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Amount</p>
                <p className="text-4xl font-black text-white">
                  {/* Global Currency Output */}
                  {currencyLoading ? '...' : convertPrice(order?.total || 0)}
                </p>
              </div>
            </div>

            {/* Estimated Delivery Banner */}
            {order?.status !== 'CANCELLED' && order?.status !== 'DELIVERED' && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Estimated Delivery</p>
                  <p className="text-lg font-bold text-slate-900">{getEstimatedDelivery()}</p>
                </div>
              </div>
            )}

            {order?.status === 'DELIVERED' && (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Order Status</p>
                  <p className="text-lg font-bold text-emerald-900">Successfully Delivered</p>
                </div>
              </div>
            )}

            {/* Order Status Progress */}
            {order?.status !== 'CANCELLED' && (
              <div className="relative pt-4 pb-2">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.key} className="flex-1 relative">
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 z-10 relative ${isCompleted
                              ? 'bg-blue-600 text-white shadow-blue-600/30 shadow-lg'
                              : 'bg-white text-slate-300 border-2 border-slate-100'
                              } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                          >
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isCompleted ? 3 : 2} />
                            {isCurrent && (
                              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border-2 border-white"></span>
                              </span>
                            )}
                          </motion.div>
                          <p className={`text-[10px] sm:text-xs mt-4 font-black uppercase tracking-widest text-center ${isCompleted ? 'text-blue-900' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className="absolute top-6 sm:top-8 left-[50%] right-[-50%] h-1 sm:h-1.5 -translate-y-1/2 rounded-full overflow-hidden bg-slate-100">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: index < currentStepIndex ? '100%' : '0%' }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              className="h-full bg-blue-600"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-8 border-b border-slate-100 pb-4">Items Ordered</h2>
                <div className="space-y-4">
                  {order?.items?.length > 0 ? (
                    order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        {item?.image ? (
                          <img
                            src={item.image}
                            alt={item?.name || 'Product'}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-sm bg-white border border-slate-100 p-1"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 font-medium text-xs">
                            No Image
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-base sm:text-lg mb-1 truncate">{item?.name || 'Premium Sneaker'}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {item?.size && <span className="bg-white px-2 py-1 rounded border border-slate-200">Size: {item.size}</span>}
                            {item?.color && <span className="bg-white px-2 py-1 rounded border border-slate-200">Color: {item.color}</span>}
                            <span className="bg-white px-2 py-1 rounded border border-slate-200">Qty: {item?.quantity || 1}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-black text-slate-900">
                            {currencyLoading ? '...' : convertPrice((item?.price || 0) * (item?.quantity || 1))}
                          </p>
                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                            {currencyLoading ? '...' : convertPrice(item?.price || 0)} each
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Package className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                      <p className="text-slate-500 font-bold">No items found in this order.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 mb-6 border-b border-slate-100 pb-4">Summary</h3>
                <div className="space-y-4 font-bold text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-900">{currencyLoading ? '...' : convertPrice(order?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={order?.shipping === 0 ? "text-emerald-600" : "text-slate-900"}>
                      {order?.shipping === 0 ? 'FREE' : (currencyLoading ? '...' : convertPrice(order?.shipping || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="text-slate-900">{currencyLoading ? '...' : convertPrice(order?.tax || 0)}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-5 mt-3 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest text-slate-900">Total</span>
                    <span className="text-2xl font-black text-blue-600">
                      {currencyLoading ? '...' : convertPrice(order?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><MapPin size={18} /></div>
                  Delivery Address
                </h3>

                {displayAddress ? (
                  typeof displayAddress === 'string' ? (
                    <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-5 rounded-2xl">{displayAddress}</p>
                  ) : (
                    <div className="text-slate-600 text-sm space-y-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="font-black text-slate-900 text-base uppercase tracking-wider mb-2">{displayAddress.name || 'Customer'}</p>
                      {displayAddress.street && <p className="font-bold">{displayAddress.street}</p>}
                      <p className="font-bold">
                        {displayAddress.city}{displayAddress.state ? `, ${displayAddress.state}` : ''} {displayAddress.zip || displayAddress.zipCode}
                      </p>
                      {displayAddress.country && <p className="font-bold">{displayAddress.country}</p>}
                      {displayAddress.phone && (
                        <p className="pt-3 mt-3 border-t border-slate-200 font-bold flex items-center gap-2">
                          <span className="text-slate-400 uppercase tracking-widest text-[10px]">Phone:</span> {displayAddress.phone}
                        </p>
                      )}
                    </div>
                  )
                ) : (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-center">
                    <p className="text-slate-500 font-bold">Address details unavailable.</p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-5 flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CreditCard size={18} /></div>
                  Payment Details
                </h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Method</p>
                    <p className="font-black text-slate-900 text-sm tracking-wide">{formatPaymentMethod(order?.paymentMethod)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</p>
                    {/* 🔥 100% REAL PAYMENT STATUS */}
                    <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black tracking-widest uppercase inline-block border ${order?.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : order?.paymentStatus === 'FAILED'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : order?.paymentStatus === 'REFUNDED'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {order?.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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