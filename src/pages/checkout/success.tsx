import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Package, ShoppingBag, ArrowRight, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { orderId } = router.query;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 400, damping: 20, delay: 0.1 }
    }
  };

  return (
    <>
      <Head>
        <title>Order Successful | ShoeStyle Premium</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-slate-50 py-12 lg:py-24 relative overflow-hidden flex items-center justify-center">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-14 text-center relative overflow-hidden"
          >
            {/* Top Success Icon */}
            <motion.div variants={checkmarkVariants} className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse opacity-50"></div>
              <div className="absolute inset-2 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 shadow-sm">
                <Check className="h-10 w-10 text-emerald-500" strokeWidth={3} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Payment Successful!
              </h1>
              <p className="text-base font-medium text-slate-500 mb-10">
                Thank you for your purchase. We're getting your order ready to be shipped.
              </p>
            </motion.div>

            {/* Premium Receipt/Order Details Box */}
            <motion.div variants={itemVariants} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10 text-left relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-r border-slate-100"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full border-l border-slate-100"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4 border-dashed">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Order Reference</p>
                  <p className="text-lg font-bold text-slate-900 font-mono">#{orderId || 'ORD-WAITING...'}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="pt-4 flex items-start gap-3">
                <div className="mt-0.5 bg-blue-100 p-2 rounded-full text-blue-600 flex-shrink-0">
                  <Mail size={14} strokeWidth={2.5} />
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  We've sent a confirmation email to your registered email address with the complete order details and tracking information.
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/orders/${orderId}`} className="w-full sm:w-auto">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all"
                >
                  <Package size={18} /> View Order
                </motion.button>
              </Link>
              <Link href="/products" className="w-full sm:w-auto">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all"
                >
                  <ShoppingBag size={18} /> Continue Shopping
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Next Steps / Guarantees Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-center"
          >
            <div className="flex flex-col items-center max-w-[150px]">
              <div className="w-10 h-10 bg-slate-200/50 rounded-full flex items-center justify-center text-slate-500 mb-3">
                <Package size={18} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">Processing</h4>
              <p className="text-xs text-slate-500 font-medium">We are preparing your items for shipment.</p>
            </div>
            <ArrowRight size={20} className="text-slate-300 self-center hidden sm:block mt-[-20px]" />
            <div className="flex flex-col items-center max-w-[150px]">
              <div className="w-10 h-10 bg-slate-200/50 rounded-full flex items-center justify-center text-slate-500 mb-3">
                <Mail size={18} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-1">Shipping</h4>
              <p className="text-xs text-slate-500 font-medium">You'll receive an email with a tracking link.</p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}