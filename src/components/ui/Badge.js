import { jsx as _jsx } from "react/jsx-runtime";
export const Badge = ({ children, variant = 'sky', size = 'sm' }) => {
    const variantStyles = {
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
    return (_jsx("span", { className: `inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`, children: children }));
};
