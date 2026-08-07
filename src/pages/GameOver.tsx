import React, { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { calculateLegacy } from '@engine/legacy';
import { Button } from '@components/ui/Button';

export interface GameOverProps {
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  const gameState = useGameStore((s) => s.gameState);
  const resetGame = useGameStore((s) => s.resetGame);
  const [copied, setCopied] = useState(false);

  if (!gameState) return null;

  const legacy = calculateLegacy(gameState);
  const { character, nation, turn, eventLog, patterns } = gameState;
  const totalMonths = Math.floor(turn / 2);

  // Seleccionar hitos significativos del historial
  const highlights = eventLog
    .filter((e) => e.type === 'event' || e.type === 'scandal' || e.type === 'election')
    .slice(-5)
    .reverse();

  const shareText = `🏛️ MI MANDATO - FICHA PRESIDENCIAL
👤 Presidente: ${character.name} ${character.surname}
📜 Legado: ${legacy.title}
💬 "${legacy.epitaph}"
⭐ Puntuación de Legado: ${legacy.score}/100
🗓️ Meses gobernados: ${totalMonths}
📊 Popularidad final: ${Math.round(character.popularity)}% | Inflación: ${Math.round(nation.economy.inflation)}%
🎮 ¿Podés hacerlo mejor? Jugá en Mi Mandato.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRestart = () => {
    resetGame();
    onRestart();
  };

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-y-auto">
      {/* Glow decorativo de fondo */}
      <div className="absolute w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full space-y-6 my-auto">
        {/* Cabecera Principal */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80 bg-amber-950/60 px-4 py-1.5 rounded-full border border-amber-500/30">
            🏛️ BALANCE FINAL DEL PERÍODO CONSTITUCIONAL
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-sky-300">
            Fin del Mandato
          </h1>
        </div>

        {/* Card Principal del Legado */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 shadow-2xl space-y-6">
          <div className="text-center space-y-2 border-b border-amber-500/20 pb-6">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Arquetipo Político Asignado</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300">{legacy.title}</h2>
            <p className="text-slate-300 italic text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-serif">
              «{legacy.epitaph}»
            </p>
          </div>

          {/* Avisos especiales de fin de juego */}
          {gameState.flags['trial-convicted'] && (
            <div className="text-xs text-rose-200 bg-rose-950/60 border border-rose-500/40 p-4 rounded-2xl flex items-center gap-3">
              <span className="text-2xl shrink-0">⚖️</span>
              <p>Condena judicial: El mandato concluyó y el expresidente quedó en detención domiciliaria mientras prosigue la causa.</p>
            </div>
          )}
          {gameState.flags['trial-dismissed'] && (
            <div className="text-xs text-amber-200 bg-amber-950/60 border border-amber-500/40 p-4 rounded-2xl flex items-center gap-3">
              <span className="text-2xl shrink-0">🚪</span>
              <p>Falta de mérito: El mandato fue interrumpido. El Vicepresidente asumió el Poder Ejecutivo y la carrera presidencial quedó clausurada.</p>
            </div>
          )}

          {/* Puntuación de Legado */}
          <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Índice de Trascendencia Histórica</span>
              <span className="text-sky-400 text-lg">{legacy.score} / 100</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 h-full transition-all duration-1000"
                style={{ width: `${legacy.score}%` }}
              />
            </div>
          </div>

          {/* Estadísticas de Gestión */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Meses en Poder</span>
              <span className="text-lg font-bold text-amber-300">{totalMonths}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Popularidad</span>
              <span className="text-lg font-bold text-emerald-400">{Math.round(character.popularity)}%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Inflación Final</span>
              <span className="text-lg font-bold text-rose-400">{Math.round(nation.economy.inflation)}%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Perfil Prensa</span>
              <span className="text-xs font-bold text-sky-300 uppercase truncate block mt-1">{patterns.detectedProfile}</span>
            </div>
          </div>

          {/* Hitos memorables */}
          {highlights.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Hitos que marcaron la gestión</span>
              <div className="space-y-2">
                {highlights.map((h, idx) => (
                  <div key={idx} className="text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="font-medium text-slate-200">{h.title}</span>
                    <span className="text-[10px] text-amber-400 font-bold shrink-0 ml-2">Turno {h.turn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleCopy}
              className="w-full sm:w-1/2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {copied ? '✅ Ficha Copiada al Portapapeles' : '📋 Copiar Resumen del Mandato'}
            </button>
            <Button
              variant="gold"
              size="lg"
              onClick={handleRestart}
              className="w-full sm:w-1/2 font-black shadow-xl shadow-amber-500/20"
            >
              Iniciar Nueva Carrera ➔
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

