import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { MainMenu } from '@pages/MainMenu';
import { CharacterCreator } from '@pages/CharacterCreator';
import { GameView } from '@pages/GameView';
import { GameOver } from '@pages/GameOver';
export function App() {
    const gameState = useGameStore((s) => s.gameState);
    const [screen, setScreen] = useState(gameState ? 'game' : 'menu');
    // Si se está en pantalla de juego sin estado, volver al menú
    const effectiveScreen = (screen === 'game' && !gameState) ? 'menu' : screen;
    return (_jsxs(_Fragment, { children: [effectiveScreen === 'menu' && (_jsx(MainMenu, { onStartNew: () => setScreen('creator'), onContinue: () => setScreen('game') })), effectiveScreen === 'creator' && (_jsx(CharacterCreator, { onComplete: () => setScreen('game') })), effectiveScreen === 'game' && _jsx(GameView, {}), effectiveScreen === 'gameover' && (_jsx(GameOver, { onRestart: () => setScreen('menu') }))] }));
}
export default App;
