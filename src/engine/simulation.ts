import type {
  GameState,
  Character,
  Decision,
  DelayedEffect,
  GameEvent,
  LogEntry,
  CalendarState,
  HeadlineIssue,
  HeadlineItem,
  DeskObject,
  DeskObjectType,
} from './types';
import { SAVE_VERSION } from './types';
import { createRng, chance, shuffle, pick } from './rng';
import { PROVINCES, DEFAULT_PARTIES, createDefaultReputation, createDefaultNation } from './constants';
import { createInitialActors } from './actors';
import { createInitialMedia, createInitialSocialMedia } from './media';
import { createInitialPatterns, evaluatePlayerProfile } from './pattern-detector';
import { applyReputationChanges } from './reputation';
import { simulateProvincesTick } from './provinces';
import { getEligibleDecisions } from './decisions';
import { generateDailyHeadlines } from './headlines';
import { checkForScarTrigger } from './scars';
import { generateSystemicEvent } from './event-generator';

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

const CARICATURES = [
  'El Ministro de Economía intentando tapar una fuga de agua en la represa con plastilina.',
  'Un ciudadano corriendo a un billete volando por el viento mentre un remarcador ríe.',
  'El Congreso de la República convertido en un remate de caballos.',
  'El presidente intentando equilibrios en una cuerda floja sobre un mar de cocodrilos con corbata.',
];

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

export function buildDeskObjects(decisions: Decision[], turn: number, headlines: HeadlineItem[]): DeskObject[] {
  const objects: DeskObject[] = [];

  // 1. Diario impreso siempre presente en el escritorio
  objects.push({
    id: `desk-diario-${turn}`,
    type: 'diario',
    title: 'Edición Impresa del Día',
    subtitle: headlines[0]?.outletName ?? 'El Diario del Sur',
    urgency: 'media',
    inspectText: headlines[0]?.title ?? 'Sin novedades principales en la tapa.',
    read: false,
    positionOffset: { x: -140, y: 40 },
  });

  // 2. Expedientes y carpetas según decisiones pendientes
  decisions.forEach((d, idx) => {
    let type: DeskObjectType = 'expediente';
    if (d.urgency === 'critica') type = 'carpeta-roja';
    else if (d.category === 'politico') type = 'carta-gobernador';
    else if (d.category === 'mediatico') type = 'encuesta';
    else if (d.category === 'internacional') type = 'informe-inteligencia';

    objects.push({
      id: `desk-obj-${d.id}-${turn}`,
      type,
      title: d.title,
      subtitle: `Presentado por: ${d.source}`,
      urgency: d.urgency,
      inspectText: d.description,
      associatedDecisionId: d.id,
      read: false,
      positionOffset: { x: 20 + idx * 40, y: -20 + idx * 30 },
    });
  });

  // 3. Teléfono de oficina cuando hay alta urgencia
  if (decisions.some((d) => d.urgency === 'alta' || d.urgency === 'critica')) {
    objects.push({
      id: `desk-phone-${turn}`,
      type: 'telefono',
      title: 'Llamada Entrante del Gabinete',
      subtitle: 'Línea directa del despacho',
      urgency: 'alta',
      inspectText: 'El teléfono rojo del despacho no para de sonar.',
      read: false,
      positionOffset: { x: 180, y: -100 },
    });
  }

  return objects;
}

