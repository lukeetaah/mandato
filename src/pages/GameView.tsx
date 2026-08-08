import React, { useState } from 'react';
import { useUIStore } from '@stores/ui-store';
import { useGameStore } from '@stores/game-store';
import { MainLayout } from '@components/layout/MainLayout';
import { Dashboard } from '@components/game/Dashboard';
import { DecisionCard } from '@components/game/DecisionCard';
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

export const GameView: React.FC = () => {
  const activeTab = useUIStore((s) => s.activeTab);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';
  const gameState = useGameStore((s) => s.gameState);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(gameState?.turn === 1);
  const [personalActionFeedback, setPersonalActionFeedback] = useState<string | null>(null);

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
          {/* 1. Escritorio Presidencial Interactivo y Botón Avanzar Quincena al frente */}
          <PresidentialDesk gameState={gameState} />

          {/* 2. Asuntos Urgentes / Decisiones Requeridas */}
          {pendingDecisions.length > 0 && (
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
              <DecisionCard key={pendingDecisions[0]!.id} decision={pendingDecisions[0]!} />
            </div>
          )}

          {/* 3. Tablero Secundario: Guía Rápida, Indicadores y Sectores */}
          <Dashboard />
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
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-4xl shrink-0 drop-shadow-md">
              {presidentStatus.emoji}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {character.name} {character.surname}
                </h3>
                <Badge variant={presidentStatus.badgeColor}>{presidentStatus.title}</Badge>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {presidentStatus.description}
              </p>
              <div className="flex gap-4 text-[11px] font-bold pt-1">
                <span className={character.health > 50 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  ❤️ Salud: {character.health}%
                </span>
                <span className={character.stress < 50 ? 'text-emerald-600 font-bold' : 'text-amber-700 font-bold'}>
                  🧠 Estrés: {character.stress}%
                </span>
              </div>
            </div>
          </div>

          {personalActionFeedback && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-fadeIn">
              {personalActionFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Perfil y bienes personales" subtitle="Vivienda y bienes de protocolo">
              <div className="space-y-4 text-xs">
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
                  <Badge variant="sky">{patterns.detectedProfile.toUpperCase()}</Badge>
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
