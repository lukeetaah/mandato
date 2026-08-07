/**
 * MI MANDATO — Type System
 */

export const SAVE_VERSION = 4;
export const SAVE_KEY = 'mi-mandato-v4';

export type ActorId = string;
export type PartyId = string;
export type ProvinceId = string;
export type DecisionId = string;
export type EventId = string;
export type MediaOutletId = string;
export type UnionId = string;
export type BillId = string;

export type CareerStage =
  | 'militante'
  | 'referente'
  | 'concejal'
  | 'intendente'
  | 'legislador'
  | 'gobernador'
  | 'senador'
  | 'ministro'
  | 'vicepresidente'
  | 'presidente'
  | 'expresidente';

export type GamePhase = 'menu' | 'creation' | 'playing' | 'paused' | 'opposition' | 'trial' | 'gameover';

export type EducationLevel = 'primario' | 'secundario' | 'terciario' | 'universitario' | 'posgrado';

export type IndustryType =
  | 'agricultura'
  | 'ganaderia'
  | 'mineria'
  | 'pesca'
  | 'turismo'
  | 'industria'
  | 'energia'
  | 'tecnologia'
  | 'comercio'
  | 'servicios';

export type ClimateType = 'templado' | 'arido' | 'subtropical' | 'patagonico' | 'andino' | 'pampeano';

export type HousingType =
  | 'monoambiente'
  | 'ph'
  | 'departamento'
  | 'casa-barrio'
  | 'casa-historica'
  | 'quinta'
  | 'barrio-privado'
  | 'residencia-oficial'
  | 'mansion-exagerada';

export type MediaType = 'portal' | 'tv' | 'radio' | 'streaming';

export type Urgency = 'baja' | 'media' | 'alta' | 'critica';

export type EventCategory =
  | 'economico'
  | 'social'
  | 'politico'
  | 'ambiental'
  | 'internacional'
  | 'mediatico'
  | 'personal'
  | 'satirico';

export type NarrativeLifecycle =
  | 'nacimiento'
  | 'expansion'
  | 'normalizacion'
  | 'olvido'
  | 'legado'
  | 'resuelto'
  | 'consumido'
  | 'expirado';

export type ReputationGroup =
  | 'empresarios'
  | 'trabajadores'
  | 'jovenes'
  | 'jubilados'
  | 'clase-media'
  | 'campo'
  | 'industria'
  | 'docentes'
  | 'fuerzas-seguridad'
  | 'universidades'
  | 'ongs'
  | 'mercados'
  | 'inversores'
  | 'prensa'
  | 'organismos-internacionales';

export type LegacyArchetype =
  | 'el-reformista'
  | 'el-negociador'
  | 'el-incorruptible-ineficaz'
  | 'el-corrupto-estabilizador'
  | 'el-presidente-meme'
  | 'el-obsesionado-encuestas'
  | 'el-historiador'
  | 'el-pragmatico'
  | 'el-villano-necesario'
  | 'el-idealista-destruido'
  | 'la-leyenda'
  | 'el-olvidado'
  | 'el-exiliado'
  | 'el-preso'
  | 'el-profesor'
  | 'el-conductor-tv'
  | 'el-consultor';

export type PlayerProfile =
  | 'corruptible'
  | 'inflexible'
  | 'populista'
  | 'negociador'
  | 'autoritario'
  | 'indeciso'
  | 'tecnocrata'
  | 'carismatico'
  | 'neutral';

export type MapLayer = 'fisico' | 'politico' | 'economico' | 'electoral' | 'infraestructura';

export type ElectionType = 'presidencial' | 'legislativa' | 'provincial' | 'interna';

export interface IdeologyProfile {
  economy: number;
  stateSize: number;
  security: number;
  education: number;
  environment: number;
  trade: number;
  industry: number;
  liberties: number;
  federalism: number;
  foreignRelations: number;
  technology: number;
  health: number;
  culture: number;
}

