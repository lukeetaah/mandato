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
  Effects,
  AnnualDocumentaryReport,
} from './types';
import { SAVE_VERSION } from './types';
import { createRng, chance, shuffle, pick } from './rng';
import { PROVINCES, DEFAULT_PARTIES, createDefaultReputation, createDefaultNation } from './constants';
import { advanceActorWorld, createInitialActors, recordActorMemory } from './actors';
import { createInitialMedia, createInitialSocialMedia } from './media';
import { createInitialPatterns, evaluatePlayerProfile } from './pattern-detector';
import { applyReputationChanges } from './reputation';
import { simulateProvincesTick } from './provinces';
import { getEligibleDecisions } from './decisions';
import { generateDailyHeadlines } from './headlines';
import { checkForScarTrigger } from './scars';
import { generateContextualDecision, generateSystemicEvent } from './event-generator';

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

const clamp = (value: number, max: number = 100) => Math.max(0, Math.min(max, value));

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
  const mainHeadline = headlines[0]?.title ?? 'Sin novedades principales en la tapa.';
  const outletName = headlines[0]?.outletName ?? 'El Diario del Sur';
  objects.push({
    id: `desk-diario-${turn}`,
    type: 'diario',
    title: outletName,
    subtitle: mainHeadline,
    urgency: 'media',
    inspectText: mainHeadline,
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
    editorialText = `Tras la reciente definición respecto a "${lastDec.title.replace(/^[🚨📋📨⚠️]\s*/, '')}", las repercusiones políticas se hicieron sentir de inmediato en el Congreso y en los mercados. ${lastDec.emotionalText ?? lastDec.description}`;
  } else if (state.nation.economy.inflation > 60) {
    editorialText = `Con una inflación rozando el ${Math.round(state.nation.economy.inflation)}%, la presión social sobre el despacho presidencial alcanza un punto crítico. La paciencia de los sectores productivos se agota a ritmo acelerado.`;
  } else if (state.nation.economy.reserves < 20) {
    editorialText = `El alarmante nivel de reservas en el Banco Central (${Math.round(state.nation.economy.reserves)}%) condiciona cada movimiento del gabinete. Sin divisas suficientes, las negociaciones internacionales son contrarreloj.`;
  } else if (state.character.popularity > 60) {
    editorialText = `El respaldo popular del ${Math.round(state.character.popularity)}% otorga al presidente un margen de maniobra envidiable. Sin embargo, la oposición advierte sobre los riesgos del triunfalismo antes del cierre fiscal.`;
  } else {
    editorialText = pick(rng, [
      `La ${calendar.fortnight === 1 ? 'primera' : 'segunda'} quincena de ${calendar.season} pone a prueba el pulso político de la administración. Con una popularidad en ${Math.round(state.character.popularity)}%, la gobernabilidad requiere consensos constantes.`,
      `El panorama económico marcado por un nivel de reservas del ${Math.round(state.nation.economy.reserves)}% exige máxima prudencia técnica. El gabinete busca sostener el equilibrio sin resentir la imagen pública.`,
      `Entre la presión sindical y las demandas de los gobernadores provinciales, el oficialismo intenta ordenar su agenda parlamentaria antes del próximo cierre de sesiones.`,
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
  const reputation = createDefaultReputation();
  const socialMedia = createInitialSocialMedia();

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

        const updated = applyEffects({ nation: currentNation, reputation: currentReputation, character: currentCharacter }, delayed.effects);
        currentNation = updated.nation;
        currentReputation = updated.reputation;
        currentCharacter = updated.character;
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
      description: reelected ? 'ReelecciÃ³n presidencial con una campaÃ±a apoyada en debate y territorio.' : 'Cambio de gobierno; el expresidente conserva una banca de influencia en la oposiciÃ³n.',
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
      turn: nextTurn,
      type: 'event',
      title: `⚡ Cicatriz nacional: ${newScar.title}`,
      description: newScar.description,
      emotionalText: 'El país ha quedado marcado por este hito. Los diarios lo recordarán durante décadas.',
    });
  }

  // 5. Generar Evento Sistémico
  const activeEvents: GameEvent[] = [];
  let contextualDecision: Decision | null = null;
  if (chance(rng, 0.4)) {
    const sysEvent = generateSystemicEvent({ ...state, turn: nextTurn, calendar: nextCalendar, nation: currentNation }, state.seed + nextTurn);
    activeEvents.push(sysEvent);
    const updated = applyEffects({ nation: currentNation, reputation: currentReputation, character: currentCharacter }, sysEvent.effects);
    currentNation = updated.nation;
    currentReputation = updated.reputation;
    currentCharacter = updated.character;
    contextualDecision = generateContextualDecision({ ...state, turn: nextTurn, calendar: nextCalendar, nation: currentNation, reputation: currentReputation, character: currentCharacter }, sysEvent, state.seed + nextTurn);
    newLogs.push({
      turn: nextTurn,
      type: 'event',
      title: sysEvent.title,
      description: sysEvent.description,
    });
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
    eventLog: [...state.eventLog, ...newLogs].slice(-200),
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
  const updatedHemeroteca = hasMemorableMoment ? [newIssue, ...state.hemeroteca].slice(0, 120) : state.hemeroteca;

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
  const context = contextualDecision && !existingPending.some((decision) => decision.id === contextualDecision!.id)
    ? [contextualDecision]
    : [];
  const newPicks = [...context, ...shuffledEligible]
    .filter((d) => !existingPending.some((ep) => ep.id === d.id))
    .slice(0, capacity);

  const nextPendingDecisions = [...existingPending, ...newPicks];

  return {
    ...state,
    phase: nextPhase,
    turn: nextTurn,
    calendar: nextCalendar,
    dailyHeadlines,
    hemeroteca: updatedHemeroteca,
    annualDocumentaries: annualReport ? [...state.annualDocumentaries, annualReport] : state.annualDocumentaries,
    scars: nextScars,
    electionsHistory: nextElections,
    nation: currentNation,
    provinces: nextProvinces,
    reputation: currentReputation,
    character: {
      ...currentCharacter,
      stress: clamp(currentCharacter.stress + (pressure >= 48 ? 2 : 1)),
      yearsInPolitics: currentCharacter.yearsInPolitics + (nextTurn % 12 === 0 ? 1 : 0),
    },
    actors: currentActors,
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
    eventLog: [...current.eventLog, reportLog].slice(-200),
    updatedAt: Date.now(),
  };
}

export function executeChoice(state: GameState, decision: Decision, choiceId: string): GameState {
  const choice = decision.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  const updated = applyEffects(state, choice.effects);

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
    nation: updated.nation,
    reputation: updated.reputation,
    character: updated.character,
    actors,
    patterns: updatedPatterns,
    flags: {
      ...state.flags,
      ...(choice.flags ?? []).reduce<Record<string, boolean>>((flags, flag) => ({ ...flags, [flag]: true }), {}),
    },
    pendingDecisions: remainingPending,
    deskObjects: buildDeskObjects(remainingPending, state.turn, state.dailyHeadlines),
    activeDelayedEffects: [...state.activeDelayedEffects, ...newDelayed],
    decisionHistory: [...state.decisionHistory, { id: decision.id, turn: state.turn, choiceId }],
    eventLog: [...state.eventLog, logEntry].slice(-200),
    updatedAt: Date.now(),
  };
}
