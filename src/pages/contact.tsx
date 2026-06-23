import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
// 🔥 Premium Icons
import {
  Facebook, Instagram, Twitter, Linkedin, MapPin,
  Phone, Mail, MessageCircle, Send, CheckCircle2, Headphones
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <Head>
        <title>Contact Us - ShoeStyle Premium</title>
        <meta name="description" content="Contact our customer support team. We're here to help!" />
      </Head>

      <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-20 selection:bg-teal-500 selection:text-white">

        {/* 🔥 Premium Minimalist Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden bg-white border-b border-gray-100">
          <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-teal-50 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full mb-8 shadow-sm text-sm font-bold text-teal-600 uppercase tracking-widest">
                <Headphones size={16} /> Customer Support
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gray-900">
                Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">Touch</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto">
                Have a question about your order or need styling advice? Our premium support team is here to help.
              </p>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Quick Contact Cards */}
        <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Phone size={28} />, title: 'Call Us', info: '+91 8726540277', subinfo: 'Mon-Fri, 9am to 6pm IST', bg: 'bg-blue-50', color: 'text-blue-600' },
              { icon: <Mail size={28} />, title: 'Email Us', info: 'solestyle41@gmail.com', subinfo: 'We reply within 24 hours', bg: 'bg-emerald-50', color: 'text-emerald-600' },
              { icon: <MessageCircle size={28} />, title: 'Live Chat', info: 'Chat with us now', subinfo: 'Available 24/7 for instant help', bg: 'bg-amber-50', color: 'text-amber-600', isChat: true }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                onClick={() => item.isChat && window.dispatchEvent(new Event('open-live-chat'))}
                className={`bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 text-center group ${item.isChat ? 'cursor-pointer' : ''}`}
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-xl mb-2 text-gray-900">{item.title}</h3>
                <p className="text-lg font-bold text-gray-700 mb-1">{item.info}</p>
                <p className="text-sm font-medium text-gray-500">{item.subinfo}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 🔥 Contact Form & Map Section */}
        <section className="max-w-7xl mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Left: Premium Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Send a Message</h2>
                <p className="text-gray-500 font-medium mb-10">Fill out the form below and we'll get back to you as soon as possible.</p>

                <AnimatePresence mode="wait">
                  {!submitted ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Full Name *</label>
                          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="w-full bg-gray-50 border-2 border-transparent text-gray-900 px-6 py-4 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Email Address *</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="w-full bg-gray-50 border-2 border-transparent text-gray-900 px-6 py-4 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all placeholder:text-gray-400" />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Phone Number</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" className="w-full bg-gray-50 border-2 border-transparent text-gray-900 px-6 py-4 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all placeholder:text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Subject *</label>
                          <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-gray-50 border-2 border-transparent text-gray-900 px-6 py-4 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all cursor-pointer">
                            <option value="" className="text-gray-400">Select a subject</option>
                            <option value="order">Order Inquiry</option>
                            <option value="product">Product Question</option>
                            <option value="return">Returns & Exchanges</option>
                            <option value="shipping">Shipping Information</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">Message *</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="How can we help you today?" className="w-full bg-gray-50 border-2 border-transparent text-gray-900 px-6 py-4 rounded-2xl focus:border-teal-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 resize-none" />
                      </div>

                      <button type="submit" disabled={isSubmitting} className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
                        {isSubmitting ? (
                          <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>Send Message <Send size={20} /></>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center py-12"
                    >
                      <div className="w-24 h-24 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={48} />
                      </div>
                      <h3 className="text-3xl font-black text-gray-900 mb-3">Message Sent!</h3>
                      <p className="text-gray-500 text-lg">Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right: Info & Map */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-8">

              {/* Headquarters Card */}
              <div className="bg-white p-10 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Headquarters</h3>
                </div>

                <div className="text-gray-600 font-medium leading-relaxed mb-8">
                  <p>D-95, 100 feeta Rd, Enclave Phase 2</p>
                  <p>Chattarpur</p>
                  <p>New Delhi, INDIA 110074</p>
                </div>

                {/* Sleek Map Container */}
                <div className="w-full h-64 bg-gray-100 rounded-3xl overflow-hidden shadow-inner border border-gray-200 relative group">
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none z-10" />
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14022.428456637372!2d77.16518175!3d28.52148115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1e1f7481179d%3A0xc02d33458626ebc8!2sChattarpur%2C%20New%20Delhi%2C%20Delhi%20110074!5e0!3m2!1sen!2sin!4v1718877140000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="ShoeStyle Headquarters Map"
                    className="relative z-0"
                  ></iframe>
                </div>
              </div>

              {/* Hours & Socials Flex */}
              <div className="grid sm:grid-cols-2 gap-8">
                {/* Business Hours */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                  <div className="absolute top-[-50%] right-[-20%] w-40 h-40 bg-teal-500/20 rounded-full blur-[40px]" />
                  <h3 className="text-xl font-black mb-6 relative z-10">Business Hours</h3>
                  <div className="space-y-4 relative z-10 text-sm font-medium text-gray-300">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span>Mon - Fri</span>
                      <span className="text-white font-bold">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span>Saturday</span>
                      <span className="text-white font-bold">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span>Sunday</span>
                      <span className="text-red-400 font-bold bg-red-400/10 px-3 py-1 rounded-lg">Closed</span>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-center items-center text-center">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Connect With Us</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                      <Facebook size={20} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-[#E4405F] hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                      <Instagram size={20} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                      <Twitter size={20} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center hover:bg-[#0A66C2] hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </section>

      </div>
    </Layout>
  );
}