import React, { useState } from 'react';
import type { ReputationGroup } from '@engine/types';
import { useUIStore } from '@stores/ui-store';
import { Modal } from '@components/ui/Modal';

export interface SectorDonutChartProps {
  reputation: Record<ReputationGroup, number>;
}

interface SectorInfo {
  id: string;
  label: string;
  icon: string;
  color: string;
  lightColor: string;
  recentImpact: string;
  advisorRecommendation: string;
  idealActions: string[];
}

const SECTOR_DETAILS: Record<string, SectorInfo> = {
  mercados: {
    id: 'mercados',
    label: 'Mercados y finanzas',
    icon: '📈',
    color: '#3B82F6',
    lightColor: '#2563EB',
    recentImpact: 'Sensible a la estabilidad del tipo de cambio, inflación y nivel de reservas del Banco Central.',
    advisorRecommendation: 'Para ganar la confianza de los inversores, mantené la disciplina fiscal y evitá la emisión monetaria desenfrenada.',
    idealActions: ['Acumular reservas en el Banco Central', 'Reducir el déficit fiscal', 'Firmar acuerdos de inversión internacional'],
  },
  jubilados: {
    id: 'jubilados',
    label: 'Jubilados y pensionados',
    icon: '👴',
    color: '#F59E0B',
    lightColor: '#D97706',
    recentImpact: 'Directamente afectados por la inflación de la canasta alimentaria y los aumentos de haberes.',
    advisorRecommendation: 'Este sector requiere previsibilidad en los aumentos de moratoria y cobertura médica sin cortes de servicios.',
    idealActions: ['Actualizar los haberes por encima de la inflación', 'Proteger los descuentos en remedios esenciales'],
  },
  trabajadores: {
    id: 'trabajadores',
    label: 'Sindicatos y gremios',
    icon: '🛠️',
    color: '#EF4444',
    lightColor: '#DC2626',
    recentImpact: 'Supervisan las paritarias salariales, los puestos formales de empleo y el costo de vida.',
    advisorRecommendation: 'Si el poder adquisitivo se desploma, convocar a paritarias abiertas evita paros generales y marchas.',
    idealActions: ['Homologar convenios colectivos de trabajo', 'Evitar recortes masivos en obras públicas'],
  },
  campo: {
    id: 'campo',
    label: 'Sector agropecuario',
    icon: '🌾',
    color: '#22C55E',
    lightColor: '#16A34A',
    recentImpact: 'Reacciona al nivel de retenciones, el valor del dólar de exportación y la infraestructura vial rural.',
    advisorRecommendation: 'Reducir las trabas a la exportación libera la liquidación de granos y mejora el ingreso de divisas.',
    idealActions: ['Quitar retenciones a las economías regionales', 'Reparar rutas y caminos rurales'],
  },
  'clase-media': {
    id: 'clase-media',
    label: 'Clase media urbana',
    icon: '🏙️',
    color: '#8B5CF6',
    lightColor: '#7C3AED',
    recentImpact: 'Sensible a las tarifas de servicios públicos, el empleo formal y la seguridad en la vía pública.',
    advisorRecommendation: 'Sostener el consumo y controlar los servicios clave evita el desencanto electoral del sector centro.',
    idealActions: ['Mantener créditos de consumo', 'Mejorar patrullaje y seguridad en centros urbanos'],
  },
  empresarios: {
    id: 'empresarios',
    label: 'Grandes empresarios',
    icon: '💼',
    color: '#06B6D4',
    lightColor: '#0891B2',
    recentImpact: 'Buscan seguridad jurídica, baja presión impositiva y acceso a insumos importados.',
    advisorRecommendation: 'Simplificar los trámites y bajar impuestos a la producción fomenta la inversión privada a largo plazo.',
    idealActions: ['Promover licitaciones transparentes', 'Bajar impuestos provinciales y tasas industriales'],
  },
  jovenes: {
    id: 'jovenes',
    label: 'Juventud y estudiantes',
    icon: '🎓',
    color: '#EC4899',
    lightColor: '#DB2777',
    recentImpact: 'Priorizan las becas educativas, el primer empleo, la tecnología y las libertades individuales.',
    advisorRecommendation: 'Apoyar el presupuesto universitario y las becas científicas asegura su respaldo y evita marchas.',
    idealActions: ['Garantizar el presupuesto universitario', 'Incentivar startups y empleos tecnológicos'],
  },
  'fuerzas-seguridad': {
    id: 'fuerzas-seguridad',
    label: 'Fuerzas de seguridad',
    icon: '🛡️',
    color: '#64748B',
    lightColor: '#475569',
    recentImpact: 'Observan el equipamiento policial, la escala salarial y el respaldo político ante el delito.',
    advisorRecommendation: 'Invertir en equipamiento y dar respaldo legal a la patrulla urbana mantiene la disciplina.',
    idealActions: ['Mejorar salarios de las fuerzas de seguridad', 'Renovar equipamiento y tecnología de vigilancia'],
  },
};

