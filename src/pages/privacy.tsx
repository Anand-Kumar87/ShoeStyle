import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { ShieldCheck, Lock, Cookie, Eye, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <Layout>
      <Head>
        <title>Privacy & Cookie Policy — ShoeStyle Luxury</title>
        <meta
          name="description"
          content="Review ShoeStyle's comprehensive Privacy, Security, and Cookie Policy. Compliant with international data protection and India DPDP standards."
        />
      </Head>

      <div className="min-h-screen bg-[#FBFBFB] text-slate-900 pb-24 font-['Inter',sans-serif]">
        
        {/* Hero Header */}
        <section className="bg-slate-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Store
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black uppercase tracking-wider mb-4 border border-white/10">
              <ShieldCheck size={14} /> Trust & Transparency
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
              Privacy, Security & Cookie Policy
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              At ShoeStyle, protecting your personal data and upholding the highest standards of confidentiality is integral to our luxury customer service.
            </p>
            <p className="text-xs text-slate-400 mt-4 font-semibold">
              Effective Date: September 2026 • Compliant with DPDP Act 2023 & International Privacy Standards
            </p>
          </div>
        </section>

        {/* Content Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-10">

            {/* 1. Overview */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 text-slate-950 font-black text-lg sm:text-xl">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                  <FileText size={18} />
                </div>
                <h2>1. Commitment to Data Integrity</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                This Privacy Policy explains how ShoeStyle (“we”, “our”, or “us”) collects, protects, uses, and respects personal information obtained when you browse our boutique, create private accounts, interact with customer care, or acquire products through our digital storefront.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* 2. Cookie Policy */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-950 font-black text-lg sm:text-xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Cookie size={18} />
                </div>
                <h2>2. Cookie & Local Storage Architecture</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We use strictly necessary and performance-focused cookies and browser storage mechanisms to provide seamless luxury shopping:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Essential Session Cookies
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Maintains secure encrypted customer sessions via NextAuth.js tokens, ensuring private client accounts and orders remain tamper-proof.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Shopping Bag Persistence
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Stores chosen footwear selections, sizes, and colors locally so your bag remains intact if you switch tabs or revisit later.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Currency & Geo Preferences
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Remembers your preferred currency (e.g. INR, USD, EUR) to display exact real-time prices without recalculation lag.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Consent Preferences
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Safeguards your selection from our Cookie Notice so you are never prompted repeatedly.
                  </p>
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* 3. Payment Processing & Razorpay */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 text-slate-950 font-black text-lg sm:text-xl">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <h2>3. Payment Security & Gateway Standards</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                All digital transactions on ShoeStyle are handled via **Razorpay**, a certified PCI-DSS Level 1 compliant financial processing infrastructure.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside leading-relaxed">
                <li>ShoeStyle **never sees, transmits, or stores** complete debit/credit card numbers or CVV codes.</li>
                <li>Online transactions leverage automated, server-to-server cryptographically signed webhooks with HMAC SHA-256 verification.</li>
                <li>Your financial credentials never touch our internal application servers.</li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* 4. Your Rights */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 text-slate-950 font-black text-lg sm:text-xl">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Eye size={18} />
                </div>
                <h2>4. Your Privacy Rights</h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Under the Indian Digital Personal Data Protection (DPDP) Act 2023 and global privacy frameworks:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 list-disc list-inside">
                <li>You can access, modify, or delete your saved shipping addresses directly from your Account Dashboard.</li>
                <li>You can request complete account erasure by contacting privacy support.</li>
                <li>You have the right to revoke non-essential cookie consents at any time by clearing your browser cache.</li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* 5. Contact */}
            <section className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs sm:text-sm text-slate-700">
              <h3 className="font-black text-slate-950 text-sm uppercase tracking-wider">
                Privacy Concierge & Data Officer
              </h3>
              <p>
                If you have questions regarding this policy or wish to exercise data rights, please reach our concierge at:
              </p>
              <p className="font-bold text-slate-900">
                Email: <a href="mailto:support@shoestyle.com" className="text-blue-600 underline">support@shoestyle.com</a> • Gonda, Uttar Pradesh, India
              </p>
            </section>

          </div>
        </main>
      </div>
    </Layout>
  );
}
