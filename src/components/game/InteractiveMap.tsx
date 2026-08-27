import React, { useState } from 'react';
import type { Province, MapLayer, PartyId } from '@engine/types';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { StatBar } from '@components/ui/StatBar';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';

export interface InteractiveMapProps {
  provinces: Province[];
  onSelectProvince?: (province: Province) => void;
}

const PROVINCE_PATHS: Record<string, { d: string; cx: number; cy: number; label: string; subLabel: string }> = {
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

const REGION_GOVERNORS: Record<string, { name: string; partyId: PartyId | null; disposition: number; represents: string }> = {
  'capital-federal': { name: 'Sofía Arce', partyId: 'coalicion-tecnologica', disposition: 8, represents: 'servicios, universidades y medios metropolitanos' },
  'pampa-humeda': { name: 'Ramiro Echeverría', partyId: 'partido-tradicional', disposition: 12, represents: 'productores agropecuarios e intendentes rurales' },
  'sierras-centro': { name: 'Valeria Quiroga', partyId: 'partido-verde', disposition: 4, represents: 'industria, estudiantes y polos tecnológicos' },
  'noroeste-andino': { name: 'Lucía Benítez', partyId: 'movimiento-popular', disposition: -6, represents: 'minería, comunidades locales y obra pública pendiente' },
  'cuyo-valles': { name: 'Tomás Aguirre', partyId: 'movimiento-federal', disposition: 0, represents: 'economías regionales, agua y energía solar' },
  'litoral-subtropical': { name: 'Mariela Duarte', partyId: 'movimiento-popular', disposition: 10, represents: 'cooperativas, pesca fluvial y agricultura familiar' },
  'costa-maritima': { name: 'Clara Montalvo', partyId: 'partido-liberal', disposition: -8, represents: 'turismo, pesca y comercio portuario' },
  'sur-patagonico': { name: 'Gastón Roldán', partyId: 'partido-liberal', disposition: -14, represents: 'regalías energéticas, minería y autonomía patagónica' },
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ provinces, onSelectProvince }) => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(provinces[0]?.id ?? 'noroeste-andino');
  const [activeLayer, setActiveLayer] = useState<MapLayer>('politico');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const gameState = useGameStore((s) => s.gameState);
  const isRegionalActionUsed = (actionType: 'fondos' | 'fuerzas' | 'obras' | 'pacto') =>
    Boolean(gameState?.flags?.[`regional-action-${actionType}`]);

  const selectedProvince = provinces.find((p) => p.id === selectedProvinceId) ?? provinces[0] ?? null;
  const governorFromActor = selectedProvince && gameState?.actors.find((actor) => actor.id === selectedProvince.governorId);
  const governorFallback = selectedProvince ? REGION_GOVERNORS[selectedProvince.id] : null;
  const selectedGovernor = governorFromActor
    ? {
      name: `${governorFromActor.name} ${governorFromActor.surname}`,
      partyId: governorFromActor.partyId,
      disposition: governorFromActor.disposition,
      represents: governorFallback?.represents ?? 'intereses territoriales de la región',
    }
    : governorFallback;
  const governorParty = selectedGovernor?.partyId
    ? gameState?.parties.find((party) => party.id === selectedGovernor.partyId)
    : null;
  const governorRelationship = !selectedGovernor || !gameState
    ? 'neutral'
    : selectedGovernor.partyId === gameState.character.partyId
    ? 'aliado'
    : selectedGovernor.disposition <= -10
    ? 'rival'
    : selectedGovernor.disposition >= 10
    ? 'negociable'
    : 'neutral';

  const handleSelect = (prov: Province) => {
    setSelectedProvinceId(prov.id);
    if (onSelectProvince) onSelectProvince(prov);
  };

  const executeRegionalAction = (actionType: 'fondos' | 'fuerzas' | 'obras' | 'pacto') => {
    if (!selectedProvince) return;
    if (isRegionalActionUsed(actionType)) {
      setActionFeedback('Esta herramienta ejecutiva ya fue utilizada en este mandato. No puede volver a asignarse.');
      return;
    }

    useGameStore.getState().updateGameState((prev) => {
      const actionFlag = `regional-action-${actionType}`;
      if (prev.flags?.[actionFlag]) return prev;
      const updatedProvinces = prev.provinces.map((p) => {
        if (p.id !== selectedProvince.id) return p;
        if (actionType === 'fondos') {
          return {
            ...p,
            socialMood: Math.min(50, p.socialMood + 8),
            economy: { ...p.economy, investment: Math.min(100, p.economy.investment + 5) },
          };
        }
        if (actionType === 'fuerzas') {
          return {
            ...p,
            socialMood: Math.max(-50, p.socialMood - 3),
            economy: { ...p.economy, employment: Math.max(0, p.economy.employment - 2) },
          };
        }
        if (actionType === 'obras') {
          return {
            ...p,
            economy: {
              ...p.economy,
              infrastructure: Math.min(100, p.economy.infrastructure + 10),
              employment: Math.min(100, p.economy.employment + 6),
            },
          };
        }
        // pacto
        const pactBoost = governorRelationship === 'aliado' ? 14 : governorRelationship === 'rival' ? 6 : governorRelationship === 'negociable' ? 11 : 9;
        return {
          ...p,
          socialMood: Math.min(50, p.socialMood + pactBoost),
        };
      });

      return {
        ...prev,
        flags: { ...prev.flags, [actionFlag]: true },
        provinces: updatedProvinces,
        character: actionType === 'pacto' && governorRelationship === 'rival'
          ? { ...prev.character, stress: Math.min(100, prev.character.stress + 2), pragmatismo: Math.min(100, prev.character.pragmatismo + 3) }
          : prev.character,
        actors: actionType === 'pacto' && selectedProvince
          ? prev.actors.map((actor) => actor.id === selectedProvince.governorId
            ? { ...actor, disposition: Math.min(100, actor.disposition + (governorRelationship === 'rival' ? 6 : 10)), loyalty: Math.min(100, actor.loyalty + (governorRelationship === 'aliado' ? 5 : 2)) }
            : actor)
          : prev.actors,
      };
    });

    const messages = {
      fondos: `Giro de coparticipación extra enviado a ${selectedProvince.name}. El humor social provincial mejoró.`,
      fuerzas: `Fuerzas de seguridad enviadas a ${selectedProvince.name}. Orden restablecido en accesos clave.`,
      obras: `Presupuesto de infraestructura aprobado para ${selectedProvince.name}. Crece el empleo local.`,
      pacto: governorRelationship === 'rival'
        ? `Pacto costoso con ${selectedGovernor?.name ?? 'la gobernación'} en ${selectedProvince.name}. La región afloja, pero la negociación te cobra estrés y exposición.`
        : governorRelationship === 'aliado'
        ? `Pacto aceitado con ${selectedGovernor?.name ?? 'la gobernación'} en ${selectedProvince.name}. La alianza territorial queda más ordenada.`
        : `Acuerdo político sellado con ${selectedGovernor?.name ?? 'la gobernación'} en ${selectedProvince.name}. La gobernabilidad regional mejora.`,
    };

    setActionFeedback(messages[actionType]);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const getProvinceLayerColor = (prov: Province) => {
    if (activeLayer === 'politico') {
      if (prov.socialMood >= 10) return '#10B981';
      if (prov.socialMood >= -5) return '#3B82F6';
      if (prov.socialMood >= -15) return '#F59E0B';
      return '#EF4444';
    }
    if (activeLayer === 'economico') {
      if (prov.economy.gdp >= 65) return '#10B981';
      if (prov.economy.gdp >= 45) return '#06B6D4';
      return '#F59E0B';
    }
    if (activeLayer === 'electoral') {
      return prov.socialMood > 0 ? '#3B82F6' : '#EF4444';
    }
    if (activeLayer === 'infraestructura') {
      if (prov.economy.infrastructure >= 60) return '#8B5CF6';
      return '#64748B';
    }
    return '#334155';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      {/* Mapa SVG Físico-Político Contiguo */}
      <div className={`lg:col-span-5 p-6 rounded-2xl relative overflow-hidden flex flex-col items-center border shadow-2xl space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#161B22] border-[#30363D]'
      }`}>
        <div className="w-full flex justify-between items-center">
          <div>
            <h3 className={`text-xl font-black tracking-wide ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Mapa de la república
            </h3>
            <p className={`text-xs font-semibold ${isLight ? 'text-blue-700' : 'text-sky-400'}`}>
              República del Sur — 8 macro-regiones contiguas
            </p>
          </div>
        </div>

        {/* Capas opcionales del mapa */}
        <div className={`w-full flex flex-wrap gap-1.5 justify-center p-1.5 rounded-xl border text-[11px] ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/90 border-slate-800'
        }`}>
          {[
            { id: 'politico', label: 'Modo político' },
            { id: 'fisico', label: 'Modo físico' },
            { id: 'economico', label: 'Modo económico' },
            { id: 'electoral', label: 'Modo electoral' },
            { id: 'infraestructura', label: 'Modo infraestructura' },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as MapLayer)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeLayer === layer.id
                  ? isLight
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-sky-400 text-slate-950 shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Leyenda de colores del modo activo */}
        <div className={`w-full p-3 rounded-xl border text-[10px] ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
        }`}>
          <span className={`font-bold uppercase tracking-wider block mb-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Referencia de colores
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {activeLayer === 'politico' && (
              <>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" /> Apoyo alto (humor ≥ 10)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" /> Estable (humor ≥ −5)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" /> Tensión (humor ≥ −15)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" /> Conflicto (humor &lt; −15)</span>
              </>
            )}
            {activeLayer === 'economico' && (
              <>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" /> PBI alto (≥ 65)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] inline-block" /> PBI moderado (≥ 45)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" /> PBI bajo (&lt; 45)</span>
              </>
            )}
            {activeLayer === 'electoral' && (
              <>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" /> Favorable al gobierno</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" /> Favorable a la oposición</span>
              </>
            )}
            {activeLayer === 'infraestructura' && (
              <>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block" /> Desarrollada (≥ 60)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#64748B] inline-block" /> Deficiente (&lt; 60)</span>
              </>
            )}
            {activeLayer === 'fisico' && (
              <span className="italic">Vista topográfica general — sin datos superpuestos</span>
            )}
          </div>
        </div>

        <div className="w-full flex justify-center py-2 relative">
          <svg
            viewBox="0 0 220 590"
            className="w-full max-w-[250px] h-auto drop-shadow-2xl select-none"
          >
            <defs>
              <filter id="glow-gold">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="220" height="590" fill={isLight ? '#e2e8f0' : 'rgba(15, 23, 42, 0.4)'} rx="12" />

            {provinces.map((prov) => {
              const pathData = PROVINCE_PATHS[prov.id];
              if (!pathData) return null;
              const isHovered = hoveredId === prov.id;
              const isSelected = selectedProvince?.id === prov.id;
              const baseColor = getProvinceLayerColor(prov);

              return (
                <g
                  key={prov.id}
                  onMouseEnter={() => setHoveredId(prov.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelect(prov)}
                  className="cursor-pointer"
                >
                  <path
                    d={pathData.d}
                    fill={baseColor}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.8 : 0.55}
                    stroke={isSelected ? '#F9CA24' : isHovered ? '#74B9FF' : '#0F172A'}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter={isSelected ? 'url(#glow-gold)' : undefined}
                    className="transition-all duration-200"
                  />
                  <text
                    x={pathData.cx}
                    y={pathData.cy}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={prov.id === 'capital-federal' ? '7' : '8.5'}
                    fontWeight="900"
                    pointerEvents="none"
                    className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight font-sans"
                  >
                    {pathData.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Ficha Detallada & Acciones en la Provincia (Item 3) */}
      <div className="lg:col-span-7 space-y-4">
        {selectedProvince ? (
          <Card
            title={selectedProvince.name}
            subtitle={`Población: ${(selectedProvince.population / 1_000_000).toFixed(2)} millones de habitantes`}
            action={<Badge variant="gold">Clima: {selectedProvince.climate}</Badge>}
          >
            <div className="space-y-4 text-xs">
              <p className={`italic p-3 rounded-2xl border leading-relaxed font-serif ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}>
                "{selectedProvince.culture}"
              </p>

              {actionFeedback && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold animate-fadeIn">
                  {actionFeedback}
                </div>
              )}

              {selectedGovernor && (
                <div className={`p-3 rounded-2xl border ${
                  governorRelationship === 'aliado'
                    ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/30 border-emerald-700/40 text-emerald-100'
                    : governorRelationship === 'rival'
                    ? isLight ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-rose-950/30 border-rose-700/40 text-rose-100'
                    : isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/70 border-slate-700 text-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">Gobernación regional</span>
                      <h4 className="text-sm font-black mt-0.5">{selectedGovernor.name}</h4>
                      <p className="text-[11px] opacity-80">
                        {governorParty?.name ?? 'Sin partido formal'} · relación {governorRelationship}
                      </p>
                    </div>
                    <Badge variant={governorRelationship === 'rival' ? 'rose' : governorRelationship === 'aliado' ? 'gold' : 'slate'}>
                      {governorRelationship}
                    </Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed mt-2 opacity-85">
                    Representa a {selectedGovernor.represents}. Pactar con esta gobernación cambia según afinidad partidaria, disposición y costo político.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                <StatBar label="Humor social territorial" value={selectedProvince.socialMood + 50} color="gold" />
                <StatBar label="Empleo registrado" value={selectedProvince.economy.employment} color="emerald" />
                <StatBar label="Pobreza ecorregional" value={selectedProvince.economy.poverty} color="rose" />
                <StatBar label="Infraestructura y redes" value={selectedProvince.economy.infrastructure} color="sky" />
                <StatBar label="Inversión productiva" value={selectedProvince.economy.investment} color="purple" />
                <StatBar label="PBI provincial" value={selectedProvince.economy.gdp} color="emerald" />
              </div>

              {/* Panel de acciones presidenciales en la provincia */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-[#1E293B] border-blue-500/30'
              }`}>
                <h4 className={`font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider ${
                  isLight ? 'text-blue-900' : 'text-sky-300'
                }`}>
                  <span>🏛️</span> Acciones directas del Ejecutivo en {selectedProvince.name}
                </h4>
                <p className={isLight ? 'text-[10px] text-blue-800' : 'text-[10px] text-slate-400'}>Cada instrumento puede usarse una sola vez durante el mandato.</p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => executeRegionalAction('fondos')}
                    disabled={isRegionalActionUsed('fondos')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${isRegionalActionUsed('fondos') ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'} ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                    }`}
                  >
                    💰 Fondos de Coparticipación Extra
                    <span className="block text-[10px] font-normal text-slate-500">{isRegionalActionUsed('fondos') ? '✓ Usada en este mandato' : '+8 Humor social · Mejora inversión'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeRegionalAction('fuerzas')}
                    disabled={isRegionalActionUsed('fuerzas')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${isRegionalActionUsed('fuerzas') ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'} ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-rose-300 hover:bg-slate-800'
                    }`}
                  >
                    🛡️ Desplegar Fuerzas Federales
                    <span className="block text-[10px] font-normal text-slate-500">{isRegionalActionUsed('fuerzas') ? '✓ Usada en este mandato' : 'Orden en rutas y seguridad local'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeRegionalAction('obras')}
                    disabled={isRegionalActionUsed('obras')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${isRegionalActionUsed('obras') ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'} ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-emerald-300 hover:bg-slate-800'
                    }`}
                  >
                    🏗️ Obras de Infraestructura
                    <span className="block text-[10px] font-normal text-slate-500">{isRegionalActionUsed('obras') ? '✓ Usada en este mandato' : '+10 Infraestructura · +6 Empleo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeRegionalAction('pacto')}
                    disabled={isRegionalActionUsed('pacto')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all ${isRegionalActionUsed('pacto') ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'} ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-sky-300 hover:bg-slate-800'
                    }`}
                  >
                    🤝 Negociar Pacto con Gobernador
                    <span className="block text-[10px] font-normal text-slate-500">{isRegionalActionUsed('pacto') ? '✓ Usada en este mandato' : 'Aumenta lealtad y apoyo territorial'}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
};
