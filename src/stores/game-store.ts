import { create } from 'zustand';
import type { GameState, Character, Decision } from '@engine/types';
import { createNewGame, advanceTurn, executeChoice } from '@engine/simulation';
import { saveGame, loadGame, hasSavedGame, deleteSave } from '@engine/persistence';

interface GameStore {
  gameState: GameState | null;
  hasSaveAvailable: boolean;

  // Acciones
  initNewGame: (seed?: number, customChar?: Partial<Character>) => void;
  loadExistingGame: () => boolean;
  nextTurn: () => void;
  makeChoice: (decision: Decision, choiceId: string) => void;
  saveCurrentGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: loadGame(),
  hasSaveAvailable: hasSavedGame(),

  initNewGame: (seed, customChar) => {
    const fresh = createNewGame(seed ?? Date.now(), customChar);
    saveGame(fresh);
    set({ gameState: fresh, hasSaveAvailable: true });
  },

  loadExistingGame: () => {
    const loaded = loadGame();
    if (loaded) {
      set({ gameState: loaded, hasSaveAvailable: true });
      return true;
    }
    return false;
  },

  nextTurn: () => {
    const current = get().gameState;
    if (!current) return;
    const nextState = advanceTurn(current);
    saveGame(nextState);
    set({ gameState: nextState });
  },

  makeChoice: (decision, choiceId) => {
    const current = get().gameState;
    if (!current) return;
    const nextState = executeChoice(current, decision, choiceId);
    saveGame(nextState);
    set({ gameState: nextState });
  },

  saveCurrentGame: () => {
    const current = get().gameState;
    if (current) {
      saveGame(current);
      set({ hasSaveAvailable: true });
    }
  },

  resetGame: () => {
    deleteSave();
    set({ gameState: null, hasSaveAvailable: false });
  },
}));
