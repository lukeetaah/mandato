import type { GameState, Legacy, LegacyArchetype } from './types';

export function calculateLegacy(state: GameState): Legacy {
  const { character, patterns, nation, reputation } = state;
  let archetype: LegacyArchetype = 'el-pragmatico';
  let title = 'El Político Olvidado';
  let epitaph = 'Cumplió su tiempo en el poder sin dejar incendios incontrolables ni estatuas memorables.';

  if (state.phase === 'gameover' && state.eventLog.some((entry) => entry.title.toLowerCase().includes('juicio político'))) {
    archetype = 'el-preso';
    title = 'El Presidente Procesado';
    epitaph = 'La historia todavía discute si fue culpable, ingenuo o simplemente el último en firmar. El expediente, por ahora, tiene más páginas que su mandato.';
  } else if (character.traits.honesty > 75 && nation.governance.corruption < 35 && patterns.favorsAccepted === 0) {
    if (nation.economy.gdp < 40) {
      archetype = 'el-incorruptible-ineficaz';
      title = 'El Incorruptible Ineficaz';
      epitaph = 'Jamás aceptó un favor ni firmó un sobre. Tampoco logró que funcionara un solo hospital.';
    } else {
      archetype = 'el-reformista';
      title = 'El Reformista Moral';
      epitaph = 'Demostró que el poder puede ejercerse sin perder la dignidad ni quebrar el Estado.';
    }
  } else if (patterns.favorsAccepted > 8 && nation.economy.gdp > 60) {
    archetype = 'el-corrupto-estabilizador';
    title = 'El Negociador Oscuro';
    epitaph = 'Repartió contratos entre amigos, pacificó a los sindicatos y mantuvo la inflación a raya.';
  } else if (state.socialMedia.memeAboutPlayer || reputation['jovenes'] < 20) {
    archetype = 'el-presidente-meme';
    title = 'El Presidente Meme';
    epitaph = 'Sus discursos generaron millones de remixes en video y ninguna ley trascendente.';
  } else if (character.career === 'expresidente' || character.career === 'presidente') {
    archetype = 'la-leyenda';
    title = 'El Mandatario Inevitable';
    epitaph = 'Amado por unos, detestado por otros. Nadie en la República del Sur podrá olvidar su nombre.';
  }

  return {
    archetype,
    title,
    epitaph,
    score: Math.min(100, Math.max(0, character.popularity + nation.society.trust)),
  };
}
