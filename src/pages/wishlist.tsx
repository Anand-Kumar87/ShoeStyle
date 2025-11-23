import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FiHeart, FiShoppingCart, FiTrash2, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useWishlist } from '@/hooks/useWishlist';
import Link from 'next/link';

interface WishlistPageProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function WishlistPage({ user }: WishlistPageProps) {
  const router = useRouter();
  const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist();

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Wishlist - ShoeStyle</title>
        <meta name="description" content="Your saved favorite shoes" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl">
                    <FiHeart className="text-white text-3xl" />
                  </div>
                  My Wishlist
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  {wishlist.length === 0 
                    ? 'No items saved yet' 
                    : `${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} saved`}
                </p>
              </div>
              {wishlist.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all duration-300 font-semibold flex items-center gap-2"
                >
                  <FiTrash2 />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Wishlist Content */}
          {wishlist.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-2xl shadow-lg p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="inline-block p-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mb-6">
                  <FiHeart className="text-7xl text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Save your favorite shoes to easily find them later
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                  >
                    Start Shopping
                  </button>
                  {user && (
                    <button
                      onClick={() => router.push('/account')}
                      className="w-full px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                      Go to My Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Wishlist Items Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="relative h-64 bg-gray-100 cursor-pointer">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(item.productId);
                        }}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                      >
                        <FiX className="text-xl" />
                      </button>
                      {/* Stock Badge */}
                      {item.product.stock === 0 && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                          Out of Stock
                        </div>
                      )}
                      {item.product.isNew && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                          New
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-6">
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-pink-600 transition-colors cursor-pointer">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${item.product.price}
                        </p>
                        {item.product.compareAtPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            ${item.product.compareAtPrice}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        ⭐ {item.product.rating.toFixed(1)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Link href={`/products/${item.product.slug}`}>
                        <button
                          disabled={item.product.stock === 0}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            item.product.stock > 0
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <FiShoppingCart />
                          {item.product.stock > 0 ? 'View Product' : 'Out of Stock'}
                        </button>
                      </Link>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 font-semibold"
                      >
                        <FiTrash2 />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Continue Shopping Section */}
          {wishlist.length > 0 && (
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

  return {
    props: {
      user: session?.user ? {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
      } : null,
    },
  };
};