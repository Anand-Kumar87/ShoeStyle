import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { useEffect, useState, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/layout/AdminLayout';
import { Shield, User as UserIcon, Search, RefreshCw, Users as UsersIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface User { id: string; name: string | null; email: string; role: string; createdAt: string; }

const stagger = { animate: { transition: { staggerChildren: 0.04 } } };
const rowAnim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

// Premium Skeleton
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4].map(i => (
        <td key={i} className="px-6 py-5">
          <div className={`h-4 rounded-md animate-pulse bg-slate-200 ${i === 1 ? 'w-40' : i === 3 ? 'w-20 rounded-full' : 'w-full max-w-[150px]'
            }`} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      if (isRefresh) toast.success('Users list updated');
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Local Search Filter
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role && u.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  return (
    <AdminLayout>
      <div className="min-h-screen p-6 sm:p-10">
        <Head><title>Users Management | Admin</title></Head>

        <div className="max-w-7xl mx-auto space-y-8">

          {/* Premium Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">User Management</p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Registered Users</h1>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                />
              </div>
              <button
                onClick={() => load(true)}
                disabled={refreshing || loading}
                className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin text-blue-600' : ''} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['User', 'Email', 'Role', 'Joined Date'].map(h => (
                      <th key={h} className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody
                  variants={stagger}
                  initial="initial"
                  animate="animate"
                  className="divide-y divide-slate-100"
                >
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                          <UsersIcon size={28} className="text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-base font-medium">No users found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => {
                      const isAdmin = u.role?.toLowerCase() === 'admin';
                      return (
                        <motion.tr
                          key={u.id}
                          variants={rowAnim}
                          className="group hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-tr from-blue-100 to-indigo-50 border border-blue-200 text-blue-700 shadow-sm">
                                <span className="text-sm font-black leading-none select-none">
                                  {(u.name || u.email || 'U')[0].toUpperCase()}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900 text-[14px]">{u.name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-[14px] font-medium text-slate-500">
                            {u.email}
                          </td>
                          <td className="px-6 py-5">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${isAdmin
                              ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm shadow-purple-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm shadow-slate-100'
                              }`}>
                              {isAdmin ? (
                                <Shield size={14} className="text-purple-500" />
                              ) : (
                                <UserIcon size={14} className="text-slate-500" />
                              )}
                              <span className="uppercase tracking-wider">{u.role || 'USER'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-[13px] font-bold text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </motion.tr>
                      );
                    })
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

// Authentication Check
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session || session.user?.role !== 'admin') return { redirect: { destination: '/auth/signin', permanent: false } };
  return { props: {} };
};