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

export function getEventFamilyId(event: Pick<GameEvent, 'id' | 'familyId'>): string {
  if (event.familyId) return event.familyId;
  const id = event.id;
  if (id.startsWith('ev-life-')) return id.replace(/^ev-life-/, '').replace(/-\d+$/, '');
  if (id.startsWith('ev-sys-')) return id.replace(/^ev-/, '').replace(/-\d+-\d+$/, '');
  if (id.startsWith('ev-reserve-excess-')) return 'reserve-excess';
  if (id.startsWith('ev-fiestas-')) return 'fiestas';
  if (id.startsWith('ev-ano-nuevo-')) return 'ano-nuevo';
  return id.replace(/-\d+$/, '');
}

export function getNarrativeCauseKey(state: Pick<GameState, 'nation' | 'scars' | 'persistentConsequences'>, familyId: string): string {
  const { economy } = state.nation;
  const { society, governance } = state.nation;
  const scars = (state.scars ?? []).map((scar) => scar.familyId ?? scar.id).sort().join(',');
  const consequences = (state.persistentConsequences ?? [])
    .filter((consequence) => !consequence.resolved)
    .map((consequence) => consequence.familyId ?? consequence.id)
    .sort()
    .join(',');
  return [
    familyId,
    `inf:${Math.floor(economy.inflation / 10)}`,
    `res:${Math.floor(economy.reserves / 10)}`,
    `debt:${Math.floor(economy.debt / 10)}`,
    `edu:${Math.floor(society.education / 5)}`,
    `conf:${Math.floor(society.socialConflicts / 10)}`,
    `inst:${Math.floor(governance.institutionality / 10)}`,
    `scars:${scars}`,
    `consequences:${consequences}`,
  ].join('|');
}

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
    title: 'El eclipse oscurece el mediodía y enciende el turismo',
    description: 'Un eclipse cruza la República del Sur. Hoteles agotados, escuelas improvisando clases de astronomía y un gobernador que inaugura una sombra oficial.',
    effects: { national: { economy: { tourism: 5, investment: 2 }, society: { trust: 2 } }, reputation: { jovenes: 5, 'clase-media': 3 } },
  },
  {
    id: 'concert-record',
    category: 'mediatico',
    when: (state) => state.turn > 6 && state.turn % 23 === 0,
    title: 'Un recital desborda la logística nacional',
    description: 'Una banda internacional convoca a cientos de miles. El operativo funciona a medias: la economía nocturna festeja y el transporte pide otro presupuesto.',
    effects: { national: { economy: { tourism: 4, gdp: 1 }, society: { socialConflicts: 2 } }, reputation: { jovenes: 7, trabajadores: -2 } },
  },
  {
    id: 'film-award',
    category: 'internacional',
    when: (state) => state.turn > 8 && state.turn % 29 === 0,
    title: 'Una película del Sur gana un premio inesperado',
    description: 'El cine nacional vuelve del extranjero con un premio. El gobierno quiere colgarse la medalla; la directora pide que primero terminen de pagar el festival.',
    effects: { national: { governance: { internationalImage: 5 }, economy: { tourism: 2 } }, reputation: { jovenes: 4, prensa: 3 } },
  },
  {
    id: 'ai-layoffs',
    category: 'social',
    when: (state) => state.turn > 10 && state.turn % 31 === 0,
    title: 'La inteligencia artificial deja miles de puestos en pausa',
    description: 'Una plataforma automatiza tareas administrativas en todo el país. Las empresas celebran productividad; los sindicatos preguntan quién entrenará a la gente que queda afuera.',
    effects: { national: { economy: { investment: 5, gdp: 2 }, society: { employment: -4, socialConflicts: 6 } }, reputation: { trabajadores: -8, jovenes: 5, empresarios: 5 } },
  },
  {
    id: 'network-scandal',
    category: 'mediatico',
    when: (state) => state.turn > 12 && state.turn % 37 === 0,
    title: 'Una red social nueva cambia la campaña en una semana',
    description: 'Una aplicación convierte cualquier discurso en una encuesta instantánea. Un streamer instala un escándalo antes de que el gabinete encuentre el botón de silenciar.',
    effects: { national: { governance: { institutionality: -2 }, society: { polarization: 5 } }, reputation: { prensa: -3, jovenes: 4 } },
  },
  {
    id: 'flooded-capital',
    category: 'ambiental',
    when: (state) => state.turn > 14 && state.turn % 41 === 0,
    title: 'Una inundación convierte la periferia en archipiélago',
    description: 'Lluvias extraordinarias desbordan tres cuencas. Un intendente transmite desde un bote y promete inaugurar el mismo puente apenas baje el agua.',
    effects: { national: { economy: { gdp: -3, investment: -2 }, society: { health: -2, trust: -4, socialConflicts: 5 } }, reputation: { 'clase-media': -5, ongs: -3 } },
  },
  // ─── CATÁSTROFES NATURALES (nuevas) ───
  {
    id: 'delta-fires',
    category: 'ambiental',
    when: (state) => (state.calendar.season === 'Verano' || state.calendar.season === 'Primavera') && state.turn > 8 && state.turn % 17 === 0,
    title: 'Incendios en el delta fluvial sin control',
    description: 'Las llamas consumen miles de hectáreas del humedal. La columna de humo llega a la capital. Pescadores, productores y comunidades originarias piden ayuda urgente mientras el viento cambia de dirección.',
    effects: { national: { economy: { gdp: -2, tourism: -4 }, society: { health: -3, trust: -5, socialConflicts: 4 } }, reputation: { ongs: -6, 'clase-media': -4, campo: -3 } },
  },
  {
    id: 'drought-pampa',
    category: 'ambiental',
    when: (state) => (state.calendar.season === 'Verano' || state.calendar.season === 'Otoño') && state.nation.economy.reserves < 55 && state.turn % 13 === 0,
    title: 'Sequía histórica golpea la Pampa Agrícola',
    description: 'La falta de lluvias reduce la cosecha a la mitad. El campo pide fondos de emergencia; el gobierno debate si asistir al sector o priorizar el consumo interno.',
    effects: { national: { economy: { gdp: -4, reserves: -5 }, society: { poverty: 3, socialConflicts: 5 } }, reputation: { campo: -8, trabajadores: -4, mercados: -5 } },
  },
  {
    id: 'hailstorm-wineries',
    category: 'ambiental',
    when: (state) => state.calendar.season === 'Primavera' && state.turn > 6 && state.turn % 11 === 0,
    title: 'Granizo destruye viñedos y frutales en Cuyo',
    description: 'Una tormenta de granizo arrasa con cultivos de exportación. Los seguros no alcanzan y los productores exigen que el Estado declare la emergencia agropecuaria.',
    effects: { national: { economy: { gdp: -2, investment: -3 } }, reputation: { campo: -10, 'clase-media': -2 } },
  },
  {
    id: 'bridge-collapse',
    category: 'social',
    when: (state) => state.turn > 20 && state.nation.economy.gdp < 45 && state.turn % 19 === 0,
    title: 'Colapso de puente en una ruta nacional',
    description: 'Un puente sobre la ruta troncal cede por falta de mantenimiento. Tres camiones caen al río. La oposición exhibe el informe de auditoría que advertía el riesgo desde hace dos años.',
    effects: { national: { economy: { investment: -4, gdp: -2 }, governance: { institutionality: -5 }, society: { trust: -8, socialConflicts: 6 } }, reputation: { 'clase-media': -7, prensa: -4 } },
  },
  {
    id: 'rail-derailment',
    category: 'social',
    when: (state) => state.turn > 18 && state.turn % 27 === 0,
    title: 'Descarrilamiento en el corredor ferroviario del centro',
    description: 'Una formación de carga descarrila por una falla de mantenimiento. No hay una explicación única: la empresa culpa a la señalización y la auditoría encuentra advertencias archivadas.',
    effects: { national: { economy: { gdp: -2, investment: -3 }, governance: { institutionality: -4 }, society: { trust: -5, socialConflicts: 4 } }, reputation: { trabajadores: -5, prensa: -5 } },
  },
  {
    id: 'civic-center-attack',
    category: 'politico',
    when: (state) => state.turn > 24 && state.turn % 53 === 0,
    title: 'Ataque contra un centro cívico deja al país en alerta',
    description: 'Una explosión en un edificio público provoca víctimas y conmoción nacional. El origen sigue bajo investigación; el gobierno debe proteger a la población sin convertir el dolor en excusa para saltarse la ley.',
    effects: { national: { governance: { institutionality: -3 }, society: { trust: -8, socialConflicts: 7, health: -2 } }, reputation: { prensa: 4, 'clase-media': -6 } },
  },
  {
    id: 'blackout-winter',
    category: 'ambiental',
    when: (state) => state.calendar.season === 'Invierno' && state.nation.economy.reserves < 40 && state.turn % 7 === 0,
    title: 'Apagón de doce horas en tres regiones',
    description: 'La red eléctrica colapsa bajo la demanda invernal. Hospitales funcionan con generadores; fábricas pierden turnos de producción. El ministro de energía aparece en cadena nacional con cara de no haber dormido.',
    effects: { national: { economy: { gdp: -3, investment: -2 }, society: { health: -2, trust: -6, socialConflicts: 8 } }, reputation: { industria: -8, 'clase-media': -6, trabajadores: -5 } },
  },
  {
    id: 'cyber-attack',
    category: 'politico',
    when: (state) => state.turn > 15 && state.turn % 43 === 0,
    title: 'Ataque cibernético al sistema de pagos del Estado',
    description: 'Hackers comprometieron los servidores de la agencia tributaria. Los sueldos públicos se demoran 72 horas; los jubilados no pueden cobrar. El origen del ataque es incierto.',
    effects: { national: { governance: { institutionality: -6, corruption: 3 }, society: { trust: -7 } }, reputation: { prensa: 5, 'clase-media': -5 } },
  },
  {
    id: 'diplomatic-incident',
    category: 'internacional',
    when: (state) => state.nation.governance.internationalImage < 45 && state.turn > 12 && state.turn % 23 === 0,
    title: 'Incidente diplomático con país vecino',
    description: 'Un funcionario realizó declaraciones que el gobierno vecino calificó de inaceptables. La cancillería convoca al embajador; el episodio agita las redes y preocupa al sector exportador.',
    effects: { national: { governance: { internationalImage: -8 }, economy: { investment: -3 } }, reputation: { mercados: -4, jovenes: 3 } },
  },
  {
    id: 'university-protest',
    category: 'social',
    when: (state) => state.nation.society.education < 50 && state.turn > 8 && state.turn % 17 === 0,
    title: 'Toma de facultades por recorte presupuestario',
    description: 'Estudiantes ocupan las principales universidades en protesta por el congelamiento de partidas. Las clases se suspenden; los rectores piden una reunión urgente con el Ministerio.',
    effects: { national: { society: { socialConflicts: 7, education: -3 }, governance: { institutionality: -2 } }, reputation: { universidades: -10, jovenes: -8, 'clase-media': -3 } },
  },
  {
    id: 'science-breakthrough',
    category: 'social',
    when: (state) => state.nation.society.education > 55 && state.turn > 16 && state.turn % 37 === 0,
    title: 'Investigadores locales logran un avance tecnológico',
    description: 'Un equipo de científicos publica un hallazgo que atrae atención internacional. Las universidades piden presupuesto para sostenerlo; las empresas tecnológicas ofrecen contratos.',
    effects: { national: { governance: { internationalImage: 6 }, economy: { investment: 4 } }, reputation: { universidades: 12, jovenes: 8, empresarios: 5 } },
  },
  {
    id: 'oil-spill',
    category: 'ambiental',
    when: (state) => state.turn > 10 && state.turn % 31 === 0,
    title: 'Derrame de crudo en el litoral atlántico',
    description: 'Una tubería submarina de una concesionaria petrolífera cedió. La marea negra avanza sobre la costa turística. Las imágenes dan vuelta al mundo en horas.',
    effects: { national: { economy: { tourism: -8, gdp: -2 }, society: { health: -3, trust: -6 }, governance: { internationalImage: -7 } }, reputation: { ongs: -8, 'clase-media': -5, campo: -4 } },
  },
  {
    id: 'teachers-wildcat-strike',
    category: 'social',
    when: (state) => state.reputation.docentes < 40 && state.turn > 6 && state.turn % 11 === 0,
    title: 'Paro docente salvaje sin acuerdo sindical',
    description: 'Sin esperar la paritaria, decenas de escuelas paran por tiempo indeterminado. Los padres organizan guarderías improvisadas; la oposición pide interpelación al ministro de educación.',
    effects: { national: { society: { education: -5, socialConflicts: 8 } }, reputation: { docentes: -12, 'clase-media': -6 } },
  },
  {
    id: 'inflation-protest',
    category: 'social',
    when: (state) => state.nation.economy.inflation > 65 && state.turn % 9 === 0,
    title: 'Cacerolazo espontáneo por el precio de la canasta básica',
    description: 'Sin convocatoria oficial, ciudadanos salen a golpear cacerolas en toda la capital. El reclamo es simple: los precios no paran y los sueldos no alcanzan.',
    effects: { national: { society: { socialConflicts: 10, trust: -8 } }, reputation: { trabajadores: -6, 'clase-media': -8 }, character: { popularity: -5 } },
  },
  {
    id: 'banking-run',
    category: 'economico',
    when: (state) => state.nation.economy.reserves < 30 && state.nation.economy.inflation > 55 && state.turn % 13 === 0,
    title: 'Corrida bancaria en las sucursales del centro',
    description: 'Largas filas frente a los bancos. Los ahorristas retiran depósitos en divisas ante rumores de restricciones. El Banco Central emite un comunicado que nadie termina de leer.',
    effects: { national: { economy: { reserves: -8, inflation: 5, investment: -10 }, society: { trust: -10, socialConflicts: 8 } }, reputation: { mercados: -15, 'clase-media': -10 } },
  },
  {
    id: 'port-workers-strike',
    category: 'social',
    when: (state) => state.reputation.trabajadores < 40 && state.turn % 7 === 0,
    title: 'Paro portuario interrumpe exportaciones',
    description: 'Los trabajadores de los principales puertos paralizan operaciones en demanda de mejores condiciones. Los granos se acumulan en los silos; cada día de paro cuesta millones en divisas no liquidadas.',
    effects: { national: { economy: { reserves: -4, gdp: -2 } }, reputation: { trabajadores: -8, campo: -5, empresarios: -4 } },
  },
  {
    id: 'prison-riot',
    category: 'social',
    when: (state) => state.nation.society.insecurity > 60 && state.turn % 17 === 0,
    title: 'Motín en el mayor penal federal',
    description: 'Presos toman rehenes en protesta por el hacinamiento y la falta de atención médica. El operativo de negociación dura dos días; la cobertura televisiva es permanente.',
    effects: { national: { governance: { institutionality: -4 }, society: { insecurity: 5, trust: -6 } }, reputation: { 'fuerzas-seguridad': -8, prensa: 3 } },
  },
  {
    id: 'tech-startup-boom',
    category: 'economico',
    when: (state) => state.nation.society.education > 50 && state.nation.economy.inflation < 55 && state.turn % 29 === 0,
    title: 'Eclosión de startups tecnológicas en el sur',
    description: 'Una cohorte de empresas de software atrae inversión regional. Los jóvenes profesionales que antes emigraban empiezan a quedarse. Las universidades piden alianzas; los sindicatos preguntan qué derechos laborales aplicarán.',
    effects: { national: { economy: { investment: 7, gdp: 3 } }, reputation: { jovenes: 10, universidades: 6, empresarios: 5 }, character: { popularity: 3 } },
  },
];


