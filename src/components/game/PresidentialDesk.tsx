import { useState } from 'react';
import type { GameState, DeskObject } from '@engine/types';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';
import { Button } from '@components/ui/Button';
import { getPacingMode } from '@engine/simulation';

export interface PresidentialDeskProps {
  gameState: GameState;
}

export const PresidentialDesk: React.FC<PresidentialDeskProps> = ({ gameState }) => {
  const nextTurn = useGameStore((s) => s.nextTurn);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const { calendar, deskObjects, character, nation } = gameState;
  const [activeObject, setActiveObject] = useState<DeskObject | null>(null);
  const [dismissedObjects, setDismissedObjects] = useState<Set<string>>(new Set());
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const safeDeskObjects = deskObjects ?? [];
  const visibleObjects = safeDeskObjects.filter(obj => {
    if (dismissedObjects.has(obj.id)) return false;
    if (obj.id.startsWith('desk-report-') && obj.inspectText.includes('No hubo sobresaltos nacionales')) return false;
    return true;
  });
  const hasDecisionItems = visibleObjects.some(obj => obj.associatedDecisionId);
  const informationalItems = visibleObjects.filter(obj => !obj.associatedDecisionId);
  const pacingMode = getPacingMode(gameState);

  const weatherIcons: Record<string, string> = {
    despejado: '☀️',
    lluvia: '🌧️',
    niebla: '🌫️',
    tormenta: '🌩️',
    nieve: '❄️',
  };

  const handleObjectClick = (obj: DeskObject) => {
    if (obj.associatedDecisionId) {
      const el = document.getElementById('asuntos-urgentes');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    setActiveObject(obj);
  };

  const handleDismissReadOnly = (objId: string) => {
    setDismissedObjects(prev => {
      const next = new Set(prev);
      next.add(objId);
      return next;
    });
    setActiveObject(null);
  };

  const handleAdvance = () => {
    if (hasDecisionItems) {
      setShowSkipWarning(true);
      return;
    }
    nextTurn();
    setDismissedObjects(new Set());
  };

  const handleForceAdvance = () => {
    setShowSkipWarning(false);
    nextTurn();
    setDismissedObjects(new Set());
  };

  const timeOfDay = calendar.timeOfDay ?? 'mañana';
  const weatherCondition = calendar.weatherCondition ?? 'despejado';
  const fortnight = calendar.fortnight ?? 1;

  return (
    <div className={`relative w-full min-h-[560px] md:min-h-[640px] rounded-2xl md:rounded-3xl overflow-hidden border flex flex-col justify-between font-sans transition-colors ${
      isLight
        ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
        : 'bg-[#161B22] border-[#30363D] text-[#F8FAFC] shadow-2xl selection:bg-[#3B82F6]/30'
    }`}>
      {/* ─── 1. CABECERA DEL DESPACHO ─── */}
      <div className={`relative min-h-36 w-full p-6 flex flex-col gap-4 md:flex-row md:justify-between md:items-start border-b ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161B22] border-[#30363D]'
      }`}>
        {weatherCondition === 'lluvia' && (
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        <div className="z-10 flex flex-col">
          <span className="text-[#3B82F6] text-xs font-black tracking-widest uppercase leading-relaxed font-sans flex items-center gap-2">
            🏛️ CASA DE GOBIERNO — DESPACHO PRESIDENCIAL
          </span>
          <h2 className={`text-xl font-bold tracking-tight font-sans mt-1 ${isLight ? 'text-slate-900' : 'text-[#F8FAFC]'}`}>
            {fortnight === 1 ? 'Primera quincena' : 'Segunda quincena'} de {calendar.monthCycleName} ({calendar.season} {calendar.year})
          </h2>
          {gameState.phase === 'opposition' && (
            <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#EF4444] font-sans">
              Oposición activa · prensa, redes y carpetas también gobiernan
            </span>
          )}
        </div>

        <div className={`z-10 self-start md:self-auto w-full md:w-auto flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-2xl border text-xs font-sans shadow-sm font-bold ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0D1117] border-[#30363D] text-[#F8FAFC]'
        }`}>
          <span>{weatherIcons[weatherCondition] ?? '☀️'} {weatherCondition.toUpperCase()}</span>
          <span className={isLight ? 'text-slate-400' : 'text-[#94A3B8]'}>•</span>
          <span className={`capitalize ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>{timeOfDay}</span>
          <span className={isLight ? 'text-slate-400' : 'text-[#94A3B8]'}>•</span>
          <span className="text-[#3B82F6]">Estrés: {character.stress}%</span>
        </div>
      </div>

      {/* ─── 2. LA MESA DEL ESCRITORIO ─── */}
      <div className={`relative flex-1 p-6 md:p-8 flex flex-col justify-between overflow-hidden ${
        isLight ? 'bg-slate-100/70' : 'bg-[#0D1117]'
      }`}>
        <div className={`flex justify-end items-center z-10 text-xs font-sans mb-4 ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className={`block text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>Reservas Centrales</span>
              <span className={`font-bold text-sm ${nation.economy.reserves < 25 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                {Math.round(nation.economy.reserves)}%
              </span>
            </div>
            <div className={`text-right pl-4 border-l ${isLight ? 'border-slate-300' : 'border-[#30363D]'}`}>
              <span className={`block text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>Popularidad</span>
              <span className="font-bold text-sm text-[#3B82F6]">{Math.round(character.popularity)}%</span>
            </div>
          </div>
        </div>

        {/* ─── OBJETOS FÍSICOS SOBRE EL ESCRITORIO ─── */}
        {visibleObjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-auto z-10">
            {visibleObjects.map((obj) => {
              const isUrgent = obj.urgency === 'critica' || obj.urgency === 'alta';
              const hasDecision = !!obj.associatedDecisionId;

              return (
                <div
                  key={obj.id}
                  onClick={() => handleObjectClick(obj)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-md border ${
                    isUrgent
                      ? isLight
                        ? 'bg-rose-50 border-rose-400 text-slate-900 shadow-sm'
                        : 'bg-[#1E293B] border-[#EF4444] text-[#F8FAFC] shadow-red-500/10'
                      : isLight
                        ? 'bg-white text-slate-900 border-slate-200 hover:border-blue-500'
                        : 'bg-[#1E293B] text-[#F8FAFC] border-[#334155] hover:border-[#3B82F6]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 font-sans">
                    <span className="text-xl">
                      {obj.type === 'diario' && '🗞️'}
                      {obj.type === 'expediente' && '📁'}
                      {obj.type === 'carpeta-roja' && '🔴'}
                      {obj.type === 'carta-gobernador' && '✉️'}
                      {obj.type === 'telefono' && '☎️'}
                      {obj.type === 'encuesta' && '📊'}
                      {obj.type === 'informe-inteligencia' && '🕵️'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-2xl uppercase tracking-wider ${
                      isUrgent
                        ? 'bg-rose-600 text-white'
                        : hasDecision
                        ? 'bg-blue-600 text-white'
                        : isLight
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-900/40 text-amber-300 border border-amber-700/40'
                    }`}>
                      {hasDecision ? (isUrgent ? 'URGENTE' : 'REQUIERE DECISIÓN') : 'INFORMATIVO'}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm leading-snug mb-1 ${isLight ? 'text-slate-900' : 'text-[#F8FAFC]'}`}>
                    {obj.title}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                    {obj.subtitle}
                  </p>

                  <div className={`mt-3 pt-2 border-t flex justify-between items-center text-[10px] font-sans font-bold ${
                    isLight ? 'border-slate-200' : 'border-[#334155]/60'
                  }`}>
                    <span className={hasDecision ? 'text-blue-600 font-extrabold' : isLight ? 'text-slate-500' : 'text-amber-400/70'}>
                      {hasDecision ? '⚖️ Ver opciones abajo ➔' : 'Inspeccionar ➔'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="my-auto z-10 text-center py-16">
            <span className="text-4xl block mb-4">🏛️</span>
            <p className={`text-sm font-sans font-bold ${isLight ? 'text-slate-600' : 'text-[#94A3B8]'}`}>El escritorio está despejado.</p>
            <p className={`text-xs font-sans mt-1 ${isLight ? 'text-slate-400' : 'text-[#94A3B8]/70'}`}>
              No hay emergencias inmediatas. Podés avanzar quincena a quincena.
            </p>
          </div>
        )}

        {/* ─── 3. INSPECTOR DE DOCUMENTOS INFORMATIVOS ─── */}
        {activeObject && (
          <div className={`absolute inset-x-2 sm:inset-x-4 md:inset-x-6 top-2 sm:top-4 md:top-6 bottom-2 sm:bottom-4 md:bottom-6 z-30 p-6 sm:p-8 rounded-2xl md:rounded-3xl border shadow-2xl overflow-y-auto font-sans ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#161B22] border-[#30363D] text-[#F8FAFC]'
          }`}>
            <div className={`flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start border-b pb-4 mb-6 ${
              isLight ? 'border-slate-200' : 'border-[#30363D]'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {activeObject.type === 'diario' ? '🗞️' : activeObject.type === 'telefono' ? '☎️' : activeObject.type === 'carta-gobernador' ? '✉️' : activeObject.type === 'encuesta' ? '📊' : '📁'}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#3B82F6]">
                    DOCUMENTO INFORMATIVO
                  </span>
                  <h2 className={`text-lg sm:text-xl font-black leading-tight break-words ${isLight ? 'text-slate-900' : 'text-[#F8FAFC]'}`}>
                    {activeObject.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => handleDismissReadOnly(activeObject.id)}
                className="w-full sm:w-auto shrink-0 px-4 py-2 text-xs font-bold rounded-2xl bg-[#3B82F6] text-white border border-[#2563EB] hover:bg-[#2563EB] transition-all cursor-pointer shadow-md"
              >
                ✕ Cerrar y archivar
              </button>
            </div>

            <div className="space-y-6 text-sm leading-relaxed">
              <p className={`text-base leading-relaxed p-5 rounded-2xl border italic ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
              }`}>
                "{activeObject.inspectText}"
              </p>
              <p className={`text-xs italic font-sans ${isLight ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                Este documento es informativo. Podés cerrarlo y seguir adelante.
              </p>
            </div>
          </div>
        )}

        {/* ─── ADVERTENCIA DE NEGLIGENCIA ─── */}
        {showSkipWarning && (
          <div className="absolute inset-x-2 sm:inset-x-4 md:inset-x-6 bottom-20 z-40 bg-rose-950/95 border-2 border-rose-500/60 p-4 sm:p-6 rounded-2xl shadow-2xl font-sans text-center backdrop-blur-md">
            <p className="text-rose-200 text-sm font-bold mb-2">⚠️ Hay decisiones sin tomar en tu escritorio</p>
            <p className="text-rose-300/80 text-xs mb-4 leading-relaxed">
              No tomar ninguna decisión puede ser peor que tomar una mala.<br/>
              La inacción de un mandatario tiene consecuencias reales sobre el país.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setShowSkipWarning(false)}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Volver y decidir
              </button>
              <button
                onClick={handleForceAdvance}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl border border-rose-500/60 text-rose-300 hover:bg-rose-900 transition-all cursor-pointer"
              >
                Avanzar sin decidir (asumí las consecuencias)
              </button>
            </div>
          </div>
        )}

        {/* ─── BARRA INFERIOR ─── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center z-10 pt-4 border-t border-amber-900/40 font-sans">
          <span className="text-center sm:text-left text-xs text-amber-300/60 font-medium">
            República del Sur — Período Constitucional 2032-2036
          </span>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[10px] text-amber-300/60 uppercase tracking-wider">
              {pacingMode === 'acelerado' ? 'Ritmo acelerado: informe al proximo asunto' : 'Ritmo quincenal: decisiones activas'}
            </span>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <Button
                variant={hasDecisionItems ? 'ghost' : 'gold'}
                size="lg"
                onClick={handleAdvance}
                className={`w-full sm:w-auto min-w-[220px] font-black tracking-wide ${hasDecisionItems ? 'border border-amber-400/60 text-amber-300' : 'shadow-xl shadow-amber-500/30'}`}
              >
                ▶ AVANZAR QUINCENA
              </Button>
              {hasDecisionItems ? (
                <span className="text-center text-[11px] font-bold text-rose-300 sm:text-right">
                  Asuntos que requieren atención · {visibleObjects.filter((obj) => obj.associatedDecisionId).length} decisión{visibleObjects.filter((obj) => obj.associatedDecisionId).length === 1 ? '' : 'es'}
                </span>
              ) : informationalItems.length > 0 ? (
                <span className="text-center text-[11px] text-amber-300/70 sm:text-right">
                  Asuntos que requieren atención · informativos, podés abrirlos o seguir adelante
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
