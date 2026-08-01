import React from 'react';
import { useGameStore } from '@stores/game-store';
import { CAREER_LABELS } from '@engine/constants';
import { Badge } from '@components/ui/Badge';

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const Header: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState) return null;

  const { character, turn, calendar } = gameState;
  const monthName = MONTH_NAMES[(calendar.month ?? 1) - 1] ?? 'Ene';

  return (
    <header className="h-14 glass-panel border-b border-slate-800 px-6 flex items-center justify-between z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-sky-200">
          MI MANDATO
        </h1>
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <Badge variant="slate">📅 {monthName} {calendar.year}</Badge>
          <Badge variant="gold">{calendar.season}</Badge>
          <span className="text-slate-500">Turno {turn}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="hidden md:flex items-center gap-2">
          <span className="font-bold text-slate-100">{character.name} {character.surname}</span>
          <Badge variant="sky">{CAREER_LABELS[character.career]}</Badge>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span className={`${character.health < 40 ? 'text-rose-400 animate-pulse' : 'text-rose-300'}`}>
            ❤️ {Math.round(character.health)}
          </span>
          <span className={`${character.stress > 70 ? 'text-amber-400 animate-pulse' : 'text-amber-300'}`}>
            ⚡ {Math.round(character.stress)}
          </span>
          <span className={`${character.popularity < 30 ? 'text-emerald-400 animate-pulse' : 'text-emerald-300'}`}>
            ⭐ {Math.round(character.popularity)}
          </span>
        </div>
      </div>
    </header>
  );
};