export interface CharacterTraits {
  charisma: number;
  honesty: number;
  ambition: number;
  empathy: number;
  oratory: number;
  strategy: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'pareja' | 'hijo' | 'hija' | 'padre' | 'madre' | 'hermano' | 'hermana';
  age: number;
  disposition: number;
  publicProfile: boolean;
}

export interface Relationship {
  actorId: ActorId;
  type: 'aliado' | 'rival' | 'amigo' | 'enemigo' | 'neutro' | 'mentor' | 'protegido';
  trust: number;
  history: string[];
}

export interface Scandal {
  id: string;
  description: string;
  severity: number;
  discoveredBy: ActorId[];
  exposed: boolean;
  turnExposed?: number;
}

export interface Possession {
  id: string;
  name: string;
  description: string;
  value: number;
  perceptionImpact: number;
  acquiredTurn: number;
}

export interface Character {
  id: string;
  name: string;
  surname: string;
  age: number;
  province: ProvinceId;
  profession: string;
  education: EducationLevel;
  traits: CharacterTraits;
  health: number;
  stress: number;
  popularity: number;
  wealth: number;
  ego: number;
  idealismo: number;
  pragmatismo: number;
  housing: HousingType;
  possessions: Possession[];
  family: FamilyMember[];
  relationships: Relationship[];
  backstory: string;
  hiddenScandals: Scandal[];
  beliefs: IdeologyProfile;
  career: CareerStage;
  partyId: PartyId;
  yearsInPolitics: number;
}

export interface Party {
  id: PartyId;
  name: string;
  abbreviation: string;
  color: string;
  ideology: IdeologyProfile;
  popularity: number;
  funding: number;
  cohesion: number;
  leaderId: ActorId | null;
  members: number;
  isCustom: boolean;
}

export interface ProvinceScar {
  description: string;
  turn: number;
  effects: Partial<ProvinceEconomy>;
}

export type ConsequenceCategory =
  | 'temporal'
  | 'latente'
  | 'persistente'
  | 'recurrente'
  | 'permanente'
  | 'heredada';

export interface PersistentConsequence {
  id: string;
  historyId?: string;
  familyId?: string;
  parentHistoryId?: string;
  sourceDecisionId?: DecisionId;
  sourceChoiceId?: string;
  title: string;
  summary: string; // Frase resumida en lenguaje humano
  category: ConsequenceCategory;
  originTurn: number;
  year: number;
  icon: string;
  causalityChain: string[]; // Cadena explicativa de causalidad
  sectorMemory?: string; // Sector que guarda la memoria (sindicatos, mercados, campo, etc.)
  effects: Effects;
  resolved: boolean;
  lifecycle?: NarrativeLifecycle;
  resolvedTurn?: number;
  lastUpdatedTurn?: number;
  visibleInUI: boolean;
}

export interface WorldState {
  globalCommoditiesIndex: number;
  globalTechEra: string;
  internationalMarketMood: 'favorable' | 'neutral' | 'hostil';
  climateTrend: 'estelar' | 'normal' | 'sequia-severa' | 'inundaciones';
}

export interface NationalScar {
  id: string;
  historyId?: string;
  familyId?: string;
  parentHistoryId?: string;
  title: string;
  description: string;
  originTurn: number;
  year: number;
  category: EventCategory;
  mediaEcho: string;
  icon: string;
  lifecycle?: NarrativeLifecycle;
}

export interface ProvinceEconomy {
  gdp: number;
  employment: number;
  poverty: number;
  investment: number;
  infrastructure: number;
  publicDebt: number;
}

export interface Province {
  id: ProvinceId;
  name: string;
  population: number;
  economy: ProvinceEconomy;
  industries: IndustryType[];
  climate: ClimateType;
  resources: string[];
  governorId: ActorId;
  unions: UnionId[];
  universities: number;
  regionalMedia: MediaOutletId[];
  socialMood: number;
  culture: string;
  electoralTrend: IdeologyProfile;
  scars: ProvinceScar[];
  turismAppeal: number;
}

