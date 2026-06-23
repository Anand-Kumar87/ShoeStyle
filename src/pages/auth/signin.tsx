'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 Premium Icons
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Incorrect email or password. Please try again.');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - ShoeStyle Premium</title>
      </Head>

      {/* 🔥 Ultra-Clean Light Theme */}
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-orange-500 selection:text-white">

        {/* Subtle Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-orange-50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-6 md:top-8 md:left-8 z-20"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all hover:-translate-x-1 group text-sm">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Store
          </Link>
        </motion.div>

        {/* Main Card (Height Optimized) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[420px] relative z-10"
        >

          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-gray-100 p-8 md:p-10 relative overflow-hidden">

            {/* Header */}
            <div className="text-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Welcome Back</h1>
              <p className="text-gray-500 font-medium text-sm">
                Enter your credentials to access your account.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 font-bold text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Success Message (from Registration) */}
              {router.query.registered === 'true' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-5 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-600 font-bold text-center"
                >
                  ✓ Account created! Please sign in.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign In */}
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 transition-all flex justify-center items-center gap-3 mb-5 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <span className="relative bg-white px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Or use email</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hello@shoestyle.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent text-gray-900 text-sm rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Password</label>
                  <Link href="/auth/forgot-password" className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent text-gray-900 text-sm rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-black text-sm transition-all hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs font-medium text-gray-500 relative z-10">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-gray-900 font-bold hover:text-orange-500 transition-colors">
                Create one now
              </Link>
            </p>

          </div>
        </motion.div>

      </div>
    </>
  );
}