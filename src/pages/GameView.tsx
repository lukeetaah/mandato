import React, { useState } from 'react';
import { useUIStore } from '@stores/ui-store';
import { useGameStore } from '@stores/game-store';
import { MainLayout } from '@components/layout/MainLayout';
import { Dashboard } from '@components/game/Dashboard';
import { DecisionCard, type DecisionResolution } from '@components/game/DecisionCard';
import { InteractiveMap } from '@components/game/InteractiveMap';
import { OnboardingModal } from '@components/game/OnboardingModal';
import { DecisionFlowMap } from '@components/game/DecisionFlowMap';
import { PressNewsRoom } from '@components/game/PressNewsRoom';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { Modal } from '@components/ui/Modal';
import { REPUTATION_LABELS, HOUSING_LABELS, HOUSING_SATIRE } from '@engine/constants';

import { PresidentialDesk } from '@components/game/PresidentialDesk';
import { JudicialTrial } from '@components/game/JudicialTrial';
import { CalendarWidget } from '@components/game/CalendarWidget';
import { PresidentAvatar } from '@components/character/PresidentAvatar';

const FIRST_ROUND_TOUR_STEPS: Array<{
  tab: 'dashboard' | 'provincias' | 'prensa' | 'calendario' | 'personaje' | 'historial';
  title: string;
  body: string;
  button: string;
}> = [
  { tab: 'dashboard', title: 'Primero mirá el despacho', body: 'Acá llegan expedientes, llamadas, diarios y asuntos urgentes. La primera decisión espera, pero antes conviene leer el país.', button: 'Ir a regiones' },
  { tab: 'provincias', title: 'Leé las regiones', body: 'El mapa no es decorativo: cada macro-región tiene humor social, economía, recursos y gobernadores con afiliación propia.', button: 'Ir a prensa y redes' },
  { tab: 'prensa', title: 'Revisá prensa y redes', body: 'Los medios y las redes traducen tu poder en clima público. Una medida puede funcionar y aun así salir mal narrada.', button: 'Ir al calendario' },
  { tab: 'calendario', title: 'Ubicá el tiempo político', body: 'Cada quincena mueve ciclos, elecciones y consecuencias diferidas. A veces el costo vuelve meses después.', button: 'Ir al presidente' },
  { tab: 'personaje', title: 'Mirate como persona', body: 'Tu salud, estrés, reputación y rasgos importan. No gobernás como cursor: gobernás con un cuerpo y una biografía.', button: 'Ir al historial' },
  { tab: 'historial', title: 'Entendé la memoria', body: 'Acá quedan decisiones, eventos, cicatrices y resoluciones. Cuando algo vuelve, este archivo explica de dónde viene.', button: 'Volver al despacho y decidir' },
];

