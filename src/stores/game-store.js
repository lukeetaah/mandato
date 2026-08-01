import { create } from 'zustand';
import { createNewGame, advanceTurn, executeChoice } from '@engine/simulation';
import { saveGame, loadGame, hasSavedGame, deleteSave } from '@engine/persistence';
export const useGameStore = create((set, get) => ({
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
        if (!current)
            return;
        const nextState = advanceTurn(current);
        saveGame(nextState);
        set({ gameState: nextState });
    },
    makeChoice: (decision, choiceId) => {
        const current = get().gameState;
        if (!current)
            return;
        const nextState = executeChoice(current, decision, choiceId);
        saveGame(nextState);
        set({ gameState: nextState });
    },
    resetGame: () => {
        deleteSave();
        set({ gameState: null, hasSaveAvailable: false });
    },
}));
