import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiUser, FiShoppingBag, FiHeart, FiMapPin, FiSettings,
  FiLogOut, FiEdit3, FiCheck, FiX, FiPackage,
  FiTruck, FiCheckCircle, FiClock, FiChevronRight,
  FiPlus, FiEdit2, FiTrash2, FiLock, FiArrowLeft, FiHome,
  FiShield, FiAward, FiCopy
} from 'react-icons/fi';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist } from '@/hooks/useWishlist';
import prisma from '@/lib/prisma';

interface AccountPageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  initialAddresses?: any[];
}

export default function AccountPage({ user, initialAddresses = [] }: AccountPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
  });

  // Address States
  const [addresses, setAddresses] = useState<any[]>(initialAddresses);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isDeletingAddressId, setIsDeletingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    id: '', name: '', street: '', city: '', state: '', zip: '', country: '', phone: ''
  });

  // Client-side address loader fallback
  useEffect(() => {
    if (activeTab === 'addresses' && addresses.length === 0) {
      fetch('/api/user/addresses')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setAddresses(data);
          }
        })
        .catch(err => console.error('Failed to load addresses:', err));
    }
  }, [activeTab]);

  // Password Change States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const { orders, loading: ordersLoading } = useOrders();
  const { wishlist, loading: wishlistLoading } = useWishlist();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  // Profile Handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        toast.success('Profile updated successfully! ✨', {
          style: { borderRadius: '12px', background: '#000', color: '#fff', fontWeight: 'bold' }
        });
        router.reload();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: user.name || '', email: user.email || '' });
    setIsEditing(false);
  };

  // Address Handlers - Connected to PostgreSQL Database
  const handleOpenAddressModal = (addressToEdit: any = null) => {
    if (addressToEdit) {
      setAddressForm({
        id: addressToEdit.id || '',
        name: addressToEdit.name || `${addressToEdit.firstName || ''} ${addressToEdit.lastName || ''}`.trim(),
        street: addressToEdit.street || '',
        city: addressToEdit.city || '',
        state: addressToEdit.state || '',
        zip: addressToEdit.zipCode || addressToEdit.zip || '',
        country: addressToEdit.country || 'India',
        phone: addressToEdit.phone || '',
      });
    } else {
      setAddressForm({
        id: '',
        name: user.name || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: '',
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const isEditing = Boolean(addressForm.id);
      const url = isEditing ? `/api/user/addresses/${addressForm.id}` : '/api/user/addresses';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save address to database');
      }

      if (isEditing) {
        setAddresses(prev => prev.map(a => a.id === data.id ? data : a));
        toast.success('Address updated successfully in database! 📍', {
          style: { borderRadius: '12px', background: '#000', color: '#fff', fontWeight: 'bold' }
        });
      } else {
        setAddresses(prev => [data, ...prev]);
        toast.success('New delivery address saved securely to database! 📍', {
          style: { borderRadius: '12px', background: '#000', color: '#fff', fontWeight: 'bold' }
        });
      }

      setIsAddressModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error saving address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery residence?')) return;
    setIsDeletingAddressId(id);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete address');
      }

      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed from database');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting address');
    } finally {
      setIsDeletingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
        toast.success('Primary delivery residence updated! 🌟');
      }
    } catch (err) {
      toast.error('Failed to update primary residence');
    }
  };

  // Password Handlers
  const handleOpenPasswordModal = () => {
    if (user.role?.toLowerCase() === 'admin') {
      toast.error('Access Denied: Admin passwords cannot be modified from customer portal.', {
        icon: '🛑',
        style: { borderRadius: '12px', background: '#111', color: '#fff', fontWeight: 'bold' }
      });
      return;
    }
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user.role?.toLowerCase() === 'admin') {
      toast.error('Admin Access Denied!');
      setIsPasswordModalOpen(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Password updated securely! 🚀', {
          style: { borderRadius: '12px', background: '#000', color: '#fff', fontWeight: 'bold' }
        });
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Incorrect current password');
      }
    } catch (err) {
      toast.error('Something went wrong!');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const copyEmail = () => {
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      toast.success('Email copied to clipboard!');
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Dossier', icon: FiUser },
    { id: 'orders', label: 'Acquisitions & Orders', icon: FiShoppingBag },
    { id: 'wishlist', label: 'Curated Wishlist', icon: FiHeart },
    { id: 'addresses', label: 'Delivery Residences', icon: FiMapPin },
    { id: 'settings', label: 'Security & Preferences', icon: FiSettings },
  ];

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter((o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED').length || 0,
    inTransit: orders?.filter((o: any) => o.status === 'PROCESSING' || o.status === 'SHIPPED').length || 0,
    delivered: orders?.filter((o: any) => o.status === 'DELIVERED').length || 0,
  };

  const stats = [
    { label: 'Total Acquisitions', value: orderStats.total.toString(), sub: 'Lifetime orders', icon: FiPackage },
    { label: 'In Transit', value: orderStats.inTransit.toString(), sub: 'Active deliveries', icon: FiTruck },
    { label: 'Delivered', value: orderStats.delivered.toString(), sub: 'Fulfilled orders', icon: FiCheckCircle },
    { label: 'Pending Dispatch', value: orderStats.pending.toString(), sub: 'Processing at atelier', icon: FiClock },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Pending</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Confirmed</span>;
      case 'PROCESSING':
      case 'SHIPPED':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">In Transit</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-800 border border-red-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-neutral-100 text-neutral-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">{status}</span>;
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } }
  };

  const isUserAdmin = user.role?.toLowerCase() === 'admin';

  return (
    <>
      <Head>
        <title>Private Client Account — ShoeStyle</title>
        <meta name="description" content="Manage your ShoeStyle private client account and acquisitions" />
      </Head>

      <Toaster position="top-center" reverseOrder={false} />

      <Header />

      <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 pb-24 font-['Inter',sans-serif]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          {/* Top Bar: Breadcrumb Navigation & Back Button */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-neutral-200/90 text-neutral-800 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white hover:border-black shadow-sm transition-all group cursor-pointer"
            >
              <FiArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Return</span>
            </button>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-neutral-200/80 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-all shadow-sm"
              >
                <FiHome className="text-xs" />
                <span>Store</span>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-sm"
              >
                <span>Browse Catalog</span>
              </Link>
            </div>
          </div>

          {/* 🔥 5-LAKH FLAGSHIP OBSIDIAN HERO BANNER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative bg-[#0b0f17] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.35)] overflow-hidden mb-10 border border-neutral-800/80"
          >
            {/* Ambient Radial Highlights */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 to-amber-300/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-1 rounded-full backdrop-blur-md">
                    <FiAward size={12} /> {isUserAdmin ? 'CHIEF ADMINISTRATOR' : 'SHOESTYLE NOIR PRIVÉ'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-neutral-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    <FiShield size={11} className="text-emerald-400" /> Verified Member
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
                  Welcome, {user.name?.split(' ')[0] || 'Client'}
                </h1>
                <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                  Your private portal for bespoke footwear acquisitions, real-time dispatch tracking, and personal styling preferences.
                </p>
              </div>

              {/* Monogram Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-neutral-800 to-neutral-900 border-2 border-white/15 shadow-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {user.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0b0f17] flex items-center justify-center text-[10px] text-white">
                    ✓
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 🔥 LUXURY MONOCHROME METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => setActiveTab('orders')}
                  className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] hover:border-black transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400 group-hover:text-black transition-colors">
                      {stat.label}
                    </span>
                    <div className="w-9 h-9 rounded-2xl bg-neutral-100 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors text-neutral-700">
                      <Icon size={16} />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-[11px] font-medium text-neutral-400 mt-1">
                    {stat.sub}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* MAIN GRID: SIDEBAR TABS & CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-[2rem] p-4 border border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-1.5">
                <div className="px-4 py-3 border-b border-neutral-100 mb-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                    Client Menu
                  </p>
                  <p className="text-xs font-bold text-neutral-900 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-neutral-900 text-white shadow-lg shadow-black/15 translate-x-1'
                          : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-white/15 text-white' : 'bg-neutral-100 text-neutral-700'}`}>
                          <Icon size={15} />
                        </div>
                        <span>{item.label}</span>
                      </div>

                      {item.id === 'orders' && orders?.length > 0 && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-black' : 'bg-neutral-200 text-neutral-800'}`}>
                          {orders.length}
                        </span>
                      )}
                      {item.id === 'wishlist' && wishlist?.length > 0 && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-black' : 'bg-neutral-200 text-neutral-800'}`}>
                          {wishlist.length}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Admin Quick Jump if Role is ADMIN */}
                {isUserAdmin && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50/70 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <FiShield size={15} />
                      </div>
                      <span>Admin Headquarters</span>
                    </div>
                    <FiChevronRight size={14} />
                  </Link>
                )}

                {/* Logout Button */}
                <div className="pt-3 border-t border-neutral-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-xl bg-red-50 text-red-600">
                      <FiLogOut size={15} />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] min-h-[550px]">
                <AnimatePresence mode="wait">

                  {/* 1. PROFILE TAB */}
                  {activeTab === 'profile' && (
                    <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                            Personal Credentials
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1">
                            Profile Information
                          </h2>
                        </div>
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-sm cursor-pointer"
                          >
                            <FiEdit3 size={14} />
                            <span>Edit Profile</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                        {/* Name */}
                        <div className="bg-neutral-50/70 p-6 rounded-2xl border border-neutral-100">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
                            Full Legal Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 font-bold rounded-xl focus:border-black outline-none transition-all"
                            />
                          ) : (
                            <div className="text-lg font-black text-neutral-900 tracking-tight">
                              {user.name || 'Not provided'}
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div className="bg-neutral-50/70 p-6 rounded-2xl border border-neutral-100 relative">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
                            Email Address
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 font-bold rounded-xl focus:border-black outline-none transition-all"
                            />
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-base sm:text-lg font-black text-neutral-900 tracking-tight truncate">
                                {user.email}
                              </span>
                              <button
                                onClick={copyEmail}
                                className="p-2 text-neutral-400 hover:text-black rounded-lg transition-colors cursor-pointer"
                                title="Copy Email"
                              >
                                <FiCopy size={15} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Account Tier */}
                        <div className="bg-neutral-50/70 p-6 rounded-2xl border border-neutral-100">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
                            Membership Status
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isUserAdmin ? 'bg-purple-100 text-purple-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {isUserAdmin ? '★ Super Administrator' : '★ Noir Privé Member'}
                            </span>
                          </div>
                        </div>

                        {/* Client Since */}
                        <div className="bg-neutral-50/70 p-6 rounded-2xl border border-neutral-100">
                          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
                            Member Established
                          </label>
                          <div className="text-lg font-black text-neutral-900 tracking-tight">
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      {/* Editing Actions */}
                      {isEditing && (
                        <div className="flex gap-4 pt-4 border-t border-neutral-100">
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                          >
                            <FiCheck size={16} /> {isSaving ? 'Saving...' : 'Save Updates'}
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-neutral-100 text-neutral-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-neutral-200 transition-all cursor-pointer"
                          >
                            <FiX size={16} /> Cancel
                          </button>
                        </div>
                      )}

                      {/* VIP Client Privileges Card */}
                      <div className="mt-8 p-6 rounded-3xl bg-neutral-900 text-white border border-neutral-800">
                        <div className="flex items-center gap-2 text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                          <FiAward size={14} /> Noir Privé Privileges
                        </div>
                        <h4 className="text-lg font-black tracking-tight uppercase mb-3">
                          Complimentary Luxury Services
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-300">
                          <div>
                            <p className="font-bold text-white mb-0.5">Express Logistics</p>
                            <p className="text-neutral-400 text-[11px]">Free insured door delivery across India.</p>
                          </div>
                          <div>
                            <p className="font-bold text-white mb-0.5">Showroom Holds</p>
                            <p className="text-neutral-400 text-[11px]">48-hour reserve on limited drops.</p>
                          </div>
                          <div>
                            <p className="font-bold text-white mb-0.5">Private Concierge</p>
                            <p className="text-neutral-400 text-[11px]">Dedicated advisor for fit and sizing.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 2. ORDERS TAB */}
                  {activeTab === 'orders' && (
                    <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                            Acquisitions Dossier
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1">
                            Order History
                          </h2>
                        </div>
                        {orders?.length > 0 && (
                          <Link
                            href="/orders"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-900 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all cursor-pointer"
                          >
                            <span>Full Dossier</span>
                            <FiChevronRight size={14} />
                          </Link>
                        )}
                      </div>

                      {ordersLoading ? (
                        <div className="text-center py-16">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4" />
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Loading acquisitions...</p>
                        </div>
                      ) : orders?.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100">
                          <FiShoppingBag className="text-5xl text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-xl font-black text-neutral-900 uppercase mb-2">No Acquisitions Yet</h3>
                          <p className="text-neutral-500 text-xs font-medium mb-6">Discover handcrafted footwear and limited editions in our catalog.</p>
                          <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md"
                          >
                            Explore Collections
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders?.slice(0, 8).map((order: any) => (
                            <div
                              key={order.id}
                              className="p-6 bg-white border border-neutral-200/90 rounded-3xl hover:border-black hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <p className="font-black text-neutral-900 text-lg tracking-tight">
                                      Order #{order.orderNumber}
                                    </p>
                                    {getStatusBadge(order.status)}
                                  </div>
                                  <p className="text-xs text-neutral-500 font-medium mt-1">
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {order.items?.length || 0} pair(s)
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="font-black text-neutral-900 text-2xl tracking-tight">
                                    ₹{order.total?.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                                <span className="text-xs text-neutral-500 font-medium">
                                  Payment: <strong className="text-neutral-800">{order.paymentMethod || 'Razorpay Online'}</strong>
                                </span>
                                <Link
                                  href={`/orders/${order.id}`}
                                  className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black hover:text-neutral-600 transition-colors"
                                >
                                  <span>View Order Dossier</span>
                                  <FiChevronRight size={14} />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 3. WISHLIST TAB */}
                  {activeTab === 'wishlist' && (
                    <motion.div key="wishlist" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                            Curated Favorites
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1">
                            My Wishlist
                          </h2>
                        </div>
                        <Link
                          href="/wishlist"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-100 text-neutral-900 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                          <span>Full Wishlist</span>
                          <FiChevronRight size={14} />
                        </Link>
                      </div>

                      {wishlistLoading ? (
                        <div className="text-center py-16">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-4" />
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Loading saved items...</p>
                        </div>
                      ) : wishlist?.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100">
                          <FiHeart className="text-5xl text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-xl font-black text-neutral-900 uppercase mb-2">Your Wishlist is Empty</h3>
                          <p className="text-neutral-500 text-xs font-medium mb-6">Save your dream sneakers to track their releases and price updates.</p>
                          <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md"
                          >
                            Explore Shoes
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {wishlist?.slice(0, 6).map((item: any) => (
                            <div
                              key={item.id}
                              className="p-4 bg-white border border-neutral-200/90 rounded-3xl hover:border-black transition-all flex gap-4 items-center group"
                            >
                              <div className="w-20 h-20 bg-neutral-50 rounded-2xl flex items-center justify-center p-2 flex-shrink-0 border border-neutral-100">
                                <img
                                  src={item.product?.image || '/placeholder.png'}
                                  alt={item.product?.name}
                                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-neutral-900 text-sm line-clamp-1 tracking-tight">
                                  {item.product?.name}
                                </h4>
                                <p className="text-base font-black text-neutral-900 mt-1">
                                  ₹{item.product?.price?.toLocaleString('en-IN')}
                                </p>
                                <Link
                                  href={`/products/${item.product?.slug || ''}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-neutral-900 hover:text-blue-600 mt-2 transition-colors"
                                >
                                  <span>View Item</span>
                                  <FiChevronRight size={12} />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 4. ADDRESSES TAB */}
                  {activeTab === 'addresses' && (
                    <motion.div key="addresses" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                      <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                            Shipping Locations
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1">
                            Delivery Residences
                          </h2>
                        </div>
                        {addresses.length > 0 && (
                          <button
                            onClick={() => handleOpenAddressModal()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-sm cursor-pointer"
                          >
                            <FiPlus size={14} />
                            <span>Add Address</span>
                          </button>
                        )}
                      </div>

                      {addresses.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-neutral-100">
                          <FiMapPin className="text-5xl text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-xl font-black text-neutral-900 uppercase mb-2">No Delivery Residences Saved</h3>
                          <p className="text-neutral-500 text-xs font-medium mb-6">Store your home or office address for seamless 1-click acquisitions.</p>
                          <button
                            onClick={() => handleOpenAddressModal()}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
                          >
                            <FiPlus size={14} />
                            <span>Add New Address</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              className="border border-neutral-200/90 rounded-3xl p-6 bg-white hover:border-black transition-all relative group"
                            >
                              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenAddressModal(address)}
                                  className="p-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <FiEdit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  disabled={isDeletingAddressId === address.id}
                                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Delete"
                                >
                                  {isDeletingAddressId === address.id ? (
                                    <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin block" />
                                  ) : (
                                    <FiTrash2 size={14} />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  address.isDefault ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-800'
                                }`}>
                                  {address.isDefault ? '⭐ Primary Residence' : 'Standard Residence'}
                                </span>
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(address.id)}
                                    className="text-[10px] font-bold text-neutral-400 hover:text-black transition-colors underline cursor-pointer"
                                  >
                                    Set as Primary
                                  </button>
                                )}
                              </div>
                              <h4 className="font-black text-lg text-neutral-900 tracking-tight mb-1">
                                {address.name}
                              </h4>
                              <p className="text-neutral-600 text-xs font-medium leading-relaxed">
                                {address.street} {address.apartment ? `, ${address.apartment}` : ''}
                              </p>
                              <p className="text-neutral-600 text-xs font-medium">
                                {address.city}, {address.state} {address.zip || address.zipCode}
                              </p>
                              <p className="text-neutral-600 text-xs font-medium">
                                {address.country}
                              </p>
                              <p className="text-neutral-900 font-bold text-xs mt-3 flex items-center gap-1.5">
                                <span>📞</span> {address.phone}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* 5. SETTINGS TAB */}
                  {activeTab === 'settings' && (
                    <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                      <div className="mb-8 pb-6 border-b border-neutral-100">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                          Security & Account
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase mt-1">
                          Account Settings
                        </h2>
                      </div>

                      <div className="space-y-6">
                        {/* Password Section */}
                        <div className="bg-neutral-50/70 p-6 rounded-3xl border border-neutral-200/80">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                              <FiLock size={15} />
                            </div>
                            <h3 className="text-base font-black uppercase tracking-tight text-neutral-900">
                              Authentication & Password
                            </h3>
                          </div>
                          <p className="text-neutral-500 text-xs font-medium mb-5 leading-relaxed max-w-lg">
                            Regularly refresh your credentials to preserve highest tier security. Admin credentials are protected via backend protocol.
                          </p>
                          <button
                            onClick={handleOpenPasswordModal}
                            className="px-6 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-md cursor-pointer"
                          >
                            Update Password
                          </button>
                        </div>

                        {/* Notifications */}
                        <div className="bg-neutral-50/70 p-6 rounded-3xl border border-neutral-200/80">
                          <h3 className="text-base font-black uppercase tracking-tight text-neutral-900 mb-4">
                            Client Preferences
                          </h3>
                          <div className="space-y-3">
                            {[
                              { title: 'Acquisition & Logistics Dispatches', desc: 'Real-time SMS and email updates regarding shipment transit', default: true },
                              { title: 'Private Sales & VIP Drop Access', desc: 'Private 24-hour advance invitations to exclusive sneaker drops', default: true },
                              { title: 'Weekly Curated Lookbook', desc: 'Editorially styled footwear roundups and seasonal selections', default: false }
                            ].map((notif, idx) => (
                              <label key={idx} className="flex items-start gap-4 p-3 hover:bg-white rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-neutral-100">
                                <input
                                  type="checkbox"
                                  defaultChecked={notif.default}
                                  className="mt-1 w-4 h-4 text-black rounded focus:ring-black border-neutral-300"
                                />
                                <div>
                                  <p className="font-bold text-xs text-neutral-900">{notif.title}</p>
                                  <p className="text-[11px] font-medium text-neutral-500 mt-0.5">{notif.desc}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/40 p-6 rounded-3xl border border-red-200/60">
                          <h3 className="text-base font-black uppercase tracking-tight text-red-600 mb-2">
                            Account Termination
                          </h3>
                          <p className="text-red-900/70 text-xs font-medium mb-5 max-w-lg">
                            Closing your account will permanently eradicate your order history, saved addresses, and VIP tier membership.
                          </p>
                          <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-sm cursor-pointer">
                            Request Account Deletion
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-neutral-100"
            >
              <div className="px-8 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">
                  {addressForm.id ? 'Edit Residence' : 'Add New Delivery Address'}
                </h3>
                <button
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>
              <form onSubmit={handleSaveAddress} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Recipient Full Name</label>
                    <input required type="text" value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="John Doe" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Street Address</label>
                    <input required type="text" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="123 Luxury Boulevard" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">City</label>
                    <input required type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="New Delhi" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">State</label>
                    <input required type="text" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="Delhi" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Postal Code</label>
                    <input required type="text" value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="110074" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Country</label>
                    <input required type="text" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="India" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Mobile Contact</label>
                    <input required type="tel" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3.5 bg-neutral-100 text-neutral-800 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="flex-1 py-3.5 bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingAddress ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Address...</span>
                      </>
                    ) : (
                      <span>Save Residence</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-neutral-100"
            >
              <div className="px-8 py-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">
                  Update Security Password
                </h3>
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-8 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Current Password</label>
                  <input required type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">New Password</label>
                  <input required type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="••••••••" minLength={6} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5">Confirm New Password</label>
                  <input required type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-black outline-none font-bold text-sm" placeholder="••••••••" minLength={6} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-3.5 bg-neutral-100 text-neutral-800 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isChangingPassword} className="flex-1 py-3.5 bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition-colors shadow-md disabled:opacity-50 cursor-pointer">
                    {isChangingPassword ? 'Updating...' : 'Save Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/account',
        permanent: false,
      },
    };
  }

  let initialAddresses: any[] = [];
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email || '' },
      select: { id: true },
    });

    if (user) {
      const dbAddresses = await prisma.userAddress.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      initialAddresses = dbAddresses.map((a) => ({
        id: a.id,
        name: `${a.firstName} ${a.lastName}`.trim() || 'Resident',
        firstName: a.firstName,
        lastName: a.lastName,
        street: a.street,
        apartment: a.apartment || '',
        city: a.city,
        state: a.state,
        zip: a.zipCode,
        zipCode: a.zipCode,
        country: a.country || 'India',
        phone: a.phone,
        type: a.type,
        isDefault: a.isDefault,
        createdAt: a.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.error('Error loading user addresses in getServerSideProps:', err);
  }

  return {
    props: {
      user: {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'user',
      },
      initialAddresses: JSON.parse(JSON.stringify(initialAddresses)),
    },
  };
};