export interface EconomyState {
  inflation: number;
  reserves: number;
  debt: number;
  gdp: number;
  production: number;
  consumption: number;
  investment: number;
  exchangeRate: number;
  tourism: number;
}

export interface SocietyState {
  poverty: number;
  employment: number;
  insecurity: number;
  education: number;
  health: number;
  polarization: number;
  socialConflicts: number;
  trust: number;
}

export interface GovernanceState {
  institutionality: number;
  corruption: number;
  internationalImage: number;
}

export interface NationalState {
  economy: EconomyState;
  society: SocietyState;
  governance: GovernanceState;
}

export type ActorRole =
  | 'gobernador'
  | 'intendente'
  | 'legislador'
  | 'senador'
  | 'ministro'
  | 'juez'
  | 'empresario'
  | 'sindicalista'
  | 'periodista'
  | 'militar'
  | 'academico'
  | 'activista'
  | 'religioso'
  | 'diplomatico';

export interface ActorMemory {
  turn: number;
  event: string;
  sentiment: number;
  decayed: boolean;
}

export interface ActorObjective {
  description: string;
  priority: number;
  alignsWithPlayer: boolean;
}

export interface Actor {
  id: ActorId;
  name: string;
  surname: string;
  role: ActorRole;
  province: ProvinceId;
  partyId: PartyId | null;
  age: number;
  loyalty: number;
  ambition: number;
  pragmatism: number;
  courage: number;
  greed: number;
  ideology: IdeologyProfile;
  influence: number;
  wealth: number;
  disposition: number;
  memory: ActorMemory[];
  objectives: ActorObjective[];
}

export interface EffectPreview {
  icon: string;
  label: string;
  magnitude: 'leve' | 'moderado' | 'fuerte';
}

export interface NationalChanges {
  economy?: Partial<Record<keyof EconomyState, number>>;
  society?: Partial<Record<keyof SocietyState, number>>;
  governance?: Partial<Record<keyof GovernanceState, number>>;
}

export type ReputationChanges = Partial<Record<ReputationGroup, number>>;
export type CharacterChanges = Partial<Record<'health' | 'stress' | 'popularity' | 'wealth' | 'ego' | 'idealismo' | 'pragmatismo' | 'honesty', number>>;

export interface Effects {
  national?: NationalChanges;
  reputation?: ReputationChanges;
  character?: CharacterChanges;
}

export interface DelayedEffect {
  id?: string;
  familyId?: string;
  turnsDelay: number;
  probability: number;
  effects: Effects;
  description: string;
  sourceDecisionId: DecisionId;
  sourceChoiceId?: string;
  parentHistoryId?: string;
  originTurn: number;
}

export interface DecisionChoice {
  id: string;
  label: string;
  description: string;
  preview: {
    gains: EffectPreview[];
    losses: EffectPreview[];
    risks: EffectPreview[];
    beneficiaries: string[];
    opponents: string[];
  };
  effects: Effects;
  delayedEffects: DelayedEffect[];
  flags?: string[];
  emotionalImpact?: string; // Frase de responsabilidad emocional humana
  disabled?: boolean;
  disabledReason?: string;
}

export interface Requirement {
  kind: 'career' | 'flag' | 'stat' | 'turn' | 'reputation' | 'province';
  key: string;
  operator: '>=' | '<=' | '==' | '!=' | '>';
  value: number | string;
}

export interface Decision {
  id: DecisionId;
  familyId?: string;
  causeKey?: string;
  parentHistoryId?: string;
  title: string;
  description: string;
  source: string;
  sourceActorId?: ActorId;
  urgency: Urgency;
  category: EventCategory;
  choices: DecisionChoice[];
  expiresInTurns?: number;
  requirements: Requirement[];
  repeatable: boolean;
  cooldown?: number;
}

