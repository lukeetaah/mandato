import type {
  GameState,
  Character,
  DecisionChoice,
  Decision,
  DelayedEffect,
  GameEvent,
  LogEntry,
  CalendarState,
  HeadlineIssue,
  HeadlineItem,
  DeskObject,
  DeskObjectType,
  Effects,
  AnnualDocumentaryReport,
  CharacterLore,
} from './types';
import { SAVE_VERSION } from './types';
import { createRng, random, chance, shuffle, pick } from './rng';
import { PROVINCES, DEFAULT_PARTIES, createDefaultReputation, createDefaultNation } from './constants';
import { advanceActorWorld, createInitialActors, recordActorMemory } from './actors';
import { createInitialMedia, createInitialSocialMedia } from './media';
import { createInitialPatterns, evaluatePlayerProfile } from './pattern-detector';
import { applyReputationChanges } from './reputation';
import { simulateProvincesTick } from './provinces';
import { getDecisionCauseKey, getDecisionFamilyId, getEligibleDecisions, prepareDecisionForState } from './decisions';
import { generateDailyHeadlines } from './headlines';
import {
  checkForScarTrigger,
  dedupeNationalScars,
  createDefaultWorldState,
  simulateAutonomousWorld,
  evaluatePersistentConsequences,
} from './scars';
import { generateContextualDecision, generateSystemicEvent, getEventFamilyId, getNarrativeCauseKey as getEventCauseKey } from './event-generator';
import { evaluateCorruptionScandals } from './corruption';

const SEASONS: Array<'Verano' | 'Otoño' | 'Invierno' | 'Primavera'> = ['Verano', 'Otoño', 'Invierno', 'Primavera'];

const MONTH_CYCLES = [
  'Receso parlamentario y verano',
  'Inicio de sesiones ordinarias',
  'Paritarias docentes y siembra',
  'Cosecha fina y liquidación de divisas',
  'Revisión de cuentas públicas',
  'Temporada de alta demanda energética',
  'Receso invernal e inspección fiscal',
  'Licitaciones de infraestructura',
  'Cosecha gruesa y exposiciones agropecuarias',
  'Debate presupuestario en el Congreso',
  'Campaña y rondas paritarias salariales',
  'Cierre fiscal anual y balance del Tesoro',
];

const ADS_SATIRE = [
  'COMPRE TERRENOS EN LA LUNA: 0% INFLACIÓN Y SIN RETENCIONES.',
  'CANSADO DE LAS PARITARIAS? COMPRE NUESTRO CURSO DE MEDITACIÓN FISCAL.',
  'VENDO DÓLARES CARA GRANDE. SOLO EFECTIVO, NADA DE BANCOS.',
  'INMOBILIARIA SUR: CASAS CON BÚNKER ANTI-CORRIDA CAMBIARIA.',
  'REPARACIÓN DE LÁPIZ DE REMARCAR PRECIOS. GARANTÍA DE 2 HORAS.',
];

const ERA_QUOTES = [
  '“Un presupuesto es una promesa escrita con números; lo difícil empieza cuando la gente intenta vivir dentro de ella.” — Archivo Federal, cuaderno de 2032.',
  '“La estabilidad no hace ruido: se nota cuando una familia puede planificar la semana sin consultar tres precios distintos.” — Clara B. Arce, economista del Sur.',
  '“Toda obra pública tiene dos inauguraciones: la de la cinta y la del día en que finalmente funciona.” — Máximo Ledesma, cronista parlamentario.',
  '“En tiempos de crisis, el Estado no desaparece; cambia de ventanilla y espera que nadie lo reconozca.” — Frase atribuida a una asamblea vecinal del Distrito Federal.',
  '“Gobernar es elegir qué incendio apagar, y explicar por qué el otro no era menos incendio.” — Elena Santillán, memorias apócrifas de gabinete.',
];

const clamp = (value: number, max: number = 100) => Math.max(0, Math.min(max, value));

function buildDefaultLore(character: Partial<Character>): CharacterLore {
  const fullName = `${character.name ?? 'Patricio'} ${character.surname ?? 'Soto'}`;
  return {
    personality: 'Pragmático en público y más idealista de lo que admite ante su gabinete.',
    motivation: 'Quiere demostrar que una persona común puede ocupar el poder sin ser devorada por él.',
    strengths: ['Adaptabilidad', 'lectura del humor social', 'capacidad de trabajo'],
    weaknesses: ['Equipo todavía inestable', 'biografía pública poco probada', 'presión por definirse rápido'],
    powerRelationship: 'Todavía aprende a distinguir entre autoridad legítima y simple obediencia.',
    moneyRelationship: 'Sabe que el dinero condiciona, pero no quiere que sea el idioma central del mandato.',
    peopleRelationship: 'Necesita construir una relación directa con la población antes de que otros narren su gobierno.',
    institutionRelationship: 'Busca respetar las reglas, aunque la crisis le exige velocidad.',
    familyStory: `${fullName} llega a la presidencia con una familia de bajo perfil y una vida previa menos blindada que la de sus rivales.`,
    parents: 'Una familia trabajadora que prefirió mantenerse fuera de la exposición pública.',
    originClass: 'Clase media urbana de la República del Sur.',
    childhoodEvent: 'Una crisis económica familiar le enseñó que las grandes decisiones nacionales siempre terminan sentadas a la mesa chica.',
    adultTurningPoint: 'Una gestión local difícil lo convirtió en figura nacional cuando resolvió un conflicto que otros preferían patear.',
    politicalOrigin: 'Entró a la política por militancia territorial y terminó conduciendo una coalición de emergencia.',
    pathToPresidency: 'Llegó al balotaje como candidato de equilibrio en un país cansado de promesas absolutas.',
    mandateGoal: 'Ordenar el país sin romper los lazos sociales que todavía lo mantienen unido.',
    fear: 'Convertirse en una firma más dentro de un sistema que borra biografías.',
    personalContradiction: 'Quiere escuchar a todos, pero sabe que gobernar también implica dejar heridos.',
    signaturePhrase: 'Gobernar es hacerse cargo de lo que no entra en campaña.',
  };
}

function historyId(type: string, familyId: string, turn: number, ordinal: number = 0): string {
  return `history-${type}-${familyId}-${turn}-${ordinal}`;
}

function evolveLifecycle(originTurn: number, turn: number): LogEntry['lifecycle'] {
  const age = Math.max(0, turn - originTurn);
  if (age < 2) return 'nacimiento';
  if (age < 8) return 'expansion';
  if (age < 24) return 'normalizacion';
  if (age < 72) return 'olvido';
  return 'legado';
}

function prepareSystemicEvent(state: GameState, event: GameEvent, turn: number): GameEvent | null {
  const familyId = getEventFamilyId(event);
  const causeKey = event.causeKey ?? getEventCauseKey(state, familyId);
  const previousSameCause = [...state.eventLog].reverse().find((entry) =>
    entry.type === 'event'
      && (entry.familyId ?? entry.id) === familyId
      && entry.causeKey === causeKey,
  );
  const previousSameTitle = [...state.eventLog].reverse().find((entry) =>
    entry.type === 'event'
      && (entry.familyId ?? entry.id) === familyId
      && entry.title === event.title,
  );
  const previous = previousSameCause ?? previousSameTitle;

  if (!previous) return { ...event, familyId, causeKey };

  const age = turn - previous.turn;
  if (age < 72) return null;
  if (previousSameTitle && turn - previousSameTitle.turn < 72) return null;

  const recurrenceCount = state.eventLog.filter((entry) =>
    entry.type === 'event'
      && (entry.familyId ?? entry.id) === familyId
      && (entry.causeKey === causeKey || entry.title === event.title),
  ).length + 1;

  return {
    ...event,
    familyId,
    causeKey,
    parentHistoryId: previous.id,
    title: `Continuidad histórica ${recurrenceCount}: ${event.title}`,
    description: `${event.description} El episodio reaparece como una continuidad del antecedente registrado en el turno ${previous.turn}; el país ya no lo interpreta como un hecho aislado.`,
  };
}

function normalizeHistoricalLogs(logs: LogEntry[], turn: number): LogEntry[] {
  return logs.map((log, index) => {
    const familyId = log.familyId ?? log.sourceDecisionId ?? log.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return {
      ...log,
      id: log.id ?? historyId(log.type, familyId, turn, index),
      familyId,
      lifecycle: log.lifecycle ?? evolveLifecycle(log.turn, turn),
    };
  });
}

