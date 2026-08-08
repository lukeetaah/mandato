import React, { useState } from 'react';
import type { Decision } from '@engine/types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';

export interface DecisionCardProps {
  decision: Decision;
  onDecisionMade?: () => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onDecisionMade }) => {
  const makeChoice = useGameStore((s) => s.makeChoice);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const urgencyColors = {
    baja: 'slate',
    media: 'sky',
    alta: 'gold',
    critica: 'rose',
  } as const;

  const handleChoiceClick = (choiceId: string) => {
    const choice = decision.choices.find((candidate) => candidate.id === choiceId);
    if (choice?.disabled) return;
    if (confirming && selectedChoiceId === choiceId) {
      // Confirmar
      makeChoice(decision, choiceId);
      if (onDecisionMade) onDecisionMade();
      setConfirming(false);
      setSelectedChoiceId(null);
      // Trasladar el foco suavemente arriba al escritorio
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      className="mb-4"
    >
      <p className={`text-sm mb-5 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{decision.description}</p>

      <div className="space-y-3">
        {decision.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id && confirming;

          return (
            <div
              key={choice.id}
              className={`p-4 rounded-2xl transition-all border ${choice.disabled ? 'opacity-60 border-slate-300 bg-slate-100' : ''} ${
                isSelected
                  ? isLight ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-sky-950/80 border-sky-400/60 shadow-lg shadow-sky-500/10'
                  : isLight ? 'bg-slate-50 border-slate-200 hover:border-blue-400' : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{choice.label}</h4>
                {(() => {
                  const hasStrongRisk = choice.preview.risks.some(r => r.magnitude === 'fuerte');
                  const hasBomb = choice.delayedEffects.length > 0;
                  const highProbBomb = choice.delayedEffects.some(e => e.probability >= 0.5);

                  let badge = { label: '🟢 BAJO RIESGO', color: isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60' };
                  if (hasStrongRisk || (hasBomb && highProbBomb)) {
                    badge = { label: '💥 RIESGO CRÍTICO', color: isLight ? 'bg-rose-100 text-rose-800 border-rose-300 font-black' : 'bg-rose-950/80 text-rose-300 border-rose-600/60 font-black animate-pulse' };
                  } else if (choice.preview.risks.length > 0 || hasBomb) {
                    badge = { label: '🟡 RIESGO MODERADO', color: isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-300 border-amber-600/60' };
                  }

                  return (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
              <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{choice.description}</p>

              {choice.disabledReason && (
                <p className={`text-[11px] rounded-xl px-3 py-2 mb-3 border ${
                  isLight ? 'text-amber-900 bg-amber-50 border-amber-200' : 'text-amber-300/90 bg-amber-950/40 border-amber-700/40'
                }`}>
                  ☐ {choice.disabledReason}
                </p>
              )}

              {/* Previsualización */}
              <div className={`grid grid-cols-3 gap-2 text-[11px] mb-3 p-3 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold block mb-1">Ganancias</span>
                  {choice.preview.gains.length > 0 ? choice.preview.gains.map((g, idx) => (
                    <span key={idx} className={`block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {g.icon} {g.label}
                    </span>
                  )) : <span className="text-slate-400">—</span>}
                </div>
                <div>
                  <span className="text-rose-500 font-semibold block mb-1">Pérdidas</span>
                  {choice.preview.losses.length > 0 ? choice.preview.losses.map((l, idx) => (
                    <span key={idx} className={`block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {l.icon} {l.label}
                    </span>
                  )) : <span className="text-slate-400">—</span>}
                </div>
                <div>
                  <span className="text-amber-500 font-semibold block mb-1">Riesgos</span>
                  {choice.preview.risks.length > 0 ? choice.preview.risks.map((r, idx) => (
                    <span key={idx} className={`block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {r.icon} {r.label}
                    </span>
                  )) : <span className="text-slate-400">—</span>}
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
                disabled={choice.disabled}
                onClick={() => handleChoiceClick(choice.id)}
              >
                {choice.disabled ? 'No disponible' : isSelected ? '⚠️ Confirmar Decisión' : 'Elegir esta opción'}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
