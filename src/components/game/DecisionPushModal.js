import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal } from '@components/ui/Modal';
import { DecisionCard } from './DecisionCard';
export const DecisionPushModal = ({ isOpen, onClose, decisions, }) => {
    if (decisions.length === 0)
        return null;
    const currentDecision = decisions[0];
    const urgencyLabel = {
        baja: '📋 Asunto Pendiente',
        media: '📨 Requiere Atención',
        alta: '⚠️ Situación Urgente',
        critica: '🚨 CRISIS — Acción Inmediata',
    }[currentDecision.urgency] ?? '⚠️ Decisión Pendiente';
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: urgencyLabel, children: _jsxs("div", { className: "max-h-[75vh] overflow-y-auto pr-1 space-y-4", children: [currentDecision.urgency === 'critica' && (_jsxs("div", { className: "p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-rose-200 text-xs animate-pulse", children: [_jsx("b", { children: "\u26A1 Esta situaci\u00F3n no puede esperar." }), " Ignorarla tendr\u00E1 consecuencias autom\u00E1ticas en el pr\u00F3ximo turno."] })), _jsx(DecisionCard, { decision: currentDecision, onDecisionMade: () => {
                        if (decisions.length <= 1) {
                            onClose();
                        }
                    } }), decisions.length > 1 && (_jsxs("p", { className: "text-xs text-slate-500 text-center", children: ["Asunto 1 de ", decisions.length] }))] }) }));
};
