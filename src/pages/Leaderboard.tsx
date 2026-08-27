import React, { useMemo, useState } from 'react';
import { loadLocalLeaderboard, type PresidencySnapshot } from '@engine/presidency-archive';
import { PresidentAvatar } from '@components/character/PresidentAvatar';
import { Button } from '@components/ui/Button';

export interface LeaderboardProps {
  onBack: () => void;
  onOpenPresidency: (snapshot: PresidencySnapshot, position?: number) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, onOpenPresidency }) => {
  const [refreshKey] = useState(0);
  const entries = useMemo(() => loadLocalLeaderboard(), [refreshKey]);

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100 p-5 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-sky-300 font-black">Archivo de presidencias</span>
            <h1 className="text-3xl font-black mt-1">Ranking local</h1>
            <p className="text-xs text-slate-400 mt-1">
              Este ranking compara presidencias guardadas en este navegador. No hay backend global configurado en el proyecto.
            </p>
          </div>
          <Button variant="primary" onClick={onBack}>Volver al inicio</Button>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-center">
            <h2 className="text-xl font-black text-amber-300">Todavía no hay presidencias archivadas</h2>
            <p className="text-sm text-slate-400 mt-2">Terminá una partida para generar legado, puntaje y una URL compartible.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const characterForAvatar = {
                name: entry.character.name,
                surname: entry.character.surname,
                avatarId: entry.character.avatarId,
                health: entry.finalState.health,
                stress: entry.finalState.stress,
                popularity: entry.finalState.popularity,
              };
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => onOpenPresidency(entry, index + 1)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 hover:border-sky-500/60 p-4 text-left transition-all cursor-pointer grid grid-cols-[58px_1fr_auto] gap-4 items-center"
                >
                  <PresidentAvatar character={characterForAvatar} className="w-14 h-16" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-amber-300">#{index + 1}</span>
                      <span className="text-sm font-black text-slate-100">{entry.alias}</span>
                      <span className="text-[10px] text-slate-400">{entry.character.name} {entry.character.surname}</span>
                    </div>
                    <p className="text-xs text-slate-300 truncate mt-1">{entry.legacy.narrative}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{entry.durationMonths} meses · {entry.decisionsCount} decisiones · {entry.result}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-sky-300">{entry.score}</span>
                    <span className="text-[10px] text-slate-400 font-bold">puntos</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