function buildTrialDecision(turn: number): Decision {
  const preview = (gain: string, loss: string) => ({
    gains: [{ icon: '⚖️', label: gain, magnitude: 'fuerte' as const }],
    losses: [{ icon: '⚠️', label: loss, magnitude: 'moderado' as const }],
    risks: [],
    beneficiaries: [],
    opponents: [],
  });

  return {
    id: `trial-${turn}`,
    familyId: 'political-trial',
    causeKey: 'institutional-risk',
    title: 'JUICIO POLÍTICO: EL EXPEDIENTE LLEGÓ A TU PUERTA',
    description: 'Una combinación de contratos opacos, instituciones debilitadas y decisiones difíciles activó un proceso político ficticio. Podés entregar los archivos para que la investigación avance, alegar falta de mérito y aceptar el apartamiento, o asumir una condena que termina tu carrera.',
    source: 'Comisión de Juicio Político',
    urgency: 'critica',
    category: 'politico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      { id: 'trial-inocencia', label: 'Entregar los archivos y permitir la investigación', description: 'Abrís contratos, auditorías y comunicaciones. Durante unos turnos quedás procesado y apartado del mando mientras el vicepresidente administra el país y la prensa sigue cada documento.', preview: preview('Verdad institucional', 'Procesamiento público'), effects: { national: { governance: { institutionality: 6, corruption: -5 } }, reputation: { prensa: 5, 'clase-media': 4 }, character: { popularity: 4, stress: 8 } }, delayedEffects: [], emotionalImpact: 'La verdad no te devuelve el cargo: deja un expediente que otros deberán terminar de leer.' },
      { id: 'trial-merito', label: 'Alegar falta de mérito y aceptar el apartamiento', description: 'Pedís que la causa se archive por falta de pruebas suficientes. El vicepresidente toma el control y tu carrera electoral termina, aunque el país conserve la discusión abierta.', preview: preview('Cierre procesal', 'Fin de la carrera'), effects: { national: { governance: { institutionality: 2 } }, reputation: { prensa: -3, 'clase-media': -4, mercados: 2 }, character: { popularity: -5, pragmatismo: 5 } }, delayedEffects: [], emotionalImpact: 'La falta de mérito no es una vuelta al poder: es una salida del despacho.' },
      { id: 'trial-condena', label: 'No interferir y asumir la condena', description: 'Rechazás presionar testigos o trabar el proceso. La justicia política te aparta del cargo y la historia te deja una celda, una biblioteca o ambas cosas.', preview: preview('Cierre institucional', 'Fin de la carrera'), effects: { national: { governance: { institutionality: 4, corruption: 4 } }, reputation: { prensa: 3, 'clase-media': -8 }, character: { popularity: -20, stress: 15 } }, delayedEffects: [], emotionalImpact: 'El poder se termina de golpe; el expediente, en cambio, queda abierto durante décadas.' },
    ],
  };
}

/** Un único punto de aplicación para decisiones, eventos y consecuencias diferidas. */
function applyEffects(
  current: Pick<GameState, 'nation' | 'reputation' | 'character'>,
  effects: Effects,
): Pick<GameState, 'nation' | 'reputation' | 'character'> {
  const nation = {
    economy: { ...current.nation.economy },
    society: { ...current.nation.society },
    governance: { ...current.nation.governance },
  };

  for (const group of ['economy', 'society', 'governance'] as const) {
    const changes = effects.national?.[group];
    if (!changes) continue;
    const target = nation[group] as Record<string, number>;
    for (const [key, delta] of Object.entries(changes)) {
      if (typeof delta === 'number' && key in target) target[key] = clamp(target[key]! + delta, key === 'exchangeRate' ? 200 : 100);
    }
  }

  const character = { ...current.character };
  for (const [key, delta] of Object.entries(effects.character ?? {})) {
    if (typeof delta === 'number' && key in character && typeof character[key as keyof typeof character] === 'number') {
      const numericKey = key as keyof typeof character;
      (character[numericKey] as number) = clamp((character[numericKey] as number) + delta);
    }
  }

  return { nation, character, reputation: applyReputationChanges(current.reputation, effects.reputation) };
}

function updateSectorTrustMemory(
  current: GameState['sectorTrustMemory'],
  effects: Effects,
): GameState['sectorTrustMemory'] {
  const next = { ...current };
  const reputation = effects.reputation ?? {};
  const mappings: Array<[keyof typeof reputation, keyof typeof next]> = [
    ['campo', 'campo'],
    ['empresarios', 'empresarios'],
    ['trabajadores', 'sindicatos'],
    ['universidades', 'universidades'],
    ['jovenes', 'cientificos'],
    ['mercados', 'internacional'],
    ['inversores', 'internacional'],
    ['fuerzas-seguridad', 'militar'],
    ['ongs', 'ambiental'],
  ];
  for (const [source, target] of mappings) {
    const delta = reputation[source];
    if (typeof delta === 'number') next[target] = clamp(next[target] + delta, 100);
  }
  return next;
}

function buildChoiceResolutionLog(
  state: GameState,
  decision: Decision,
  choice: DecisionChoice,
  familyId: string,
  causeKey: string,
  parentHistoryId: string,
): LogEntry {
  const systemsAffected: string[] = [];
  if (choice.effects.national?.economy) systemsAffected.push('economía');
  if (choice.effects.national?.society) systemsAffected.push('sociedad');
  if (choice.effects.national?.governance) systemsAffected.push('instituciones');
  if (choice.effects.character) systemsAffected.push('presidente');
  if (choice.effects.reputation) systemsAffected.push('relaciones políticas');

  const reputationMoves = Object.entries(choice.effects.reputation ?? {});
  const support = reputationMoves.filter(([, value]) => (value ?? 0) > 0).map(([key]) => key.replace(/-/g, ' '));
  const resistance = reputationMoves.filter(([, value]) => (value ?? 0) < 0).map(([key]) => key.replace(/-/g, ' '));
  const delayedText = choice.delayedEffects.length > 0
    ? 'Una parte de la medida queda fuera de cuadro: puede reaparecer cuando cambie el clima político.'
    : 'No queda una consecuencia diferida directa, pero la decisión entra en la memoria del mandato.';
  const regionalFocus = [...state.provinces]
    .sort((a, b) => Math.abs(b.socialMood) - Math.abs(a.socialMood))[0];
  const regionalText = regionalFocus
    ? `En ${regionalFocus.name}, la noticia se procesa según el humor social de la región: nadie la recibe como un trámite aislado.`
    : 'En las regiones, la medida empieza a encontrar lecturas propias.';
  const supportText = support.length > 0 ? `Gana aire entre ${support.slice(0, 3).join(', ')}.` : '';
  const resistanceText = resistance.length > 0 ? `Despierta resistencia en ${resistance.slice(0, 3).join(', ')}.` : '';
  const effectText = (() => {
    const economy = choice.effects.national?.economy ?? {};
    const society = choice.effects.national?.society ?? {};
    const governance = choice.effects.national?.governance ?? {};
    const character = choice.effects.character ?? {};
    const parts: string[] = [];
    if (economy.reserves) parts.push(economy.reserves > 0 ? 'el Banco Central gana aire' : 'las reservas pagan parte del costo');
    if (economy.inflation) parts.push(economy.inflation > 0 ? 'los precios sienten más presión' : 'la inflación recibe una señal de contención');
    if (economy.debt) parts.push(economy.debt > 0 ? 'la deuda queda más pesada' : 'la deuda afloja levemente');
    if (society.trust) parts.push(society.trust > 0 ? 'la confianza social mejora' : 'la confianza social se erosiona');
    if (society.socialConflicts) parts.push(society.socialConflicts > 0 ? 'la calle queda más sensible' : 'la conflictividad baja un cambio');
    if (governance.institutionality) parts.push(governance.institutionality > 0 ? 'las instituciones salen fortalecidas' : 'la institucionalidad absorbe un golpe');
    if (governance.corruption) parts.push(governance.corruption > 0 ? 'crece la sospecha de opacidad' : 'la percepción de corrupción retrocede');
    if (character.stress) parts.push(character.stress > 0 ? 'tu cuerpo carga más presión' : 'tu estrés baja por primera vez en días');
    if (character.health) parts.push(character.health > 0 ? 'tu salud presidencial se recupera' : 'tu salud paga el precio de la medida');
    if (character.popularity) parts.push(character.popularity > 0 ? 'tu imagen pública gana margen' : 'tu popularidad pierde piso');
    return parts.length > 0 ? `En términos concretos, ${parts.slice(0, 4).join(', ')}.` : '';
  })();
  const fallbackEmotion = (() => {
    if (choice.effects.character?.stress && choice.effects.character.stress > 0) return 'La medida sale firmada, pero no gratis: el costo también queda en tu cara.';
    if (choice.effects.character?.popularity && choice.effects.character.popularity < 0) return 'La decisión ordena una parte del país y abre una deuda con la opinión pública.';
    if ((choice.effects.national?.economy?.reserves ?? 0) < 0) return 'Compraste tiempo con reservas: ahora habrá que demostrar que valía la pena gastarlas.';
    if ((choice.effects.national?.society?.trust ?? 0) > 0) return 'Por un momento, la política vuelve a parecer capaz de producir alivio.';
    if ((choice.effects.national?.governance?.corruption ?? 0) > 0) return 'El resultado funciona, pero deja un olor que la prensa va a seguir.';
    if (resistance.length > support.length) return 'No fue una firma neutral: alguien ya empezó a organizar la resistencia.';
    if (support.length > 0) return 'La medida no resuelve el país, pero te compra una mesa menos hostil para la próxima discusión.';
    return 'La decisión entra en circulación y cambia el tablero de una forma que recién ahora podés medir.';
  })();

  return {
    id: historyId('resolution', familyId, state.turn, state.decisionHistory.length),
    familyId,
    parentId: parentHistoryId,
    sourceDecisionId: decision.id,
    sourceChoiceId: choice.id,
    causeKey,
    lifecycle: 'resuelto',
    turn: state.turn,
    type: 'system',
    title: `Resolución: ${choice.label}`,
    description: [
      systemsAffected.length > 0
        ? `La firma empieza a moverse sobre ${systemsAffected.join(', ')}.`
        : 'La firma empieza a moverse por el sistema político.',
      supportText,
      resistanceText,
      effectText,
      regionalText,
      delayedText,
    ].filter(Boolean).join(' '),
    emotionalText: choice.emotionalImpact ?? fallbackEmotion,
    systemsAffected,
  };
}

