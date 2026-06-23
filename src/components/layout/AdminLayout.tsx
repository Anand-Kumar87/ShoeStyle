import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Box, ShoppingCart, Users, Tag, BarChart2, LogOut, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react'; // import icon

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session } = useSession();

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Box },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Coupons', href: '/admin/coupons', icon: Tag },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
        { name: 'Settings', href: '/admin/settings', icon: Settings }, // Add settings link
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

            {/* 🚀 FIXED SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col hidden lg:flex flex-shrink-0">

                {/* Logo Section */}
                <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm group-hover:bg-blue-700 transition-colors">
                            S
                        </div>
                        <span className="font-black tracking-tighter text-slate-900 text-lg">SHOESTYLE <span className="text-slate-300 font-medium ml-1">↗</span></span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 py-8 px-4 overflow-y-auto space-y-1.5 scrollbar-hide">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Menu</p>

                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);

                        return (
                            <Link key={item.name} href={item.href}>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 relative ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"
                                        />
                                    )}
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom User Profile Section */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">
                            {session?.user?.name ? session.user.name[0].toUpperCase() : 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{session?.user?.name || 'Admin'}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate">{session?.user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
                            <Moon size={18} />
                        </button>
                        <button onClick={() => signOut({ callbackUrl: '/' })} className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 flex items-center gap-2 text-xs font-bold">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* 🚀 MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto w-full relative">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center px-4 justify-between sticky top-0 z-50">
                    <div className="font-black tracking-tighter text-slate-900">SHOESTYLE</div>
                    {/* Mobile menu button can be added here if needed */}
                </div>

                {children}
            </main>

        </div>
    );
}