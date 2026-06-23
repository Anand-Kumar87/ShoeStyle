import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Save, Store, Globe, DollarSign, Percent, Truck, Building2, Plus, Trash2, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminSettings() {
    // ---------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ---------------------------------------------------------
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Store Settings State
    const [form, setForm] = useState({
        storeName: '', contactEmail: '', defaultCurrency: 'USD', taxRate: '', freeShippingAmount: ''
    });

    // Bank Settings State
    const [banks, setBanks] = useState<any[]>([]);
    const [bankLoading, setBankLoading] = useState(false);
    const [bankForm, setBankForm] = useState({
        bankName: '', accountName: '', accountNumber: '', ifscCode: ''
    });

    const currencies = [
        { code: 'USD', label: 'US Dollar ($)', icon: '🇺🇸' },
        { code: 'INR', label: 'Indian Rupee (₹)', icon: '🇮🇳' },
        { code: 'EUR', label: 'Euro (€)', icon: '🇪🇺' },
        { code: 'GBP', label: 'British Pound (£)', icon: '🇬🇧' },
        { code: 'CAD', label: 'Canadian Dollar (C$)', icon: '🇨🇦' },
        { code: 'AUD', label: 'Australian Dollar (A$)', icon: '🇦🇺' },
    ];

    // ---------------------------------------------------------
    // 2. DATA FETCHING
    // ---------------------------------------------------------
    const fetchBanks = async () => {
        try {
            const res = await fetch('/api/settings/bank');
            if (res.ok) setBanks(await res.json());
        } catch (error) {
            console.error("Failed to load banks");
        }
    };

    useEffect(() => {
        // Fetch Store Settings
        fetch('/api/admin/settings').then(r => r.json()).then(data => {
            if (data) {
                setForm({
                    storeName: data.storeName,
                    contactEmail: data.contactEmail,
                    defaultCurrency: data.defaultCurrency,
                    taxRate: data.taxRate.toString(),
                    freeShippingAmount: data.freeShippingAmount.toString()
                });
            }
            setLoading(false);
        });

        // Fetch Bank Details
        fetchBanks();
    }, []);

    // ---------------------------------------------------------
    // 3. EVENT HANDLERS
    // ---------------------------------------------------------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        const t = toast.loading('Saving store settings...');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                toast.success('Settings updated successfully!', { id: t });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error('Failed to save settings', { id: t });
            }
        } catch (error) {
            toast.error('Something went wrong', { id: t });
        } finally {
            setSaving(false);
        }
    };

    // Bank Account Handlers
    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        setBankLoading(true);
        const t = toast.loading('Adding Bank Account...');
        try {
            const res = await fetch('/api/settings/bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankForm)
            });
            if (!res.ok) throw new Error('Failed to add bank');
            toast.success('Bank added successfully!', { id: t });
            setBankForm({ bankName: '', accountName: '', accountNumber: '', ifscCode: '' });
            fetchBanks();
        } catch (error) {
            toast.error('Could not add bank', { id: t });
        } finally {
            setBankLoading(false);
        }
    };

    const handleDeleteBank = async (id: string) => {
        if (!confirm('Are you sure you want to remove this bank account?')) return;
        const t = toast.loading('Removing account...');
        try {
            const res = await fetch('/api/settings/bank', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                toast.success('Bank removed', { id: t });
                fetchBanks();
            } else throw new Error();
        } catch (e) {
            toast.error('Error removing bank', { id: t });
        }
    };

    const inputCls = "w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all";
    const bankInputCls = "w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all";

    return (
        <AdminLayout>
            <div className="min-h-screen p-6 sm:p-10">
                <Head><title>Settings | Admin</title></Head>

                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Configuration</p>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Store Settings</h1>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSaveSettings}
                            disabled={loading || saving}
                            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black tracking-wide transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 disabled:opacity-50"
                        >
                            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
                        </motion.button>
                    </div>

                    {loading ? (
                        <div className="animate-pulse bg-white h-96 rounded-3xl border border-slate-100 p-8"></div>
                    ) : (
                        <div className="space-y-6">

                            {/* GLOBAL CURRENCY SECTION */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Globe size={20} /></div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">Global Currency</h2>
                                        <p className="text-xs font-bold text-slate-400">All product prices will automatically convert to this currency on the frontend.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500">Active Store Currency</label>
                                        <div className="relative">
                                            <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                            <select
                                                name="defaultCurrency"
                                                value={form.defaultCurrency}
                                                onChange={handleChange}
                                                className={`${inputCls} appearance-none cursor-pointer pl-11`}
                                            >
                                                {currencies.map(c => (
                                                    <option key={c.code} value={c.code}>{c.icon} {c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-sm font-medium text-blue-800">
                                            <strong>Live Exchange Rates:</strong> When you change the currency, we use live market rates to convert your base USD prices dynamically for your customers.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* STORE DETAILS */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"><Store size={20} /></div>
                                    <h2 className="text-lg font-black text-slate-900">General Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500">Store Name</label>
                                        <div className="relative">
                                            <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" name="storeName" value={form.storeName} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500">Contact Email</label>
                                        <div className="relative">
                                            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TAXES & SHIPPING */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Percent size={20} /></div>
                                    <h2 className="text-lg font-black text-slate-900">Taxes & Shipping</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500">Default Tax Rate (%)</label>
                                        <div className="relative">
                                            <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="number" step="0.1" name="taxRate" value={form.taxRate} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500">Free Shipping Threshold</label>
                                        <div className="relative">
                                            <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="number" step="0.1" name="freeShippingAmount" value={form.freeShippingAmount} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 NEW: BANK MANAGEMENT SYSTEM */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4">

                                {/* Add Bank Form */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-8">
                                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Building2 size={20} /></div>
                                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Add New Bank</h2>
                                        </div>

                                        <form onSubmit={handleAddBank} className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bank Name</label>
                                                <input type="text" required value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="e.g. HDFC Bank" className={bankInputCls} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Name</label>
                                                <input type="text" required value={bankForm.accountName} onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })} placeholder="e.g. ShoeStyle Enterprise" className={bankInputCls} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account Number</label>
                                                <input type="text" required value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="e.g. 50100XXXXXXX" className={`${bankInputCls} font-mono tracking-wider`} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">IFSC / Swift Code</label>
                                                <input type="text" required value={bankForm.ifscCode} onChange={e => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })} placeholder="e.g. HDFC0001234" className={`${bankInputCls} font-mono tracking-wider uppercase`} />
                                            </div>
                                            <button disabled={bankLoading} type="submit" className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black hover:-translate-y-0.5 transition-all shadow-lg flex items-center justify-center gap-2">
                                                <Plus size={18} /> {bankLoading ? 'Adding...' : 'Add Account'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Active Banks List */}
                                <div className="lg:col-span-3 space-y-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 pl-2">Active Accounts ({banks.length})</h2>

                                    {banks.length === 0 ? (
                                        <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center shadow-sm">
                                            <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
                                            <p className="text-slate-500 font-bold">No bank accounts added yet.</p>
                                        </div>
                                    ) : (
                                        banks.map((bank) => (
                                            <div key={bank.id} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center group hover:border-emerald-200 transition-all">
                                                <div className="space-y-4 flex-1 w-full">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-emerald-600">
                                                            <ShieldCheck size={18} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Active Check-out</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Bank Name</p>
                                                            <p className="font-black text-slate-900">{bank.bankName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Account Name</p>
                                                            <p className="font-black text-slate-900">{bank.accountName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Account Number</p>
                                                            <p className="font-black text-slate-700 font-mono tracking-wider">{bank.accountNumber}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">IFSC Code</p>
                                                            <p className="font-black text-slate-700 font-mono tracking-wider">{bank.ifscCode}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteBank(bank.id)} className="w-full sm:w-auto p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}