const CAMPAIGN_EVENTS: Array<{
  id: string;
  category: EventCategory;
  when: (state: GameState) => boolean;
  title: string;
  description: string;
  effects: GameEvent['effects'];
}> = [
  {
    id: 'campaign-dossier',
    category: 'mediatico',
    when: (state) => state.calendar.turnsUntilLegislative <= 7 || state.calendar.turnsUntilPresidential <= 7,
    title: 'Aparece una carpeta con la fecha de la elección en la tapa',
    description: 'Un sobre sin remitente llega a tres redacciones al mismo tiempo. Contiene contratos viejos, una foto borrosa y una frase que nadie quiere firmar: acá empezó todo.',
    effects: { national: { governance: { institutionality: -2 }, society: { polarization: 5 } }, reputation: { prensa: 4, 'clase-media': -3 } },
  },
  {
    id: 'campaign-influencer',
    category: 'mediatico',
    when: (state) => state.calendar.turnsUntilLegislative <= 5 || state.calendar.turnsUntilPresidential <= 5,
    title: 'Un influencer cambia de candidato durante una transmisión en vivo',
    description: 'La persona que ayer te llamaba estadista hoy te llama "administrador de consorcio" ante una audiencia más grande que la de los canales de noticias.',
    effects: { national: { society: { polarization: 4 } }, reputation: { jovenes: -5, prensa: 3 }, character: { popularity: -3 } },
  },
  {
    id: 'campaign-carpetazo',
    category: 'politico',
    when: (state) => state.calendar.turnsUntilLegislative <= 3 || state.calendar.turnsUntilPresidential <= 3,
    title: 'El carpetazo de campaña se cae antes del debate',
    description: 'La oposición anuncia una denuncia histórica y la archiva antes de leerla. El archivo igual se filtra, porque en la República del Sur hasta los carpetazos tienen copias de seguridad.',
    effects: { national: { governance: { institutionality: 2 }, society: { polarization: -2 } }, reputation: { prensa: 6, 'clase-media': 3 } },
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

  if (state.nation.economy.reserves >= 98) {
    return {
      id: `ev-reserve-excess-${state.calendar.year}-${turn}`,
      title: 'RESERVAS AL 100%: EL SUPERÁVIT DESPIERTA APETITOS',
      description: 'El Banco Central informa una acumulación extraordinaria de reservas. En pocas horas aparecen pedidos de obra, bonos, subsidios y proveedores que recuerdan que hasta una caja llena puede romperse si todos meten la mano al mismo tiempo.',
      category: 'economico',
      effects: { national: { economy: { reserves: -3, investment: -1 }, governance: { corruption: 2 } }, reputation: { empresarios: 3, 'clase-media': -2 } },
      turnOccurred: turn,
    };
  }

  if (state.calendar.month === 12 && state.calendar.fortnight === 2) {
    return {
      id: `ev-fiestas-${state.calendar.year}`,
      title: 'FIESTAS DE FIN DE AÑO: EL PAÍS PIDE UNA TREGUA',
      description: 'Las familias se preparan para las fiestas mientras municipios, sindicatos y hospitales reclaman fondos para sostener guardias, canastas y transporte. La celebración llega con luces, aguinaldos y una cuenta que alguien tendrá que pagar.',
      category: 'social',
      effects: { national: { economy: { reserves: -2 }, society: { trust: 2, socialConflicts: 3 } }, reputation: { jubilados: 3, trabajadores: 4, mercados: -2 } },
      turnOccurred: turn,
    };
  }

  if (state.calendar.month === 1 && state.calendar.fortnight === 1) {
    return {
      id: `ev-ano-nuevo-${state.calendar.year}`,
      title: 'AÑO NUEVO: EL TEMPORAL DEJA A TRES PROVINCIAS SIN LUZ',
      description: 'El primer amanecer del año encuentra rutas anegadas, barrios sin electricidad y una ola de reclamos en redes. Los gobernadores piden ayuda urgente; las empresas eléctricas responden con comunicados que nadie logra leer antes de que vuelva a llover.',
      category: 'ambiental',
      effects: { national: { economy: { reserves: -5, investment: -2 }, society: { health: -2, trust: -3, socialConflicts: 5 } }, reputation: { 'clase-media': -4, ongs: 4 } },
      turnOccurred: turn,
    };
  }

  const lifeCandidates = [...NATIONAL_LIFE_EVENTS, ...CAMPAIGN_EVENTS].filter((candidate) =>
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

const CONTEXTUAL_TITLE_VARIANTS: Record<string, string[]> = {
  'ctx-energia': [
    'OLA POLAR: LA RED ENTRA EN SEMANA CRÍTICA',
    'ENERGÍA: EL INVIERNO VUELVE CON UNA CUENTA PENDIENTE',
    'ENERGÍA: LA RED YA NO SOPORTA OTRO INVIERNO IGUAL',
  ],
  'ctx-reserve-excess': [
    'CAJA LLENA, MANOS ABIERTAS: ¿QUIÉN ADMINISTRA EL SOBRANTE?',
    'EL SOBRANTE TIENE MEMORIA: AUDITAR, GASTAR O PRESERVAR',
    'LA ABUNDANCIA SE VUELVE POLÍTICA DE ESTADO',
  ],
  'ctx-fiestas': [
    'FIESTAS: UNA NOCHE DE PAZ TAMBIÉN SE PRESUPUESTA',
    'FIESTAS: EL CUIDADO YA TIENE UNA CUENTA PENDIENTE',
    'FIESTAS: LA RED FEDERAL PIDE RENOVARSE',
  ],
  'ctx-ano-nuevo': [
    'AÑO NUEVO: LAS PROVINCIAS PIDEN AYUDA ANTES DEL PRIMER BRINDIS',
    'AÑO NUEVO: EL TEMPORAL VUELVE, PERO EL PAÍS RECUERDA',
    'AÑO NUEVO: LA EMERGENCIA YA NO ADMITE LA MISMA RESPUESTA',
  ],
  'ctx-talento': [
    'EMPRESAS TECNOLÓGICAS NO CONSIGUEN PERSONAL',
    'LA ESCASEZ DE TALENTO YA TRABA LA COMPETITIVIDAD',
    'LAS EMPRESAS CAMBIAN DE PAÍS POR LA FALTA DE PROFESIONALES',
  ],
  'ctx-absurdo': [
    'EL PAPELÓN MUNICIPAL LLEGA A LA CASA DE GOBIERNO',
    'LA TORPEZA LOCAL SE CONVIERTE EN EXPEDIENTE NACIONAL',
    'EL PAÍS YA RECONOCE EL PATRÓN DEL PAPELÓN',
  ],
  'ctx-reconversion': [
    'MILES DE PERSONAS QUEDAN FUERA DE LA NUEVA AUTOMATIZACIÓN',
    'DESPUÉS DE LA AUTOMATIZACIÓN, EL TRABAJO PIDE UNA SEGUNDA RESPUESTA',
    'LA RECONVERSIÓN SE DISCUTE COMO POLÍTICA PERMANENTE',
  ],
  'ctx-inundacion': [
    'LA PERIFERIA PIDE BOMBAS, NO PROMESAS',
    'LA CUENCA VUELVE A HABLAR: LA OBRA PENDIENTE YA TIENE HISTORIA',
    'EL TEMPORAL PRUEBA SI EL ESTADO APRENDIÓ',
  ],
};

function applyNarrativeVariant(decision: Decision, familyId: string, state: GameState): Decision {
  const occurrenceCount = state.decisionHistory.filter((entry) => (entry.familyId ?? entry.id) === familyId).length;
  if (occurrenceCount === 0) return decision;

  const variants = CONTEXTUAL_TITLE_VARIANTS[familyId] ?? [];
  const variantTitle = variants[Math.min(occurrenceCount, variants.length - 1)];
  const title = variantTitle
    ? occurrenceCount >= variants.length ? `${variantTitle} · Fase ${occurrenceCount + 1}` : variantTitle
    : `CONTINUIDAD: ${decision.title} · Fase ${occurrenceCount + 1}`;
  return {
    ...decision,
    title,
    description: `${decision.description} El país conserva el antecedente de esta historia; las condiciones cambiaron y por eso vuelve con otra manifestación.`,
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
  const common = (familyId: string) => ({
    repeatable: false,
    cooldown: 0,
    requirements: [],
    sourceActorId: actorId,
    familyId,
    causeKey: getNarrativeCauseKey(state, familyId),
    parentHistoryId: event.id,
  });
  const canRecur = (familyId: string) => !state.decisionHistory.some((entry) =>
    (entry.familyId ?? entry.id) === familyId
      && entry.causeKey === getNarrativeCauseKey(state, familyId),
  );
  const simplePreview = (gain: string, loss: string) => ({
    gains: [{ icon: '✓', label: gain, magnitude: 'moderado' as const }],
    losses: [{ icon: '⚠', label: loss, magnitude: 'moderado' as const }],
    risks: [],
    beneficiaries: [],
    opponents: [],
  });

  if (state.calendar.season === 'Invierno' && state.nation.economy.reserves < 55 && canRecur('ctx-energia')) {
    return applyNarrativeVariant({
      ...common('ctx-energia'),
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
    }, 'ctx-energia', state);
  }

  if (event.id.includes('reserve-excess') && canRecur('ctx-reserve-excess')) {
    return applyNarrativeVariant({
      ...common('ctx-reserve-excess'),
      id: `ctx-reserve-excess-${state.turn}`,
      title: 'CAJA LLENA, MANOS ABIERTAS: ¿QUIÉN ADMINISTRA EL SOBRANTE?',
      description: 'El superávit extraordinario convirtió al Tesoro en una tentación nacional. Si repartís sin control, la abundancia se vuelve contratos inflados; si no hacés nada, la calle interpreta que acumulás mientras faltan servicios.',
      source,
      urgency: 'alta',
      category: 'economico',
      choices: [
        { id: `ctx-reserve-audit-${state.turn}`, label: 'Auditar y crear un fondo de contingencia', description: 'Reservás una parte para catástrofes y publicás cada compromiso antes de gastarlo.', preview: simplePreview('Control institucional', 'Obras demoradas'), effects: { national: { economy: { reserves: -5, investment: 2 }, governance: { institutionality: 4, corruption: -4 } }, reputation: { 'clase-media': 5, empresarios: -3 } }, delayedEffects: [] },
        { id: `ctx-reserve-spend-${state.turn}`, label: 'Lanzar un plan de obras y alivio inmediato', description: 'La plata sale rápido hacia rutas, hospitales y tarifas. La gente ve movimiento; los contratistas también.', preview: simplePreview('Alivio visible', 'Riesgo de sobreprecios'), effects: { national: { economy: { reserves: -14, investment: 7 }, society: { health: 3, trust: 5 } }, reputation: { trabajadores: 7, empresarios: 5 } }, delayedEffects: [{ turnsDelay: 8, probability: 0.55, effects: { national: { governance: { corruption: 7 } } }, description: 'Una licitación de emergencia termina con tres empresas recién creadas y un expediente que huele a apuro.', sourceDecisionId: `ctx-reserve-excess-${state.turn}`, originTurn: 0 }] },
        { id: `ctx-reserve-preserve-${state.turn}`, label: 'Congelar el sobrante y defender la caja', description: 'No cedés a la fiesta del gasto. La reserva queda protegida, aunque el gobierno parece estar pintando la casa mientras se cae una puerta.', preview: simplePreview('Colchón financiero', 'Malestar social'), effects: { national: { economy: { reserves: -3, gdp: -1 } }, reputation: { mercados: 6, trabajadores: -7, jubilados: -5 }, character: { popularity: -3, pragmatismo: 4 } }, delayedEffects: [] },
      ],
    }, 'ctx-reserve-excess', state);
  }

  if (event.id.includes('fiestas-') && canRecur('ctx-fiestas')) {
    return applyNarrativeVariant({
      ...common('ctx-fiestas'),
      id: `ctx-fiestas-${state.turn}`,
      title: 'FIESTAS: UNA NOCHE DE PAZ TAMBIÉN SE PRESUPUESTA',
      description: 'Los intendentes quieren una canasta de emergencia y transporte nocturno; los hospitales piden guardias reforzadas. La tradición dice brindar. El expediente pregunta cuánto cuesta que nadie quede afuera.',
      source,
      urgency: 'media',
      category: 'social',
      choices: [
        { id: `ctx-fiestas-canasta-${state.turn}`, label: 'Financiar una red de cuidados y canastas', description: 'El Estado sostiene a los hogares más frágiles y garantiza servicios durante las celebraciones.', preview: simplePreview('Protección social', 'Menos reservas'), effects: { national: { economy: { reserves: -7 }, society: { trust: 6, poverty: -2 } }, reputation: { trabajadores: 7, jubilados: 6 } }, delayedEffects: [] },
        { id: `ctx-fiestas-guardia-${state.turn}`, label: 'Cubrir solo hospitales y seguridad', description: 'Priorizás lo indispensable y dejás que municipios, clubes y familias resuelvan el resto.', preview: simplePreview('Servicios críticos', 'Fiestas desiguales'), effects: { national: { economy: { reserves: -3 }, society: { trust: 1, socialConflicts: 2 } }, reputation: { mercados: 3, trabajadores: -3 } }, delayedEffects: [] },
      ],
    }, 'ctx-fiestas', state);
  }

  if (event.id.includes('ano-nuevo-') && canRecur('ctx-ano-nuevo')) {
    return applyNarrativeVariant({
      ...common('ctx-ano-nuevo'),
      id: `ctx-ano-nuevo-${state.turn}`,
      title: 'AÑO NUEVO: LAS PROVINCIAS PIDEN AYUDA ANTES DEL PRIMER BRINDIS',
      description: 'La catástrofe eléctrica y las inundaciones obligan a decidir si el gobierno nacional centraliza la respuesta o entrega recursos para que cada provincia actúe por su cuenta.',
      source,
      urgency: 'critica',
      category: 'ambiental',
      choices: [
        { id: `ctx-ano-nuevo-coordinar-${state.turn}`, label: 'Coordinar un operativo federal de emergencia', description: 'Movilizás fondos, cuadrillas y hospitales con un mando único para recuperar servicios básicos.', preview: simplePreview('Respuesta rápida', 'Costo fiscal'), effects: { national: { economy: { reserves: -9, investment: 3 }, society: { health: 5, trust: 5, socialConflicts: -4 } }, reputation: { 'clase-media': 6, ongs: 3 } }, delayedEffects: [] },
        { id: `ctx-ano-nuevo-provincias-${state.turn}`, label: 'Transferir fondos y dejar que cada provincia resuelva', description: 'Mandás recursos con autonomía local; la velocidad puede mejorar, pero también las desigualdades entre gobernadores.', preview: simplePreview('Federalismo operativo', 'Respuesta desigual'), effects: { national: { economy: { reserves: -6 }, governance: { institutionality: 2 } }, reputation: { campo: 4, 'clase-media': -3 } }, delayedEffects: [] },
      ],
    }, 'ctx-ano-nuevo', state);
  }

  if (state.nation.society.education < 54 && state.turn > 18 && canRecur('ctx-talento')) {
    return applyNarrativeVariant({
      ...common('ctx-talento'),
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
    }, 'ctx-talento', state);
  }

  if (event.category === 'satirico' && chance(rng, 0.45) && canRecur('ctx-absurdo')) {
    return applyNarrativeVariant({
      ...common('ctx-absurdo'),
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
    }, 'ctx-absurdo', state);
  }

  if (event.id.includes('ai-layoffs') && canRecur('ctx-reconversion')) {
    return applyNarrativeVariant({
      ...common('ctx-reconversion'),
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
    }, 'ctx-reconversion', state);
  }

  if (event.id.includes('flooded-capital') && canRecur('ctx-inundacion')) {
    return applyNarrativeVariant({
      ...common('ctx-inundacion'),
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
    }, 'ctx-inundacion', state);
  }

  return null;
}
