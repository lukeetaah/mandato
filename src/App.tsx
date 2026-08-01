import { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { MainMenu } from '@pages/MainMenu';
import { CharacterCreator } from '@pages/CharacterCreator';
import { GameView } from '@pages/GameView';
import { GameOver } from '@pages/GameOver';

type AppScreen = 'menu' | 'creator' | 'game' | 'gameover';

export function App() {
  const gameState = useGameStore((s) => s.gameState);
  const [screen, setScreen] = useState<AppScreen>(gameState ? 'game' : 'menu');

  // Si se está en pantalla de juego sin estado, volver al menú
  const effectiveScreen = (screen === 'game' && !gameState) ? 'menu' : screen;

  return (
    <>
      {effectiveScreen === 'menu' && (
        <MainMenu
          onStartNew={() => setScreen('creator')}
          onContinue={() => setScreen('game')}
        />
      )}

      {effectiveScreen === 'creator' && (
        <CharacterCreator
          onComplete={() => setScreen('game')}
        />
      )}

      {effectiveScreen === 'game' && <GameView />}

      {effectiveScreen === 'gameover' && (
        <GameOver
          onRestart={() => setScreen('menu')}
        />
      )}
    </>
  );
}

export default App;
