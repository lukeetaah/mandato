/**
 * MI MANDATO — Datos Estáticos del Universo (Geografía y Economía Sistémica)
 *
 * 8 Provincias de la República del Sur diseñadas con rigor tecno-económico y geográfico.
 * Estilo editorial unificado en español correcto.
 */

import type {
  CareerStage,
  CharacterLore,
  EducationLevel,
  HousingType,
  IdeologyProfile,
  Party,
  Province,
  ProvinceEconomy,
  ReputationGroup,
} from './types';

const ideology = (overrides: Partial<IdeologyProfile> = {}): IdeologyProfile => ({
  economy: 0,
  stateSize: 0,
  security: 0,
  education: 0,
  environment: 0,
  trade: 0,
  industry: 0,
  liberties: 0,
  federalism: 0,
  foreignRelations: 0,
  technology: 0,
  health: 0,
  culture: 0,
  ...overrides,
});

const provinceEconomy = (overrides: Partial<ProvinceEconomy> = {}): ProvinceEconomy => ({
  gdp: 50,
  employment: 50,
  poverty: 40,
  investment: 40,
  infrastructure: 45,
  publicDebt: 50,
  ...overrides,
});

// ─────────────────────────────────────────────
// Personajes prediseñados (Arquetipos históricos)
// ─────────────────────────────────────────────

