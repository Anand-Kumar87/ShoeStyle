'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavPill {
  label: string;
  href: string;
  count?: number;
}

interface NavPillsProps {
  items: NavPill[];
  className?: string;
}

const NavPills: React.FC<NavPillsProps> = ({ items, className = '' }) => {
  const router = useRouter();

  return (
    <nav className={`flex gap-2 ${className}`}>
      {items.map((item) => {
        const isActive = router.pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              rounded-full px-4 py-2 text-sm font-medium transition-all
              ${
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }
            `}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavPills;