import React, { useState } from 'react';
import type { Decision, GameState, LogEntry } from '@engine/types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';

export interface DecisionCardProps {
  decision: Decision;
  onDecisionMade?: () => void;
  onDecisionResolved?: (resolution: DecisionResolution) => void;
}

export interface DecisionResolution {
  decisionTitle: string;
  choiceLabel: string;
  choiceDescription: string;
  logs: LogEntry[];
  delayedCount: number;
  affectedSectors: string[];
  mandateSnapshot: {
    popularity: number;
    stress: number;
    institutionality: number;
    reserves: number;
    trust: number;
    socialConflicts: number;
  };
  impacts: Array<{
    label: string;
    before: number;
    after: number;
    delta: number;
    tone: 'good' | 'bad' | 'neutral';
    meaning: 'mejora' | 'empeora' | 'sin cambio';
  }>;
  sectorImpacts: Array<{
    label: string;
    before: number;
    after: number;
    delta: number;
  }>;
  presidencyPulse: string;
}

const NATIONAL_LABELS = {
  reserves: 'Reservas',
  inflation: 'Inflación',
  debt: 'Deuda',
  gdp: 'PBI',
  production: 'Producción',
  consumption: 'Consumo',
  investment: 'Inversión',
  exchangeRate: 'Tipo de cambio',
  tourism: 'Turismo',
  poverty: 'Pobreza',
  employment: 'Empleo',
  insecurity: 'Inseguridad',
  education: 'Educación',
  health: 'Salud pública',
  polarization: 'Polarización',
  socialConflicts: 'Conflicto social',
  trust: 'Confianza social',
  institutionality: 'Institucionalidad',
  corruption: 'Corrupción percibida',
  internationalImage: 'Imagen internacional',
} as const;

const CHARACTER_LABELS = {
  health: 'Salud presidencial',
  stress: 'Estrés presidencial',
  popularity: 'Popularidad',
  wealth: 'Patrimonio personal',
  ego: 'Ego',
  idealismo: 'Idealismo',
  pragmatismo: 'Pragmatismo',
} as const;

const REPUTATION_LABELS: Record<string, string> = {
  empresarios: 'Empresarios',
  trabajadores: 'Trabajadores',
  jovenes: 'Jóvenes',
  jubilados: 'Jubilados',
  'clase-media': 'Clase media',
  campo: 'Campo',
  industria: 'Industria',
  docentes: 'Docentes',
  'fuerzas-seguridad': 'Fuerzas de seguridad',
  universidades: 'Universidades',
  ongs: 'ONGs',
  mercados: 'Mercados',
  inversores: 'Inversores',
  prensa: 'Prensa',
  'organismos-internacionales': 'Organismos internacionales',
};

const NEGATIVE_WHEN_UP = new Set([
  'inflation',
  'debt',
  'exchangeRate',
  'poverty',
  'insecurity',
  'polarization',
  'socialConflicts',
  'corruption',
  'stress',
]);

function toneFor(key: string, delta: number): 'good' | 'bad' | 'neutral' {
  if (delta === 0) return 'neutral';
  const directionIsGood = NEGATIVE_WHEN_UP.has(key) ? delta < 0 : delta > 0;
  return directionIsGood ? 'good' : 'bad';
}

function addImpact(
  impacts: DecisionResolution['impacts'],
  label: string,
  key: string,
  before: number,
  after: number,
) {
  const roundedBefore = Math.round(before);
  const roundedAfter = Math.round(after);
  const delta = roundedAfter - roundedBefore;
  if (delta === 0) return;
  const tone = toneFor(key, delta);
  impacts.push({ label, before: roundedBefore, after: roundedAfter, delta, tone, meaning: tone === 'good' ? 'mejora' : tone === 'bad' ? 'empeora' : 'sin cambio' });
}

