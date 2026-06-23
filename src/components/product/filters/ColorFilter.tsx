'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const COLORS = [
  { name: 'Black', hex: '#0a0a0a' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Yellow', hex: '#f59e0b' },
  { name: 'Gray', hex: '#6b7280' }
];

export default function ColorFilter({ selectedColor, onChange }: any) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-900">
        Colors
      </h3>

      {/* Color Grid */}
      <div className="flex flex-wrap gap-3">
        {COLORS.map((color) => {
          const isSelected = selectedColor === color.name;
          
          return (
            <button
              key={color.name}
              onClick={() => onChange(isSelected ? '' : color.name)}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none shadow-sm ${
                isSelected ? 'ring-2 ring-offset-2 ring-gray-900' : 'ring-1 ring-gray-200'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Check
                    size={16}
                    className={
                      color.name === 'White' || color.name === 'Yellow'
                        ? 'text-gray-900'
                        : 'text-white'
                    }
                    strokeWidth={3}
                  />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
