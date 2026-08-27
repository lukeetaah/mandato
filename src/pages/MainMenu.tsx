import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@stores/game-store';
import { Button } from '@components/ui/Button';

export interface MainMenuProps {
  onStartNew: () => void;
  onContinue: () => void;
  onOpenLeaderboard: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartNew, onContinue, onOpenLeaderboard }) => {
  const hasSave = useGameStore((s) => s.hasSaveAvailable);
  const loadExistingGame = useGameStore((s) => s.loadExistingGame);

  const handleContinue = () => {
    if (loadExistingGame()) {
      onContinue();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Glow decorativo de fondo */}
      <div className="absolute w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-xl"
      >
        <h1 className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-sky-200 mb-4">
          MI MANDATO
        </h1>
        <p className="text-lg text-slate-300 font-light mb-2">
          Un simulador sobre cómo sobrevivir al poder.
        </p>
        <p className="text-xs text-slate-400 italic mb-10">
          «El sistema siempre intenta doblarte. La pregunta es qué costo estás dispuesto a pagar.»
        </p>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          {hasSave && (
            <Button variant="gold" size="lg" onClick={handleContinue}>
              Continuar mandato ➔
            </Button>
          )}
          <Button variant="primary" size="lg" onClick={onStartNew}>
            Iniciar mandato
          </Button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="text-xs text-slate-400 hover:text-sky-300 font-bold cursor-pointer"
          >
            Ver ranking y presidencias archivadas
          </button>
        </div>
      </motion.div>
    </div>
  );
};
