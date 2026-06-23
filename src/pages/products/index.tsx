import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/product/ProductGrid';
import ColorSwatch from '@/components/product/ColorSwatch'; // 🔥 ColorSwatch Imported
import { useGlobalCurrency } from '@/context/CurrencyContext';

const CATEGORIES = ['All', 'Running', 'Basketball', 'Lifestyle', 'Training', 'Sandals', 'Men', 'Women'];
const SIZES = ['5', '6', '7', '8', '9', '10', '11', '12', '13'];
const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Gray', 'Navy']; // 🔥 Colors Added
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

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
    setSelectedSizes([]); setSelectedColor(''); setPriceRange([0, 500]); setOffset(0);
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

      return dbCat === category;
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
  }
  if (sortBy === 'price-asc') displayProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') displayProducts.sort((a, b) => b.price - a.price);

  const displayTotal = displayProducts.length;
  const paginatedProducts = displayProducts.slice(offset, offset + LIMIT);
  const totalPages = Math.ceil(displayTotal / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const hasFilters = category || isNew || search || selectedSizes.length > 0 || selectedColor || priceRange[0] > 0 || priceRange[1] < 500;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
    router.push({ pathname: '/products', query: { ...router.query, search: searchInput } }, undefined, { shallow: true });
  };

  const Filters = (
    <aside className="w-full lg:w-60 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-700 underline underline-offset-2">
            Clear all
          </button>
        )}
      </div>

      <FilterAccordion title="Category">
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`block w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${(cat === 'All' && !category) || category === cat.toLowerCase()
                ? 'bg-black text-white font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion title="Price Range">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-black text-blue-600">
            <span>{currencyLoading ? '...' : convertPrice(priceRange[0])}</span>
            <span>{currencyLoading ? '...' : convertPrice(priceRange[1])}</span>
          </div>
          <input
            type="range" min={0} max={500} step={10}
            value={priceRange[1]}
            onChange={e => { setPriceRange([priceRange[0], +e.target.value]); setOffset(0); }}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-neutral-200 rounded-lg appearance-none"
          />
          <p className="text-[10px] text-neutral-400 font-medium text-center uppercase tracking-widest">Slide to adjust max price</p>
        </div>
      </FilterAccordion>

      {/* 🔥 Color Filter Re-Added */}
      <FilterAccordion title="Color">
        <ColorSwatch
          colors={COLORS}
          selectedColor={selectedColor}
          onColorChange={(color) => {
            setSelectedColor(selectedColor === color ? '' : color);
            setOffset(0);
          }}
        />
      </FilterAccordion>

      <FilterAccordion title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => { toggleSize(size); setOffset(0); }}
              className={`w-12 h-10 text-sm font-semibold rounded-lg border transition-all ${selectedSizes.includes(size)
                ? 'bg-black text-white border-black shadow-md'
                : 'border-neutral-200 text-neutral-700 hover:border-black hover:bg-neutral-50'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterAccordion>
    </aside>
  );

  return (
    <>
      <Head>
        <title>{search ? `"${search}" — ` : isNew ? 'New Arrivals — ' : category ? `${category} — ` : ''}All Products | ShoeStyle</title>
        <meta name="description" content="Shop the full collection of premium footwear." />
      </Head>

      <Header />

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-white z-50 overflow-y-auto p-6 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-black text-lg uppercase tracking-wide">Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X className="h-5 w-5" /></button>
              </div>
              {Filters}
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

            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setOffset(0); }}
              className="border border-neutral-200 rounded-full px-4 py-2.5 text-sm font-semibold outline-none focus:border-black bg-white shadow-sm cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
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