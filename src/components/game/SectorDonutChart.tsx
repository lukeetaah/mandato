import React, { useState } from 'react';
import type { ReputationGroup } from '@engine/types';
import { useUIStore } from '@stores/ui-store';

export interface SectorDonutChartProps {
  reputation: Record<ReputationGroup, number>;
}

const SECTOR_LABELS: Record<string, { label: string; icon: string; color: string; lightColor: string }> = {
  mercados: { label: 'Mercados & Finanzas', icon: '📈', color: '#3B82F6', lightColor: '#2563EB' },
  jubilados: { label: 'Jubilados & Pensionados', icon: '👴', color: '#F59E0B', lightColor: '#D97706' },
  trabajadores: { label: 'Sindicatos & Gremios', icon: '🛠️', color: '#EF4444', lightColor: '#DC2626' },
  campo: { label: 'Sector Agropecuario', icon: '🌾', color: '#22C55E', lightColor: '#16A34A' },
  'clase-media': { label: 'Clase Media Urbana', icon: '🏙️', color: '#8B5CF6', lightColor: '#7C3AED' },
  empresarios: { label: 'Grandes Empresarios', icon: '💼', color: '#06B6D4', lightColor: '#0891B2' },
  jovenes: { label: 'Juventud & Estudiantes', icon: '🎓', color: '#EC4899', lightColor: '#DB2777' },
  'fuerzas-seguridad': { label: 'Fuerzas de Seguridad', icon: '🛡️', color: '#64748B', lightColor: '#475569' },
};

export const SectorDonutChart: React.FC<SectorDonutChartProps> = ({ reputation }) => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  // Map reputation entries to primary display sectors
  const displaySectors = Object.keys(SECTOR_LABELS).map((key) => {
    const value = Math.max(5, Math.min(100, reputation[key as ReputationGroup] ?? 50));
    return {
      id: key,
      ...SECTOR_LABELS[key]!,
      value,
    };
  });

  const total = displaySectors.reduce((sum, s) => sum + s.value, 0);

  // Calculate SVG donut slices
  let accumulatedAngle = 0;
  const radius = 70;
  const strokeWidth = 24;
  const center = 90;

  const slices = displaySectors.map((sector) => {
    const percentage = sector.value / total;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      ...sector,
      pathData,
      percentage: Math.round(sector.value),
    };
  });

  const activeSector = hoveredSector
    ? slices.find((s) => s.id === hoveredSector)
    : slices[0];

  return (
    <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#161B22] border-[#30363D]'}`}>
      <div className="flex items-center justify-between border-b pb-3 mb-4 font-sans border-slate-200/50">
        <div>
          <h4 className={`text-sm font-extrabold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <span>📊</span> Reputación y Apoyo por Sectores Clave (Power BI)
          </h4>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Distribución del respaldo político y social ante las decisiones de gobierno.
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950/60 text-blue-300 border-blue-500/30'}`}>
          Live Analytics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* SVG Donut Chart */}
        <div className="relative flex flex-col items-center justify-center">
          <svg viewBox="0 0 180 180" className="w-48 h-48 drop-shadow-md">
            {slices.map((slice) => {
              const isHovered = hoveredSector === slice.id;
              return (
                <path
                  key={slice.id}
                  d={slice.pathData}
                  fill="none"
                  stroke={isLight ? slice.lightColor : slice.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSector(slice.id)}
                  onMouseLeave={() => setHoveredSector(null)}
                />
              );
            })}
          </svg>

          {/* Central Donut Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl">{activeSector?.icon ?? '🏛️'}</span>
            <span className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              {activeSector?.value ?? 50}%
            </span>
            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {activeSector?.label ?? 'Aprobación'}
            </span>
          </div>
        </div>

        {/* Legend Panel Power BI Style */}
        <div className="grid grid-cols-2 gap-2 text-xs font-sans">
          {slices.map((slice) => {
            const isHovered = hoveredSector === slice.id;
            const statusClass =
              slice.value >= 65
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : slice.value >= 40
                ? isLight ? 'text-slate-700' : 'text-slate-300'
                : isLight ? 'text-rose-700 font-bold' : 'text-rose-400 font-bold';

            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredSector(slice.id)}
                onMouseLeave={() => setHoveredSector(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? isLight
                      ? 'bg-blue-50 border-blue-300 shadow'
                      : 'bg-slate-800 border-amber-400 shadow'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: isLight ? slice.lightColor : slice.color }}
                  />
                  <span className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {slice.icon} {slice.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-sans">
                  <span className={statusClass}>
                    {slice.value >= 65 ? 'Favorable' : slice.value >= 40 ? 'Neutral' : 'Crítico'}
                  </span>
                  <span className={`font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {slice.value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
