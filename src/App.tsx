import { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';
import { MainMenu } from '@pages/MainMenu';
import { MandateIntro } from '@pages/MandateIntro';
import { CharacterCreator } from '@pages/CharacterCreator';
import { GameView } from '@pages/GameView';
import { GameOver } from '@pages/GameOver';
import { Leaderboard } from '@pages/Leaderboard';
import { PresidencyView } from '@pages/PresidencyView';
import { SiteFooter } from '@components/layout/SiteFooter';
import { Analytics } from '@vercel/analytics/react';
import { readSharedPresidencyFromHash, type PresidencySnapshot } from '@engine/presidency-archive';

type AppScreen = 'menu' | 'intro' | 'creator' | 'game' | 'gameover' | 'leaderboard' | 'presidency';

export function App() {
  const gameState = useGameStore((s) => s.gameState);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const [sharedPresidency, setSharedPresidency] = useState<PresidencySnapshot | null>(() => readSharedPresidencyFromHash());
  const [sharedPosition, setSharedPosition] = useState<number | undefined>();
  const [screen, setScreen] = useState<AppScreen>(sharedPresidency ? 'presidency' : gameState ? 'game' : 'menu');

  // Si se está en pantalla de juego sin estado, volver al menú
  const effectiveScreen = (screen === 'game' && !gameState)
    ? 'menu'
    : screen === 'game' && gameState?.phase === 'gameover'
    ? 'gameover'
    : screen;

  return (
    <div className={`min-h-screen transition-colors ${isLight ? 'theme-light bg-[#F5EFEB]' : 'theme-dark bg-[#0a1628]'}`}>
      {effectiveScreen === 'menu' && (
        <MainMenu
          onStartNew={() => setScreen('intro')}
          onContinue={() => setScreen('game')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {effectiveScreen === 'intro' && (
        <MandateIntro
          onContinue={() => setScreen('creator')}
          onBack={() => setScreen('menu')}
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
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onOpenPresidency={(snapshot) => {
            setSharedPresidency(snapshot);
            setSharedPosition(undefined);
            setScreen('presidency');
          }}
        />
      )}

      {effectiveScreen === 'leaderboard' && (
        <Leaderboard
          onBack={() => setScreen('menu')}
          onOpenPresidency={(snapshot, position) => {
            setSharedPresidency(snapshot);
            setSharedPosition(position);
            setScreen('presidency');
          }}
        />
      )}

      {effectiveScreen === 'presidency' && sharedPresidency && (
        <PresidencyView
          snapshot={sharedPresidency}
          position={sharedPosition}
          onBack={() => setScreen('leaderboard')}
        />
      )}
      <SiteFooter />
      <Analytics />
    </div>
  );
}

export default App;
