'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Save, ArrowLeft, Image as ImageIcon, Tag, Hash, Layers, UploadCloud, X, Link2, Plus, Copy } from 'lucide-react';
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

    // Gallery Images State (Multiple Images)
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Dynamic Categories from DB & Multi-Select
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/admin/categories')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setCategories(data);
                    setSelectedCategoryIds(prev => {
                        if (prev.length === 0) {
                            setFormData(f => ({
                                ...f,
                                category: data[0].name,
                                categoryId: data[0].id
                            }));
                            return [data[0].id];
                        }
                        return prev;
                    });
                }
            })
            .catch(console.error);
    }, []);

    const toggleCategory = (catId: string) => {
        setSelectedCategoryIds(prev => {
            const exists = prev.includes(catId);
            const updated = exists ? prev.filter(id => id !== catId) : [...prev, catId];
            const matchedCats = categories.filter(c => updated.includes(c.id));
            const categoryNames = matchedCats.map(c => c.name).join(', ');
            setFormData(f => ({
                ...f,
                category: categoryNames,
                categoryId: updated[0] || ''
            }));
            return updated;
        });
    };

    // Advanced Form State
    const [formData, setFormData] = useState({
        name: '', slug: '', description: '',
        price: '', compareAtPrice: '', salePrice: '', stock: '', sku: '',
        category: 'sneakers', categoryId: '', brand: '',
        image: '', images: '',
        sizes: '', colors: '',
        isActive: true, isFeatured: false, isNew: true, isSale: false
    });

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;

        if (name === 'category') {
            const selected = categories.find(c => c.id === value || c.name.toLowerCase() === value.toLowerCase());
            setFormData(prev => ({
                ...prev,
                category: selected ? selected.name.toLowerCase() : value,
                categoryId: selected ? selected.id : value
            }));
            return;
        }

        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });

        if (name === 'name') {
            setFormData(prev => ({ ...prev, name: value, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
        }
    };

    // ==========================================
    // 📸 MAIN IMAGE LOGIC (Upload & Drag-Drop)
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
    // 🚀 THE MAGIC: CLIPBOARD PASTE LOGIC (Ctrl+V)
    // ==========================================
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            // Only process paste if user is in 'upload' mode and NOT typing in a text input/textarea
            if (uploadMethod !== 'upload') return;
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (e.clipboardData && e.clipboardData.items) {
                const items = e.clipboardData.items;
                const imageFiles: File[] = [];

                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) imageFiles.push(file);
                    }
                }

                if (imageFiles.length > 0) {
                    e.preventDefault(); // Stop default browser paste behavior

                    if (!previewImage) {
                        // If main image is empty, set the first pasted image as Main Image
                        processMainFile(imageFiles[0]);

                        // If they pasted multiple images at once, put the rest in the gallery
                        if (imageFiles.length > 1) {
                            processGalleryFiles(imageFiles.slice(1));
                        }
                        toast.success("Image pasted to Main Cover!");
                    } else {
                        // If main image exists, send all pasted images directly to Gallery
                        processGalleryFiles(imageFiles);
                        toast.success("Image(s) pasted to Gallery!");
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [uploadMethod, previewImage]); // Re-bind when these states change


    // ==========================================
    // 💾 SUBMIT LOGIC
    // ==========================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
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

            let finalImage = formData.image.trim().replace(/,$/, '');
            if (uploadMethod === 'upload' && previewImage) {
                if (previewImage.startsWith('data:')) {
                    const t = toast.loading('Uploading cover image to Supabase Storage...');
                    const upRes = await fetch('/api/admin/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            image: previewImage,
                            filename: `${formData.slug || 'product'}-main.jpg`,
                            folder: 'products',
                        }),
                    });
                    toast.dismiss(t);
                    if (!upRes.ok) throw new Error('Failed to upload cover image to Supabase');
                    const upData = await upRes.json();
                    finalImage = upData.url;
                } else {
                    finalImage = previewImage;
                }
            }

            let finalGallery: string[] = [];
            if (uploadMethod === 'upload' && galleryPreviews.length > 0) {
                const gt = toast.loading(`Uploading ${galleryPreviews.length} gallery images to Supabase...`);
                for (let i = 0; i < galleryPreviews.length; i++) {
                    const img = galleryPreviews[i];
                    if (img.startsWith('data:')) {
                        const upRes = await fetch('/api/admin/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                image: img,
                                filename: `${formData.slug || 'product'}-gallery-${i + 1}.jpg`,
                                folder: 'products',
                            }),
                        });
                        if (upRes.ok) {
                            const upData = await upRes.json();
                            finalGallery.push(upData.url);
                        }
                    } else {
                        finalGallery.push(img);
                    }
                }
                toast.dismiss(gt);
            } else if (formData.images) {
                finalGallery = formData.images.split(',').map((s: string) => s.trim()).filter(Boolean);
            }

            const matchedCats = categories.filter(c => selectedCategoryIds.includes(c.id));
            const categoryNames = matchedCats.map(c => c.name).join(', ');

            const payload = {
                ...formData,
                category: categoryNames || formData.category || 'sneakers',
                categoryId: selectedCategoryIds[0] || null,
                categoryIds: selectedCategoryIds,
                price: parseFloat(formData.price) || 0,
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
                salePrice: formData.isSale && formData.salePrice ? parseFloat(formData.salePrice) : null,
                stock: parseInt(formData.stock) || 0,
                image: finalImage,
                images: finalGallery,
                sizes: formData.sizes ? formData.sizes.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean) : [],
                colors: formData.colors ? formData.colors.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] pb-20 text-slate-900 dark:text-white">
            <Head><title>Add New Product | Admin</title></Head>

            {/* Top Navbar */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" /></Link>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create Product</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/products"><button className="px-5 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Discard</button></Link>
                    <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black dark:hover:bg-blue-700 shadow-lg shadow-slate-200 dark:shadow-none transition-all disabled:opacity-50">
                        {loading ? 'Saving...' : <><Save size={18} /> Save Product</>}
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Main Details */}
                    <div className="lg:col-span-2 space-y-8">

                        <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6">General Information</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Product Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Nike Air Max 270" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Describe the product..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 🔥 PREMIUM MEDIA UPLOAD SECTION */}
                        <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"><ImageIcon size={20} className="text-blue-500" /> Product Media</h2>

                                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('upload')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMethod === 'upload' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                    >
                                        Upload / Paste
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('url')}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMethod === 'url' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
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
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Main Cover Image <span className="text-red-500">*</span></label>
                                                <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded flex items-center gap-1"><Copy size={12} /> Ctrl+V anywhere to paste</span>
                                            </div>

                                            {!previewImage ? (
                                                <div
                                                    className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/60'}`}
                                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files && processMainFile(e.target.files[0])} className="hidden" />
                                                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4">
                                                        <UploadCloud size={28} className="text-blue-500" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click, drag, or <span className="text-blue-600 dark:text-blue-400">paste (Ctrl+V)</span> image here</p>
                                                </div>
                                            ) : (
                                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-900 flex items-center justify-center h-64">
                                                    <img src={previewImage} alt="Main Preview" className="h-full w-auto object-contain" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <button type="button" onClick={removeMainImage} className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg"><X size={20} strokeWidth={3} /></button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. Multiple Gallery Images */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Gallery Images (Optional)</label>
                                                {previewImage && <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Ctrl+V will paste here now</span>}
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                                {/* Render already selected images */}
                                                {galleryPreviews.map((src, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-50 dark:bg-slate-900">
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
                                                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-400 transition-all text-slate-400 dark:text-slate-500 hover:text-blue-500"
                                                    onClick={() => galleryInputRef.current?.click()}
                                                >
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
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Main Image URL <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Link2 size={18} className="text-slate-400 dark:text-slate-500" /></div>
                                                <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/main.jpg" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-10 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Gallery URLs (Comma separated)</label>
                                            <textarea name="images" value={formData.images} onChange={handleChange} rows={3} placeholder="url1, url2, url3..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 outline-none"></textarea>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Variants */}
                        <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Layers size={20} className="text-purple-500" /> Variants</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Sizes (Comma separated)</label>
                                    <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="e.g. 8, 9, 10, 11" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Colors (Comma separated)</label>
                                    <input type="text" name="colors" value={formData.colors} onChange={handleChange} placeholder="e.g. Red, Black, White" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Settings & Pricing */}
                    <div className="space-y-8">
                        {/* Pricing */}
                        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-md font-black text-slate-900 dark:text-white mb-5">Pricing</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Original Price (₹) <span className="text-red-500">*</span></label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3.5 rounded-xl font-black text-lg focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all" />
                                </div>
                                {formData.isSale && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Sale Price (₹) <span className="text-red-500">*</span></label>
                                        <input type="number" step="0.01" name="salePrice" value={formData.salePrice} onChange={handleChange} required className="w-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl font-black text-lg text-emerald-700 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Discounted Price" />
                                    </motion.div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Compare at Price (₹)</label>
                                    <input type="number" step="0.01" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 p-3.5 rounded-xl font-medium text-slate-400 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Higher marked price" />
                                </div>
                            </div>
                        </div>

                        {/* Inventory */}
                        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-md font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Hash size={18} className="text-emerald-500" /> Inventory</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">SKU</label>
                                    <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3.5 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3.5 rounded-xl font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-md font-black text-slate-900 dark:text-white mb-5 flex items-center justify-between">
                                <span className="flex items-center gap-2"><Tag size={18} className="text-orange-500" /> Categories & Brand</span>
                                {selectedCategoryIds.length > 0 && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold px-2.5 py-0.5 rounded-full">
                                        {selectedCategoryIds.length} Selected
                                    </span>
                                )}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            Select Categories (Multiple)
                                        </label>
                                        <Link href="/admin/categories" target="_blank" className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                            + Manage
                                        </Link>
                                    </div>
                                    
                                    {/* Category Chips Multi-Select */}
                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto">
                                        {categories.length === 0 ? (
                                            <p className="text-xs text-slate-400 py-2">Loading categories...</p>
                                        ) : (
                                            categories.map((cat) => {
                                                const isSelected = selectedCategoryIds.includes(cat.id);
                                                return (
                                                    <button
                                                        type="button"
                                                        key={cat.id}
                                                        onClick={() => toggleCategory(cat.id)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                                                            isSelected
                                                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        <span>{cat.name}</span>
                                                        {cat.parent && (
                                                            <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                                                ({cat.parent.name})
                                                            </span>
                                                        )}
                                                        {isSelected ? (
                                                            <span className="text-white text-xs font-black">✓</span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">+</span>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                                        Click multiple categories to associate this product with all of them.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Brand</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-3.5 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Status Toggles */}
                        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <h2 className="text-md font-black text-slate-900 dark:text-white mb-5">Product Status</h2>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Active Status</span>
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                                    <span className="font-bold text-purple-700 dark:text-purple-300">Featured Product</span>
                                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-sky-50 dark:bg-sky-950/30 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors">
                                    <span className="font-bold text-sky-700 dark:text-sky-300">Mark as New</span>
                                    <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-sm">
                                    <span className="font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest text-xs">Put on Sale</span>
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