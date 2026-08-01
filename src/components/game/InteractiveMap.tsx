import React, { useState } from 'react';
import type { Province, MapLayer } from '@engine/types';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { StatBar } from '@components/ui/StatBar';

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(provinces[0] ?? null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('politico');

  const handleSelect = (prov: Province) => {
    setSelectedProvince(prov);
    if (onSelectProvince) onSelectProvince(prov);
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
    // físico
    return '#334155';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Mapa SVG Físico-Político Contiguo */}
      <div className="lg:col-span-5 glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col items-center border border-slate-700/60 shadow-2xl space-y-4">
        <div className="w-full flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-100 tracking-wide">MAPA DE LA REPÚBLICA</h3>
            <p className="text-xs text-sky-400 font-semibold">República del Sur — 8 provincias contiguas</p>
          </div>
        </div>

        {/* Capas opcionales del mapa */}
        <div className="w-full flex flex-wrap gap-1.5 justify-center bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-[11px]">
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
                  ? 'bg-sky-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        {/* Leyenda de colores del modo activo */}
        <div className="w-full bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-300">
          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Referencia de colores</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {activeLayer === 'politico' && (
              <>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" /> Apoyo alto (humor social ≥ 10)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" /> Estable (humor social ≥ −5)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" /> Tensión (humor social ≥ −15)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" /> Conflicto (humor social &lt; −15)</span>
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
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] inline-block" /> Infraestructura desarrollada (≥ 60)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#64748B] inline-block" /> Infraestructura deficiente (&lt; 60)</span>
                <span className="flex items-center gap-1 text-amber-400">— — Rutas nacionales</span>
              </>
            )}
            {activeLayer === 'fisico' && (
              <span className="text-slate-500 italic">Vista topográfica general — sin datos superpuestos</span>
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

              <pattern id="relief-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 10 0 M 0 0 L 10 10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Océano Atlántico */}
            <rect width="220" height="590" fill="rgba(15, 23, 42, 0.4)" rx="12" />

            {/* Ríos principales */}
            <path
              d="M 175 120 C 160 140, 160 160, 155 180"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="2 2"
              className="opacity-70"
            />
            <text x="175" y="145" fill="#38BDF8" fontSize="6" fontStyle="italic" className="select-none opacity-60">Río de la Plata</text>

            <rect width="220" height="590" fill="url(#relief-pattern)" pointerEvents="none" />

            {/* Polígonos de las 8 Provincias */}
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

            {/* Capa de Infraestructura (Rutas y Ferrocarriles) */}
            {activeLayer === 'infraestructura' && (
              <g pointerEvents="none">
                <path d="M 165 170 L 115 150 L 70 50" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
                <path d="M 165 170 L 95 250 L 85 420" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
                <text x="120" y="270" fill="#F59E0B" fontSize="6" fontWeight="bold">Ruta Nac. 3</text>
              </g>
            )}

            {/* Línea de la Cordillera de los Andes */}
            <path
              d="M 25 10 L 15 150 L 30 210 L 20 290 L 30 380 L 40 460 L 50 530 L 75 575"
              fill="none"
              stroke="rgba(248, 250, 252, 0.4)"
              strokeWidth="2.5"
              strokeDasharray="5 3"
            />
          </svg>
        </div>
      </div>

      {/* Ficha Detallada de Provincia */}
      <div className="lg:col-span-7 space-y-4">
        {selectedProvince ? (
          <Card
            title={selectedProvince.name}
            subtitle={`Población: ${(selectedProvince.population / 1_000_000).toFixed(2)} millones de habitantes`}
            action={<Badge variant="gold">Clima: {selectedProvince.climate}</Badge>}
            className="border-sky-500/30"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed font-serif">
                "{selectedProvince.culture}"
              </p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2">
                <StatBar label="Humor social territorial" value={selectedProvince.socialMood + 50} color="gold" />
                <StatBar label="Empleo registrado" value={selectedProvince.economy.employment} color="emerald" />
                <StatBar label="Pobreza ecorregional" value={selectedProvince.economy.poverty} color="rose" />
                <StatBar label="Infraestructura y redes" value={selectedProvince.economy.infrastructure} color="sky" />
                <StatBar label="Inversión productiva" value={selectedProvince.economy.investment} color="purple" />
                <StatBar label="PBI provincial" value={selectedProvince.economy.gdp} color="emerald" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1.5">Recursos estratégicos:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProvince.resources.map((res) => (
                      <Badge key={res} variant="sky">{res}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-1.5">Matriz industrial:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProvince.industries.map((ind) => (
                      <Badge key={ind} variant="slate">{ind.toUpperCase()}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <p className="text-slate-400 text-sm">Hacé clic en cualquier provincia del mapa para inspeccionar sus recursos e indicadores.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
