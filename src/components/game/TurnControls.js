import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { Button } from '@components/ui/Button';
export const TurnControls = ({ onForceDecisionModal }) => {
    const nextTurn = useGameStore((s) => s.nextTurn);
    const pendingDecisionsCount = useGameStore((s) => s.gameState?.pendingDecisions.length ?? 0);
    const [showWarning, setShowWarning] = useState(false);
    const handleAdvanceClick = () => {
        if (pendingDecisionsCount > 0) {
            setShowWarning(true);
            if (onForceDecisionModal) {
                onForceDecisionModal();
            }
            setTimeout(() => setShowWarning(false), 4000);
            return;
        }
        nextTurn();
    };
    return (_jsxs("div", { className: "fixed bottom-6 right-6 z-30 flex items-center gap-3", children: [showWarning && (_jsx("div", { className: "animate-bounce text-xs font-bold text-rose-200 bg-rose-950/95 border border-rose-500/50 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md", children: "\uD83D\uDED1 Deb\u00E9s resolver las decisiones pendientes antes de avanzar el mes." })), pendingDecisionsCount > 0 && !showWarning && (_jsxs("button", { onClick: onForceDecisionModal, className: "text-xs text-amber-300 font-bold bg-amber-950/90 px-3.5 py-2 rounded-xl border border-amber-500/40 hover:bg-amber-900/90 transition-all cursor-pointer shadow-lg flex items-center gap-2", children: [_jsx("span", { className: "animate-pulse", children: "\u26A0\uFE0F" }), " ", pendingDecisionsCount, " Decisi\u00F3n(es) Pendiente(s)"] })), _jsx(Button, { variant: pendingDecisionsCount > 0 ? 'ghost' : 'gold', size: "lg", onClick: handleAdvanceClick, className: `shadow-2xl ${pendingDecisionsCount > 0
                    ? 'opacity-60 cursor-not-allowed border-slate-700 text-slate-400'
                    : 'shadow-amber-500/30'}`, children: pendingDecisionsCount > 0 ? 'Decisión Requerida 🔒' : 'Avanzar Mes ➔' })] }));
};
