'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalCurrency } from '@/context/CurrencyContext';

const CURRENCIES = [
    { code: 'INR', symbol: '₹', country: 'in', label: 'India' },
    { code: 'USD', symbol: '$', country: 'us', label: 'United States' },
    { code: 'EUR', symbol: '€', country: 'eu', label: 'European Union' },
    { code: 'GBP', symbol: '£', country: 'gb', label: 'United Kingdom' },
    { code: 'CAD', symbol: 'C$', country: 'ca', label: 'Canada' },
    { code: 'AUD', symbol: 'A$', country: 'au', label: 'Australia' },
];

const FlagIcon = ({ country, alt }: { country: string; alt: string }) => (
    <span className="inline-flex items-center justify-center w-5 h-3.5 rounded-[3px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.15)] border border-slate-200/80 flex-shrink-0 bg-slate-100">
        <img
            src={`https://flagcdn.com/w40/${country}.png`}
            srcSet={`https://flagcdn.com/w80/${country}.png 2x`}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
        />
    </span>
);

export default function CurrencySwitcher() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { currency, changeCurrency } = useGlobalCurrency();

    // Do not show floating currency switcher on checkout pages to avoid duplication & overlapping inputs
    if (router.pathname.startsWith('/checkout')) {
        return null;
    }

    const activeCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

    // Close on outside click or tap
    React.useEffect(() => {
        function handleOutsideClick(event: MouseEvent | TouchEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsHovered(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('touchstart', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [isOpen]);

    const isExpanded = isHovered || isOpen;

    return (
        <div 
            ref={containerRef} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed left-0 top-24 sm:top-1/3 z-40 flex flex-col items-start select-none"
        >
            {/* Active Button - Default Compact Flag + Symbol, expands on hover / tap */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(prev => !prev);
                }}
                className={`flex items-center gap-1.5 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.12)] rounded-r-2xl border border-l-0 border-slate-200 hover:bg-slate-50 transition-all duration-300 cursor-pointer active:scale-95 py-2 ${
                    isExpanded ? 'px-3 sm:px-3.5' : 'px-2.5'
                }`}
                aria-label="Select Currency"
                aria-expanded={isOpen}
            >
                <FlagIcon country={activeCurrency.country} alt={activeCurrency.label} />
                <span className="text-xs font-black text-slate-800">
                    {activeCurrency.symbol}
                </span>

                {/* Expanded text on hover or tap */}
                <div
                    className={`overflow-hidden transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                        isExpanded ? 'max-w-[120px] opacity-100 ml-1' : 'max-w-0 opacity-0'
                    }`}
                >
                    <span className="text-xs font-black text-blue-600 tracking-wider">
                        {activeCurrency.code}
                    </span>
                    <span className="text-[9px] text-slate-400 font-black">
                        ▼
                    </span>
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 bg-white shadow-[0_12px_45px_rgba(0,0,0,0.18)] rounded-r-2xl rounded-b-2xl border border-l-0 border-slate-200 py-2.5 overflow-hidden min-w-[140px] z-50"
                    >
                        <div className="px-3.5 pb-1.5 mb-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Select Currency
                        </div>
                        {CURRENCIES.map((curr) => (
                            <button
                                key={curr.code}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    changeCurrency(curr.code);
                                    setIsOpen(false);
                                    setIsHovered(false);
                                }}
                                className={`flex items-center justify-between w-full gap-3 px-3.5 py-2.5 hover:bg-blue-50/70 transition-colors cursor-pointer text-left ${
                                    currency === curr.code ? 'bg-blue-50/90 font-black' : ''
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <FlagIcon country={curr.country} alt={curr.label} />
                                    <span className={`text-xs font-bold tracking-wider ${
                                        currency === curr.code ? 'text-blue-600' : 'text-slate-700'
                                    }`}>
                                        {curr.code} ({curr.symbol})
                                    </span>
                                </div>
                                {currency === curr.code && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}