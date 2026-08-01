import React from 'react';
import type { CalendarState } from '@engine/types';
import { Badge } from '@components/ui/Badge';

export interface CalendarWidgetProps {
  calendar: CalendarState;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SEASON_EMOJIS: Record<string, string> = {
  'Verano': '☀️',
  'Otoño': '🍂',
  'Invierno': '❄️',
  'Primavera': '🌸',
};

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ calendar }) => {
  const monthName = MONTH_NAMES[calendar.month - 1] ?? 'Enero';
  const seasonEmoji = SEASON_EMOJIS[calendar.season] ?? '📅';

  const legVariant = calendar.turnsUntilLegislative <= 3 ? 'rose' : calendar.turnsUntilLegislative <= 6 ? 'gold' : 'sky';
  const presVariant = calendar.turnsUntilPresidential <= 6 ? 'rose' : calendar.turnsUntilPresidential <= 12 ? 'gold' : 'slate';

  return (
    <div className="flex flex-wrap items-center gap-3 glass-panel px-4 py-2.5 rounded-xl text-xs">
      <div className="flex items-center gap-2">
        <span className="text-base">{seasonEmoji}</span>
        <span className="font-bold text-slate-100 text-sm">{monthName} {calendar.year}</span>
        <span className="text-slate-500">({calendar.season})</span>
      </div>

      <div className="h-4 w-px bg-slate-800"></div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400">🗳️ Legislativas:</span>
        <Badge variant={legVariant}>
          {calendar.turnsUntilLegislative === 0 ? '¡HOY!' : `${calendar.turnsUntilLegislative} meses`}
        </Badge>
      </div>

      <div className="h-4 w-px bg-slate-800"></div>

      <div className="flex items-center gap-2">
        <span className="text-slate-400">🏛️ Presidenciales:</span>
        <Badge variant={presVariant}>
          {calendar.turnsUntilPresidential === 0 ? '¡HOY!' : `${calendar.turnsUntilPresidential} meses`}
        </Badge>
      </div>
    </div>
  );
};
