import { useState } from 'react';
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
import { REPUTATION_LABELS, HOUSING_LABELS, HOUSING_SATIRE } from '@engine/constants';

import { PresidentialDesk } from '@components/game/PresidentialDesk';
import { JudicialTrial } from '@components/game/JudicialTrial';
import { CalendarWidget } from '@components/game/CalendarWidget';

export const GameView: React.FC = () => {
  const activeTab = useUIStore((s) => s.activeTab);
  const gameState = useGameStore((s) => s.gameState);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(gameState?.turn === 1);

  if (!gameState) return null;

  const { pendingDecisions, provinces, reputation, eventLog, patterns, character } = gameState;

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

  return (
    <MainLayout>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {activeTab === 'dashboard' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          <Dashboard />
          <PresidentialDesk gameState={gameState} />
        </div>
      )}

      {activeTab === 'decisiones' && (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Decisiones pendientes</h2>
          {pendingDecisions.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-slate-400">No hay decisiones urgentes pendientes en este turno.</p>
              <p className="text-xs text-slate-500 mt-2">Avanzá la quincena para continuar la simulación.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <DecisionCard key={pendingDecisions[0]!.id} decision={pendingDecisions[0]!} />
              {pendingDecisions.length > 1 && (
                <p className="text-sm text-slate-400 text-center">
                  Resolvé esta situación para ver la siguiente.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendario' && (
        <div className="max-w-6xl mx-auto space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Calendario y memoria del mandato</h2>
            <p className="text-xs text-slate-400 mt-1">El año actual queda visible; abrí un mes para reconstruir qué ocurrió y cuándo.</p>
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
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Perfil y vida privada" subtitle="Tu vivienda y bienes personales">
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Vivienda actual:</span>
                  <Badge variant="gold">{HOUSING_LABELS[character.housing] ?? character.housing}</Badge>
                  <p className="text-slate-300 italic text-[11px] mt-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed font-serif">
                    "{HOUSING_SATIRE[character.housing] ?? 'Vivienda institucional de la República.'}"
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Perfil detectado por la prensa:</span>
                  <Badge variant="sky">{patterns.detectedProfile.toUpperCase()}</Badge>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Patrimonio personal oculto/público:</span>
                  <span className="font-bold text-emerald-400 text-sm">{character.wealth} pts</span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-semibold block mb-1">Biografía política:</span>
                  <p className="text-slate-300 italic text-[11px]">{character.backstory}</p>
                </div>
              </div>
            </Card>

            <Card title="Reputación por grupo" subtitle="Opinión pública segmentada">
              <div className="space-y-2 text-xs">
                {Object.entries(reputation).map(([groupKey, value]) => (
                  <div key={groupKey} className="flex justify-between items-center border-b border-slate-800/60 pb-1">
                    <span className="text-slate-300">{REPUTATION_LABELS[groupKey as keyof typeof REPUTATION_LABELS] ?? groupKey}:</span>
                    <span className={`font-bold ${value >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 💼 Operaciones Secretas & Caja Política */}
          <Card
            title="💼 Operaciones Secretas & Caja Política"
            subtitle="Acciones discrecionales del Poder Ejecutivo (Alto Riesgo)"
            className="border-purple-500/30"
          >
            <div className="space-y-3 text-xs">
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Como Presidente podés influir discrecionalmente en los poderes del Estado y construir tu patrimonio personal. Cada acción eleva el nivel de opacidad y el riesgo de carpetazo mediático o Juicio Político.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
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
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="font-extrabold text-amber-300 text-xs">📢 Pauta a medios amigos</div>
                  <div className="text-[10px] text-slate-400">+8 Reputación en Prensa</div>
                  <div className="text-[10px] text-rose-400 font-bold">+3 Corrupción percibida</div>
                </button>

                <button
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
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="font-extrabold text-emerald-300 text-xs">🏦 Giro a caja offshore</div>
                  <div className="text-[10px] text-slate-400">+15 Patrimonio personal</div>
                  <div className="text-[10px] text-rose-400 font-bold">+4 Corrupción percibida</div>
                </button>

                <button
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
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="font-extrabold text-sky-300 text-xs">⚖️ Presión sobre fiscales</div>
                  <div className="text-[10px] text-slate-400">-2 Corrupción expuesta</div>
                  <div className="text-[10px] text-rose-400 font-bold">-5 Institucionalidad</div>
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-100">Línea temporal e historial del mandato</h2>
              <p className="text-xs text-slate-400">Consultá las decisiones, decretos y coyunturas registradas mes a mes en tu gestión.</p>
            </div>
          </div>

          <CalendarWidget calendar={gameState.calendar} />

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-lg font-bold text-slate-200">Registro cronológico de eventos</h3>
            {eventLog.slice().reverse().map((log, idx) => (
              <Card key={idx} className="py-3 px-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sky-400 text-xs">Turno {log.turn}</span>
                  <Badge variant="slate">{log.type.toUpperCase()}</Badge>
                </div>
                <h4 className="font-bold text-slate-200 text-sm">{log.title}</h4>
                <p className="text-xs text-slate-300">{log.description}</p>
                {log.emotionalText && (
                  <p className="text-[11px] text-amber-300 italic pt-1 font-serif">
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
