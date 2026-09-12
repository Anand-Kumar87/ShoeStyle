import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Search, Edit3, Trash2, CheckCircle2,
  XCircle, UploadCloud, RefreshCw, X, AlertCircle,
  Package, Link2, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  _count?: { products: number };
  createdAt?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Products Multi-Select State for Category
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
    parentId: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Categories
  const fetchCategories = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      if (isRefresh) toast.success('Categories refreshed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // Load products list for category product-selector
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch(console.error);
  }, []);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? cat.isActive
          : !cat.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  // Stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive).length;
  const totalLinkedProducts = categories.reduce(
    (acc, c) => acc + (c._count?.products || 0),
    0
  );

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
      parentId: '',
    });
    setSelectedProductIds([]);
    setProductSearch('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive,
      parentId: cat.parentId || '',
    });
    setProductSearch('');
    // Pre-select all products currently linked to this category
    const catNameLower = cat.name.toLowerCase();
    const currentProductIds = allProducts
      .filter((p) => p.categoryId === cat.id || (p.category && p.category.toLowerCase().includes(catNameLower)))
      .map((p) => p.id);
    setSelectedProductIds(currentProductIds);
    setIsModalOpen(true);
  };

  // Filtered Products for the modal
  const filteredModalProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const s = productSearch.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(s) ||
        p.brand?.toLowerCase().includes(s) ||
        p.sku?.toLowerCase().includes(s) ||
        p.category?.toLowerCase().includes(s)
    );
  }, [allProducts, productSearch]);

  const toggleProductSelection = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const selectAllFilteredProducts = () => {
    const idsToAdd = filteredModalProducts.map((p) => p.id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const clearAllSelectedProducts = () => {
    setSelectedProductIds([]);
  };

  // Handle Name Change -> Auto Slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!editingCategory) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, name: val, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name: val }));
    }
  };

  // Image Upload to Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size must be less than 15MB');
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading('Uploading image to Supabase Storage...');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            filename: file.name,
            folder: 'categories',
          }),
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.message || 'Upload failed');
        }

        const data = await uploadRes.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success('Image uploaded to Supabase Storage!', { id: toastId });
        setUploadingImage(false);
      };
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Image upload failed', { id: toastId });
      setUploadingImage(false);
    }
  };

  // Save (Create or Update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setModalLoading(true);
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          image: formData.image || null,
          isActive: formData.isActive,
          parentId: formData.parentId || null,
          productIds: selectedProductIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save category');
      }

      toast.success(
        editingCategory
          ? 'Category updated successfully'
          : 'Category created successfully'
      );
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle Active Status Directly
  const handleToggleStatus = async (cat: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success(
        `Category "${cat.name}" is now ${!cat.isActive ? 'Active' : 'Inactive'}`
      );
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: CategoryItem) => {
    const confirmMsg =
      cat._count && cat._count.products > 0
        ? `Are you sure you want to delete "${cat.name}"? ${cat._count.products} products are linked to this category and will be unlinked safely.`
        : `Are you sure you want to delete category "${cat.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    const t = toast.loading('Deleting category...');
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete category');

      toast.success('Category deleted successfully', { id: t });
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category', { id: t });
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Categories Management — ShoeStyle Admin</title>
      </Head>

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers size={22} />
              </span>
              Categories
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Manage product classifications, collections, and catalog tags
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCategories(true)}
              disabled={refreshing || loading}
              className="p-3 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh categories"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : ''} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 text-sm"
            >
              <Plus size={18} /> Add Category
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl">
              <Layers size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Total Categories</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCategories}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xl">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Active Categories</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCategories}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xl">
              <Package size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Products Linked</p>
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{totalLinkedProducts}</h3>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-[#0f172a] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by category name, slug or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All ({totalCategories})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Active ({activeCategories})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                statusFilter === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Inactive ({totalCategories - activeCategories})
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Category</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Slug</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Description</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Products</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right pr-8">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-4 w-28 bg-slate-200 rounded" />
                            <div className="h-3 w-16 bg-slate-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                      <td className="px-6 py-5 text-center"><div className="h-6 w-12 bg-slate-200 rounded-full mx-auto" /></td>
                      <td className="px-6 py-5 text-center"><div className="h-6 w-16 bg-slate-200 rounded-full mx-auto" /></td>
                      <td className="px-6 py-5 text-right"><div className="h-8 w-16 bg-slate-200 rounded-xl ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-400">
                        <Layers size={28} />
                      </div>
                      <p className="text-slate-900 font-bold text-lg mb-1">No categories found</p>
                      <p className="text-slate-500 text-sm">
                        {searchTerm ? 'Try adjusting your search query' : 'Get started by creating your first category'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Name & Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Layers size={20} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{cat.name}</p>
                            {cat.parent && (
                              <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                Sub of <span className="font-bold text-blue-600">{cat.parent.name}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          /{cat.slug}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {cat.description || <span className="text-slate-300 italic">No description</span>}
                        </p>
                      </td>

                      {/* Products Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-600">
                          <Package size={13} />
                          {cat._count?.products || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {cat.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                          {cat.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                            title="Edit Category"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create or Edit Category */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#0f172a] w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors"
              >
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers size={20} className="text-blue-600 dark:text-blue-400" />
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSaveCategory} className="p-8 space-y-6 overflow-y-auto flex-1">
                  {/* Category Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Running Shoes"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  {/* Category Slug */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-slate-400 dark:text-slate-500 text-sm">/</span>
                      <input
                        type="text"
                        required
                        placeholder="running-shoes"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
                          })
                        }
                        className="w-full pl-8 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  {/* Parent Category (Optional) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Parent Category (Optional)
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">None (Top-Level Category)</option>
                      {categories
                        .filter((c) => !editingCategory || c.id !== editingCategory.id)
                        .map((c) => (
                          <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Brief description of this collection or category..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  {/* Image Upload / Storage */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center justify-between">
                      <span>Category Image</span>
                      <span className="text-blue-600 font-bold normal-case text-[11px]">
                        ☁️ Uploads to Supabase Storage
                      </span>
                    </label>

                    <div className="flex items-center gap-4">
                      {/* Image Preview Box */}
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
                        {formData.image ? (
                          <>
                            <img
                              src={formData.image}
                              alt="Category preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <Layers size={24} className="text-slate-300" />
                        )}
                      </div>

                      {/* Upload button & Direct URL input */}
                      <div className="flex-1 space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={uploadingImage}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                        >
                          <UploadCloud size={16} />
                          {uploadingImage ? 'Uploading to Supabase...' : 'Upload Image File'}
                        </button>
                        <input
                          type="url"
                          placeholder="Or paste external image URL..."
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-mono focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assign Products (Multiple Selection) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Assign Products (Multiple)
                        </label>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Select products to attach to this category
                        </p>
                      </div>
                      <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
                        {selectedProductIds.length} Selected
                      </span>
                    </div>

                    {/* Search & Quick Actions */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products by name, brand, SKU..."
                          className="w-full pl-8 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                        />
                        {productSearch && (
                          <button
                            type="button"
                            onClick={() => setProductSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={selectAllFilteredProducts}
                        className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold whitespace-nowrap transition-colors"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllSelectedProducts}
                        className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold whitespace-nowrap transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    {/* Scrollable Product Picker List */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-2 max-h-56 overflow-y-auto space-y-1.5 bg-slate-50/60 dark:bg-slate-900/60">
                      {filteredModalProducts.length === 0 ? (
                        <p className="text-center py-6 text-xs text-slate-400 font-medium">
                          No products found matching &ldquo;{productSearch}&rdquo;
                        </p>
                      ) : (
                        filteredModalProducts.map((prod) => {
                          const isSelected = selectedProductIds.includes(prod.id);
                          return (
                            <div
                              key={prod.id}
                              onClick={() => toggleProductSelection(prod.id)}
                              className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border select-none ${
                                isSelected
                                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-xs'
                                  : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                              />
                              <img
                                src={prod.image || '/placeholder.png'}
                                alt={prod.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.png';
                                }}
                                className="w-9 h-9 object-cover rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate text-slate-900 dark:text-white">
                                  {prod.name}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                  ₹{prod.price} {prod.brand ? `• ${prod.brand}` : ''} {prod.category ? `• Cat: ${prod.category}` : ''}
                                </p>
                              </div>
                              {isSelected ? (
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                                  Selected
                                </span>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <label className="flex items-center justify-between cursor-pointer p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Active Category</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Visible on storefront and product filters</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  {/* Modal Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading || uploadingImage}
                      className="flex items-center gap-2 bg-blue-600 text-white px-7 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 text-sm"
                    >
                      {modalLoading ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const isAdmin = session?.user?.role?.toString().toUpperCase() === 'ADMIN';

  if (!session || !isAdmin) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/admin/categories',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
