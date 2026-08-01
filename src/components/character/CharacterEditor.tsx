import React, { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { PROVINCES, PROFESSIONS, DEFAULT_PARTIES, CHARACTER_PRESETS, type CharacterPreset } from '@engine/constants';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

export interface CharacterEditorProps {
  onComplete: () => void;
}

const TOTAL_POINT_BUDGET = 330;
const MIN_TRAIT = 20;
const MAX_TRAIT = 85;

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ onComplete }) => {
  const initNewGame = useGameStore((s) => s.initNewGame);

  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CHARACTER_PRESETS[0]!.id);

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

  const handleTraitChange = (key: keyof typeof traits, newValue: number) => {
    const currentVal = traits[key];
    const diff = newValue - currentVal;
    if (remainingPoints - diff < 0) return; // Superaría el presupuesto
    const clamped = Math.max(MIN_TRAIT, Math.min(MAX_TRAIT, newValue));
    setTraits((prev) => ({ ...prev, [key]: clamped }));
  };

  const handleSelectPreset = (preset: CharacterPreset) => {
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
      const preset = CHARACTER_PRESETS.find((p) => p.id === selectedPresetId) ?? CHARACTER_PRESETS[0]!;
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
    } else {
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

  return (
    <div className="max-w-4xl mx-auto glass-panel p-8 rounded-2xl my-8 border border-slate-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-300">
            Selección y Creación de Político
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            En la República del Sur no hay caminos sencillos. Elegí un arquetipo prediseñado o construí tu personaje con presupuesto de puntos.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMode('preset')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              mode === 'preset' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Arquetipos Históricos
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              mode === 'custom' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Creación Personalizada
          </button>
        </div>
      </div>

      {mode === 'preset' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHARACTER_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900/90 border-amber-400 shadow-lg shadow-amber-400/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-sky-500/40'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-100 text-base">{preset.title}</h3>
                  <Badge variant={isSelected ? 'gold' : 'slate'}>{preset.name} {preset.surname}</Badge>
                </div>
                <p className="text-xs text-slate-400 mb-4">{preset.description}</p>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-950/60 p-2 rounded border border-slate-800">
                  <span>Carisma: <b>{preset.traits.charisma}</b></span>
                  <span>Honestidad: <b>{preset.traits.honesty}</b></span>
                  <span>Ambición: <b>{preset.traits.ambition}</b></span>
                  <span>Empatía: <b>{preset.traits.empathy}</b></span>
                  <span>Oratoria: <b>{preset.traits.oratory}</b></span>
                  <span>Estrategia: <b>{preset.traits.strategy}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identidad */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-sky-400 border-b border-slate-800 pb-2">Datos e Identidad</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Apellido</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Edad ({age} años)</label>
              <input
                type="range"
                min={25}
                max={75}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-sky-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Provincia Natal</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {PROVINCES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Profesión</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Partido Político</label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {DEFAULT_PARTIES.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name} ({party.abbreviation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Atributos con Presupuesto de Puntos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-lg font-bold text-amber-400">Atributos Personales</h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                remainingPoints > 0 ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                Puntos disponibles: {remainingPoints}
              </span>
            </div>

            {(['charisma', 'honesty', 'ambition', 'empathy', 'oratory', 'strategy'] as const).map((traitKey) => {
              const labels: Record<string, string> = {
                charisma: 'Carisma',
                honesty: 'Honestidad',
                ambition: 'Ambición',
                empathy: 'Empatía',
                oratory: 'Oratoria',
                strategy: 'Estrategia',
              };
              const val = traits[traitKey];
              return (
                <div key={traitKey} className="w-full">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">{labels[traitKey]}</span>
                    <span className="text-sky-400 font-bold">{val} pts</span>
                  </div>
                  <input
                    type="range"
                    min={MIN_TRAIT}
                    max={MAX_TRAIT}
                    value={val}
                    onChange={(e) => handleTraitChange(traitKey, Number(e.target.value))}
                    className="w-full accent-sky-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-slate-800 pt-6 flex justify-end">
        <Button variant="gold" size="lg" onClick={handleStart}>
          Comenzar Mandato ➔
        </Button>
      </div>
    </div>
  );
};
