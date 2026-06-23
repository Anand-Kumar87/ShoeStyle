import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
// 🔥 Premium Icons
import { MapPin, Phone, Clock, Navigation, PhoneCall, CheckCircle2, ArrowRight } from 'lucide-react';

const stores = [
  {
    id: 1,
    name: 'New York Flagship',
    address: '123 5th Avenue, Manhattan',
    city: 'New York, NY 10001',
    phone: '+1 (555) 123-4567',
    hours: 'Mon-Sat: 10AM-9PM, Sun: 11AM-7PM',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1000',
    features: ['Premium Collection', 'Personal Styling', 'VIP Lounge'],
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617548624103!2d-73.98785308459418!3d40.74844047932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1625680000000!5m2!1sen!2sus'
  },
  {
    id: 2,
    name: 'Los Angeles Boutique',
    address: '456 Rodeo Drive, Beverly Hills',
    city: 'Los Angeles, CA 90210',
    phone: '+1 (555) 234-5678',
    hours: 'Mon-Sun: 10AM-8PM',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000',
    features: ['Exclusive Drops', 'Customization Lab', 'Valet Parking'],
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3304.595701980315!2d-118.40321568478423!3d34.07982298059881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bc04ce7b2db1%3A0x6b802e3b2e56667!2sRodeo%20Dr%2C%20Beverly%20Hills%2C%20CA%2090210!5e0!3m2!1sen!2sus!4v1625680100000!5m2!1sen!2sus'
  },
  {
    id: 3,
    name: 'Chicago Hub',
    address: '789 Magnificent Mile',
    city: 'Chicago, IL 60611',
    phone: '+1 (555) 345-6789',
    hours: 'Mon-Sat: 9AM-10PM, Sun: 9AM-8PM',
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1000',
    features: ['Performance Gear', 'Running Track', 'Cafe'],
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.123456789012!2d-87.62456789012345!3d41.89012345678901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2cacb2abcdef%3A0x1234567890abcdef!2sMagnificent%20Mile%2C%20Chicago%2C%20IL!5e0!3m2!1sen!2sus!4v1625680200000!5m2!1sen!2sus'
  },
  {
    id: 4,
    name: 'Miami Heatwave',
    address: '321 Ocean Drive, South Beach',
    city: 'Miami, FL 33139',
    phone: '+1 (555) 456-7890',
    hours: 'Mon-Sun: 10AM-11PM',
    image: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&q=80&w=1000',
    features: ['Summer Collection', 'DJ Booth', 'Beach Ready'],
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3592.839818451877!2d-80.13328138497672!3d25.77610018362947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b48e3518e217%3A0x6b7722744ecbecc!2sOcean%20Dr%2C%20Miami%20Beach%2C%20FL!5e0!3m2!1sen!2sus!4v1625680300000!5m2!1sen!2sus'
  }
];

export default function Stores() {
  const [selectedCity, setSelectedCity] = useState('all');

  const cities = ['all', ...new Set(stores.map(s => s.city.split(',')[0]))];

  const filteredStores = selectedCity === 'all'
    ? stores
    : stores.filter(s => s.city.startsWith(selectedCity));

  // Dynamic Map based on the first store in the filtered list
  const activeMapUrl = filteredStores.length > 0 ? filteredStores[0].mapEmbed : stores[0].mapEmbed;

  return (
    <Layout>
      <Head>
        <title>Our Stores - Premium ShoeStyle Locations</title>
        <meta name="description" content="Visit our premium stores nationwide. Find your nearest ShoeStyle location." />
      </Head>

      <div className="min-h-screen bg-[#F4F7FB] pb-20">

        {/* 🔥 Premium Hero Section */}
        <section className="relative bg-gray-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=2000')] opacity-20 bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-red-500 font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Store Locator</span>
              <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Visit ShoeStyle.</h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 font-light max-w-2xl mx-auto">
                Step into our world. Experience the quality, fit, and style in person at our flagship locations.
              </p>

              <div className="flex flex-wrap gap-6 justify-center">
                <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 shadow-xl">
                  <div className="font-black text-4xl text-white mb-1">{stores.length}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Flagships</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 shadow-xl">
                  <div className="font-black text-4xl text-white mb-1">50+</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Retailers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 shadow-xl">
                  <div className="font-black text-4xl text-white mb-1">24/7</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Support</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🔥 Filter Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-20">
          <div className="flex flex-wrap gap-3 justify-center bg-white p-4 rounded-full shadow-lg border border-gray-100 max-w-fit mx-auto">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 ${selectedCity === city
                    ? 'bg-gray-900 text-white shadow-md scale-105'
                    : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                {city === 'all' ? 'All Locations' : city}
              </button>
            ))}
          </div>

          {/* 🔥 Stores Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mt-16">
            <AnimatePresence mode="popLayout">
              {filteredStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 group"
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 z-20 text-white pr-6">
                      <h3 className="text-3xl font-black mb-2 leading-tight">{store.name}</h3>
                      <p className="flex items-center gap-2 text-gray-200 font-medium">
                        <MapPin size={16} className="text-red-500" /> {store.city}
                      </p>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 text-gray-700">
                          <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-bold text-gray-900">{store.address}</p>
                            <p className="text-sm">{store.city}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Phone className="text-gray-400 flex-shrink-0" size={20} />
                          <p className="font-bold text-gray-900">{store.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-4 sm:border-l border-gray-100 sm:pl-6">
                        <div className="flex items-start gap-3 text-gray-700">
                          <Clock className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-relaxed">{store.hours.replace(', ', '\n')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Store Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {store.features.map((feature, i) => (
                          <span key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                            <CheckCircle2 size={14} className="text-green-500" /> {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 🔥 REAL WORKING BUTTONS */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(store.address + ', ' + store.city)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold transition-all hover:-translate-y-1 shadow-lg shadow-gray-900/20"
                      >
                        <Navigation size={18} /> Get Directions
                      </a>
                      <a
                        href={`tel:${store.phone.replace(/[^0-9+]/g, '')}`}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-900 hover:border-gray-900 hover:bg-gray-50 py-4 rounded-xl font-bold transition-all hover:-translate-y-1"
                      >
                        <PhoneCall size={18} /> Call Store
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* 🔥 DYNAMIC Interactive Map Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-4 md:p-8">
            <div className="flex items-center justify-between mb-8 px-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Explore Locations</h2>
                <p className="text-gray-500 mt-2 font-medium">Map view updates based on your selected city.</p>
              </div>
            </div>
            <div className="w-full h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner relative">
              {/* Dynamic Iframe */}
              <iframe
                src={activeMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>
          </div>
        </section>

        {/* 🔥 Premium CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-red-600 to-purple-700 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
            <h2 className="relative z-10 text-4xl md:text-5xl font-black mb-6">Too far from a store?</h2>
            <p className="relative z-10 text-xl mb-10 text-white/80 font-medium max-w-2xl mx-auto">
              Experience the same premium quality online. Fast delivery, easy returns, and exclusive web-only drops.
            </p>
            <Link href="/products" className="relative z-10 inline-flex items-center gap-2 bg-white text-gray-900 px-10 py-4 rounded-full font-black text-lg hover:bg-gray-100 hover:scale-105 transition-all shadow-xl">
              Shop Online Now <ArrowRight size={20} />
            </Link>
          </div>
        </section>

      </div>
    </Layout>
  );
}