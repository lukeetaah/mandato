import React from 'react';
import { useGameStore } from '@stores/game-store';
import { calculateLegacy } from '@engine/legacy';
import { Button } from '@components/ui/Button';

export interface GameOverProps {
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  const gameState = useGameStore((s) => s.gameState);
  const resetGame = useGameStore((s) => s.resetGame);

  if (!gameState) return null;

  const legacy = calculateLegacy(gameState);

  const handleRestart = () => {
    resetGame();
    onRestart();
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
      <div className="glass-panel p-8 rounded-2xl max-w-xl text-center border border-amber-500/30">
        <h2 className="text-4xl font-extrabold text-amber-300 mb-2">Fin del Mandato</h2>
        <h3 className="text-xl font-bold text-slate-100 mb-4">{legacy.title}</h3>
        {gameState.flags['trial-convicted'] && (
          <p className="text-xs text-rose-300 mb-4 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3">
            Condena política ficticia: el mandato terminó y el expresidente quedó detenido mientras continúa el expediente.
          </p>
        )}
        <p className="text-slate-300 italic mb-6">«{legacy.epitaph}»</p>

        <div className="text-xs text-slate-400 mb-8 p-4 rounded-lg bg-slate-900 border border-slate-800">
          Puntuación de Legado: <span className="text-sky-400 font-bold text-sm">{Math.round(legacy.score)}/100</span>
        </div>

        <Button variant="gold" size="lg" onClick={handleRestart}>
          Iniciar Nueva Carrera Political ➔
        </Button>
      </div>
    </div>
  );
};
