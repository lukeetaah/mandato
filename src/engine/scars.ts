import type { GameState, NationalScar, EventCategory } from './types';

export function createNationalScar(
  state: GameState,
  title: string,
  description: string,
  category: EventCategory,
  mediaEcho: string,
  icon: string = '📜'
): NationalScar {
  return {
    id: `scar-${nationalScarKey({ title })}`,
    title,
    description,
    originTurn: state.turn,
    year: state.calendar.year,
    category,
    mediaEcho,
    icon,
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

  // 1. La gran hiperinflación
  if (nation.economy.inflation > 80 && !state.scars.some((s) => s.title.toLowerCase().includes('hiperinflación') || s.id.includes('hiper'))) {
    return createNationalScar(
      state,
      `La gran hiperinflación del ${calendar.year}`,
      'Los precios aumentaban dos veces por día. La moneda nacional perdió valor de reserva y la economía se informalizó por completo.',
      'economico',
      'El año en que los remarcadores de precios no durmieron.',
      '💥'
    );
  }

  // 2. El invierno sin gas
  if (calendar.season === 'Invierno' && nation.economy.reserves < 15 && !state.scars.some((s) => s.title.toLowerCase().includes('invierno helado') || s.id.includes('gas'))) {
    return createNationalScar(
      state,
      `El invierno helado del ${calendar.year}`,
      'Faltó gas en escuelas, hospitales y fábricas. La población recurrió al leña y estufas eléctricas que colapsaron la red.',
      'social',
      'Las imágenes de familias abrigadas dentro de sus casas dominaron las portadas.',
      '❄️'
    );
  }

  // 3. La reforma universitaria
  if (state.flags['reforma-universitaria'] && !state.scars.some((s) => s.title.toLowerCase().includes('huelga universitaria') || s.id.includes('universitaria'))) {
    return createNationalScar(
      state,
      `La huelga universitaria del ${calendar.year}`,
      'Marchas multitudinarias en las 8 provincias paralizaron la educación superior durante meses.',
      'social',
      'Una generación entera de estudiantes marchó bajo la lluvia.',
      '🎓'
    );
  }

  // 4. El gran desempleo
  if (nation.society.employment < 35 && !state.scars.some((s) => s.title.toLowerCase().includes('colapso laboral') || s.id.includes('desempleo'))) {
    return createNationalScar(
      state,
      `El colapso laboral del ${calendar.year}`,
      'El cierre de industrias dejó a cientos de miles de trabajadores en la informalidad.',
      'social',
      'Las filas frente a las oficinas de empleo daban la vuelta a la manzana.',
      '📉'
    );
  }

  return null;
}
