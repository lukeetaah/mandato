import React, { useState } from 'react';
import type { Decision } from '@engine/types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useGameStore } from '@stores/game-store';

export interface DecisionCardProps {
  decision: Decision;
  onDecisionMade?: () => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onDecisionMade }) => {
  const makeChoice = useGameStore((s) => s.makeChoice);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const urgencyColors = {
    baja: 'slate',
    media: 'sky',
    alta: 'gold',
    critica: 'rose',
  } as const;

  const handleChoiceClick = (choiceId: string) => {
    if (confirming && selectedChoiceId === choiceId) {
      // Confirmar
      makeChoice(decision, choiceId);
      if (onDecisionMade) onDecisionMade();
      setConfirming(false);
      setSelectedChoiceId(null);
    } else {
      // Primera selección — pedir confirmación
      setSelectedChoiceId(choiceId);
      setConfirming(true);
    }
  };

  return (
    <Card
      title={decision.title}
      subtitle={`Presentado por: ${decision.source}`}
      action={<Badge variant={urgencyColors[decision.urgency]}>{decision.urgency.toUpperCase()}</Badge>}
      className="mb-4 border-sky-500/20"
    >
      <p className="text-slate-300 text-sm mb-5 leading-relaxed">{decision.description}</p>

      <div className="space-y-3">
        {decision.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id && confirming;

          return (
            <div
              key={choice.id}
              className={`p-4 rounded-xl transition-all border ${
                isSelected
                  ? 'bg-sky-950/80 border-sky-400/60 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-100 text-sm">{choice.label}</h4>
              </div>
              <p className="text-xs text-slate-400 mb-3">{choice.description}</p>

              {/* Previsualización */}
              <div className="grid grid-cols-3 gap-2 text-[11px] mb-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-emerald-400 font-semibold block mb-1">Ganancias</span>
                  {choice.preview.gains.length > 0 ? choice.preview.gains.map((g, idx) => (
                    <span key={idx} className="block text-slate-300">
                      {g.icon} {g.label}
                    </span>
                  )) : <span className="text-slate-600">—</span>}
                </div>
                <div>
                  <span className="text-rose-400 font-semibold block mb-1">Pérdidas</span>
                  {choice.preview.losses.length > 0 ? choice.preview.losses.map((l, idx) => (
                    <span key={idx} className="block text-slate-300">
                      {l.icon} {l.label}
                    </span>
                  )) : <span className="text-slate-600">—</span>}
                </div>
                <div>
                  <span className="text-amber-400 font-semibold block mb-1">Riesgos</span>
                  {choice.preview.risks.length > 0 ? choice.preview.risks.map((r, idx) => (
                    <span key={idx} className="block text-slate-300">
                      {r.icon} {r.label}
                    </span>
                  )) : <span className="text-slate-600">—</span>}
                </div>
              </div>

              {/* Beneficiarios y opositores */}
              <div className="flex gap-4 text-[10px] mb-3">
                {choice.preview.beneficiaries.length > 0 && (
                  <span className="text-emerald-300">
                    👍 {choice.preview.beneficiaries.join(', ')}
                  </span>
                )}
                {choice.preview.opponents.length > 0 && (
                  <span className="text-rose-300">
                    👎 {choice.preview.opponents.join(', ')}
                  </span>
                )}
              </div>

              {/* Indicador de bomba de tiempo */}
              {choice.delayedEffects.length > 0 && (
                <div className="text-[10px] text-amber-300/80 bg-amber-950/30 px-2 py-1 rounded mb-3 border border-amber-800/30">
                  💣 Esta opción tiene {choice.delayedEffects.length} consecuencia(s) diferida(s) que podrían estallar más adelante.
                </div>
              )}

              <Button
                variant={isSelected ? 'gold' : 'primary'}
                size="sm"
                className="w-full"
                onClick={() => handleChoiceClick(choice.id)}
              >
                {isSelected ? '⚠️ Confirmar Decisión' : 'Elegir esta opción'}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
