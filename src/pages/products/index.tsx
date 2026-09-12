import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, ChevronDown, Search, ArrowUpDown,
  Sparkles, Flame, ArrowUpNarrowWide, ArrowDownWideNarrow, Star, Percent, Check
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import ColorSwatch from '@/components/product/ColorSwatch'; // 🔥 ColorSwatch Imported
import { useGlobalCurrency } from '@/context/CurrencyContext';

const CATEGORIES = ['All', 'Running', 'Basketball', 'Lifestyle', 'Training', 'Sandals', 'Men', 'Women'];
const SIZES = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Gray', 'Navy']; // 🔥 Colors Added
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', desc: 'Latest drops & releases', icon: Sparkles },
  { value: 'popular', label: 'Best Selling', desc: 'Customer favorites & trending', icon: Flame },
  { value: 'price-asc', label: 'Price: Low to High', desc: 'Budget friendly first', icon: ArrowUpNarrowWide },
  { value: 'price-desc', label: 'Price: High to Low', desc: 'Luxury & collector editions', icon: ArrowDownWideNarrow },
  { value: 'rating', label: 'Top Customer Rated', desc: 'Highest rated footwear', icon: Star },
  { value: 'discount', label: 'Biggest Discount', desc: 'Maximum percentage savings', icon: Percent },
];

function FilterAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-neutral-100 pb-5 mb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3 focus:outline-none"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180 text-blue-600' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [category, setCategory] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(''); // 🔥 Color State
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  // 🔥 Luxury Sort Dropdown State
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSortOpen]);

  const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

  // 1. FETCH PRODUCTS
  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setAllProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // 2. READ URL PARAMETERS
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;

    if (q.category && typeof q.category === 'string') setCategory(q.category.toLowerCase());
    else setCategory('');

    if (q.isNew === 'true') setIsNew(true);
    else setIsNew(false);

    if (q.search && typeof q.search === 'string') {
      setSearch(q.search);
      setSearchInput(q.search);
    } else {
      setSearch('');
      setSearchInput('');
    }

    if (q.sortBy && typeof q.sortBy === 'string') setSortBy(q.sortBy);
  }, [router.isReady, router.query]);

  const removeFilterParam = (keyToRemove: string) => {
    const { [keyToRemove]: _, ...rest } = router.query;
    router.push({ pathname: '/products', query: rest }, undefined, { shallow: true });
  };

  const handleCategoryClick = (cat: string) => {
    const newCat = cat === 'All' ? '' : cat.toLowerCase();
    setCategory(newCat);
    setOffset(0);

    const query: any = { ...router.query };
    if (newCat) query.category = newCat;
    else delete query.category;
    router.push({ pathname: '/products', query }, undefined, { shallow: true });
  };

  const toggleSize = (size: string) =>
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);

  const clearFilters = () => {
    setCategory(''); setIsNew(false); setSortBy('newest'); setSearch(''); setSearchInput('');
    setSelectedSizes([]); setSelectedColor(''); setPriceRange([0, 50000]); setOffset(0);
    router.push('/products', undefined, { shallow: true });
  };

  // 3. SMART FRONTEND FILTERING
  let displayProducts = [...allProducts];

  displayProducts = displayProducts.filter(p => p.isActive !== false);

  if (isNew) {
    displayProducts = displayProducts.filter(p => p.isNew === true);
  }

  if (category) {
    displayProducts = displayProducts.filter(p => {
      const dbCat = p.category?.toLowerCase() || '';
      const dbName = p.name?.toLowerCase() || '';

      if (category === 'men') return dbCat === 'men' || dbName.includes('men') || dbName.includes('boy');
      if (category === 'women') return dbCat === 'women' || dbName.includes('women') || dbName.includes('girl');

      return dbCat === category || dbCat.includes(category);
    });
  }

  if (search) {
    const s = search.toLowerCase();
    displayProducts = displayProducts.filter(p =>
      p.name?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s) ||
      p.sku?.toLowerCase().includes(s)
    );
  }

  if (selectedSizes.length > 0) {
    displayProducts = displayProducts.filter(p =>
      p.sizes && p.sizes.some((size: string) => selectedSizes.includes(size))
    );
  }

  // 🔥 Color Filter Applied
  if (selectedColor) {
    displayProducts = displayProducts.filter(p =>
      p.colors && p.colors.some((color: string) => color.toLowerCase() === selectedColor.toLowerCase())
    );
  }

  displayProducts = displayProducts.filter(p =>
    p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  if (sortBy === 'newest') {
    displayProducts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } else if (sortBy === 'popular') {
    displayProducts.sort((a, b) => {
      const scoreA = (a.isFeatured ? 50 : 0) + (a.reviewCount || 0) * 2 + (a.rating || 4);
      const scoreB = (b.isFeatured ? 50 : 0) + (b.reviewCount || 0) * 2 + (b.rating || 4);
      return scoreB - scoreA;
    });
  } else if (sortBy === 'price-asc') {
    displayProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    displayProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    displayProducts.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
  } else if (sortBy === 'discount') {
    displayProducts.sort((a, b) => {
      const discA = a.compareAtPrice && a.compareAtPrice > a.price ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
      const discB = b.compareAtPrice && b.compareAtPrice > b.price ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
      return discB - discA;
    });
  }

  const displayTotal = displayProducts.length;
  const paginatedProducts = displayProducts.slice(offset, offset + LIMIT);
  const totalPages = Math.ceil(displayTotal / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const hasFilters = Boolean(
    category || isNew || search || selectedSizes.length > 0 || selectedColor || priceRange[0] > 0 || priceRange[1] < 50000
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
    router.push({ pathname: '/products', query: { ...router.query, search: searchInput } }, undefined, { shallow: true });
  };

  const FilterGroups = (
    <div className="space-y-6">
      <FilterAccordion title="Category">
        <div className="space-y-1.5 pt-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`block w-full text-left text-sm py-2 px-3.5 rounded-xl font-medium transition-all cursor-pointer ${(cat === 'All' && !category) || category === cat.toLowerCase()
                ? 'bg-black text-white font-bold shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Price Range">
        <div className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="bg-neutral-100 text-neutral-800 px-3 py-1 rounded-lg border border-neutral-200">
              {currencyLoading ? '...' : convertPrice(priceRange[0])}
            </span>
            <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider">to</span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
              {currencyLoading ? '...' : convertPrice(priceRange[1])}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={priceRange[1]}
            onChange={e => { setPriceRange([priceRange[0], +e.target.value]); setOffset(0); }}
            className="w-full accent-black cursor-pointer h-2 bg-neutral-200 rounded-lg appearance-none"
          />

          <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            <span>Min: {currencyLoading ? '...' : convertPrice(0)}</span>
            <span>Max: {currencyLoading ? '...' : convertPrice(50000)}</span>
          </div>
          <p className="text-[10px] text-neutral-400 font-medium text-center uppercase tracking-widest">Slide to adjust max budget</p>
        </div>
      </FilterAccordion>

      {/* 🔥 Luxury Color Filter */}
      <FilterAccordion title={`Color ${selectedColor ? `(${selectedColor})` : ''}`}>
        <div className="pt-1">
          <ColorSwatch
            colors={COLORS}
            selectedColor={selectedColor}
            onColorChange={(color) => {
              setSelectedColor(selectedColor.toLowerCase() === color.toLowerCase() ? '' : color);
              setOffset(0);
            }}
          />
          {selectedColor && (
            <button
              onClick={() => { setSelectedColor(''); setOffset(0); }}
              className="mt-3 text-[11px] font-bold text-red-500 hover:text-red-700 underline block cursor-pointer"
            >
              Clear Color Filter
            </button>
          )}
        </div>
      </FilterAccordion>

      {/* 🔥 Luxury Size Filter */}
      <FilterAccordion title={`Size (UK) ${selectedSizes.length > 0 ? `(${selectedSizes.length})` : ''}`}>
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map(size => {
              const isSelected = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => { toggleSize(size); setOffset(0); }}
                  className={`h-11 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white border-2 border-black shadow-md scale-105'
                      : 'bg-neutral-50 border border-neutral-200 text-neutral-800 hover:border-black hover:bg-neutral-100'
                  }`}
                >
                  UK {size}
                </button>
              );
            })}
          </div>
          {selectedSizes.length > 0 && (
            <button
              onClick={() => { setSelectedSizes([]); setOffset(0); }}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 underline block cursor-pointer"
            >
              Clear Size Filters
            </button>
          )}
        </div>
      </FilterAccordion>
    </div>
  );

  const Filters = (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 underline underline-offset-2 cursor-pointer">
            Clear all
          </button>
        )}
      </div>
      {FilterGroups}
    </aside>
  );

  return (
    <>
      <Head>
        <title>{`${search ? `"${search}" — ` : isNew ? 'New Arrivals — ' : category ? `${category} — ` : ''}All Products | ShoeStyle`}</title>
        <meta name="description" content="Shop the full collection of premium footwear." />
      </Head>

      <Header />

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-80 sm:w-96 max-w-[85vw] h-[100dvh] max-h-[100dvh] bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base uppercase tracking-wider text-black">Filters</span>
                  {hasFilters && (
                    <span className="bg-black text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {[category ? 1 : 0, selectedColor ? 1 : 0, selectedSizes.length, priceRange[1] < 50000 ? 1 : 0].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold text-red-500 hover:text-red-700 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                    aria-label="Close Filters"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain space-y-6">
                {FilterGroups}
              </div>

              {/* Drawer Sticky Bottom Action Bar */}
              <div className="p-4 border-t border-neutral-100 bg-white flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-black text-white h-12 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-900 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Apply Filters</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                    {displayTotal} Products
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-white">
        <div className="bg-neutral-950 text-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-['Poppins'] text-4xl sm:text-5xl font-black uppercase tracking-tight">
              {search ? `"${search}"` : isNew ? 'New Arrivals' : category ? category : 'All Products'}
            </h1>
            {!loading && (
              <p className="mt-2 text-neutral-400 text-sm font-medium">{displayTotal} product{displayTotal !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-neutral-200 rounded-full px-4 py-2 text-sm font-semibold hover:border-black transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasFilters && <span className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{[category, isNew, search, selectedColor, ...selectedSizes].filter(Boolean).length}</span>}
              </button>

              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search styles..."
                  className="pl-9 pr-4 py-2.5 border border-neutral-200 rounded-full text-sm font-medium outline-none focus:border-black w-56 transition-all focus:w-80 shadow-sm"
                />
              </form>
            </div>

            {/* 🔥 Luxury Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative z-30">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-neutral-200 hover:border-black bg-white shadow-xs text-xs sm:text-sm font-bold text-neutral-800 transition-all cursor-pointer hover:shadow-md active:scale-95"
              >
                <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-black transition-colors">
                  <ArrowUpDown size={14} />
                  <span className="hidden sm:inline font-semibold text-neutral-500">Sort:</span>
                </div>
                <span className="text-black font-black">
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-neutral-500 transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-black' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-2xl shadow-2xl p-2 z-50 space-y-1"
                  >
                    <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sort Collection</span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {displayTotal} items
                      </span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {SORT_OPTIONS.map((option) => {
                        const isSelected = sortBy === option.value;
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSortBy(option.value);
                              setOffset(0);
                              setIsSortOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-950 text-white shadow-sm'
                                : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-black'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-neutral-100 text-neutral-600'
                                }`}
                              >
                                <Icon size={15} />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                                  {option.label}
                                </p>
                                <p className={`text-[10px] truncate ${isSelected ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                  {option.desc}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <Check size={16} className="text-white flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex gap-10">
            <div className="hidden lg:block">{Filters}</div>

            <div className="flex-1 min-w-0">
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {category && (
                    <button onClick={() => { setCategory(''); removeFilterParam('category'); }} className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize hover:bg-neutral-800 transition-colors">
                      {category} <X className="h-3 w-3" />
                    </button>
                  )}
                  {isNew && (
                    <button onClick={() => { setIsNew(false); removeFilterParam('isNew'); }} className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize hover:bg-indigo-700 transition-colors shadow-sm">
                      New Arrivals <X className="h-3 w-3" />
                    </button>
                  )}
                  {search && (
                    <button onClick={() => { setSearch(''); setSearchInput(''); removeFilterParam('search'); }} className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-neutral-800 transition-colors">
                      "{search}" <X className="h-3 w-3" />
                    </button>
                  )}
                  {/* 🔥 Active Color Badge */}
                  {selectedColor && (
                    <button onClick={() => { setSelectedColor(''); }} className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full capitalize hover:bg-blue-700 transition-colors">
                      Color: {selectedColor} <X className="h-3 w-3" />
                    </button>
                  )}
                  {selectedSizes.map(s => (
                    <button key={s} onClick={() => toggleSize(s)} className="flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-neutral-700 transition-colors">
                      US {s} <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}

              <ProductGrid products={paginatedProducts} loading={loading} />

              {totalPages > 1 && !loading && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => { setOffset(offset - LIMIT); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-5 py-2.5 border border-neutral-200 rounded-full text-sm font-bold disabled:opacity-40 hover:border-black transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-bold text-neutral-500 px-4">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => { setOffset(offset + LIMIT); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold disabled:opacity-40 hover:bg-neutral-800 transition-colors shadow-md"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}