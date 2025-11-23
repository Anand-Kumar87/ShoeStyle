import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiMapPin, FiCreditCard } from 'react-icons/fi';

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

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        router.push('/orders');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed', icon: FiPackage },
    { key: 'CONFIRMED', label: 'Confirmed', icon: FiCheckCircle },
    { key: 'PROCESSING', label: 'Processing', icon: FiPackage },
    { key: 'SHIPPED', label: 'Shipped', icon: FiTruck },
    { key: 'DELIVERED', label: 'Delivered', icon: FiCheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);

  return (
    <>
      <Head>
        <title>Order #{order.orderNumber} - ShoeStyle</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link href="/orders">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-semibold">
              <FiArrowLeft />
              Back to Orders
            </button>
          </Link>

          {/* Order Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Order Status Progress */}
            {order.status !== 'CANCELLED' && (
              <div className="relative">
                <div className="flex items-center justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.key} className="flex-1 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                            <Icon className="text-xl" />
                          </div>
                          <p className={`text-sm mt-2 font-semibold text-center ${
                            isCompleted ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute top-6 left-1/2 w-full h-1 ${
                            index < currentStepIndex 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                              : 'bg-gray-200'
                          }`} style={{ zIndex: -1 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                          <span>Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="text-blue-500" />
                  Shipping Address
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-green-500" />
                  Payment Method
                </h3>
                <div className="text-gray-600">
                  <p className="capitalize">{order.paymentMethod || 'Card'}</p>
                  <p className={`text-sm mt-2 px-3 py-1 rounded-full inline-block ${
                    order.paymentStatus === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Tracking */}
              {order.trackingNumber && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTruck className="text-purple-500" />
                    Tracking
                  </h3>
                  <p className="text-gray-600 mb-2">Tracking Number:</p>
                  <p className="font-mono font-bold text-lg text-gray-900">{order.trackingNumber}</p>
                </div>
              )}
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