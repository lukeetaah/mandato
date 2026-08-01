export function createInitialPatterns() {
    return {
        favorsAccepted: 0,
        favorsRejected: 0,
        peopleFired: 0,
        promisesMade: 0,
        promisesKept: 0,
        promisesBroken: 0,
        negotiationsStarted: 0,
        hardlineStances: 0,
        populistMoves: 0,
        austerityMoves: 0,
        mediaAppearances: 0,
        scandalsCovered: 0,
        detectedProfile: 'neutral',
    };
}
export function evaluatePlayerProfile(patterns) {
    const { favorsAccepted, favorsRejected, peopleFired, negotiationsStarted, hardlineStances, populistMoves, austerityMoves, } = patterns;
    if (favorsAccepted > favorsRejected + 3)
        return 'corruptible';
    if (favorsRejected > favorsAccepted + 4 && hardlineStances > 2)
        return 'inflexible';
    if (populistMoves > austerityMoves + 3)
        return 'populista';
    if (austerityMoves > populistMoves + 3)
        return 'tecnocrata';
    if (negotiationsStarted > 5 && hardlineStances < 2)
        return 'negociador';
    if (hardlineStances > 5 || peopleFired > 4)
        return 'autoritario';
    return 'neutral';
}
