import React from 'react';
import { useGameStore } from '@stores/game-store';
import { Card } from '@components/ui/Card';
import { StatBar } from '@components/ui/StatBar';
import { HeadlineBanner } from './HeadlineBanner';
import { CalendarWidget } from './CalendarWidget';

export const Dashboard: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);

  if (!gameState) return null;

  const { nation, character, calendar, dailyHeadlines, scars } = gameState;

  return (
    <div className="space-y-6">
      {/* Calendario + Elecciones */}
      <CalendarWidget calendar={calendar} />

      {/* Titulares del día */}
      <HeadlineBanner headlines={dailyHeadlines} />

      {/* Cicatrices Nacionales (Memoria Viva) */}
      {scars.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>📜</span> Cicatrices históricas del país
          </h4>
          <div className="flex flex-wrap gap-2">
            {scars.map((scar) => (
              <div
                key={scar.id}
                className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2"
              >
                <span>{scar.icon}</span>
                <span><b>{scar.title}</b> ({scar.year})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de indicadores macro */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Tu gestión */}
        <Card title="👤 Tu gestión" subtitle={`${character.name} ${character.surname}`}>
          <div className="space-y-3">
            <StatBar label="Popularidad" value={character.popularity} color="emerald" />
            <StatBar label="Salud física" value={character.health} color="rose" />
            <StatBar label="Estrés acumulado" value={character.stress} color="gold" />
            <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>Idealismo: <b className="text-sky-300">{Math.round(character.idealismo)}</b></span>
              <span>Pragmatismo: <b className="text-amber-300">{Math.round(character.pragmatismo)}</b></span>
              <span>Ego: <b className="text-purple-300">{Math.round(character.ego)}</b></span>
            </div>
          </div>
        </Card>

        {/* Economía */}
        <Card title="📊 Economía" subtitle="Indicadores macroeconómicos">
          <div className="space-y-3">
            <StatBar label="Inflación" value={nation.economy.inflation} color="rose" />
            <StatBar label="Reservas del Banco Central" value={nation.economy.reserves} color="emerald" />
            <StatBar label="Deuda pública" value={nation.economy.debt} color="gold" />
            <StatBar label="PBI y actividad" value={nation.economy.gdp} color="sky" />
          </div>
        </Card>

        {/* Sociedad */}
        <Card title="👥 Sociedad" subtitle="Bienestar social">
          <div className="space-y-3">
            <StatBar label="Pobreza" value={nation.society.poverty} color="rose" />
            <StatBar label="Empleo registrado" value={nation.society.employment} color="emerald" />
            <StatBar label="Inseguridad" value={nation.society.insecurity} color="rose" />
            <StatBar label="Conflictos sociales" value={nation.society.socialConflicts} color="gold" />
          </div>
        </Card>

        {/* Gobernanza */}
        <Card title="🏛️ Gobernanza" subtitle="Calidad institucional">
          <div className="space-y-3">
            <StatBar label="Institucionalidad" value={nation.governance.institutionality} color="sky" />
            <StatBar label="Corrupción percibida" value={nation.governance.corruption} color="gold" />
            <StatBar label="Imagen internacional" value={nation.governance.internationalImage} color="emerald" />
            <StatBar label="Confianza ciudadana" value={nation.society.trust} color="purple" />
          </div>
        </Card>
      </div>

      {/* Alertas contextuales */}
      {character.stress > 70 && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-200 text-xs flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span><b>Estrés crítico:</b> Tu salud se deteriora. Si el estrés no baja, podrías colapsar y perder el mandato.</span>
        </div>
      )}
      {calendar.turnsUntilLegislative <= 3 && calendar.turnsUntilLegislative > 0 && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
          <span className="text-lg">🗳️</span>
          <span><b>Elecciones legislativas en {calendar.turnsUntilLegislative} meses.</b> Tu popularidad actual ({Math.round(character.popularity)}%) determinará el resultado. Necesitás al menos 40% para ganar.</span>
        </div>
      )}
      {calendar.turnsUntilPresidential <= 6 && calendar.turnsUntilPresidential > 0 && (
        <div className="p-3 bg-sky-950/40 border border-sky-500/30 rounded-xl text-sky-200 text-xs flex items-center gap-2">
          <span className="text-lg">🏛️</span>
          <span><b>Elecciones presidenciales en {calendar.turnsUntilPresidential} meses.</b> Si tu imagen baja de 45%, perdés y tu mandato termina. Popularidad actual: <b>{Math.round(character.popularity)}%</b></span>
        </div>
      )}
      {nation.economy.reserves < 20 && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-200 text-xs flex items-center gap-2">
          <span className="text-lg">🚨</span>
          <span><b>Reservas críticas:</b> El Banco Central tiene menos de {Math.round(nation.economy.reserves)}% de reservas. El riesgo de corrida cambiaria es inminente.</span>
        </div>
      )}
    </div>
  );
};