export interface CharacterPreset {
  id: string;
  title: string;
  description: string;
  name: string;
  surname: string;
  age: number;
  province: string;
  profession: string;
  education: EducationLevel;
  partyId: string;
  traits: {
    charisma: number;
    honesty: number;
    ambition: number;
    empathy: number;
    oratory: number;
    strategy: number;
  };
  backstory: string;
  lore: CharacterLore;
  avatarId: string;
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: 'preset-idealista',
    title: 'El académico reformista',
    description: 'Profesor universitario con alto carisma y principios éticos. Habla como si todavía estuviera frente a un aula, aunque ahora la clase sea un país entero.',
    name: 'Esteban',
    surname: 'Morales',
    age: 41,
    province: 'sierras-centro',
    profession: 'Docente',
    education: 'posgrado',
    partyId: 'partido-verde',
    traits: { charisma: 75, honesty: 85, ambition: 45, empathy: 80, oratory: 80, strategy: 40 },
    backstory: 'Construyó su notoriedad pública encabezando debates de ética republicana en aulas magnas antes de saltar a la política.',
    avatarId: 'morales',
    lore: {
      personality: 'Sereno, didáctico y obstinado. Le cuesta aceptar que una verdad bien explicada no siempre alcanza para gobernar.',
      motivation: 'Quiere demostrar que el Estado puede recuperar confianza sin vender su conciencia en cada negociación.',
      strengths: ['Empatía pública', 'oratoria clara', 'reputación honesta'],
      weaknesses: ['Ingenuidad táctica', 'lentitud para castigar traiciones', 'rechazo visceral a la rosca'],
      powerRelationship: 'Ve el poder como una herramienta prestada: útil, peligrosa y siempre bajo examen moral.',
      moneyRelationship: 'Creció contando monedas. Desconfía del lujo, pero subestima la fuerza política del dinero organizado.',
      peopleRelationship: 'Escucha con paciencia y suele recordar nombres, barrios y reclamos concretos.',
      institutionRelationship: 'Respeta las instituciones casi como una fe civil, incluso cuando lo dejan solo.',
      familyStory: 'Hijo de una directora de escuela pública y de un técnico ferroviario que perdió el trabajo en una privatización.',
      parents: 'Alicia Roldán, docente; Ernesto Morales, trabajador ferroviario.',
      originClass: 'Clase media trabajadora de las Sierras del Centro.',
      childhoodEvent: 'A los diez años vio a su padre volver con la caja de herramientas y sin empleo; desde entonces asocia política con dignidad cotidiana.',
      adultTurningPoint: 'Una represión a estudiantes durante una protesta universitaria lo llevó de las aulas al Congreso.',
      politicalOrigin: 'Llegó a la política organizando foros de transparencia y educación pública.',
      pathToPresidency: 'Una coalición ambiental, universitaria y urbana lo empujó como figura limpia tras una seguidilla de escándalos.',
      mandateGoal: 'Dejar instituciones menos opacas y un sistema educativo que no dependa del heroísmo docente.',
      fear: 'Descubrir que la honestidad puede ser recordada como impotencia.',
      personalContradiction: 'Predica diálogo, pero cuando siente que algo es injusto se vuelve inflexible.',
      signaturePhrase: 'El poder no absuelve: obliga.',
    },
  },
  {
    id: 'preset-heredero',
    title: 'El heredero de aparato',
    description: 'Nacido en una familia patricia de la política. Domina la estrategia de pasillo y sabe cuándo sonreír antes de cerrar una puerta.',
    name: 'Ignacio',
    surname: 'Alvear',
    age: 32,
    province: 'pampa-humeda',
    profession: 'Abogado/a',
    education: 'universitario',
    partyId: 'partido-tradicional',
    traits: { charisma: 60, honesty: 35, ambition: 90, empathy: 30, oratory: 65, strategy: 85 },
    backstory: 'Conoce los pasillos del poder desde la infancia. Su apellido abre puertas, despierta sospechas y todavía pesa en cada foto oficial.',
    avatarId: 'alvear',
    lore: {
      personality: 'Encantador cuando conviene, calculador cuando importa. Nunca entra a una reunión sin saber quién necesita qué.',
      motivation: 'Quiere probar que no heredó un apellido: heredó un método para sostener el Estado en pie.',
      strengths: ['Lectura del poder', 'negociación de élite', 'disciplina partidaria'],
      weaknesses: ['Baja empatía', 'opacidad patrimonial', 'dependencia del aparato'],
      powerRelationship: 'Lo trata como un idioma familiar. No lo romantiza: lo usa.',
      moneyRelationship: 'Cree que el dinero siempre tiene dueño y agenda. Prefiere tenerlo cerca antes que enfrente.',
      peopleRelationship: 'Conoce a la población por encuestas, punteros y recorridas cuidadosamente armadas.',
      institutionRelationship: 'Respeta las formas institucionales mientras no bloqueen la gobernabilidad de su coalición.',
      familyStory: 'Nieto de un gobernador recordado por obras y contratos. Hijo de una senadora y de un empresario agroindustrial.',
      parents: 'Mercedes Alvear, senadora; Raúl Sáenz, empresario cerealero.',
      originClass: 'Alta burguesía política de la Pampa Agrícola Central.',
      childhoodEvent: 'A los doce años escuchó una negociación de madrugada durante una crisis provincial y entendió que las leyes también tienen backstage.',
      adultTurningPoint: 'La muerte política de su padrino en un escándalo de obra pública lo obligó a construir una base propia.',
      politicalOrigin: 'Empezó administrando campañas y listas legislativas del Partido Tradicional.',
      pathToPresidency: 'Unificó intendentes, gobernadores y donantes cuando el país pidió orden más que épica.',
      mandateGoal: 'Conservar poder suficiente para reformar sin perder el control territorial.',
      fear: 'Ser recordado como otro apellido caro que usó el Estado como herencia.',
      personalContradiction: 'Dice que cree en la República, pero siente alivio cuando nadie mira los detalles.',
      signaturePhrase: 'La pureza no firma presupuestos.',
    },
  },
  {
    id: 'preset-tecnocrata',
    title: 'La tecnócrata de la capital',
    description: 'Economista formada en finanzas internacionales. Lee el país como una matriz de riesgos, pero el país insiste en contestarle con biografías.',
    name: 'Lucía',
    surname: 'Santillán',
    age: 46,
    province: 'capital-federal',
    profession: 'Economista',
    education: 'posgrado',
    partyId: 'coalicion-tecnologica',
    traits: { charisma: 45, honesty: 65, ambition: 75, empathy: 35, oratory: 55, strategy: 80 },
    backstory: 'Dirigió consultoras privadas de riesgo macroeconómico antes de ser convocada para ordenar las cuentas provinciales.',
    avatarId: 'santillan',
    lore: {
      personality: 'Precisa, reservada y exigente. Tolera mejor un gráfico hostil que una consigna improvisada.',
      motivation: 'Quiere estabilizar un país que, según ella, se acostumbró demasiado a negociar con la emergencia.',
      strengths: ['Planificación', 'credibilidad técnica', 'frialdad ante la presión'],
      weaknesses: ['Distancia social', 'dificultad para narrar sacrificios', 'poca paciencia con la política territorial'],
      powerRelationship: 'Lo considera una consola de mando: no busca carisma, busca control de variables críticas.',
      moneyRelationship: 'Entiende su circulación y su miedo. No lo admira, pero sabe que cuando huye arrastra gobiernos.',
      peopleRelationship: 'Le importa la población, aunque a menudo la ve a través de indicadores antes que de rostros.',
      institutionRelationship: 'Defiende reglas estables, auditorías y autonomía técnica por encima del aplauso inmediato.',
      familyStory: 'Hija de una médica de guardia y de un contador público que quebró durante una corrida cambiaria.',
      parents: 'Silvia Correa, médica; Daniel Santillán, contador.',
      originClass: 'Clase media profesional del Distrito Federal Metropolitano.',
      childhoodEvent: 'En una hiperinflación familiar, vio a su madre cambiar guardias por mercadería; nunca olvidó el sonido de una caja registradora remarcando precios.',
      adultTurningPoint: 'Como funcionaria provincial, evitó un default chico y ganó enemigos grandes.',
      politicalOrigin: 'Entró como técnica independiente y terminó armando una coalición de gestión con intendentes jóvenes.',
      pathToPresidency: 'La crisis de reservas convirtió su obsesión por la estabilidad en oferta electoral.',
      mandateGoal: 'Bajar la incertidumbre hasta que planificar vuelva a ser una costumbre civil.',
      fear: 'Que sus números mejoren justo cuando la calle decida que el costo fue imperdonable.',
      personalContradiction: 'Dice no creer en símbolos, pero cuida cada gesto porque sabe que los mercados también leen teatro.',
      signaturePhrase: 'La estabilidad también es una política social.',
    },
  },
  {
    id: 'preset-sindical',
    title: 'El caudillo de los trabajadores',
    description: 'Líder gremial surgido desde las bases fabriles. Sabe hablarle a una plaza y también a una mesa chica que no quiere escucharlo.',
    name: 'Marcos',
    surname: 'Benítez',
    age: 53,
    province: 'litoral-subtropical',
    profession: 'Sindicalista',
    education: 'secundario',
    partyId: 'movimiento-popular',
    traits: { charisma: 85, honesty: 50, ambition: 80, empathy: 70, oratory: 85, strategy: 60 },
    backstory: 'Encabezó huelgas históricas en el sector logístico que paralizaron el comercio de la república durante 14 días.',
    avatarId: 'benitez',
    lore: {
      personality: 'Cálido en público, duro en negociación y orgulloso de no pedir permiso para entrar donde antes lo hacían esperar.',
      motivation: 'Quiere que el crecimiento llegue al salario antes de convertirse en informe de consultora.',
      strengths: ['Movilización popular', 'lealtad sindical', 'instinto callejero'],
      weaknesses: ['Desconfianza de mercados', 'apego a viejas lealtades', 'tentación de castigar críticos'],
      powerRelationship: 'Lo vive como reparación histórica: ocupar el sillón donde otros decidieron sobre su gente.',
      moneyRelationship: 'No odia la riqueza; odia que se use como excusa para pedir sacrificios ajenos.',
      peopleRelationship: 'Tiene olfato para el humor popular y sabe cuándo una consigna nace de hambre real.',
      institutionRelationship: 'Respeta la ley cuando la ley no se vuelve coartada para la desigualdad.',
      familyStory: 'Hijo de una costurera de cooperativa y de un estibador portuario del Litoral Subtropical.',
      parents: 'Nora Benítez, costurera; Ramón Duarte, estibador.',
      originClass: 'Clase trabajadora periurbana del Litoral Subtropical.',
      childhoodEvent: 'De chico acompañó a su madre a reclamar salarios atrasados y vio cómo una asamblea podía darle voz a quien no tenía micrófono.',
      adultTurningPoint: 'Una muerte obrera en un depósito sin habilitación lo convirtió de delegado combativo en dirigente nacional.',
      politicalOrigin: 'Llegó desde el sindicalismo logístico y los comedores barriales que sostuvo durante la crisis.',
      pathToPresidency: 'Una alianza de gremios, gobernadores del interior y barrios populares lo llevó al poder contra todos los pronósticos televisivos.',
      mandateGoal: 'Reconstruir salarios, hospitales y orgullo popular sin que el país se quede sin reservas.',
      fear: 'Traicionar a quienes lo subieron a los hombros para poder quedarse en el sillón.',
      personalContradiction: 'Denuncia privilegios, pero disfruta el respeto que impone la banda presidencial.',
      signaturePhrase: 'Primero que cierre la heladera; después discutimos el Excel.',
    },
  },
];

