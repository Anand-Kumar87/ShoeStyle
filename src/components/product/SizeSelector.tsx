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
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-7">
      {sizes.map((size) => {
        const isSelected = selectedSize === size;
        const isUnavailable = unavailableSizes.includes(size);

        return (
          <button
            key={size}
            onClick={() => !isUnavailable && onSizeChange(size)}
            disabled={isUnavailable}
            className={`
              rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all
              ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : isUnavailable
                  ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through'
                  : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900'
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