function countryPressure(state: Pick<GameState, 'nation' | 'character' | 'reputation'>): number {
  const { economy, society, governance } = state.nation;
  return Math.round(
    Math.max(0, 45 - economy.reserves) * 1.1
    + Math.max(0, economy.inflation - 42) * 0.55
    + Math.max(0, society.socialConflicts - 25) * 0.7
    + Math.max(0, society.poverty - 42) * 0.35
    + Math.max(0, 42 - state.character.popularity) * 0.45
    + Math.max(0, governance.institutionality < 38 ? 12 : 0)
    + Math.max(0, 35 - state.reputation.trabajadores) * 0.2,
  );
}

function hashText(value: string): number {
  return value.split('').reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
}

function mergeEffects(a: Effects, b: Effects): Effects {
  const mergeRecord = <T extends string>(left?: Partial<Record<T, number>>, right?: Partial<Record<T, number>>) => {
    const result: Partial<Record<T, number>> = { ...(left ?? {}) };
    for (const [key, value] of Object.entries(right ?? {}) as Array<[T, number]>) {
      result[key] = (result[key] ?? 0) + value;
    }
    return result;
  };
  return {
    national: {
      economy: mergeRecord(a.national?.economy, b.national?.economy),
      society: mergeRecord(a.national?.society, b.national?.society),
      governance: mergeRecord(a.national?.governance, b.national?.governance),
    },
    reputation: mergeRecord(a.reputation, b.reputation),
    character: mergeRecord(a.character, b.character),
  };
}

function buildContextualOutcome(state: GameState, decision: Decision, choice: DecisionChoice): { log: LogEntry; effects: Effects } {
  const rng = createRng(state.seed + state.turn * 9301 + hashText(`${decision.id}:${choice.id}`));
  const pressure = countryPressure(state);
  const traits = state.character.traits;
  const traitSupport = (traits.strategy + traits.oratory + traits.charisma + traits.honesty) / 400;
  const stabilitySupport = Math.max(0, 1 - pressure / 100);
  const resourceSupport = state.nation.economy.reserves / 100;
  const riskPenalty = Math.min(0.25, choice.preview.risks.length * 0.06 + choice.delayedEffects.length * 0.05 + (decision.urgency === 'critica' ? 0.08 : 0));
  const successChance = Math.max(0.18, Math.min(0.82, 0.18 + traitSupport * 0.34 + stabilitySupport * 0.22 + resourceSupport * 0.14 - riskPenalty));
  const roll = random(rng);
  const outcome: 'favorable' | 'mixto' | 'adverso' = roll < successChance ? 'favorable' : roll < successChance + 0.24 ? 'mixto' : 'adverso';

  const category = decision.category;
  let effects: Effects;
  if (outcome === 'favorable') {
    effects = category === 'economico'
      ? { national: { economy: { reserves: 2, inflation: -1 }, society: { trust: 1 } }, character: { popularity: 1 } }
      : category === 'social'
      ? { national: { society: { trust: 2, socialConflicts: -2 } }, character: { popularity: 1 } }
      : category === 'mediatico'
      ? { reputation: { prensa: 3 }, character: { popularity: 2, stress: -1 } }
      : { national: { governance: { institutionality: 2 }, society: { trust: 1 } }, character: { stress: -1 } };
  } else if (outcome === 'adverso') {
    effects = category === 'economico'
      ? { national: { economy: { reserves: -2, inflation: 2 }, society: { trust: -1 } }, character: { stress: 2 } }
      : category === 'social'
      ? { national: { society: { trust: -2, socialConflicts: 3 } }, character: { stress: 2 } }
      : category === 'mediatico'
      ? { reputation: { prensa: -4 }, character: { popularity: -2, stress: 2 } }
      : { national: { governance: { institutionality: -2 }, society: { polarization: 2 } }, character: { stress: 2 } };
  } else {
    effects = category === 'economico'
      ? { national: { economy: { reserves: -1 }, society: { trust: 1 } } }
      : category === 'social'
      ? { national: { society: { trust: 1, socialConflicts: 1 } } }
      : category === 'mediatico'
      ? { reputation: { prensa: 2 }, character: { stress: 1 } }
      : { national: { governance: { institutionality: 1 }, society: { polarization: 1 } } };
  }

  const contextText = `Probabilidad contextual de buen desenlace: ${Math.round(successChance * 100)}%. Influyeron tus rasgos, reservas, presión del país, urgencia y riesgos acumulados.`;
  const title = outcome === 'favorable' ? 'La implementación salió mejor de lo esperado' : outcome === 'adverso' ? 'La implementación tropezó' : 'La implementación dejó un resultado mixto';
  const description = outcome === 'favorable'
    ? `La medida encontró una ventana de apoyo y ejecución. ${contextText}`
    : outcome === 'adverso'
    ? `La medida chocó con resistencias, timing o fragilidad acumulada. ${contextText}`
    : `La medida funcionó en una parte del tablero, pero abrió otro frente. ${contextText}`;
  return {
    effects,
    log: {
      id: historyId('contextual-outcome', getDecisionFamilyId(decision), state.turn, state.decisionHistory.length),
      familyId: getDecisionFamilyId(decision),
      parentId: historyId('decision', getDecisionFamilyId(decision), state.turn, state.decisionHistory.length),
      sourceDecisionId: decision.id,
      sourceChoiceId: choice.id,
      lifecycle: 'resuelto',
      turn: state.turn,
      type: 'system',
      title,
      description,
      emotionalText: outcome === 'favorable' ? 'Esta vez el país devolvió algo más que costo.' : outcome === 'adverso' ? 'La firma fue tuya; el tropiezo lo puso el contexto.' : 'Ganaste algo, pero el tablero pidió una prenda a cambio.',
      systemsAffected: ['azar contextual', category],
    },
  };
}

export function isCountryStable(state: Pick<GameState, 'nation' | 'character' | 'reputation'>): boolean {
  return countryPressure(state) < 22;
}

export function getPacingMode(state: Pick<GameState, 'pendingDecisions' | 'nation' | 'character' | 'reputation'>): 'quincenal' | 'acelerado' {
  return state.pendingDecisions.length === 0 && isCountryStable(state) ? 'acelerado' : 'quincenal';
}

function calculateCalendar(turn: number): CalendarState {
  const startYear = 2032;
  const fortnightIndex = turn - 1;
  const monthsElapsed = Math.floor(fortnightIndex / 2);
  const fortnight: 1 | 2 = (fortnightIndex % 2 === 0) ? 1 : 2;
  const month = (monthsElapsed % 12) + 1;
  const year = startYear + Math.floor(monthsElapsed / 12);
  const season = SEASONS[Math.floor((month - 1) / 3)] ?? 'Verano';
  const monthCycleName = MONTH_CYCLES[month - 1] ?? 'Mes normal';

  const times: Array<'mañana' | 'tarde' | 'atardecer' | 'noche'> = ['mañana', 'tarde', 'atardecer', 'noche'];
  const weathers: Array<'despejado' | 'lluvia' | 'niebla' | 'tormenta' | 'nieve'> = ['despejado', 'lluvia', 'niebla', 'tormenta', 'despejado'];
  const timeOfDay = times[(turn - 1) % 4] ?? 'mañana';
  const weatherCondition = weathers[(turn * 3) % weathers.length] ?? 'despejado';

  const turnsUntilProvincial = 24 - (turn % 24);
  const turnsUntilLegislative = 48 - (turn % 48);
  const turnsUntilPresidential = 96 - (turn % 96);

  return {
    month,
    year,
    fortnight,
    timeOfDay,
    weatherCondition,
    season,
    monthCycleName,
    turnsUntilLegislative: turnsUntilLegislative === 48 ? 0 : turnsUntilLegislative,
    turnsUntilPresidential: turnsUntilPresidential === 96 ? 0 : turnsUntilPresidential,
    turnsUntilProvincial: turnsUntilProvincial === 24 ? 0 : turnsUntilProvincial,
  };
}

