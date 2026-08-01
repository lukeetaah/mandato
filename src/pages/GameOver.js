import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGameStore } from '@stores/game-store';
import { calculateLegacy } from '@engine/legacy';
import { Button } from '@components/ui/Button';
export const GameOver = ({ onRestart }) => {
    const gameState = useGameStore((s) => s.gameState);
    const resetGame = useGameStore((s) => s.resetGame);
    if (!gameState)
        return null;
    const legacy = calculateLegacy(gameState);
    const handleRestart = () => {
        resetGame();
        onRestart();
    };
    return (_jsx("div", { className: "min-h-screen bg-[#0a1628] flex items-center justify-center p-6", children: _jsxs("div", { className: "glass-panel p-8 rounded-2xl max-w-xl text-center border border-amber-500/30", children: [_jsx("h2", { className: "text-4xl font-extrabold text-amber-300 mb-2", children: "Fin del Mandato" }), _jsx("h3", { className: "text-xl font-bold text-slate-100 mb-4", children: legacy.title }), _jsxs("p", { className: "text-slate-300 italic mb-6", children: ["\u00AB", legacy.epitaph, "\u00BB"] }), _jsxs("div", { className: "text-xs text-slate-400 mb-8 p-4 rounded-lg bg-slate-900 border border-slate-800", children: ["Puntuaci\u00F3n de Legado: ", _jsxs("span", { className: "text-sky-400 font-bold text-sm", children: [Math.round(legacy.score), "/100"] })] }), _jsx(Button, { variant: "gold", size: "lg", onClick: handleRestart, children: "Iniciar Nueva Carrera Political \u2794" })] }) }));
};
