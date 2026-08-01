import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Badge } from '@components/ui/Badge';
const BIAS_CONFIG = {
    oficialista: { variant: 'emerald', label: 'OFICIALISTA' },
    opositor: { variant: 'rose', label: 'OPOSITOR' },
    sensacionalista: { variant: 'gold', label: 'AMARILLISTA' },
    satirico: { variant: 'sky', label: 'SATÍRICO' },
};
export const HeadlineBanner = ({ headlines }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    // Auto-rotate headlines every 6 seconds
    useEffect(() => {
        if (headlines.length <= 1)
            return;
        const interval = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % headlines.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [headlines.length]);
    // Reset when headlines change
    useEffect(() => {
        setActiveIdx(0);
    }, [headlines]);
    if (headlines.length === 0)
        return null;
    const headline = headlines[activeIdx] ?? headlines[0];
    const biasInfo = BIAS_CONFIG[headline.bias] ?? BIAS_CONFIG.sensacionalista;
    return (_jsxs("div", { className: "w-full glass-panel-gold p-4 rounded-xl border-l-4 border-l-amber-400 shadow-xl", children: [_jsxs("div", { className: "flex justify-between items-center text-xs mb-2", children: [_jsxs("span", { className: "font-black text-amber-300 tracking-wider flex items-center gap-2", children: ["\uD83D\uDDDE\uFE0F NOTICIAS DEL D\u00CDA", _jsx("span", { className: "text-slate-500", children: "\u2022" }), _jsx("span", { className: "text-slate-400 font-medium", children: headline.outletName })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: biasInfo.variant, children: biasInfo.label }), headlines.length > 1 && (_jsxs("span", { className: "text-slate-500 text-[10px]", children: [activeIdx + 1, "/", headlines.length] }))] })] }), _jsx("h3", { className: "text-base font-extrabold text-slate-100 tracking-tight leading-snug", children: headline.title }), _jsx("p", { className: "text-xs text-slate-400 mt-1 italic", children: headline.subhead }), headlines.length > 1 && (_jsx("div", { className: "flex gap-1.5 mt-3 justify-center", children: headlines.map((_, idx) => (_jsx("button", { onClick: () => setActiveIdx(idx), className: `w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${idx === activeIdx ? 'bg-amber-400 w-4' : 'bg-slate-700 hover:bg-slate-500'}` }, idx))) }))] }));
};