export function buildDeskObjects(
  decisions: Decision[],
  turn: number,
  headlines: HeadlineItem[],
  report?: DeskObject,
): DeskObject[] {
  const objects: DeskObject[] = [];

  // 1. Diario impreso siempre presente en el escritorio
  const mainHeadline = headlines[0];
  const outletName = headlines[0]?.outletName ?? 'El Diario del Sur';
  objects.push({
    id: `desk-diario-${turn}`,
    type: 'diario',
    title: outletName,
    subtitle: mainHeadline?.title ?? 'Sin novedades principales en la tapa.',
    urgency: 'media',
    inspectText: [
      mainHeadline?.title,
      mainHeadline?.subhead,
      mainHeadline?.causalStoryText,
      mainHeadline?.humanImpactText,
    ].filter(Boolean).join('\n\n') || 'Sin novedades principales en la tapa.',
    read: false,
    positionOffset: { x: -140, y: 40 },
  });

  if (report) objects.push(report);

  // 2. Expedientes y carpetas según decisiones pendientes
  const callerNames: Record<string, string> = {
    economico: 'Elena Santillán (Min. de Economía)',
    politico: 'Ignacio Carrizo (Jefe de Gabinete)',
    social: 'Rubén Toledo (Líder Sindical)',
    mediatico: 'Mariana Mansilla (Bloque Opositor)',
    internacional: 'Marcelo Lagos (Banco Central)',
    infraestructura: 'Lucía Benítez (Gobernadora del Norte)',
  };

  decisions.forEach((d, idx) => {
    const isUrgent = d.urgency === 'alta' || d.urgency === 'critica';
    let type: DeskObjectType = 'expediente';

    // Las urgencias llegan como llamadas telefónicas, no como carpetas
    if (d.urgency === 'critica') {
      type = 'carpeta-roja';
    } else if (isUrgent) {
      type = 'telefono';
    } else if (d.category === 'politico') {
      type = 'carta-gobernador';
    } else if (d.category === 'mediatico') {
      type = 'encuesta';
    } else if (d.category === 'internacional') {
      type = 'informe-inteligencia';
    }

    const caller = callerNames[d.category] ?? 'Jefe de Gabinete';
    const subtitle = isUrgent
      ? `Llamada de ${caller}`
      : `Presentado por: ${d.source}`;
    const inspectText = isUrgent
      ? `${caller} te llama por línea directa: "${d.description}"`
      : d.description;

    objects.push({
      id: `desk-obj-${d.id}-${turn}`,
      type,
      title: isUrgent ? `Llamada urgente: ${d.title}` : d.title,
      subtitle,
      urgency: d.urgency,
      inspectText,
      associatedDecisionId: d.id,
      read: false,
      positionOffset: { x: 20 + idx * 40, y: -20 + idx * 30 },
    });
  });

  return objects;
}

function buildPacingReport(state: GameState, fromTurn: number): DeskObject {
  const months = Math.max(1, Math.round((state.turn - fromTurn) / 2));
  const events = state.eventLog
    .filter((entry) => entry.turn > fromTurn && (entry.type === 'event' || entry.type === 'election'))
    .slice(-3)
    .map((entry) => entry.title.replace(/^\p{Extended_Pictographic}\s*/u, ''));
  const risingActors = [...state.actors].sort((a, b) => b.influence - a.influence).slice(0, 2);
  const climate = countryPressure(state) < 12 ? 'calma sostenida' : 'estabilidad vigilada';
  const eventText = events.length > 0 ? `\n\nEn el período: ${events.join(' · ')}.` : '\n\nNo hubo sobresaltos nacionales; el país siguió moviéndose igual.';
  const actorText = risingActors.length > 0
    ? `\n\nEn los pasillos ganaron peso ${risingActors.map((actor) => `${actor.name} ${actor.surname}`).join(' y ')}.`
    : '';

  return {
    id: `desk-report-${fromTurn}-${state.turn}`,
    type: 'informe-inteligencia',
    title: `Informe de transición — ${months} ${months === 1 ? 'mes' : 'meses'} de ${climate}`,
    subtitle: `${state.calendar.season} ${state.calendar.year}: el país respiró, pero no se detuvo.`,
    urgency: 'baja',
    inspectText: `Entre el turno ${fromTurn} y el ${state.turn}, transcurrieron ${months} ${months === 1 ? 'mes' : 'meses'} sin una crisis que exigiera su firma. Las reservas quedaron en ${Math.round(state.nation.economy.reserves)}%, la inflación en ${Math.round(state.nation.economy.inflation)}% y la conflictividad en ${Math.round(state.nation.society.socialConflicts)}%.${eventText}${actorText}\n\nEl control vuelve a su escritorio.`,
    read: false,
  };
}

function generateNewspaperIssue(state: GameState, rng: ReturnType<typeof createRng>, headlines: HeadlineItem[]): HeadlineIssue {
  const main = headlines[0] ?? {
    id: `hl-main-${state.turn}`,
    outletName: 'El Diario del Sur',
    title: 'NUEVA ETAPA EN EL GOBIERNO NACIONAL',
    subhead: 'El Poder Ejecutivo analiza las primeras medidas para el mandato.',
    category: 'politico',
    bias: 'oficialista',
  };
  const secondaries = headlines.slice(1);
  const calendar = state.calendar;

  // Construir un texto editorial dinámico y variado según las decisiones y economía del momento
  const recentDecisions = (state.eventLog ?? []).filter((l) => l.type === 'decision').slice(-2);
  let editorialText = '';

  if (recentDecisions.length > 0) {
    const lastDec = recentDecisions[recentDecisions.length - 1]!;
    editorialText = `Tras la reciente definición respecto a "${lastDec.title.replace(/^[🚨📋📨⚠️]\s*/, '')}", las repercusiones políticas se hicieron sentir de inmediato en el Congreso, en los mercados y en la conversación cotidiana. ${lastDec.emotionalText ?? lastDec.description} La medida todavía no puede evaluarse solo por sus números: gobernadores, sindicatos y sectores empresarios ya están preparando su propia lectura, y cada uno intenta convertir el resultado en una señal sobre el rumbo del gobierno.`;
  } else if (state.nation.economy.inflation > 60) {
    editorialText = `Con una inflación rozando el ${Math.round(state.nation.economy.inflation)}%, la presión social sobre el despacho presidencial alcanza un punto crítico. La paciencia de los sectores productivos se agota a ritmo acelerado y los hogares reorganizan compras, deudas y expectativas alrededor de una pregunta simple: cuánto tiempo más puede sostenerse la rutina sin una respuesta política visible.`;
  } else if (state.nation.economy.reserves < 20) {
    editorialText = `El alarmante nivel de reservas en el Banco Central (${Math.round(state.nation.economy.reserves)}%) condiciona cada movimiento del gabinete. Sin divisas suficientes, las negociaciones internacionales son contrarreloj y la escasez empieza a tener nombres concretos: insumos que no llegan, fábricas que frenan turnos y proveedores que ya no aceptan esperar.`;
  } else if (state.character.popularity > 60) {
    editorialText = `El respaldo popular del ${Math.round(state.character.popularity)}% otorga al presidente un margen de maniobra envidiable. Sin embargo, la oposición advierte sobre los riesgos del triunfalismo antes del cierre fiscal: la misma ciudadanía que aplaude una recuperación puede cambiar de humor cuando una tarifa, un impuesto o un escándalo aterriza en su mesa.`;
  } else {
    editorialText = pick(rng, [
      `La ${calendar.fortnight === 1 ? 'primera' : 'segunda'} quincena de ${calendar.season} pone a prueba el pulso político de la administración. Con una popularidad en ${Math.round(state.character.popularity)}%, la gobernabilidad requiere consensos constantes y una explicación que no suene igual en el Congreso, en una fábrica y en la fila de un hospital.`,
      `El panorama económico marcado por un nivel de reservas del ${Math.round(state.nation.economy.reserves)}% exige máxima prudencia técnica. El gabinete busca sostener el equilibrio sin resentir la imagen pública, mientras los mercados esperan señales y las provincias reclaman que el ajuste no vuelva a caer siempre sobre los mismos.`,
      `Entre la presión sindical y las demandas de los gobernadores provinciales, el oficialismo intenta ordenar su agenda parlamentaria antes del próximo cierre de sesiones. Cada acuerdo tiene una letra chica y cada demora deja espacio para que la oposición escriba su propia versión de lo que está pasando.`,
    ]);
  }

  return {
    turn: state.turn,
    month: calendar.month,
    year: calendar.year,
    fortnight: calendar.fortnight,
    season: calendar.season,
    editionNumber: 1000 + state.turn,
    dateString: `Edición N° ${1000 + state.turn} — ${calendar.fortnight === 1 ? '1ª Quincena' : '2ª Quincena'} de ${calendar.season} ${calendar.year}`,
    mainHeadline: main,
    secondaryHeadlines: secondaries,
    editorialText,
    caricatureCaption: pick(rng, ERA_QUOTES),
    classifieds: [
      'Se buscan contadores con experiencia en ingeniería contable.',
      'Venta de generadores eléctricos seminuevos.',
      'Se alquila oficina cerca del Congreso con salida rápida a la calle.',
    ],
    obituary: 'Falleció el estatuto de estabilidad cambiaria de 2028. Sus restos fueron velados en el Banco Central.',
    adSatire: pick(rng, ADS_SATIRE),
    lenses: {
      economicDaily: 'La estabilidad macroeconómica enfrenta turbulencias moderadas.',
      popularDaily: 'El costo de vida se siente cada día más pesado en la calle.',
      officialTv: 'El gobierno ratifica el rumbo y destaca avances graduales.',
      oppositionTv: 'Crecen los cuestionamientos en el Congreso por el manejo económico.',
      viralMeme: 'Un meme irónico sobre la situación se viraliza rápidamente.',
    },
  };
}

function buildAnnualDocumentary(state: GameState, headlines: HeadlineItem[]): AnnualDocumentaryReport {
  const decisiveLog = [...state.eventLog].reverse().find((entry) => entry.type === 'decision');
  const influentialActor = [...state.actors].sort((a, b) => b.influence - a.influence)[0];
  const memorable = state.scars.slice(-3).map((scar) => scar.title);
  return {
    year: state.calendar.year,
    mandateIdentity: state.nation.economy.inflation > 60 ? 'Los anos del precio que no espera' : state.character.popularity > 60 ? 'El gobierno de la confianza' : 'Un mandato de equilibrio inestable',
    top5Headlines: headlines.slice(0, 5),
    imageOfTheYear: state.nation.society.socialConflicts > 45 ? 'El pais mirando una calle cortada desde la ventana del despacho.' : 'El pais volviendo a abrir la persiana antes de que amanezca.',
    mostControversialDecisionTitle: decisiveLog?.title ?? 'Todavia no hubo una firma que dividiera al pais',
    politicianOfTheYearName: influentialActor ? `${influentialActor.name} ${influentialActor.surname}` : 'El gabinete en su conjunto',
    approvalSwing: { before: Math.max(0, state.character.popularity - 5), after: state.character.popularity },
    butterflyEffectsTriggered: [...memorable, ...state.activeDelayedEffects.slice(-2).map((effect) => effect.description)].slice(0, 5),
  };
}

