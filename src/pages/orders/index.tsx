import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiChevronRight, FiShoppingBag } from 'react-icons/fi';
import { useOrders } from '@/hooks/useOrders';

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <FiClock className="text-yellow-500" />;
      case 'CONFIRMED':
        return <FiPackage className="text-blue-500" />;
      case 'PROCESSING':
        return <FiPackage className="text-purple-500" />;
      case 'SHIPPED':
        return <FiTruck className="text-indigo-500" />;
      case 'DELIVERED':
        return <FiCheckCircle className="text-green-500" />;
      case 'CANCELLED':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders - ShoeStyle</title>
        <meta name="description" content="Track and manage your orders" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
                <FiPackage className="text-white text-3xl" />
              </div>
              My Orders
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {orders.length === 0 
                ? 'No orders yet' 
                : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} found`}
            </p>
          </div>

          {/* Orders Content */}
          {orders.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="inline-block p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
                  <FiShoppingBag className="text-7xl text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Start shopping to see your orders here
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                  >
                    Start Shopping
                  </button>
                  <button
                    onClick={() => router.push('/account')}
                    className="w-full px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                  >
                    Go to My Account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Orders List
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.price} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-wrap gap-4">
                      <Link href={`/orders/${order.id}`}>
                        <button className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2">
                          View Details
                          <FiChevronRight />
                        </button>
                      </Link>
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 font-semibold"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <button className="px-6 py-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all duration-300 font-semibold">
                          Buy Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Continue Shopping Section */}
          {orders.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-gray-900 to-black rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Looking for More?</h3>
              <p className="text-gray-300 mb-6">
                Discover our latest collection of premium footwear
              </p>
              <button
                onClick={() => router.push('/products')}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
              >
                Continue Shopping
              </button>
            </div>
          )}
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