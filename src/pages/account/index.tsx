import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; // 🔥 Premium Animations
import toast, { Toaster } from 'react-hot-toast'; // 🔥 Premium Notifications
import {
    FiUser, FiShoppingBag, FiHeart, FiMapPin, FiSettings,
    FiLogOut, FiEdit3, FiCheck, FiX, FiPackage,
    FiTruck, FiCheckCircle, FiClock, FiChevronRight,
    FiPlus, FiEdit2, FiTrash2, FiLock
} from 'react-icons/fi';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useOrders } from '@/hooks/useOrders';
import { useWishlist } from '@/hooks/useWishlist';

interface AccountPageProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export default function AccountPage({ user }: AccountPageProps) {
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
    const [addresses, setAddresses] = useState<any[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressForm, setAddressForm] = useState({
        id: '', name: '', street: '', city: '', state: '', zip: '', country: '', phone: ''
    });

    // 🔥 NEW: Password Change States
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
                toast.success('Profile updated successfully! ✨');
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

    // Address Handlers
    const handleOpenAddressModal = (addressToEdit: any = null) => {
        if (addressToEdit) setAddressForm(addressToEdit);
        else setAddressForm({ id: '', name: '', street: '', city: '', state: '', zip: '', country: '', phone: '' });
        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (addressForm.id) {
            setAddresses(addresses.map(a => a.id === addressForm.id ? addressForm : a));
            toast.success('Address updated!');
        } else {
            setAddresses([...addresses, { ...addressForm, id: Date.now().toString() }]);
            toast.success('New address added!');
        }
        setIsAddressModalOpen(false);
    };

    const handleDeleteAddress = (id: string) => {
        setAddresses(addresses.filter(a => a.id !== id));
        toast.success('Address deleted');
    };

