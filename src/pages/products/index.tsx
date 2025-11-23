import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiGrid,
  FiList,
  FiFilter,
  FiSearch,
  FiX,
  FiChevronDown,
  FiStar,
  FiHeart,
  FiShoppingCart,
} from 'react-icons/fi';
import { useWishlist } from '@/hooks/useWishlist';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  colors: string[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isFeatured: boolean;
  stock: number;
}

interface ProductsPageProps {
  initialProducts: Product[];
  initialTotal: number;
  categories: string[];
  brands: string[];
}

export default function ProductsPage({ 
  initialProducts, 
  initialTotal,
  categories,
  brands 
}: ProductsPageProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    brand: '',
    minPrice: '',
    maxPrice: '',
    colors: [] as string[],
    sizes: [] as string[],
    sortBy: 'newest',
  });

  const [page, setPage] = useState(1);
  const limit = 20;

  // Available filter options
  const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Green', 'Brown', 'Gray', 'Pink'];
  const sizeOptions = ['6', '7', '8', '9', '10', '11', '12'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
  ];

  // Fetch products
  const fetchProducts = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((currentPage - 1) * limit).toString(),
        sortBy: filters.sortBy,
      });

      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.colors.length > 0) params.append('colors', filters.colors.join(','));
      if (filters.sizes.length > 0) params.append('sizes', filters.sizes.join(','));
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      setProducts(data.products);
      setTotal(data.total);
      if (resetPage) setPage(1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    fetchProducts(true);
  }, [filters, searchQuery]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFilter = (key: 'colors' | 'sizes', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      brand: '',
      minPrice: '',
      maxPrice: '',
      colors: [],
      sizes: [],
      sortBy: 'newest',
    });
    setSearchQuery('');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Head>
        <title>Premium Footwear Collection - ShoeStyle</title>
        <meta name="description" content="Discover our curated collection of premium shoes" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-bold mb-4">Our Collection</h1>
            <p className="text-xl text-gray-300">
              Discover {total} premium shoes crafted for style and comfort
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search & Filters Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search shoes, brands, styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all"
                />
              </div>

              {/* Sort & View Controls */}
              <div className="flex gap-4 items-center w-full lg:w-auto">
                {/* Sort Dropdown */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-md text-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <FiGrid className="text-xl" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white shadow-md text-black'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <FiList className="text-xl" />
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-3 bg-black text-white rounded-xl flex items-center gap-2"
                >
                  <FiFilter />
                  Filters
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.category !== 'all' || filters.brand || filters.colors.length > 0 || filters.sizes.length > 0 || searchQuery) && (
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
                {filters.category !== 'all' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2">
                    {filters.category}
                    <FiX
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => handleFilterChange('category', 'all')}
                    />
                  </span>
                )}
                {filters.brand && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-2">
                    {filters.brand}
                    <FiX
                      className="cursor-pointer hover:text-purple-900"
                      onClick={() => handleFilterChange('brand', '')}
                    />
                  </span>
                )}
                {filters.colors.map(color => (
                  <span key={color} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium flex items-center gap-2">
                    {color}
                    <FiX
                      className="cursor-pointer hover:text-pink-900"
                      onClick={() => toggleFilter('colors', color)}
                    />
                  </span>
                ))}
                {filters.sizes.map(size => (
                  <span key={size} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2">
                    Size {size}
                    <FiX
                      className="cursor-pointer hover:text-green-900"
                      onClick={() => toggleFilter('sizes', size)}
                    />
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-semibold underline"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Clear All
                  </button>
                </div>

                {/* Category Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-gray-900 cursor-pointer">
                      <input
                        type="radio"
                        checked={filters.category === 'all'}
                        onChange={() => handleFilterChange('category', 'all')}
                        className="w-4 h-4 text-black"
                      />
                      <span>All Categories</span>
                    </label>
                    {categories.map(category => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={filters.category === category}
                          onChange={() => handleFilterChange('category', category)}
                          className="w-4 h-4 text-black"
                        />
                        <span className="capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                {brands.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Brand</h4>
                    <select
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black/10"
                    >
                      <option value="">All Brands</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-black focus:ring-2 focus:ring-black/10"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => toggleFilter('colors', color)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          filters.colors.includes(color)
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Sizes</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {sizeOptions.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleFilter('sizes', size)}
                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                          filters.sizes.includes(size)
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className="lg:col-span-3">
              {loading ? (
                // Loading State
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading amazing products...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                // Empty State
                <div className="text-center py-20">
                  <div className="inline-block p-8 bg-gray-100 rounded-full mb-6">
                    <FiSearch className="text-6xl text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  <div className="mb-6">
                    <p className="text-gray-600">
                      Showing <span className="font-semibold text-gray-900">{products.length}</span> of{' '}
                      <span className="font-semibold text-gray-900">{total}</span> products
                    </p>
                  </div>

                  {/* Products Grid */}
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-6'
                  }>
                    {products.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode={viewMode}
                        isInWishlist={isInWishlist(product.id)}
                        onToggleWishlist={() => toggleWishlist(product.id)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setPage(p => Math.max(1, p - 1));
                          fetchProducts();
                        }}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-black transition-colors"
                      >
                        Previous
                      </button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setPage(pageNum);
                              fetchProducts();
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                              page === pageNum
                                ? 'bg-black text-white'
                                : 'border-2 border-gray-200 hover:border-black'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => {
                          setPage(p => Math.min(totalPages, p + 1));
                          fetchProducts();
                        }}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-black transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  viewMode, 
  isInWishlist, 
  onToggleWishlist 
}: { 
  product: Product; 
  viewMode: 'grid' | 'list';
  isInWishlist: boolean;
  onToggleWishlist: () => void;
}) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex">
          <div className="relative w-64 h-64">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                NEW
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleWishlist();
                  }}
                  className={`p-3 rounded-full transition-all ${
                    isInWishlist
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500'
                  }`}
                >
                  <FiHeart className={isInWishlist ? 'fill-current' : ''} />
                </button>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-yellow-400">
                  <FiStar className="fill-current" />
                  <span className="ml-1 text-gray-900 font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-500">({product.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                  {product.compareAtPrice && (
                    <span className="text-lg text-gray-400 line-through">${product.compareAtPrice}</span>
                  )}
                </div>
                {product.stock < 10 && product.stock > 0 && (
                  <p className="text-sm text-orange-600 mt-1">Only {product.stock} left!</p>
                )}
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center gap-2 shadow-lg">
                <FiShoppingCart />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
        <div className="relative h-80">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {product.isNew && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              NEW
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{discount}%
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist();
            }}
            className={`absolute top-4 right-4 ${discount > 0 ? 'top-16' : ''} p-3 rounded-full transition-all shadow-lg ${
              isInWishlist
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500'
            }`}
          >
            <FiHeart className={isInWishlist ? 'fill-current' : ''} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={i < Math.floor(product.rating) ? 'fill-current' : ''}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">${product.price}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">${product.compareAtPrice}</span>
            )}
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-md">
            <FiShoppingCart />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const total = await prisma.product.count({ where: { isActive: true } });

  // Get unique categories and brands
  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  return {
    props: {
      initialProducts: JSON.parse(JSON.stringify(products)),
      initialTotal: total,
      categories,
      brands,
    },
  };
};