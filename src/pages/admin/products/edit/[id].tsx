import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Save, ArrowLeft, Image as ImageIcon, Tag, Hash, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // 🔥 Added framer-motion for smooth UI animations

export default function EditProduct() {
    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 🔥 Added isSale and salePrice to initial state
    const [formData, setFormData] = useState({
        name: '', slug: '', description: '',
        price: '', compareAtPrice: '', salePrice: '', stock: '', sku: '',
        category: 'sneakers', brand: '',
        image: '', images: '',
        sizes: '', colors: '',
        isActive: true, isFeatured: false, isNew: false, isSale: false
    });

    // Fetch Existing Product Data
    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${id}`);
            if (!res.ok) throw new Error('Product not found');

            const data = await res.json();

            // Populate form data (Convert arrays back to comma-separated strings for input fields)
            setFormData({
                ...data,
                price: data.price?.toString() || '',
                compareAtPrice: data.compareAtPrice?.toString() || '',
                salePrice: data.salePrice?.toString() || '', // 🔥 Fetch existing sale price
                isSale: data.isSale || false,                // 🔥 Fetch existing sale status
                stock: data.stock?.toString() || '',
                images: Array.isArray(data.images) ? data.images.join(', ') : '',
                sizes: Array.isArray(data.sizes) ? data.sizes.join(', ') : '',
                colors: Array.isArray(data.colors) ? data.colors.join(', ') : '',
            });
        } catch (error) {
            toast.error('Failed to load product details');
            router.push('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });

        // Auto-update slug if name changes
        if (name === 'name') {
            setFormData(prev => ({ ...prev, name: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Format data back to arrays and numbers for Prisma
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                salePrice: formData.isSale && formData.salePrice ? parseFloat(formData.salePrice) : null, // 🔥 Added sale price logic
                stock: parseInt(formData.stock) || 0,
                images: formData.images ? formData.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                sizes: formData.sizes ? formData.sizes.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean) : [],
                colors: formData.colors ? formData.colors.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            };

            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Product updated successfully!');
                router.push('/admin/products');
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to update product');
            }
        } catch (error) {
            toast.error('Something went wrong!');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Head><title>Edit {formData.name} | Admin</title></Head>

            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-600" /></Link>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Edit Product</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/products"><button className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button></Link>
                    <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50">
                        {saving ? 'Updating...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-black text-slate-900 mb-6">General Information</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Product Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Media Links</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Main Image URL <span className="text-red-500">*</span></label>
                                    <input type="text" name="image" value={formData.image} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Gallery Images (Comma separated URLs)</label>
                                    <textarea name="images" value={formData.images} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Layers size={20} className="text-purple-500" /> Variants</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Sizes (Comma separated)</label>
                                    <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Colors (Comma separated)</label>
                                    <input type="text" name="colors" value={formData.colors} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5">Pricing</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Price ($) <span className="text-red-500">*</span></label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-black text-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>

                                {/* 🔥 NEW: Conditional Sale Price Input */}
                                <AnimatePresence>
                                    {formData.isSale && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                                            <label className="block text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">Sale Price ($) <span className="text-red-500">*</span></label>
                                            <input type="number" step="0.01" name="salePrice" value={formData.salePrice} onChange={handleChange} required className="w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl font-black text-lg text-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all" placeholder="Discounted Price" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Compare at Price ($)</label>
                                    <input type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-slate-400 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5 flex items-center gap-2"><Hash size={18} className="text-emerald-500" /> Inventory</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5 flex items-center gap-2"><Tag size={18} className="text-orange-500" /> Organization</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                                        <option value="sneakers">Sneakers</option>
                                        <option value="running">Running</option>
                                        <option value="basketball">Basketball</option>
                                        <option value="lifestyle">Lifestyle</option>
                                        <option value="training">Training</option>
                                        <option value="sandals">Sandals</option>
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                        <option value="unisex">Unisex</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5">Product Status</h2>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <span className="font-bold text-slate-700">Active Status</span>
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded text-blue-600" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                                    <span className="font-bold text-purple-700">Featured Product</span>
                                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 rounded text-purple-600" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors">
                                    <span className="font-bold text-sky-700">Mark as New</span>
                                    <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-5 h-5 rounded text-sky-600" />
                                </label>
                                {/* 🔥 NEW: Put on Sale Toggle */}
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm">
                                    <span className="font-black text-emerald-700 uppercase tracking-widest text-xs">Put on Sale</span>
                                    <input type="checkbox" name="isSale" checked={formData.isSale} onChange={handleChange} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                </label>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}