'use client';

import React, { useState } from 'react';
import SizeFilter from './SizeFilter';
import PriceFilter from './PriceFilter';

interface FilterPanelProps {
  onFiltersChange?: (filters: FilterState) => void;
}

export interface FilterState {
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange }) => {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });

  // Available sizes (you can fetch this from your API)
  const availableSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];

  const handleSizeChange = (sizes: string[]) => {
    setSelectedSizes(sizes);
    onFiltersChange?.({
      sizes,
      priceRange,
    });
  };

  const handlePriceChange = (range: { min: number; max: number }) => {
    setPriceRange(range);
    onFiltersChange?.({
      sizes: selectedSizes,
      priceRange: range,
    });
  };

  const handleClearAll = () => {
    setSelectedSizes([]);
    setPriceRange({ min: 0, max: 500 });
    onFiltersChange?.({
      sizes: [],
      priceRange: { min: 0, max: 500 },
    });
  };

  const hasActiveFilters = selectedSizes.length > 0 || priceRange.min > 0 || priceRange.max < 500;

  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-4">
        <h2 className="text-lg font-bold text-neutral-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-0">
        <PriceFilter
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
          minPrice={0}
          maxPrice={500}
          currency="$"
        />

        <SizeFilter
          selectedSizes={selectedSizes}
          onSizeChange={handleSizeChange}
          availableSizes={availableSizes}
        />
      </div>
    </div>
  );
};

export default FilterPanel;