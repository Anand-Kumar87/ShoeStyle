import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiCheck,
  FiChevronRight,
  FiMinus,
  FiPlus,
  FiHome,
  FiAlertCircle,
} from 'react-icons/fi';
import { useWishlist } from '@/hooks/useWishlist';
import prisma from '@/lib/prisma';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  images: string[];
  category: string;
  brand?: string | null;
  colors: string[];
  sizes: string[];
  stock: number;
  sku: string;
  isNew: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  material?: string | null;
  weight?: number | null;
}

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const allImages = product.images && product.images.length > 0 
    ? [product.image, ...product.images] 
    : [product.image];
    
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Please select a size');
      return;
    }

    setAddingToCart(true);
    
    // TODO: Implement actual cart functionality
    setTimeout(() => {
      alert(`✅ Added ${quantity} item(s) to cart!`);
      setAddingToCart(false);
    }, 500);
  };

  const handleWishlistToggle = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + router.asPath);
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Please select a size');
      return;
    }
    // TODO: Implement buy now functionality
    alert('Buy Now functionality - Coming soon!');
  };

  return (
    <>
      <Head>
        <title>{product.name} - ShoeStyle</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Breadcrumb */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-black transition-colors flex items-center gap-1">
                <FiHome />
                Home
              </Link>
              <FiChevronRight className="text-gray-400" />
              <Link href="/products" className="hover:text-black transition-colors">
                Products
              </Link>
              <FiChevronRight className="text-gray-400" />
              <Link 
                href={`/products?category=${product.category}`} 
                className="hover:text-black transition-colors"
              >
                {product.category}
              </Link>
              <FiChevronRight className="text-gray-400" />
              <span className="text-black font-medium truncate max-w-xs">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Left - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = 'https://via.placeholder.com/800x800?text=Product+Image';
                  }}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                      NEW
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                      -{discount}% OFF
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                    inWishlist
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-600 hover:text-pink-500'
                  }`}
                >
                  <FiHeart className={`text-xl ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-black shadow-lg scale-105 ring-2 ring-black ring-offset-2'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = 'https://via.placeholder.com/200x200?text=Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div className="space-y-6">
              {/* Brand & Name */}
              <div>
                {product.brand && (
                  <p className="text-blue-600 font-semibold mb-2 text-sm uppercase tracking-wide">
                    {product.brand}
                  </p>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
                
                {/* Rating & Reviews */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-700 font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                        Save ${(product.compareAtPrice - product.price).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Inclusive of all taxes • Free shipping on orders over $100
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {product.stock > 0 ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                      <FiCheck className="text-xl" />
                      <span className="font-semibold">In Stock</span>
                    </div>
                    <span className="text-gray-600">
                      {product.stock} {product.stock === 1 ? 'unit' : 'units'} available
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <FiAlertCircle className="text-xl" />
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="border-t border-b border-gray-200 py-6">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-gray-900">
                      Select Size {!selectedSize && <span className="text-red-500">*</span>}
                    </label>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium underline">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 px-4 rounded-lg font-bold transition-all ${
                          selectedSize === size
                            ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-3 block">
                    Select Color {selectedColor && `- ${selectedColor}`}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          selectedColor === color
                            ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-3 block">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="text-gray-700" />
                    </button>
                    <span className="px-8 py-3 font-bold text-gray-900 text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                      disabled={quantity >= product.stock}
                    >
                      <FiPlus className="text-gray-700" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Max: {product.stock} units
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <FiShoppingCart className="text-xl" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiTruck className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Free Shipping</p>
                    <p className="text-xs text-gray-600">Orders over $100</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiRotateCcw className="text-xl text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Easy Returns</p>
                    <p className="text-xs text-gray-600">30-day guarantee</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiShield className="text-xl text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Secure Payment</p>
                    <p className="text-xs text-gray-600">100% protected</p>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 block mb-1">SKU</span>
                    <span className="font-semibold text-gray-900">{product.sku}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-600 block mb-1">Category</span>
                    <span className="font-semibold text-gray-900">{product.category}</span>
                  </div>
                  {product.material && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600 block mb-1">Material</span>
                      <span className="font-semibold text-gray-900">{product.material}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600 block mb-1">Weight</span>
                      <span className="font-semibold text-gray-900">{product.weight}g</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">You May Also Like</h2>
                <Link
                  href={`/products?category=${product.category}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 group"
                >
                  View All
                  <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="relative aspect-square bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = 'https://via.placeholder.com/400x400?text=Product';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        {relatedProduct.brand && (
                          <p className="text-xs text-gray-500 mb-1">{relatedProduct.brand}</p>
                        )}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${relatedProduct.price.toFixed(2)}
                          </span>
                          {relatedProduct.compareAtPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${relatedProduct.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product || !product.isActive) {
      return {
        notFound: true,
      };
    }

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
      },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      notFound: true,
    };
  }
};