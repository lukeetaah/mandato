import React, { useState } from 'react';
import type { CalendarState } from '@engine/types';
import { useGameStore } from '@stores/game-store';
import { Badge } from '@components/ui/Badge';
import { Modal } from '@components/ui/Modal';

export interface CalendarWidgetProps {
  calendar: CalendarState;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_SHORT = [
  'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
  'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
];

const SEASON_EMOJIS: Record<string, string> = {
  'Verano': '☀️',
  'Otoño': '🍂',
  'Invierno': '❄️',
  'Primavera': '🌸',
};

// Descriptores institucionales y coyunturales dinámicos (sin nombres literales ni fechas rígidas)
const MONTH_DYNAMIC_DESCRIPTORS: Record<number, string> = {
  1: '🌴 Receso institucional y turismo',
  2: '💼 Rondas paritarias iniciales',
  3: '🏛️ Apertura legislativa ordinaria',
  4: '🌾 Temporada agrícola fina',
  5: '🇦🇷 Celebración nacional patria',
  6: '⚡ Alta demanda energética invernal',
  7: '❄️ Receso escolar e inspección fiscal',
  8: '🗳️ Clima e inicio de campaña',
  9: '🌾 Temporada agrícola gruesa',
  10: '🗳️ Definición electoral nacional',
  11: '📊 Revisión presupuestaria anual',
  12: '📜 Cierre fiscal y balance del Tesoro',
};

export const CalendarWidget: React.FC<CalendarWidgetProps> = () => {
  const gameState = useGameStore((s) => s.gameState);

  const [selectedYear, setSelectedYear] = useState<number>(gameState?.calendar.year ?? 2032);
  const [inspectMonth, setInspectMonth] = useState<number | null>(null);
  const [activeItemDetail, setActiveItemDetail] = useState<string | null>(null);

  if (!gameState) return null;

  const { calendar, eventLog, hemeroteca, scars, activeDelayedEffects, nation } = gameState;
  const currentYear = calendar.year;
  const currentMonth = calendar.month;

  const availableYears = Array.from(
    { length: Math.max(1, currentYear - 2032 + 1) },
    (_, i) => 2032 + i
  );

  const getTurnsForMonth = (year: number, month: number): [number, number] => {
    const startTurn = ((year - 2032) * 12 + (month - 1)) * 2 + 1;
    return [startTurn, startTurn + 1];
  };

  const getMonthSummary = (year: number, month: number) => {
    const [t1, t2] = getTurnsForMonth(year, month);

    const logsInMonth = eventLog.filter((log) => log.turn === t1 || log.turn === t2);
    const decisionsCount = logsInMonth.filter((l) => l.type === 'decision').length;
    const eventsCount = logsInMonth.filter((l) => l.type === 'event' || l.type === 'scandal').length;
    const electionsCount = logsInMonth.filter((l) => l.type === 'election').length;
    
    const issueInMonth = hemeroteca.find((h) => h.year === year && h.month === month);
    const scarsInMonth = scars.filter((s) => s.year === year && (s.originTurn === t1 || s.originTurn === t2));
    const delayedInMonth = activeDelayedEffects.filter((d) => d.originTurn === t1 || d.originTurn === t2);

    // Calcular pronósticos / avisos para el futuro
    const isFutureOrCurrent = year > currentYear || (year === currentYear && month >= currentMonth);
    const monthsDiff = (year - currentYear) * 12 + (month - currentMonth);

    const forecasts: string[] = [];
    if (isFutureOrCurrent) {
      if (calendar.turnsUntilLegislative <= monthsDiff * 2 + 2 && calendar.turnsUntilLegislative >= monthsDiff * 2) {
        forecasts.push('🗳️ Elecciones legislativas en agenda');
      }
      if (calendar.turnsUntilPresidential <= monthsDiff * 2 + 2 && calendar.turnsUntilPresidential >= monthsDiff * 2) {
        forecasts.push('🏛️ Elecciones presidenciales en agenda');
      }
      if (month === 11) {
        forecasts.push('📊 Debate del presupuesto nacional');
      }
      if (month === 6 || month === 7) {
        forecasts.push('⚡ Pico de demanda energética');
      }
      if (nation.economy.reserves < 25) {
        forecasts.push('🚨 Alerta de tensión de divisas');
      }
      if (nation.society.socialConflicts > 50) {
        forecasts.push('⚠️ Riesgo de protestas gremiales');
      }
    }

    return {
      t1,
      t2,
      logsInMonth,
      decisionsCount,
      eventsCount,
      electionsCount,
      issueInMonth,
      scarsInMonth,
      delayedInMonth,
      forecasts,
      hasActivity: logsInMonth.length > 0 || !!issueInMonth || scarsInMonth.length > 0 || forecasts.length > 0,
    };
  };

  const inspectedData = inspectMonth !== null ? getMonthSummary(selectedYear, inspectMonth) : null;
  const inspectedMonthName = inspectMonth !== null ? MONTH_NAMES[inspectMonth - 1] : '';

  return (
    <div className="space-y-4">
      {/* Marco principal del Calendario de Pared */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
        
        {/* Encabezado estilo Calendario de Pared y Herramienta de Planificación */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wider text-slate-100 uppercase">
                  Calendario de pared y planificación
                </h3>
                <Badge variant="gold">{calendar.season}</Badge>
              </div>
              <p className="text-xs text-slate-400">
                {calendar.monthCycleName} · {MONTH_NAMES[calendar.month - 1]} de {calendar.year} ( Quincena {calendar.fortnight} )
              </p>
            </div>
          </div>

          {/* Selector de Año */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Año de gestión:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rejilla de los 12 meses de pared con tarjetas y tensión visible a simple vista */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
          {Array.from({ length: 12 }, (_, idx) => {
            const monthNum = idx + 1;
            const isPast = selectedYear < currentYear || (selectedYear === currentYear && monthNum < currentMonth);
            const isCurrent = selectedYear === currentYear && monthNum === currentMonth;
            const isFuture = selectedYear > currentYear || (selectedYear === currentYear && monthNum > currentMonth);

            const summary = getMonthSummary(selectedYear, monthNum);
            const dynamicDescriptor = MONTH_DYNAMIC_DESCRIPTORS[monthNum];
            const season = idx < 2 || idx === 11 ? 'Verano' : idx < 5 ? 'Otoño' : idx < 8 ? 'Invierno' : 'Primavera';
            const seasonIcon = SEASON_EMOJIS[season];

            return (
              <button
                key={monthNum}
                onClick={() => {
                  setInspectMonth(monthNum);
                  setActiveItemDetail(null);
                }}
                className={`relative group p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[125px] ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-400/90 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40'
                    : isPast
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/80'
                    : 'bg-slate-950/30 border-slate-800/40 text-slate-500 hover:border-slate-700/60'
                }`}
              >
                {/* Cabecera del Mes */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{seasonIcon}</span>
                    <span className={`font-black text-xs tracking-wider ${isCurrent ? 'text-amber-300' : isPast ? 'text-slate-200' : 'text-slate-500'}`}>
                      {MONTH_SHORT[idx]}
                    </span>
                  </div>

                  {/* Estado del Mes */}
                  {isPast && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                      ✓ ENE
                    </span>
                  )}
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/50 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Hoy
                    </span>
                  )}
                  {isFuture && (
                    <span className="text-[10px] text-slate-600 font-medium">
                      Próximo
                    </span>
                  )}
                </div>

                {/* Descriptor dinámico del mes */}
                {dynamicDescriptor && (
                  <div className="text-[10px] text-slate-400 truncate my-1">
                    {dynamicDescriptor}
                  </div>
                )}

                {/* Píldoras de tensión a simple vista */}
                {isCurrent && (
                  <div className="flex flex-wrap gap-1 my-1">
                    <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${nation.economy.inflation > 50 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-400'}`}>
                      ⚠️ Economía
                    </span>
                    <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${nation.society.socialConflicts > 45 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400'}`}>
                      🟡 Protestas
                    </span>
                  </div>
                )}

                {/* Pronóstico futuro en tarjeta */}
                {isFuture && summary.forecasts.length > 0 && (
                  <div className="text-[9px] text-sky-400 font-semibold truncate my-1">
                    {summary.forecasts[0]}
                  </div>
                )}

                {/* Badges de Actividad en el Mes */}
                <div className="mt-auto pt-1.5 flex flex-wrap gap-1 items-center">
                  {summary.decisionsCount > 0 && (
                    <span className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/80 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1" title="Decisiones ejecutadas">
                      📋 {summary.decisionsCount}
                    </span>
                  )}
                  {summary.eventsCount > 0 && (
                    <span className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/80 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1" title="Acontecimientos especiales">
                      ⚡ {summary.eventsCount}
                    </span>
                  )}
                  {summary.electionsCount > 0 && (
                    <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/80 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1" title="Jornada electoral">
                      🗳️ {summary.electionsCount}
                    </span>
                  )}
                  {!summary.hasActivity && isPast && (
                    <span className="text-[10px] text-slate-600 italic">Sin novedades</span>
                  )}
                </div>

                <div className="absolute inset-0 rounded-xl bg-amber-400/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Inspección del Mes (Timeline compacto con tarjetas e interactividad) */}
      <Modal
        isOpen={inspectMonth !== null}
        onClose={() => {
          setInspectMonth(null);
          setActiveItemDetail(null);
        }}
        title={`Línea temporal — ${inspectedMonthName} de ${selectedYear}`}
      >
        {inspectedData && (
          <div className="space-y-4 text-xs font-sans">
            {/* Cabecera del mes consultado */}
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">
                  Período consultado
                </span>
                <span className="text-sm font-bold text-slate-100">
                  {inspectedMonthName} de {selectedYear}
                </span>
              </div>
              <Badge variant={inspectedData.hasActivity ? 'gold' : 'slate'}>
                {inspectedData.hasActivity ? 'Registrado' : 'Sin eventos'}
              </Badge>
            </div>

            {/* Pronósticos y alertas futuras para este mes */}
            {inspectedData.forecasts.length > 0 && (
              <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl space-y-1">
                <span className="font-bold text-sky-300 block">🔮 Próximos acontecimientos y alertas</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {inspectedData.forecasts.map((f, idx) => (
                    <span key={idx} className="bg-sky-900/50 text-sky-200 border border-sky-700/60 px-2 py-1 rounded text-[11px] font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline compacto de tarjetas interactivas */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <span>📋</span> Decisiones y decretos del mes
              </h4>
              {inspectedData.logsInMonth.filter((l) => l.type === 'decision').length === 0 ? (
                <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  No se registraron firmas ni decretos durante este mes.
                </p>
              ) : (
                <div className="space-y-2">
                  {inspectedData.logsInMonth
                    .filter((l) => l.type === 'decision')
                    .map((log, idx) => {
                      const itemKey = `dec-${idx}`;
                      const isExpanded = activeItemDetail === itemKey;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveItemDetail(isExpanded ? null : itemKey)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-slate-900 border-sky-400 ring-1 ring-sky-400/30'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sky-300">{log.title}</span>
                            <span className="text-[10px] text-sky-400 font-semibold underline">
                              {isExpanded ? 'Ocultar detalles ▲' : 'Ver decreto completo ▼'}
                            </span>
                          </div>
                          <p className="text-slate-300">{log.description}</p>
                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                              {log.emotionalText && (
                                <p className="text-amber-300 italic font-serif bg-slate-950 p-2 rounded border border-slate-800">
                                  💬 "{log.emotionalText}"
                                </p>
                              )}
                              <p className="text-slate-400">
                                Registrado formalmente en los archivos de la Presidencia en el Turno {log.turn}.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Acontecimientos e hitos */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                <span>⚡</span> Acontecimientos coyunturales
              </h4>
              {inspectedData.logsInMonth.filter((l) => l.type !== 'decision').length === 0 ? (
                <p className="text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  Sin crisis ni sacudidas extraordinarias en este período.
                </p>
              ) : (
                <div className="space-y-2">
                  {inspectedData.logsInMonth
                    .filter((l) => l.type !== 'decision')
                    .map((log, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-amber-300">{log.title}</span>
                          <Badge variant="slate">{log.type}</Badge>
                        </div>
                        <p className="text-slate-300">{log.description}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Titular de prensa */}
            {inspectedData.issueInMonth && (
              <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  📰 Cobertura de prensa del mes — {inspectedData.issueInMonth.mainHeadline.outletName}
                </span>
                <div className="font-serif font-bold text-slate-100">
                  "{inspectedData.issueInMonth.mainHeadline.title}"
                </div>
                <p className="text-slate-300 italic text-[11px]">
                  {inspectedData.issueInMonth.editorialText}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setInspectMonth(null);
                  setActiveItemDetail(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar línea temporal
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


