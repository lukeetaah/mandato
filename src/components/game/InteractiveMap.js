import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { StatBar } from '@components/ui/StatBar';
const PROVINCE_PATHS = {
    'noroeste-andino': {
        d: 'M 25 10 L 115 10 L 115 90 L 70 110 L 25 90 Z',
        cx: 70,
        cy: 50,
        label: 'Noroeste',
        subLabel: 'Jujuy, Salta, Tucumán',
    },
    'litoral-subtropical': {
        d: 'M 115 10 L 185 15 L 195 55 L 175 120 L 115 120 L 115 90 Z',
        cx: 150,
        cy: 60,
        label: 'Litoral',
        subLabel: 'Chaco, Corrientes, Misiones',
    },
    'cuyo-valles': {
        d: 'M 25 90 L 70 110 L 70 210 L 30 210 L 15 150 Z',
        cx: 45,
        cy: 150,
        label: 'Cuyo',
        subLabel: 'Mendoza, San Juan, San Luis',
    },
    'sierras-centro': {
        d: 'M 70 110 L 115 90 L 115 120 L 175 120 L 175 160 L 155 160 L 155 180 L 175 180 L 155 210 L 70 210 Z',
        cx: 115,
        cy: 150,
        label: 'Centro',
        subLabel: 'Córdoba, Santa Fe',
    },
    'capital-federal': {
        d: 'M 155 160 L 175 160 L 175 180 L 155 180 Z',
        cx: 165,
        cy: 170,
        label: 'DF',
        subLabel: 'Distrito Federal',
    },
    'pampa-humeda': {
        d: 'M 30 210 L 70 210 L 155 210 L 135 310 Z',
        cx: 95,
        cy: 250,
        label: 'Pampa',
        subLabel: 'Buenos Aires, La Pampa',
    },
    'costa-maritima': {
        d: 'M 155 180 L 185 180 L 195 250 L 165 330 L 135 310 L 155 210 Z',
        cx: 165,
        cy: 260,
        label: 'Costa',
        subLabel: 'Costa Atlántica',
    },
    'sur-patagonico': {
        d: 'M 30 210 L 135 310 L 165 330 L 150 400 L 130 460 L 110 510 L 90 560 L 75 575 L 55 575 L 50 530 L 40 460 L 30 380 L 20 290 Z',
        cx: 85,
        cy: 420,
        label: 'Patagonia',
        subLabel: 'Neuquén a Tierra del Fuego',
    },
};
export const InteractiveMap = ({ provinces, onSelectProvince }) => {
    const [hoveredId, setHoveredId] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState(provinces[0] ?? null);
    const [activeLayer, setActiveLayer] = useState('politico');
    const handleSelect = (prov) => {
        setSelectedProvince(prov);
        if (onSelectProvince)
            onSelectProvince(prov);
    };
    const getProvinceLayerColor = (prov) => {
        if (activeLayer === 'politico') {
            if (prov.socialMood >= 10)
                return '#10B981';
            if (prov.socialMood >= -5)
                return '#3B82F6';
            if (prov.socialMood >= -15)
                return '#F59E0B';
            return '#EF4444';
        }
        if (activeLayer === 'economico') {
            if (prov.economy.gdp >= 65)
                return '#10B981';
            if (prov.economy.gdp >= 45)
                return '#06B6D4';
            return '#F59E0B';
        }
        if (activeLayer === 'electoral') {
            return prov.socialMood > 0 ? '#3B82F6' : '#EF4444';
        }
        if (activeLayer === 'infraestructura') {
            if (prov.economy.infrastructure >= 60)
                return '#8B5CF6';
            return '#64748B';
        }
        // físico
        return '#334155';
    };
    return (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [_jsxs("div", { className: "lg:col-span-5 glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col items-center border border-slate-700/60 shadow-2xl space-y-4", children: [_jsx("div", { className: "w-full flex justify-between items-center", children: _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-black text-slate-100 tracking-wide", children: "MAPA DE LA REP\u00DABLICA" }), _jsx("p", { className: "text-xs text-sky-400 font-semibold", children: "Rep\u00FAblica del Sur \u2014 8 provincias contiguas" })] }) }), _jsx("div", { className: "w-full flex flex-wrap gap-1.5 justify-center bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-[11px]", children: [
                            { id: 'politico', label: 'Modo político' },
                            { id: 'fisico', label: 'Modo físico' },
                            { id: 'economico', label: 'Modo económico' },
                            { id: 'electoral', label: 'Modo electoral' },
                            { id: 'infraestructura', label: 'Modo infraestructura' },
                        ].map((layer) => (_jsx("button", { onClick: () => setActiveLayer(layer.id), className: `px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${activeLayer === layer.id
                                ? 'bg-sky-400 text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'}`, children: layer.label }, layer.id))) }), _jsxs("div", { className: "w-full bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-300", children: [_jsx("span", { className: "font-bold text-slate-400 uppercase tracking-wider block mb-1.5", children: "Referencia de colores" }), _jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1", children: [activeLayer === 'politico' && (_jsxs(_Fragment, { children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" }), " Apoyo alto (humor social \u2265 10)"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" }), " Estable (humor social \u2265 \u22125)"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" }), " Tensi\u00F3n (humor social \u2265 \u221215)"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" }), " Conflicto (humor social < \u221215)"] })] })), activeLayer === 'economico' && (_jsxs(_Fragment, { children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" }), " PBI alto (\u2265 65)"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#06B6D4] inline-block" }), " PBI moderado (\u2265 45)"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" }), " PBI bajo (< 45)"] })] })), activeLayer === 'electoral' && (_jsxs(_Fragment, { children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" }), " Favorable al gobierno"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" }), " Favorable a la oposici\u00F3n"] })] })), activeLayer === 'infraestructura' && (_jsxs(_Fragment, { children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block" }), " Infraestructura desarrollada (\u2265 60)"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-[#64748B] inline-block" }), " Infraestructura deficiente (< 60)"] }), _jsx("span", { className: "flex items-center gap-1 text-amber-400", children: "\u2014 \u2014 Rutas nacionales" })] })), activeLayer === 'fisico' && (_jsx("span", { className: "text-slate-500 italic", children: "Vista topogr\u00E1fica general \u2014 sin datos superpuestos" }))] })] }), _jsx("div", { className: "w-full flex justify-center py-2 relative", children: _jsxs("svg", { viewBox: "0 0 220 590", className: "w-full max-w-[250px] h-auto drop-shadow-2xl select-none", children: [_jsxs("defs", { children: [_jsxs("filter", { id: "glow-gold", children: [_jsx("feGaussianBlur", { stdDeviation: "3", result: "blur" }), _jsxs("feMerge", { children: [_jsx("feMergeNode", { in: "blur" }), _jsx("feMergeNode", { in: "SourceGraphic" })] })] }), _jsx("pattern", { id: "relief-pattern", width: "10", height: "10", patternUnits: "userSpaceOnUse", children: _jsx("path", { d: "M 0 10 L 10 0 M 0 0 L 10 10", stroke: "rgba(255,255,255,0.03)", strokeWidth: "0.5" }) })] }), _jsx("rect", { width: "220", height: "590", fill: "rgba(15, 23, 42, 0.4)", rx: "12" }), _jsx("path", { d: "M 175 120 C 160 140, 160 160, 155 180", fill: "none", stroke: "#38BDF8", strokeWidth: "2", strokeDasharray: "2 2", className: "opacity-70" }), _jsx("text", { x: "175", y: "145", fill: "#38BDF8", fontSize: "6", fontStyle: "italic", className: "select-none opacity-60", children: "R\u00EDo de la Plata" }), _jsx("rect", { width: "220", height: "590", fill: "url(#relief-pattern)", pointerEvents: "none" }), provinces.map((prov) => {
                                    const pathData = PROVINCE_PATHS[prov.id];
                                    if (!pathData)
                                        return null;
                                    const isHovered = hoveredId === prov.id;
                                    const isSelected = selectedProvince?.id === prov.id;
                                    const baseColor = getProvinceLayerColor(prov);
                                    return (_jsxs("g", { onMouseEnter: () => setHoveredId(prov.id), onMouseLeave: () => setHoveredId(null), onClick: () => handleSelect(prov), className: "cursor-pointer", children: [_jsx("path", { d: pathData.d, fill: baseColor, fillOpacity: isSelected ? 0.95 : isHovered ? 0.8 : 0.55, stroke: isSelected ? '#F9CA24' : isHovered ? '#74B9FF' : '#0F172A', strokeWidth: isSelected ? 2.5 : isHovered ? 2 : 1.2, strokeLinejoin: "round", strokeLinecap: "round", filter: isSelected ? 'url(#glow-gold)' : undefined, className: "transition-all duration-200" }), _jsx("text", { x: pathData.cx, y: pathData.cy, textAnchor: "middle", fill: "#FFFFFF", fontSize: prov.id === 'capital-federal' ? '7' : '8.5', fontWeight: "900", pointerEvents: "none", className: "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight font-sans", children: pathData.label })] }, prov.id));
                                }), activeLayer === 'infraestructura' && (_jsxs("g", { pointerEvents: "none", children: [_jsx("path", { d: "M 165 170 L 115 150 L 70 50", fill: "none", stroke: "#F59E0B", strokeWidth: "2", strokeDasharray: "3 2" }), _jsx("path", { d: "M 165 170 L 95 250 L 85 420", fill: "none", stroke: "#F59E0B", strokeWidth: "2", strokeDasharray: "3 2" }), _jsx("text", { x: "120", y: "270", fill: "#F59E0B", fontSize: "6", fontWeight: "bold", children: "Ruta Nac. 3" })] })), _jsx("path", { d: "M 25 10 L 15 150 L 30 210 L 20 290 L 30 380 L 40 460 L 50 530 L 75 575", fill: "none", stroke: "rgba(248, 250, 252, 0.4)", strokeWidth: "2.5", strokeDasharray: "5 3" })] }) })] }), _jsx("div", { className: "lg:col-span-7 space-y-4", children: selectedProvince ? (_jsx(Card, { title: selectedProvince.name, subtitle: `Población: ${(selectedProvince.population / 1_000_000).toFixed(2)} millones de habitantes`, action: _jsxs(Badge, { variant: "gold", children: ["Clima: ", selectedProvince.climate] }), className: "border-sky-500/30", children: _jsxs("div", { className: "space-y-4 text-xs", children: [_jsxs("p", { className: "text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed font-serif", children: ["\"", selectedProvince.culture, "\""] }), _jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-3 pt-2", children: [_jsx(StatBar, { label: "Humor social territorial", value: selectedProvince.socialMood + 50, color: "gold" }), _jsx(StatBar, { label: "Empleo registrado", value: selectedProvince.economy.employment, color: "emerald" }), _jsx(StatBar, { label: "Pobreza ecorregional", value: selectedProvince.economy.poverty, color: "rose" }), _jsx(StatBar, { label: "Infraestructura y redes", value: selectedProvince.economy.infrastructure, color: "sky" }), _jsx(StatBar, { label: "Inversi\u00F3n productiva", value: selectedProvince.economy.investment, color: "purple" }), _jsx(StatBar, { label: "PBI provincial", value: selectedProvince.economy.gdp, color: "emerald" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 pt-3 border-t border-slate-800", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-400 font-semibold block mb-1.5", children: "Recursos estrat\u00E9gicos:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: selectedProvince.resources.map((res) => (_jsx(Badge, { variant: "sky", children: res }, res))) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 font-semibold block mb-1.5", children: "Matriz industrial:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: selectedProvince.industries.map((ind) => (_jsx(Badge, { variant: "slate", children: ind.toUpperCase() }, ind))) })] })] })] }) })) : (_jsx(Card, { className: "text-center py-12", children: _jsx("p", { className: "text-slate-400 text-sm", children: "Hac\u00E9 clic en cualquier provincia del mapa para inspeccionar sus recursos e indicadores." }) })) })] }));
};
