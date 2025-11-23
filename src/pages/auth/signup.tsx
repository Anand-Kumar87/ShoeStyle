'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react';
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

  // Replace the handleSubmit function with this improved version:

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

{/* Error Message */}
{Object.keys(errors).length > 0 && (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4"
  >
    {Object.values(errors).map((error, index) => (
      <p key={index} className="text-sm text-red-300">{error}</p>
    ))}
  </motion.div>
)}

  const passwordStrength = validatePassword(formData.password);
  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    if (passwordStrength.isValid) return 100;
    return (formData.password.length / 8) * 100;
  };

  return (
    <>
      <Head>
        <title>Sign Up | ShoeStyle</title>
      </Head>

      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-0 h-72 w-72 animate-blob rounded-full bg-purple-600 opacity-20 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-2000 absolute -right-4 top-0 h-72 w-72 animate-blob rounded-full bg-yellow-600 opacity-20 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 animate-blob rounded-full bg-pink-600 opacity-20 mix-blend-multiply blur-xl filter"></div>
        </div>

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
              <h2 className="text-3xl font-bold text-white">Create Account</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Join ShoeStyle and start shopping
              </p>
            </div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Full Name</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-neutral-400 backdrop-blur-xl transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                </div>

                {/* Email Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Email Address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-neutral-400 backdrop-blur-xl transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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
                  {formData.password && (
                    <div className="mt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.isValid ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${getPasswordStrength()}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">
                        {passwordStrength.isValid ? '✓ Strong password' : 'Min 8 chars, uppercase, lowercase, number'}
                      </p>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Confirm Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-11 pr-12 text-white placeholder-neutral-400 backdrop-blur-xl transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>

                {/* Terms */}
                <label className="flex items-start">
                  <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500" />
                  <span className="ml-2 text-sm text-neutral-300">
                    I agree to the <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms</Link> and <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </form>

              {/* Benefits */}
              <div className="mt-6 space-y-2 rounded-xl bg-white/5 p-4">
                <p className="text-xs font-semibold text-white">What you'll get:</p>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Exclusive member discounts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Early access to sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Free shipping on first order</span>
                  </div>
                </div>
              </div>

              {/* Sign In Link */}
              <p className="mt-6 text-center text-sm text-neutral-400">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-semibold text-purple-400 hover:text-purple-300">
                  Sign in
                </Link>
              </p>
            </motion.div>

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