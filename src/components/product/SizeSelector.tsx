'use client';

import React from 'react';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  unavailableSizes?: string[];
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeChange,
  unavailableSizes = [],
}) => {
  // 🔥 NAYA FIX: Database se aane wale khali (empty) sizes ko hatane ke liye filter lagaya
  const validSizes = sizes.filter((size) => size && size.trim() !== '');

  // Agar galti se koi valid size na aaye, toh UI toote na
  if (validSizes.length === 0) {
    return <p className="text-sm text-neutral-400">One size fits all</p>;
  }

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
      {validSizes.map((size) => {
        const isSelected = selectedSize === size;
        const isUnavailable = unavailableSizes.includes(size);

        return (
          <button
            key={size}
            onClick={() => !isUnavailable && onSizeChange(size)}
            disabled={isUnavailable}
            className={`
              rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1
              ${isSelected
                ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                : isUnavailable
                  ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through'
                  : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50'
              }
            `}
            aria-pressed={isSelected}
            aria-label={`Size ${size}`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
};

export default SizeSelector;