import type { GameState, Scandal } from './types';
import { recordActorMemory } from './actors';

/**
 * Evalúa cada turno la corrupción del gobierno y del presidente.
 * Maneja la acumulación de sospechas, investigaciones de prensa y la apertura de causas judiciales.
 */
export function evaluateCorruptionScandals(state: GameState): GameState {
  const { nation, character, patterns, actors, turn } = state;
  const corruptionLevel = nation.governance.corruption;
  const favorsCount = patterns.favorsAccepted;

  let nextState = { ...state };
  let updatedScandals = [...(character.hiddenScandals ?? [])];
  let newEvents = [...state.eventLog];
  let updatedActors = [...actors];
  let flags = { ...state.flags };

  // 1. Aparición de nuevas filtraciones si la corrupción es elevada
  const unexposedCount = updatedScandals.filter((s) => !s.exposed).length;
  if ((corruptionLevel > 50 || favorsCount > 3) && unexposedCount < 3) {
    if (state.seed && ((state.seed + turn * 13) % 100) < (corruptionLevel * 0.35)) {
      const newScandal: Scandal = {
        id: `scandal-leak-${turn}`,
        description: corruptionLevel > 70
          ? 'Transferencias bancarias a sociedades offshore conectadas con el entorno presidencial'
          : 'Sobrecostos y contrataciones directas irregulares en obras provinciales',
        severity: Math.min(10, Math.floor(corruptionLevel / 10)),
        discoveredBy: ['actor-lider-opositora', 'actor-media-mogul'],
        exposed: false,
      };
      updatedScandals.push(newScandal);
    }
  }

  // 2. Estallido de escándalos ocultos (La Prensa o la Oposición los publica)
  updatedScandals = updatedScandals.map((scandal) => {
    if (!scandal.exposed && (corruptionLevel > 60 || state.reputation.prensa < 35)) {
      const exposeChance = 0.25 + (100 - state.reputation.prensa) * 0.005;
      if (Math.random() < exposeChance) {
        newEvents.push({
          turn,
          type: 'scandal',
          title: '🚨 FILTRACIÓN JUDICIAL: INVESTIGACIÓN ABIERTA',
          description: `Se hace público el expediente "${scandal.description}". La prensa opositora pide interpelación del Gabinete.`,
          emotionalText: '«Los documentos son auténticos; la firma es inconfundible.»',
        });

        // Los actores de la oposición reaccionan negativamente
        updatedActors = updatedActors.map((actor) => {
          if (actor.role === 'legislador' || actor.role === 'sindicalista') {
            return recordActorMemory(actor, turn, `Escándalo expuesto: ${scandal.description}`, -15);
          }
          return actor;
        });

        return { ...scandal, exposed: true, turnExposed: turn };
      }
    }
    return scandal;
  });

  // 3. Juicio Político / Indictment Trigger si la corrupción es crítica y hay escándalos expuestos
  const exposedCount = updatedScandals.filter((s) => s.exposed).length;
  if ((corruptionLevel >= 80 || exposedCount >= 2) && nextState.phase === 'playing') {
    flags['trial-pending'] = true;
    newEvents.push({
      turn,
      type: 'scandal',
      title: '⚖️ CONGRESO INICIA COMISIÓN DE JUICIO POLÍTICO',
      description: 'La oposición alcanzó la mayoría parlamentaria para abrir el proceso de remoción presidencial.',
      emotionalText: '«El país no puede gobernarse entre carpetas y citaciones judiciales.»',
    });
    nextState.phase = 'trial';
  }

  return {
    ...nextState,
    flags,
    actors: updatedActors,
    eventLog: newEvents,
    character: {
      ...character,
      hiddenScandals: updatedScandals,
      stress: Math.min(100, character.stress + (exposedCount > 0 ? 3 : 0)),
    },
  };
}
