import type { GameState, Legacy, LegacyArchetype } from './types';

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

export function calculateLegacy(state: GameState): Legacy {
  const { character, patterns, nation, reputation } = state;
  let archetype: LegacyArchetype = 'el-pragmatico';
  let title = 'El Político Olvidado';
  let epitaph = 'Cumplió su tiempo en el poder sin dejar incendios incontrolables ni estatuas memorables.';

  // 1. Finales Judiciales y de Destitución
  if (state.flags['trial-convicted'] || (state.phase === 'gameover' && !state.flags['trial-dismissed'] && state.eventLog.some((entry) => entry.title.toLowerCase().includes('juicio político')))) {
    archetype = 'el-preso';
    title = 'El Presidente Condenado';
    epitaph = 'El juicio político terminó en condena y el expresidente quedó detenido. La historia todavía discute sus motivos, pero el expediente ya no discute el desenlace.';
  } else if (state.flags['trial-dismissed']) {
    archetype = 'el-exiliado';
    title = 'El Presidente Apartado';
    epitaph = 'La causa terminó en falta de mérito, pero el vicepresidente asumió el mando y la carrera electoral quedó clausurada.';
  }
  // 2. Finales según carrera previa / trasfondo especial
  else if (character.profession.toLowerCase().includes('profesor') && nation.society.education > 65) {
    archetype = 'el-profesor';
    title = 'El Presidente Catedrático';
    epitaph = 'Gobernó el país como si fuera un aula magna. Quienes lo escucharon aprendieron; quienes esperaban obras todavía esperan.';
  } else if (character.profession.toLowerCase().includes('periodista') || (patterns.mediaAppearances > 8 && reputation.prensa > 65)) {
    archetype = 'el-conductor-tv';
    title = 'El Comunicador del Poder';
    epitaph = 'Dominó las pantallas, las cadenas nacionales y el ritmo de la conversación. Nadie supo si gobernaba o transmitía.';
  } else if (character.profession.toLowerCase().includes('empresario') || (nation.economy.investment > 65 && nation.economy.reserves > 60)) {
    archetype = 'el-consultor';
    title = 'El Gerente General de la Nación';
    epitaph = 'Trató al Estado como un balance contable. Dejó reservas récord, superávit fiscal y una sociedad sin épica.';
  }
  // 3. Finales según conducta moral y corrupción
  else if (character.traits.honesty > 70 && nation.governance.corruption < 35 && patterns.favorsAccepted === 0) {
    if (nation.economy.gdp < 40) {
      archetype = 'el-incorruptible-ineficaz';
      title = 'El Incorruptible Ineficaz';
      epitaph = 'Jamás aceptó un favor ni firmó un sobre. Tampoco logró que funcionara un solo hospital.';
    } else {
      archetype = 'el-reformista';
      title = 'El Reformista Moral';
      epitaph = 'Demostró que el poder puede ejercerse sin perder la dignidad ni quebrar el Estado.';
    }
  } else if (patterns.favorsAccepted > 6 && nation.economy.gdp > 55) {
    archetype = 'el-corrupto-estabilizador';
    title = 'El Negociador Oscuro';
    epitaph = 'Repartió contratos entre amigos, pacificó a los sindicatos y mantuvo la inflación a raya.';
  }
  // 4. Finales según desgaste, redes y estilo de decisión
  else if (character.idealismo > 65 && character.popularity < 35) {
    archetype = 'el-idealista-destruido';
    title = 'El Idealista Devorado';
    epitaph = 'Creyó en grandes principios hasta el último día. El sistema lo devoró sin cambiar una sola coma.';
  } else if (patterns.hardlineStances > 5 && nation.society.socialConflicts > 55) {
    archetype = 'el-villano-necesario';
    title = 'El Mandatario Inflexible';
    epitaph = 'Tomó decisiones brutales que nadie quería tomar. El país sobrevivió, pero su nombre se convirtió en insulto.';
  } else if (patterns.populistMoves > 5 && character.popularity > 60) {
    archetype = 'la-leyenda';
    title = 'El Líder Popular e Inevitable';
    epitaph = 'Amado por las masas, detestado por las élites. Su retrato quedó colgado en cada despacho provincial.';
  } else if (patterns.negotiationsStarted > 6) {
    archetype = 'el-negociador';
    title = 'El Arquitecto del Consenso';
    epitaph = 'No dejó grandes discursos pero evitó tres guerras civiles silenciosas a fuerza de café y actas firmadas.';
  } else if (patterns.populistMoves > 3 && patterns.austerityMoves > 3) {
    archetype = 'el-obsesionado-encuestas';
    title = 'El Esclavo de los Sondeos';
    epitaph = 'Cambió de rumbo cada lunes según la encuesta del domingo. Dejó un gobierno impredecible pero curiosamente duradero.';
  } else if (state.eventLog.length > 30 && character.popularity > 45) {
    archetype = 'el-historiador';
    title = 'El Archivero de la República';
    epitaph = 'Registró cada decreto, cada crisis y cada sesión. Su mandato fue una bitácora de supervivencia institucional.';
  } else if (state.socialMedia.memeAboutPlayer || reputation['jovenes'] < 25) {
    archetype = 'el-presidente-meme';
    title = 'El Presidente Meme';
    epitaph = 'Sus discursos generaron millones de remixes en video y ninguna ley trascendente.';
  } else if (character.popularity < 30) {
    archetype = 'el-olvidado';
    title = 'El Presidente Invisible';
    epitaph = 'Se retiró en silencio al concluir su mandato. Veinte años después, pocos recuerdan en qué década gobernó.';
  }

  const economyScore = clamp(average([
    nation.economy.reserves,
    nation.economy.gdp,
    nation.economy.production,
    nation.economy.investment,
    100 - Math.min(100, nation.economy.inflation),
    100 - Math.min(100, nation.economy.debt),
  ]));
  const socialScore = clamp(average([
    nation.society.trust,
    nation.society.health,
    nation.society.education,
    nation.society.employment,
    100 - nation.society.poverty,
    100 - nation.society.socialConflicts,
  ]));
  const institutionalScore = clamp(average([
    nation.governance.institutionality,
    nation.governance.internationalImage,
    100 - nation.governance.corruption,
  ]));
  const personalScore = clamp(average([
    character.popularity,
    character.health,
    100 - character.stress,
    Math.max(...Object.values(reputation)),
  ]));
  const completionScore = state.turn >= 96 || state.phase === 'opposition'
    ? 100
    : state.phase === 'gameover'
    ? Math.max(15, Math.min(70, state.turn))
    : Math.min(90, Math.round((state.turn / 96) * 100));
  const consequencePenalty = Math.min(18, state.persistentConsequences.filter((c) => !c.resolved).length * 2);
  const crisisPenalty = Math.min(16, state.eventLog.filter((entry) => entry.type === 'scandal' || entry.title.toLowerCase().includes('crisis')).length);
  const scoreBase = (
    economyScore * 0.24
    + socialScore * 0.24
    + institutionalScore * 0.22
    + personalScore * 0.16
    + completionScore * 0.14
    - consequencePenalty
    - crisisPenalty
  );

  const decisionLogs = state.eventLog.filter((entry) => entry.type === 'decision');
  const eventLogs = state.eventLog.filter((entry) => entry.type === 'event' || entry.type === 'scandal' || entry.type === 'election');
  const achievements = [
    nation.economy.reserves >= 55 ? 'Sostuvo reservas suficientes para evitar una corrida permanente.' : null,
    nation.society.trust >= 55 ? 'Reconstruyó parte de la confianza social.' : null,
    nation.governance.institutionality >= 60 ? 'Dejó instituciones más fuertes que al asumir.' : null,
    character.health >= 65 && character.stress <= 55 ? 'Llegó al final sin quebrar su salud presidencial.' : null,
    state.scars.length > 0 ? `Atravesó ${state.scars.length} cicatriz${state.scars.length === 1 ? '' : 'es'} nacional${state.scars.length === 1 ? '' : 'es'} sin borrar su memoria.` : null,
  ].filter(Boolean) as string[];
  const mistakes = [
    nation.economy.inflation >= 65 ? 'La inflación siguió marcando la vida cotidiana.' : null,
    nation.governance.corruption >= 65 ? 'La percepción de corrupción quedó demasiado alta.' : null,
    nation.society.socialConflicts >= 65 ? 'La calle terminó más caliente que el despacho.' : null,
    character.stress >= 75 ? 'El costo físico del poder se volvió parte del resultado.' : null,
    state.persistentConsequences.some((c) => !c.resolved) ? 'Dejó consecuencias pendientes que otra administración tendrá que administrar.' : null,
  ].filter(Boolean) as string[];
  const affectedRegions = [...state.provinces]
    .sort((a, b) => Math.abs(b.socialMood) + b.scars.length * 8 - (Math.abs(a.socialMood) + a.scars.length * 8))
    .slice(0, 3)
    .map((province) => province.name);
  const memorableMoments = eventLogs.slice(-5).reverse().map((entry) => entry.title);
  const decisionText = decisionLogs.length > 0
    ? `Tomó ${decisionLogs.length} decisión${decisionLogs.length === 1 ? '' : 'es'} registrada${decisionLogs.length === 1 ? '' : 's'} y dejó ${state.activeDelayedEffects.length + state.persistentConsequences.filter((c) => !c.resolved).length} asunto${state.activeDelayedEffects.length + state.persistentConsequences.filter((c) => !c.resolved).length === 1 ? '' : 's'} abierto${state.activeDelayedEffects.length + state.persistentConsequences.filter((c) => !c.resolved).length === 1 ? '' : 's'}.`
    : 'Su mandato terminó casi sin decisiones registradas.';
  const narrative = `Durante su presidencia, ${character.name} ${character.surname} gobernó durante ${Math.floor(state.turn / 2)} meses con una popularidad final de ${Math.round(character.popularity)}%. ${decisionText} El país terminó con reservas en ${Math.round(nation.economy.reserves)}%, confianza social en ${Math.round(nation.society.trust)}% e institucionalidad en ${Math.round(nation.governance.institutionality)}%. ${achievements[0] ?? mistakes[0] ?? 'Su paso por el poder dejó una marca moderada, más visible en el archivo que en los balcones.'}`;

  return {
    archetype,
    title,
    epitaph,
    score: clamp(scoreBase),
    scoreBreakdown: [
      { label: 'Economía', value: economyScore, note: 'Reservas, inflación, deuda, producción e inversión.' },
      { label: 'Sociedad', value: socialScore, note: 'Confianza, salud, educación, empleo, pobreza y conflictividad.' },
      { label: 'Instituciones', value: institutionalScore, note: 'Institucionalidad, corrupción e imagen internacional.' },
      { label: 'Presidente', value: personalScore, note: 'Popularidad, salud, estrés y mejor relación sectorial.' },
      { label: 'Duración', value: completionScore, note: 'Cuánto resistió el ciclo político del mandato.' },
    ],
    narrative,
    achievements: achievements.slice(0, 4),
    mistakes: mistakes.slice(0, 4),
    affectedRegions,
    memorableMoments,
  };
}
