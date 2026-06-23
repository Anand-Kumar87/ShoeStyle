'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 Premium Icons matching SignIn
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email';

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('Attempting to create account...', { email: formData.email, name: formData.name });

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (response.ok) {
        // Success - redirect to sign in
        router.push('/auth/signin?registered=true');
      } else {
        // Show specific error from API
        setErrors({
          email: data.error || 'Failed to create account. Please try again.'
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({
        email: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = validatePassword(formData.password);
  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    if (passwordStrength.isValid) return 100;
    return (formData.password.length / 8) * 100;
  };

  return (
    <>
      <Head>
        <title>Create Account - ShoeStyle Premium</title>
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

        {/* Main Card (Height & Padding Optimized) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[440px] relative z-10 py-12"
        >
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-gray-100 p-8 md:px-10 relative overflow-hidden">

            {/* Header */}
            <div className="text-center mb-6 relative z-10">
              <div className="w-12 h-12 bg-gray-50 text-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                <Sparkles size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Create Account</h1>
              <p className="text-gray-500 font-medium text-sm">
                Join ShoeStyle and start shopping.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* Error Message */}
              {Object.keys(errors).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 overflow-hidden"
                >
                  {Object.values(errors).map((error, index) => (
                    <p key={index} className="text-sm font-bold text-red-600 text-center">{error}</p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent text-gray-900 text-sm rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent text-gray-900 text-sm rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent text-gray-900 text-sm rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* 🔥 Kept Password Strength Check */}
                {formData.password && (
                  <div className="mt-1">
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 mt-2">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.isValid ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}
                        style={{ width: `${getPasswordStrength()}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-bold text-gray-400">
                      {passwordStrength.isValid ? '✓ Strong password' : 'Min 8 chars, uppercase, lowercase, number'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-10 py-3 bg-gray-50 border-2 border-transparent text-gray-900 text-sm rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start pt-2">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer" />
                <span className="ml-2 text-xs font-medium text-gray-500">
                  I agree to the <Link href="/terms" className="text-gray-900 font-bold hover:text-orange-500">Terms</Link> and <Link href="/privacy" className="text-gray-900 font-bold hover:text-orange-500">Privacy Policy</Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-black text-sm transition-all hover:bg-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>Create Account <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* 🔥 Kept Benefits List */}
            <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">What you'll get</p>
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Exclusive member discounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Early access to sneaker drops</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Free shipping on your first order</span>
                </div>
              </div>
            </div>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-xs font-medium text-gray-500 relative z-10">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-gray-900 font-bold hover:text-orange-500 transition-colors">
                Sign in
              </Link>
            </p>

          </div>
        </motion.div>
      </div>
    </>
  );
}