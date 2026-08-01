import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const DIAGNOSTICS = {
    'Inflación': {
        meaning: 'Ritmo de pérdida del poder adquisitivo de la moneda nacional.',
        worsenedBy: 'Emisión monetaria sin respaldo, devaluaciones bruscas, déficit fiscal excesivo.',
        improvedBy: 'Incrementar reservas del Banco Central, disciplina fiscal, superávit comercial.',
        risks: 'Caída de popularidad, estallidos sociales, reclamos de paritarias agresivas.',
    },
    'Reservas del Banco Central': {
        meaning: 'Respaldo en divisas para pagar importaciones esenciales y saldar deuda.',
        worsenedBy: 'Subsidios energéticos, cepos con brecha cambiaria, fuga de capitales.',
        improvedBy: 'Liquidación del campo, swaps de divisas, financiamiento multilateral.',
        risks: 'Corrida cambiaria, devaluación forzada, paralización industrial por falta de insumos.',
    },
    'Pobreza': {
        meaning: 'Porcentaje de la población sin ingresos suficientes para cubrir la canasta básica.',
        worsenedBy: 'Inflación alta, desempleo formal, devaluación de salarios.',
        improvedBy: 'Inversión productiva, programas de empleo, obras de infraestructura social.',
        risks: 'Tensión en provincias vulnerables, saqueos, descontento sindical.',
    },
    'Empleo registrado': {
        meaning: 'Puestos de trabajo formales con aportes previsionales y salud.',
        worsenedBy: 'Paralización de la industria, recesión, impuestos excesivos a PyMEs.',
        improvedBy: 'Estabilidad económica, créditos a la producción, alianzas regionales.',
        risks: 'Precarización laboral, caída de recaudación impositiva.',
    },
    'Institucionalidad': {
        meaning: 'Nivel de respeto por la división de poderes y seguridad jurídica.',
        worsenedBy: 'Escándalos en el Poder Judicial, favoritismos, decretos que evitan al Congreso.',
        improvedBy: 'Licitaciones transparentes, respeto por las elecciones, acuerdos de Estado.',
        risks: 'Fuga de inversores extranjeros, condenas de organismos internacionales.',
    },
    'Corrupción percibida': {
        meaning: 'Percepción pública y periodística sobre irregularidades en la administración.',
        worsenedBy: 'Aportes opacos de campaña, sobreprecios en obra pública, favoritismo mediático.',
        improvedBy: 'Auditorías independientes, renuncias de funcionarios bajo sospecha.',
        risks: 'Investigaciones judiciales, pérdida del voto de la clase media, filtraciones.',
    },
};
export const StatBar = ({ label, value, max = 100, color = 'sky', showPercentage = true, }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    const colorStyles = {
        sky: 'bg-sky-400 shadow-sky-500/50',
        gold: 'bg-amber-400 shadow-amber-500/50',
        rose: 'bg-rose-500 shadow-rose-500/50',
        emerald: 'bg-emerald-400 shadow-emerald-500/50',
        purple: 'bg-purple-400 shadow-purple-500/50',
    };
    const diag = DIAGNOSTICS[label] ?? {
        meaning: 'Indicador de desempeño institucional y social de la República.',
        worsenedBy: 'Medidas extremas o falta de consensos políticos.',
        improvedBy: 'Gestión equilibrada y previsibilidad fiscal.',
        risks: 'Consecuencias en la reputación ante los sectores clave.',
    };
    const statusLevel = percentage > 66 ? 'Elevado / Crítico' : percentage > 33 ? 'Equilibrado / Moderado' : 'Bajo / Vulnerable';
    return (_jsxs("div", { className: "w-full relative cursor-help", onMouseEnter: () => setShowTooltip(true), onMouseLeave: () => setShowTooltip(false), children: [_jsxs("div", { className: "flex justify-between items-center text-xs mb-1.5 font-medium", children: [_jsxs("span", { className: "text-slate-300 hover:text-sky-300 transition-colors flex items-center gap-1", children: [label, " ", _jsx("span", { className: "text-[10px] text-slate-500", children: "\u2139\uFE0F" })] }), showPercentage && _jsxs("span", { className: "text-slate-400 font-bold", children: [Math.round(value), "%"] })] }), _jsx("div", { className: "w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50", children: _jsx("div", { className: `h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`, style: { width: `${percentage}%` } }) }), showTooltip && (_jsxs("div", { className: "absolute left-0 bottom-full mb-2 z-50 w-72 p-3.5 rounded-xl bg-slate-950/95 border border-sky-500/40 text-slate-200 text-xs shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-1.5 font-bold", children: [_jsxs("span", { className: "text-sky-400", children: [label, " (", Math.round(value), "%)"] }), _jsx("span", { className: "text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded", children: statusLevel })] }), _jsx("p", { className: "text-[11px] text-slate-300 italic", children: diag.meaning }), _jsxs("div", { className: "space-y-1 text-[10px]", children: [_jsxs("div", { children: [_jsx("span", { className: "text-rose-400 font-semibold", children: "Lo empeora:" }), " ", _jsx("span", { className: "text-slate-400", children: diag.worsenedBy })] }), _jsxs("div", { children: [_jsx("span", { className: "text-emerald-400 font-semibold", children: "Lo mejora:" }), " ", _jsx("span", { className: "text-slate-400", children: diag.improvedBy })] }), _jsxs("div", { children: [_jsx("span", { className: "text-amber-400 font-semibold", children: "Riesgos latentes:" }), " ", _jsx("span", { className: "text-slate-400", children: diag.risks })] })] })] }))] }));
};
