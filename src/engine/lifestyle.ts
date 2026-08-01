import type { HousingType, Possession } from './types';
import { HOUSING_PERCEPTION } from './constants';

export function calculatePublicPerceptionImpact(housing: HousingType, possessions: Possession[]): number {
  const housingImpact = HOUSING_PERCEPTION[housing] ?? 0;
  const possessionsImpact = possessions.reduce((acc, item) => acc + item.perceptionImpact, 0);
  return housingImpact + possessionsImpact;
}

export function createPossession(
  name: string,
  description: string,
  value: number,
  perceptionImpact: number,
  acquiredTurn: number
): Possession {
  return {
    id: `item-${acquiredTurn}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    description,
    value,
    perceptionImpact,
    acquiredTurn,
  };
}
