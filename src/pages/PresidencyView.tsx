import React from 'react';
import type { PresidencySnapshot } from '@engine/presidency-archive';
import { PresidentAvatar } from '@components/character/PresidentAvatar';
import { Button } from '@components/ui/Button';

export interface PresidencyViewProps {
  snapshot: PresidencySnapshot;
  position?: number;
  onBack: () => void;
}

export const PresidencyView: React.FC<PresidencyViewProps> = ({ snapshot, position, onBack }) => {
  const characterForAvatar = {
    name: snapshot.character.name,
    surname: snapshot.character.surname,
    avatarId: snapshot.character.avatarId,
    health: snapshot.finalState.health,
    stress: snapshot.finalState.stress,
    popularity: snapshot.finalState.popularity,
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100 p-5 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center gap-4">
          <button type="button" onClick={onBack} className="text-xs text-slate-400 hover:text-slate-100 font-bold cursor-pointer">
            Volver
          </button>
          {position && <span className="text-xs font-black text-amber-300">Puesto local #{position}</span>}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <PresidentAvatar character={characterForAvatar} className="aspect-[7/8]" showCaption />
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-sky-300 font-black">Así gobernó {snapshot.alias}</span>
              <h1 className="text-3xl sm:text-4xl font-black mt-2">{snapshot.character.name} {snapshot.character.surname}</h1>
              <p className="text-sm text-slate-400">{snapshot.character.origin} · {snapshot.durationMonths} meses · {snapshot.result}</p>
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-slate-950/70 p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-black text-amber-300">{snapshot.legacy.title}</h2>
                  <p className="text-sm text-slate-300 italic font-serif mt-1">“{snapshot.legacy.epitaph}”</p>
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-black text-sky-300">{snapshot.score}</span>
                  <span className="text-[10px] text-slate-400 font-bold">puntos</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mt-4">{snapshot.legacy.narrative}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 className="font-black text-emerald-300 mb-3">Logros</h3>
            <div className="space-y-2">
              {(snapshot.legacy.achievements.length ? snapshot.legacy.achievements : ['No hubo logros dominantes registrados.']).map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 className="font-black text-rose-300 mb-3">Costos</h3>
            <div className="space-y-2">
              {(snapshot.legacy.mistakes.length ? snapshot.legacy.mistakes : ['No hubo costos críticos destacados.']).map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 className="font-black text-sky-300 mb-3">Regiones más afectadas</h3>
            <div className="space-y-2">
              {snapshot.legacy.affectedRegions.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h3 className="font-black text-slate-100 mb-4">Cómo se explica el puntaje</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            {snapshot.legacy.scoreBreakdown.map((item) => (
              <div key={item.label} className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-200">{item.label}</span>
                  <span className="font-black text-amber-300">{item.value}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <Button variant="primary" onClick={onBack}>Cerrar presidencia</Button>
        </div>
      </div>
    </div>
  );
};