function generateNewspaperIssue(state: GameState, rng: ReturnType<typeof createRng>): HeadlineIssue {
  const headlines = generateDailyHeadlines(state, rng);
  const main = headlines[0]!;
  const secondaries = headlines.slice(1);
  const calendar = state.calendar;

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
    editorialText: `El mes de ${calendar.season} pone a prueba la solidez del poder. La inflación en ${Math.round(state.nation.economy.inflation)}% y las reservas en ${Math.round(state.nation.economy.reserves)}% definen el margen político del gobierno.`,
    caricatureCaption: pick(rng, CARICATURES),
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
  const nation = createDefaultNation();

  const initialStateForHeadlines: any = { turn: 1, calendar, nation, character, scars: [] };
  const dailyHeadlines = generateDailyHeadlines(initialStateForHeadlines, rng);
  const initialIssue = generateNewspaperIssue(initialStateForHeadlines, rng);

  const eligible = getEligibleDecisions({
    turn: 1, decisionHistory: [], pendingDecisions: [],
  } as any);
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
        turn: 1,
        type: 'system',
        title: 'Año 2032 — Inicio de carrera política',
        description: `${character.name} ${character.surname} asume en la República del Sur. Un país reorganizado en 8 provincias tras el colapso de 2029. Cada medida dejará una marca indeleble.`,
        emotionalText: 'El escritorio del despacho presidencial luce impecable. El sillón está frío, pero la historia ya comenzó a presionar.',
      },
    ],
    reputation: createDefaultReputation(),
    mediaOutlets: createInitialMedia(),
    socialMedia: createInitialSocialMedia(),
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
  const newLogs: LogEntry[] = [];
  const nextScars = [...state.scars];
  const nextElections = [...state.electionsHistory];

  // 2. Procesar Efectos Diferidos (Bombas de tiempo)
  const remainingDelayed: DelayedEffect[] = [];

  for (const delayed of state.activeDelayedEffects) {
    const elapsed = nextTurn - delayed.originTurn;
    if (elapsed >= delayed.turnsDelay) {
      if (chance(rng, delayed.probability)) {
        newLogs.push({
          turn: nextTurn,
          type: 'event',
          title: '💣 Consecuencia diferida de tu decisión',
          description: delayed.description,
          emotionalText: 'Las decisiones pasadas nunca mueren; solo esperaban en silencio el momento de estallar.',
        });

        if (delayed.effects.national?.economy) {
          const eco = delayed.effects.national.economy;
          const curr = currentNation.economy;
          currentNation.economy = {
            ...curr,
            reserves: Math.max(0, Math.min(100, curr.reserves + (eco.reserves ?? 0))),
            inflation: Math.max(0, Math.min(100, curr.inflation + (eco.inflation ?? 0))),
            gdp: Math.max(0, Math.min(100, curr.gdp + (eco.gdp ?? 0))),
          };
        }
        if (delayed.effects.national?.society) {
          const soc = delayed.effects.national.society;
          const curr = currentNation.society;
          currentNation.society = {
            ...curr,
            socialConflicts: Math.max(0, Math.min(100, curr.socialConflicts + (soc.socialConflicts ?? 0))),
            poverty: Math.max(0, Math.min(100, curr.poverty + (soc.poverty ?? 0))),
          };
        }
        if (delayed.effects.character) {
          const ch = delayed.effects.character;
          currentCharacter = {
            ...currentCharacter,
            popularity: Math.max(0, Math.min(100, currentCharacter.popularity + (ch.popularity ?? 0))),
          };
        }
      }
    } else {
      remainingDelayed.push(delayed);
    }
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
    const electionPassed = currentCharacter.popularity >= 40;
    newLogs.push({
      turn: nextTurn,
      type: 'election',
      title: '🏛️ Elecciones legislativas nacionales',
      description: electionPassed
        ? `Con ${Math.round(currentCharacter.popularity)}% de popularidad, tu partido consolida bancas en el Congreso.`
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
  if (nextCalendar.turnsUntilPresidential === 0 && nextTurn > 1) {
    const reelected = currentCharacter.popularity >= 45;
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
    if (!reelected) {
      return {
        ...state,
        turn: nextTurn,
        phase: 'gameover',
        calendar: nextCalendar,
        character: currentCharacter,
        nation: currentNation,
        electionsHistory: nextElections,
        eventLog: [...state.eventLog, ...newLogs].slice(-200),
        updatedAt: Date.now(),
      };
    }
  }

  // 4. Evaluar Cicatrices Nacionales
  const newScar = checkForScarTrigger({ ...state, turn: nextTurn, calendar: nextCalendar, nation: currentNation });
  if (newScar) {
    nextScars.push(newScar);
    newLogs.push({
      turn: nextTurn,
      type: 'event',
      title: `⚡ Cicatriz nacional: ${newScar.title}`,
      description: newScar.description,
      emotionalText: 'El país ha quedado marcado por este hito. Los diarios lo recordarán durante décadas.',
    });
  }

  // 5. Generar Evento Sistémico
  const activeEvents: GameEvent[] = [];
  if (chance(rng, 0.4)) {
    const sysEvent = generateSystemicEvent({ ...state, turn: nextTurn, calendar: nextCalendar, nation: currentNation }, state.seed + nextTurn);
    activeEvents.push(sysEvent);
    newLogs.push({
      turn: nextTurn,
      type: 'event',
      title: sysEvent.title,
      description: sysEvent.description,
    });
  }

  // 6. Generar Titulares y Archivar Edición Impresa en la Hemeroteca
  const nextStateForHeadlines = {
    ...state,
    turn: nextTurn,
    calendar: nextCalendar,
    nation: currentNation,
    character: currentCharacter,
    scars: nextScars,
  };
  const dailyHeadlines = generateDailyHeadlines(nextStateForHeadlines, rng);
  const newIssue = generateNewspaperIssue(nextStateForHeadlines, rng);
  const updatedHemeroteca = [newIssue, ...state.hemeroteca];

  // 7. Actualizar Patrones de Jugador
  const updatedPatterns = {
    ...state.patterns,
    detectedProfile: evaluatePlayerProfile(state.patterns),
  };

  // 8. Decisiones Elegibles
  const eligibleDecisions = getEligibleDecisions(nextStateForHeadlines);
  const shuffledEligible = shuffle(rng, eligibleDecisions);

  const existingPending = state.pendingDecisions;
  const newNeeded = existingPending.length === 0 ? 1 : 0;
  const newPicks = shuffledEligible
    .filter((d) => !existingPending.some((ep) => ep.id === d.id))
    .slice(0, newNeeded);

  const nextPendingDecisions = [...existingPending, ...newPicks];

  return {
    ...state,
    turn: nextTurn,
    calendar: nextCalendar,
    dailyHeadlines,
    hemeroteca: updatedHemeroteca,
    scars: nextScars,
    electionsHistory: nextElections,
    nation: currentNation,
    provinces: nextProvinces,
    reputation: currentReputation,
    character: {
      ...currentCharacter,
      stress: Math.max(0, Math.min(100, currentCharacter.stress + 1)),
      yearsInPolitics: currentCharacter.yearsInPolitics + (nextTurn % 12 === 0 ? 1 : 0),
    },
    pendingDecisions: nextPendingDecisions,
    deskObjects: buildDeskObjects(nextPendingDecisions, nextTurn, dailyHeadlines),
    deskProps: {
      ...state.deskProps,
      paperStackLevel: Math.max(1, Math.min(5, Math.floor(nextPendingDecisions.length + state.scars.length / 2))),
    },
    activeDelayedEffects: remainingDelayed,
    activeEvents,
    eventLog: [...state.eventLog, ...newLogs].slice(-200),
    patterns: updatedPatterns,
    updatedAt: Date.now(),
  };
}

export function executeChoice(state: GameState, decision: Decision, choiceId: string): GameState {
  const choice = decision.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  let currentNation = { ...state.nation };
  let currentReputation = { ...state.reputation };
  let currentCharacter = { ...state.character };
  let currentPatterns = { ...state.patterns };

  if (choice.effects.national) {
    if (choice.effects.national.economy) {
      const eco = choice.effects.national.economy;
      const curr = currentNation.economy;
      currentNation.economy = {
        ...curr,
        inflation: Math.max(0, Math.min(100, curr.inflation + (eco.inflation ?? 0))),
        reserves: Math.max(0, Math.min(100, curr.reserves + (eco.reserves ?? 0))),
        debt: Math.max(0, Math.min(100, curr.debt + (eco.debt ?? 0))),
        gdp: Math.max(0, Math.min(100, curr.gdp + (eco.gdp ?? 0))),
        investment: Math.max(0, Math.min(100, curr.investment + (eco.investment ?? 0))),
        exchangeRate: Math.max(0, Math.min(200, curr.exchangeRate + (eco.exchangeRate ?? 0))),
      };
    }
    if (choice.effects.national.society) {
      const soc = choice.effects.national.society;
      const curr = currentNation.society;
      currentNation.society = {
        ...curr,
        poverty: Math.max(0, Math.min(100, curr.poverty + (soc.poverty ?? 0))),
        employment: Math.max(0, Math.min(100, curr.employment + (soc.employment ?? 0))),
        insecurity: Math.max(0, Math.min(100, curr.insecurity + (soc.insecurity ?? 0))),
        education: Math.max(0, Math.min(100, curr.education + (soc.education ?? 0))),
        health: Math.max(0, Math.min(100, curr.health + (soc.health ?? 0))),
        socialConflicts: Math.max(0, Math.min(100, curr.socialConflicts + (soc.socialConflicts ?? 0))),
        trust: Math.max(0, Math.min(100, curr.trust + (soc.trust ?? 0))),
      };
    }
    if (choice.effects.national.governance) {
      const gov = choice.effects.national.governance;
      const curr = currentNation.governance;
      currentNation.governance = {
        ...curr,
        institutionality: Math.max(0, Math.min(100, curr.institutionality + (gov.institutionality ?? 0))),
        corruption: Math.max(0, Math.min(100, curr.corruption + (gov.corruption ?? 0))),
        internationalImage: Math.max(0, Math.min(100, curr.internationalImage + (gov.internationalImage ?? 0))),
      };
    }
  }

  if (choice.effects.reputation) {
    currentReputation = applyReputationChanges(currentReputation, choice.effects.reputation);
  }

  if (choice.effects.character) {
    const ch = choice.effects.character;
    currentCharacter = {
      ...currentCharacter,
      popularity: Math.max(0, Math.min(100, currentCharacter.popularity + (ch.popularity ?? 0))),
      wealth: Math.max(0, currentCharacter.wealth + (ch.wealth ?? 0)),
      ego: Math.max(0, Math.min(100, currentCharacter.ego + (ch.ego ?? 0))),
      idealismo: Math.max(0, Math.min(100, currentCharacter.idealismo + (ch.idealismo ?? 0))),
      pragmatismo: Math.max(0, Math.min(100, currentCharacter.pragmatismo + (ch.pragmatismo ?? 0))),
      health: Math.max(0, Math.min(100, currentCharacter.health + (ch.health ?? 0))),
      stress: Math.max(0, Math.min(100, currentCharacter.stress + (ch.stress ?? 0))),
    };
  }

  const newDelayed = choice.delayedEffects.map((de) => ({
    ...de,
    originTurn: state.turn,
  }));

  const remainingPending = state.pendingDecisions.filter((d) => d.id !== decision.id);

  const logEntry: LogEntry = {
    turn: state.turn,
    type: 'decision',
    title: decision.title,
    description: `Decisión ejecutada: "${choice.label}".`,
    emotionalText: choice.emotionalImpact ?? `Elegiste la opción "${choice.label}". El país absorbe el costo.`,
  };

  return {
    ...state,
    nation: currentNation,
    reputation: currentReputation,
    character: currentCharacter,
    patterns: currentPatterns,
    pendingDecisions: remainingPending,
    deskObjects: buildDeskObjects(remainingPending, state.turn, state.dailyHeadlines),
    activeDelayedEffects: [...state.activeDelayedEffects, ...newDelayed],
    decisionHistory: [...state.decisionHistory, { id: decision.id, turn: state.turn, choiceId }],
    eventLog: [...state.eventLog, logEntry].slice(-200),
    updatedAt: Date.now(),
  };
}
