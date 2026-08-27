import { calculateLegacy } from './legacy';
import type { GameState, Legacy } from './types';

export interface PresidencySnapshot {
  id: string;
  alias: string;
  createdAt: string;
  character: {
    name: string;
    surname: string;
    avatarId?: string;
    age: number;
    origin: string;
  };
  durationMonths: number;
  result: string;
  score: number;
  legacy: Pick<Legacy, 'title' | 'epitaph' | 'narrative' | 'scoreBreakdown' | 'achievements' | 'mistakes' | 'affectedRegions' | 'memorableMoments'>;
  finalState: {
    popularity: number;
    health: number;
    stress: number;
    reserves: number;
    inflation: number;
    trust: number;
    institutionality: number;
  };
  decisionsCount: number;
  consequencesOpen: number;
  checksum: string;
}

const ARCHIVE_KEY = 'mi-mandato-presidencias-v1';
const INTEGRITY_SALT = 'mi-mandato-legado-v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function stablePayload(snapshot: Omit<PresidencySnapshot, 'checksum'>): string {
  return JSON.stringify(snapshot);
}

function hashString(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function sign(snapshot: Omit<PresidencySnapshot, 'checksum'>): string {
  return hashString(`${INTEGRITY_SALT}:${stablePayload(snapshot)}`);
}

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function createPresidencySnapshot(state: GameState, alias?: string): PresidencySnapshot {
  const legacy = calculateLegacy(state);
  const openConsequences = state.activeDelayedEffects.length + state.persistentConsequences.filter((item) => !item.resolved).length;
  const draft: Omit<PresidencySnapshot, 'checksum'> = {
    id: hashString(`${state.seed}:${state.startedAt}:${state.turn}:${legacy.score}:${state.decisionHistory.length}`),
    alias: alias?.trim() || `${state.character.name} ${state.character.surname}`,
    createdAt: new Date().toISOString(),
    character: {
      name: state.character.name,
      surname: state.character.surname,
      avatarId: state.character.avatarId,
      age: state.character.age,
      origin: state.provinces.find((province) => province.id === state.character.province)?.name ?? state.character.province,
    },
    durationMonths: Math.floor(state.turn / 2),
    result: state.flags['trial-convicted']
      ? 'Condena política'
      : state.flags['trial-dismissed']
      ? 'Mandato interrumpido'
      : state.phase === 'opposition'
      ? 'Transición democrática'
      : state.phase === 'gameover'
      ? 'Final anticipado'
      : 'Mandato en curso',
    score: legacy.score,
    legacy: {
      title: legacy.title,
      epitaph: legacy.epitaph,
      narrative: legacy.narrative,
      scoreBreakdown: legacy.scoreBreakdown,
      achievements: legacy.achievements,
      mistakes: legacy.mistakes,
      affectedRegions: legacy.affectedRegions,
      memorableMoments: legacy.memorableMoments,
    },
    finalState: {
      popularity: Math.round(state.character.popularity),
      health: Math.round(state.character.health),
      stress: Math.round(state.character.stress),
      reserves: Math.round(state.nation.economy.reserves),
      inflation: Math.round(state.nation.economy.inflation),
      trust: Math.round(state.nation.society.trust),
      institutionality: Math.round(state.nation.governance.institutionality),
    },
    decisionsCount: state.decisionHistory.length,
    consequencesOpen: openConsequences,
  };
  return { ...draft, checksum: sign(draft) };
}

export function verifyPresidencySnapshot(snapshot: PresidencySnapshot): boolean {
  const { checksum, ...payload } = snapshot;
  return checksum === sign(payload);
}

export function savePresidencySnapshot(snapshot: PresidencySnapshot): void {
  if (!isBrowser()) return;
  const current = loadLocalLeaderboard();
  const withoutDuplicate = current.filter((item) => item.id !== snapshot.id);
  const next = [snapshot, ...withoutDuplicate]
    .sort((a, b) => b.score - a.score || b.durationMonths - a.durationMonths)
    .slice(0, 50);
  window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
}

export function loadLocalLeaderboard(): PresidencySnapshot[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PresidencySnapshot => verifyPresidencySnapshot(item as PresidencySnapshot));
  } catch {
    return [];
  }
}

export function serializePresidencySnapshot(snapshot: PresidencySnapshot): string {
  return base64UrlEncode(JSON.stringify(snapshot));
}

export function deserializePresidencySnapshot(encoded: string): PresidencySnapshot | null {
  try {
    const parsed = JSON.parse(base64UrlDecode(encoded)) as PresidencySnapshot;
    return verifyPresidencySnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(snapshot: PresidencySnapshot): string {
  if (typeof window === 'undefined') return `#presidencia/${serializePresidencySnapshot(snapshot)}`;
  return `${window.location.origin}${window.location.pathname}#presidencia/${serializePresidencySnapshot(snapshot)}`;
}

export function readSharedPresidencyFromHash(): PresidencySnapshot | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.hash.match(/^#presidencia\/(.+)$/);
  if (!match) return null;
  return deserializePresidencySnapshot(match[1]!);
}
