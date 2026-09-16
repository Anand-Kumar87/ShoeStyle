import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
    Save,
    Store,
    Globe,
    Percent,
    Truck,
    Building2,
    Plus,
    Trash2,
    CreditCard,
    ShieldCheck,
    Package,
    Zap,
    Rocket,
    Mail,
    Lock,
    MapPin,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminSettings() {
    // ---------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ---------------------------------------------------------
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Store Settings State (Default to INR now)
    const [form, setForm] = useState({
        storeName: '', contactEmail: '', defaultCurrency: 'INR', taxRate: '', freeShippingAmount: '',
        standardShippingRate: '99', expressShippingRate: '199', overnightShippingRate: '299'
    });

    // Shiprocket Logistics State
    const [shiprocketForm, setShiprocketForm] = useState({
        enabled: false,
        email: '',
        password: '',
        hasPassword: false,
        pickupPincode: '110001',
    });

    // Bank Settings State
    const [banks, setBanks] = useState<any[]>([]);
    const [bankLoading, setBankLoading] = useState(false);
    const [bankForm, setBankForm] = useState({
        bankName: '', accountName: '', accountNumber: '', ifscCode: ''
    });
    const [confirmAccNumber, setConfirmAccNumber] = useState('');
    const [ifscVerification, setIfscVerification] = useState<{
        loading: boolean;
        verified: boolean;
        bankName?: string;
        branch?: string;
        error?: string;
    }>({ loading: false, verified: false });

    // Live IFSC verification lookup
    const handleVerifyIfsc = async (code: string) => {
        const clean = code.trim().toUpperCase();
        if (clean.length !== 11) {
            setIfscVerification({ loading: false, verified: false });
            return;
        }
        setIfscVerification({ loading: true, verified: false });
        try {
            const res = await fetch(`/api/settings/verify-ifsc?ifsc=${clean}`);
            const data = await res.json();
            if (res.ok && data.valid) {
                setIfscVerification({
                    loading: false,
                    verified: true,
                    bankName: data.bank,
                    branch: data.branch,
                });
                setBankForm(prev => ({
                    ...prev,
                    bankName: `${data.bank} (${data.branch})`,
                    ifscCode: clean,
                }));
            } else {
                setIfscVerification({
                    loading: false,
                    verified: false,
                    error: data.message || 'Invalid IFSC code. Bank branch does not exist.',
                });
            }
        } catch {
            setIfscVerification({ loading: false, verified: false, error: 'Verification failed' });
        }
    };

    const currencies = [
        { code: 'INR', label: 'Indian Rupee (₹)', icon: '🇮🇳' },
        { code: 'USD', label: 'US Dollar ($)', icon: '🇺🇸' },
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
                    defaultCurrency: data.defaultCurrency || 'INR', // fallback to INR
                    taxRate: data.taxRate?.toString() || '0',
                    freeShippingAmount: data.freeShippingAmount?.toString() || '0',
                    standardShippingRate: data.standardShippingRate?.toString() || '99',
                    expressShippingRate: data.expressShippingRate?.toString() || '199',
                    overnightShippingRate: data.overnightShippingRate?.toString() || '299',
                });

                if (data.shiprocket) {
                    setShiprocketForm({
                        enabled: Boolean(data.shiprocket.enabled),
                        email: data.shiprocket.email || '',
                        password: '',
                        hasPassword: Boolean(data.shiprocket.hasPassword),
                        pickupPincode: data.shiprocket.pickupPincode || '110001',
                    });
                }
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
                body: JSON.stringify({
                    ...form,
                    shiprocket: shiprocketForm,
                })
            });
            toast.dismiss(t);
            if (res.ok) {
                toast.success('Settings saved successfully! 🚀', { duration: 3000 });
            } else {
                toast.error('Failed to save settings. Please try again.', { duration: 4000 });
            }
        } catch (error) {
            toast.dismiss(t);
            toast.error('Something went wrong. Please check your connection.', { duration: 4000 });
        } finally {
            setSaving(false);
        }
    };

    // Bank Account Handlers
    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Check account numbers match
        if (confirmAccNumber && bankForm.accountNumber !== confirmAccNumber) {
            toast.error('Account numbers do not match! Please check carefully.');
            return;
        }

        // 2. Validate IFSC length
        if (bankForm.ifscCode.trim().length !== 11) {
            toast.error('IFSC code must be exactly 11 characters (e.g. SBIN0001234)');
            return;
        }

        setBankLoading(true);
        const t = toast.loading('Verifying & Adding Bank Account...');
        try {
            const res = await fetch('/api/settings/bank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankForm)
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || 'Failed to add bank account');
            }
            toast.success(data.message || 'Bank account verified and added!', { id: t });
            setBankForm({ bankName: '', accountName: '', accountNumber: '', ifscCode: '' });
            setConfirmAccNumber('');
            setIfscVerification({ loading: false, verified: false });
            fetchBanks();
        } catch (error: any) {
            toast.error(error.message || 'Could not add bank', { id: t });
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

    const inputCls = "w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";
    const bankInputCls = "w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

    return (
        <AdminLayout>
            <div className="min-h-screen p-6 sm:p-10 bg-slate-50 dark:bg-[#080d1a] transition-colors duration-200">
                <Head><title>Settings | Admin</title></Head>

                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Configuration</p>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Store Settings</h1>
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
                        <div className="animate-pulse bg-white dark:bg-[#0f172a] h-96 rounded-3xl border border-slate-100 dark:border-slate-800 p-8"></div>
                    ) : (
                        <div className="space-y-6">

                            {/* GLOBAL CURRENCY SECTION */}
                            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-950/20 rounded-bl-full -z-10"></div>
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Globe size={20} /></div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 dark:text-white">Global Currency</h2>
                                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">All product prices will automatically convert to this currency on the frontend.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Active Store Currency</label>
                                        <div className="relative">
                                            {/* Replaced DollarSign icon with Rupee Text/Icon */}
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10 font-black text-lg">₹</span>
                                            <select
                                                name="defaultCurrency"
                                                value={form.defaultCurrency}
                                                onChange={handleChange}
                                                className={`${inputCls} appearance-none cursor-pointer pl-11`}
                                            >
                                                {currencies.map(c => (
                                                    <option key={c.code} value={c.code} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">{c.icon} {c.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                            <strong>Live Exchange Rates:</strong> When you change the currency, we use live market rates to convert your base INR prices dynamically for your customers.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* STORE DETAILS */}
                            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center"><Store size={20} /></div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">General Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Store Name</label>
                                        <div className="relative">
                                            <Store size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                            <input type="text" name="storeName" value={form.storeName} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Contact Email</label>
                                        <div className="relative">
                                            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                            <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TAXES & SHIPPING */}
                            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center"><Percent size={20} /></div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Taxes & Shipping</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Default Tax Rate (%)</label>
                                        <div className="relative">
                                            <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                            <input type="number" step="0.1" name="taxRate" value={form.taxRate} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Free Shipping Threshold (₹)</label>
                                        <div className="relative">
                                            <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                            <input type="number" step="1" name="freeShippingAmount" value={form.freeShippingAmount} onChange={handleChange} className={inputCls} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Domestic Delivery Speeds & Rates</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Standard Shipping (₹)</label>
                                            <div className="relative">
                                                <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                                                <input type="number" step="1" name="standardShippingRate" value={form.standardShippingRate} onChange={handleChange} placeholder="99" className={inputCls} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Under threshold fee</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Express Priority (₹)</label>
                                            <div className="relative">
                                                <Zap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                <input type="number" step="1" name="expressShippingRate" value={form.expressShippingRate} onChange={handleChange} placeholder="199" className={inputCls} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">1-2 days priority air</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Overnight Priority (₹)</label>
                                            <div className="relative">
                                                <Rocket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
                                                <input type="number" step="1" name="overnightShippingRate" value={form.overnightShippingRate} onChange={handleChange} placeholder="299" className={inputCls} />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Next business day</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 SHIPROCKET & SHIPROCKET X LOGISTICS INTEGRATION */}
                            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                Shiprocket & Shiprocket X Logistics
                                                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 tracking-wider">
                                                    220+ Countries
                                                </span>
                                            </h2>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                                Domestic serviceability (Blue Dart, Delhivery, DTDC) & cross-border international shipping.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Enable / Disable Toggle */}
                                    <label className="inline-flex items-center gap-2.5 cursor-pointer self-start sm:self-auto bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={shiprocketForm.enabled}
                                            onChange={(e) => setShiprocketForm({ ...shiprocketForm, enabled: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                            {shiprocketForm.enabled ? '🟢 Live API Active' : '⚪ Local Fallback Mode'}
                                        </span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
                                            Shiprocket Account Email
                                        </label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                            <input
                                                type="email"
                                                value={shiprocketForm.email}
                                                onChange={(e) => setShiprocketForm({ ...shiprocketForm, email: e.target.value })}
                                                placeholder="e.g. shipping@shoestyle.com"
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
                                            Shiprocket Password / API Key
                                        </label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                            <input
                                                type="password"
                                                value={shiprocketForm.password}
                                                onChange={(e) => setShiprocketForm({ ...shiprocketForm, password: e.target.value })}
                                                placeholder={shiprocketForm.hasPassword ? '•••••••• (Configured - enter to change)' : 'Enter API password'}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">
                                            Warehouse Pickup PIN Code
                                        </label>
                                        <div className="relative">
                                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                            <input
                                                type="text"
                                                value={shiprocketForm.pickupPincode}
                                                onChange={(e) => setShiprocketForm({ ...shiprocketForm, pickupPincode: e.target.value })}
                                                placeholder="e.g. 110001"
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shoe Box Volumetric Dimensions & Token Caching Feature Banner */}
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                                    <div className="flex items-start gap-3 bg-indigo-50/70 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                        <Package className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                                        <div>
                                            <p className="text-xs font-black text-indigo-900 dark:text-indigo-300">Footwear Box Volumetric Spec</p>
                                            <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400 mt-0.5">
                                                Standard <strong>30 × 20 × 12 cm</strong>, ~1.0 kg/pair preset. Eliminates courier weight discrepancies.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                                        <Zap className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" size={18} />
                                        <div>
                                            <p className="text-xs font-black text-amber-900 dark:text-amber-300">23-Hour JWT Token Caching</p>
                                            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                                                Zero redundant logins. Instant checkout rates without API rate-limit delays.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 sm:col-span-2 lg:col-span-1">
                                        <ShieldCheck className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" size={18} />
                                        <div>
                                            <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">Zero-Downtime Guarantee</p>
                                            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                                                If API credentials are empty or offline, checkout falls back automatically to smart store rates.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 NEW: BANK MANAGEMENT SYSTEM */}
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4">

                                {/* Add Bank Form */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-8 transition-colors">
                                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl"><Building2 size={20} /></div>
                                            <div>
                                                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Add Verified Bank</h2>
                                                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Live RBI directory verification</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleAddBank} className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">IFSC / Swift Code</label>
                                                <input
                                                    type="text"
                                                    required
                                                    maxLength={11}
                                                    value={bankForm.ifscCode}
                                                    onChange={e => {
                                                        const upper = e.target.value.toUpperCase();
                                                        setBankForm({ ...bankForm, ifscCode: upper });
                                                        if (upper.length === 11) {
                                                            handleVerifyIfsc(upper);
                                                        } else if (ifscVerification.verified || ifscVerification.error) {
                                                            setIfscVerification({ loading: false, verified: false });
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (bankForm.ifscCode.length === 11) {
                                                            handleVerifyIfsc(bankForm.ifscCode);
                                                        }
                                                    }}
                                                    placeholder="e.g. SBIN0001234, HDFC0000123"
                                                    className={`${bankInputCls} font-mono tracking-wider uppercase`}
                                                />

                                                {/* Live IFSC verification feedback */}
                                                {ifscVerification.loading && (
                                                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold animate-pulse">
                                                        <Loader2 size={14} className="animate-spin" /> Verifying IFSC code with RBI directory...
                                                    </div>
                                                )}
                                                {ifscVerification.verified && (
                                                    <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                                                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-[11px] font-black uppercase text-emerald-900 dark:text-emerald-200">✓ RBI Verified Bank Branch</p>
                                                            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">{ifscVerification.bankName} - {ifscVerification.branch}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {ifscVerification.error && (
                                                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold">
                                                        <AlertCircle size={14} className="flex-shrink-0" />
                                                        <span>{ifscVerification.error}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bank & Branch Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankForm.bankName}
                                                    onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                                                    placeholder="e.g. State Bank of India (Main Branch)"
                                                    className={bankInputCls}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Account Beneficiary Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankForm.accountName}
                                                    onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })}
                                                    placeholder="e.g. ShoeStyle Private Limited"
                                                    className={bankInputCls}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Account Number (9-18 digits)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={bankForm.accountNumber}
                                                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\s+/g, '') })}
                                                    placeholder="e.g. 50100234567890"
                                                    className={`${bankInputCls} font-mono tracking-wider`}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confirm Account Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={confirmAccNumber}
                                                    onChange={e => setConfirmAccNumber(e.target.value.replace(/\s+/g, ''))}
                                                    placeholder="Re-type account number to prevent typos"
                                                    className={`${bankInputCls} font-mono tracking-wider`}
                                                />
                                                {confirmAccNumber && bankForm.accountNumber && (
                                                    <p className={`text-[11px] font-bold mt-1 ${confirmAccNumber === bankForm.accountNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                        {confirmAccNumber === bankForm.accountNumber ? '✓ Account numbers match' : '✕ Account numbers do not match'}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                disabled={bankLoading || (bankForm.accountNumber !== confirmAccNumber && Boolean(confirmAccNumber))}
                                                type="submit"
                                                className="w-full mt-6 py-4 bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={18} /> {bankLoading ? 'Verifying & Adding...' : 'Add Verified Account'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Active Banks List */}
                                <div className="lg:col-span-3 space-y-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 pl-2">Active Accounts ({banks.length})</h2>

                                    {banks.length === 0 ? (
                                        <div className="bg-white dark:bg-[#0f172a] p-10 rounded-3xl border border-slate-100 dark:border-slate-800 text-center shadow-sm transition-colors">
                                            <CreditCard size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                            <p className="text-slate-500 dark:text-slate-400 font-bold">No verified bank accounts added yet.</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add your official business bank account to display at checkout for wire transfers.</p>
                                        </div>
                                    ) : (
                                        banks.map((bank) => (
                                            <div key={bank.id} className="bg-white dark:bg-[#0f172a] p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center group hover:border-emerald-200 dark:hover:border-emerald-700 transition-all">
                                                <div className="space-y-4 flex-1 w-full">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                            <ShieldCheck size={18} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-900/50">Active at Check-out</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Bank Name</p>
                                                            <p className="font-black text-slate-900 dark:text-white">{bank.bankName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Account Name</p>
                                                            <p className="font-black text-slate-900 dark:text-white">{bank.accountName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Account Number</p>
                                                            <p className="font-black text-slate-700 dark:text-slate-300 font-mono tracking-wider">{bank.accountNumber}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">IFSC Code</p>
                                                            <p className="font-black text-slate-700 dark:text-slate-300 font-mono tracking-wider">{bank.ifscCode}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteBank(bank.id)} className="w-full sm:w-auto p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center">
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