// ─────────────────────────────────────────────
// Provincias de la República del Sur
// ─────────────────────────────────────────────

export const PROVINCES: Province[] = [
  {
    id: 'capital-federal',
    name: 'Distrito Federal Metropolitano',
    population: 3_100_000,
    economy: provinceEconomy({ gdp: 85, employment: 68, poverty: 22, investment: 78, infrastructure: 82 }),
    industries: ['servicios', 'tecnologia', 'comercio'],
    climate: 'templado',
    resources: ['Puerto ultramarino', 'Centro financiero', 'Nodos de fibra óptica'],
    governorId: 'actor-cap-gov',
    unions: ['union-transporte', 'union-comercio'],
    universities: 14,
    regionalMedia: ['media-cap-1', 'media-cap-2', 'media-cap-3'],
    socialMood: 15,
    culture: 'Sede bancaria, burocracia central, medios concentrados y ritmo frenético.',
    electoralTrend: ideology({ economy: 30, liberties: 35, technology: 45, stateSize: -20 }),
    scars: [],
    turismAppeal: 75,
  },
  {
    id: 'pampa-humeda',
    name: 'Pampa Agrícola Central',
    population: 4_900_000,
    economy: provinceEconomy({ gdp: 72, employment: 62, poverty: 28, investment: 60, infrastructure: 65 }),
    industries: ['agricultura', 'ganaderia', 'industria'],
    climate: 'pampeano',
    resources: ['Suelos fértiles', 'Cuenca sojera', 'Complejo agroexportador'],
    governorId: 'actor-pampa-gov',
    unions: ['union-rural', 'union-industria'],
    universities: 7,
    regionalMedia: ['media-pampa-1'],
    socialMood: 5,
    culture: 'Tradición agroganadera, arraigo a la tierra, resistencia a las retenciones del estado.',
    electoralTrend: ideology({ economy: -10, stateSize: 10, federalism: 50, trade: 40 }),
    scars: [],
    turismAppeal: 35,
  },
  {
    id: 'sierras-centro',
    name: 'Sierras del Centro',
    population: 3_600_000,
    economy: provinceEconomy({ gdp: 68, employment: 58, poverty: 32, investment: 52, infrastructure: 60 }),
    industries: ['industria', 'tecnologia', 'turismo', 'comercio'],
    climate: 'templado',
    resources: ['Polo metalmecánico', 'Cluster de software', 'Cuenca turística serrana'],
    governorId: 'actor-sierra-gov',
    unions: ['union-metalurgica', 'union-industria'],
    universities: 9,
    regionalMedia: ['media-sierra-1', 'media-sierra-2'],
    socialMood: -5,
    culture: 'Polo tecnológico-educativo, contracultura estudiantil y parques automotrices.',
    electoralTrend: ideology({ economy: 10, industry: 40, education: 35, liberties: 20 }),
    scars: [],
    turismAppeal: 60,
  },
  {
    id: 'noroeste-andino',
    name: 'Noroeste Andino',
    population: 1_600_000,
    economy: provinceEconomy({ gdp: 38, employment: 42, poverty: 54, investment: 30, infrastructure: 32 }),
    industries: ['mineria', 'turismo', 'agricultura'],
    climate: 'andino',
    resources: ['Salares de litio', 'Yacimientos de cobre', 'Patrimonio arqueológico'],
    governorId: 'actor-cord-gov',
    unions: ['union-minera'],
    universities: 3,
    regionalMedia: ['media-cord-1'],
    socialMood: -18,
    culture: 'Comunidades ancestrales, artesanía, turismo cultural y tensión minera.',
    electoralTrend: ideology({ environment: -25, stateSize: 45, federalism: 65, culture: -30 }),
    scars: [],
    turismAppeal: 78,
  },
  {
    id: 'cuyo-valles',
    name: 'Cuyo y Valles Secos',
    population: 1_900_000,
    economy: provinceEconomy({ gdp: 52, employment: 50, poverty: 38, investment: 45, infrastructure: 48 }),
    industries: ['agricultura', 'mineria', 'energia', 'turismo'],
    climate: 'arido',
    resources: ['Riego por goteo', 'Bodegas vitivinícolas', 'Parques solares'],
    governorId: 'actor-valle-gov',
    unions: ['union-rural'],
    universities: 4,
    regionalMedia: ['media-valle-1'],
    socialMood: -8,
    culture: 'Cultura del agua, enoturismo, sol perpetuo y conservadurismo institucional.',
    electoralTrend: ideology({ stateSize: 20, federalism: 55, economy: 15, environment: 10 }),
    scars: [],
    turismAppeal: 82,
  },
  {
    id: 'litoral-subtropical',
    name: 'Litoral Subtropical',
    population: 2_400_000,
    economy: provinceEconomy({ gdp: 44, employment: 48, poverty: 48, investment: 32, infrastructure: 38 }),
    industries: ['agricultura', 'pesca', 'turismo', 'energia'],
    climate: 'subtropical',
    resources: ['Acuífero hídrico', 'Biomasa forestal', 'Represa hidroeléctrica'],
    governorId: 'actor-lit-gov',
    unions: ['union-rural', 'union-pesca'],
    universities: 4,
    regionalMedia: ['media-lit-1'],
    socialMood: -12,
    culture: 'Frontera fluvial, biodiversidad, festivales chamameceros y agricultura de huerta.',
    electoralTrend: ideology({ environment: 30, stateSize: 35, federalism: 50 }),
    scars: [],
    turismAppeal: 70,
  },
  {
    id: 'costa-maritima',
    name: 'Costa Marítima Atlántica',
    population: 1_700_000,
    economy: provinceEconomy({ gdp: 54, employment: 52, poverty: 36, investment: 42, infrastructure: 52 }),
    industries: ['turismo', 'pesca', 'comercio'],
    climate: 'templado',
    resources: ['Plataforma pesquera', 'Infraestructura hotelera', 'Astillero naval'],
    governorId: 'actor-costa-gov',
    unions: ['union-gastronomica', 'union-pesca'],
    universities: 3,
    regionalMedia: ['media-costa-1'],
    socialMood: 8,
    culture: 'Economía estacional de verano, pesca congelada, casinos y turismo masivo.',
    electoralTrend: ideology({ economy: 25, trade: 30, liberties: 20 }),
    scars: [],
    turismAppeal: 90,
  },
  {
    id: 'sur-patagonico',
    name: 'Sur Estepario Patagónico',
    population: 850_000,
    economy: provinceEconomy({ gdp: 62, employment: 56, poverty: 24, investment: 55, infrastructure: 40 }),
    industries: ['energia', 'turismo', 'pesca', 'mineria'],
    climate: 'patagonico',
    resources: ['Yacimiento no convencional', 'Vientos eólicos', 'Reserva de agua dulce'],
    governorId: 'actor-sur-gov',
    unions: ['union-petrolera', 'union-pesca'],
    universities: 2,
    regionalMedia: ['media-sur-1'],
    socialMood: 12,
    culture: 'Estepa eólica, enclaves hidrocarburíferos, glaciares y aislamiento soberano.',
    electoralTrend: ideology({ economy: 15, federalism: 80, environment: -15, industry: 25 }),
    scars: [],
    turismAppeal: 88,
  },
];

