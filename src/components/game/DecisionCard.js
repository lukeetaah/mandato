import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useGameStore } from '@stores/game-store';
export const DecisionCard = ({ decision, onDecisionMade }) => {
    const makeChoice = useGameStore((s) => s.makeChoice);
    const [selectedChoiceId, setSelectedChoiceId] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const urgencyColors = {
        baja: 'slate',
        media: 'sky',
        alta: 'gold',
        critica: 'rose',
    };
    const handleChoiceClick = (choiceId) => {
        if (confirming && selectedChoiceId === choiceId) {
            // Confirmar
            makeChoice(decision, choiceId);
            if (onDecisionMade)
                onDecisionMade();
            setConfirming(false);
            setSelectedChoiceId(null);
        }
        else {
            // Primera selección — pedir confirmación
            setSelectedChoiceId(choiceId);
            setConfirming(true);
        }
    };
    return (_jsxs(Card, { title: decision.title, subtitle: `Presentado por: ${decision.source}`, action: _jsx(Badge, { variant: urgencyColors[decision.urgency], children: decision.urgency.toUpperCase() }), className: "mb-4 border-sky-500/20", children: [_jsx("p", { className: "text-slate-300 text-sm mb-5 leading-relaxed", children: decision.description }), _jsx("div", { className: "space-y-3", children: decision.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id && confirming;
                    return (_jsxs("div", { className: `p-4 rounded-xl transition-all border ${isSelected
                            ? 'bg-sky-950/80 border-sky-400/60 shadow-lg shadow-sky-500/10'
                            : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/30'}`, children: [_jsx("div", { className: "flex justify-between items-start mb-2", children: _jsx("h4", { className: "font-bold text-slate-100 text-sm", children: choice.label }) }), _jsx("p", { className: "text-xs text-slate-400 mb-3", children: choice.description }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-[11px] mb-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800", children: [_jsxs("div", { children: [_jsx("span", { className: "text-emerald-400 font-semibold block mb-1", children: "Ganancias" }), choice.preview.gains.length > 0 ? choice.preview.gains.map((g, idx) => (_jsxs("span", { className: "block text-slate-300", children: [g.icon, " ", g.label] }, idx))) : _jsx("span", { className: "text-slate-600", children: "\u2014" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-rose-400 font-semibold block mb-1", children: "P\u00E9rdidas" }), choice.preview.losses.length > 0 ? choice.preview.losses.map((l, idx) => (_jsxs("span", { className: "block text-slate-300", children: [l.icon, " ", l.label] }, idx))) : _jsx("span", { className: "text-slate-600", children: "\u2014" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-amber-400 font-semibold block mb-1", children: "Riesgos" }), choice.preview.risks.length > 0 ? choice.preview.risks.map((r, idx) => (_jsxs("span", { className: "block text-slate-300", children: [r.icon, " ", r.label] }, idx))) : _jsx("span", { className: "text-slate-600", children: "\u2014" })] })] }), _jsxs("div", { className: "flex gap-4 text-[10px] mb-3", children: [choice.preview.beneficiaries.length > 0 && (_jsxs("span", { className: "text-emerald-300", children: ["\uD83D\uDC4D ", choice.preview.beneficiaries.join(', ')] })), choice.preview.opponents.length > 0 && (_jsxs("span", { className: "text-rose-300", children: ["\uD83D\uDC4E ", choice.preview.opponents.join(', ')] }))] }), choice.delayedEffects.length > 0 && (_jsxs("div", { className: "text-[10px] text-amber-300/80 bg-amber-950/30 px-2 py-1 rounded mb-3 border border-amber-800/30", children: ["\uD83D\uDCA3 Esta opci\u00F3n tiene ", choice.delayedEffects.length, " consecuencia(s) diferida(s) que podr\u00EDan estallar m\u00E1s adelante."] })), _jsx(Button, { variant: isSelected ? 'gold' : 'primary', size: "sm", className: "w-full", onClick: () => handleChoiceClick(choice.id), children: isSelected ? '⚠️ Confirmar Decisión' : 'Elegir esta opción' })] }, choice.id));
                }) })] }));
};