    // 🔥 NEW: Password Handlers
    const handleOpenPasswordModal = () => {
        if (user.role === 'admin') {
            toast.error('Access Denied: Admin passwords cannot be modified here.', {
                icon: '🛑',
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
            return;
        }
        setIsPasswordModalOpen(true);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Double check admin logic block
        if (user.role === 'admin') {
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
            // NOTE: Make sure you have this backend API route created
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
                toast.success('Password updated securely! 🚀');
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

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: FiUser, color: 'from-blue-500 to-blue-600' },
        { id: 'orders', label: 'Orders', icon: FiShoppingBag, color: 'from-purple-500 to-purple-600' },
        { id: 'wishlist', label: 'Wishlist', icon: FiHeart, color: 'from-pink-500 to-pink-600' },
        { id: 'addresses', label: 'Addresses', icon: FiMapPin, color: 'from-green-500 to-green-600' },
        { id: 'settings', label: 'Settings', icon: FiSettings, color: 'from-orange-500 to-orange-600' },
    ];

    const orderStats = {
        total: orders?.length || 0,
        pending: orders?.filter((o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED').length || 0,
        inTransit: orders?.filter((o: any) => o.status === 'PROCESSING' || o.status === 'SHIPPED').length || 0,
        delivered: orders?.filter((o: any) => o.status === 'DELIVERED').length || 0,
    };

    const stats = [
        { label: 'Total Orders', value: orderStats.total.toString(), icon: FiPackage, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
        { label: 'In Transit', value: orderStats.inTransit.toString(), icon: FiTruck, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
        { label: 'Delivered', value: orderStats.delivered.toString(), icon: FiCheckCircle, color: 'bg-gradient-to-br from-green-500 to-green-600' },
        { label: 'Pending', value: orderStats.pending.toString(), icon: FiClock, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'PROCESSING': return 'bg-purple-100 text-purple-800';
            case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Framer Motion Variants for smooth Tab Switching
    const tabVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <>
            <Head>
                <title>My Account - ShoeStyle</title>
                <meta name="description" content="Manage your account settings and orders" />
            </Head>

            <Toaster position="top-center" reverseOrder={false} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header with Gradient */}
                    <div className="mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-3xl p-8 text-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-black mb-2 tracking-tight">Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋</h1>
                                    <p className="text-gray-300 text-lg font-medium">Manage your account and track your orders</p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/10">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                                    onClick={() => stat.label.includes('Order') && setActiveTab('orders')}
                                >
                                    <div className={`${stat.color} p-6 text-white h-full`}>
                                        <Icon className="text-3xl mb-3 opacity-90" />
                                        <p className="text-sm font-bold tracking-wider uppercase opacity-90">{stat.label}</p>
                                        <p className="text-4xl font-black mt-1 tracking-tight">{stat.value}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-3xl shadow-xl p-5 sticky top-8">
                                <div className="space-y-2">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group ${isActive
                                                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 translate-x-2'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                                    <Icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                                </div>
                                                <span className="tracking-wide">{item.label}</span>

                                                {item.id === 'orders' && orders?.length > 0 && (
                                                    <span className="ml-auto bg-blue-500 text-white text-xs font-black rounded-full px-2.5 py-1">
                                                        {orders.length}
                                                    </span>
                                                )}
                                                {item.id === 'wishlist' && wishlist?.length > 0 && (
                                                    <span className="ml-auto bg-pink-500 text-white text-xs font-black rounded-full px-2.5 py-1">
                                                        {wishlist.length}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-300 font-bold group"
                                        >
                                            <div className="p-2.5 rounded-xl bg-red-50 group-hover:bg-red-100 transition-colors">
                                                <FiLogOut className="text-xl" />
                                            </div>
                                            <span className="tracking-wide">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Area with AnimatePresence */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 min-h-[500px]">
                                <AnimatePresence mode="wait">

                                    {/* Profile Tab */}
                                    {activeTab === 'profile' && (
                                        <motion.div key="profile" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Profile Information</h2>
                                                    <p className="text-gray-500 mt-1 font-medium">Update your personal details</p>
                                                </div>
                                                {!isEditing && (
                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        <FiEdit3 /> Edit Profile
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Name Field */}
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Full Name</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <div className="text-xl font-bold text-gray-900">{user.name || 'Not provided'}</div>
                                                    )}
                                                </div>

                                                {/* Email Field */}
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Email Address</label>
                                                    {isEditing ? (
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                        />
                                                    ) : (
                                                        <div className="text-xl font-bold text-gray-900">{user.email}</div>
                                                    )}
                                                </div>

                                                {/* Account Type */}
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Account Type</label>
                                                    <div className="flex items-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {user.role?.toUpperCase() || 'USER'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Member Since */}
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Member Since</label>
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>

                                            {isEditing && (
                                                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isSaving}
                                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition-all font-bold text-lg"
                                                    >
                                                        <FiCheck className="text-xl" /> {isSaving ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        disabled={isSaving}
                                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold text-lg"
                                                    >
                                                        <FiX className="text-xl" /> Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Orders Tab */}
                                    {activeTab === 'orders' && (
                                        <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                            {/* Purana Orders logic with updated styling */}
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h2>
                                                    <p className="text-gray-500 mt-1 font-medium">Track and manage your orders</p>
                                                </div>
                                                {orders?.length > 0 && (
                                                    <Link href="/orders" className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold">
                                                        View All <FiChevronRight />
                                                    </Link>
                                                )}
                                            </div>

                                            {ordersLoading ? (
                                                <div className="text-center py-12">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 mx-auto mb-4"></div>
                                                </div>
                                            ) : orders?.length === 0 ? (
                                                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                                                    <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h3>
                                                    <p className="text-gray-500 mb-8 font-medium">Start shopping to see your orders here</p>
                                                    <button onClick={() => router.push('/products')} className="px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold shadow-lg">
                                                        Start Shopping
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {orders?.slice(0, 5).map((order: any) => (
                                                        <div key={order.id} className="p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div>
                                                                    <p className="font-black text-gray-900 text-lg tracking-tight">Order #{order.orderNumber}</p>
                                                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                                                        {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-black text-gray-900 text-xl">${order.total.toFixed(2)}</p>
                                                                    <span className={`text-xs px-3 py-1 rounded-full font-black tracking-wider inline-block mt-2 ${getStatusColor(order.status)}`}>
                                                                        {order.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Link href={`/orders/${order.id}`} className="w-full py-3 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-bold flex items-center justify-center gap-2">
                                                                View Details <FiChevronRight />
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Wishlist Tab */}
                                    {activeTab === 'wishlist' && (
                                        <motion.div key="wishlist" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                            {/* Wishlist Logic mapped properly */}
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Wishlist</h2>
                                                    <p className="text-gray-500 mt-1 font-medium">Your saved favorite items</p>
                                                </div>
                                            </div>

                                            {wishlistLoading ? (
                                                <div className="text-center py-12">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 mx-auto mb-4"></div>
                                                </div>
                                            ) : wishlist?.length === 0 ? (
                                                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                                                    <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Your wishlist is empty</h3>
                                                    <button onClick={() => router.push('/products')} className="mt-6 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold shadow-lg">
                                                        Browse Products
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {wishlist?.slice(0, 6).map((item: any) => (
                                                        <div key={item.id} className="p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-gray-200 transition-colors flex gap-4 items-center">
                                                            <img src={item.product?.image || ''} alt="Product" className="w-20 h-20 object-cover rounded-xl bg-gray-50 mix-blend-multiply" />
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 line-clamp-1 tracking-tight">{item.product?.name}</h4>
                                                                <p className="text-lg font-black text-gray-900 mt-1">${item.product?.price}</p>
                                                                <Link href={`/products/${item.product?.slug || ''}`}>
                                                                    <button className="text-xs font-black tracking-widest uppercase text-blue-600 hover:text-blue-700 mt-2">
                                                                        View Product →
                                                                    </button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Addresses Tab */}
                                    {activeTab === 'addresses' && (
                                        <motion.div key="addresses" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                            <div className="flex items-center justify-between mb-8">
                                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Saved Addresses</h2>
                                                {addresses.length > 0 && (
                                                    <button onClick={() => handleOpenAddressModal()} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold">
                                                        <FiPlus /> Add New
                                                    </button>
                                                )}
                                            </div>

                                            {addresses.length === 0 ? (
                                                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                                                    <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
                                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No saved addresses</h3>
                                                    <button onClick={() => handleOpenAddressModal()} className="mt-6 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold shadow-lg">
                                                        Add New Address
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {addresses.map((address) => (
                                                        <div key={address.id} className="border-2 border-gray-100 rounded-2xl p-6 bg-white hover:border-gray-200 transition-colors relative group">
                                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleOpenAddressModal(address)} className="p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"><FiEdit2 size={16} /></button>
                                                                <button onClick={() => handleDeleteAddress(address.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><FiTrash2 size={16} /></button>
                                                            </div>
                                                            <h4 className="font-black text-lg text-gray-900 mb-2">{address.name}</h4>
                                                            <p className="text-gray-600 font-medium">{address.street}</p>
                                                            <p className="text-gray-600 font-medium">{address.city}, {address.state} {address.zip}</p>
                                                            <p className="text-gray-600 font-medium">{address.country}</p>
                                                            <p className="text-gray-900 font-bold mt-3 flex items-center gap-2">📞 {address.phone}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Settings Tab - 🔥 UPDATED FOR PASSWORD */}
                                    {activeTab === 'settings' && (
                                        <motion.div key="settings" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
                                            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Account Settings</h2>

                                            <div className="space-y-6">
                                                {/* 🔥 Functional Password Section */}
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <FiLock className="text-2xl text-gray-900" />
                                                        <label className="block text-xl font-black text-gray-900">
                                                            Password & Security
                                                        </label>
                                                    </div>
                                                    <p className="text-gray-600 mb-6 font-medium">Update your password to keep your account secure. Admin access restricted.</p>
                                                    <button
                                                        onClick={handleOpenPasswordModal}
                                                        className="px-8 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold shadow-md"
                                                    >
                                                        Change Password
                                                    </button>
                                                </div>

                                                {/* Notifications Section */}
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <label className="block text-xl font-black text-gray-900 mb-6">
                                                        Notifications
                                                    </label>
                                                    <div className="space-y-5">
                                                        {[
                                                            { title: 'Order Updates', desc: 'Get notified about your order status', default: true },
                                                            { title: 'Promotions & Offers', desc: 'Receive exclusive deals and discounts', default: true },
                                                            { title: 'Newsletter', desc: 'Weekly updates on new arrivals', default: false }
                                                        ].map((notif, idx) => (
                                                            <label key={idx} className="flex items-center gap-4 cursor-pointer group p-3 hover:bg-white rounded-xl transition-colors">
                                                                <input type="checkbox" defaultChecked={notif.default} className="w-5 h-5 text-gray-900 rounded focus:ring-2 focus:ring-gray-900 border-gray-300" />
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{notif.title}</p>
                                                                    <p className="text-sm font-medium text-gray-500">{notif.desc}</p>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Danger Zone */}
                                                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100">
                                                    <label className="block text-xl font-black text-red-600 mb-3">
                                                        ⚠️ Danger Zone
                                                    </label>
                                                    <p className="text-red-800/70 mb-6 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
                                                    <button className="px-8 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-md shadow-red-200">
                                                        Delete Account
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
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {addressForm.id ? 'Edit Address' : 'Add New Address'}
                                </h3>
                                <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-200">
                                    <FiX size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSaveAddress} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                        <input required type="text" value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="John Doe" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Street Address</label>
                                        <input required type="text" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="123 Main St" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">City</label>
                                        <input required type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="New York" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">State / Province</label>
                                        <input required type="text" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="NY" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">ZIP / Postal</label>
                                        <input required type="text" value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="10001" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Country</label>
                                        <input required type="text" value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="United States" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                                        <input required type="tel" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg">
                                        Save Address
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🔥 NEW: Password Modal */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    Change Password
                                </h3>
                                <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-200">
                                    <FiX size={24} />
                                </button>
                            </div>
                            <form onSubmit={handlePasswordSubmit} className="p-8">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Current Password</label>
                                        <input required type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">New Password</label>
                                        <input required type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="••••••••" minLength={6} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Confirm New Password</label>
                                        <input required type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 outline-none font-semibold" placeholder="••••••••" minLength={6} />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={isChangingPassword} className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-50">
                                        {isChangingPassword ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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

    return {
        props: {
            user: {
                id: session.user.id || '',
                name: session.user.name || '',
                email: session.user.email || '',
                role: session.user.role || 'user',
            },
        },
    };
};