function buildPresidencyPulse(after: GameState | null | undefined): string {
  if (!after) return 'El tablero cambió, pero no hay lectura general disponible.';
  const support = after.character.popularity >= 55 ? 'tenés apoyo para empujar' : after.character.popularity >= 35 ? 'tu base sigue discutida' : 'tu capital político está muy frágil';
  const pressure = after.character.stress >= 75 ? 'la presión sobre vos ya es seria' : after.character.stress >= 55 ? 'el desgaste ya se siente' : 'todavía gobernás sin quemarte';
  const country = after.nation.society.trust >= 50 && after.nation.governance.institutionality >= 50
    ? 'el país responde con cierto orden'
    : after.nation.economy.reserves <= 20 || after.nation.society.socialConflicts >= 70
    ? 'el país se acerca a zona crítica'
    : 'el país sigue frágil, pero manejable';
  return `Lectura de mandato: ${country}; ${support}; ${pressure}.`;
}

function collectDecisionImpacts(before: GameState | null | undefined, after: GameState | null | undefined): DecisionResolution['impacts'] {
  if (!before || !after) return [];
  const impacts: DecisionResolution['impacts'] = [];
  for (const group of ['economy', 'society', 'governance'] as const) {
    const beforeGroup = before.nation[group] as unknown as Record<string, number>;
    const afterGroup = after.nation[group] as unknown as Record<string, number>;
    Object.keys(afterGroup).forEach((key) => {
      addImpact(impacts, NATIONAL_LABELS[key as keyof typeof NATIONAL_LABELS] ?? key, key, beforeGroup[key] ?? 0, afterGroup[key] ?? 0);
    });
  }
  Object.keys(CHARACTER_LABELS).forEach((key) => {
    const beforeValue = before.character[key as keyof typeof CHARACTER_LABELS] as number;
    const afterValue = after.character[key as keyof typeof CHARACTER_LABELS] as number;
    addImpact(impacts, CHARACTER_LABELS[key as keyof typeof CHARACTER_LABELS], key, beforeValue, afterValue);
  });
  return impacts
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 8);
}