function campaignMomentum(state: GameState, type: 'legislative' | 'presidential', electionTurn: number): number {
  const prefix = type === 'legislative' ? 'dec-campana-legislativa' : 'dec-campana-presidencial';
  const recent = state.decisionHistory.filter((entry) => entry.id === prefix && entry.turn >= electionTurn - 10);
  return recent.reduce((score, entry) => {
    const choice = entry.choiceId;
    if (choice.includes('medios') || choice.includes('debate')) return score + 5;
    if (choice.includes('influencers') || choice.includes('redes')) return score + 4;
    if (choice.includes('territorio') || choice.includes('acuerdo')) return score + 6;
    return score;
  }, 0);
}

export function createNewGame(seed: number = Date.now(), customChar?: Partial<Character>): GameState {
  const rng = createRng(seed);

  const character: Character = {
    id: `player-${seed}`,
    name: customChar?.name ?? 'Patricio',
    surname: customChar?.surname ?? 'Soto',
    age: customChar?.age ?? 34,
    province: customChar?.province ?? 'capital-federal',
    profession: customChar?.profession ?? 'Abogado/a',
    education: customChar?.education ?? 'universitario',
    traits: customChar?.traits ?? {
      charisma: 65,
      honesty: 70,
      ambition: 75,
      empathy: 60,
      oratory: 65,
      strategy: 70,
    },
    health: 85,
    stress: 20,
    popularity: 35,
    wealth: 25,
    ego: 40,
    idealismo: 75,
    pragmatismo: 40,
    housing: customChar?.housing ?? 'ph',
    possessions: [],
    family: [
      { id: 'fam-1', name: 'Mariana', relation: 'pareja', age: 33, disposition: 80, publicProfile: false },
    ],
    relationships: [],
    backstory: customChar?.backstory ?? 'Comenzó militando en centros universitarios con la convicción de sanear la administración pública.',
    lore: customChar?.lore ?? buildDefaultLore(customChar ?? {}),
    avatarId: customChar?.avatarId ?? 'custom',
    hiddenScandals: [],
    beliefs: {
      economy: 0, stateSize: 20, security: 10, education: 40, environment: 20,
      trade: 0, industry: 20, liberties: 20, federalism: 30, foreignRelations: 0,
      technology: 20, health: 40, culture: 10,
    },
    career: customChar?.career ?? 'militante',
    partyId: customChar?.partyId ?? 'partido-tradicional',
    yearsInPolitics: 0,
  };

  const calendar = calculateCalendar(1);
  let nation = createDefaultNation();
  let reputation = createDefaultReputation();
  const socialMedia = createInitialSocialMedia();

  const charismaShift = Math.round((character.traits.charisma - 60) / 6);
  const honestyShift = Math.round((character.traits.honesty - 60) / 7);
  const empathyShift = Math.round((character.traits.empathy - 55) / 7);
  const strategyShift = Math.round((character.traits.strategy - 55) / 8);
  const oratoryShift = Math.round((character.traits.oratory - 55) / 8);

  character.popularity = clamp(character.popularity + charismaShift + Math.max(0, oratoryShift));
  character.stress = clamp(character.stress - Math.max(0, strategyShift));
  nation = {
    ...nation,
    society: {
      ...nation.society,
      trust: clamp(nation.society.trust + honestyShift + empathyShift),
      polarization: clamp(nation.society.polarization - Math.max(0, oratoryShift)),
    },
    governance: {
      ...nation.governance,
      institutionality: clamp(nation.governance.institutionality + honestyShift + strategyShift),
      corruption: clamp(nation.governance.corruption - honestyShift),
    },
  };
  reputation = {
    ...reputation,
    prensa: clamp(reputation.prensa + oratoryShift),
    'clase-media': clamp(reputation['clase-media'] + honestyShift),
    trabajadores: clamp(reputation.trabajadores + empathyShift),
    empresarios: clamp(reputation.empresarios + strategyShift),
  };

  const initialStateForHeadlines: any = {
    turn: 1,
    calendar,
    nation,
    character,
    reputation,
    socialMedia,
    scars: [],
    decisionHistory: [],
  };
  const dailyHeadlines = generateDailyHeadlines(initialStateForHeadlines, rng);
  const initialIssue = generateNewspaperIssue(initialStateForHeadlines, rng, dailyHeadlines);

  const eligible = getEligibleDecisions(initialStateForHeadlines);
  const initialPicks = shuffle(rng, eligible).slice(0, 1);
  const initialDeskObjects = buildDeskObjects(initialPicks, 1, dailyHeadlines);

  const state: GameState = {
    version: SAVE_VERSION,
    seed,
    turn: 1,
    phase: 'playing',
    calendar,
    dailyHeadlines,
    hemeroteca: [initialIssue],
    scars: [],
    persistentConsequences: [],
    worldState: createDefaultWorldState(),
    sectorTrustMemory: {
      campo: 50,
      empresarios: 50,
      sindicatos: 50,
      cientificos: 50,
      universidades: 50,
      internacional: 50,
      militar: 50,
      ambiental: 50,
    },
    annualDocumentaries: [],
    electionsHistory: [],
    character,
    nation,
    provinces: PROVINCES,
    parties: DEFAULT_PARTIES,
    actors: createInitialActors(),
    deskObjects: initialDeskObjects,
    deskProps: {
      coffeeCupCount: 1,
      familyPhotoVisible: true,
      diplomaticGiftVisible: false,
      paperStackLevel: 1,
    },
    pendingDecisions: initialPicks,
    activeDelayedEffects: [],
    activeEvents: [],
    eventLog: [
      {
        id: 'history-system-start-1-0',
        familyId: 'mandate-start',
        lifecycle: 'nacimiento',
        turn: 1,
        type: 'system',
        title: character.idealismo > character.pragmatismo + 15
          ? `Asunción presidencial: mandato popular`
          : character.pragmatismo > character.idealismo + 15
          ? `Asunción presidencial: alineamiento de mercado`
          : `Asunción presidencial: pacto institucional`,
        description: character.idealismo > character.pragmatismo + 15
          ? `${character.name} ${character.surname} jura con compromiso social y respaldo popular. La calle celebra la asunción, pero los mercados observan con extrema desconfianza.`
          : character.pragmatismo > character.idealismo + 15
          ? `${character.name} ${character.surname} asume con el aval del sector financiero y empresarial. Los mercados festejan el cambio de rumbo, mientras los gremios se declaran en alerta.`
          : `${character.name} ${character.surname} asume como figura de consenso. En un Congreso dividido, cada medida exigirá negociaciones provincia a provincia.`,
        emotionalText: character.idealismo > character.pragmatismo + 15
          ? 'Prometí no defraudar a la gente. La masa en la plaza canta, pero los informes de reservas en el despacho ya queman.'
          : character.pragmatismo > character.idealismo + 15
          ? 'La prioridad es ordenar las cuentas. Los teléfonos de las cámaras de comercio y exportadores no paran de sonar.'
          : 'Equilibrio y pragmatismo. No hay margen para errores en un mapa político fragmentado.',
      },
    ],
    reputation,
    mediaOutlets: createInitialMedia(),
    socialMedia,
    bills: [],
    patterns: createInitialPatterns(),
    flags: {},
    decisionHistory: [],
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };

  return state;
}