export interface GameEvent {
  id: EventId;
  familyId?: string;
  causeKey?: string;
  parentHistoryId?: string;
  title: string;
  description: string;
  category: EventCategory;
  effects: Effects;
  generatesDecision?: DecisionId;
  turnOccurred: number;
}

export interface EventTemplate {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  probability: number;
  effects: Effects;
  requirements: Requirement[];
  generatesDecisionId?: string;
  cooldown: number;
  satirical?: boolean;
}

export interface MediaOutlet {
  id: MediaOutletId;
  name: string;
  type: MediaType;
  credibility: number;
  editorialLine: IdeologyProfile;
  ownerActorId: ActorId | null;
  interests: string[];
  finances: number;
  audience: number;
  fatigue: number;
  dispositionToPlayer: number;
}

export interface SocialMediaState {
  trending: string[];
  playerSentiment: number;
  botActivity: number;
  fakeNewsLevel: number;
  memeAboutPlayer: boolean;
  viralEvent: string | null;
  cancellationRisk: number;
}

export interface Bill {
  id: BillId;
  title: string;
  description: string;
  category: string;
  effects: Effects;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  votesNeeded: number;
  status: 'draft' | 'debate' | 'vote' | 'approved' | 'rejected' | 'vetoed';
  turnIntroduced: number;
}

export interface PlayerPatterns {
  favorsAccepted: number;
  favorsRejected: number;
  peopleFired: number;
  promisesMade: number;
  promisesKept: number;
  promisesBroken: number;
  negotiationsStarted: number;
  hardlineStances: number;
  populistMoves: number;
  austerityMoves: number;
  mediaAppearances: number;
  scandalsCovered: number;
  detectedProfile: PlayerProfile;
}

export interface LogEntry {
  id?: string;
  familyId?: string;
  parentId?: string;
  sourceDecisionId?: DecisionId;
  sourceChoiceId?: string;
  causeKey?: string;
  lifecycle?: NarrativeLifecycle;
  resolvedTurn?: number;
  systemsAffected?: string[];
  actorIds?: ActorId[];
  turn: number;
  type: 'decision' | 'event' | 'election' | 'scandal' | 'personal' | 'system';
  title: string;
  description: string;
  emotionalText?: string;
}

export interface Legacy {
  archetype: LegacyArchetype;
  title: string;
  epitaph: string;
  score: number;
}

// ─────────────────────────────────────────────
// Calendario, Elecciones y Hemeroteca
// ─────────────────────────────────────────────

export interface SectorTrustMemory {
  campo: number;
  empresarios: number;
  sindicatos: number;
  cientificos: number;
  universidades: number;
  internacional: number;
  militar: number;
  ambiental: number;
}

export interface ActorMemoryItem {
  turn: number;
  type: 'humiliation' | 'favor_granted' | 'advice_ignored' | 'public_honor' | 'promise_broken';
  description: string;
}

export interface CalendarState {
  month: number;          // 1-12
  year: number;           // Comienza en 2032 (República del Sur)
  fortnight: 1 | 2;       // 1ª Quincena / 2ª Quincena
  timeOfDay: 'mañana' | 'tarde' | 'atardecer' | 'noche';
  weatherCondition: 'despejado' | 'lluvia' | 'niebla' | 'tormenta' | 'nieve';
  season: 'Verano' | 'Otoño' | 'Invierno' | 'Primavera';
  monthCycleName: string; // Ej: "Siembra de soja", "Paritarias docentes", "Temporada de gas", etc.
  turnsUntilLegislative: number;
  turnsUntilPresidential: number;
  turnsUntilProvincial: number;
}

export type DeskObjectType =
  | 'diario'
  | 'expediente'
  | 'telefono'
  | 'carpeta-roja'
  | 'carta-gobernador'
  | 'encuesta'
  | 'informe-inteligencia'
  | 'foto-satelital'
  | 'sobre-sellado';

