/**
 * MI MANDATO — Persistencia
 *
 * Save/load con versionado y normalización defensiva.
 * Patrón extraído de Origin (el-origen/persistence.ts):
 * - Versión en cada save
 * - Normalización de datos corruptos
 * - Migración automática entre versiones
 * - Abstracción para futura migración a Supabase
 */

import type { GameState, StoredGame } from './types';
import { SAVE_KEY, SAVE_VERSION } from './types';
import { createNewGame } from './simulation';

const LEGACY_SAVE_KEYS = ['mi-mandato-v3'];

// ─────────────────────────────────────────────
// Persistence Adapter (abstracción para Supabase)
// ─────────────────────────────────────────────

export interface SaveMeta {
  id: string;
  name: string;
  turn: number;
  career: string;
  savedAt: string;
}

export interface PersistenceAdapter {
  save(state: GameState): Promise<void>;
  load(): Promise<GameState | null>;
  list(): Promise<SaveMeta[]>;
  remove(id: string): Promise<void>;
  hasSave(): Promise<boolean>;
}

// ─────────────────────────────────────────────
// LocalStorage Adapter
// ─────────────────────────────────────────────

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveGame(state: GameState): void {
  if (!isBrowser()) return;
  const stored: StoredGame = {
    version: SAVE_VERSION,
    state: { ...state, updatedAt: Date.now() },
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(stored));
  } catch (e) {
    console.error('[MI MANDATO] Error guardando partida:', e);
  }
}

export function loadGame(): GameState | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(SAVE_KEY) ?? LEGACY_SAVE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) ?? null;
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return normalizeStoredGame(parsed);
  } catch {
    console.warn('[MI MANDATO] Save corrupto, descartando.');
    return null;
  }
}

export function hasSavedGame(): boolean {
  if (!isBrowser()) return false;
  const raw = window.localStorage.getItem(SAVE_KEY) ?? LEGACY_SAVE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) ?? null;
  if (!raw) return false;
  try {
    return normalizeStoredGame(JSON.parse(raw)) !== null;
  } catch {
    return false;
  }
}

export function deleteSave(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SAVE_KEY);
}

// ─────────────────────────────────────────────
// Normalización defensiva
// ─────────────────────────────────────────────

