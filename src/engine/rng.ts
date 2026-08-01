export interface RngState {
  value: number;
}

export function createRng(seed: number): RngState {
  return { value: (seed >>> 0) || 1 };
}

export function random(state: RngState): number {
  let t = (state.value += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return result;
}

export function randomInt(state: RngState, min: number, max: number): number {
  return Math.floor(random(state) * (max - min + 1)) + min;
}

export function randomFloat(state: RngState, min: number, max: number): number {
  return random(state) * (max - min) + min;
}

export function pick<T>(state: RngState, items: readonly T[]): T {
  const index = Math.floor(random(state) * items.length);
  return items[index]!;
}

export function shuffle<T>(state: RngState, items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random(state) * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function chance(state: RngState, p: number): boolean {
  return random(state) < p;
}
