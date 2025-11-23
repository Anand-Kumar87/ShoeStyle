'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SizeOption {
  value: string;
  label: string;
  available?: boolean;
}

interface SizeFilterProps {
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
  availableSizes?: string[];
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

// Common shoe sizes - US sizing
const US_SIZES: SizeOption[] = [
  { value: '6', label: 'US 6' },
  { value: '6.5', label: 'US 6.5' },
  { value: '7', label: 'US 7' },
  { value: '7.5', label: 'US 7.5' },
  { value: '8', label: 'US 8' },
  { value: '8.5', label: 'US 8.5' },
  { value: '9', label: 'US 9' },
  { value: '9.5', label: 'US 9.5' },
  { value: '10', label: 'US 10' },
  { value: '10.5', label: 'US 10.5' },
  { value: '11', label: 'US 11' },
  { value: '11.5', label: 'US 11.5' },
  { value: '12', label: 'US 12' },
  { value: '12.5', label: 'US 12.5' },
  { value: '13', label: 'US 13' },
];

const SizeFilter: React.FC<SizeFilterProps> = ({
  selectedSizes,
  onSizeChange,
  availableSizes,
  isCollapsible = true,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Determine which sizes are available
  const sizeOptions = US_SIZES.map((size) => ({
    ...size,
    available: availableSizes ? availableSizes.includes(size.value) : true,
  }));

  const handleSizeToggle = (sizeValue: string) => {
    if (selectedSizes.includes(sizeValue)) {
      // Remove size
      onSizeChange(selectedSizes.filter((s) => s !== sizeValue));
    } else {
      // Add size
      onSizeChange([...selectedSizes, sizeValue]);
    }
  };

  const handleClearAll = () => {
    onSizeChange([]);
  };

  const selectedCount = selectedSizes.length;

  return (
    <div className={`border-b border-neutral-200 ${className}`}>
      {/* Header */}
      <button
        onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
        className={`flex w-full items-center justify-between py-4 text-left ${
          isCollapsible ? 'cursor-pointer hover:text-neutral-600' : 'cursor-default'
        }`}
        aria-expanded={isExpanded}
        disabled={!isCollapsible}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-900">Size</h3>
          {selectedCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">
              {selectedCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="text-sm text-neutral-500 hover:text-neutral-900"
            >
              Clear
            </button>
          )}
          {isCollapsible &&
            (isExpanded ? (
              <ChevronUp className="h-5 w-5 text-neutral-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-500" />
            ))}
        </div>
      </button>

      {/* Size Grid */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              {/* Size Buttons Grid */}
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {sizeOptions.map((size) => {
                  const isSelected = selectedSizes.includes(size.value);
                  const isAvailable = size.available ?? true;

                  return (
                    <button
                      key={size.value}
                      onClick={() => isAvailable && handleSizeToggle(size.value)}
                      disabled={!isAvailable}
                      className={`
                        relative rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : isAvailable
                            ? 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-900'
                            : 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 line-through'
                        }
                      `}
                      aria-pressed={isSelected}
                      aria-label={`Size ${size.label}${!isAvailable ? ' (unavailable)' : ''}`}
                    >
                      {size.label.replace('US ', '')}
                    </button>
                  );
                })}
              </div>

              {/* Helper Text */}
              <p className="mt-3 text-xs text-neutral-500">
                {selectedCount > 0
                  ? `${selectedCount} size${selectedCount > 1 ? 's' : ''} selected`
                  : 'Select one or more sizes'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SizeFilter;