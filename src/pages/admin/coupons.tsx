import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Copy, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

interface Coupon { id: string; code: string; description: string | null; discountType: string; discountValue: number; usageCount: number; usageLimit: number | null; isActive: boolean; expiresAt: string | null; }
const empty = { code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', usageLimit: '', expiresAt: '' };

const inputCls = `w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all
  bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 
  focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:bg-white`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-4 rounded-md animate-pulse w-4/5 bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);
  const [editId, setEditId] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/admin/coupons').then(r => r.json()).then(d => { setCoupons(Array.isArray(d) ? d : []); setLoading(false); });
  };
  useEffect(load, []);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const openAdd = () => { setForm(empty); setModal('add'); };
  const openEdit = (c: Coupon) => {
    setForm({ code: c.code, description: c.description || '', discountType: c.discountType, discountValue: String(c.discountValue), usageLimit: c.usageLimit ? String(c.usageLimit) : '', expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '' });
    setEditId(c.id); setModal('edit');
  };

  const save = async () => {
    if (!form.code) { toast.error('Coupon code is required'); return; }
    setSaving(true);
    const payload = { ...form, discountValue: parseFloat(form.discountValue) || 0, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null, expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null, ...(modal === 'edit' && { id: editId }) };
    const r = await fetch('/api/admin/coupons', { method: modal === 'add' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) { toast.success(modal === 'add' ? 'Coupon created ✓' : 'Coupon updated ✓'); setModal(null); load(); }
    else toast.error('Failed to save coupon');
  };

  const del = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const t = toast.loading('Deleting…');
    const r = await fetch('/api/admin/coupons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.dismiss(t);
    if (r.ok) { toast.success('Coupon deleted'); load(); }
    else toast.error('Failed to delete');
  };

  return (
    <>
      <Head><title>Coupons Management | Admin</title></Head>
      <AdminLayout>
        <div className="min-h-screen p-6 sm:p-10">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* Premium Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Discounts</p>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Coupons</h1>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={openAdd}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                <Plus size={18} strokeWidth={2.5} /> Add Coupon
              </motion.button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Code', 'Type', 'Value', 'Used / Limit', 'Expires', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading
                      ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                      : coupons.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                              <Tag size={28} className="text-slate-400" />
                            </div>
                            <p className="text-slate-500 text-base font-medium">No coupons found.</p>
                          </td>
                        </tr>
                      )
                        : coupons.map(c => (
                          <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-black text-sm tracking-wider text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{c.code}</span>
                                <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success(`Copied "${c.code}"`); }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                                  <Copy size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-xs font-bold text-slate-500">{c.discountType.replace('_', ' ')}</td>
                            <td className="px-6 py-5 font-black text-slate-900 text-[15px]">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{c.usageCount} <span className="text-slate-300 mx-1">/</span> {c.usageLimit ?? '∞'}</td>
                            <td className="px-6 py-5 text-sm font-medium text-slate-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                {c.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEdit(c)}
                                  className="p-2 rounded-lg transition-colors bg-slate-50 hover:bg-blue-100 text-slate-400 hover:text-blue-600">
                                  <Pencil size={14} />
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => del(c.id, c.code)}
                                  className="p-2 rounded-lg transition-colors bg-slate-50 hover:bg-red-100 text-slate-400 hover:text-red-600">
                                  <Trash2 size={14} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{modal === 'add' ? 'Add Coupon' : 'Edit Coupon'}</h2>
                <button onClick={() => setModal(null)} className="p-2 rounded-full transition-colors bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-5">
                <Field label="Code">
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className={`${inputCls} font-mono font-black tracking-widest text-blue-600`} placeholder="e.g. SUMMER20" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Discount Type">
                    <select value={form.discountType} onChange={set('discountType')} className={`${inputCls} cursor-pointer`}>
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed ($)</option>
                      <option value="FREE_SHIPPING">Free Shipping</option>
                    </select>
                  </Field>
                  <Field label="Value">
                    <input type="number" value={form.discountValue} onChange={set('discountValue')} className={inputCls} placeholder="e.g. 20" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Usage Limit">
                    <input type="number" value={form.usageLimit} onChange={set('usageLimit')} className={inputCls} placeholder="Unlimited" />
                  </Field>
                  <Field label="Expires At">
                    <input type="date" value={form.expiresAt} onChange={set('expiresAt')} className={`${inputCls} cursor-pointer`} />
                  </Field>
                </div>

                <Field label="Description (Optional)">
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Internal note..." />
                </Field>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={save}
                disabled={saving}
                className="w-full mt-8 py-3.5 rounded-xl font-black tracking-wide text-[15px] disabled:opacity-50 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
              >
                {saving ? 'Saving...' : modal === 'add' ? 'Create Coupon' : 'Save Changes'}
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