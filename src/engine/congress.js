export function createSampleBill(turn) {
    return {
        id: `bill-${turn}-${Math.random().toString(36).slice(2, 6)}`,
        title: 'Ley de Modernización Fiscal y Autonomía Provincial',
        description: 'Modifica la distribución del fondo de coparticipación para obras de infraestructura.',
        category: 'gdp',
        effects: {
            national: { economy: { investment: 5, gdp: 3 } },
            reputation: { campo: 10, empresarios: 5, trabajadores: -5 },
        },
        votesFor: 110,
        votesAgainst: 105,
        votesAbstain: 12,
        votesNeeded: 129,
        status: 'debate',
        turnIntroduced: turn,
    };
}
export function voteBill(bill, playerVote) {
    let forCount = bill.votesFor;
    let againstCount = bill.votesAgainst;
    let abstainCount = bill.votesAbstain;
    if (playerVote === 'for')
        forCount += 1;
    else if (playerVote === 'against')
        againstCount += 1;
    else
        abstainCount += 1;
    const passed = forCount >= bill.votesNeeded;
    return {
        ...bill,
        votesFor: forCount,
        votesAgainst: againstCount,
        votesAbstain: abstainCount,
        status: passed ? 'approved' : 'rejected',
    };
}
