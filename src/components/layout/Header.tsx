import React, { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { CAREER_LABELS } from '@engine/constants';
import { Badge } from '@components/ui/Badge';
import { Modal } from '@components/ui/Modal';
import { HeadlineBanner } from '@components/game/HeadlineBanner';

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const Header: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const saveCurrentGame = useGameStore((s) => s.saveCurrentGame);
  const resetGame = useGameStore((s) => s.resetGame);

  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [saveNotification, setSaveNotification] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  if (!gameState) return null;

  const { character, turn, calendar, dailyHeadlines } = gameState;
  const monthName = MONTH_NAMES[(calendar.month ?? 1) - 1] ?? 'Ene';

  const handleManualSave = () => {
    saveCurrentGame();
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 3000);
  };

  const handleSaveAndExit = () => {
    saveCurrentGame();
    window.location.reload();
  };

  const handleRestartMandate = () => {
    resetGame();
    window.location.reload();
  };

  return (
    <>
      <header className="glass-panel border-b border-slate-800 z-20">
        <div className="min-h-14 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-sky-200">
            MI MANDATO
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <Badge variant="slate">📅 {monthName} {calendar.year}</Badge>
            <Badge variant="gold">{calendar.season}</Badge>
            <span className="text-slate-500">Turno {turn}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="font-bold text-slate-100">{character.name} {character.surname}</span>
            <Badge variant="sky">{CAREER_LABELS[character.career]}</Badge>
          </div>
          <div className="flex items-center gap-3 font-semibold">
            <span className={character.health < 40 ? 'text-rose-400' : 'text-rose-300'}>
              ❤️ {Math.round(character.health)}
            </span>
            <span className={character.stress > 70 ? 'text-amber-400' : 'text-amber-300'}>
              ⚡ {Math.round(character.stress)}
            </span>
            <span className={character.popularity < 30 ? 'text-emerald-400' : 'text-emerald-300'}>
              ⭐ {Math.round(character.popularity)}
            </span>
          </div>

          {/* Botón de control del juego estilo Corpority */}
          <button
            onClick={() => setIsOptionsOpen(true)}
            className="ml-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Opciones de partida y guardado"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Menú / Salir</span>
          </button>
        </div>
        </div>
        <HeadlineBanner headlines={dailyHeadlines} />
      </header>

      {/* Modal de Opciones y Guardado */}
      <Modal
        isOpen={isOptionsOpen}
        onClose={() => {
          setIsOptionsOpen(false);
          setShowRestartConfirm(false);
        }}
        title="Opciones de Partida"
      >
        <div className="space-y-4 font-sans text-xs">
          {saveNotification && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold text-center">
              💾 Partida guardada correctamente en este navegador.
            </div>
          )}

          {!showRestartConfirm ? (
            <div className="space-y-3 pt-1">
              <p className="text-slate-400 leading-relaxed">
                Podés guardar el progreso de tu mandato, salir al menú principal o reiniciar la gestión desde cero.
              </p>

              <button
                onClick={handleManualSave}
                className="w-full p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">💾</span>
                  <div className="text-left">
                    <div className="font-extrabold text-slate-100">Guardar partida actual</div>
                    <div className="text-[10px] text-slate-400 font-normal">Registra el estado de tu mandato en este punto.</div>
                  </div>
                </div>
                <span className="text-slate-500">➔</span>
              </button>

              <button
                onClick={handleSaveAndExit}
                className="w-full p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 font-bold rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🚪</span>
                  <div className="text-left">
                    <div className="font-extrabold text-slate-100">Guardar y salir al menú principal</div>
                    <div className="text-[10px] text-slate-400 font-normal">Guarda tus datos y regresa al inicio.</div>
                  </div>
                </div>
                <span className="text-slate-500">➔</span>
              </button>

              <button
                onClick={() => setShowRestartConfirm(true)}
                className="w-full p-3.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-bold rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🔄</span>
                  <div className="text-left">
                    <div className="font-extrabold text-rose-200">Volver a empezar (Reiniciar mandato)</div>
                    <div className="text-[10px] text-rose-400/80 font-normal">Borra el guardado actual para iniciar un nuevo político.</div>
                  </div>
                </div>
                <span className="text-rose-500">➔</span>
              </button>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsOptionsOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Continuar jugando
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 space-y-2">
                <h4 className="font-bold text-sm">⚠️ ¿Seguro que querés reiniciar el mandato?</h4>
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  Esta acción borrará los datos de tu gestión actual de forma permanente y volverás a la pantalla de creación de personaje.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowRestartConfirm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRestartMandate}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg"
                >
                  Sí, reiniciar desde cero
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
