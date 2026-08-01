import React, { useState } from 'react';
import type { Decision } from '@engine/types';
import { useGameStore } from '@stores/game-store';
import { Button } from '@components/ui/Button';

export interface JudicialTrialProps {
  decision: Decision;
}

export const JudicialTrial: React.FC<JudicialTrialProps> = ({ decision }) => {
  const makeChoice = useGameStore((state) => state.makeChoice);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const selectedChoice = decision.choices.find((choice) => choice.id === selectedChoiceId);

  return (
    <div className="min-h-[calc(100vh-7rem)] flex items-center justify-center py-6">
      <section className="w-full max-w-4xl rounded-3xl border border-rose-500/40 bg-slate-950/90 p-5 sm:p-8 shadow-2xl shadow-rose-950/30">
        <div className="border-b border-rose-500/30 pb-5 mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-300">⚖️ Comisión de Juicio Político</p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-black text-slate-100">{decision.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{decision.description}</p>
          <p className="mt-3 text-[11px] text-slate-500 italic">Mecánica narrativa ficticia: no representa asesoramiento ni un procedimiento jurídico real.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {decision.choices.map((choice) => {
            const selected = choice.id === selectedChoiceId;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => setSelectedChoiceId(choice.id)}
                className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${selected ? 'border-amber-300 bg-amber-950/60 shadow-lg shadow-amber-950/30' : 'border-slate-700 bg-slate-900/80 hover:border-rose-400/60'}`}
              >
                <h2 className="font-bold text-slate-100">{choice.label}</h2>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">{choice.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
                  {choice.preview.gains.map((gain) => <span key={gain.label} className="text-emerald-300">✓ {gain.label}</span>)}
                  {choice.preview.losses.map((loss) => <span key={loss.label} className="text-rose-300">⚠ {loss.label}</span>)}
                </div>
              </button>
            );
          })}
        </div>

        {selectedChoice && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-amber-100">{selectedChoice.emotionalImpact}</p>
            <Button variant="gold" size="md" onClick={() => makeChoice(decision, selectedChoice.id)} className="w-full sm:w-auto shrink-0">
              Confirmar defensa
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
