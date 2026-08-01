import type { Decision, EventCategory, GameState, GameEvent } from './types';
import { createRng, pick, randomInt, chance } from './rng';

const REGIONAL_SECTORS = [
  { name: 'Noroeste Andino', focus: 'minería de litio', group: 'universidades' as const },
  { name: 'Litoral Subtropical', focus: 'represa hidroeléctrica', group: 'trabajadores' as const },
  { name: 'Cuyo y Valles Secos', focus: 'cuenca vitivinícola', group: 'campo' as const },
  { name: 'Sierras del Centro', focus: 'parque automotriz', group: 'industria' as const },
  { name: 'Pampa Agrícola Central', focus: 'cosecha de granos', group: 'campo' as const },
  { name: 'Distrito Federal Metropolitano', focus: 'sistema financiero', group: 'mercados' as const },
  { name: 'Costa Marítima Atlántica', focus: 'flota pesquera', group: 'empresarios' as const },
  { name: 'Sur Estepario Patagónico', focus: 'yacimientos no convencionales', group: 'fuerzas-seguridad' as const },
];

const ANOMALIES_SATIRICAL = [
  'Un municipio inauguró la cuarta rotonda en seis meses y prometió que ahora sí conectará con una calle.',
  'Una provincia presentó un puente panorámico que todavía no llega al río.',
  'El Ministerio de Coordinación cambió de nombre por tercera vez antes de imprimir las credenciales.',
  'Una licitación para termos inteligentes subsidiados terminó con todos los oferentes impugnándose entre sí.',
  'Un influencer convenció a media Patagonia de plantar palta y ya se discute quién paga los invernaderos.',
  'Un sindicato pidió postergar una protesta: el calor hacía demasiado caluroso protestar.',
];

const ACTOR_BY_CATEGORY: Partial<Record<EventCategory, string>> = {
  economico: 'actor-ministra-economia',
  social: 'actor-lider-sindical',
  politico: 'actor-jefe-gabinete',
  ambiental: 'actor-gobernadora-norte',
  mediatico: 'actor-lider-opositora',
  internacional: 'actor-presidente-banco-central',
  satirico: 'actor-empresario-influyente',
};

const NATIONAL_LIFE_EVENTS: Array<{
  id: string;
  category: EventCategory;
  when: (state: GameState) => boolean;
  title: string;
  description: string;
  effects: GameEvent['effects'];
}> = [
  {
    id: 'eclipse-total',
    category: 'ambiental',
    when: (state) => state.turn > 4 && state.turn % 19 === 0,
    title: 'El eclipse oscurece el mediodia y enciende el turismo',
    description: 'Un eclipse cruza la Republica del Sur. Hoteles agotados, escuelas improvisando clases de astronomia y un gobernador que inaugura una sombra oficial.',
    effects: { national: { economy: { tourism: 5, investment: 2 }, society: { trust: 2 } }, reputation: { jovenes: 5, 'clase-media': 3 } },
  },
  {
    id: 'concert-record',
    category: 'mediatico',
    when: (state) => state.turn > 6 && state.turn % 23 === 0,
    title: 'Un recital desborda la logistica nacional',
    description: 'Una banda internacional convoca a cientos de miles. El operativo funciona a medias: la economia nocturna festeja y el transporte pide otro presupuesto.',
    effects: { national: { economy: { tourism: 4, gdp: 1 }, society: { socialConflicts: 2 } }, reputation: { jovenes: 7, trabajadores: -2 } },
  },
  {
    id: 'film-award',
    category: 'internacional',
    when: (state) => state.turn > 8 && state.turn % 29 === 0,
    title: 'Una pelicula del Sur gana un premio inesperado',
    description: 'El cine nacional vuelve del extranjero con un premio. El gobierno quiere colgarse la medalla; la directora pide que primero terminen de pagar el festival.',
    effects: { national: { governance: { internationalImage: 5 }, economy: { tourism: 2 } }, reputation: { jovenes: 4, prensa: 3 } },
  },
  {
    id: 'ai-layoffs',
    category: 'social',
    when: (state) => state.turn > 10 && state.turn % 31 === 0,
    title: 'La inteligencia artificial deja miles de puestos en pausa',
    description: 'Una plataforma automatiza tareas administrativas en todo el pais. Las empresas celebran productividad; los sindicatos preguntan quien entrenara a la gente que queda afuera.',
    effects: { national: { economy: { investment: 5, gdp: 2 }, society: { employment: -4, socialConflicts: 6 } }, reputation: { trabajadores: -8, jovenes: 5, empresarios: 5 } },
  },
  {
    id: 'network-scandal',
    category: 'mediatico',
    when: (state) => state.turn > 12 && state.turn % 37 === 0,
    title: 'Una red social nueva cambia la campaña en una semana',
    description: 'Una aplicacion convierte cualquier discurso en una encuesta instantanea. Un streamer instala un escandalo antes de que el gabinete encuentre el boton de silenciar.',
    effects: { national: { governance: { institutionality: -2 }, society: { polarization: 5 } }, reputation: { prensa: -3, jovenes: 4 } },
  },
  {
    id: 'flooded-capital',
    category: 'ambiental',
    when: (state) => state.turn > 14 && state.turn % 41 === 0,
    title: 'Una inundacion convierte la periferia en archipielago',
    description: 'Lluvias extraordinarias desbordan tres cuencas. Un intendente transmite desde un bote y promete inaugurar el mismo puente apenas baje el agua.',
    effects: { national: { economy: { gdp: -3, investment: -2 }, society: { health: -2, trust: -4, socialConflicts: 5 } }, reputation: { 'clase-media': -5, ongs: -3 } },
  },
];