export const SectorDonutChart: React.FC<SectorDonutChartProps> = ({ reputation }) => {
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorInfo | null>(null);

  const displaySectors = Object.keys(SECTOR_DETAILS).map((key) => {
    const value = Math.max(5, Math.min(100, reputation[key as ReputationGroup] ?? 50));
    return {
      ...SECTOR_DETAILS[key]!,
      value,
    };
  });

  const total = displaySectors.reduce((sum, s) => sum + s.value, 0);

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
    <div className={`p-5 rounded-2xl border font-sans ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#161B22] border-[#30363D]'}`}>
      <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-200/50">
        <div>
          <h4 className={`text-sm font-extrabold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <span>📊</span> Respaldo y reputación por sectores clave
          </h4>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Hacé clic en cualquier sector para recibir el informe de tu asesor político.
          </p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-2xl border ${
          isLight ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-blue-950/60 text-blue-300 border-blue-500/30'
        }`}>
          Análisis de opinión
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
                  onClick={() => setSelectedSector(slice)}
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
            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {activeSector?.label ?? 'Aprobación'}
            </span>
          </div>
        </div>

        {/* Dynamic Cards Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {slices.map((slice) => {
            const isHovered = hoveredSector === slice.id;
            const statusClass =
              slice.value >= 65
                ? isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold'
                : slice.value >= 40
                ? isLight ? 'text-slate-700' : 'text-slate-300'
                : isLight ? 'text-rose-700 font-bold' : 'text-rose-400 font-bold';

            return (
              <button
                type="button"
                key={slice.id}
                onMouseEnter={() => setHoveredSector(slice.id)}
                onMouseLeave={() => setHoveredSector(null)}
                onClick={() => setSelectedSector(slice)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isHovered
                    ? isLight
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-slate-800 border-amber-400 shadow-sm'
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
                  <span className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    {slice.icon} {slice.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={statusClass}>
                    {slice.value >= 65 ? 'Favorable' : slice.value >= 40 ? 'Neutral' : 'Crítico'}
                  </span>
                  <span className={`font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {slice.value}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Asesor Político al hacer click */}
      {selectedSector && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSector(null)}
          title={`👔 Informe del asesor político: ${selectedSector.label}`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isLight ? 'bg-blue-50 border-blue-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
            }`}>
              <span className="text-3xl shrink-0">{selectedSector.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm">{selectedSector.label}</h4>
                  {(() => {
                    const sectorVal = reputation[selectedSector.id as ReputationGroup] ?? 50;
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sectorVal >= 65
                          ? 'bg-emerald-100 text-emerald-800'
                          : sectorVal >= 40
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sectorVal}% de aprobación
                      </span>
                    );
                  })()}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedSector.recentImpact}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className={`font-extrabold text-xs flex items-center gap-1.5 uppercase tracking-wider ${
                isLight ? 'text-amber-800' : 'text-amber-300'
              }`}>
                <span>💬</span> Diagnóstico y sugerencia del asesor
              </h5>
              <p className={`p-3 rounded-2xl border leading-relaxed italic ${
                isLight ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}>
                "{selectedSector.advisorRecommendation}"
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <h5 className={`font-extrabold text-xs uppercase tracking-wider ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Medidas recomendadas para elevar el apoyo:
              </h5>
              <ul className="space-y-1.5">
                {selectedSector.idealActions.map((action, i) => (
                  <li key={i} className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