// ─────────────────────────────────────────────
// Partidos políticos prediseñados
// ─────────────────────────────────────────────

export const DEFAULT_PARTIES: Party[] = [
  {
    id: 'partido-tradicional',
    name: 'Partido Tradicional',
    abbreviation: 'PT',
    color: '#3B82F6',
    ideology: ideology({ economy: -20, stateSize: 30, federalism: 20, health: 30, education: 20 }),
    popularity: 25,
    funding: 60,
    cohesion: 55,
    leaderId: null,
    members: 450_000,
    isCustom: false,
  },
  {
    id: 'partido-liberal',
    name: 'Partido Liberal',
    abbreviation: 'PL',
    color: '#F59E0B',
    ideology: ideology({ economy: 60, stateSize: -50, trade: 60, liberties: 30, technology: 40 }),
    popularity: 18,
    funding: 75,
    cohesion: 70,
    leaderId: null,
    members: 280_000,
    isCustom: false,
  },
  {
    id: 'movimiento-federal',
    name: 'Movimiento Federal',
    abbreviation: 'MF',
    color: '#8B5CF6',
    ideology: ideology({ federalism: 70, stateSize: 10, economy: -10, culture: -20 }),
    popularity: 15,
    funding: 40,
    cohesion: 45,
    leaderId: null,
    members: 200_000,
    isCustom: false,
  },
  {
    id: 'movimiento-popular',
    name: 'Movimiento Popular',
    abbreviation: 'MP',
    color: '#10B981',
    ideology: ideology({ economy: -40, stateSize: 50, health: 50, education: 40, liberties: -10 }),
    popularity: 22,
    funding: 35,
    cohesion: 40,
    leaderId: null,
    members: 380_000,
    isCustom: false,
  },
  {
    id: 'partido-verde',
    name: 'Partido Verde',
    abbreviation: 'PV',
    color: '#22C55E',
    ideology: ideology({ environment: 80, technology: 30, liberties: 40, trade: -20 }),
    popularity: 8,
    funding: 20,
    cohesion: 80,
    leaderId: null,
    members: 90_000,
    isCustom: false,
  },
  {
    id: 'coalicion-tecnologica',
    name: 'Coalición Tecnológica',
    abbreviation: 'CT',
    color: '#06B6D4',
    ideology: ideology({ technology: 70, economy: 40, education: 50, trade: 50, stateSize: -30 }),
    popularity: 10,
    funding: 80,
    cohesion: 65,
    leaderId: null,
    members: 120_000,
    isCustom: false,
  },
  {
    id: 'movimiento-conservador',
    name: 'Movimiento Conservador',
    abbreviation: 'MC',
    color: '#EF4444',
    ideology: ideology({ security: 60, culture: -50, liberties: -40, stateSize: 20, economy: 10 }),
    popularity: 12,
    funding: 50,
    cohesion: 60,
    leaderId: null,
    members: 170_000,
    isCustom: false,
  },
];

