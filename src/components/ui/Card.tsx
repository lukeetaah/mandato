import React from 'react';

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
  const variantStyle =
    variant === 'gold'
      ? 'bg-[#1E293B] border border-[#F59E0B]/40 shadow-lg shadow-[#F59E0B]/5'
      : variant === 'solid'
      ? 'bg-[#161B22] border border-[#30363D]'
      : 'bg-[#1E293B] border border-[#334155] shadow-lg shadow-black/20';

  return (
    <div className={`rounded-2xl p-6 ${variantStyle} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 border-b border-[#334155]/60 pb-3">
          <div>
            {title && <h3 className="text-lg font-bold text-[#F8FAFC] tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#94A3B8] mt-0.5 font-medium">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
