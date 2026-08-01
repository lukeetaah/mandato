import type { ReputationGroup, ReputationChanges } from './types';

export function applyReputationChanges(
  current: Record<ReputationGroup, number>,
  changes?: ReputationChanges
): Record<ReputationGroup, number> {
  if (!changes) return { ...current };
  const updated = { ...current };
  for (const [groupKey, delta] of Object.entries(changes)) {
    const key = groupKey as ReputationGroup;
    if (typeof delta === 'number' && key in updated) {
      updated[key] = Math.max(0, Math.min(100, updated[key] + delta));
    }
  }
  return updated;
}
