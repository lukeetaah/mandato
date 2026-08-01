import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { PROVINCES, PROFESSIONS, DEFAULT_PARTIES, CHARACTER_PRESETS } from '@engine/constants';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
const TOTAL_POINT_BUDGET = 330;
const MIN_TRAIT = 20;
const MAX_TRAIT = 85;
export const CharacterEditor = ({ onComplete }) => {
    const initNewGame = useGameStore((s) => s.initNewGame);
    const [mode, setMode] = useState('preset');
    const [selectedPresetId, setSelectedPresetId] = useState(CHARACTER_PRESETS[0].id);
    // Custom Form
    const [name, setName] = useState('Patricio');
    const [surname, setSurname] = useState('Soto');
    const [age, setAge] = useState(34);
    const [province, setProvince] = useState('capital-federal');
    const [profession, setProfession] = useState('Abogado/a');
    const [partyId, setPartyId] = useState('partido-tradicional');
    // Point pool traits
    const [traits, setTraits] = useState({
        charisma: 65,
        honesty: 70,
        ambition: 65,
        empathy: 45,
        oratory: 45,
        strategy: 40,
    });
    const usedPoints = Object.values(traits).reduce((a, b) => a + b, 0);
    const remainingPoints = TOTAL_POINT_BUDGET - usedPoints;
    const handleTraitChange = (key, newValue) => {
        const currentVal = traits[key];
        const diff = newValue - currentVal;
        if (remainingPoints - diff < 0)
            return; // Superaría el presupuesto
        const clamped = Math.max(MIN_TRAIT, Math.min(MAX_TRAIT, newValue));
        setTraits((prev) => ({ ...prev, [key]: clamped }));
    };
    const handleSelectPreset = (preset) => {
        setSelectedPresetId(preset.id);
        setName(preset.name);
        setSurname(preset.surname);
        setAge(preset.age);
        setProvince(preset.province);
        setProfession(preset.profession);
        setPartyId(preset.partyId);
        setTraits(preset.traits);
    };
    const handleStart = () => {
        if (mode === 'preset') {
            const preset = CHARACTER_PRESETS.find((p) => p.id === selectedPresetId) ?? CHARACTER_PRESETS[0];
            initNewGame(Date.now(), {
                name: preset.name,
                surname: preset.surname,
                age: preset.age,
                province: preset.province,
                profession: preset.profession,
                partyId: preset.partyId,
                education: preset.education,
                traits: preset.traits,
                backstory: preset.backstory,
            });
        }
        else {
            initNewGame(Date.now(), {
                name,
                surname,
                age,
                province,
                profession,
                partyId,
                traits,
            });
        }
        onComplete();
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto glass-panel p-8 rounded-2xl my-8 border border-slate-800", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-300", children: "Selecci\u00F3n y Creaci\u00F3n de Pol\u00EDtico" }), _jsx("p", { className: "text-slate-400 text-sm mt-1", children: "En la Rep\u00FAblica del Sur no hay caminos sencillos. Eleg\u00ED un arquetipo predise\u00F1ado o constru\u00ED tu personaje con presupuesto de puntos." })] }), _jsxs("div", { className: "flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800", children: [_jsx("button", { onClick: () => setMode('preset'), className: `px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${mode === 'preset' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`, children: "Arquetipos Hist\u00F3ricos" }), _jsx("button", { onClick: () => setMode('custom'), className: `px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${mode === 'custom' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`, children: "Creaci\u00F3n Personalizada" })] })] }), mode === 'preset' ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: CHARACTER_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (_jsxs("div", { onClick: () => handleSelectPreset(preset), className: `p-5 rounded-xl border transition-all cursor-pointer ${isSelected
                            ? 'bg-slate-900/90 border-amber-400 shadow-lg shadow-amber-400/10'
                            : 'bg-slate-900/40 border-slate-800 hover:border-sky-500/40'}`, children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h3", { className: "font-bold text-slate-100 text-base", children: preset.title }), _jsxs(Badge, { variant: isSelected ? 'gold' : 'slate', children: [preset.name, " ", preset.surname] })] }), _jsx("p", { className: "text-xs text-slate-400 mb-4", children: preset.description }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800", children: [_jsxs("span", { children: ["Carisma: ", _jsx("b", { children: preset.traits.charisma })] }), _jsxs("span", { children: ["Honestidad: ", _jsx("b", { children: preset.traits.honesty })] }), _jsxs("span", { children: ["Ambici\u00F3n: ", _jsx("b", { children: preset.traits.ambition })] }), _jsxs("span", { children: ["Empat\u00EDa: ", _jsx("b", { children: preset.traits.empathy })] }), _jsxs("span", { children: ["Oratoria: ", _jsx("b", { children: preset.traits.oratory })] }), _jsxs("span", { children: ["Estrategia: ", _jsx("b", { children: preset.traits.strategy })] })] })] }, preset.id));
                }) })) : (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-bold text-sky-400 border-b border-slate-800 pb-2", children: "Datos e Identidad" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-slate-300 block mb-1", children: "Nombre" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-slate-300 block mb-1", children: "Apellido" }), _jsx("input", { type: "text", value: surname, onChange: (e) => setSurname(e.target.value), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-xs font-semibold text-slate-300 block mb-1", children: ["Edad (", age, " a\u00F1os)"] }), _jsx("input", { type: "range", min: 25, max: 75, value: age, onChange: (e) => setAge(Number(e.target.value)), className: "w-full accent-sky-400 bg-slate-800 h-2 rounded-lg cursor-pointer" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-slate-300 block mb-1", children: "Provincia Natal" }), _jsx("select", { value: province, onChange: (e) => setProvince(e.target.value), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500", children: PROVINCES.map((p) => (_jsx("option", { value: p.id, children: p.name }, p.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-slate-300 block mb-1", children: "Profesi\u00F3n" }), _jsx("select", { value: profession, onChange: (e) => setProfession(e.target.value), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500", children: PROFESSIONS.map((prof) => (_jsx("option", { value: prof, children: prof }, prof))) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-slate-300 block mb-1", children: "Partido Pol\u00EDtico" }), _jsx("select", { value: partyId, onChange: (e) => setPartyId(e.target.value), className: "w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500", children: DEFAULT_PARTIES.map((party) => (_jsxs("option", { value: party.id, children: [party.name, " (", party.abbreviation, ")"] }, party.id))) })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-slate-800 pb-2", children: [_jsx("h3", { className: "text-lg font-bold text-amber-400", children: "Atributos Personales" }), _jsxs("span", { className: `text-xs font-bold px-3 py-1 rounded-full ${remainingPoints > 0 ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`, children: ["Puntos disponibles: ", remainingPoints] })] }), ['charisma', 'honesty', 'ambition', 'empathy', 'oratory', 'strategy'].map((traitKey) => {
                                const labels = {
                                    charisma: 'Carisma',
                                    honesty: 'Honestidad',
                                    ambition: 'Ambición',
                                    empathy: 'Empatía',
                                    oratory: 'Oratoria',
                                    strategy: 'Estrategia',
                                };
                                const val = traits[traitKey];
                                return (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex justify-between text-xs font-medium mb-1", children: [_jsx("span", { className: "text-slate-300", children: labels[traitKey] }), _jsxs("span", { className: "text-sky-400 font-bold", children: [val, " pts"] })] }), _jsx("input", { type: "range", min: MIN_TRAIT, max: MAX_TRAIT, value: val, onChange: (e) => handleTraitChange(traitKey, Number(e.target.value)), className: "w-full accent-sky-400 bg-slate-800 h-2 rounded-lg cursor-pointer" })] }, traitKey));
                            })] })] })), _jsx("div", { className: "mt-8 border-t border-slate-800 pt-6 flex justify-end", children: _jsx(Button, { variant: "gold", size: "lg", onClick: handleStart, children: "Comenzar Mandato \u2794" }) })] }));
};
