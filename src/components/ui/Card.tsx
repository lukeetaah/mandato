import React from 'react';
import { useUIStore } from '@stores/ui-store';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'gold' | 'solid';
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'glass',
  title,
  subtitle,
  action,
}) => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const variantStyle =
    variant === 'gold'
      ? isLight
        ? 'bg-amber-50/90 border border-amber-300 shadow-sm'
        : 'bg-[#1E293B] border border-[#F59E0B]/40 shadow-lg shadow-[#F59E0B]/5'
      : variant === 'solid'
      ? isLight
        ? 'bg-slate-100 border border-slate-200'
        : 'bg-[#161B22] border border-[#30363D]'
      : isLight
      ? 'bg-white border border-slate-200/90 shadow-sm text-slate-900'
      : 'bg-[#1E293B] border border-[#334155] shadow-lg shadow-black/20 text-[#F8FAFC]';

  return (
    <div className={`rounded-2xl p-6 ${variantStyle} ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between mb-4 border-b pb-3 ${
          isLight ? 'border-slate-200' : 'border-[#334155]/60'
        }`}>
          <div>
            {title && <h3 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-[#F8FAFC]'}`}>{title}</h3>}
            {subtitle && <p className={`text-xs mt-0.5 font-medium ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
