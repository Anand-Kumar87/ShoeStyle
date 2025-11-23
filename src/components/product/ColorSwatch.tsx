'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface ColorSwatchProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const colorMap: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280',
  navy: '#1E3A8A',
  brown: '#92400E',
  beige: '#D4C5B9',
};

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  colors,
  selectedColor,
  onColorChange,
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color) => {
        const isSelected = selectedColor === color;
        const bgColor = colorMap[color.toLowerCase()] || color;

        return (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`
              relative h-10 w-10 rounded-full border-2 transition-all
              ${isSelected ? 'border-neutral-900 ring-2 ring-neutral-300 ring-offset-2' : 'border-neutral-300 hover:border-neutral-900'}
            `}
            style={{ backgroundColor: bgColor }}
            aria-label={`Color ${color}`}
            aria-pressed={isSelected}
          >
            {isSelected && (
              <Check
                className={`absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 ${
                  color.toLowerCase() === 'white' || color.toLowerCase() === 'yellow'
                    ? 'text-neutral-900'
                    : 'text-white'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ColorSwatch;