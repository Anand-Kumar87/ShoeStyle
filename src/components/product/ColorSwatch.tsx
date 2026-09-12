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
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
      {colors.map((color) => {
        const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
        const bgColor = colorMap[color.toLowerCase()] || color;
        const isLight = ['white', 'yellow', 'beige'].includes(color.toLowerCase());

        return (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`
              group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer
              ${isSelected ? 'bg-neutral-100 ring-1 ring-black/20 shadow-xs' : 'hover:bg-neutral-50'}
            `}
            aria-label={`Color ${color}`}
            aria-pressed={isSelected}
          >
            <div
              className={`
                relative h-8 w-8 rounded-full transition-transform duration-200 group-hover:scale-105 flex items-center justify-center
                ${isSelected ? 'ring-2 ring-black ring-offset-2 scale-110 shadow-sm' : 'border border-neutral-300 shadow-xs'}
              `}
              style={{ backgroundColor: bgColor }}
            >
              {isSelected && (
                <Check
                  className={`h-4 w-4 ${isLight ? 'text-neutral-900 stroke-[2.5]' : 'text-white stroke-[2.5]'}`}
                />
              )}
            </div>
            <span className={`text-[10px] font-bold capitalize truncate max-w-full tracking-tight ${
              isSelected ? 'text-black font-black' : 'text-neutral-500 group-hover:text-neutral-800'
            }`}>
              {color}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ColorSwatch;