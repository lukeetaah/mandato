import { useState } from 'react';
import type { GameState, DeskObject, Decision } from '@engine/types';
import { useGameStore } from '@stores/game-store';
import { Button } from '@components/ui/Button';

export interface PresidentialDeskProps {
  gameState: GameState;
}

export const PresidentialDesk: React.FC<PresidentialDeskProps> = ({ gameState }) => {
  const makeChoice = useGameStore((s) => s.makeChoice);
  const nextTurn = useGameStore((s) => s.nextTurn);

  const { calendar, deskObjects, deskProps, pendingDecisions, character, nation } = gameState;
  const [activeObject, setActiveObject] = useState<DeskObject | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [dismissedObjects, setDismissedObjects] = useState<Set<string>>(new Set());

  const safeDeskObjects = deskObjects ?? [];
  const visibleObjects = safeDeskObjects.filter(obj => !dismissedObjects.has(obj.id));
  const hasUnreadItems = visibleObjects.length > 0;

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
    : pendingDecisions[0];

  const handleDismissObject = (objId: string) => {
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
      handleDismissObject(activeObject.id);
    } else {
      setSelectedChoiceId(choiceId);
    }
  };

  const timeOfDay = calendar.timeOfDay ?? 'mañana';
  const weatherCondition = calendar.weatherCondition ?? 'despejado';
  const fortnight = calendar.fortnight ?? 1;

  return (
    <div className="relative w-full min-h-[640px] rounded-3xl overflow-hidden border-4 border-[#3e2723] shadow-2xl bg-[#1a0f0a] flex flex-col justify-between font-serif selection:bg-amber-500/30">
      {/* ─── 1. VENTANAL DEL DESPACHO (Fondo de ambiente) ─── */}
      <div className={`relative h-44 w-full bg-gradient-to-b ${timeGradients[timeOfDay] ?? timeGradients.mañana} p-6 flex justify-between items-start border-b-8 border-[#2d1b16] shadow-inner overflow-hidden`}>
        {weatherCondition === 'lluvia' && (
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        )}
        {weatherCondition === 'tormenta' && (
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-sky-200" />
        )}

        <div className="z-10 flex flex-col">
          <span className="text-amber-200/90 text-xs font-black tracking-widest uppercase font-sans flex items-center gap-2">
            🏛️ CASA DE GOBIERNO — DESPACHO PRESIDENCIAL
          </span>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight font-serif mt-1">
            {fortnight === 1 ? 'Primera quincena' : 'Segunda quincena'} de {calendar.monthCycleName} ({calendar.season} {calendar.year})
          </h2>
        </div>

        <div className="z-10 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-900/40 text-xs text-amber-200 font-sans shadow-lg">
          <span>{weatherIcons[weatherCondition] ?? '☀️'} {weatherCondition.toUpperCase()}</span>
          <span>•</span>
          <span className="capitalize">{timeOfDay}</span>
          <span>•</span>
          <span className="text-sky-300 font-bold">Estrés: {character.stress}%</span>
        </div>
      </div>

      {/* ─── 2. LA MESA DEL ESCRITORIO PRESIDENCIAL (Madera Caoba) ─── */}
      <div className="relative flex-1 bg-gradient-to-b from-[#2d1b16] via-[#241410] to-[#1a0f0a] p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d7ccc8_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="flex justify-between items-center z-10 text-xs text-amber-300/70 font-sans mb-4">
          <div className="flex items-center gap-4">
            {deskProps?.familyPhotoVisible && (
              <div className="bg-[#120a07] border-2 border-amber-800/60 p-2 rounded-lg shadow-md flex items-center gap-2 text-[11px] text-amber-200/80 italic font-serif">
                <span>🖼️</span>
                <span>"Mariana & Familia — 2030"</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-[#180d09] px-3 py-1.5 rounded-full border border-amber-900/40 text-[11px] text-amber-300/80">
              <span>☕</span>
              <span>Café del despacho ({deskProps?.coffeeCupCount ?? 0})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[10px] text-amber-400/60 uppercase tracking-wider font-bold">Estado de Reservas</span>
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

              return (
                <div
                  key={obj.id}
                  onClick={() => setActiveObject(obj)}
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
                      isUrgent ? 'bg-rose-600 text-white' : 'bg-amber-900/40 text-amber-300 border border-amber-700/40'
                    }`}>
                      {obj.urgency.toUpperCase()}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm leading-snug mb-1 ${obj.type === 'diario' ? 'font-serif text-slate-950' : 'text-slate-100'}`}>
                    {obj.title}
                  </h3>
                  <p className={`text-xs ${obj.type === 'diario' ? 'text-slate-700 font-serif italic' : 'text-amber-300/80 font-sans'}`}>
                    {obj.subtitle}
                  </p>

                  <div className="mt-3 pt-2 border-t border-amber-900/30 flex justify-between items-center text-[10px] text-amber-400/70 font-sans font-bold">
                    <span>Inspeccionar asunto ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="my-auto z-10 text-center py-16">
            <span className="text-4xl block mb-4">🏛️</span>
            <p className="text-amber-300/60 text-sm font-sans">El escritorio está despejado.</p>
            <p className="text-amber-300/40 text-xs font-sans mt-1">No hay asuntos pendientes. Podés avanzar la quincena.</p>
          </div>
        )}

        {/* ─── 3. INSPECTOR DE DOCUMENTOS EN EL ESCRITORIO (Overlay Táctil) ─── */}
        {activeObject && (
          <div className="absolute inset-x-6 top-6 bottom-6 z-30 bg-[#f7f1df] text-slate-950 p-8 rounded-3xl border-8 border-[#4e342e] shadow-2xl overflow-y-auto font-serif">
            <div className="flex justify-between items-center border-b-2 border-slate-950 pb-4 mb-6 font-sans">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {activeObject.type === 'diario' ? '🗞️' : activeObject.type === 'carpeta-roja' ? '🔴' : activeObject.type === 'carta-gobernador' ? '✉️' : activeObject.type === 'telefono' ? '☎️' : activeObject.type === 'encuesta' ? '📊' : '📁'}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                    DOCUMENTO OFICIAL DEL DESPACHO
                  </span>
                  <h2 className="text-2xl font-black text-slate-950 leading-tight font-serif">
                    {activeObject.title}
                  </h2>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDismissObject(activeObject.id)}>
                ✕ Cerrar y archivar
              </Button>
            </div>

            <div className="space-y-6 text-sm text-slate-900 leading-relaxed font-serif">
              <p className="text-base leading-relaxed bg-[#ede3c6] p-5 rounded-2xl border border-slate-400/60 font-serif italic">
                "{activeObject.inspectText}"
              </p>

              {activeDecision && (
                <div className="space-y-4 font-sans pt-4 border-t border-slate-300">
                  <h4 className="font-extrabold text-slate-950 text-sm font-serif">
                    Opciones de Estado disponibles:
                  </h4>

                  {activeDecision.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;

                    return (
                      <div
                        key={choice.id}
                        className={`p-5 rounded-2xl transition-all border ${
                          isSelected
                            ? 'bg-slate-950 text-amber-200 border-slate-950 shadow-xl'
                            : 'bg-[#ebdcb9] text-slate-900 border-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <h5 className="font-bold text-sm mb-1">{choice.label}</h5>
                        <p className="text-xs text-slate-700 mb-3 leading-relaxed font-serif">
                          {choice.description}
                        </p>

                        <div className="flex gap-4 text-[11px] font-semibold mb-3">
                          {choice.preview.gains.length > 0 && (
                            <span className="text-emerald-700">
                              👍 Beneficios: {choice.preview.gains.map((g) => g.label).join(', ')}
                            </span>
                          )}
                          {choice.preview.losses.length > 0 && (
                            <span className="text-rose-700">
                              ⚠️ Riesgos: {choice.preview.losses.map((l) => l.label).join(', ')}
                            </span>
                          )}
                        </div>

                        <Button
                          variant={isSelected ? 'gold' : 'primary'}
                          size="sm"
                          className="w-full"
                          onClick={() => handleChoiceClick(choice.id)}
                        >
                          {isSelected ? '⚠️ Firmar decreto y ejecutar' : 'Seleccionar esta medida'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center z-10 pt-4 border-t border-amber-900/40 font-sans">
          <span className="text-xs text-amber-300/60 font-medium">
            República del Sur — Período Constitucional 2032-2036
          </span>

          <Button
            variant={hasUnreadItems ? 'ghost' : 'gold'}
            size="md"
            onClick={hasUnreadItems ? undefined : nextTurn}
            className={hasUnreadItems ? 'opacity-50 cursor-not-allowed text-amber-400' : 'shadow-xl shadow-amber-500/20'}
          >
            {hasUnreadItems
              ? '📋 Asuntos pendientes en la mesa 🔒'
              : 'Avanzar quincena ➔'}
          </Button>
        </div>
      </div>
    </div>
  );
};