export interface DeskObject {
  id: string;
  type: DeskObjectType;
  title: string;
  subtitle: string;
  urgency: Urgency;
  inspectText: string;
  associatedDecisionId?: DecisionId;
  read: boolean;
  positionOffset?: { x: number; y: number };
}

export interface HeadlineItem {
  id: string;
  outletName: string;
  title: string;
  subhead: string;
  category: EventCategory;
  bias: 'oficialista' | 'opositor' | 'sensacionalista' | 'satirico';
  humanImpactText?: string;
  causalStoryText?: string;
}

export interface MediaLenses {
  economicDaily: string;
  popularDaily: string;
  officialTv: string;
  oppositionTv: string;
  viralMeme: string;
}

export interface HeadlineIssue {
  turn: number;
  month: number;
  year: number;
  fortnight: 1 | 2;
  season: string;
  editionNumber: number;
  dateString: string;
  mainHeadline: HeadlineItem;
  secondaryHeadlines: HeadlineItem[];
  editorialText: string;
  caricatureCaption: string;
  classifieds: string[];
  obituary: string;
  adSatire: string;
  lenses?: MediaLenses;
}

export interface ElectionRecord {
  turn: number;
  year: number;
  type: ElectionType;
  winnerPartyId: PartyId;
  winnerPartyName: string;
  playerPopularityAtElection: number;
  congressMajority: boolean;
  description: string;
}

export interface AnnualDocumentaryReport {
  year: number;
  mandateIdentity: string; // Ej: "El gobierno de la reconstrucción", "Los años de la inflación"
  top5Headlines: HeadlineItem[];
  imageOfTheYear: string;
  mostControversialDecisionTitle: string;
  politicianOfTheYearName: string;
  approvalSwing: { before: number; after: number };
  butterflyEffectsTriggered: string[];
}

// ─────────────────────────────────────────────
// Estado completo del juego
// ─────────────────────────────────────────────

export interface GameState {
  version: typeof SAVE_VERSION;
  seed: number;
  turn: number;
  phase: GamePhase;
  /** Ventana breve de investigación tras entregar los archivos del juicio. */
  trialProcessingUntilTurn?: number;
  calendar: CalendarState;
  dailyHeadlines: HeadlineItem[];
  hemeroteca: HeadlineIssue[]; // Memoria total del país
  scars: NationalScar[]; // Cicatrices de largo plazo
  persistentConsequences: PersistentConsequence[]; // Sistema de consecuencias persistentes
  worldState: WorldState; // Evolución autónoma del mundo exterior
  sectorTrustMemory: SectorTrustMemory;
  annualDocumentaries: AnnualDocumentaryReport[];
  electionsHistory: ElectionRecord[];
  character: Character;
  nation: NationalState;
  provinces: Province[];
  parties: Party[];
  actors: Actor[];
  deskObjects: DeskObject[];
  deskProps: {
    coffeeCupCount: number;
    familyPhotoVisible: boolean;
    diplomaticGiftVisible: boolean;
    paperStackLevel: number; // 1 (impecable) a 5 (colapsado)
  };
  pendingDecisions: Decision[];
  activeDelayedEffects: DelayedEffect[];
  activeEvents: GameEvent[];
  eventLog: LogEntry[];
  reputation: Record<ReputationGroup, number>;
  mediaOutlets: MediaOutlet[];
  socialMedia: SocialMediaState;
  bills: Bill[];
  patterns: PlayerPatterns;
  flags: Record<string, boolean>;
  decisionHistory: Array<{
    id: DecisionId;
    familyId?: string;
    turn: number;
    choiceId: string;
    causeKey?: string;
    historyId?: string;
    parentHistoryId?: string;
  }>;
  startedAt: number;
  updatedAt: number;
}

export interface StoredGame {
  version: typeof SAVE_VERSION;
  state: GameState;
  savedAt: string;
}
