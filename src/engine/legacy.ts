import type { GameState, Legacy, LegacyArchetype } from './types';

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

  const scoreBase = (character.popularity * 0.4) + (nation.society.trust * 0.3) + (nation.governance.institutionality * 0.3);

  return {
    archetype,
    title,
    epitaph,
    score: Math.min(100, Math.max(0, Math.round(scoreBase))),
  };
}

