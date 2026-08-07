import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md';

  const variantStyles = {
    primary: 'bg-[#3B82F6] hover:bg-[#2563EB] text-[#F8FAFC] font-extrabold shadow-blue-500/20',
    secondary: 'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-[#475569]',
    gold: 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0D1117] font-black shadow-amber-500/20',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-[#F8FAFC] font-extrabold shadow-red-500/20',
    ghost: 'bg-transparent hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC]',
  };

  const sizeStyles = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
