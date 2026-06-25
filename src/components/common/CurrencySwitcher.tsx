'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalCurrency } from '@/context/CurrencyContext';

const CURRENCIES = [
    { code: 'INR', symbol: '₹', flag: '🇮🇳' },
    { code: 'USD', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', symbol: '£', flag: '🇬🇧' },
    { code: 'CAD', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', symbol: 'A$', flag: '🇦🇺' },
];

export default function CurrencySwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const { currency, changeCurrency } = useGlobalCurrency();

    const activeCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

    return (
        <div className="fixed left-0 top-1/3 z-50 flex flex-col items-start" onMouseLeave={() => setIsOpen(false)}>
            {/* Active Button */}
            <button
                onMouseEnter={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-white px-3 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-r-2xl border border-l-0 border-slate-100 hover:bg-slate-50 transition-colors"
            >
                <span className="text-sm font-black text-blue-600 tracking-wider">
                    {activeCurrency.code}({activeCurrency.symbol})
                </span>
                <span className="text-xl leading-none">{activeCurrency.flag}</span>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-r-2xl border border-l-0 border-slate-100 py-2 overflow-hidden"
                    >
                        {CURRENCIES.map((curr) => (
                            <button
                                key={curr.code}
                                onClick={() => {
                                    changeCurrency(curr.code);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between w-full gap-4 px-4 py-2 hover:bg-slate-50 transition-colors ${currency === curr.code ? 'bg-blue-50/50' : ''
                                    }`}
                            >
                                <span className="text-2xl leading-none">{curr.flag}</span>
                                <span className={`text-xs font-bold tracking-widest ${currency === curr.code ? 'text-blue-600' : 'text-slate-600'}`}>
                                    {curr.code}
                                </span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}