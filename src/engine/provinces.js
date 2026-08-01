import { randomInt } from './rng';
export function simulateProvincesTick(provinces, rng) {
    return provinces.map((p) => {
        const moodDelta = randomInt(rng, -2, 2);
        const employmentDelta = randomInt(rng, -1, 1);
        return {
            ...p,
            socialMood: Math.max(-100, Math.min(100, p.socialMood + moodDelta)),
            economy: {
                ...p.economy,
                employment: Math.max(0, Math.min(100, p.economy.employment + employmentDelta)),
            },
        };
    });
}
