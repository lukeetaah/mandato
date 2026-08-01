import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Card = ({ children, className = '', variant = 'glass', title, subtitle, action, }) => {
    const variantStyle = variant === 'gold'
        ? 'glass-panel-gold'
        : variant === 'solid'
            ? 'bg-slate-900 border border-slate-800'
            : 'glass-panel';
    return (_jsxs("div", { className: `rounded-xl p-5 ${variantStyle} ${className}`, children: [(title || action) && (_jsxs("div", { className: "flex items-center justify-between mb-4 border-b border-slate-800 pb-3", children: [_jsxs("div", { children: [title && _jsx("h3", { className: "text-lg font-bold text-slate-100", children: title }), subtitle && _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: subtitle })] }), action && _jsx("div", { children: action })] })), children] }));
};
