import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export const Button = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
    const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
    const variantStyles = {
        primary: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-lg shadow-sky-500/20',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
        gold: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg shadow-amber-400/20',
        danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20',
        ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300',
    };
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };
    return (_jsx(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: `${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`, ...props, children: children }));
};
