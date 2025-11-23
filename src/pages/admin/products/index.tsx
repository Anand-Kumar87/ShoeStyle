import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiPlus,
    FiSearch,
    FiEdit,
    FiTrash2,
    FiEye,
    FiPackage,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiImage,
    FiDollarSign,
    FiBox,
} from 'react-icons/fi';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    images: string[];
    category: string;
    brand?: string;
    colors: string[];
    sizes: string[];
    stock: number;
    sku: string;
    isNew: boolean;
    isFeatured: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const categories = ['Sneakers', 'Running', 'Basketball', 'Casual', 'Formal', 'Sports'];

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, selectedCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory !== 'all') params.append('category', selectedCategory);

            const response = await fetch(`/api/admin/products?${params}`);
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/products?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProducts(products.filter(p => p.id !== id));
                setDeleteConfirm(null);
                alert('Product deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            const response = await fetch('/api/admin/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: product.id,
                    isActive: !product.isActive,
                }),
            });

            if (response.ok) {
                fetchProducts();
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const stats = {
        total: products.length,
        active: products.filter(p => p.isActive).length,
        lowStock: products.filter(p => p.stock < 10).length,
        outOfStock: products.filter(p => p.stock === 0).length,
    };

    return (
        <>
            <Head>
                <title>Products Management - Admin</title>
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-8 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Products Management</h1>
                                <p className="text-gray-300">Manage your product inventory</p>
                            </div>
                            <div className="flex gap-4">
                                <Link
                                    href="/admin"
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                >
                                    ← Dashboard
                                </Link>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <FiPlus className="text-xl" />
                                    Add Product
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Products</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="p-4 bg-blue-100 rounded-xl">
                                    <FiPackage className="text-3xl text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Active</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
                                </div>
                                <div className="p-4 bg-green-100 rounded-xl">
                                    <FiCheck className="text-3xl text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Low Stock</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.lowStock}</p>
                                </div>
                                <div className="p-4 bg-orange-100 rounded-xl">
                                    <FiAlertCircle className="text-3xl text-orange-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Out of Stock</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.outOfStock}</p>
                                </div>
                                <div className="p-4 bg-red-100 rounded-xl">
                                    <FiBox className="text-3xl text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    placeholder="Search products by name or SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all"
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:border-black focus:ring-4 focus:ring-black/10 transition-all"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="p-12 text-center">
                                <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-6">Start by adding your first product</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    Add Product
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{product.name}</p>
                                                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900">${product.price}</p>
                                                    {product.compareAtPrice && (
                                                        <p className="text-sm text-gray-500 line-through">${product.compareAtPrice}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock === 0
                                                        ? 'bg-red-100 text-red-800'
                                                        : product.stock < 10
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {product.stock} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggleStatus(product)}
                                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${product.isActive
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {product.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/products/${product.slug}`}
                                                            target="_blank"
                                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <FiEye className="text-lg" />
                                                        </Link>
                                                        <button
                                                            onClick={() => setEditingProduct(product)}
                                                            className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FiEdit className="text-lg" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(product.id)}
                                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="text-lg" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Product Modal */}
            {(showAddModal || editingProduct) && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => {
                        setShowAddModal(false);
                        setEditingProduct(null);
                    }}
                    onSuccess={() => {
                        setShowAddModal(false);
                        setEditingProduct(null);
                        fetchProducts();
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
                                <FiAlertCircle className="text-4xl text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Product?</h3>
                            <p className="text-gray-600 mb-6">
                                This action cannot be undone. Are you sure you want to delete this product?
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Product Modal Component - COMPLETE REPLACEMENT
function ProductModal({
    product,
    onClose,
    onSuccess,
}: {
    product: Product | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        slug: product?.slug || '',
        description: product?.description || '',
        price: product?.price || 0,
        compareAtPrice: product?.compareAtPrice || 0,
        image: product?.image || '',
        images: product?.images || [],
        category: product?.category || 'Sneakers',
        brand: product?.brand || '',
        colors: product?.colors || [],
        sizes: product?.sizes || [],
        stock: product?.stock || 0,
        sku: product?.sku || '',
        isNew: product?.isNew || false,
        isFeatured: product?.isFeatured || false,
        isActive: product?.isActive !== false,
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Generate slug from name if empty
            if (!formData.slug) {
                formData.slug = formData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }

            // Prepare data
            const dataToSend = {
                ...formData,
                price: parseFloat(formData.price.toString()) || 0,
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice.toString()) : 0,
                stock: parseInt(formData.stock.toString()) || 0,
            };

            console.log('📤 Sending data:', dataToSend);

            const response = await fetch('/api/admin/products', {
                method: product ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product ? { ...dataToSend, id: product.id } : dataToSend),
            });

            const result = await response.json();
            console.log('📥 Response:', result);

            if (response.ok) {
                alert(product ? '✅ Product updated successfully!' : '✅ Product created successfully!');
                onSuccess();
            } else {
                // Show detailed error
                const errorMsg = result.error || result.message || 'Unknown error';
                const details = result.details ? `\n\nDetails: ${result.details}` : '';
                alert(`❌ Failed to save product\n\nError: ${errorMsg}${details}`);
                console.error('API Error:', result);
            }
        } catch (error: any) {
            console.error('❌ Error saving product:', error);
            alert(`❌ An error occurred\n\nError: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* Modal Container with proper scrolling */}
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        type="button"
                    >
                        <FiX className="text-2xl" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 p-6">
                    <form onSubmit={handleSubmit} id="product-form" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="e.g., Nike Air Max 270"
                                />
                            </div>

                            {/* SKU */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="Auto-generated if empty"
                                />
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="product-name-url"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Price <span className="text-red-500">*</span> ($)
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="149.99"
                                />
                            </div>

                            {/* Compare Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Compare At Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.compareAtPrice || ''}
                                    onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="199.99"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                >
                                    <option value="Sneakers">Sneakers</option>
                                    <option value="Running">Running</option>
                                    <option value="Basketball">Basketball</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Formal">Formal</option>
                                    <option value="Sports">Sports</option>
                                </select>
                            </div>

                            {/* Brand */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="Nike, Adidas, etc."
                                />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Stock Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="100"
                                />
                            </div>

                            {/* Image URL */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Main Image URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {formData.image && (
                                    <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                                        <Image
                                            src={formData.image}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'https://via.placeholder.com/400x400?text=Invalid+Image';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                                placeholder="Enter detailed product description..."
                            />
                        </div>

                        {/* Sizes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Available Sizes (comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.sizes.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="7, 8, 9, 10, 11, 12"
                            />
                            <p className="text-sm text-gray-500 mt-1">Example: 7, 8, 9, 10</p>
                        </div>

                        {/* Colors */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Available Colors (comma separated)
                            </label>
                            <input
                                type="text"
                                value={formData.colors.join(', ')}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    colors: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="Black, White, Red, Blue"
                            />
                            <p className="text-sm text-gray-500 mt-1">Example: Black, White, Red</p>
                        </div>

                        {/* Checkboxes */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Product Settings</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isNew}
                                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">Mark as New</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">Featured</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="font-medium text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer - Fixed */}
                <div className="flex gap-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            product ? 'Update Product' : 'Create Product'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session || !session.user || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/admin',
                permanent: false,
            },
        };
    }

    return {
        props: {},
    };
};