export function advanceTurn(state: GameState): GameState {
  const nextTurn = state.turn + 1;
  const rng = createRng(state.seed + nextTurn * 7919);
  const nextCalendar = calculateCalendar(nextTurn);

  // 1. Simular Provincias
  const nextProvinces = simulateProvincesTick(state.provinces, rng);

  let currentNation = { ...state.nation };
  let currentReputation = { ...state.reputation };
  let currentCharacter = { ...state.character };
  let currentActors = advanceActorWorld(state.actors, nextTurn, state.seed);
  let nextPhase: GameState['phase'] = state.phase;
  const newLogs: LogEntry[] = [];
  const nextScars = dedupeNationalScars(state.scars);
  const nextElections = [...state.electionsHistory];
  const trialProcessingDue = state.trialProcessingUntilTurn !== undefined && nextTurn >= state.trialProcessingUntilTurn;
  if (trialProcessingDue) {
    nextPhase = 'gameover';
    currentCharacter = { ...currentCharacter, career: 'expresidente' };
    newLogs.push({
      id: historyId('trial-closure', 'political-trial', nextTurn),
      familyId: 'political-trial',
      lifecycle: 'resuelto',
      turn: nextTurn,
      type: 'event',
      title: 'FALLO FINAL: EL VICEPRESIDENTE ASUME EL CONTROL DEL PAÍS',
      description: 'La investigación terminó sin elementos suficientes para sostener la acusación. Fuiste apartado de la presidencia y no podés volver a presentarte; el vicepresidente completa el mandato mientras vos solo podés observar el cierre de la gestión.',
    });
  }

  // 2. Procesar Efectos Diferidos (Bombas de tiempo)
  const remainingDelayed: DelayedEffect[] = [];

  for (const [delayedIndex, delayed] of state.activeDelayedEffects.entries()) {
    const delayedId = delayed.id ?? historyId('delayed', delayed.familyId ?? delayed.sourceDecisionId, delayed.originTurn, delayedIndex);
    const elapsed = nextTurn - delayed.originTurn;
    if (elapsed >= delayed.turnsDelay) {
      const manifested = chance(rng, delayed.probability);
      newLogs.push({
        id: delayedId,
        familyId: delayed.familyId ?? delayed.sourceDecisionId,
        parentId: delayed.parentHistoryId,
        sourceDecisionId: delayed.sourceDecisionId,
        sourceChoiceId: delayed.sourceChoiceId,
        lifecycle: manifested ? 'expansion' : 'consumido',
        turn: nextTurn,
        type: 'event',
        title: manifested ? '💣 Consecuencia diferida de tu decisión' : '💣 Consecuencia diferida que no llegó a materializarse',
        description: manifested
          ? delayed.description
          : `La consecuencia prevista no se materializó: ${delayed.description}`,
        emotionalText: manifested
          ? 'Las decisiones pasadas nunca mueren; solo esperaban en silencio el momento de estallar.'
          : 'La historia también conserva las consecuencias que estuvieron a punto de ocurrir.',
      });

      if (manifested) {
        const updated = applyEffects({ nation: currentNation, reputation: currentReputation, character: currentCharacter }, delayed.effects);
        currentNation = updated.nation;
        currentReputation = updated.reputation;
        currentCharacter = updated.character;
      }
    } else {
      remainingDelayed.push({ ...delayed, id: delayedId });
    }
  }

  // 2b. ENTROPÍA DE POPULARIDAD & BENEFICIOS DE RESERVAS (Items 1 y 2)
  // Popularidad extremadamente alta (>85) sufre desgaste natural por fatiga pública y expectativas
  if (currentCharacter.popularity > 85) {
    const decay = (currentCharacter.popularity - 80) * 0.15;
    currentCharacter = { ...currentCharacter, popularity: clamp(currentCharacter.popularity - decay) };
  }

  // Reservas al máximo (>=90%) otorgan beneficios pero aumentan la presión opositora sindical
  if (currentNation.economy.reserves >= 90) {
    currentNation = {
      ...currentNation,
      governance: { ...currentNation.governance, internationalImage: clamp(currentNation.governance.internationalImage + 0.8) },
      economy: { ...currentNation.economy, inflation: clamp(currentNation.economy.inflation - 0.4) },
      society: { ...currentNation.society, socialConflicts: clamp(currentNation.society.socialConflicts + 0.5) },
    };
  }

  // 3. Evaluar Elecciones Multinivel
  // Elecciones Provinciales (Cada 12 meses)
  if (nextCalendar.turnsUntilProvincial === 0 && nextTurn > 1) {
    const wonProvinces = nextProvinces.filter((p) => p.socialMood >= 0).length;
    newLogs.push({
      turn: nextTurn,
      type: 'election',
      title: '🗳️ Elecciones provinciales y municipales',
      description: wonProvinces >= 5
        ? `Tu alianza retuvo ${wonProvinces} de las 8 provincias. Los gobernadores aliados celebran el resultado.`
        : `La oposición ganó en ${8 - wonProvinces} provincias. El mapa político territorial se tiñe de color opositor.`,
      emotionalText: 'El mapa del país cambió de color frente a tus ojos en una sola noche electoral.',
    });
    nextElections.push({
      turn: nextTurn,
      year: nextCalendar.year,
      type: 'provincial',
      winnerPartyId: wonProvinces >= 5 ? currentCharacter.partyId : 'partido-liberal',
      winnerPartyName: wonProvinces >= 5 ? 'Alianza Oficialista' : 'Frente Opositor',
      playerPopularityAtElection: currentCharacter.popularity,
      congressMajority: wonProvinces >= 5,
      description: `Resultado territorial: ${wonProvinces} provincias oficialistas / ${8 - wonProvinces} opositoras.`,
    });
  }

  // Elecciones Legislativas (Cada 24 meses)
  if (nextCalendar.turnsUntilLegislative === 0 && nextTurn > 1) {
    const campaignBonus = campaignMomentum(state, 'legislative', nextTurn);
    const legislativeScore = currentCharacter.popularity + campaignBonus + (currentReputation.prensa - 50) * 0.15;
    const electionPassed = legislativeScore >= 40;
    const estimatedSeats = Math.max(20, Math.min(80, Math.round(50 + (legislativeScore - 40) * 1.8)));
    newLogs.push({
      turn: nextTurn,
      type: 'election',
      title: '🏛️ Elecciones legislativas nacionales',
      description: electionPassed
        ? `Con ${Math.round(legislativeScore)} puntos de fuerza electoral, tu partido consigue aproximadamente ${estimatedSeats}% de las bancas y conserva la iniciativa en el Congreso.`
        : `Derrota legislativa con ${Math.round(currentCharacter.popularity)}% de imagen. La oposición obtiene mayoría en la Cámara.`,
      emotionalText: 'Ganar o perder el Congreso define si gobernás con decretos o negociando cada coma.',
    });
    nextElections.push({
      turn: nextTurn,
      year: nextCalendar.year,
      type: 'legislativa',
      winnerPartyId: electionPassed ? currentCharacter.partyId : 'partido-liberal',
      winnerPartyName: electionPassed ? 'Oficialismo' : 'Bloque Opositor',
      playerPopularityAtElection: currentCharacter.popularity,
      congressMajority: electionPassed,
      description: electionPassed ? 'Mayoría propia en la Cámara de Diputados.' : 'Congreso en manos de la oposición.',
    });
  }

  // Elecciones Presidenciales (Cada 48 meses)
  if (state.phase !== 'opposition' && nextCalendar.turnsUntilPresidential === 0 && nextTurn > 1) {
    const campaignBonus = campaignMomentum(state, 'presidential', nextTurn);
    const presidentialScore = currentCharacter.popularity + campaignBonus + (currentReputation['clase-media'] - 50) * 0.2;
    const reelected = presidentialScore >= 45;
    newLogs.push({
      turn: nextTurn,
      type: 'election',
      title: '👑 Elecciones presidenciales de la República',
      description: reelected
        ? `Victoria electoral. ${currentCharacter.name} ${currentCharacter.surname} obtiene la reelección con ${Math.round(currentCharacter.popularity)}% de los votos.`
        : `Derrota presidencial. El pueblo eligió un cambio de rumbo. Tu mandato termina.`,
      emotionalText: reelected
        ? 'Cuatro años más de poder y responsabilidad sobre la espalda.'
        : 'La banda presidencial cambia de manos. Tu nombre entra a la historia de los expresidentes.',
    });
    nextElections.push({
      turn: nextTurn,
      year: nextCalendar.year,
      type: 'presidencial',
      winnerPartyId: reelected ? currentCharacter.partyId : 'partido-liberal',
      winnerPartyName: reelected ? `${currentCharacter.name} ${currentCharacter.surname}` : 'Frente Opositor',
      playerPopularityAtElection: presidentialScore,
      congressMajority: state.electionsHistory[state.electionsHistory.length - 1]?.congressMajority ?? false,
      description: reelected ? 'Reelección presidencial con una campaña apoyada en debate y territorio.' : 'Cambio de gobierno; el expresidente conserva una banca de influencia en la oposición.',
    });
    if (!reelected) {
      nextPhase = 'opposition';
      currentCharacter = { ...currentCharacter, career: 'expresidente' };
      newLogs.push({
        turn: nextTurn,
        type: 'system',
        title: 'La oposición te devuelve un escritorio, no un silencio',
        description: 'Perdiste la reelección, pero conservás contactos, memoria y una audiencia. Desde ahora tus carpetas llegan desde la oposición: podés investigar, negociar o embarrar la cancha con prensa, redes e influencers.',
        emotionalText: 'El poder cambia de despacho. La política, por suerte, no pide permiso para seguir.',
      });
    }
  }

  // 4. Evaluar Cicatrices Nacionales
  const newScar = checkForScarTrigger({ ...state, turn: nextTurn, calendar: nextCalendar, nation: currentNation });
  if (newScar) {
    nextScars.push(newScar);
    newLogs.push({
      id: newScar.historyId ?? newScar.id,
      familyId: newScar.familyId ?? newScar.id,
      parentId: newScar.parentHistoryId,
      lifecycle: newScar.lifecycle ?? 'nacimiento',
      turn: nextTurn,
      type: 'event',
      title: `⚡ Cicatriz nacional: ${newScar.title}`,
      description: newScar.description,
      emotionalText: 'El país ha quedado marcado por este hito. Los diarios lo recordarán durante décadas.',
    });
  }

  const legalRisk = state.phase !== 'trial' && state.phase !== 'gameover'
    && !state.flags['trial-processing'] && !state.flags['trial-acquitted'] && !state.flags['trial-dismissed'] && !state.flags['trial-convicted']
    && nextTurn > 10
    && (currentNation.governance.corruption >= 88
      || currentNation.governance.institutionality <= 16
      || (currentNation.society.socialConflicts >= 90 && currentCharacter.popularity <= 15));
  const trialDecision = legalRisk ? buildTrialDecision(nextTurn) : null;
  if (trialDecision) {
    nextPhase = 'trial';
    newLogs.push({
      turn: nextTurn,
      type: 'scandal',
      title: 'La comisión activa el juicio político',
      description: 'El expediente reúne contratos, omisiones y decisiones que ahora deberán ser explicadas en público. La partida entra en una instancia de defensa política.',
      emotionalText: 'Una firma puede parecer pequeña durante una crisis. En un juicio, todas las firmas vuelven a tamaño real.',
    });
  }

  // 5. Generar Evento Sistémico
  const activeEvents: GameEvent[] = [];
  let contextualDecision: Decision | null = null;
  const seasonalMoment = (nextCalendar.month === 12 && nextCalendar.fortnight === 2)
    || (nextCalendar.month === 1 && nextCalendar.fortnight === 1);
  const reserveOverflow = currentNation.economy.reserves >= 98;
  if (!trialDecision && (chance(rng, 0.4) || seasonalMoment || reserveOverflow)) {
    const eventContext = { ...state, turn: nextTurn, calendar: nextCalendar, nation: currentNation, scars: nextScars };
    const generatedEvent = generateSystemicEvent(eventContext, state.seed + nextTurn);
    const sysEvent = prepareSystemicEvent(eventContext, generatedEvent, nextTurn);
    if (sysEvent) {
      activeEvents.push(sysEvent);
      const updated = applyEffects({ nation: currentNation, reputation: currentReputation, character: currentCharacter }, sysEvent.effects);
      currentNation = updated.nation;
      currentReputation = updated.reputation;
      const generatedDecision = generateContextualDecision({ ...eventContext, nation: currentNation, reputation: currentReputation, character: currentCharacter }, sysEvent, state.seed + nextTurn);
      contextualDecision = generatedDecision
        ? prepareDecisionForState(generatedDecision, { ...eventContext, nation: currentNation, reputation: currentReputation, character: currentCharacter })
        : null;
      newLogs.push({
        id: sysEvent.id,
        familyId: sysEvent.familyId,
        parentId: sysEvent.parentHistoryId,
        causeKey: sysEvent.causeKey,
        lifecycle: 'nacimiento',
        turn: nextTurn,
        type: 'event',
        title: sysEvent.title,
        description: sysEvent.description,
      });
    }
  }

  // 6. Generar Titulares y Archivar Edición Impresa en la Hemeroteca
  const nextStateForHeadlines: GameState = {
    ...state,
    phase: nextPhase,
    turn: nextTurn,
    calendar: nextCalendar,
    nation: currentNation,
    character: currentCharacter,
    reputation: currentReputation,
    actors: currentActors,
    eventLog: [...state.eventLog, ...newLogs],
    scars: nextScars,
  };
  const dailyHeadlines = generateDailyHeadlines(nextStateForHeadlines, rng);
  const newIssue = generateNewspaperIssue(nextStateForHeadlines, rng, dailyHeadlines);
  const annualReport = nextCalendar.month === 12 && nextCalendar.fortnight === 2
    ? buildAnnualDocumentary(nextStateForHeadlines, dailyHeadlines)
    : null;
  const hasMemorableMoment = newLogs.some((log) => log.type === 'event' || log.type === 'election' || log.type === 'scandal')
    || contextualDecision !== null
    || nextScars.length > state.scars.length
    || annualReport !== null;
  const updatedHemeroteca = hasMemorableMoment ? [newIssue, ...state.hemeroteca] : state.hemeroteca;

  // 7. Actualizar Patrones de Jugador
  const updatedPatterns = {
    ...state.patterns,
    detectedProfile: evaluatePlayerProfile(state.patterns),
  };

  // 8. Decisiones Elegibles
  const eligibleDecisions = getEligibleDecisions(nextStateForHeadlines);
  const shuffledEligible = shuffle(rng, eligibleDecisions);

  const existingPending = state.pendingDecisions;
  const pressure = countryPressure(nextStateForHeadlines);
  const desiredPending = state.phase === 'opposition' || nextPhase === 'opposition'
    ? 1
    : pressure >= 70 ? 6 : pressure >= 48 ? 3 : pressure >= 27 ? 1 : (contextualDecision ? 1 : (nextTurn % 6 === 0 ? 1 : 0));
  const capacity = Math.max(0, desiredPending - existingPending.length);
  const context = contextualDecision && !existingPending.some((decision) =>
    getDecisionFamilyId(decision) === getDecisionFamilyId(contextualDecision!)
      && decision.causeKey === contextualDecision!.causeKey,
  )
    ? [contextualDecision]
    : [];
  const newPicks = [...context, ...shuffledEligible]
    .filter((d) => !existingPending.some((ep) => getDecisionFamilyId(ep) === getDecisionFamilyId(d) && ep.causeKey === d.causeKey))
    .slice(0, capacity);

  const nextPendingDecisions = trialDecision ? [trialDecision] : [...existingPending, ...newPicks];

  // 9. Mundo Autónomo y Consecuencias Persistentes
  const { updatedWorld, worldLog } = simulateAutonomousWorld(state.worldState ?? createDefaultWorldState(), nextTurn);
  const stateForConsequences: GameState = {
    ...nextStateForHeadlines,
    persistentConsequences: state.persistentConsequences ?? [],
    worldState: updatedWorld,
  };
  const { updatedConsequences, emergentLogs, butterflyLog, activatedConsequences } = evaluatePersistentConsequences(stateForConsequences);
  for (const consequence of activatedConsequences) {
    const updated = applyEffects({ nation: currentNation, reputation: currentReputation, character: currentCharacter }, consequence.effects);
    currentNation = updated.nation;
    currentReputation = updated.reputation;
    currentCharacter = updated.character;
  }
  const allNewLogs: LogEntry[] = [
    ...newLogs,
    ...(worldLog ? [worldLog] : []),
    ...emergentLogs,
    ...(butterflyLog ? [butterflyLog] : []),
  ];
  const historicalLogs = normalizeHistoricalLogs(allNewLogs, nextTurn);

    // Evaluar crisis de estrés y salud del Presidente
    let finalHealth = currentCharacter.health;
    let finalStress = clamp(currentCharacter.stress + (pressure >= 48 ? 2 : 1));

    if (finalStress >= 80 && chance(rng, 0.35)) {
      historicalLogs.push({
        id: historyId('stress-episode', 'health-crisis', nextTurn),
        familyId: 'health-crisis',
        turn: nextTurn,
        type: 'event',
        title: '💔 CRISIS DE SALUD PRESIDENCIAL: AGOTAMIENTO EXTREMO',
        description: 'El estrés acumulado provocó un cuadro de hipertensión y desorientación durante una conferencia oficial. Médicos recomiendan reposo absoluto.',
        emotionalText: '«El país no frena, pero el cuerpo del Presidente exige un límite que la política se niega a conceder.»',
      });
      finalHealth = clamp(finalHealth - 8);
      currentCharacter.popularity = clamp(currentCharacter.popularity - 4);
    }

    if (finalHealth <= 0 || finalStress >= 100) {
      nextPhase = 'gameover';
      historicalLogs.push({
        id: historyId('health-collapse', 'health-crisis', nextTurn),
        familyId: 'health-crisis',
        turn: nextTurn,
        type: 'event',
        title: '🏥 TRAGEDIA NACIONAL: COLAPSO MÉDICO DEL PRESIDENTE',
        description: 'El estado de salud del mandatario sufrió un deterioro irreversible. El Vicepresidente asume la titularidad del Poder Ejecutivo en un clima de duelo y conmoción nacional.',
        emotionalText: 'La bandera ondea a media asta en la Casa de Gobierno.',
      });
    }

    const turnResultState: GameState = {
    ...state,
    phase: nextPhase,
    turn: nextTurn,
    calendar: nextCalendar,
    dailyHeadlines,
    hemeroteca: updatedHemeroteca,
    annualDocumentaries: annualReport ? [...state.annualDocumentaries, annualReport] : state.annualDocumentaries,
    scars: nextScars,
    persistentConsequences: updatedConsequences,
    worldState: updatedWorld,
    electionsHistory: nextElections,
    nation: currentNation,
    provinces: nextProvinces,
    reputation: currentReputation,
    character: {
      ...currentCharacter,
      health: finalHealth,
      stress: finalStress,
      yearsInPolitics: currentCharacter.yearsInPolitics + (nextTurn % 12 === 0 ? 1 : 0),
    },
    actors: currentActors,
    flags: {
      ...state.flags,
      ...(trialProcessingDue ? { 'trial-processing': false, 'trial-dismissed': true } : {}),
    },
    trialProcessingUntilTurn: trialProcessingDue ? undefined : state.trialProcessingUntilTurn,
    pendingDecisions: nextPendingDecisions,
    deskObjects: buildDeskObjects(nextPendingDecisions, nextTurn, dailyHeadlines),
    deskProps: {
      ...state.deskProps,
      paperStackLevel: Math.max(1, Math.min(5, Math.floor(nextPendingDecisions.length + state.scars.length / 2))),
    },
    activeDelayedEffects: remainingDelayed,
    activeEvents,
    eventLog: [...state.eventLog, ...historicalLogs],
    patterns: updatedPatterns,
    updatedAt: Date.now(),
  };

  return evaluateCorruptionScandals(turnResultState);
}