function normalizeStoredGame(value: unknown): GameState | null {
  if (!value || typeof value !== 'object') return null;

  const maybe = value as Partial<StoredGame>;
  if (maybe.version !== SAVE_VERSION && maybe.version !== 3) return null;
  if (!maybe.state || typeof maybe.state !== 'object') return null;

  const state = maybe.state;

  // Validar campos críticos
  if (typeof state.turn !== 'number' || state.turn < 0) return null;
  if (!state.character || typeof state.character !== 'object') return null;
  if (!state.nation || typeof state.nation !== 'object') return null;

  // Crear un estado fresco como fallback y mergear
  const fresh = createNewGame(state.seed ?? Date.now());

  const normalized: GameState = {
    ...fresh,
    ...state,
    version: SAVE_VERSION,
    calendar: {
      ...fresh.calendar,
      ...(typeof state.calendar === 'object' && state.calendar ? state.calendar : {}),
      fortnight: state.calendar?.fortnight ?? 1,
      timeOfDay: state.calendar?.timeOfDay ?? 'mañana',
      weatherCondition: state.calendar?.weatherCondition ?? 'despejado',
    },
    deskObjects: Array.isArray(state.deskObjects) && state.deskObjects.length > 0
      ? state.deskObjects
      : fresh.deskObjects,
    deskProps: typeof state.deskProps === 'object' && state.deskProps
      ? { ...fresh.deskProps, ...state.deskProps }
      : fresh.deskProps,
    sectorTrustMemory: typeof state.sectorTrustMemory === 'object' && state.sectorTrustMemory
      ? { ...fresh.sectorTrustMemory, ...state.sectorTrustMemory }
      : fresh.sectorTrustMemory,
    annualDocumentaries: Array.isArray(state.annualDocumentaries) ? state.annualDocumentaries : [],
    // Garantizar arrays
    provinces: Array.isArray(state.provinces) ? state.provinces : fresh.provinces,
    parties: Array.isArray(state.parties) ? state.parties : fresh.parties,
    actors: Array.isArray(state.actors) ? state.actors : fresh.actors,
    pendingDecisions: Array.isArray(state.pendingDecisions) ? state.pendingDecisions : [],
    activeDelayedEffects: Array.isArray(state.activeDelayedEffects) ? state.activeDelayedEffects : [],
    activeEvents: Array.isArray(state.activeEvents) ? state.activeEvents : [],
    eventLog: Array.isArray(state.eventLog) ? state.eventLog.slice(-200) : [],
    mediaOutlets: Array.isArray(state.mediaOutlets) ? state.mediaOutlets : fresh.mediaOutlets,
    bills: Array.isArray(state.bills) ? state.bills : [],
    decisionHistory: Array.isArray(state.decisionHistory) ? state.decisionHistory : [],
    // Garantizar objetos
    reputation: normalizeRecord(state.reputation, fresh.reputation),
    flags: typeof state.flags === 'object' && state.flags ? state.flags : {},
    patterns: normalizePatterns(state.patterns, fresh.patterns),
    socialMedia: typeof state.socialMedia === 'object' && state.socialMedia
      ? state.socialMedia
      : fresh.socialMedia,
    // Garantizar números
    turn: clampPositive(state.turn, 0),
    seed: typeof state.seed === 'number' ? state.seed : fresh.seed,
    startedAt: typeof state.startedAt === 'number' ? state.startedAt : Date.now(),
    updatedAt: Date.now(),
  };

  return normalized;
}

function normalizeRecord<T extends Record<string, number>>(
  value: unknown,
  fallback: T,
): T {
  if (!value || typeof value !== 'object') return fallback;
  const result = { ...fallback };
  for (const key of Object.keys(result)) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      (result as Record<string, number>)[key] = v;
    }
  }
  return result;
}

function normalizePatterns(
  value: unknown,
  fallback: GameState['patterns'],
): GameState['patterns'] {
  if (!value || typeof value !== 'object') return fallback;
  const v = value as Partial<GameState['patterns']>;
  return {
    favorsAccepted: clampPositive(v.favorsAccepted, 0),
    favorsRejected: clampPositive(v.favorsRejected, 0),
    peopleFired: clampPositive(v.peopleFired, 0),
    promisesMade: clampPositive(v.promisesMade, 0),
    promisesKept: clampPositive(v.promisesKept, 0),
    promisesBroken: clampPositive(v.promisesBroken, 0),
    negotiationsStarted: clampPositive(v.negotiationsStarted, 0),
    hardlineStances: clampPositive(v.hardlineStances, 0),
    populistMoves: clampPositive(v.populistMoves, 0),
    austerityMoves: clampPositive(v.austerityMoves, 0),
    mediaAppearances: clampPositive(v.mediaAppearances, 0),
    scandalsCovered: clampPositive(v.scandalsCovered, 0),
    detectedProfile: v.detectedProfile ?? fallback.detectedProfile,
  };
}

function clampPositive(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

// ─────────────────────────────────────────────
// Futuro: Supabase adapter
// ─────────────────────────────────────────────

export function createLocalAdapter(): PersistenceAdapter {
  return {
    async save(state) { saveGame(state); },
    async load() { return loadGame(); },
    async list() {
      const state = loadGame();
      if (!state) return [];
      return [{
        id: SAVE_KEY,
        name: `${state.character.name} ${state.character.surname}`,
        turn: state.turn,
        career: state.character.career,
        savedAt: new Date(state.updatedAt).toISOString(),
      }];
    },
    async remove() { deleteSave(); },
    async hasSave() { return hasSavedGame(); },
  };
}
