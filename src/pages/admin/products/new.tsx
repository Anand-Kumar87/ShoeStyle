'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Save, ArrowLeft, Image as ImageIcon, Tag, Hash, Layers, UploadCloud, X, Link2, Plus } from 'lucide-react'; // 🔥 Added 'Plus' icon
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 🔥 MEDIA UPLOAD STATES
    const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
    const [dragActive, setDragActive] = useState(false);

    // Main Image State
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 🔥 NEW: Gallery Images State (Multiple Images)
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Advanced Form State
    const [formData, setFormData] = useState({
        name: '', slug: '', description: '',
        price: '', compareAtPrice: '', salePrice: '', stock: '', sku: '',
        category: 'sneakers', brand: '',
        image: '', images: '', // For URL method
        sizes: '', colors: '',
        isActive: true, isFeatured: false, isNew: true, isSale: false
    });

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });

        if (name === 'name') {
            setFormData(prev => ({ ...prev, name: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
        }
    };

    // ==========================================
    // 📸 MAIN IMAGE LOGIC
    // ==========================================
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const processMainFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => setPreviewImage(reader.result as string);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processMainFile(e.dataTransfer.files[0]);
        }
    };

    const removeMainImage = () => {
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ==========================================
    // 🖼️ MULTIPLE GALLERY IMAGES LOGIC
    // ==========================================
    const processGalleryFiles = (files: FileList | File[]) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

        if (validFiles.length === 0) return toast.error('Please select valid image files');

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setGalleryPreviews(prev => [...prev, reader.result as string]);
            };
        });
    };

    const removeGalleryImage = (indexToRemove: number) => {
        setGalleryPreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };


    // ==========================================
    // 💾 SUBMIT LOGIC
    // ==========================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validations
            if (uploadMethod === 'upload' && !previewImage) {
                toast.error("Main Cover image is required!");
                setLoading(false);
                return;
            }
            if (uploadMethod === 'url' && !formData.image) {
                toast.error("Main Image URL is required!");
                setLoading(false);
                return;
            }

            // 🔥 Smart Payload Handling
            const payload = {
                ...formData,
                price: parseFloat(formData.price) || 0,
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                salePrice: formData.isSale && formData.salePrice ? parseFloat(formData.salePrice) : null,
                stock: parseInt(formData.stock) || 0,

                // Switch between Base64 arrays or comma-separated URLs automatically
                image: uploadMethod === 'upload' ? previewImage : formData.image,
                images: uploadMethod === 'upload' ? galleryPreviews : (formData.images ? formData.images.split(',').map(s => s.trim()) : []),

                sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim().toUpperCase()) : [],
                colors: formData.colors ? formData.colors.split(',').map(s => s.trim()) : [],
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Product created successfully!');
                router.push('/admin/products');
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to create product');
            }
        } catch (error) {
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Head><title>Add New Product | Admin</title></Head>

            {/* Top Navbar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-600" /></Link>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Create Product</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/products"><button className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Discard</button></Link>
                    <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black shadow-lg shadow-slate-200 transition-all disabled:opacity-50">
                        {loading ? 'Saving...' : <><Save size={18} /> Save Product</>}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Details */}
                    <div className="lg:col-span-2 space-y-8">

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-black text-slate-900 mb-6">General Information</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Product Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Nike Air Max 270" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Describe the product..." className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 🔥 PREMIUM MEDIA UPLOAD SECTION */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Product Media</h2>

                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('upload')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMethod === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('url')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMethod === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Paste URL
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {uploadMethod === 'upload' ? (
                                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">

                                        {/* 1. Main Cover Image */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Main Cover Image <span className="text-red-500">*</span></label>
                                            {!previewImage ? (
                                                <div
                                                    className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files && processMainFile(e.target.files[0])} className="hidden" />
                                                    <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                                        <UploadCloud size={28} className="text-blue-500" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">Click or drag main image here</p>
                                                </div>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50 flex items-center justify-center h-64">
                                                    <img src={previewImage} alt="Main Preview" className="h-full w-auto object-contain" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button type="button" onClick={removeMainImage} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg"><X size={20} strokeWidth={3} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. Multiple Gallery Images */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Gallery Images (Optional)</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                                {/* Render already selected images */}
                                                {galleryPreviews.map((src, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
                                                        <img src={src} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                            <button type="button" onClick={() => removeGalleryImage(idx)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg">
                                                                <X size={16} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add More Button */}
                                                <div
                                                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all text-slate-400 hover:text-blue-500"
                                                    onClick={() => galleryInputRef.current?.click()}
                                                >
                                                    {/* Notice "multiple" attribute is added here */}
                                                    <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={(e) => e.target.files && processGalleryFiles(e.target.files)} className="hidden" />
                                                    <Plus size={28} />
                                                    <span className="text-[10px] font-bold uppercase mt-2">Add More</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Main Image URL <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Link2 size={18} className="text-slate-400" /></div>
                                                <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/main.jpg" className="w-full bg-slate-50 border border-slate-200 pl-10 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Gallery URLs (Comma separated)</label>
                                            <textarea name="images" value={formData.images} onChange={handleChange} rows={3} placeholder="url1, url2, url3..." className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 outline-none"></textarea>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Variants */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Layers size={20} className="text-purple-500" /> Variants</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Sizes (Comma separated)</label>
                                    <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="e.g. 8, 9, 10, 11" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Colors (Comma separated)</label>
                                    <input type="text" name="colors" value={formData.colors} onChange={handleChange} placeholder="e.g. Red, Black, White" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Settings & Pricing */}
                    <div className="space-y-8">
                        {/* Pricing */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5">Pricing</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Original Price ($) <span className="text-red-500">*</span></label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-black text-lg focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all" />
                                </div>
                                {formData.isSale && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">Sale Price ($) <span className="text-red-500">*</span></label>
                                        <input type="number" step="0.01" name="salePrice" value={formData.salePrice} onChange={handleChange} required className="w-full bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl font-black text-lg text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Discounted Price" />
                                    </motion.div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Compare at Price ($)</label>
                                    <input type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Higher marked price" />
                                </div>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5 flex items-center gap-2"><Hash size={18} className="text-emerald-500" /> Inventory</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5 flex items-center gap-2"><Tag size={18} className="text-orange-500" /> Organization</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer">
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
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-md font-black text-slate-900 mb-5">Product Status</h2>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <span className="font-bold text-slate-700">Active Status</span>
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                                    <span className="font-bold text-purple-700">Featured Product</span>
                                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-sky-50 rounded-xl hover:bg-sky-100 transition-colors">
                                    <span className="font-bold text-sky-700">Mark as New</span>
                                    <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500" />
                                </label>
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