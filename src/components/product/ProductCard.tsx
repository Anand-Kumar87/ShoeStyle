import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useWishlist } from '@/hooks/useWishlist';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    rating: number;
    reviewCount: number;
    isNew?: boolean;
    isFeatured?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + router.asPath);
      return;
    }

    setIsToggling(true);
    await toggleWishlist(product.id);
    setIsToggling(false);
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Image - Wrap entire card in Link */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative h-80 bg-gray-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 space-y-2">
            {product.isNew && (
              <span className="block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                NEW
              </span>
            )}
            {discount > 0 && (
              <span className="block px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist Button - Outside Link */}
          <button
            onClick={handleWishlistToggle}
            disabled={isToggling}
            className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-10 ${
              inWishlist
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-600 hover:text-pink-500'
            }`}
          >
            <FiHeart
              className={`text-xl ${inWishlist ? 'fill-current' : ''}`}
            />
          </button>

          {/* Quick Actions - Show on Hover */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2">
              <FiEye />
              Quick View
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">
                ${product.compareAtPrice}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/products/${product.slug}`);
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <FiShoppingCart />
            Add to Cart
          </button>
        </div>
      </Link>
    </div>
  );
}