/**
 * Generador Combinatorio de Eventos Dinámicos (Más de 500 variaciones posibles)
 */
export function generateSystemicEvent(state: GameState, seed: number): GameEvent {
  const rng = createRng(seed);
  const sector = pick(rng, REGIONAL_SECTORS);
  const turn = state.turn;
  const season = state.calendar.season;

  const lifeCandidates = NATIONAL_LIFE_EVENTS.filter((candidate) =>
    candidate.when(state) && !state.eventLog.some((entry) => entry.title === candidate.title),
  );
  const lifeEvent = lifeCandidates.length > 0 ? pick(rng, lifeCandidates) : undefined;
  if (lifeEvent) {
    return {
      id: `ev-life-${lifeEvent.id}-${turn}`,
      title: lifeEvent.title,
      description: lifeEvent.description,
      category: lifeEvent.category,
      effects: lifeEvent.effects,
      turnOccurred: turn,
    };
  }

  const isSatirical = chance(rng, 0.18);

  if (isSatirical) {
    const anomaly = pick(rng, ANOMALIES_SATIRICAL);
    return {
      id: `ev-sys-sat-${turn}-${seed}`,
      title: `Insólita situación en ${sector.name}`,
      description: `${anomaly} El hecho desata una marea de memes y debates en medios nacionales.`,
      category: 'satirico',
      effects: {
        reputation: { jovenes: randomInt(rng, 2, 5), prensa: randomInt(rng, -4, 2) },
        character: { popularity: randomInt(rng, -2, 2) },
      },
      turnOccurred: turn,
    };
  }

  // Evento socio-económico condicionado por indicadores
  if (state.nation.economy.inflation > 60) {
    return {
      id: `ev-sys-inf-${turn}-${seed}`,
      title: `Tensión laboral por paritarias en ${sector.name}`,
      description: `La aceleración inflacionaria destruye los salarios del sector de ${sector.focus}. El gremio local amenaza con huelga por tiempo indeterminado.`,
      category: 'social',
      effects: {
        national: { society: { socialConflicts: randomInt(rng, 4, 8) } },
        reputation: { [sector.group]: randomInt(rng, -10, -4) },
      },
      turnOccurred: turn,
    };
  }

  if (state.nation.economy.reserves < 25) {
    return {
      id: `ev-sys-res-${turn}-${seed}`,
      title: `Falta de insumos importados paraliza ${sector.focus}`,
      description: `La escasez de dólares impide liberar contenedores en la aduana de ${sector.name}. Fábricas locales reducen turnos.`,
      category: 'economico',
      effects: {
        national: { economy: { gdp: randomInt(rng, -3, -1) } },
        reputation: { industria: randomInt(rng, -8, -3), empresarios: randomInt(rng, -6, -2) },
      },
      turnOccurred: turn,
    };
  }

  // Evento positivo estacional
  if (season === 'Verano' && sector.name === 'Costa Marítima Atlántica') {
    return {
      id: `ev-sys-ver-${turn}-${seed}`,
      title: `Récord de reservas turísticas en la costa`,
      description: `El turismo interno colapsa hoteles y restaurantes. Excelente recaudación local e ingreso de divisas.`,
      category: 'economico',
      effects: {
        national: { economy: { tourism: randomInt(rng, 5, 10), reserves: randomInt(rng, 2, 4) } },
        reputation: { 'clase-media': randomInt(rng, 4, 8) },
      },
      turnOccurred: turn,
    };
  }

  // Evento estándar regional
  return {
    id: `ev-sys-std-${turn}-${seed}`,
    title: `Inversión privada proyectada en ${sector.name}`,
    description: `Un consorcio regional anuncia intenciones de ampliar la producción de ${sector.focus}, sujeto a estabilidad fiscal.`,
    category: 'economico',
    effects: {
      national: { economy: { investment: randomInt(rng, 2, 5) } },
      reputation: { inversores: randomInt(rng, 3, 6) },
    },
    turnOccurred: turn,
  };
}

