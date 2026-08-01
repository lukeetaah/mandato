import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { Button } from '@components/ui/Button';
export const PresidentialDesk = ({ gameState }) => {
    const makeChoice = useGameStore((s) => s.makeChoice);
    const nextTurn = useGameStore((s) => s.nextTurn);
    const { calendar, deskObjects, pendingDecisions, character, nation } = gameState;
    const [activeObject, setActiveObject] = useState(null);
    const [selectedChoiceId, setSelectedChoiceId] = useState(null);
    const [dismissedObjects, setDismissedObjects] = useState(new Set());
    const [showSkipWarning, setShowSkipWarning] = useState(false);
    const safeDeskObjects = deskObjects ?? [];
    const visibleObjects = safeDeskObjects.filter(obj => !dismissedObjects.has(obj.id));
    const hasDecisionItems = visibleObjects.some(obj => obj.associatedDecisionId);
    const hasAnyItems = visibleObjects.length > 0;
    const timeGradients = {
        mañana: 'from-amber-900/40 via-sky-950/80 to-slate-950',
        tarde: 'from-sky-900/50 via-slate-950 to-slate-950',
        atardecer: 'from-amber-950/80 via-rose-950/60 to-slate-950',
        noche: 'from-slate-950 via-indigo-950/80 to-slate-950',
    };
    const weatherIcons = {
        despejado: '☀️',
        lluvia: '🌧️',
        niebla: '🌫️',
        tormenta: '🌩️',
        nieve: '❄️',
    };
    const activeDecision = activeObject?.associatedDecisionId
        ? pendingDecisions.find((d) => d.id === activeObject.associatedDecisionId)
        : undefined;
    const handleDismissReadOnly = (objId) => {
        setDismissedObjects(prev => {
            const next = new Set(prev);
            next.add(objId);
            return next;
        });
        setActiveObject(null);
        setSelectedChoiceId(null);
    };
    const handleChoiceClick = (choiceId) => {
        if (!activeDecision || !activeObject)
            return;
        if (selectedChoiceId === choiceId) {
            makeChoice(activeDecision, choiceId);
            // No necesitamos dismiss manual: executeChoice regenera deskObjects sin esta decisión
            setActiveObject(null);
            setSelectedChoiceId(null);
            setDismissedObjects(new Set()); // Reset porque los IDs cambiaron
        }
        else {
            setSelectedChoiceId(choiceId);
        }
    };
    const handleAdvance = () => {
        if (hasDecisionItems) {
            // Hay decisiones sin tomar — advertir
            setShowSkipWarning(true);
            return;
        }
        nextTurn();
        setDismissedObjects(new Set());
    };
    const handleForceAdvance = () => {
        setShowSkipWarning(false);
        nextTurn();
        setDismissedObjects(new Set());
    };
    const timeOfDay = calendar.timeOfDay ?? 'mañana';
    const weatherCondition = calendar.weatherCondition ?? 'despejado';
    const fortnight = calendar.fortnight ?? 1;
    return (_jsxs("div", { className: "relative w-full min-h-[640px] rounded-3xl overflow-hidden border-4 border-[#3e2723] shadow-2xl bg-[#1a0f0a] flex flex-col justify-between font-serif selection:bg-amber-500/30", children: [_jsxs("div", { className: `relative h-44 w-full bg-gradient-to-b ${timeGradients[timeOfDay] ?? timeGradients.mañana} p-6 flex justify-between items-start border-b-8 border-[#2d1b16] shadow-inner overflow-hidden`, children: [weatherCondition === 'lluvia' && (_jsx("div", { className: "absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" })), _jsxs("div", { className: "z-10 flex flex-col", children: [_jsx("span", { className: "text-amber-200/90 text-xs font-black tracking-widest uppercase font-sans flex items-center gap-2", children: "\uD83C\uDFDB\uFE0F CASA DE GOBIERNO \u2014 DESPACHO PRESIDENCIAL" }), _jsxs("h2", { className: "text-xl font-bold text-slate-100 tracking-tight font-serif mt-1", children: [fortnight === 1 ? 'Primera quincena' : 'Segunda quincena', " de ", calendar.monthCycleName, " (", calendar.season, " ", calendar.year, ")"] })] }), _jsxs("div", { className: "z-10 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-900/40 text-xs text-amber-200 font-sans shadow-lg", children: [_jsxs("span", { children: [weatherIcons[weatherCondition] ?? '☀️', " ", weatherCondition.toUpperCase()] }), _jsx("span", { children: "\u2022" }), _jsx("span", { className: "capitalize", children: timeOfDay }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "text-sky-300 font-bold", children: ["Estr\u00E9s: ", character.stress, "%"] })] })] }), _jsxs("div", { className: "relative flex-1 bg-gradient-to-b from-[#2d1b16] via-[#241410] to-[#1a0f0a] p-8 flex flex-col justify-between overflow-hidden shadow-2xl", children: [_jsx("div", { className: "absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d7ccc8_1px,transparent_1px)] [background-size:24px_24px]" }), _jsx("div", { className: "flex justify-end items-center z-10 text-xs text-amber-300/70 font-sans mb-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "text-right", children: [_jsx("span", { className: "block text-[10px] text-amber-400/60 uppercase tracking-wider font-bold", children: "Reservas" }), _jsxs("span", { className: `font-bold text-sm ${nation.economy.reserves < 25 ? 'text-rose-400' : 'text-emerald-400'}`, children: [Math.round(nation.economy.reserves), "%"] })] }), _jsxs("div", { className: "text-right pl-3 border-l border-amber-900/40", children: [_jsx("span", { className: "block text-[10px] text-amber-400/60 uppercase tracking-wider font-bold", children: "Popularidad" }), _jsxs("span", { className: "font-bold text-sm text-sky-400", children: [Math.round(character.popularity), "%"] })] })] }) }), visibleObjects.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 my-auto z-10", children: visibleObjects.map((obj) => {
                            const isUrgent = obj.urgency === 'critica' || obj.urgency === 'alta';
                            const hasDecision = !!obj.associatedDecisionId;
                            return (_jsxs("div", { onClick: () => { setActiveObject(obj); setSelectedChoiceId(null); }, className: `p-5 rounded-2xl cursor-pointer transition-all transform hover:-translate-y-1.5 hover:shadow-2xl border ${isUrgent
                                    ? 'bg-rose-950/80 border-rose-500/60 shadow-lg shadow-rose-900/30'
                                    : obj.type === 'diario'
                                        ? 'bg-[#f4ecd8] text-slate-950 border-[#d3c59d] shadow-xl'
                                        : 'bg-[#2a1711] text-amber-100 border-amber-800/60 hover:border-amber-400/60 shadow-lg'}`, children: [_jsxs("div", { className: "flex justify-between items-start mb-2 font-sans", children: [_jsxs("span", { className: "text-xl", children: [obj.type === 'diario' && '🗞️', obj.type === 'expediente' && '📁', obj.type === 'carpeta-roja' && '🔴', obj.type === 'carta-gobernador' && '✉️', obj.type === 'telefono' && '☎️', obj.type === 'encuesta' && '📊', obj.type === 'informe-inteligencia' && '🕵️'] }), _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isUrgent ? 'bg-rose-600 text-white' : hasDecision ? 'bg-amber-600 text-white' : 'bg-amber-900/40 text-amber-300 border border-amber-700/40'}`, children: hasDecision ? (isUrgent ? 'URGENTE' : 'REQUIERE DECISIÓN') : 'INFORMATIVO' })] }), _jsx("h3", { className: `font-bold text-sm leading-snug mb-1 ${obj.type === 'diario' ? 'font-serif text-slate-950' : 'text-slate-100'}`, children: obj.title }), _jsx("p", { className: `text-xs ${obj.type === 'diario' ? 'text-slate-700 font-serif italic' : 'text-amber-300/80 font-sans'}`, children: obj.subtitle }), _jsx("div", { className: "mt-3 pt-2 border-t border-amber-900/30 flex justify-between items-center text-[10px] font-sans font-bold", children: _jsx("span", { className: hasDecision ? 'text-amber-300' : 'text-amber-400/70', children: hasDecision ? '⚖️ Abrir y resolver' : 'Inspeccionar ➔' }) })] }, obj.id));
                        }) })) : (_jsxs("div", { className: "my-auto z-10 text-center py-16", children: [_jsx("span", { className: "text-4xl block mb-4", children: "\uD83C\uDFDB\uFE0F" }), _jsx("p", { className: "text-amber-300/60 text-sm font-sans", children: "El escritorio est\u00E1 despejado." }), _jsx("p", { className: "text-amber-300/40 text-xs font-sans mt-1", children: "No hay asuntos pendientes. Pod\u00E9s avanzar la quincena." })] })), activeObject && (_jsxs("div", { className: "absolute inset-x-6 top-6 bottom-6 z-30 bg-[#f7f1df] text-slate-950 p-8 rounded-3xl border-8 border-[#4e342e] shadow-2xl overflow-y-auto font-serif", children: [_jsxs("div", { className: "flex justify-between items-center border-b-2 border-slate-950 pb-4 mb-6 font-sans", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-2xl", children: activeObject.type === 'diario' ? '🗞️' : activeObject.type === 'telefono' ? '☎️' : activeObject.type === 'carta-gobernador' ? '✉️' : activeObject.type === 'encuesta' ? '📊' : '📁' }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-widest text-slate-600", children: activeDecision ? 'DOCUMENTO QUE REQUIERE SU DECISIÓN' : 'DOCUMENTO INFORMATIVO' }), _jsx("h2", { className: "text-xl font-black text-slate-950 leading-tight font-serif", children: activeObject.title })] })] }), activeDecision ? (_jsx("button", { onClick: () => { setActiveObject(null); setSelectedChoiceId(null); }, className: "px-4 py-2 text-xs font-bold rounded-xl border-2 border-slate-400 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer", children: "\u2190 Volver a la mesa" })) : (_jsx("button", { onClick: () => handleDismissReadOnly(activeObject.id), className: "px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white border-2 border-slate-600 hover:bg-slate-700 transition-all cursor-pointer shadow-md", children: "\u2715 Cerrar y archivar" }))] }), _jsxs("div", { className: "space-y-6 text-sm text-slate-900 leading-relaxed font-serif", children: [_jsxs("p", { className: "text-base leading-relaxed bg-[#ede3c6] p-5 rounded-2xl border border-slate-400/60 font-serif italic", children: ["\"", activeObject.inspectText, "\""] }), activeDecision ? (_jsxs("div", { className: "space-y-4 font-sans pt-4 border-t border-slate-300", children: [_jsx("h4", { className: "font-extrabold text-slate-950 text-sm font-serif", children: "\u00BFQu\u00E9 decid\u00EDs hacer?" }), activeDecision.choices.map((choice) => {
                                                const isSelected = selectedChoiceId === choice.id;
                                                return (_jsxs("div", { className: `p-5 rounded-2xl transition-all border ${isSelected
                                                        ? 'bg-slate-950 text-amber-200 border-slate-950 shadow-xl'
                                                        : 'bg-[#ebdcb9] text-slate-900 border-slate-400 hover:border-slate-800 cursor-pointer'}`, onClick: () => !isSelected && setSelectedChoiceId(choice.id), children: [_jsx("h5", { className: "font-bold text-sm mb-1", children: choice.label }), _jsx("p", { className: `text-xs mb-3 leading-relaxed font-serif ${isSelected ? 'text-amber-300/80' : 'text-slate-700'}`, children: choice.description }), _jsxs("div", { className: "flex flex-wrap gap-4 text-[11px] font-semibold mb-3", children: [choice.preview.gains.length > 0 && (_jsxs("span", { className: isSelected ? 'text-emerald-300' : 'text-emerald-700', children: ["\uD83D\uDC4D ", choice.preview.gains.map((g) => g.label).join(', ')] })), choice.preview.losses.length > 0 && (_jsxs("span", { className: isSelected ? 'text-rose-300' : 'text-rose-700', children: ["\u26A0\uFE0F ", choice.preview.losses.map((l) => l.label).join(', ')] }))] }), isSelected && (_jsx(Button, { variant: "gold", size: "sm", className: "w-full", onClick: (e) => { e.stopPropagation(); handleChoiceClick(choice.id); }, children: "\u26A0\uFE0F Firmar decreto y ejecutar" }))] }, choice.id));
                                            })] })) : (_jsx("p", { className: "text-xs text-slate-500 italic font-sans", children: "Este documento es informativo. Pod\u00E9s cerrarlo y archivarlo." }))] })] })), showSkipWarning && (_jsxs("div", { className: "absolute inset-x-6 bottom-20 z-40 bg-rose-950/95 border-2 border-rose-500/60 p-6 rounded-2xl shadow-2xl font-sans text-center backdrop-blur-md", children: [_jsx("p", { className: "text-rose-200 text-sm font-bold mb-2", children: "\u26A0\uFE0F Hay decisiones sin tomar en tu escritorio" }), _jsxs("p", { className: "text-rose-300/80 text-xs mb-4 leading-relaxed", children: ["No tomar ninguna decisi\u00F3n puede ser peor que tomar una mala.", _jsx("br", {}), "La inacci\u00F3n de un mandatario tiene consecuencias reales sobre el pa\u00EDs."] }), _jsxs("div", { className: "flex justify-center gap-3", children: [_jsx("button", { onClick: () => setShowSkipWarning(false), className: "px-5 py-2 text-xs font-bold rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-all cursor-pointer", children: "Volver y decidir" }), _jsx("button", { onClick: handleForceAdvance, className: "px-5 py-2 text-xs font-bold rounded-xl border border-rose-500/60 text-rose-300 hover:bg-rose-900 transition-all cursor-pointer", children: "Avanzar sin decidir (asum\u00ED las consecuencias)" })] })] })), _jsxs("div", { className: "flex justify-between items-center z-10 pt-4 border-t border-amber-900/40 font-sans", children: [_jsx("span", { className: "text-xs text-amber-300/60 font-medium", children: "Rep\u00FAblica del Sur \u2014 Per\u00EDodo Constitucional 2032-2036" }), _jsx(Button, { variant: hasAnyItems ? 'ghost' : 'gold', size: "md", onClick: hasAnyItems ? handleAdvance : () => { nextTurn(); setDismissedObjects(new Set()); }, className: hasDecisionItems ? 'text-amber-400' : hasAnyItems ? 'opacity-70 text-amber-400' : 'shadow-xl shadow-amber-500/20', children: hasDecisionItems
                                    ? '⚖️ Asuntos que requieren decisión'
                                    : hasAnyItems
                                        ? '📋 Revisar asuntos pendientes'
                                        : 'Avanzar quincena ➔' })] })] })] }));
};
