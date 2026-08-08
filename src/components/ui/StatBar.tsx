import React, { useState } from 'react';
import { useUIStore } from '@stores/ui-store';

export interface StatBarProps {
  label: string;
  value: number; // 0 a 100
  max?: number;
  color?: 'sky' | 'gold' | 'rose' | 'emerald' | 'purple';
  showPercentage?: boolean;
  tooltipTips?: {
    lowTip: string;
    midTip: string;
    highTip: string;
  };
}

const DIAGNOSTICS: Record<string, {
  meaning: string;
  worsenedBy: string;
  improvedBy: string;
  risks: string;
}> = {
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

export const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  max = 100,
  color = 'sky',
  showPercentage = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
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

  return (
    <div
      className={`w-full relative cursor-help ${showTooltip ? 'z-30' : 'z-0'}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
        <span className={`transition-colors flex items-center gap-1 ${isLight ? 'text-slate-700 hover:text-sky-600' : 'text-slate-300 hover:text-sky-300'}`}>
          {label} <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>ℹ️</span>
        </span>
        {showPercentage && <span className={`font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{Math.round(value)}%</span>}
      </div>

      <div className={`w-full rounded-full h-2 overflow-hidden border ${isLight ? 'bg-slate-200 border-slate-300/50' : 'bg-slate-800/80 border-slate-700/50'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Tooltip con diagnóstico educativo y personalizado */}
      {showTooltip && (
        <div className={`absolute left-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] p-3.5 rounded-2xl border text-xs shadow-2xl backdrop-blur-md pointer-events-none space-y-2 ${
          isLight ? 'bg-white/95 border-slate-200 text-slate-800' : 'bg-slate-950/95 border-sky-500/40 text-slate-200'
        }`}>
          <div className={`flex justify-between items-center border-b pb-1.5 font-bold ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <span className={isLight ? 'text-sky-600' : 'text-sky-400'}>{label} ({Math.round(value)}%)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded ${isLight ? 'text-amber-800 bg-amber-100' : 'text-amber-300 bg-amber-950/60'}`}>{statusLevel}</span>
          </div>

          <p className={`text-[11px] italic ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{diag.meaning}</p>

          <div className="space-y-1 text-[10px]">
            <div><span className="text-rose-500 font-semibold">Lo empeora:</span> <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{diag.worsenedBy}</span></div>
            <div><span className="text-emerald-500 font-semibold">Lo mejora:</span> <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{diag.improvedBy}</span></div>
            <div><span className="text-amber-500 font-semibold">Riesgos latentes:</span> <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{diag.risks}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