function collectSectorImpacts(before: GameState | null | undefined, after: GameState | null | undefined): DecisionResolution['sectorImpacts'] {
  if (!before || !after) return [];
  return Object.entries(after.reputation)
    .map(([key, afterValue]) => {
      const beforeValue = before.reputation[key as keyof typeof before.reputation] ?? 0;
      return {
        label: REPUTATION_LABELS[key] ?? key.replace(/-/g, ' '),
        before: Math.round(beforeValue),
        after: Math.round(afterValue),
        delta: Math.round(afterValue) - Math.round(beforeValue),
      };
    })
    .filter((item) => item.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6);
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onDecisionMade, onDecisionResolved }) => {
  const makeChoice = useGameStore((s) => s.makeChoice);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const urgencyColors = {
    baja: 'slate',
    media: 'sky',
    alta: 'gold',
    critica: 'rose',
  } as const;

  const handleChoiceClick = (choiceId: string) => {
    const choice = decision.choices.find((candidate) => candidate.id === choiceId);
    if (!choice || choice.disabled) return;
    if (confirming && selectedChoiceId === choiceId) {
      const before = useGameStore.getState().gameState;
      makeChoice(decision, choiceId);
      const after = useGameStore.getState().gameState;
      const newLogs = before && after ? after.eventLog.slice(before.eventLog.length) : [];
      onDecisionResolved?.({
        decisionTitle: decision.title,
        choiceLabel: choice.label,
        choiceDescription: choice.description,
      logs: newLogs,
      delayedCount: choice.delayedEffects.length,
      affectedSectors: [
        ...choice.preview.beneficiaries,
        ...choice.preview.opponents,
      ].slice(0, 5),
      mandateSnapshot: after ? {
        popularity: Math.round(after.character.popularity),
        stress: Math.round(after.character.stress),
        institutionality: Math.round(after.nation.governance.institutionality),
        reserves: Math.round(after.nation.economy.reserves),
        trust: Math.round(after.nation.society.trust),
        socialConflicts: Math.round(after.nation.society.socialConflicts),
      } : {
        popularity: 0,
        stress: 0,
        institutionality: 0,
        reserves: 0,
        trust: 0,
        socialConflicts: 0,
      },
      impacts: collectDecisionImpacts(before, after),
      sectorImpacts: collectSectorImpacts(before, after),
      presidencyPulse: buildPresidencyPulse(after),
      });
      if (onDecisionMade) onDecisionMade();
      setConfirming(false);
      setSelectedChoiceId(null);
      // Trasladar el foco suavemente arriba al escritorio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Primera selección — pedir confirmación
      setSelectedChoiceId(choiceId);
      setConfirming(true);
    }
  };

  return (
    <Card
      title={decision.title}
      subtitle={`Presentado por: ${decision.source}`}
      action={<Badge variant={urgencyColors[decision.urgency]}>{decision.urgency.toUpperCase()}</Badge>}
      className="mb-4"
    >
      <p className={`text-sm mb-5 leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{decision.description}</p>

      <div className="space-y-3">
        {decision.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id && confirming;

          return (
            <div
              key={choice.id}
              className={`p-4 rounded-2xl transition-all border ${choice.disabled ? 'opacity-60 border-slate-300 bg-slate-100' : ''} ${
                isSelected
                  ? isLight ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-sky-950/80 border-sky-400/60 shadow-lg shadow-sky-500/10'
                  : isLight ? 'bg-slate-50 border-slate-200 hover:border-blue-400' : 'bg-slate-900/80 border-slate-800 hover:border-sky-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{choice.label}</h4>
                {(() => {
                  const hasStrongRisk = choice.preview.risks.some(r => r.magnitude === 'fuerte');
                  const hasBomb = choice.delayedEffects.length > 0;
                  const highProbBomb = choice.delayedEffects.some(e => e.probability >= 0.5);

                  let badge = { label: 'Tensión baja', color: isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60' };
                  if (hasStrongRisk || (hasBomb && highProbBomb)) {
                    badge = { label: 'Tensión crítica', color: isLight ? 'bg-rose-100 text-rose-800 border-rose-300 font-black' : 'bg-rose-950/80 text-rose-300 border-rose-600/60 font-black animate-pulse' };
                  } else if (choice.preview.risks.length > 0 || hasBomb) {
                    badge = { label: 'Tensión moderada', color: isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950/80 text-amber-300 border-amber-600/60' };
                  }

                  return (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
              <p className={`text-xs mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{choice.description}</p>

              {choice.disabledReason && (
                <p className={`text-[11px] rounded-xl px-3 py-2 mb-3 border ${
                  isLight ? 'text-amber-900 bg-amber-50 border-amber-200' : 'text-amber-300/90 bg-amber-950/40 border-amber-700/40'
                }`}>
                  ☐ {choice.disabledReason}
                </p>
              )}

              <div className={`text-[11px] mb-3 p-3 rounded-xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}>
                <span className="text-amber-500 font-semibold block mb-1">Lo que está en juego</span>
                <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                  Esta opción mueve apoyos, costos y riesgos, pero el resultado concreto se revela después de firmar.
                </p>
              </div>

              {/* Beneficiarios y opositores */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] mb-3">
                {choice.preview.beneficiaries.length > 0 && (
                  <span className={isLight ? 'text-emerald-800 font-bold' : 'text-emerald-300 font-medium'}>
                    Sectores que podrían acompañar: {choice.preview.beneficiaries.join(', ')}
                  </span>
                )}
                {choice.preview.opponents.length > 0 && (
                  <span className={isLight ? 'text-rose-800 font-bold' : 'text-rose-300 font-medium'}>
                    Sectores que podrían resistir: {choice.preview.opponents.join(', ')}
                  </span>
                )}
              </div>

              {/* Indicador de bomba de tiempo */}
              {choice.delayedEffects.length > 0 && (
                <div className={`text-[11px] px-2.5 py-1 rounded-lg mb-3 border ${
                  isLight
                    ? 'text-amber-950 bg-amber-100/90 border-amber-300 font-medium'
                    : 'text-amber-300/90 bg-amber-950/40 border-amber-800/40'
                }`}>
                  Esta opción puede dejar un expediente latente que vuelva más adelante.
                </div>
              )}

              <Button
                variant={isSelected ? 'gold' : 'primary'}
                size="sm"
                className="w-full"
                disabled={choice.disabled}
                onClick={() => handleChoiceClick(choice.id)}
              >
                {choice.disabled ? 'No disponible' : isSelected ? 'Confirmar decisión' : 'Elegir esta opción'}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
