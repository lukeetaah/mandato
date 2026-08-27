import React, { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';
import { PROVINCES, PROFESSIONS, DEFAULT_PARTIES, CHARACTER_PRESETS, type CharacterPreset } from '@engine/constants';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { PresidentAvatar } from './PresidentAvatar';

export interface CharacterEditorProps {
  onComplete: () => void;
}

const TOTAL_POINT_BUDGET = 330;
const MIN_TRAIT = 20;
const MAX_TRAIT = 85;

export const CharacterEditor: React.FC<CharacterEditorProps> = ({ onComplete }) => {
  const initNewGame = useGameStore((s) => s.initNewGame);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CHARACTER_PRESETS[0]!.id);
  const [showPersonalIntro, setShowPersonalIntro] = useState(false);

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
    if (remainingPoints - diff < 0) return;
    const clamped = Math.max(MIN_TRAIT, Math.min(MAX_TRAIT, newValue));
    setTraits((prev) => ({ ...prev, [key]: clamped }));
  };

  const handleSelectPreset = (preset: CharacterPreset) => {
    setShowPersonalIntro(false);
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
      if (!showPersonalIntro) {
        setShowPersonalIntro(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
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
        lore: preset.lore,
        avatarId: preset.avatarId,
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

  const selectedPreset = CHARACTER_PRESETS.find((p) => p.id === selectedPresetId) ?? CHARACTER_PRESETS[0]!;
  const selectedProvinceName = PROVINCES.find((p) => p.id === selectedPreset.province)?.name ?? selectedPreset.province;

  if (showPersonalIntro && mode === 'preset') {
    return (
      <div className={`max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl my-8 border shadow-2xl transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40' : 'glass-panel border-slate-800'
      }`}>
        <button
          type="button"
          onClick={() => setShowPersonalIntro(false)}
          className={`text-xs font-bold cursor-pointer mb-5 flex items-center gap-1.5 ${
            isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-100'
          }`}
        >
          ← Volver a los presidentes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 items-start">
          <div className={`rounded-2xl p-4 border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-700'
          }`}>
            <PresidentAvatar
              character={{
                name: selectedPreset.name,
                surname: selectedPreset.surname,
                avatarId: selectedPreset.avatarId,
                health: 85,
                stress: 20,
                popularity: 35,
              }}
              className="aspect-[7/8]"
              showCaption
            />
          </div>

          <div className="space-y-5">
            <div>
              <span className={`text-xs uppercase tracking-[0.2em] font-black ${
                isLight ? 'text-sky-700' : 'text-sky-300'
              }`}>Tu presidente</span>
              <h2 className={`text-3xl sm:text-4xl font-extrabold mt-1 ${
                isLight ? 'text-slate-950' : 'text-slate-100'
              }`}>
                {selectedPreset.name} {selectedPreset.surname}
              </h2>
              <p className={`text-sm mt-1 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {selectedPreset.age} años · {selectedProvinceName} · {selectedPreset.profession}
              </p>
            </div>

            <div className={`rounded-2xl border p-5 space-y-3 ${
              isLight ? 'bg-amber-50/70 border-amber-200/80 text-amber-950' : 'border-amber-500/25 bg-slate-950/60 text-slate-200'
            }`}>
              <p className="text-sm leading-relaxed">{selectedPreset.backstory}</p>
              <p className={`text-base font-serif italic mt-3 ${
                isLight ? 'text-amber-900 font-bold' : 'text-amber-200'
              }`}>“{selectedPreset.lore.signaturePhrase}”</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className={`rounded-2xl border p-4 space-y-2.5 ${
                isLight ? 'bg-blue-50/60 border-blue-200 text-slate-800' : 'border-slate-700 bg-slate-900/70 text-slate-300'
              }`}>
                <h3 className={`font-black ${isLight ? 'text-blue-900' : 'text-sky-300'}`}>Por qué llegó al poder</h3>
                <p className="leading-relaxed">{selectedPreset.lore.pathToPresidency}</p>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{selectedPreset.lore.politicalOrigin}</p>
              </div>
              <div className={`rounded-2xl border p-4 space-y-2.5 ${
                isLight ? 'bg-amber-50/60 border-amber-200 text-slate-800' : 'border-slate-700 bg-slate-900/70 text-slate-300'
              }`}>
                <h3 className={`font-black ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>Qué carga al asumir</h3>
                <p className="leading-relaxed">{selectedPreset.lore.mandateGoal}</p>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Teme perder: {selectedPreset.lore.fear}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className={`font-black mb-2 ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>Fortalezas</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedPreset.lore.strengths.map((item) => <Badge key={item} variant="sky">{item}</Badge>)}
                </div>
              </div>
              <div>
                <h3 className={`font-black mb-2 ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>Debilidades</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedPreset.lore.weaknesses.map((item) => <Badge key={item} variant="slate">{item}</Badge>)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="gold" size="lg" onClick={handleStart}>
                Comenzar mandato ➔
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-8 rounded-3xl my-8 border shadow-2xl transition-colors ${
      isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40' : 'glass-panel border-slate-800'
    }`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-amber-500 to-sky-600">
            Elegí quién va a gobernar
          </h2>
          <p className={`text-sm mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Cuatro biografías llegan al sillón presidencial. La partida va a continuar una historia que ya empezó antes de la banda.
          </p>
        </div>
        <div className={`flex gap-1.5 p-1 rounded-xl border shrink-0 ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={() => setMode('preset')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'preset'
                ? 'bg-sky-500 text-white shadow-md font-black'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Presidentes posibles
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            Creación personalizada
          </button>
        </div>
      </div>

      {mode === 'preset' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CHARACTER_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isLight
                      ? 'bg-[#FFF7E8] border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30'
                      : 'bg-slate-900/90 border-amber-400 shadow-xl shadow-amber-400/20 ring-1 ring-amber-400/40'
                    : isLight
                    ? 'bg-[#FFFDF9] border-[#D7C6AD] hover:border-amber-400 hover:bg-[#FFF7E8]/50'
                    : 'bg-slate-900/40 border-slate-800 hover:border-sky-500/40'
                }`}
              >
                <div>
                  <div className="flex gap-4 mb-3">
                    <PresidentAvatar
                      character={{
                        name: preset.name,
                        surname: preset.surname,
                        avatarId: preset.avatarId,
                        health: 85,
                        stress: 20,
                        popularity: 35,
                      }}
                      className="w-20 h-24 shrink-0 shadow-md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className={`font-black text-base leading-snug ${isLight ? 'text-slate-950' : 'text-slate-100'}`}>
                          {preset.title}
                        </h3>
                      </div>
                      <Badge variant={isSelected ? 'gold' : 'slate'}>{preset.name} {preset.surname}</Badge>
                      <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                        {preset.description}
                      </p>
                    </div>
                  </div>

                  {/* Frase Distintiva con diseño institucional */}
                  <div className={`p-2.5 px-3 rounded-xl border text-[11px] font-serif italic mb-4 ${
                    isLight
                      ? 'bg-[#F7EFE0] border-[#DECDB5] text-amber-950'
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-200/90'
                  }`}>
                    “{preset.lore.signaturePhrase}”
                  </div>

                  <div className={`p-3.5 rounded-xl border space-y-2 text-xs shadow-sm ${
                    isLight ? 'bg-amber-50/60 border-amber-300/80' : 'bg-slate-900/90 border-slate-700'
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-2 ${
                      isLight ? 'border-amber-200' : 'border-slate-800'
                    }`}>
                      <span className={`font-black tracking-wider flex items-center gap-1.5 ${
                        isLight ? 'text-amber-950' : 'text-amber-300'
                      }`}>
                        <span>✨</span> CARISMA
                      </span>
                      <span className="font-black px-3 py-1 rounded-full text-xs bg-amber-400 text-slate-950 shadow-md">
                        {preset.traits.charisma} pts
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="flex flex-col">
                        <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>Honestidad</span>
                        <span className={`font-black text-sm ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>{preset.traits.honesty}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>Ambición</span>
                        <span className={`font-black text-sm ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{preset.traits.ambition}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>Empatía</span>
                        <span className={`font-black text-sm ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>{preset.traits.empathy}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>Oratoria</span>
                        <span className={`font-black text-sm ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>{preset.traits.oratory}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className={isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}>Estrategia</span>
                        <span className={`font-black text-sm ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>{preset.traits.strategy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className={`text-lg font-bold border-b pb-2 ${isLight ? 'text-sky-800 border-slate-200' : 'text-sky-400 border-slate-800'}`}>
              Datos e identidad
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-xl border p-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                  placeholder="Carlos"
                />
              </div>
              <div>
                <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Apellido</label>
                <input
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className={`w-full rounded-xl border p-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                  placeholder="García"
                />
              </div>
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Edad ({age} años)</label>
              <input
                type="range"
                min={25}
                max={75}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Región de origen</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={`w-full rounded-xl border p-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                {PROVINCES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Profesión</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className={`w-full rounded-xl border p-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                {PROFESSIONS.map((prof) => (
                  <option key={prof} value={prof}>
                    {prof}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Partido político</label>
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className={`w-full rounded-xl border p-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              >
                {DEFAULT_PARTIES.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name} ({party.abbreviation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className={`text-lg font-bold ${isLight ? 'text-amber-950' : 'text-amber-400'}`}>Atributos personales</h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                remainingPoints > 0
                  ? isLight ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : isLight ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Puntos disponibles: {remainingPoints}
              </span>
            </div>

            {(['charisma', 'honesty', 'ambition', 'empathy', 'oratory', 'strategy'] as const).map((traitKey) => {
              const labels: Record<string, string> = {
                charisma: '✨ Carisma',
                honesty: '🛡️ Honestidad',
                ambition: '⚡ Ambición',
                empathy: '🤝 Empatía',
                oratory: '🗣️ Oratoria',
                strategy: '🧠 Estrategia',
              };
              const val = traits[traitKey];
              return (
                <div key={traitKey} className="w-full">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className={isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'}>{labels[traitKey]}</span>
                    <span className={`font-extrabold ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>{val} pts</span>
                  </div>
                  <input
                    type="range"
                    min={MIN_TRAIT}
                    max={MAX_TRAIT}
                    value={val}
                    onChange={(e) => handleTraitChange(traitKey, Number(e.target.value))}
                    className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`mt-8 border-t pt-6 flex justify-end ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <Button variant="gold" size="lg" onClick={handleStart}>
          {mode === 'preset' ? 'Conocer historia personal ➔' : 'Comenzar mandato ➔'}
        </Button>
      </div>
    </div>
  );
};