/**
 * Las crisis no salen de una tómbola: aparecen cuando el mundo o una decisión previa
 * les da sentido. Estas decisiones usan el mismo flujo de expedientes del escritorio.
 */
export function generateContextualDecision(state: GameState, event: GameEvent, seed: number): Decision | null {
  const rng = createRng(seed + 31);
  const actorId = ACTOR_BY_CATEGORY[event.category] ?? 'actor-jefe-gabinete';
  const actor = state.actors.find((candidate) => candidate.id === actorId);
  const source = actor ? `${actor.name} ${actor.surname}` : 'Jefatura de Gabinete';
  const common = {
    repeatable: false,
    cooldown: 0,
    requirements: [],
    sourceActorId: actorId,
  };
  const simplePreview = (gain: string, loss: string) => ({
    gains: [{ icon: '✓', label: gain, magnitude: 'moderado' as const }],
    losses: [{ icon: '⚠', label: loss, magnitude: 'moderado' as const }],
    risks: [],
    beneficiaries: [],
    opponents: [],
  });

  if (state.calendar.season === 'Invierno' && state.nation.economy.reserves < 55) {
    return {
      ...common,
      id: `ctx-energia-${state.turn}`,
      title: 'OLA POLAR: LA RED ENTRA EN SEMANA CRÍTICA',
      description: 'Escuelas y hospitales del sur piden gas de respaldo. El gobernador Roldán exige prioridad; Economía advierte que importar combustible erosiona las reservas.',
      source,
      urgency: 'alta',
      category: 'ambiental',
      choices: [
        { id: `ctx-energia-importar-${state.turn}`, label: 'Importar gas de emergencia', description: 'Asegurás calefacción y actividad, aun pagando la factura en divisas.', preview: simplePreview('Continuidad de servicios esenciales', 'Menos reservas'), effects: { national: { economy: { reserves: -7 }, society: { health: 3, trust: 3 } }, reputation: { 'clase-media': 4, mercados: -3 } }, delayedEffects: [] },
        { id: `ctx-energia-racionar-${state.turn}`, label: 'Racionar el consumo industrial por dos semanas', description: 'Protegés las reservas y trasladás el costo a fábricas y empleos temporarios.', preview: simplePreview('Ahorro de divisas', 'Paradas de producción'), effects: { national: { economy: { reserves: 3, gdp: -3 }, society: { employment: -2 } }, reputation: { industria: -8 } }, delayedEffects: [] },
      ],
    };
  }

  if (state.nation.society.education < 54 && state.turn > 18) {
    return {
      ...common,
      id: `ctx-talento-${state.turn}`,
      title: 'EMPRESAS TECNOLÓGICAS NO CONSIGUEN PERSONAL',
      description: 'Una empresa de automatización suspendió su llegada: faltan perfiles técnicos. Rectores recuerdan que las alertas sobre educación se acumularon durante años.',
      source,
      urgency: 'media',
      category: 'social',
      choices: [
        { id: `ctx-talento-formacion-${state.turn}`, label: 'Financiar una reconversión técnica acelerada', description: 'No resuelve mañana, pero recupera capacidades para los próximos años.', preview: simplePreview('Educación y empleo futuro', 'Costo fiscal inmediato'), effects: { national: { society: { education: 5 }, economy: { reserves: -2 } }, reputation: { universidades: 8, jovenes: 6 } }, delayedEffects: [{ turnsDelay: 8, probability: 0.8, effects: { national: { economy: { investment: 5 }, society: { employment: 3 } } }, description: 'Los primeros egresados de la reconversión cubren vacantes que antes quedaban sin ocupar.', sourceDecisionId: `ctx-talento-${state.turn}`, originTurn: 0 }] },
        { id: `ctx-talento-importar-${state.turn}`, label: 'Ofrecer visas exprés y contratar afuera', description: 'La planta se instala, pero el malestar por las oportunidades perdidas queda en casa.', preview: simplePreview('Inversión inmediata', 'Frustración local'), effects: { national: { economy: { investment: 4 }, society: { trust: -2 } }, reputation: { empresarios: 5, universidades: -5 } }, delayedEffects: [] },
      ],
    };
  }

  if (event.category === 'satirico' && chance(rng, 0.45)) {
    return {
      ...common,
      id: `ctx-absurdo-${state.turn}`,
      title: 'EL PAPELÓN MUNICIPAL LLEGA A LA CASA DE GOBIERNO',
      description: `${event.description} La oposición exige una intervención; los intendentes piden que no se convierta una torpeza local en una guerra nacional.`,
      source,
      urgency: 'baja',
      category: 'satirico',
      choices: [
        { id: `ctx-absurdo-auditar-${state.turn}`, label: 'Ordenar una auditoría sin conferencia de prensa', description: 'Corregís el asunto sin regalarle tres semanas de aire al escándalo.', preview: simplePreview('Señal de control', 'Costo político local'), effects: { national: { governance: { institutionality: 2 } }, reputation: { prensa: 2, 'clase-media': 2 } }, delayedEffects: [] },
        { id: `ctx-absurdo-dejar-${state.turn}`, label: 'Dejar que el municipio explique su propia rotonda', description: 'No intervenís: no toda rareza de provincia merece despacho presidencial.', preview: simplePreview('Autonomía local', 'Rumor sin desmentida'), effects: { national: { governance: { institutionality: 1 } }, reputation: { jovenes: 1 } }, delayedEffects: [] },
      ],
    };
  }

  if (event.id.includes('ai-layoffs')) {
    return {
      ...common,
      id: `ctx-reconversion-${state.turn}`,
      title: 'MILES DE PERSONAS QUEDAN FUERA DE LA NUEVA AUTOMATIZACION',
      description: 'La tecnologia llego antes que la politica. El gabinete debe decidir si compra tiempo, forma trabajadores o deja que cada empresa resuelva su propia transicion.',
      source,
      urgency: 'alta',
      category: 'social',
      choices: [
        { id: `ctx-reconversion-formar-${state.turn}`, label: 'Crear un fondo de reconversion con empresas', description: 'Las companias aportan, el Estado coordina y los sindicatos controlan la capacitacion.', preview: simplePreview('Empleo futuro', 'Costo fiscal inmediato'), effects: { national: { economy: { reserves: -3, investment: 3 }, society: { education: 4, socialConflicts: -3 } }, reputation: { trabajadores: 7, empresarios: 4 } }, delayedEffects: [{ turnsDelay: 6, probability: 0.8, effects: { national: { society: { employment: 4 }, economy: { gdp: 2 } } }, description: 'La primera camada de trabajadores reconvertidos vuelve a ocupar puestos que parecian perdidos.', sourceDecisionId: `ctx-reconversion-${state.turn}`, originTurn: 0 }] },
        { id: `ctx-reconversion-dejar-${state.turn}`, label: 'Dejar que el mercado absorba el shock', description: 'Evitas crear otra burocracia, pero aceptas meses de incertidumbre y protestas.', preview: simplePreview('Menor gasto publico', 'Mas conflicto social'), effects: { national: { society: { employment: -3, socialConflicts: 8 }, economy: { investment: 4 } }, reputation: { empresarios: 8, trabajadores: -12 } }, delayedEffects: [] },
      ],
    };
  }

  if (event.id.includes('flooded-capital')) {
    return {
      ...common,
      id: `ctx-inundacion-${state.turn}`,
      title: 'LA PERIFERIA PIDE BOMBAS, NO PROMESAS',
      description: 'La emergencia obliga a elegir entre una obra visible que calme las camaras o una reparacion lenta de las cuencas que no tendra inauguracion esta temporada.',
      source,
      urgency: 'alta',
      category: 'ambiental',
      choices: [
        { id: `ctx-inundacion-obra-${state.turn}`, label: 'Financiar obras visibles de emergencia', description: 'Manda bombas y cuadrillas donde las camaras ya estan transmitiendo.', preview: simplePreview('Alivio rapido', 'Obras incompletas'), effects: { national: { economy: { reserves: -5 }, society: { trust: 5, health: 2 } }, reputation: { 'clase-media': 5, ongs: -2 } }, delayedEffects: [] },
        { id: `ctx-inundacion-cuenca-${state.turn}`, label: 'Reparar las cuencas aunque no se vea', description: 'Priorizas drenajes y mantenimiento para que el proximo temporal no encuentre al Estado distraido.', preview: simplePreview('Resiliencia futura', 'Malestar inmediato'), effects: { national: { economy: { reserves: -3, investment: 4 }, society: { trust: -2 } }, reputation: { ongs: 7, 'clase-media': -3 } }, delayedEffects: [{ turnsDelay: 10, probability: 0.75, effects: { national: { economy: { gdp: 3 }, society: { socialConflicts: -5 } } }, description: 'La cuenca reparada evita una segunda inundacion y la obra, por fin, empieza a explicarse sola.', sourceDecisionId: `ctx-inundacion-${state.turn}`, originTurn: 0 }] },
      ],
    };
  }

  return null;
}
