'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | ShoeStyle</title>
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-0 h-72 w-72 animate-blob rounded-full bg-purple-600 opacity-20 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-2000 absolute -right-4 top-0 h-72 w-72 animate-blob rounded-full bg-yellow-600 opacity-20 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 animate-blob rounded-full bg-pink-600 opacity-20 mix-blend-multiply blur-xl filter"></div>
        </div>

        {/* Content */}
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Logo & Title */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Sign in to continue to ShoeStyle
              </p>
            </div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              {/* Success Message */}
              {router.query.registered === 'true' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-300"
                >
                  ✓ Account created successfully! Please sign in.
                </motion.div>
              )}

              {/* Google Sign In */}
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="group mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-neutral-900 transition-all hover:bg-neutral-100 hover:shadow-lg"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-transparent px-2 text-neutral-400">Or with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-neutral-400 backdrop-blur-xl transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-11 pr-12 text-white placeholder-neutral-400 backdrop-blur-xl transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500" />
                    <span className="ml-2 text-sm text-neutral-300">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                <p className="mb-2 text-xs font-semibold text-blue-300">Demo Credentials:</p>
                <div className="space-y-1 text-xs text-blue-200">
                  <p>👤 Admin: admin@shoestyle.com / admin123</p>
                  <p>👤 User: user@shoestyle.com / user123</p>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-sm text-neutral-400">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-semibold text-purple-400 hover:text-purple-300">
                  Sign up for free
                </Link>
              </p>
            </motion.div>

            {/* Back to Home */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <Link href="/" className="text-sm text-neutral-400 hover:text-white">
                ← Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}