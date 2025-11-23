'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PriceRange {
  min: number;
  max: number;
}

interface PriceFilterProps {
  priceRange: PriceRange;
  onPriceChange: (range: PriceRange) => void;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

const PriceFilter: React.FC<PriceFilterProps> = ({
  priceRange,
  onPriceChange,
  minPrice = 0,
  maxPrice = 500,
  currency = '$',
  isCollapsible = true,
  defaultExpanded = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [localMin, setLocalMin] = useState(priceRange.min);
  const [localMax, setLocalMax] = useState(priceRange.max);
  const [isDragging, setIsDragging] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalMin(priceRange.min);
    setLocalMax(priceRange.max);
  }, [priceRange]);

  // Debounced update to parent
  const updateParent = useCallback(() => {
    if (localMin !== priceRange.min || localMax !== priceRange.max) {
      onPriceChange({ min: localMin, max: localMax });
    }
  }, [localMin, localMax, priceRange, onPriceChange]);

  // Update parent when user stops dragging
  useEffect(() => {
    if (!isDragging) {
      const timer = setTimeout(updateParent, 300);
      return () => clearTimeout(timer);
    }
  }, [localMin, localMax, isDragging, updateParent]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, localMax - 10);
    setLocalMin(newMin);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, localMin + 10);
    setLocalMax(newMax);
  };

  const handleReset = () => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    onPriceChange({ min: minPrice, max: maxPrice });
  };

  const isFiltered = localMin !== minPrice || localMax !== maxPrice;

  // Calculate percentage for visual representation
  const minPercent = ((localMin - minPrice) / (maxPrice - minPrice)) * 100;
  const maxPercent = ((localMax - minPrice) / (maxPrice - minPrice)) * 100;

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
          <h3 className="font-semibold text-neutral-900">Price</h3>
          {isFiltered && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white">
              1
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
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

      {/* Price Range Content */}
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
              {/* Current Price Display */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500">Min</span>
                  <span className="text-lg font-semibold text-neutral-900">
                    {currency}{localMin}
                  </span>
                </div>
                <div className="text-neutral-400">—</div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-neutral-500">Max</span>
                  <span className="text-lg font-semibold text-neutral-900">
                    {currency}{localMax}
                  </span>
                </div>
              </div>

              {/* Dual Range Slider */}
              <div className="relative mb-8">
                {/* Track */}
                <div className="relative h-2 rounded-full bg-neutral-200">
                  {/* Active Range */}
                  <div
                    className="absolute h-full rounded-full bg-neutral-900"
                    style={{
                      left: `${minPercent}%`,
                      right: `${100 - maxPercent}%`,
                    }}
                  />
                </div>

                {/* Min Slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={localMin}
                  onChange={(e) => handleMinChange(Number(e.target.value))}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="range-slider range-slider-min"
                  aria-label="Minimum price"
                />

                {/* Max Slider */}
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={localMax}
                  onChange={(e) => handleMaxChange(Number(e.target.value))}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="range-slider range-slider-max"
                  aria-label="Maximum price"
                />
              </div>

              {/* Price Input Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="min-price" className="mb-1 block text-xs text-neutral-500">
                    Min Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                      {currency}
                    </span>
                    <input
                      id="min-price"
                      type="number"
                      min={minPrice}
                      max={localMax - 10}
                      value={localMin}
                      onChange={(e) => handleMinChange(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 py-2 pl-7 pr-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="max-price" className="mb-1 block text-xs text-neutral-500">
                    Max Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                      {currency}
                    </span>
                    <input
                      id="max-price"
                      type="number"
                      min={localMin + 10}
                      max={maxPrice}
                      value={localMax}
                      onChange={(e) => handleMaxChange(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 py-2 pl-7 pr-3 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Helper Text */}
              <p className="mt-3 text-xs text-neutral-500">
                {isFiltered
                  ? `Showing products from ${currency}${localMin} to ${currency}${localMax}`
                  : `All prices from ${currency}${minPrice} to ${currency}${maxPrice}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Range Slider Styles */}
      <style jsx>{`
        .range-slider {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 8px;
          pointer-events: none;
          -webkit-appearance: none;
          background: transparent;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #171717;
          cursor: pointer;
          pointer-events: all;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        .range-slider::-webkit-slider-thumb:active {
          transform: scale(1.15);
        }

        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #171717;
          cursor: pointer;
          pointer-events: all;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        .range-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
        }

        .range-slider::-moz-range-thumb:active {
          transform: scale(1.15);
        }

        .range-slider-max {
          top: 0;
        }

        .range-slider:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default PriceFilter;