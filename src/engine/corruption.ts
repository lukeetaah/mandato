import type { Decision, DecisionChoice } from './types';

export function isGrayCorruptionOffer(decision: Decision): boolean {
  return decision.category === 'politico' && decision.choices.some((c) => c.delayedEffects.length > 0);
}

export function evaluateCorruptionRisk(choices: DecisionChoice[]): { hasRisk: boolean; warning?: string } {
  const riskyChoice = choices.find((c) => c.delayedEffects.some((de) => de.effects.reputation?.['prensa'] || de.effects.national?.governance?.corruption));
  if (riskyChoice) {
    return {
      hasRisk: true,
      warning: 'Atención: Esta alternativa parece tentadora pero contiene favores cruzados con impacto a largo plazo.',
    };
  }
  return { hasRisk: false };
}
