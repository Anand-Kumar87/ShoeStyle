import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 Premium Icons
import { ArrowLeft, Mail, KeyRound, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success('Reset link sent to your email');
      } else {
        toast.error('Failed to send reset link');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - ShoeStyle Premium</title>
      </Head>

      {/* 🔥 Ultra Premium Light Theme Background */}
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-gray-900 selection:text-white">

        {/* Background Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] pointer-events-none" />

        {/* Logo/Brand Area (Optional but adds premium feel) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative z-10 flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <ShieldCheck size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-gray-900">ShoeStyle.</span>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px] relative z-10"
        >
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-gray-100 p-10 md:p-12 overflow-hidden relative">

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-900 shadow-sm border border-gray-100">
                      <KeyRound size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-500 font-medium">
                      Enter your email and we'll send you a secure link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Mail className="text-gray-400" size={20} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="hello@shoestyle.com"
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent text-gray-900 text-lg rounded-2xl focus:border-gray-900 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 flex justify-center items-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>Send Reset Link <ArrowRight size={20} /></>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">Check your inbox</h3>
                  <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                    We've sent a secure password reset link to <br />
                    <strong className="text-gray-900">{email}</strong>
                  </p>

                  <div className="p-4 bg-gray-50 rounded-2xl mb-8">
                    <p className="text-sm text-gray-500">
                      Didn't receive the email? Check your spam folder or try another email address.
                    </p>
                  </div>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors border-b border-gray-300 hover:border-gray-900 pb-1"
                  >
                    Try another email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Premium Footer Link */}
          <div className="text-center mt-8">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-all hover:-translate-x-1 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>

        </motion.div>

        {/* Support Help Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 text-center"
        >
          <p className="text-sm font-medium text-gray-400">
            Having trouble? Contact <a href="/contact" className="text-gray-900 font-bold hover:underline">support@shoestyle.com</a>
          </p>
        </motion.div>

      </div>
    </>
  );
}