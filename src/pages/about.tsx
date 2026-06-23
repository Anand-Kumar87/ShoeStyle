import { motion } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
// 🔥 Premium Icons import kiye hain
import { ShieldCheck, HeartHandshake, Leaf, ArrowRight, Twitter, Linkedin, Instagram } from 'lucide-react';

// Animation Variants for staggering
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function About() {
  return (
    <Layout>
      <Head>
        <title>About Us - Premium Shoe Store</title>
        <meta name="description" content="Learn about our story, mission, and commitment to quality footwear" />
      </Head>

      <div className="min-h-screen bg-[#F8F9FA] overflow-hidden">

        {/* 🔥 Hero Section with Slow Zoom Effect & Real External Image */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Replaced local image with a premium Unsplash sneaker image */}
            <img
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=2000"
              alt="About Us Hero"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto mt-10"
          >
            <span className="text-sm font-black tracking-[0.3em] uppercase text-gray-300 mb-4 block">The Heritage</span>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight drop-shadow-lg">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl font-light text-gray-200">
              Crafting excellence and redefining urban footwear since 2010.
            </p>
          </motion.div>
        </section>

        {/* 🔥 Mission Section - Asymmetric Premium Layout */}
        <section className="max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-sm font-black tracking-[0.2em] text-red-600 uppercase mb-3">Our Mission</h2>
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                Step into <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600">Greatness.</span>
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that great shoes can transform not just your outfit, but your entire day.
                Our mission is to provide premium quality footwear that seamlessly combines innovative style, supreme comfort, and relentless durability.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-gray-900 pl-6 italic">
                "Every pair of shoes in our collection is carefully selected to meet our impossibly high standards of craftsmanship and design excellence."
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group"
            >
              {/* Replaced local image with a premium Unsplash sneaker image */}
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000"
                alt="Our Mission"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          </div>
        </section>

        {/* 🔥 Values Section - Glassmorphism Cards */}
        <section className="bg-gray-900 py-24 text-white relative overflow-hidden">
          {/* Background decorative blob */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-sm font-black tracking-[0.2em] text-gray-400 uppercase mb-3">Core Principles</h2>
              <h3 className="text-4xl md:text-5xl font-black">Our Values</h3>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                { title: 'Quality First', desc: 'We never compromise. Every product meets our rigorous standards for material and build.', icon: <ShieldCheck size={40} className="text-red-500" /> },
                { title: 'Customer Focused', desc: 'Your satisfaction is our priority. We go above and beyond to deliver an elite shopping experience.', icon: <HeartHandshake size={40} className="text-blue-500" /> },
                { title: 'Sustainability', desc: 'Committed to the future. We integrate eco-friendly materials and sustainable practices.', icon: <Leaf size={40} className="text-emerald-500" /> }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-colors group"
                >
                  <div className="mb-6 p-4 bg-white/5 rounded-2xl w-max group-hover:-translate-y-2 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 🔥 Team Section - Real Images & Hover Effects */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-sm font-black tracking-[0.2em] text-red-600 uppercase mb-3">The Minds Behind</h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900">Meet Our Team</h3>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { name: 'John Smith', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400' },
              { name: 'Sarah Johnson', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400' },
              { name: 'Mike Chen', role: 'Operations Manager', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400' },
              { name: 'Emily Davis', role: 'Customer Relations', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400' }
            ].map((member, index) => (
              <motion.div key={index} variants={fadeUp} className="group text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-xl border-4 border-white group-hover:border-red-50 transition-colors">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                  {/* Social Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <a href="#" className="p-2 bg-white/20 rounded-full hover:bg-white/40 text-white backdrop-blur-sm transition-colors"><Linkedin size={18} /></a>
                    <a href="#" className="p-2 bg-white/20 rounded-full hover:bg-white/40 text-white backdrop-blur-sm transition-colors"><Twitter size={18} /></a>
                  </div>
                </div>
                <h3 className="text-xl font-black text-gray-900">{member.name}</h3>
                <p className="text-red-600 font-semibold text-sm mt-1 uppercase tracking-wider">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 🔥 Stats Section - Number Counters Styling */}
        <section className="bg-white border-y border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center"
            >
              {[
                { number: '50K+', label: 'Happy Customers' },
                { number: '500+', label: 'Premium Models' },
                { number: '15+', label: 'Years Experience' },
                { number: '99%', label: 'Satisfaction Rate' }
              ].map((stat, index) => (
                <motion.div key={index} variants={fadeUp} className="p-6">
                  <div className="text-4xl md:text-6xl font-black text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 🔥 Custom CTA (Call To Action) */}
        <section className="py-24 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto bg-gray-900 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]" />
            <h2 className="relative z-10 text-3xl md:text-5xl font-black text-white mb-6">Ready to upgrade your style?</h2>
            <p className="relative z-10 text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Explore our latest collection and find the perfect pair that defines your journey.
            </p>
            <Link href="/products" className="relative z-10 inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Shop The Collection <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>

      </div>
    </Layout>
  );
}