import type { GameState, NationalScar, EventCategory, PersistentConsequence, WorldState, LogEntry } from './types';

export function createNationalScar(
  state: GameState,
  title: string,
  description: string,
  category: EventCategory,
  mediaEcho: string,
  icon: string = '📜'
): NationalScar {
  const familyId = nationalScarKey({ title }).replace(/-del-\d+$/, '');
  const parentHistoryId = [...state.eventLog].reverse().find((entry) => entry.type === 'event' || entry.type === 'decision')?.id;
  return {
    id: `scar-${nationalScarKey({ title })}`,
    historyId: `history-scar-${familyId}-${state.turn}`,
    familyId,
    parentHistoryId,
    title,
    description,
    originTurn: state.turn,
    year: state.calendar.year,
    category,
    mediaEcho,
    icon,
    lifecycle: 'nacimiento',
  };
}

export function nationalScarKey(scar: Pick<NationalScar, 'title'>): string {
  return scar.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function dedupeNationalScars(scars: NationalScar[]): NationalScar[] {
  const seen = new Set<string>();
  return scars.filter((scar) => {
    const key = nationalScarKey(scar);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function checkForScarTrigger(state: GameState): NationalScar | null {
  const { nation, calendar } = state;

  if (nation.economy.inflation > 80 && !state.scars.some((s) => s.familyId === 'la-gran-hiperinflacion' || s.id.includes('hiper'))) {
    return createNationalScar(
      state,
      `La gran hiperinflación del ${calendar.year}`,
      'Los precios aumentaban continuamente. La moneda nacional perdió valor de reserva y la economía se informalizó.',
      'economico',
      'El año en que los precios cambiaban dos veces por semana.',
      '💥'
    );
  }

  if (calendar.season === 'Invierno' && nation.economy.reserves < 15 && !state.scars.some((s) => s.familyId === 'el-invierno-frio' || s.id.includes('invierno-frio'))) {
    return createNationalScar(
      state,
      `El invierno frío del ${calendar.year}`,
      'La escasez energética afectó el suministro en escuelas e industrias durante el pico invernal.',
      'social',
      'Las imágenes de familias abrigadas en interiores marcaron la cobertura.',
      '❄️'
    );
  }

  if (state.flags['reforma-universitaria'] && !state.scars.some((s) => s.familyId === 'la-tension-universitaria' || s.id.includes('tension-universitaria'))) {
    return createNationalScar(
      state,
      `La tensión universitaria del ${calendar.year}`,
      'Movilizaciones estudiantiles en las provincias exigieron mayor presupuesto operativo.',
      'social',
      'El debate sobre la educación pública ocupó la agenda nacional.',
      '🎓'
    );
  }

  if (nation.society.employment < 35 && !state.scars.some((s) => s.familyId === 'la-crisis-de-empleo' || s.id.includes('crisis-de-empleo'))) {
    return createNationalScar(
      state,
      `La crisis de empleo del ${calendar.year}`,
      'El freno de la actividad fabril incrementó el trabajo informal y las demandas de asistencia.',
      'social',
      'El desempleo se convirtió en el tema principal de consulta.',
      '📉'
    );
  }

  return null;
}

/** ─────────────────────────────────────────────
 *  SISTEMA DE CONSECUENCIAS PERSISTENTES Y CONSOLIDACIÓN
 *  ───────────────────────────────────────────── */

export function createDefaultWorldState(): WorldState {
  return {
    globalCommoditiesIndex: 50,
    globalTechEra: 'Automatización y transición energética',
    internationalMarketMood: 'neutral',
    climateTrend: 'normal',
  };
}

/** Evolución autónoma del mundo (El país no se detiene aunque el jugador no actúe) */
export function simulateAutonomousWorld(world: WorldState | undefined, turn: number): { updatedWorld: WorldState; worldLog?: LogEntry } {
  const currentWorld = world ?? createDefaultWorldState();
  
  // Variación autónoma del mercado internacional de materias primas cada 6 turnos
  let newCommodities = currentWorld.globalCommoditiesIndex;
  let newMood = currentWorld.internationalMarketMood;
  let worldLog: LogEntry | undefined;

  if (turn % 6 === 0) {
    const shift = (turn % 12 === 0) ? 6 : -4;
    newCommodities = Math.max(20, Math.min(80, newCommodities + shift));
    
    if (newCommodities >= 65) {
      newMood = 'favorable';
      worldLog = {
        turn,
        type: 'system',
        title: '📈 Alza de precios internacionales',
        description: 'La demanda mundial de materias primas impulsó las exportaciones de la región.',
        emotionalText: 'El contexto externo ofrece un respiro a las cuentas públicas.',
      };
    } else if (newCommodities <= 35) {
      newMood = 'hostil';
      worldLog = {
        turn,
        type: 'system',
        title: '📉 Caída de mercados internacionales',
        description: 'La menor demanda global redujo el valor de los embarques de exportación.',
        emotionalText: 'El escenario internacional se vuelve más exigente para la gestión.',
      };
    } else {
      newMood = 'neutral';
    }
  }

  return {
    updatedWorld: {
      ...currentWorld,
      globalCommoditiesIndex: newCommodities,
      internationalMarketMood: newMood,
    },
    worldLog,
  };
}

function evolveConsequence(consequence: PersistentConsequence, state: GameState): PersistentConsequence {
  const age = Math.max(0, state.turn - consequence.originTurn);
  let lifecycle: PersistentConsequence['lifecycle'] = age < 2
    ? 'nacimiento'
    : age < 8
      ? 'expansion'
      : age < 24
        ? 'normalizacion'
        : age < 72
          ? 'olvido'
          : 'legado';
  let resolved = consequence.resolved;
  let resolvedTurn = consequence.resolvedTurn;

  if (consequence.id === 'tension-credito-internacional'
    && (state.nation.economy.reserves >= 25 || state.nation.economy.debt <= 60)) {
    resolved = true;
    lifecycle = 'resuelto';
    resolvedTurn ??= state.turn;
  }

  if (consequence.id === 'fatiga-ajuste-social'
    && age >= 6
    && state.nation.society.socialConflicts <= 45) {
    resolved = true;
    lifecycle = 'resuelto';
    resolvedTurn ??= state.turn;
  }

  if (lifecycle === 'legado') {
    resolved = true;
  }

  return {
    ...consequence,
    resolved,
    lifecycle,
    resolvedTurn,
    lastUpdatedTurn: state.turn,
  };
}

/** Evaluación y combinación de consecuencias persistentes */
export function evaluatePersistentConsequences(state: GameState): {
  updatedConsequences: PersistentConsequence[];
  emergentLogs: LogEntry[];
  butterflyLog?: LogEntry;
  activatedConsequences: PersistentConsequence[];
} {
  const current = state.persistentConsequences ?? [];
  const emergentLogs: LogEntry[] = [];
  let butterflyLog: LogEntry | undefined;
  const activatedConsequences: PersistentConsequence[] = [];

  const nextConsequences: PersistentConsequence[] = current.map((consequence) => evolveConsequence(consequence, state));
  const latestDecision = [...state.decisionHistory].reverse()[0];
  const latestHistory = [...state.eventLog].reverse().find((entry) => entry.type === 'event' || entry.type === 'decision');

  // 1. Evaluación de Combinación: Inflación alta + Ajuste repetido -> Fatiga social
  const hasAusterityFatigue = state.patterns.austerityMoves >= 4 && state.nation.society.socialConflicts > 45;
  const existingFatigue = nextConsequences.find((c) => c.id === 'fatiga-ajuste-social');

  if (hasAusterityFatigue && !existingFatigue) {
    const newFatigue: PersistentConsequence = {
      id: 'fatiga-ajuste-social',
      historyId: `history-consequence-fatiga-ajuste-social-${state.turn}`,
      familyId: 'fatiga-ajuste-social',
      parentHistoryId: latestHistory?.id ?? latestDecision?.historyId,
      sourceDecisionId: latestDecision?.id,
      sourceChoiceId: latestDecision?.choiceId,
      title: 'Fatiga social por acumulación de ajustes',
      summary: 'La población muestra menor tolerancia ante nuevos incrementos de tarifas o recortes de gasto.',
      category: 'persistente',
      originTurn: state.turn,
      year: state.calendar.year,
      icon: '⏳',
      causalityChain: [
        'Múltiples medidas de contención del gasto en turnos recientes.',
        'Persistencia de la inflación sobre la canasta básica.',
        'Desgaste de la paciencia social en la clase trabajadora.',
      ],
      sectorMemory: 'trabajadores',
      effects: { reputation: { trabajadores: -8, 'clase-media': -6 } },
      resolved: false,
      lifecycle: 'nacimiento',
      lastUpdatedTurn: state.turn,
      visibleInUI: true,
    };
    nextConsequences.push(newFatigue);
    activatedConsequences.push(newFatigue);
    emergentLogs.push({
      id: newFatigue.historyId,
      familyId: newFatigue.familyId,
      parentId: newFatigue.parentHistoryId,
      sourceDecisionId: newFatigue.sourceDecisionId,
      sourceChoiceId: newFatigue.sourceChoiceId,
      lifecycle: 'nacimiento',
      turn: state.turn,
      type: 'event',
      title: newFatigue.title,
      description: newFatigue.summary,
      emotionalText: 'La insistencia en una misma fórmula empieza a generar desgaste en la calle.',
    });
  }

  // 2. Evaluación de Combinación: Reservas bajas + Deuda alta -> Tensión con mercados
  const hasMarketTension = state.nation.economy.reserves < 25 && state.nation.economy.debt > 60;
  const existingMarketTension = nextConsequences.find((c) => c.id === 'tension-credito-internacional');

  if (hasMarketTension && !existingMarketTension) {
    const newMarketConsequence: PersistentConsequence = {
      id: 'tension-credito-internacional',
      historyId: `history-consequence-tension-credito-internacional-${state.turn}`,
      familyId: 'tension-credito-internacional',
      parentHistoryId: latestHistory?.id ?? latestDecision?.historyId,
      sourceDecisionId: latestDecision?.id,
      sourceChoiceId: latestDecision?.choiceId,
      title: 'Restricción de acceso al crédito externo',
      summary: 'El bajo nivel de reservas líquidas dificulta la colocación de nuevos títulos de deuda.',
      category: 'latente',
      originTurn: state.turn,
      year: state.calendar.year,
      icon: '🏛️',
      causalityChain: [
        'Caída de reservas del Banco Central por debajo de los $25M.',
        'Nivel de deuda sobre PBI superior al 60%.',
        'Preocupación de los inversores por la capacidad de pago.',
      ],
      sectorMemory: 'mercados',
      effects: { national: { economy: { investment: -5 } }, reputation: { mercados: -10 } },
      resolved: false,
      lifecycle: 'nacimiento',
      lastUpdatedTurn: state.turn,
      visibleInUI: true,
    };
    nextConsequences.push(newMarketConsequence);
    activatedConsequences.push(newMarketConsequence);
    emergentLogs.push({
      id: newMarketConsequence.historyId,
      familyId: newMarketConsequence.familyId,
      parentId: newMarketConsequence.parentHistoryId,
      sourceDecisionId: newMarketConsequence.sourceDecisionId,
      sourceChoiceId: newMarketConsequence.sourceChoiceId,
      lifecycle: 'nacimiento',
      turn: state.turn,
      type: 'event',
      title: newMarketConsequence.title,
      description: newMarketConsequence.summary,
    });
  }

  // 3. Mecánica de Efecto Mariposa (Memorable y poco frecuente, cada ~10 turnos si hay historial)
  if (state.turn > 8 && state.turn % 10 === 0 && state.decisionHistory.length > 2) {
    const pastEntry = state.decisionHistory[Math.floor(state.turn / 2) % state.decisionHistory.length];
    if (pastEntry) {
      butterflyLog = {
        id: `history-butterfly-${state.turn}`,
        familyId: 'butterfly-government-memory',
        parentId: pastEntry.historyId,
        sourceDecisionId: pastEntry.id,
        lifecycle: 'normalizacion',
        turn: state.turn,
        type: 'system',
        title: '🦋 Efecto mariposa: Memoria de gobierno',
        description: `Las decisiones tomadas en el turno ${pastEntry.turn} continúan influyendo en las expectativas de los sectores productivos y en la estabilidad institucional.`,
        emotionalText: 'El presente del país no es un hecho aislado: se construyó firma a firma.',
      };
    }
  }

  // 4. Consolidación de Consecuencias (Mecanismo para evitar acumulación excesiva)
  const consolidated = consolidateConsequences(nextConsequences);

  return {
    updatedConsequences: consolidated,
    emergentLogs,
    butterflyLog,
    activatedConsequences,
  };
}

/** Consolidación de múltiples pequeños registros en una sola consecuencia estructural */
export function consolidateConsequences(consequences: PersistentConsequence[]): PersistentConsequence[] {
  if (consequences.length <= 6) return consequences;

  // Filtrar o unir consecuencias del mismo sector si superan el límite
  const result: PersistentConsequence[] = [];
  const sectorGroups: Record<string, PersistentConsequence[]> = {};

  for (const c of consequences) {
    const sector = c.sectorMemory ?? 'general';
    if (!sectorGroups[sector]) sectorGroups[sector] = [];
    sectorGroups[sector]!.push(c);
  }

  for (const [sector, items] of Object.entries(sectorGroups)) {
    if (items.length >= 3) {
      const first = items[0]!;
      const allResolved = items.every((item) => item.resolved);
      const lastUpdatedTurn = Math.max(...items.map((item) => item.lastUpdatedTurn ?? item.originTurn));
      result.push({
        id: `consolidado-${sector}`,
        historyId: `history-consequence-consolidated-${sector}-${first.originTurn}`,
        familyId: `consequence-consolidated-${sector}`,
        parentHistoryId: first.parentHistoryId,
        sourceDecisionId: first.sourceDecisionId,
        sourceChoiceId: first.sourceChoiceId,
        title: `Relación compleja con el sector ${sector}`,
        summary: `Múltiples antecedentes acumulados condicionan la negociación permanente con ${sector}.`,
        category: 'persistente',
        originTurn: first.originTurn,
        year: first.year,
        icon: '📜',
        causalityChain: items.flatMap((item) => [item.title, ...(item.causalityChain ?? [])]),
        sectorMemory: sector,
        effects: first.effects,
        resolved: allResolved,
        lifecycle: allResolved ? 'resuelto' : 'normalizacion',
        resolvedTurn: allResolved ? lastUpdatedTurn : undefined,
        lastUpdatedTurn,
        visibleInUI: !allResolved,
      });
    } else {
      result.push(...items);
    }
  }

  return result;
}