// ─────────────────────────────────────────────
// Profesiones disponibles en creación
// ─────────────────────────────────────────────

export const PROFESSIONS = [
  'Abogado/a',
  'Contador/a',
  'Docente',
  'Médico/a',
  'Ingeniero/a',
  'Periodista',
  'Comerciante',
  'Sindicalista',
  'Empresario/a',
  'Trabajador/a social',
  'Economista',
  'Politólogo/a',
  'Arquitecto/a',
  'Agricultor/a',
  'Programador/a',
  'Artista',
  'Deportista',
  'Militar retirado/a',
] as const;

// ─────────────────────────────────────────────
// Progresión de carrera
// ─────────────────────────────────────────────

export const CAREER_ORDER: CareerStage[] = [
  'militante',
  'referente',
  'concejal',
  'intendente',
  'legislador',
  'gobernador',
  'senador',
  'ministro',
  'vicepresidente',
  'presidente',
  'expresidente',
];

export const CAREER_LABELS: Record<CareerStage, string> = {
  militante: 'Militante',
  referente: 'Referente barrial',
  concejal: 'Concejal',
  intendente: 'Intendente',
  legislador: 'Legislador/a',
  gobernador: 'Gobernador/a',
  senador: 'Senador/a',
  ministro: 'Ministro/a',
  vicepresidente: 'Vicepresidente/a',
  presidente: 'Presidente/a',
  expresidente: 'Expresidente/a',
};

