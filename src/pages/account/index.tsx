import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    FiUser,
    FiShoppingBag,
    FiHeart,
    FiMapPin,
    FiSettings,
    FiLogOut,
    FiEdit3,
    FiCheck,
    FiX,
    FiPackage,
    FiTruck,
    FiCheckCircle,
    FiClock,
    FiChevronRight
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
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
    });

    // Fetch orders and wishlist
    const { orders, loading: ordersLoading } = useOrders();
    const { wishlist, loading: wishlistLoading } = useWishlist();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
    };

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
                alert('✅ Profile updated successfully!');
                router.reload();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
        });
        setIsEditing(false);
    };

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: FiUser, color: 'from-blue-500 to-blue-600' },
        { id: 'orders', label: 'Orders', icon: FiShoppingBag, color: 'from-purple-500 to-purple-600' },
        { id: 'wishlist', label: 'Wishlist', icon: FiHeart, color: 'from-pink-500 to-pink-600' },
        { id: 'addresses', label: 'Addresses', icon: FiMapPin, color: 'from-green-500 to-green-600' },
        { id: 'settings', label: 'Settings', icon: FiSettings, color: 'from-orange-500 to-orange-600' },
    ];

    // Calculate order stats
    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
        inTransit: orders.filter(o => o.status === 'PROCESSING' || o.status === 'SHIPPED').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
    };

    const stats = [
        { label: 'Total Orders', value: orderStats.total.toString(), icon: FiPackage, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
        { label: 'In Transit', value: orderStats.inTransit.toString(), icon: FiTruck, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
        { label: 'Delivered', value: orderStats.delivered.toString(), icon: FiCheckCircle, color: 'bg-gradient-to-br from-green-500 to-green-600' },
        { label: 'Pending', value: orderStats.pending.toString(), icon: FiClock, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800';
            case 'PROCESSING':
                return 'bg-purple-100 text-purple-800';
            case 'SHIPPED':
                return 'bg-indigo-100 text-indigo-800';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head>
                <title>My Account - ShoeStyle</title>
                <meta name="description" content="Manage your account settings and orders" />
            </Head>

            {/* Gradient Background */}
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with Gradient */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-2xl p-8 text-white shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0] || 'User'}! 👋</h1>
                                    <p className="text-gray-300 text-lg">Manage your account and track your orders</p>
                                </div>
                                <div className="hidden md:block">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer"
                                    onClick={() => stat.label.includes('Order') && setActiveTab('orders')}
                                >
                                    <div className={`${stat.color} p-6 text-white`}>
                                        <Icon className="text-3xl mb-2 opacity-90" />
                                        <p className="text-sm font-medium opacity-90">{stat.label}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-4">
                                <div className="space-y-2">
                                    {menuItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 group ${isActive
                                                        ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg scale-105'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                                    <Icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                                </div>
                                                <span>{item.label}</span>
                                                {item.id === 'orders' && orders.length > 0 && (
                                                    <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                                        {orders.length}
                                                    </span>
                                                )}
                                                {item.id === 'wishlist' && wishlist.length > 0 && (
                                                    <span className="ml-auto bg-pink-500 text-white text-xs rounded-full px-2 py-1">
                                                        {wishlist.length}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium group mt-4"
                                    >
                                        <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100">
                                            <FiLogOut className="text-xl" />
                                        </div>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div className="animate-fadeIn">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-900">Profile Information</h2>
                                                <p className="text-gray-500 mt-1">Update your personal details</p>
                                            </div>
                                            {!isEditing && (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    <FiEdit3 />
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name Field */}
                                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Full Name
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                                        placeholder="Enter your name"
                                                    />
                                                ) : (
                                                    <div className="text-xl font-semibold text-gray-900">
                                                        {user.name || 'Not provided'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Email Field */}
                                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Email Address
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                                        placeholder="Enter your email"
                                                    />
                                                ) : (
                                                    <div className="text-xl font-semibold text-gray-900">
                                                        {user.email}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Account Type */}
                                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Account Type
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${user.role === 'admin'
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                        }`}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Member Since */}
                                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Member Since
                                                </label>
                                                <div className="text-xl font-semibold text-gray-900">
                                                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {isEditing && (
                                            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                                                >
                                                    <FiCheck className="text-xl" />
                                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={isSaving}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:bg-gray-100 transition-all duration-300 font-semibold text-lg"
                                                >
                                                    <FiX className="text-xl" />
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Orders Tab */}
                                {activeTab === 'orders' && (
                                    <div className="animate-fadeIn">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                                                <p className="text-gray-500 mt-1">Track and manage your orders</p>
                                            </div>
                                            {orders.length > 0 && (
                                                <Link
                                                    href="/orders"
                                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                >
                                                    View All
                                                    <FiChevronRight />
                                                </Link>
                                            )}
                                        </div>

                                        {ordersLoading ? (
                                            <div className="text-center py-12">
                                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Loading orders...</p>
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <div className="text-center py-16">
                                                <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-6">
                                                    <FiShoppingBag className="text-6xl text-purple-600" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
                                                <p className="text-gray-500 mb-8 text-lg">Start shopping to see your orders here</p>
                                                <button
                                                    onClick={() => router.push('/products')}
                                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                                                >
                                                    Start Shopping
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {orders.slice(0, 5).map((order: any) => (
                                                    <div key={order.id} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-lg">Order #{order.orderNumber}</p>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })} • {order.items?.length || 0} items
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-gray-900 text-xl">${order.total.toFixed(2)}</p>
                                                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="w-full py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-2"
                                                        >
                                                            View Details
                                                            <FiChevronRight />
                                                        </Link>
                                                    </div>
                                                ))}
                                                {orders.length > 5 && (
                                                    <Link
                                                        href="/orders"
                                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold block text-center"
                                                    >
                                                        View All {orders.length} Orders
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Wishlist Tab */}
                                {activeTab === 'wishlist' && (
                                    <div className="animate-fadeIn">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-900">My Wishlist</h2>
                                                <p className="text-gray-500 mt-1">Your saved favorite items</p>
                                            </div>
                                            {wishlist.length > 0 && (
                                                <Link href="/wishlist">
                                                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-xl hover:from-pink-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                                        View All
                                                        <FiChevronRight />
                                                    </button>
                                                </Link>
                                            )}
                                        </div>

                                        {wishlistLoading ? (
                                            <div className="text-center py-12">
                                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Loading wishlist...</p>
                                            </div>
                                        ) : wishlist.length === 0 ? (
                                            <div className="text-center py-16">
                                                <div className="inline-block p-6 bg-gradient-to-br from-pink-100 to-red-100 rounded-full mb-6">
                                                    <FiHeart className="text-6xl text-pink-600" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h3>
                                                <p className="text-gray-500 mb-8 text-lg">Save items you love for later</p>
                                                <button
                                                    onClick={() => router.push('/products')}
                                                    className="px-8 py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-xl hover:from-pink-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg"
                                                >
                                                    Browse Products
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-gray-600 mb-4">{wishlist.length} items in your wishlist</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {wishlist.slice(0, 6).map((item: any) => (
                                                        <div key={item.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                            <div className="flex gap-4">
                                                                <img
                                                                    src={item.product.image}
                                                                    alt={item.product.name}
                                                                    className="w-20 h-20 object-cover rounded-lg"
                                                                />
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-gray-900 line-clamp-1">{item.product.name}</h4>
                                                                    <p className="text-lg font-bold text-gray-900 mt-1">${item.product.price}</p>
                                                                    <Link href={`/products/${item.product.slug}`}>
                                                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1">
                                                                            View Product →
                                                                        </button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {wishlist.length > 6 && (
                                                    <Link href="/wishlist">
                                                        <button className="w-full py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-xl hover:from-pink-700 hover:to-red-700 transition-all duration-300 font-semibold mt-4">
                                                            View All {wishlist.length} Items
                                                        </button>
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Addresses Tab */}
                                {activeTab === 'addresses' && (
                                    <div className="animate-fadeIn">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Saved Addresses</h2>
                                        <div className="text-center py-16">
                                            <div className="inline-block p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
                                                <FiMapPin className="text-6xl text-green-600" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No saved addresses</h3>
                                            <p className="text-gray-500 mb-8 text-lg">Add addresses for faster checkout</p>
                                            <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg">
                                                Add New Address
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Settings Tab */}
                                {activeTab === 'settings' && (
                                    <div className="animate-fadeIn">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h2>
                                        <div className="space-y-6">
                                            {/* Password Section */}
                                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
                                                <label className="block text-lg font-semibold text-gray-900 mb-3">
                                                    Password & Security
                                                </label>
                                                <p className="text-gray-600 mb-4">Update your password to keep your account secure</p>
                                                <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold">
                                                    Change Password
                                                </button>
                                            </div>

                                            {/* Notifications */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                                <label className="block text-lg font-semibold text-gray-900 mb-4">
                                                    Notifications
                                                </label>
                                                <div className="space-y-4">
                                                    <label className="flex items-center gap-4 cursor-pointer group">
                                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Order Updates</p>
                                                            <p className="text-sm text-gray-500">Get notified about your order status</p>
                                                        </div>
                                                    </label>
                                                    <label className="flex items-center gap-4 cursor-pointer group">
                                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Promotions & Offers</p>
                                                            <p className="text-sm text-gray-500">Receive exclusive deals and discounts</p>
                                                        </div>
                                                    </label>
                                                    <label className="flex items-center gap-4 cursor-pointer group">
                                                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Newsletter</p>
                                                            <p className="text-sm text-gray-500">Weekly updates on new arrivals</p>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Danger Zone */}
                                            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
                                                <label className="block text-lg font-semibold text-red-600 mb-3">
                                                    ⚠️ Danger Zone
                                                </label>
                                                <p className="text-gray-600 mb-4">Once you delete your account, there is no going back</p>
                                                <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg font-semibold">
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
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