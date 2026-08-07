import type { Province } from './types';
import { randomInt, type RngState } from './rng';

export function simulateProvincesTick(provinces: Province[], rng: RngState): Province[] {
  return provinces.map((p) => {
    // 1. Variación estocástica de humor social
    let moodDelta = randomInt(rng, -2, 2);
    let employmentDelta = randomInt(rng, -1, 1);

    // 2. Dinámicas por vocación económica de cada provincia
    if (p.id === 'sur-patagonico' || p.id === 'cuyo-vinicola') {
      // Regiones de energía, minería y vino: impulsadas por exportación
      if (p.economy.gdp > 55) {
        moodDelta += 1;
        employmentDelta += 1;
      }
    } else if (p.id === 'pampa-central' || p.id === 'noroeste-andino') {
      // Regiones agropecuarias
      if (p.economy.poverty > 50) {
        moodDelta -= 1;
      }
    } else if (p.id === 'capital-federal' || p.id === 'sierra-industrial') {
      // Centros urbanos e industriales: sensibles a empleo y consumo
      if (p.economy.employment < 45) {
        moodDelta -= 2;
      }
    }

    const nextSocialMood = Math.max(-100, Math.min(100, p.socialMood + moodDelta));
    const nextEmployment = Math.max(0, Math.min(100, p.economy.employment + employmentDelta));

    return {
      ...p,
      socialMood: nextSocialMood,
      economy: {
        ...p.economy,
        employment: nextEmployment,
      },
    };
  });
}