// ─────────────────────────────────────────────
// Vivienda y percepción pública satírica
// ─────────────────────────────────────────────

export const HOUSING_LABELS: Record<HousingType, string> = {
  monoambiente: 'Monoambiente alquilado',
  ph: 'PH heredado',
  departamento: 'Departamento elegante',
  'casa-barrio': 'Casa de barrio con patio',
  'casa-historica': 'Casa histórica reciclada',
  quinta: 'Quinta en las afueras',
  'barrio-privado': 'Casa en barrio privado',
  'residencia-oficial': 'Residencia oficial',
  'mansion-exagerada': 'Mansión ostentosa con pileta y 12 glorietas',
};

export const HOUSING_SATIRE: Record<HousingType, string> = {
  monoambiente: 'Vivís entre expedientes y humedad. La prensa te califica de "austero militante" o "político sin recursos".',
  ph: 'Propiedad de la abuela. Los vecinos te saludan con afecto y los analistas te ven como "clase media auténtica".',
  departamento: 'Balcón con vista al parque. La prensa financiera aprueba tu sobriedad urbana.',
  'casa-barrio': 'Jardín con parrilla. Símbolo de estabilidad familiar que suma puntos con los sectores tradicionales.',
  'casa-historica': 'Techos altos y parquet crujiente. Te da un aire de intelectual republicano.',
  quinta: 'Piscina y arboleda. Los editoriales de la oposición empiezan a preguntar "de dónde salió la plata".',
  'barrio-privado': 'Seguridad armada las 24 horas y cancha de tenis. Perdés empatía con los sectores populares.',
  'residencia-oficial': 'Paredes custodiadas por Granaderos. El verdadero aroma del poder de estado.',
  'mansion-exagerada': 'Doce glorietas, cascada artificial e invernadero más grande que una escuela. Las redes sociales hacen memes diarios.',
};

