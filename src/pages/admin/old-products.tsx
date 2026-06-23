import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Plus, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface Product { id: string; name: string; sku: string; price: number; stock: number; category: string; image: string; }
const empty = { name: '', price: '', stock: '', category: '', description: '', image: '', sku: '' };

const inputCls = `w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors
  bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400
  dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-white/20 dark:focus:border-blue-500`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 rounded animate-pulse bg-slate-100 dark:bg-white/5" style={{ width: i === 0 ? 40 : '75%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const [editId, setEditId] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/products').then(r => r.json()).then(d => { setProducts(d.data || []); setLoading(false); });
  };
  useEffect(load, []);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd = () => { setForm(empty); setModal('add'); };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock), category: p.category, description: '', image: p.image, sku: p.sku });
    setEditId(p.id); setModal('edit');
  };

  const save = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    const r = await fetch('/api/admin/products', {
      method: modal === 'add' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modal === 'edit' ? { ...form, id: editId } : form),
    });
    setSaving(false);
    if (r.ok) { toast.success(modal === 'add' ? 'Product created ✓' : 'Product updated ✓'); setModal(null); load(); }
    else toast.error('Failed to save product');
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const t = toast.loading('Deleting...');
    const r = await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.dismiss(t);
    if (r.ok) { toast.success('Product deleted'); load(); }
    else toast.error('Failed to delete');
  };

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Products | Admin</title></Head>
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1 text-slate-400 dark:text-slate-500">Inventory</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Products</h1>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
              <Plus size={16} /> Add Product
            </motion.button>
          </div>

          <div className="relative mb-6 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU…"
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors
                bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400 shadow-sm
                dark:bg-[#111c35] dark:border-slate-700/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500" />
          </div>

          <div className="rounded-2xl overflow-hidden border shadow-sm bg-white border-slate-200 dark:bg-[#111c35] dark:border-slate-700/50 dark:shadow-none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50">
                  {['Image', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map(p => (
                    <motion.tr key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="group hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3">
                        <img src={p.image || '/placeholder.png'} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100 dark:bg-white/5" />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-[160px] truncate">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 dark:text-slate-500">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full capitalize bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-400">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'}`}>
                          {p.stock > 0 ? p.stock : 'Out'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEdit(p)}
                            className="p-2 rounded-lg transition-colors hover:bg-blue-50 text-slate-400 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400">
                            <Pencil size={14} />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => del(p.id, p.name)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400">
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                }
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <p className="text-center py-16 text-sm text-slate-400 dark:text-slate-500">No products found</p>
            )}
          </div>
        </div>
      </AdminLayout>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md p-6 rounded-2xl shadow-2xl
                bg-white border border-slate-200
                dark:bg-[#0d1526] dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
                <button onClick={() => setModal(null)} className="p-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-400 dark:hover:bg-white/10 dark:text-slate-400 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name"><input value={form.name} onChange={set('name')} className={inputCls} placeholder="Air Max 90" /></Field>
                  <Field label="SKU"><input value={form.sku} onChange={set('sku')} className={inputCls} placeholder="SKU-001" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Price ($)"><input type="number" value={form.price} onChange={set('price')} className={inputCls} placeholder="99.99" /></Field>
                  <Field label="Stock"><input type="number" value={form.stock} onChange={set('stock')} className={inputCls} placeholder="50" /></Field>
                </div>
                <Field label="Category"><input value={form.category} onChange={set('category')} className={inputCls} placeholder="Running" /></Field>
                <Field label="Image URL"><input value={form.image} onChange={set('image')} className={inputCls} placeholder="https://..." /></Field>
                <Field label="Description">
                  <textarea rows={3} value={form.description} onChange={set('description')} className={inputCls + ' resize-none'} placeholder="Product description…" />
                </Field>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={save} disabled={saving}
                className="w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
                {saving ? 'Saving…' : modal === 'add' ? 'Create Product' : 'Save Changes'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || session.user?.role !== 'admin') return { redirect: { destination: '/auth/signin', permanent: false } };
  return { props: {} };
};
