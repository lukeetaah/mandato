import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { calculateLegacy } from '@engine/legacy';
import { buildShareUrl, createPresidencySnapshot, savePresidencySnapshot, type PresidencySnapshot } from '@engine/presidency-archive';
import { PresidentAvatar } from '@components/character/PresidentAvatar';
import { Button } from '@components/ui/Button';

export interface GameOverProps {
  onRestart: () => void;
  onOpenLeaderboard: () => void;
  onOpenPresidency: (snapshot: PresidencySnapshot) => void;
}

export const GameOver: React.FC<GameOverProps> = ({ onRestart, onOpenLeaderboard, onOpenPresidency }) => {
  const gameState = useGameStore((s) => s.gameState);
  const resetGame = useGameStore((s) => s.resetGame);
  const [copied, setCopied] = useState(false);
  const [alias, setAlias] = useState('');

  const legacy = useMemo(() => gameState ? calculateLegacy(gameState) : null, [gameState]);
  const snapshot = useMemo(
    () => gameState ? createPresidencySnapshot(gameState, alias || `${gameState.character.name} ${gameState.character.surname}`) : null,
    [gameState, alias],
  );

  useEffect(() => {
    if (snapshot) savePresidencySnapshot(snapshot);
  }, [snapshot]);

  if (!gameState || !legacy || !snapshot) return null;

  const { character, nation, turn, eventLog, patterns } = gameState;
  const totalMonths = Math.floor(turn / 2);

  // Seleccionar hitos significativos del historial
  const highlights = eventLog
    .filter((e) => e.type === 'event' || e.type === 'scandal' || e.type === 'election')
    .slice(-5)
    .reverse();

  const handleCopy = () => {
    savePresidencySnapshot(snapshot);
    const shareText = `MI MANDATO - Ficha presidencial
Presidente: ${character.name} ${character.surname}
Legado: ${legacy.title}
Puntaje: ${legacy.score}/100
Resumen: ${legacy.narrative}
Ver presidencia: ${buildShareUrl(snapshot)}`;
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
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400/80 bg-amber-950/60 px-4 py-1.5 rounded-full border border-amber-500/30">
            Balance final del período constitucional
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-sky-300">
            Esta fue tu presidencia
          </h1>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-5 border-b border-amber-500/20 pb-6 items-center">
            <PresidentAvatar character={character} className="w-32 h-40 mx-auto" showCaption />
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Arquetipo político asignado</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300">{legacy.title}</h2>
              <p className="text-slate-300 italic text-sm sm:text-base leading-relaxed max-w-lg font-serif">
                “{legacy.epitaph}”
              </p>
            </div>
          </div>

          {/* Avisos especiales de fin de juego */}
          {gameState.flags['trial-convicted'] && (
            <div className="text-xs text-rose-200 bg-rose-950/60 border border-rose-500/40 p-4 rounded-2xl flex items-center gap-3">
              <span className="text-2xl shrink-0">⚖️</span>
              <p>Condena judicial: el mandato concluyó y el expresidente quedó en detención domiciliaria mientras prosigue la causa.</p>
            </div>
          )}
          {gameState.flags['trial-dismissed'] && (
            <div className="text-xs text-amber-200 bg-amber-950/60 border border-amber-500/40 p-4 rounded-2xl flex items-center gap-3">
              <span className="text-2xl shrink-0">🚪</span>
              <p>Falta de mérito: el mandato fue interrumpido. El vicepresidente asumió el Poder Ejecutivo y la carrera presidencial quedó clausurada.</p>
            </div>
          )}

          <p className="text-sm text-slate-300 leading-relaxed">{legacy.narrative}</p>

          <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Índice de trascendencia histórica</span>
              <span className="text-sky-400 text-lg">{legacy.score} / 100</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400 h-full transition-all duration-1000"
                style={{ width: `${legacy.score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {legacy.scoreBreakdown.map((item) => (
              <div key={item.label} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">{item.label}</span>
                  <span className="font-black text-amber-300">{item.value}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Meses en poder</span>
              <span className="text-lg font-bold text-amber-300">{totalMonths}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Popularidad</span>
              <span className="text-lg font-bold text-emerald-400">{Math.round(character.popularity)}%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Inflación final</span>
              <span className="text-lg font-bold text-rose-400">{Math.round(nation.economy.inflation)}%</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Perfil prensa</span>
              <span className="text-xs font-bold text-sky-300 truncate block mt-1">{patterns.detectedProfile}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-700/40">
              <span className="font-black text-emerald-300 block mb-2">Logros principales</span>
              <div className="space-y-2 text-emerald-50/90">
                {(legacy.achievements.length ? legacy.achievements : ['No hubo logros dominantes registrados.']).map((item) => <p key={item}>{item}</p>)}
              </div>
            </div>
            <div className="bg-rose-950/30 p-4 rounded-2xl border border-rose-700/40">
              <span className="font-black text-rose-300 block mb-2">Errores y costos</span>
              <div className="space-y-2 text-rose-50/90">
                {(legacy.mistakes.length ? legacy.mistakes : ['No hubo costos críticos destacados.']).map((item) => <p key={item}>{item}</p>)}
              </div>
            </div>
          </div>

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

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              Alias público opcional
              <input
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                placeholder={`${character.name} ${character.surname}`}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {copied ? 'Ficha copiada al portapapeles' : 'Copiar ficha y URL'}
            </button>
            <button
              type="button"
              onClick={() => {
                savePresidencySnapshot(snapshot);
                onOpenPresidency(snapshot);
              }}
              className="flex-1 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs border border-sky-400/30 transition-all cursor-pointer shadow-lg"
            >
              Abrir presidencia
            </button>
            <button
              type="button"
              onClick={() => {
                savePresidencySnapshot(snapshot);
                onOpenLeaderboard();
              }}
              className="flex-1 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 font-bold text-xs border border-sky-500/30 transition-all cursor-pointer shadow-lg"
            >
              Ver ranking
            </button>
            <Button
              variant="gold"
              size="lg"
              onClick={handleRestart}
              className="flex-1 font-black shadow-xl shadow-amber-500/20"
            >
              Iniciar nueva carrera ➔
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
