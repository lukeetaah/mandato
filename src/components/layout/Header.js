import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '@stores/game-store';
import { CAREER_LABELS } from '@engine/constants';
import { Badge } from '@components/ui/Badge';
const MONTH_NAMES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];
export const Header = () => {
    const gameState = useGameStore((s) => s.gameState);
    if (!gameState)
        return null;
    const { character, turn, calendar } = gameState;
    const monthName = MONTH_NAMES[(calendar.month ?? 1) - 1] ?? 'Ene';
    return (_jsxs("header", { className: "h-14 glass-panel border-b border-slate-800 px-6 flex items-center justify-between z-20", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("h1", { className: "text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-sky-200", children: "MI MANDATO" }), _jsxs("div", { className: "hidden sm:flex items-center gap-2 text-xs", children: [_jsxs(Badge, { variant: "slate", children: ["\uD83D\uDCC5 ", monthName, " ", calendar.year] }), _jsx(Badge, { variant: "gold", children: calendar.season }), _jsxs("span", { className: "text-slate-500", children: ["Turno ", turn] })] })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs", children: [_jsxs("div", { className: "hidden md:flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-slate-100", children: [character.name, " ", character.surname] }), _jsx(Badge, { variant: "sky", children: CAREER_LABELS[character.career] })] }), _jsxs("div", { className: "flex items-center gap-3 font-semibold", children: [_jsxs("span", { className: `${character.health < 40 ? 'text-rose-400 animate-pulse' : 'text-rose-300'}`, children: ["\u2764\uFE0F ", Math.round(character.health)] }), _jsxs("span", { className: `${character.stress > 70 ? 'text-amber-400 animate-pulse' : 'text-amber-300'}`, children: ["\u26A1 ", Math.round(character.stress)] }), _jsxs("span", { className: `${character.popularity < 30 ? 'text-emerald-400 animate-pulse' : 'text-emerald-300'}`, children: ["\u2B50 ", Math.round(character.popularity)] })] })] })] }));
};