export const HOUSING_PERCEPTION: Record<HousingType, number> = {
  monoambiente: 12,
  ph: 8,
  departamento: 2,
  'casa-barrio': 0,
  'casa-historica': -3,
  quinta: -12,
  'barrio-privado': -20,
  'residencia-oficial': -5,
  'mansion-exagerada': -45,
};

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  primario: 'Primario completo',
  secundario: 'Secundario completo',
  terciario: 'Terciario',
  universitario: 'Universitario',
  posgrado: 'Posgrado',
};

export const REPUTATION_GROUPS: ReputationGroup[] = [
  'empresarios',
  'trabajadores',
  'jovenes',
  'jubilados',
  'clase-media',
  'campo',
  'industria',
  'docentes',
  'fuerzas-seguridad',
  'universidades',
  'ongs',
  'mercados',
  'inversores',
  'prensa',
  'organismos-internacionales',
];

export const REPUTATION_LABELS: Record<ReputationGroup, string> = {
  'empresarios': 'Empresarios',
  'trabajadores': 'Trabajadores',
  'jovenes': 'Jóvenes',
  'jubilados': 'Jubilados',
  'clase-media': 'Clase media',
  'campo': 'Campo',
  'industria': 'Industria',
  'docentes': 'Docentes',
  'fuerzas-seguridad': 'Fuerzas de seguridad',
  'universidades': 'Universidades',
  'ongs': 'ONGs',
  'mercados': 'Mercados',
  'inversores': 'Inversores',
  'prensa': 'Prensa',
  'organismos-internacionales': 'Organismos internacionales',
};

export function createDefaultReputation(): Record<ReputationGroup, number> {
  return {
    'empresarios': 40,
    'trabajadores': 50,
    'jovenes': 55,
    'jubilados': 45,
    'clase-media': 50,
    'campo': 40,
    'industria': 45,
    'docentes': 50,
    'fuerzas-seguridad': 45,
    'universidades': 50,
    'ongs': 50,
    'mercados': 45,
    'inversores': 40,
    'prensa': 50,
    'organismos-internacionales': 50,
  };
}

export function createDefaultNation() {
  return {
    economy: {
      inflation: 45,
      reserves: 35,
      debt: 55,
      gdp: 45,
      production: 50,
      consumption: 55,
      investment: 35,
      exchangeRate: 40,
      tourism: 45,
    },
    society: {
      poverty: 40,
      employment: 50,
      insecurity: 55,
      education: 50,
      health: 45,
      polarization: 60,
      socialConflicts: 50,
      trust: 35,
    },
    governance: {
      institutionality: 45,
      corruption: 55,
      internationalImage: 50,
    },
  };
}
