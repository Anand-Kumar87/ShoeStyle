'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
}

interface SizeRow {
  uk: string;
  usMen: string;
  usWomen: string;
  eu: string;
  cm: string;
  inches: string;
}

const SIZE_DATA: SizeRow[] = [
  { uk: '5', usMen: '5.5', usWomen: '7', eu: '38.5', cm: '24.0', inches: '9.4' },
  { uk: '5.5', usMen: '6', usWomen: '7.5', eu: '39', cm: '24.5', inches: '9.6' },
  { uk: '6', usMen: '6.5', usWomen: '8', eu: '40', cm: '25.0', inches: '9.8' },
  { uk: '6.5', usMen: '7', usWomen: '8.5', eu: '40.5', cm: '25.5', inches: '10.0' },
  { uk: '7', usMen: '7.5', usWomen: '9', eu: '41', cm: '26.0', inches: '10.2' },
  { uk: '7.5', usMen: '8', usWomen: '9.5', eu: '42', cm: '26.5', inches: '10.4' },
  { uk: '8', usMen: '8.5', usWomen: '10', eu: '42.5', cm: '27.0', inches: '10.6' },
  { uk: '8.5', usMen: '9', usWomen: '10.5', eu: '43', cm: '27.5', inches: '10.8' },
  { uk: '9', usMen: '9.5', usWomen: '11', eu: '44', cm: '28.0', inches: '11.0' },
  { uk: '9.5', usMen: '10', usWomen: '11.5', eu: '44.5', cm: '28.5', inches: '11.2' },
  { uk: '10', usMen: '10.5', usWomen: '12', eu: '45', cm: '29.0', inches: '11.4' },
  { uk: '10.5', usMen: '11', usWomen: '12.5', eu: '45.5', cm: '29.5', inches: '11.6' },
  { uk: '11', usMen: '11.5', usWomen: '13', eu: '46', cm: '30.0', inches: '11.8' },
  { uk: '12', usMen: '12.5', usWomen: '14', eu: '47.5', cm: '31.0', inches: '12.2' },
];

export default function SizeGuideModal({
  isOpen,
  onClose,
  selectedSize,
  onSelectSize,
}: SizeGuideModalProps) {
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('men');
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-neutral-100 overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                <Ruler size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-neutral-900 uppercase">
                    Shoe Size & Fit Guide
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-lime-100 text-lime-800 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={10} /> 100% Fit Guarantee
                  </span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">
                  Standard UK Footwear Sizing with global conversions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-black hover:border-black flex items-center justify-center transition-all shadow-sm cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Controls: Gender & Unit Switchers */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 bg-white flex flex-wrap items-center justify-between gap-3">
            {/* Gender Switcher */}
            <div className="flex bg-neutral-100 p-1 rounded-2xl">
              <button
                onClick={() => setGender('men')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  gender === 'men'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Men&apos;s
              </button>
              <button
                onClick={() => setGender('women')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  gender === 'women'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Women&apos;s
              </button>
              <button
                onClick={() => setGender('unisex')}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  gender === 'unisex'
                    ? 'bg-black text-white shadow-md'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Unisex
              </button>
            </div>

            {/* Units Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Unit:
              </span>
              <div className="flex bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    unit === 'cm'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  CM
                </button>
                <button
                  onClick={() => setUnit('inches')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    unit === 'inches'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  IN
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-6">
            {/* Conversion Table */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-neutral-900 text-white font-black uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">UK (Selected)</th>
                    <th className="py-3 px-4">
                      {gender === 'women' ? 'US Women' : 'US Men'}
                    </th>
                    <th className="py-3 px-4">EU</th>
                    <th className="py-3 px-4 text-right">
                      Foot Length ({unit.toUpperCase()})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {SIZE_DATA.map((row) => {
                    const isRowSelected = selectedSize === row.uk;
                    const usSize = gender === 'women' ? row.usWomen : row.usMen;
                    const lengthVal = unit === 'cm' ? `${row.cm} cm` : `${row.inches} in`;

                    return (
                      <tr
                        key={row.uk}
                        onClick={() => {
                          if (onSelectSize) onSelectSize(row.uk);
                          onClose();
                        }}
                        className={`transition-colors cursor-pointer ${
                          isRowSelected
                            ? 'bg-neutral-900 text-white font-black'
                            : 'hover:bg-neutral-50 text-neutral-800'
                        }`}
                      >
                        <td className="py-3 px-4 font-black flex items-center gap-2">
                          <span>{row.uk}</span>
                          {isRowSelected && (
                            <span className="w-4 h-4 rounded-full bg-lime-400 text-black flex items-center justify-center text-[9px]">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold">{usSize}</td>
                        <td className="py-3 px-4 font-semibold">{row.eu}</td>
                        <td className="py-3 px-4 text-right font-bold text-neutral-600 group-hover:text-black">
                          <span
                            className={`${
                              isRowSelected ? 'text-lime-300' : 'text-neutral-700'
                            }`}
                          >
                            {lengthVal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 3-Step Foot Measurement Guide */}
            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80">
              <div className="flex items-center gap-2 mb-3">
                <Ruler size={16} className="text-black" />
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  How to Measure for Perfect Fit
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black inline-flex items-center justify-center mb-1.5">
                    1
                  </span>
                  <p className="font-bold text-neutral-900 mb-0.5">Heel to Wall</p>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Stand upright on a firm surface with your heel against the wall.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black inline-flex items-center justify-center mb-1.5">
                    2
                  </span>
                  <p className="font-bold text-neutral-900 mb-0.5">Measure Length</p>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Use a ruler to measure the distance from the wall to your longest toe.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black inline-flex items-center justify-center mb-1.5">
                    3
                  </span>
                  <p className="font-bold text-neutral-900 mb-0.5">Find Your Size</p>
                  <p className="text-neutral-500 text-[11px] leading-relaxed">
                    Match your length above. If between sizes or wide foot, size up by 0.5.
                  </p>
                </div>
              </div>
            </div>

            {/* Fit Advice & Exchange Assurance */}
            <div className="flex items-center justify-between p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0" />
                <div>
                  <p className="font-black text-emerald-900">7-Day Complimentary Size Exchange</p>
                  <p className="text-emerald-700 text-[11px]">
                    If the size isn&apos;t quite right, we will exchange it for free.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
