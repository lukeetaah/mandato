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
      ? 'glass-panel-gold'
      : variant === 'solid'
      ? 'bg-slate-900 border border-slate-800'
      : 'glass-panel';

  return (
    <div className={`rounded-xl p-5 ${variantStyle} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
