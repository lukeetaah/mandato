import React, { useState } from 'react';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';
import type { NationalScar, PersistentConsequence } from '@engine/types';
import { dedupeNationalScars } from '@engine/scars';
import { Card } from '@components/ui/Card';
import { StatBar } from '@components/ui/StatBar';

import { SectorDonutChart } from './SectorDonutChart';

export const Dashboard: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSectors, setShowSectors] = useState(false);

  if (!gameState) return null;

  const { nation, character, calendar, scars, persistentConsequences, reputation } = gameState;
  const [selectedScarId, setSelectedScarId] = useState<string | null>(null);
  const [expandedConsequenceId, setExpandedConsequenceId] = useState<string | null>(null);
  const activeConsequences = (persistentConsequences ?? []).filter((c) => c.visibleInUI && !c.resolved);
  const uniqueScars = dedupeNationalScars(scars);
  const selectedScar: NationalScar | undefined = uniqueScars.find((scar) => scar.id === selectedScarId);

  return (
    <div className="space-y-5 font-sans">
      {/* Encabezado y controles de colapso rápido */}
      <div className={`flex flex-wrap justify-between items-center p-3.5 px-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <span className={`text-xs font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
          <span>🏛️</span> Presidencia de la República — Tablero y estadísticas
        </span>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className={`text-xs font-bold px-3 py-1.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              showStats
                ? (isLight ? 'bg-slate-200 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-100')
                : (isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900')
            }`}
          >
            <span>📊</span> {showStats ? 'Ocultar indicadores' : 'Ver indicadores del país'}
          </button>

          <button
            type="button"
            onClick={() => setShowSectors(!showSectors)}
            className={`text-xs font-bold px-3 py-1.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              showSectors
                ? (isLight ? 'bg-slate-200 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-100')
                : (isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900')
            }`}
          >
            <span>👔</span> {showSectors ? 'Ocultar sectores' : 'Ver respaldo por sector'}
          </button>

          <button
            type="button"
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? 'text-blue-800 bg-blue-50 border-blue-200 hover:bg-blue-100'
                : 'text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border-amber-500/30'
            }`}
          >
            <span>❓</span> {showHowToPlay ? 'Ocultar guía' : '¿Cómo se juega?'}
          </button>
        </div>
      </div>

      {/* Guía Rápida Reescrita y Coherente */}
      {showHowToPlay && (
        <div className={`p-5 rounded-2xl border text-xs space-y-4 ${
          isLight ? 'bg-blue-50/60 border-blue-200 text-slate-800' : 'bg-[#161B22] border-blue-500/40 text-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b pb-2 border-blue-200/50">
            <h4 className={`font-extrabold text-sm flex items-center gap-2 ${
              isLight ? 'text-blue-900' : 'text-sky-300'
            }`}>
              <span>📘</span> Guía rápida: ¿Cómo se juega a Mi Mandato?
            </h4>
            <span className="text-[11px] font-bold text-slate-500">1 turno = 1 quincena (2 turnos = 1 mes)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <span className="font-bold text-emerald-600 block text-xs">1. Tu despacho presidencial</span>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                En la mesa principal tenés objetos interactivos: <b>teléfono rojo</b>, <b>diarios</b>, <b>expedientes</b> y <b>mensajes confidenciales</b>. Hacé click sobre ellos para inspeccionarlos o abrir decisiones. Al presionar <b>Avanzar quincena</b> transcurre el tiempo.
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <span className="font-bold text-sky-600 block text-xs">2. Indicadores vitales</span>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Controlá el nivel de <b>Reservas del Banco Central</b> (divisas), la <b>Inflación</b> y tu nivel de <b>Estrés / Salud</b>. Si el estrés supera el 80% o las reservas se agotan, tu gobierno colapsa antes de tiempo.
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1.5 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <span className="font-bold text-purple-600 block text-xs">3. Vías alternativas de gestión</span>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                • 🗺️ <b>Regiones</b>: Pactá con gobernadores o desplegá fuerzas federales.<br />
                • 👤 <b>Perfil y vida</b>: Administrá tu patrimonio, salud y autos oficiales.<br />
                • 📰 <b>Prensa y redes</b>: Medí el clima social y las portadas de los diarios.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico Donut de Reputación por Sectores (Colapsable) */}
      {showSectors && (
        <div className="animate-fadeIn">
          <SectorDonutChart reputation={reputation ?? {}} />
        </div>
      )}

      {/* Indicadores clave del país (Colapsable) */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 animate-fadeIn">
          {/* Tu gestión */}
          <Card title="👤 Tu gestión" subtitle={`${character.name} ${character.surname}`}>
            <div className="space-y-3">
              <StatBar label="Popularidad" value={character.popularity} color="emerald" />
              <StatBar label="Salud física" value={character.health} color="rose" />
              <StatBar label="Estrés acumulado" value={character.stress} color="gold" />
              <div className={`flex justify-between text-[11px] pt-2 border-t ${
                isLight ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-slate-800'
              }`}>
                <span>Idealismo: <b className="text-sky-600 font-bold">{Math.round(character.idealismo)}</b></span>
                <span>Pragmatismo: <b className={isLight ? 'text-amber-800 font-bold' : 'text-amber-400 font-bold'}>{Math.round(character.pragmatismo)}</b></span>
                <span>Ego: <b className="text-purple-600 font-bold">{Math.round(character.ego)}</b></span>
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
      )}

      {/* Cicatrices Nacionales (Memoria Viva) */}
      {uniqueScars.length > 0 && (
        <div className={`p-4 rounded-2xl border ${
          isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-[#161B22] border-amber-500/30'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${
            isLight ? 'text-amber-900' : 'text-amber-300'
          }`}>
            <span>📜</span> Cicatrices históricas del país
          </h4>
          <div className="flex flex-wrap gap-2">
            {uniqueScars.map((scar) => (
              <button
                key={scar.id}
                type="button"
                aria-pressed={selectedScarId === scar.id}
                onClick={() => setSelectedScarId((current) => current === scar.id ? null : scar.id)}
                className={`px-3 py-1.5 rounded-2xl border text-xs flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  isLight
                    ? selectedScarId === scar.id ? 'border-amber-600 bg-amber-100 text-amber-950 font-bold' : 'border-amber-300 bg-white text-amber-900 hover:border-amber-500'
                    : selectedScarId === scar.id ? 'border-amber-300 bg-amber-900/60 text-amber-200 font-bold' : 'border-amber-500/30 bg-amber-950/40 text-amber-200 hover:border-amber-300/70'
                }`}
              >
                <span>{scar.icon}</span>
                <span><b>{scar.title}</b> ({scar.year})</span>
              </button>
            ))}
          </div>
          {selectedScar && (
            <div className={`mt-3 rounded-2xl border p-4 text-xs leading-relaxed ${
              isLight ? 'border-amber-200 bg-white text-slate-800' : 'border-amber-500/30 bg-slate-950/60 text-slate-300'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h5 className={`font-bold ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>{selectedScar.icon} {selectedScar.title}</h5>
                <span className={`text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-amber-400/80'}`}>Turno {selectedScar.originTurn}</span>
              </div>
              <p>{selectedScar.description}</p>
              <p className={`mt-2 italic ${isLight ? 'text-amber-900 font-medium' : 'text-amber-200/80'}`}>{selectedScar.mediaEcho}</p>
            </div>
          )}
        </div>
      )}

      {/* Consecuencias Persistentes del País */}
      {activeConsequences.length > 0 && (
        <div className={`p-4 rounded-2xl border ${
          isLight ? 'bg-violet-50/70 border-violet-200' : 'bg-[#161B22] border-violet-500/30'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
            isLight ? 'text-violet-900' : 'text-violet-300'
          }`}>
            <span>🔗</span> Consecuencias en curso
          </h4>
          <div className="space-y-2">
            {activeConsequences.map((c: PersistentConsequence) => {
              const categoryColors: Record<string, string> = isLight ? {
                temporal: 'bg-slate-100 text-slate-800 border-slate-300',
                latente: 'bg-yellow-100 text-yellow-900 border-yellow-300',
                persistente: 'bg-orange-100 text-orange-900 border-orange-300',
                recurrente: 'bg-blue-100 text-blue-900 border-blue-300',
                permanente: 'bg-rose-100 text-rose-900 border-rose-300',
                heredada: 'bg-violet-100 text-violet-900 border-violet-300',
              } : {
                temporal: 'bg-slate-700/60 text-slate-300 border-slate-500/40',
                latente: 'bg-yellow-950/60 text-yellow-300 border-yellow-500/40',
                persistente: 'bg-orange-950/60 text-orange-300 border-orange-500/40',
                recurrente: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
                permanente: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
                heredada: 'bg-violet-950/60 text-violet-300 border-violet-500/40',
              };
              const colorClass = categoryColors[c.category] ?? categoryColors['persistente']!;
              const isExpanded = expandedConsequenceId === c.id;
              return (
                <div key={c.id} className={`rounded-2xl border p-3 ${
                  isLight ? 'border-violet-200 bg-white' : 'border-violet-500/20 bg-slate-900/60'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-base shrink-0">{c.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-xs leading-snug ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{c.summary}</p>
                        <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${colorClass}`}>
                          {c.category}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedConsequenceId(isExpanded ? null : c.id)}
                      className={`shrink-0 text-[10px] transition-colors cursor-pointer font-bold ${
                        isLight ? 'text-violet-700 hover:text-violet-900' : 'text-violet-400 hover:text-violet-200'
                      }`}
                    >
                      {isExpanded ? '▲ cerrar' : '▼ por qué'}
                    </button>
                  </div>
                  {isExpanded && c.causalityChain.length > 0 && (
                    <ol className={`mt-2 pl-4 space-y-1 border-t pt-2 ${isLight ? 'border-violet-200' : 'border-violet-500/20'}`}>
                      {c.causalityChain.map((step, i) => (
                        <li key={i} className={`text-[11px] list-decimal ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas contextuales */}
      {character.stress > 70 && (
        <div className={`p-3.5 border rounded-2xl text-xs flex items-center gap-2 ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}>
          <span className="text-lg">⚠️</span>
          <span><b>Estrés crítico:</b> Tu salud se deteriora. Si el estrés no baja, podrías colapsar y perder el mandato.</span>
        </div>
      )}
      {calendar.turnsUntilLegislative <= 3 && calendar.turnsUntilLegislative > 0 && (
        <div className={`p-3.5 border rounded-2xl text-xs flex items-center gap-2 ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}>
          <span className="text-lg">🗳️</span>
          <span><b>Elecciones legislativas en {calendar.turnsUntilLegislative} quincenas.</b> Tu popularidad actual ({Math.round(character.popularity)}%) determinará el resultado. Necesitás al menos 40% para ganar.</span>
        </div>
      )}
      {calendar.turnsUntilPresidential <= 6 && calendar.turnsUntilPresidential > 0 && (
        <div className={`p-3.5 border rounded-2xl text-xs flex items-center gap-2 ${
          isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-sky-950/40 border-sky-500/30 text-sky-200'
        }`}>
          <span className="text-lg">🏛️</span>
          <span><b>Elecciones presidenciales en {calendar.turnsUntilPresidential} quincenas.</b> Si tu imagen baja de 45%, perdés y tu mandato termina. Popularidad actual: <b>{Math.round(character.popularity)}%</b></span>
        </div>
      )}
      {nation.economy.reserves < 20 && (
        <div className={`p-3.5 border rounded-2xl text-xs flex items-center gap-2 ${
          isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}>
          <span className="text-lg">🚨</span>
          <span><b>Reservas críticas:</b> El Banco Central tiene menos de {Math.round(nation.economy.reserves)}% de reservas. El riesgo de corrida cambiaria es inminente.</span>
        </div>
      )}
    </div>
  );
};
