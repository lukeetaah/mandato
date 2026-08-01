import { useState } from 'react';
import type { GameState, DeskObject, Decision } from '@engine/types';
import { useGameStore } from '@stores/game-store';
import { Button } from '@components/ui/Button';
import { getPacingMode } from '@engine/simulation';

export interface PresidentialDeskProps {
  gameState: GameState;
}

export const PresidentialDesk: React.FC<PresidentialDeskProps> = ({ gameState }) => {
  const makeChoice = useGameStore((s) => s.makeChoice);
  const nextTurn = useGameStore((s) => s.nextTurn);

  const { calendar, deskObjects, pendingDecisions, character, nation } = gameState;
  const [activeObject, setActiveObject] = useState<DeskObject | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [dismissedObjects, setDismissedObjects] = useState<Set<string>>(new Set());
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const safeDeskObjects = deskObjects ?? [];
  const visibleObjects = safeDeskObjects.filter(obj => !dismissedObjects.has(obj.id));
  const hasDecisionItems = visibleObjects.some(obj => obj.associatedDecisionId);
  const hasAnyItems = visibleObjects.length > 0;
  const pacingMode = getPacingMode(gameState);

  const timeGradients: Record<string, string> = {
    mañana: 'from-amber-900/40 via-sky-950/80 to-slate-950',
    tarde: 'from-sky-900/50 via-slate-950 to-slate-950',
    atardecer: 'from-amber-950/80 via-rose-950/60 to-slate-950',
    noche: 'from-slate-950 via-indigo-950/80 to-slate-950',
  };

  const weatherIcons: Record<string, string> = {
    despejado: '☀️',
    lluvia: '🌧️',
    niebla: '🌫️',
    tormenta: '🌩️',
    nieve: '❄️',
  };

  const activeDecision: Decision | undefined = activeObject?.associatedDecisionId
    ? pendingDecisions.find((d) => d.id === activeObject.associatedDecisionId)
    : undefined;

  const handleDismissReadOnly = (objId: string) => {
    setDismissedObjects(prev => {
      const next = new Set(prev);
      next.add(objId);
      return next;
    });
    setActiveObject(null);
    setSelectedChoiceId(null);
  };

  const handleChoiceClick = (choiceId: string) => {
    if (!activeDecision || !activeObject) return;
    if (selectedChoiceId === choiceId) {
      makeChoice(activeDecision, choiceId);
      setActiveObject(null);
      setSelectedChoiceId(null);
      setDismissedObjects(new Set());
    } else {
      setSelectedChoiceId(choiceId);
    }
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
    <div className="relative w-full min-h-[640px] rounded-3xl overflow-hidden border-4 border-[#3e2723] shadow-2xl bg-[#1a0f0a] flex flex-col justify-between font-serif selection:bg-amber-500/30">
      {/* ─── 1. VENTANAL DEL DESPACHO ─── */}
      <div className={`relative h-44 w-full bg-gradient-to-b ${timeGradients[timeOfDay] ?? timeGradients.mañana} p-6 flex justify-between items-start border-b-8 border-[#2d1b16] shadow-inner overflow-hidden`}>
        {weatherCondition === 'lluvia' && (
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}

        <div className="z-10 flex flex-col">
          <span className="text-amber-200/90 text-xs font-black tracking-widest uppercase font-sans flex items-center gap-2">
            🏛️ CASA DE GOBIERNO — DESPACHO PRESIDENCIAL
          </span>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight font-serif mt-1">
            {fortnight === 1 ? 'Primera quincena' : 'Segunda quincena'} de {calendar.monthCycleName} ({calendar.season} {calendar.year})
          </h2>
          {gameState.phase === 'opposition' && (
            <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-950/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-200 font-sans">
              OposiciÃ³n activa · prensa, redes y carpetas tambiÃ©n gobiernan
            </span>
          )}
        </div>

        <div className="z-10 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-900/40 text-xs text-amber-200 font-sans shadow-lg">
          <span>{weatherIcons[weatherCondition] ?? '☀️'} {weatherCondition.toUpperCase()}</span>
          <span>•</span>
          <span className="capitalize">{timeOfDay}</span>
          <span>•</span>
          <span className="text-sky-300 font-bold">Estrés: {character.stress}%</span>
        </div>
      </div>

      {/* ─── 2. LA MESA DEL ESCRITORIO ─── */}
      <div className="relative flex-1 bg-gradient-to-b from-[#2d1b16] via-[#241410] to-[#1a0f0a] p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d7ccc8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="flex justify-end items-center z-10 text-xs text-amber-300/70 font-sans mb-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[10px] text-amber-400/60 uppercase tracking-wider font-bold">Reservas</span>
              <span className={`font-bold text-sm ${nation.economy.reserves < 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {Math.round(nation.economy.reserves)}%
              </span>
            </div>
            <div className="text-right pl-3 border-l border-amber-900/40">
              <span className="block text-[10px] text-amber-400/60 uppercase tracking-wider font-bold">Popularidad</span>
              <span className="font-bold text-sm text-sky-400">{Math.round(character.popularity)}%</span>
            </div>
          </div>
        </div>

        {/* ─── OBJETOS FÍSICOS SOBRE EL ESCRITORIO ─── */}
        {visibleObjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto z-10">
            {visibleObjects.map((obj) => {
              const isUrgent = obj.urgency === 'critica' || obj.urgency === 'alta';
              const hasDecision = !!obj.associatedDecisionId;

              return (
                <div
                  key={obj.id}
                  onClick={() => { setActiveObject(obj); setSelectedChoiceId(null); }}
                  className={`p-5 rounded-2xl cursor-pointer transition-all transform hover:-translate-y-1.5 hover:shadow-2xl border ${
                    isUrgent
                      ? 'bg-rose-950/80 border-rose-500/60 shadow-lg shadow-rose-900/30'
                      : obj.type === 'diario'
                      ? 'bg-[#f4ecd8] text-slate-950 border-[#d3c59d] shadow-xl'
                      : 'bg-[#2a1711] text-amber-100 border-amber-800/60 hover:border-amber-400/60 shadow-lg'
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isUrgent ? 'bg-rose-600 text-white' : hasDecision ? 'bg-amber-600 text-white' : 'bg-amber-900/40 text-amber-300 border border-amber-700/40'
                    }`}>
                      {hasDecision ? (isUrgent ? 'URGENTE' : 'REQUIERE DECISIÓN') : 'INFORMATIVO'}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm leading-snug mb-1 ${obj.type === 'diario' ? 'font-serif text-slate-950' : 'text-slate-100'}`}>
                    {obj.title}
                  </h3>
                  <p className={`text-xs ${obj.type === 'diario' ? 'text-slate-700 font-serif italic' : 'text-amber-300/80 font-sans'}`}>
                    {obj.subtitle}
                  </p>

                  <div className="mt-3 pt-2 border-t border-amber-900/30 flex justify-between items-center text-[10px] font-sans font-bold">
                    <span className={hasDecision ? 'text-amber-300' : 'text-amber-400/70'}>
                      {hasDecision ? '⚖️ Abrir y resolver' : 'Inspeccionar ➔'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="my-auto z-10 text-center py-16">
            <span className="text-4xl block mb-4">🏛️</span>
            <p className="text-amber-300/60 text-sm font-sans">El escritorio está despejado.</p>
            <p className="text-amber-300/40 text-xs font-sans mt-1">
              No hay emergencias inmediatas. Podés avanzar quincena a quincena o realizar un Paneo Trimestral.
            </p>
          </div>
        )}

        {/* ─── 3. INSPECTOR DE DOCUMENTOS ─── */}
        {activeObject && (
          <div className="absolute inset-x-6 top-6 bottom-6 z-30 bg-[#f7f1df] text-slate-950 p-8 rounded-3xl border-8 border-[#4e342e] shadow-2xl overflow-y-auto font-serif">
            <div className="flex justify-between items-center border-b-2 border-slate-950 pb-4 mb-6 font-sans">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {activeObject.type === 'diario' ? '🗞️' : activeObject.type === 'telefono' ? '☎️' : activeObject.type === 'carta-gobernador' ? '✉️' : activeObject.type === 'encuesta' ? '📊' : '📁'}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    {activeDecision ? 'DOCUMENTO QUE REQUIERE SU DECISIÓN' : 'DOCUMENTO INFORMATIVO'}
                  </span>
                  <h2 className="text-xl font-black text-slate-950 leading-tight font-serif">
                    {activeObject.title}
                  </h2>
                </div>
              </div>
              {activeDecision ? (
                <button
                  onClick={() => { setActiveObject(null); setSelectedChoiceId(null); }}
                  className="px-4 py-2 text-xs font-bold rounded-xl border-2 border-slate-400 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  ← Volver a la mesa
                </button>
              ) : (
                <button
                  onClick={() => handleDismissReadOnly(activeObject.id)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white border-2 border-slate-600 hover:bg-slate-700 transition-all cursor-pointer shadow-md"
                >
                  ✕ Cerrar y archivar
                </button>
              )}
            </div>

            <div className="space-y-6 text-sm text-slate-900 leading-relaxed font-serif">
              <p className="text-base leading-relaxed bg-[#ede3c6] p-5 rounded-2xl border border-slate-400/60 font-serif italic">
                "{activeObject.inspectText}"
              </p>

              {activeDecision ? (
                <div className="space-y-4 font-sans pt-4 border-t border-slate-300">
                  <h4 className="font-extrabold text-slate-950 text-sm font-serif">
                    ¿Qué decidís hacer?
                  </h4>

                  {activeDecision.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;

                    return (
                      <div
                        key={choice.id}
                        className={`p-5 rounded-2xl transition-all border ${
                          isSelected
                            ? 'bg-slate-950 text-amber-200 border-slate-950 shadow-xl'
                            : 'bg-[#ebdcb9] text-slate-900 border-slate-400 hover:border-slate-800 cursor-pointer'
                        }`}
                        onClick={() => !isSelected && setSelectedChoiceId(choice.id)}
                      >
                        <h5 className="font-bold text-sm mb-1">{choice.label}</h5>
                        <p className={`text-xs mb-3 leading-relaxed font-serif ${isSelected ? 'text-amber-300/80' : 'text-slate-700'}`}>
                          {choice.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-[11px] font-semibold mb-3">
                          {choice.preview.gains.length > 0 && (
                            <span className={isSelected ? 'text-emerald-300' : 'text-emerald-700'}>
                              👍 {choice.preview.gains.map((g) => g.label).join(', ')}
                            </span>
                          )}
                          {choice.preview.losses.length > 0 && (
                            <span className={isSelected ? 'text-rose-300' : 'text-rose-700'}>
                              ⚠️ {choice.preview.losses.map((l) => l.label).join(', ')}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <Button
                            variant="gold"
                            size="sm"
                            className="w-full"
                            onClick={(e) => { e.stopPropagation(); handleChoiceClick(choice.id); }}
                          >
                            ⚠️ Firmar decreto y ejecutar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic font-sans">Este documento es informativo. Podés cerrarlo y archivarlo.</p>
              )}
            </div>
          </div>
        )}

        {/* ─── ADVERTENCIA DE NEGLIGENCIA ─── */}
        {showSkipWarning && (
          <div className="absolute inset-x-6 bottom-20 z-40 bg-rose-950/95 border-2 border-rose-500/60 p-6 rounded-2xl shadow-2xl font-sans text-center backdrop-blur-md">
            <p className="text-rose-200 text-sm font-bold mb-2">⚠️ Hay decisiones sin tomar en tu escritorio</p>
            <p className="text-rose-300/80 text-xs mb-4 leading-relaxed">
              No tomar ninguna decisión puede ser peor que tomar una mala.<br/>
              La inacción de un mandatario tiene consecuencias reales sobre el país.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowSkipWarning(false)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Volver y decidir
              </button>
              <button
                onClick={handleForceAdvance}
                className="px-5 py-2 text-xs font-bold rounded-xl border border-rose-500/60 text-rose-300 hover:bg-rose-900 transition-all cursor-pointer"
              >
                Avanzar sin decidir (asumí las consecuencias)
              </button>
            </div>
          </div>
        )}

        {/* ─── BARRA INFERIOR ─── */}
        <div className="flex justify-between items-center z-10 pt-4 border-t border-amber-900/40 font-sans">
          <span className="text-xs text-amber-300/60 font-medium">
            República del Sur — Período Constitucional 2032-2036
          </span>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[10px] text-amber-300/60 uppercase tracking-wider">
              {pacingMode === 'acelerado' ? 'Ritmo acelerado: informe al proximo asunto' : 'Ritmo quincenal: decisiones activas'}
            </span>
            <Button
              variant={hasAnyItems ? 'ghost' : 'gold'}
              size="md"
              onClick={hasAnyItems ? handleAdvance : () => { nextTurn(); setDismissedObjects(new Set()); }}
              className={hasDecisionItems ? 'text-amber-400' : hasAnyItems ? 'opacity-70 text-amber-400' : 'shadow-xl shadow-amber-500/20'}
            >
              {hasDecisionItems
                ? '⚖️ Asuntos que requieren decisión'
                : hasAnyItems
                ? '📋 Revisar asuntos pendientes'
                : 'Avanzar quincena ➔'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