/**
 * Cuando el país está estable, el mandato avanza sin obligar al jugador a pulsar
 * una quincena vacía tras otra. El primer asunto relevante interrumpe el salto.
 */
export function advanceMandate(state: GameState): GameState {
  if (state.pendingDecisions.length > 0 || !isCountryStable(state)) return advanceTurn(state);

  const fromTurn = state.turn;
  let current = state;

  for (let step = 0; step < 6; step += 1) {
    current = advanceTurn(current);
    if (current.phase === 'gameover' || current.pendingDecisions.length > 0 || !isCountryStable(current)) break;
  }

  if (current.turn - fromTurn < 2) return current;

  const report = buildPacingReport(current, fromTurn);
  const reportLog: LogEntry = {
    turn: current.turn,
    type: 'system',
    title: report.title,
    description: report.inspectText,
  };
  return {
    ...current,
    deskObjects: buildDeskObjects(current.pendingDecisions, current.turn, current.dailyHeadlines, report),
    eventLog: [...current.eventLog, reportLog],
    updatedAt: Date.now(),
  };
}

export function executeChoice(state: GameState, decision: Decision, choiceId: string): GameState {
  const choice = decision.choices.find((c) => c.id === choiceId);
  if (!choice || choice.disabled) return state;

  const isTrialDecision = decision.id.startsWith('trial-');
  const contextualOutcome = isTrialDecision ? null : buildContextualOutcome(state, decision, choice);
  const combinedEffects = contextualOutcome ? mergeEffects(choice.effects, contextualOutcome.effects) : choice.effects;
  let updated = applyEffects(state, choice.effects);
  if (contextualOutcome) updated = applyEffects(updated, contextualOutcome.effects);
  const familyId = getDecisionFamilyId(decision);
  const causeKey = decision.causeKey ?? getDecisionCauseKey(decision, state);
  const decisionHistoryId = historyId('decision', familyId, state.turn, state.decisionHistory.length);

  const newDelayed = choice.delayedEffects.map((de, delayedIndex) => ({
    ...de,
    id: de.id ?? historyId('delayed', de.familyId ?? familyId, state.turn, delayedIndex),
    familyId: de.familyId ?? familyId,
    sourceChoiceId: choiceId,
    parentHistoryId: decisionHistoryId,
    originTurn: state.turn,
  }));

  const remainingPending = state.pendingDecisions.filter((d) => d.id !== decision.id);
  const trialConviction = isTrialDecision && choiceId === 'trial-condena';
  const trialDismissed = isTrialDecision && choiceId === 'trial-merito';
  const trialProcessing = isTrialDecision && choiceId === 'trial-inocencia';
  const nextPhase: GameState['phase'] = isTrialDecision
    ? (trialConviction || trialDismissed ? 'gameover' : trialProcessing ? 'opposition' : 'playing')
    : state.phase;
  const trialResolution = isTrialDecision
    ? choiceId === 'trial-inocencia'
      ? {
        flag: 'trial-processing',
        title: 'Juicio político: presidente procesado y apartado durante la investigación',
        description: 'La defensa entregó contratos, auditorías y órdenes de servicio. La investigación sigue abierta; el vicepresidente toma el control provisional del país y la prensa publica cada avance del expediente.',
        emotionalText: 'Entregar la verdad no conserva el cargo: solo evita que el expediente desaparezca.',
      }
      : choiceId === 'trial-merito'
      ? {
        flag: 'trial-dismissed',
        title: 'Juicio político: causa archivada por falta de mérito',
        description: 'La acusación no logró probar una responsabilidad directa y la causa fue archivada. Fuiste apartado, el vicepresidente tomó el control del país y no podés volver a presentarte.',
        emotionalText: 'La falta de mérito no es una ovación: es una puerta que se cierra sin que nadie deje de mirar la cerradura.',
      }
      : {
        flag: 'trial-convicted',
        title: 'Juicio político: condena y fin de la carrera',
        description: 'El tribunal político encontró responsabilidad suficiente. El mandato termina y el expresidente queda detenido mientras el expediente sigue su curso; el legado de esta partida queda marcado por la condena.',
        emotionalText: 'No fue un mal titular: fue el final de tu gobierno y el comienzo de tu expediente penal ficticio.',
      }
    : null;

  const logEntry: LogEntry = {
    id: decisionHistoryId,
    familyId,
    sourceDecisionId: decision.id,
    sourceChoiceId: choiceId,
    causeKey,
    lifecycle: 'nacimiento',
    turn: state.turn,
    type: 'decision',
    title: decision.title,
    description: `Decisión ejecutada: "${choice.label}".`,
    emotionalText: choice.emotionalImpact ?? `Elegiste la opción "${choice.label}". El país absorbe el costo.`,
  };
  const resolutionLog: LogEntry = trialResolution ? {
    id: historyId('trial-resolution', familyId, state.turn),
    familyId,
    parentId: decisionHistoryId,
    sourceDecisionId: decision.id,
    sourceChoiceId: choiceId,
    lifecycle: 'resuelto',
    turn: state.turn,
    type: 'system',
    title: trialResolution.title,
    description: trialResolution.description,
    emotionalText: trialResolution.emotionalText,
  } : buildChoiceResolutionLog(state, decision, choice, familyId, causeKey, decisionHistoryId);
  const trialHeadline: HeadlineItem | null = trialResolution && !trialConviction ? {
    id: `hl-trial-resolution-${state.turn}`,
    outletName: 'Canal 11 Red Federal',
    title: trialResolution.title.toUpperCase(),
    subhead: trialResolution.description,
    category: 'politico',
    bias: trialResolution.flag === 'trial-processing' ? 'opositor' : 'oficialista',
  } : null;

  const actionKey = `${decision.id} ${choice.id}`.toLowerCase();
  const updatedPatterns = { ...state.patterns };
  if (/(feriado|mantener|rechazar|conceder|defender)/.test(actionKey)) updatedPatterns.populistMoves += 1;
  if (/(cepo|techo|aumentar|subir|aceptar-condiciones)/.test(actionKey)) updatedPatterns.austerityMoves += 1;
  if (/(segmentada|diferenciado|clausula|puente|auditar|no-intervenir|sostener)/.test(actionKey)) updatedPatterns.negotiationsStarted += 1;
  if (/(cepo|techo|moratoria|sin-feriado)/.test(actionKey)) updatedPatterns.hardlineStances += 1;
  if (/(swap|vender|aceptar-condiciones|defender-mascota)/.test(actionKey)) updatedPatterns.favorsAccepted += 1;
  if (/(sostener|rechazar|dejar|racionar)/.test(actionKey)) updatedPatterns.favorsRejected += 1;
  updatedPatterns.detectedProfile = evaluatePlayerProfile(updatedPatterns);

  const defaultActors: Record<string, string> = {
    'dec-crisis-reservas-urgente': 'actor-presidente-banco-central',
    'dec-mundial-feriado': 'actor-lider-sindical',
    'dec-mascota-cadena': 'actor-lider-opositora',
    'dec-subsidio-transporte': 'actor-ministra-economia',
    'dec-cepo-cambiario': 'actor-presidente-banco-central',
    'dec-retenciones-agro': 'actor-empresario-influyente',
    'dec-paritaria-docente': 'actor-jefe-gabinete',
    'dec-fmi-renegociacion': 'actor-ministra-economia',
    'dec-campana-legislativa': 'actor-lider-opositora',
    'dec-campana-presidencial': 'actor-lider-opositora',
    'dec-oposicion-prensa': 'actor-lider-opositora',
  };
  const actorId = decision.sourceActorId ?? defaultActors[decision.id];
  const sentiment = choice.effects.reputation?.trabajadores && choice.effects.reputation.trabajadores < 0 ? -8 : 5;
  const actors = actorId
    ? state.actors.map((actor) => actor.id === actorId
      ? recordActorMemory(actor, state.turn, `${decision.title}: ${choice.label}`, sentiment)
      : actor)
    : state.actors;

  return {
    ...state,
    phase: nextPhase,
    nation: updated.nation,
    reputation: updated.reputation,
    sectorTrustMemory: updateSectorTrustMemory(state.sectorTrustMemory, combinedEffects),
    character: isTrialDecision
      ? { ...updated.character, career: 'expresidente', ...(trialConviction ? { stress: 100, popularity: 0 } : {}) }
      : updated.character,
    actors,
    patterns: updatedPatterns,
    flags: {
      ...state.flags,
      ...(choice.flags ?? []).reduce<Record<string, boolean>>((flags, flag) => ({ ...flags, [flag]: true }), {}),
      ...(trialResolution ? { [trialResolution.flag]: true } : {}),
      ...(trialProcessing ? { 'trial-processing': true } : {}),
      ...(trialDismissed || trialConviction ? { 'trial-processing': false } : {}),
    },
    pendingDecisions: remainingPending,
    deskObjects: buildDeskObjects(remainingPending, state.turn, state.dailyHeadlines),
    activeDelayedEffects: [...state.activeDelayedEffects, ...newDelayed],
    decisionHistory: [...state.decisionHistory, {
      id: decision.id,
      familyId,
      turn: state.turn,
      choiceId,
      causeKey,
      historyId: decisionHistoryId,
      parentHistoryId: decision.parentHistoryId,
    }],
    dailyHeadlines: trialHeadline ? [trialHeadline, ...state.dailyHeadlines].slice(0, 12) : state.dailyHeadlines,
    eventLog: [...state.eventLog, logEntry, resolutionLog, ...(contextualOutcome ? [contextualOutcome.log] : [])],
    updatedAt: Date.now(),
    ...(trialProcessing ? { trialProcessingUntilTurn: state.turn + 4 } : {}),
  };
}
