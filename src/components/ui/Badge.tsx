import React from 'react';
import { useUIStore } from '@stores/ui-store';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sky' | 'gold' | 'rose' | 'emerald' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'sky', size = 'sm' }) => {
  const isLight = useUIStore((s) => s.theme === 'light');

  const variantStyles = isLight
    ? {
        sky: 'bg-sky-100 text-sky-900 border-sky-300',
        gold: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
        rose: 'bg-rose-100 text-rose-900 border-rose-300',
        emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        slate: 'bg-slate-200 text-slate-800 border-slate-300',
      }
    : {
        sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        gold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        slate: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
      };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};

