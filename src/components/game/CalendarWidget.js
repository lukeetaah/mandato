import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from '@components/ui/Badge';
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
const SEASON_EMOJIS = {
    'Verano': '☀️',
    'Otoño': '🍂',
    'Invierno': '❄️',
    'Primavera': '🌸',
};
export const CalendarWidget = ({ calendar }) => {
    const monthName = MONTH_NAMES[calendar.month - 1] ?? 'Enero';
    const seasonEmoji = SEASON_EMOJIS[calendar.season] ?? '📅';
    const legVariant = calendar.turnsUntilLegislative <= 3 ? 'rose' : calendar.turnsUntilLegislative <= 6 ? 'gold' : 'sky';
    const presVariant = calendar.turnsUntilPresidential <= 6 ? 'rose' : calendar.turnsUntilPresidential <= 12 ? 'gold' : 'slate';
    return (_jsxs("div", { className: "flex flex-wrap items-center gap-3 glass-panel px-4 py-2.5 rounded-xl text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-base", children: seasonEmoji }), _jsxs("span", { className: "font-bold text-slate-100 text-sm", children: [monthName, " ", calendar.year] }), _jsxs("span", { className: "text-slate-500", children: ["(", calendar.season, ")"] })] }), _jsx("div", { className: "h-4 w-px bg-slate-800" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-slate-400", children: "\uD83D\uDDF3\uFE0F Legislativas:" }), _jsx(Badge, { variant: legVariant, children: calendar.turnsUntilLegislative === 0 ? '¡HOY!' : `${calendar.turnsUntilLegislative} meses` })] }), _jsx("div", { className: "h-4 w-px bg-slate-800" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-slate-400", children: "\uD83C\uDFDB\uFE0F Presidenciales:" }), _jsx(Badge, { variant: presVariant, children: calendar.turnsUntilPresidential === 0 ? '¡HOY!' : `${calendar.turnsUntilPresidential} meses` })] })] }));
};
