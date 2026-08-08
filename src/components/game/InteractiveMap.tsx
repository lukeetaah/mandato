import React, { useState } from 'react';
import type { Province, MapLayer } from '@engine/types';
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

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ provinces, onSelectProvince }) => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(provinces[0]?.id ?? 'noroeste-andino');
  const [activeLayer, setActiveLayer] = useState<MapLayer>('politico');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const selectedProvince = provinces.find((p) => p.id === selectedProvinceId) ?? provinces[0] ?? null;

  const handleSelect = (prov: Province) => {
    setSelectedProvinceId(prov.id);
    if (onSelectProvince) onSelectProvince(prov);
  };

  const executeRegionalAction = (actionType: 'fondos' | 'fuerzas' | 'obras' | 'pacto') => {
    if (!selectedProvince) return;

    useGameStore.getState().updateGameState((prev) => {
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
        return {
          ...p,
          socialMood: Math.min(50, p.socialMood + 12),
        };
      });

      return {
        ...prev,
        provinces: updatedProvinces,
      };
    });

    const messages = {
      fondos: `💰 Giro de Coparticipación Extra enviado a ${selectedProvince.name}. El humor social provincial mejoró.`,
      fuerzas: `🛡️ Fuerzas de Seguridad enviadas a ${selectedProvince.name}. Orden restablecido en accesos clave.`,
      obras: `🏗️ Presupuesto de Infraestructura aprobado para ${selectedProvince.name}. Crece el empleo local.`,
      pacto: `🤝 Acuerdo Político sellado con el Gobernador de ${selectedProvince.name}. Aumenta la gobernabilidad.`,
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
              MAPA DE LA REPÚBLICA
            </h3>
            <p className={`text-xs font-semibold ${isLight ? 'text-blue-700' : 'text-sky-400'}`}>
              República del Sur — 8 provincias contiguas
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

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                <StatBar label="Humor social territorial" value={selectedProvince.socialMood + 50} color="gold" />
                <StatBar label="Empleo registrado" value={selectedProvince.economy.employment} color="emerald" />
                <StatBar label="Pobreza ecorregional" value={selectedProvince.economy.poverty} color="rose" />
                <StatBar label="Infraestructura y redes" value={selectedProvince.economy.infrastructure} color="sky" />
                <StatBar label="Inversión productiva" value={selectedProvince.economy.investment} color="purple" />
                <StatBar label="PBI provincial" value={selectedProvince.economy.gdp} color="emerald" />
              </div>

              {/* Panel de Acciones Presidenciales en la Provincia (Item 3) */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-[#1E293B] border-blue-500/30'
              }`}>
                <h4 className={`font-bold text-xs flex items-center gap-1.5 uppercase tracking-wider ${
                  isLight ? 'text-blue-900' : 'text-sky-300'
                }`}>
                  <span>🏛️</span> Acciones Directas del Ejecutivo en {selectedProvince.name}
                </h4>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => executeRegionalAction('fondos')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
                    }`}
                  >
                    💰 Fondos de Coparticipación Extra
                    <span className="block text-[10px] font-normal text-slate-500">+8 Humor social · Mejora inversión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeRegionalAction('fuerzas')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-rose-300 hover:bg-slate-800'
                    }`}
                  >
                    🛡️ Desplegar Fuerzas Federales
                    <span className="block text-[10px] font-normal text-slate-500">Orden en rutas y seguridad local</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeRegionalAction('obras')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-emerald-300 hover:bg-slate-800'
                    }`}
                  >
                    🏗️ Obras de Infraestructura
                    <span className="block text-[10px] font-normal text-slate-500">+10 Infraestructura · +6 Empleo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => executeRegionalAction('pacto')}
                    className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      isLight ? 'bg-white border-blue-200 text-blue-900 hover:bg-blue-100' : 'bg-slate-900 border-slate-700 text-sky-300 hover:bg-slate-800'
                    }`}
                  >
                    🤝 Negociar Pacto con Gobernador
                    <span className="block text-[10px] font-normal text-slate-500">Aumenta lealtad y apoyo territorial</span>
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
