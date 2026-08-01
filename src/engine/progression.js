import { CAREER_ORDER } from './constants';
export function evaluateCareerProgression(state) {
    const currentStage = state.character.career;
    const currentIndex = CAREER_ORDER.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= CAREER_ORDER.length - 1) {
        return { canPromote: false };
    }
    const nextStage = CAREER_ORDER[currentIndex + 1];
    const turnRequirement = (currentIndex + 1) * 8;
    const popularityRequirement = 40 + currentIndex * 4;
    if (state.turn < turnRequirement) {
        return {
            canPromote: false,
            nextStage,
            reason: `Necesitás más trayectoria política (Turno ${state.turn}/${turnRequirement}).`,
        };
    }
    if (state.character.popularity < popularityRequirement) {
        return {
            canPromote: false,
            nextStage,
            reason: `Popularidad insuficiente (${Math.round(state.character.popularity)}/${popularityRequirement}%).`,
        };
    }
    return {
        canPromote: true,
        nextStage,
    };
}
