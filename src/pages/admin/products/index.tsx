import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 Added 'Tag' icon for the Sale stats card
import { Plus, Search, Edit3, Trash2, Box, AlertCircle, TrendingUp, Filter, RefreshCw, Package, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
// 👈 1. Import Global Currency Hook
import { useGlobalCurrency } from '@/context/CurrencyContext';

const stagger = { animate: { transition: { staggerChildren: 0.04 } } };
const rowAnim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

function SkeletonRow() {
    return (
        <tr className="border-b border-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
                <td key={i} className="px-6 py-5">
                    <div className={`h-4 rounded-md animate-pulse bg-slate-200 ${i === 0 ? 'w-full max-w-[200px] h-12' : 'w-full'}`} />
                </td>
            ))}
        </tr>
    );
}

export default function AdminProductsList() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 👈 2. Initialize Hook
    const { convertPrice, loading: currencyLoading } = useGlobalCurrency();

    const load = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
            if (isRefresh) toast.success('Products updated');
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        const t = toast.loading('Deleting...');
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Product deleted successfully', { id: t });
                setProducts(products.filter(p => p.id !== id));
            } else {
                toast.error('Failed to delete product', { id: t });
            }
        } catch (error) {
            toast.error('Something went wrong', { id: t });
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [products, searchTerm]);

    return (
        <AdminLayout>
            <div className="min-h-screen p-6 sm:p-10">
                <Head><title>Manage Products | Admin</title></Head>

                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Premium Header Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Inventory</p>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Products</h1>
                        </div>
                        <Link href="/admin/products/new">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                            >
                                <Plus size={18} strokeWidth={2.5} /> Add New Product
                            </motion.button>
                        </Link>
                    </div>

                    {/* Premium Stats Section - 🔥 Changed grid-cols-3 to grid-cols-4 for Sale card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-blue-50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center relative z-10"><Box size={24} /></div>
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
                                <p className="text-3xl font-black text-slate-900">{products.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-red-50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center relative z-10"><AlertCircle size={24} /></div>
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
                                <p className="text-3xl font-black text-slate-900">{products.filter(p => p.stock < 5).length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-emerald-50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center relative z-10"><TrendingUp size={24} /></div>
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Featured</p>
                                <p className="text-3xl font-black text-slate-900">{products.filter(p => p.isFeatured).length}</p>
                            </div>
                        </div>
                        {/* 🔥 NEW SALE STATS CARD */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-orange-50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="w-14 h-14 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl flex items-center justify-center relative z-10"><Tag size={24} /></div>
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">On Sale</p>
                                <p className="text-3xl font-black text-slate-900">{products.filter(p => p.isSale).length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

                        {/* Toolbar */}
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, SKU or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                                    <Filter size={18} /> Filters
                                </button>
                                <button onClick={() => load(true)} disabled={refreshing || loading} className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm">
                                    <RefreshCw size={20} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {['Product', 'SKU / Category', 'Price', 'Inventory', 'Status', 'Actions'].map((h, i) => (
                                            <th key={h} className={`px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 ${i === 5 ? 'text-right pr-8' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <motion.tbody variants={stagger} initial="initial" animate="animate" className="divide-y divide-slate-100">
                                    {loading ? (
                                        Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                    ) : filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                                    <Package size={28} className="text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 text-base font-medium">No products found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <motion.tr variants={rowAnim} key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="px-6 py-5 flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                                                        <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-[15px]">{product.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{product.brand || 'No Brand'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-mono text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 inline-block px-2 py-1 rounded mb-1.5">{product.sku || 'N/A'}</p>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{product.category}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {/* 🔥 Sale Price Logic Integration */}
                                                    {product.isSale ? (
                                                        <>
                                                            <p className="font-black text-emerald-600 text-[15px]">
                                                                {currencyLoading ? '...' : convertPrice(product.salePrice)}
                                                            </p>
                                                            <p className="text-xs font-bold text-slate-400 line-through">
                                                                {currencyLoading ? '...' : convertPrice(product.price)}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="font-black text-slate-900 text-[15px]">
                                                                {currencyLoading ? '...' : convertPrice(product.price)}
                                                            </p>
                                                            {product.compareAtPrice && (
                                                                <p className="text-xs font-bold text-slate-400 line-through">
                                                                    {currencyLoading ? '...' : convertPrice(product.compareAtPrice)}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${product.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : product.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}></div>
                                                        {product.stock} in stock
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {/* 🔥 Status Sale Badge */}
                                                        {product.isSale && <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Sale</span>}
                                                        {product.isActive ? <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Active</span> : <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Draft</span>}
                                                        {product.isFeatured && <span className="bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Featured</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 pr-8 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/products/edit/${product.id}`}>
                                                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                                                        </Link>
                                                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-slate-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </motion.tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

// Security Check: Only allow admins to access this page
export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    if (!session || session.user?.role !== 'admin') return { redirect: { destination: '/auth/signin', permanent: false } };
    return { props: {} };
};