export const GameView: React.FC = () => {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  const gameState = useGameStore((s) => s.gameState);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [personalActionFeedback, setPersonalActionFeedback] = useState<string | null>(null);
  const [decisionResolution, setDecisionResolution] = useState<DecisionResolution | null>(null);
  const [isResolvingDecision, setIsResolvingDecision] = useState(false);
  const [firstRoundTourStep, setFirstRoundTourStep] = useState(0);

  if (!gameState) return null;

  const { pendingDecisions, provinces, reputation, eventLog, patterns, character } = gameState;

  // Estado de salud y estrés del Presidente
  const getPresidentHealthStatus = () => {
    const { health, stress } = character;
    if (health >= 75 && stress < 30) {
      return {
        emoji: '😃',
        title: 'Líder radiante y pleno',
        badgeColor: 'emerald' as const,
        description: 'Te ves descansado, enérgico y con pleno dominio sobre la agenda política.',
      };
    }
    if (health >= 50 && stress < 60) {
      return {
        emoji: '😐',
        title: 'Sobrecargado y fatigado',
        badgeColor: 'gold' as const,
        description: 'La sobrecarga diaria empieza a notarse en tu rostro. Las ojeras se hacen visibles.',
      };
    }
    if (health >= 25 && stress < 80) {
      return {
        emoji: '😰',
        title: 'Demacrado y estresado',
        badgeColor: 'rose' as const,
        description: 'Tensión permanente. La prensa comenta tu aspecto desmejorado tras las reuniones.',
      };
    }
    return {
      emoji: '💀',
      title: 'Borde de colapso médico',
      badgeColor: 'rose' as const,
      description: '¡Riesgo inminente de infarto o colapso nervioso! Los médicos exigen reposo urgente.',
    };
  };

  const presidentStatus = getPresidentHealthStatus();
  const openingRegion = provinces.find((province) => province.id === character.province)?.name ?? 'la región de origen';
  const isFirstRoundTourActive = gameState.turn === 1 && gameState.decisionHistory.length === 0 && firstRoundTourStep >= 0;
  const currentTourStep = isFirstRoundTourActive ? FIRST_ROUND_TOUR_STEPS[firstRoundTourStep] : null;

  const advanceFirstRoundTour = () => {
    const nextStep = firstRoundTourStep + 1;
    if (nextStep >= FIRST_ROUND_TOUR_STEPS.length) {
      setFirstRoundTourStep(-1);
      setActiveTab('dashboard');
      return;
    }
    setFirstRoundTourStep(nextStep);
    setActiveTab(FIRST_ROUND_TOUR_STEPS[nextStep]!.tab);
  };

  const handleDecisionResolved = (resolution: DecisionResolution) => {
    setDecisionResolution(resolution);
    setIsResolvingDecision(true);
    setTimeout(() => setIsResolvingDecision(false), 750);
  };

  // Acciones Presidenciales y Estilo de Vida
  const executePersonalAction = (action: 'olivos' | 'gala' | 'beneficencia' | 'auto' | 'vacaciones' | 'austeridad') => {
    useGameStore.getState().updateGameState((prev) => {
      const char = prev.character;
      if (action === 'olivos') {
        return {
          ...prev,
          character: {
            ...char,
            housing: 'residencia-oficial',
            stress: Math.max(0, char.stress - 15),
          },
          nation: {
            ...prev.nation,
            governance: { ...prev.nation.governance, institutionality: Math.min(100, prev.nation.governance.institutionality + 3) },
          },
        };
      }
      if (action === 'gala') {
        return {
          ...prev,
          character: {
            ...char,
            pragmatismo: Math.min(100, char.pragmatismo + 6),
            stress: Math.max(0, char.stress - 8),
          },
          reputation: {
            ...prev.reputation,
            empresarios: Math.min(100, (prev.reputation.empresarios ?? 50) + 7),
          },
        };
      }
      if (action === 'beneficencia') {
        return {
          ...prev,
          character: {
            ...char,
            popularity: Math.min(100, char.popularity + 5),
            idealismo: Math.min(100, char.idealismo + 5),
          },
          reputation: {
            ...prev.reputation,
            jubilados: Math.min(100, (prev.reputation.jubilados ?? 50) + 6),
          },
        };
      }
      if (action === 'auto') {
        return {
          ...prev,
          character: {
            ...char,
            wealth: Math.max(0, char.wealth - 10),
            stress: Math.max(0, char.stress - 12),
            possessions: [
              ...char.possessions,
              {
                id: `pos-${Date.now()}`,
                name: 'Auto de alta gama con escolta',
                description: 'Vehículo importado con blindaje de protocolo.',
                value: 30,
                perceptionImpact: -4,
                acquiredTurn: prev.turn,
              },
            ],
          },
          nation: {
            ...prev.nation,
            governance: { ...prev.nation.governance, corruption: Math.min(100, prev.nation.governance.corruption + 2) },
          },
        };
      }
      if (action === 'vacaciones') {
        return {
          ...prev,
          character: {
            ...char,
            stress: Math.max(0, char.stress - 30),
            health: Math.min(100, char.health + 15),
            popularity: Math.max(0, char.popularity - 3),
          },
        };
      }
      // austeridad
      return {
        ...prev,
        character: {
          ...char,
          popularity: Math.min(100, char.popularity + 4),
          idealismo: Math.min(100, char.idealismo + 5),
        },
        nation: {
          ...prev.nation,
          governance: { ...prev.nation.governance, institutionality: Math.min(100, prev.nation.governance.institutionality + 4) },
        },
      };
    });

    const messages = {
      olivos: '🏡 Te mudaste a la Residencia Oficial de Olivos. Garantizás protocolo de seguridad y reducís estrés.',
      gala: '🥂 Organizaste una cena de gala con líderes opositores y empresarios. Mejoró el clima institucional.',
      beneficencia: '🎗️ Participaste en un acto a beneficio en el hospital público. Tu popularidad social subió.',
      auto: '🚗 Adquiriste un auto de alta gama. Tu estrés bajó, aunque generó comentarios en la prensa.',
      vacaciones: '🌴 Te tomaste vacaciones privadas. Recuperaste salud y redujiste el estrés de gestión.',
      austeridad: '🧘 Mantuviste una vida austera. Tu imagen pública y la transparencia de gobierno aumentaron.',
    };

    setPersonalActionFeedback(messages[action]);
    setTimeout(() => setPersonalActionFeedback(null), 4000);
  };

  if (gameState.phase === 'trial') {
    const trialDecision = pendingDecisions.find((decision) => decision.id.startsWith('trial-'));
    if (trialDecision) {
      return (
        <MainLayout>
          <JudicialTrial decision={trialDecision} />
        </MainLayout>
      );
    }
  }

  // Manejo de fin de mandato o reelección
  const isMandateComplete = gameState.phase === 'opposition' || gameState.phase === 'gameover';

  const handleContinueReelection = () => {
    useGameStore.getState().updateGameState((prev) => ({
      ...prev,
      phase: 'playing',
      character: { ...prev.character, health: 80, stress: 30, career: 'presidente' },
      calendar: { ...prev.calendar, year: prev.calendar.year + 1 },
    }));
  };

  return (
    <MainLayout>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <Modal
        isOpen={Boolean(currentTourStep)}
        onClose={advanceFirstRoundTour}
        title={currentTourStep?.title ?? 'Recorrido inicial'}
      >
        {currentTourStep && (
          <div className="space-y-3 text-xs font-sans">
            <p className={isLight ? 'text-slate-700 leading-relaxed' : 'text-slate-300 leading-relaxed'}>
              {currentTourStep.body}
            </p>
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold">
                Paso {firstRoundTourStep + 1} de {FIRST_ROUND_TOUR_STEPS.length}
              </span>
              <button
                type="button"
                onClick={advanceFirstRoundTour}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
              >
                {currentTourStep.button}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={decisionResolution !== null}
        onClose={() => {
          setDecisionResolution(null);
          setIsResolvingDecision(false);
        }}
        title={isResolvingDecision ? 'La decisión empieza a moverse' : 'Resolución de la decisión'}
      >
        {decisionResolution && (
          <div className="space-y-4 text-xs font-sans">
            {isResolvingDecision ? (
              <div className="min-h-48 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-sky-500/30 border-t-amber-300 animate-spin" />
                <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  La firma sale del despacho. Ministros, gobernadores y diarios empiezan a traducirla a su propio idioma.
                </p>
              </div>
            ) : (
              <>
                <div className={`rounded-2xl border p-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-700'}`}>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-sky-400 font-black">Decidiste</span>
                  <h3 className={`text-base font-black mt-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{decisionResolution.choiceLabel}</h3>
                  <p className={isLight ? 'text-slate-600 mt-2' : 'text-slate-300 mt-2'}>{decisionResolution.choiceDescription}</p>
                </div>

                <div className="space-y-2">
                  {(decisionResolution.logs.length > 0 ? decisionResolution.logs : [{
                    turn: gameState.turn,
                    type: 'system' as const,
                    title: decisionResolution.decisionTitle,
                    description: 'La medida fue registrada. Sus efectos empiezan a circular por el sistema político.',
                  }]).map((log, index) => (
                    <div key={`${log.title}-${index}`} className={`rounded-2xl border p-3 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                      <h4 className={`font-black text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{log.title}</h4>
                      <p className={isLight ? 'text-slate-600 mt-1' : 'text-slate-300 mt-1'}>{log.description}</p>
                      {log.emotionalText && (
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 italic font-serif mt-2">
                          “{log.emotionalText}”
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {(decisionResolution.impacts.length > 0 || decisionResolution.sectorImpacts.length > 0) && (
                  <div className={`rounded-2xl border p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-700'}`}>
                    <h4 className={`font-black mb-3 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Qué cambió en el tablero</h4>
                    <p className={`text-[11px] mb-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      {decisionResolution.presidencyPulse}
                    </p>

                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[10px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                        <span className="block font-black uppercase tracking-[0.14em] text-sky-400">Popularidad</span>
                        <span className="text-sm font-black">{decisionResolution.mandateSnapshot.popularity}</span>
                      </div>
                      <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                        <span className="block font-black uppercase tracking-[0.14em] text-sky-400">Estrés</span>
                        <span className="text-sm font-black">{decisionResolution.mandateSnapshot.stress}</span>
                      </div>
                      <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                        <span className="block font-black uppercase tracking-[0.14em] text-sky-400">Instituciones</span>
                        <span className="text-sm font-black">{decisionResolution.mandateSnapshot.institutionality}</span>
                      </div>
                      <div className={`rounded-xl border px-3 py-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                        <span className="block font-black uppercase tracking-[0.14em] text-sky-400">Reservas</span>
                        <span className="text-sm font-black">{decisionResolution.mandateSnapshot.reserves}</span>
                      </div>
                    </div>

                    <p className={`text-[10px] mb-3 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Verde = mejora real para ese indicador. Rojo = empeora real. El signo por sí solo no manda: manda el efecto sobre el gobierno.
                    </p>

                    {decisionResolution.impacts.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {decisionResolution.impacts.map((impact) => (
                          <div
                            key={`${impact.label}-${impact.delta}`}
                            className={`rounded-xl border px-3 py-2 ${
                              impact.tone === 'good'
                                ? isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/35 border-emerald-700/45 text-emerald-200'
                                : impact.tone === 'bad'
                                ? isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/35 border-rose-700/45 text-rose-200'
                                : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-center gap-3">
                              <span className="font-bold">{impact.label}</span>
                              <span className="font-black">{impact.meaning}: {impact.delta > 0 ? '+' : ''}{impact.delta}</span>
                            </div>
                            <p className="text-[10px] opacity-80 mt-0.5">{impact.before} → {impact.after}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {decisionResolution.sectorImpacts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <h5 className="font-black text-[11px] text-sky-400 mb-2">Relaciones que se movieron</h5>
                        <div className="flex gap-2 flex-wrap">
                          {decisionResolution.sectorImpacts.map((impact) => (
                            <span
                              key={`${impact.label}-${impact.delta}`}
                              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                                impact.delta > 0
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {impact.label} {impact.delta > 0 ? '+' : ''}{impact.delta}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`rounded-2xl border p-3 ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-700/50 text-amber-200'}`}>
                    <h4 className="font-black mb-1">Lo que queda pendiente</h4>
                    <p>{decisionResolution.delayedCount > 0 ? 'Hay una consecuencia latente. Puede volver cuando cambie el clima político.' : 'No quedó una bomba de tiempo directa, aunque el país guarda memoria.'}</p>
                  </div>
                  <div className={`rounded-2xl border p-3 ${isLight ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-sky-950/40 border-sky-700/50 text-sky-200'}`}>
                    <h4 className="font-black mb-1">A quién miran los diarios</h4>
                    <p>{decisionResolution.affectedSectors.length > 0 ? decisionResolution.affectedSectors.join(', ') : 'Gabinete, prensa y gobernadores.'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de cierre de mandato o reelección */}
      {isMandateComplete && (
        <Modal isOpen={true} onClose={() => {}} title="🏛️ Balance final y futuro del mandato">
          <div className="space-y-5 text-xs font-sans">
            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
            }`}>
              <span className="text-4xl block mb-2">📜</span>
              <h3 className="text-lg font-black uppercase tracking-wider">
                {gameState.phase === 'opposition' ? 'Transición política de gobierno' : 'Conclusión del mandato'}
              </h3>
              <p className="mt-1 text-xs leading-relaxed">
                Completaste este ciclo de gestión. Tu popularidad final fue del <b>{Math.round(character.popularity)}%</b> con un nivel de reservas del <b>{Math.round(gameState.nation.economy.reserves)}%</b>.
              </p>
            </div>

            <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
              ¿Cómo deseás continuar tu carrera política en la República del Sur?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={handleContinueReelection}
                className="p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition-all cursor-pointer text-center shadow-lg"
              >
                🏆 Iniciar segundo mandato
                <span className="block text-[10px] font-normal opacity-90 mt-0.5">Continuar gobernando con tu legado</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  useGameStore.getState().updateGameState((prev) => ({
                    ...prev,
                    phase: 'playing',
                    character: { ...prev.character, career: 'senador' },
                  }));
                }}
                className="p-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-extrabold text-xs transition-all cursor-pointer text-center shadow-lg"
              >
                🏛️ Liderar la oposición
                <span className="block text-[10px] font-normal opacity-90 mt-0.5">Ejercer influencia desde el Senado</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  useGameStore.getState().resetGame();
                }}
                className="p-3.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs transition-all cursor-pointer text-center shadow-lg"
              >
                🔄 Nueva carrera política
                <span className="block text-[10px] font-normal opacity-90 mt-0.5">Comenzar desde cero otra partida</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          {gameState.turn === 1 && gameState.decisionHistory.length === 0 && (
            <div className={`rounded-2xl border p-5 grid grid-cols-1 md:grid-cols-[110px_1fr] gap-4 items-center ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#161B22] border-[#30363D]'
            }`}>
              <PresidentAvatar character={character} className="w-24 h-28 mx-auto" showCaption />
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-sky-500 font-black">Primer día de mandato</span>
                <h2 className={`text-xl font-black mt-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {character.name} {character.surname} entra al despacho
                </h2>
                <p className={`text-sm leading-relaxed mt-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Venís de {openingRegion}. El país llega con reservas frágiles, confianza baja y ocho macro-regiones esperando señales distintas. La primera decisión no es un trámite: es el tono con el que el poder empieza a reconocerte.
                </p>
              </div>
            </div>
          )}

          {/* 1. Tablero: Guía Rápida, Indicadores y Sectores */}
          <Dashboard />

          {/* 2. Escritorio Presidencial Interactivo y Botón Avanzar Quincena */}
          <PresidentialDesk gameState={gameState} />

          {/* 3. Asuntos Urgentes / Decisiones Requeridas */}
          {pendingDecisions.length > 0 && !isFirstRoundTourActive && (
            <div id="asuntos-urgentes" className="space-y-4 pt-2 scroll-mt-6">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black flex items-center gap-2 font-sans ${isLight ? 'text-slate-900' : 'text-[#F8FAFC]'}`}>
                  <span>⚖️</span> Asuntos urgentes de Estado ({pendingDecisions.length} pendiente{pendingDecisions.length === 1 ? '' : 's'})
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-2xl border ${
                  isLight ? 'text-amber-800 bg-amber-100 border-amber-300' : 'text-amber-400 bg-amber-950/40 border-amber-500/30'
                }`}>
                  Resolución requerida
                </span>
              </div>
              <DecisionCard key={pendingDecisions[0]!.id} decision={pendingDecisions[0]!} onDecisionResolved={handleDecisionResolved} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendario' && (
        <div className="max-w-6xl mx-auto space-y-4 font-sans">
          <div>
            <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              Calendario y memoria del mandato
            </h2>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              El año actual queda visible; abrí un mes para reconstruir qué ocurrió y cuándo.
            </p>
          </div>
          <CalendarWidget calendar={gameState.calendar} />
        </div>
      )}

      {activeTab === 'camino' && (
        <DecisionFlowMap eventLog={eventLog} detectedProfile={patterns.detectedProfile} />
      )}

      {activeTab === 'provincias' && (
        <InteractiveMap provinces={provinces} />
      )}

      {activeTab === 'personaje' && (
        <div className="space-y-6 max-w-4xl mx-auto font-sans">
          {/* Ficha de Salud y Estado del Presidente */}
          <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#161B22] border-[#30363D]'
          }`}>
            <PresidentAvatar character={character} className="w-20 h-24 shrink-0" showCaption />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {character.name} {character.surname}
                  </h3>
                  <Badge variant={presidentStatus.badgeColor}>{presidentStatus.title}</Badge>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-md">
                  ✨ CARISMA: {character.traits.charisma} pts
                </div>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {presidentStatus.description}
              </p>
              <div className="flex gap-4 text-[11px] font-bold pt-1">
                <span className={character.health > 50 ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                  ❤️ Salud: {character.health}%
                </span>
                <span className={character.stress < 50 ? 'text-emerald-700 font-extrabold' : 'text-amber-800 font-extrabold'}>
                  🧠 Estrés: {character.stress}%
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta Destacada de Atributos de Mandato (CARISMA + Rasgos) */}
          <Card
            title="✨ Rasgos Políticos y Carisma"
            subtitle="Atributos que determinan la recepción pública de tus discursos y medidas"
            action={
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
                Carisma Base: {character.traits.charisma} pts
              </span>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>🛡️ Honestidad</span>
                  <span className={`font-black ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>{character.traits.honesty} pts</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${character.traits.honesty}%` }} />
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>⚡ Ambición</span>
                  <span className={`font-black ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{character.traits.ambition} pts</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${character.traits.ambition}%` }} />
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>🤝 Empatía</span>
                  <span className={`font-black ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>{character.traits.empathy} pts</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${character.traits.empathy}%` }} />
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>🗣️ Oratoria</span>
                  <span className={`font-black ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>{character.traits.oratory} pts</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${character.traits.oratory}%` }} />
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>🧠 Estrategia</span>
                  <span className={`font-black ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>{character.traits.strategy} pts</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${character.traits.strategy}%` }} />
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-100/70 border-amber-300' : 'bg-amber-950/40 border-amber-800/40'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>✨ CARISMA TOTAL</span>
                  <span className={`font-black ${isLight ? 'text-amber-950' : 'text-amber-300'}`}>{character.traits.charisma} pts</span>
                </div>
                <div className="w-full bg-amber-200 dark:bg-amber-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${character.traits.charisma}%` }} />
                </div>
              </div>
            </div>
          </Card>

          {personalActionFeedback && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-fadeIn">
              {personalActionFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Perfil y bienes personales" subtitle="Vivienda y bienes de protocolo">
              <div className="space-y-4 text-xs">
                {character.lore && (
                  <div className={`rounded-2xl border p-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                    <span className={`font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Contradicción personal:</span>
                    <p className={`leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{character.lore.personalContradiction}</p>
                    <p className="text-amber-700 dark:text-amber-300 italic font-serif mt-2">“{character.lore.signaturePhrase}”</p>
                  </div>
                )}

                <div>
                  <span className={`font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Vivienda actual:</span>
                  <Badge variant="gold">{HOUSING_LABELS[character.housing] ?? character.housing}</Badge>
                  <p className={`italic text-[11px] mt-2 p-3 rounded-2xl border leading-relaxed font-serif ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}>
                    "{HOUSING_SATIRE[character.housing] ?? 'Vivienda institucional de la República.'}"
                  </p>
                </div>

                <div>
                  <span className={`font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Perfil detectado por la prensa:</span>
                  <Badge variant="sky">{patterns.detectedProfile}</Badge>
                </div>

                <div>
                  <span className={`font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Patrimonio personal:</span>
                  <span className="font-bold text-emerald-600 text-sm">{character.wealth} pts</span>
                </div>

                {/* Bienes de Protocolo Adquiridos */}
                {character.possessions.length > 0 && (
                  <div>
                    <span className={`font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Bienes de protocolo adquiridos:</span>
                    <div className="space-y-1">
                      {character.possessions.map((pos) => (
                        <div key={pos.id} className={`p-2 rounded-xl border text-[11px] flex justify-between items-center ${
                          isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}>
                          <span>{pos.name}</span>
                          <span className="text-amber-700 font-bold">+{pos.value} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Reputación por grupo" subtitle="Opinión pública segmentada">
              <div className="space-y-2 text-xs">
                {Object.entries(reputation).map(([groupKey, value]) => (
                  <div key={groupKey} className={`flex justify-between items-center border-b pb-1 ${
                    isLight ? 'border-slate-200' : 'border-slate-800/60'
                  }`}>
                    <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                      {REPUTATION_LABELS[groupKey as keyof typeof REPUTATION_LABELS] ?? groupKey}:
                    </span>
                    <span className={`font-bold ${value >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>{value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Acciones Presidenciales e Interacciones de Poder */}
          <Card
            title="🏛️ Acciones presidenciales y estilo de vida"
            subtitle="Decisiones sobre tu residencia, agenda y relaciones de poder"
          >
            <div className="space-y-3 text-xs">
              <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                Como Presidente de la República podés disponer de la agenda oficial, participar en actos de beneficencia, entablar diálogo con la oposición o definir tu nivel de austeridad.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => executePersonalAction('olivos')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="text-purple-600 text-xs">🏡 Residencia de Olivos</div>
                  <div className="text-[10px] text-slate-500 font-normal">Mudanza a la residencia oficial</div>
                </button>

                <button
                  type="button"
                  onClick={() => executePersonalAction('gala')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="text-sky-600 text-xs">🥂 Cena con opositores</div>
                  <div className="text-[10px] text-slate-500 font-normal">Negociar consensos con gobernadores</div>
                </button>

                <button
                  type="button"
                  onClick={() => executePersonalAction('beneficencia')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="text-rose-600 text-xs">🎗️ Acto a beneficio</div>
                  <div className="text-[10px] text-slate-500 font-normal">+5 Popularidad en salud pública</div>
                </button>

                <button
                  type="button"
                  onClick={() => executePersonalAction('auto')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="text-amber-700 text-xs">🚗 Auto de alta gama</div>
                  <div className="text-[10px] text-slate-500 font-normal">-12 Estrés personal</div>
                </button>

                <button
                  type="button"
                  onClick={() => executePersonalAction('vacaciones')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="text-sky-600 text-xs">🌴 Vacaciones privadas</div>
                  <div className="text-[10px] text-slate-500 font-normal">-30 Estrés · +15 Salud</div>
                </button>

                <button
                  type="button"
                  onClick={() => executePersonalAction('austeridad')}
                  className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="text-emerald-600 text-xs">🧘 Gestó de austeridad</div>
                  <div className="text-[10px] text-slate-500 font-normal">+4 Popularidad pública</div>
                </button>
              </div>
            </div>
          </Card>

          {/* Operaciones secretas y caja política */}
          <Card
            title="💼 Operaciones secretas y caja política"
            subtitle="Acciones discrecionales del Poder Ejecutivo"
          >
            <div className="space-y-3 text-xs">
              <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                Como Presidente podés influir discrecionalmente en los poderes del Estado. Cada acción eleva la opacidad y el riesgo de carpetazo mediático o juicio político.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    useGameStore.getState().updateGameState((prev) => ({
                      ...prev,
                      reputation: { ...prev.reputation, prensa: Math.min(100, prev.reputation.prensa + 8) },
                      nation: {
                        ...prev.nation,
                        governance: { ...prev.nation.governance, corruption: Math.min(100, prev.nation.governance.corruption + 3) },
                      },
                    }));
                  }}
                  className={`p-3 border rounded-2xl text-left transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold text-amber-700 text-xs">📢 Pauta a medios amigos</div>
                  <div className="text-[10px] text-slate-500">+8 Reputación en prensa</div>
                  <div className="text-[10px] text-rose-600 font-bold">+3 Corrupción percibida</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    useGameStore.getState().updateGameState((prev) => ({
                      ...prev,
                      character: { ...prev.character, wealth: prev.character.wealth + 15 },
                      nation: {
                        ...prev.nation,
                        governance: { ...prev.nation.governance, corruption: Math.min(100, prev.nation.governance.corruption + 4) },
                      },
                    }));
                  }}
                  className={`p-3 border rounded-2xl text-left transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold text-emerald-600 text-xs">🏦 Giro a caja offshore</div>
                  <div className="text-[10px] text-slate-500">+15 Patrimonio personal</div>
                  <div className="text-[10px] text-rose-600 font-bold">+4 Corrupción percibida</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    useGameStore.getState().updateGameState((prev) => ({
                      ...prev,
                      nation: {
                        ...prev.nation,
                        governance: {
                          ...prev.nation.governance,
                          institutionality: Math.max(0, prev.nation.governance.institutionality - 5),
                          corruption: Math.max(0, prev.nation.governance.corruption - 2),
                        },
                      },
                    }));
                  }}
                  className={`p-3 border rounded-2xl text-left transition-all cursor-pointer space-y-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-extrabold text-sky-600 text-xs">⚖️ Presión sobre fiscales</div>
                  <div className="text-[10px] text-slate-500">-2 Corrupción expuesta</div>
                  <div className="text-[10px] text-rose-600 font-bold">-5 Institucionalidad</div>
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'prensa' && (
        <PressNewsRoom gameState={gameState} />
      )}

      {activeTab === 'historial' && (
        <div className="max-w-4xl mx-auto space-y-6 font-sans">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                Línea temporal e historial del mandato
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Consultá las decisiones, decretos y coyunturas registradas quincena a quincena en tu gestión.
              </p>
            </div>
          </div>

          <CalendarWidget calendar={gameState.calendar} />

          <div className={`space-y-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Registro cronológico de eventos
            </h3>
            {eventLog.slice().reverse().map((log, idx) => (
              <Card key={idx} className="py-3 px-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sky-600 text-xs">Turno {log.turn}</span>
                  <Badge variant="slate">{log.type.toUpperCase()}</Badge>
                </div>
                <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{log.title}</h4>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{log.description}</p>
                {log.emotionalText && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 italic pt-1 font-serif">
                    💬 "{log.emotionalText}"
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
};
