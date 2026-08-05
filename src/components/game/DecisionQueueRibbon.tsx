import React from 'react';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';

export const DecisionQueueRibbon: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  if (!gameState) return null;

  const pending = gameState.pendingDecisions[0];
  const count = gameState.pendingDecisions.length;

  return (
    <button
      type="button"
      onClick={() => setActiveTab('decisiones')}
      className={`w-full rounded-2xl border px-4 py-3 flex items-center gap-3 text-left transition-all cursor-pointer ${
        pending
          ? 'bg-amber-950/40 border-amber-500/40 hover:border-amber-300/80 hover:bg-amber-900/50'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
      }`}
      aria-label={pending ? 'Abrir decisiones pendientes y leer el expediente' : 'No hay decisiones pendientes'}
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${pending ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
        {pending ? '⚖️' : '✓'}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[10px] font-black uppercase tracking-[0.16em] ${pending ? 'text-amber-300' : 'text-slate-500'}`}>
          Decisiones pendientes {count > 0 ? `· ${count}` : ''}
        </span>
        <span className={`block text-xs truncate ${pending ? 'text-slate-100 font-semibold' : 'text-slate-400'}`}>
          {pending ? pending.title : 'El escritorio está al día'}
        </span>
      </span>
      <span className={`text-[11px] font-bold shrink-0 ${pending ? 'text-amber-200' : 'text-slate-500'}`}>
        {pending ? 'Leer expediente →' : 'Continuar →'}
      </span>
    </button>
  );
};
