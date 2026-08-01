export function createNationalScar(state, title, description, category, mediaEcho, icon = '📜') {
    return {
        id: `scar-${state.turn}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        description,
        originTurn: state.turn,
        year: state.calendar.year,
        category,
        mediaEcho,
        icon,
    };
}
export function checkForScarTrigger(state) {
    const { nation, calendar } = state;
    // 1. La gran hiperinflación
    if (nation.economy.inflation > 80 && !state.scars.some((s) => s.id.includes('hiper'))) {
        return createNationalScar(state, `La gran hiperinflación del ${calendar.year}`, 'Los precios aumentaban dos veces por día. La moneda nacional perdió valor de reserva y la economía se informalizó por completo.', 'economico', 'El año en que los remarcadores de precios no durmieron.', '💥');
    }
    // 2. El invierno sin gas
    if (calendar.season === 'Invierno' && nation.economy.reserves < 15 && !state.scars.some((s) => s.id.includes('gas'))) {
        return createNationalScar(state, `El invierno helado del ${calendar.year}`, 'Faltó gas en escuelas, hospitales y fábricas. La población recurrió al leña y estufas eléctricas que colapsaron la red.', 'social', 'Las imágenes de familias abrigadas dentro de sus casas dominaron las portadas.', '❄️');
    }
    // 3. La reforma universitaria
    if (state.flags['reforma-universitaria'] && !state.scars.some((s) => s.id.includes('universitaria'))) {
        return createNationalScar(state, `La huelga universitaria del ${calendar.year}`, 'Marchas multitudinarias en las 8 provincias paralizaron la educación superior durante meses.', 'social', 'Una generación entera de estudiantes marchó bajo la lluvia.', '🎓');
    }
    // 4. El gran desempleo
    if (nation.society.employment < 35 && !state.scars.some((s) => s.id.includes('desempleo'))) {
        return createNationalScar(state, `El colapso laboral del ${calendar.year}`, 'El cierre de industrias dejó a cientos de miles de trabajadores en la informalidad.', 'social', 'Las filas frente a las oficinas de empleo daban la vuelta a la manzana.', '📉');
    }
    return null;
}
