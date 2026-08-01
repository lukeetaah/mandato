import type { GameState, HeadlineItem } from './types';
import type { RngState } from './rng';
import { pick, chance } from './rng';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function normalizeHeadlineTitle(title: string): string {
  return title
    .replace(/^EN VIVO:\s*/i, '')
    .replace(/^REDES DISCUTEN:\s*/i, '')
    .replace(/^IMPACTO DE LA MEDIDA:\s*/i, '')
    .replace(/\s+—\s+(nueva lectura|edición)\b.*$/i, '')
    .trim()
    .toLocaleLowerCase('es');
}

function enrichHeadline(headline: HeadlineItem, state: GameState): HeadlineItem {
  const inflation = Math.round(state.nation.economy.inflation);
  const reserves = Math.round(state.nation.economy.reserves);
  const popularity = Math.round(state.character.popularity);

  const depthByCategory: Record<HeadlineItem['category'], { impact: string; cause: string }> = {
    economico: {
      impact: `En la calle, el dato se transforma en decisiones concretas: familias que cambian marcas, comercios que acortan plazos y trabajadores que llegan al mostrador con menos margen que la semana anterior.`,
      cause: `El trasfondo combina una inflación del ${inflation}%, reservas del Banco Central en ${reserves}% y un gabinete obligado a elegir qué costo absorbe el Estado y cuál traslada a la sociedad.`,
    },
    politico: {
      impact: `La discusión no queda encerrada en los despachos: intendentes, legisladores y aliados empiezan a medir cuánto apoyo conserva el gobierno cuando llega la hora de votar o salir a explicar una medida.`,
      cause: `La tensión se alimenta de una aprobación presidencial del ${popularity}% y de una coalición que necesita convertir acuerdos, rumores y promesas en una mayoría que aguante la próxima crisis.`,
    },
    social: {
      impact: `En los barrios, la noticia se mide en horas de espera, changas perdidas, aulas vacías y discusiones familiares. El malestar deja de ser una estadística cuando altera la rutina de quienes sostienen el país todos los días.`,
      cause: `La presión viene acumulándose en las calles: los precios, el empleo y la respuesta desigual de las provincias convierten un problema sectorial en una pregunta incómoda sobre la capacidad del Estado.`,
    },
    satirico: {
      impact: `Mientras el funcionario intenta explicar el expediente, la ciudadanía ya lo convirtió en meme, sobremesa y apodo. La risa funciona como desahogo, pero también deja una marca sobre la confianza en las instituciones.`,
      cause: `El episodio creció porque mezcla burocracia, recursos públicos y una cuota de absurdo que ningún vocero logra ordenar. En la República del Sur, hasta una compra menor puede terminar discutiendo la seriedad del gobierno.`,
    },
    mediatico: {
      impact: `La noticia cambia el humor de una audiencia que ya no distingue del todo entre información, espectáculo y campaña. Cada entrevista puede sumar apoyo, pero también regalarle una frase inolvidable a los adversarios.`,
      cause: `La pelea por el encuadre se explica por la baja confianza en los medios y por redes capaces de instalar una versión antes de que el gabinete termine de leer el parte oficial.`,
    },
    internacional: {
      impact: `Para empresas, estudiantes y familias que dependen de importaciones, crédito o viajes, una frase diplomática puede terminar afectando precios, empleos y oportunidades concretas.`,
      cause: `El margen externo se achica cuando las reservas y la credibilidad financiera obligan a negociar cada anuncio con socios que también tienen su propia agenda.`,
    },
    ambiental: {
      impact: `La obra se vuelve visible en el momento menos ceremonial: cuando falta agua, se corta una ruta o una escuela necesita funcionar con recursos prestados. Allí se decide si la promesa pública fue planificación o escenografía.`,
      cause: `El conflicto nace de presupuestos limitados, provincias que reclaman autonomía y un gobierno nacional que debe decidir qué inaugura, qué repara y qué posterga sin poder esconderlo bajo una cinta.`,
    },
    personal: {
      impact: `Detrás del episodio hay una persona concreta intentando sostener su vida privada mientras el cargo convierte cada gesto en señal política, comentario de pasillo o material para una portada.`,
      cause: `La noticia crece porque en este gobierno la frontera entre intimidad, reputación y poder institucional se volvió demasiado fina para que nadie la ignore.`,
    },
  };

  const title = headline.title.toLocaleLowerCase('es');
  const topicDepth = title.includes('transporte') || title.includes('tarifa') || title.includes('colectivo')
    ? {
      impact: 'La medida se siente en la parada, en el boleto y en el tiempo que tarda cada trabajador en llegar a fin de mes. Una tarifa puede ordenar una planilla y, al mismo tiempo, convertir un viaje cotidiano en una decisión familiar.',
      cause: 'El expediente nació del choque entre subsidios, costos de combustible, concesiones y reclamos provinciales. El gobierno debe mostrar quién paga el servicio y qué nivel de frecuencia está dispuesto a garantizar.',
    }
    : title.includes('organismo') || title.includes('deuda') || title.includes('crédito') || title.includes('fmi')
    ? {
      impact: 'El acuerdo puede cambiar salarios, tarifas, empleo público y acceso al crédito. En los hogares se traduce en cuotas, precios y la sensación de que una negociación hecha lejos del barrio acaba de entrar por la ventana.',
      cause: 'La discusión combina vencimientos, reservas escasas y condiciones que el organismo acreedor presenta como técnica, aunque cada cláusula redistribuye costos entre provincias, empresas y trabajadores.',
    }
    : title.includes('reserva') || title.includes('divisa') || title.includes('banco central')
    ? {
      impact: 'Cuando faltan dólares, aparecen faltantes, demoras y precios que cambian antes de que el salario llegue a la cuenta. Cuando sobran de golpe, también aparece la tentación de gastarlos como si el país hubiera dejado de tener problemas.',
      cause: 'El Banco Central funciona como termómetro político: cada movimiento de reservas altera importaciones, expectativas, crédito y el margen que conserva el gobierno para prometer una salida.',
    }
    : null;
  const depth = topicDepth ?? (depthByCategory[headline.category] ?? depthByCategory.politico);
  return {
    ...headline,
    humanImpactText: headline.humanImpactText ?? depth.impact,
    causalStoryText: headline.causalStoryText ?? depth.cause,
  };
}

export function generateDailyHeadlines(state: GameState, rng: RngState): HeadlineItem[] {
  const { nation, character, turn, eventLog } = state;
  const calendar = state.calendar ?? { month: 1, year: 2032 };
  const monthName = MONTH_NAMES[(calendar.month ?? 1) - 1] ?? 'Enero';
  const headlines: HeadlineItem[] = [];
  const usedTitles = new Set(
    [
      ...(state.dailyHeadlines ?? []),
      ...(state.hemeroteca ?? []).slice(0, 60).flatMap((issue) => [issue.mainHeadline, ...issue.secondaryHeadlines]),
    ].map((headline) => normalizeHeadlineTitle(headline.title)),
  );
  const uniqueTitle = (title: string) => title;

  // Diario, TV y redes comparten el hecho; cada uno lo interpreta desde su propia lente.
  const recentStory = [...(eventLog ?? [])].reverse().find((entry) => entry.type === 'event' || entry.type === 'election' || entry.type === 'decision');
  if (recentStory) {
    const topic = recentStory.title.replace(/^[^\p{L}\p{N}]*/u, '');
    const storyCategory = recentStory.type === 'decision' ? 'politico' : 'social';
    if (!usedTitles.has(normalizeHeadlineTitle(topic))) {
      headlines.push(
        { id: `hl-story-diary-${turn}`, outletName: 'El Diario del Sur', title: uniqueTitle(topic), subhead: recentStory.description, category: storyCategory, bias: 'oficialista' },
        { id: `hl-story-tv-${turn}`, outletName: 'Canal 11 Red Federal', title: uniqueTitle(`EN VIVO: ${topic}`), subhead: `El noticiero sigue las consecuencias en la calle: ${recentStory.emotionalText ?? recentStory.description}`, category: storyCategory, bias: 'opositor' },
        { id: `hl-story-redes-${turn}`, outletName: 'Redes del Sur', title: uniqueTitle(`REDES DISCUTEN: ${topic}`), subhead: 'La conversación gira alrededor del mismo hecho; entre ironías y reclamos, nadie lo interpreta igual.', category: storyCategory, bias: 'sensacionalista' },
      );
    }
  }

  // 0. TITULAR DE DECISIÓN RECIENTE (si el jugador tomó una medida)
  const recentDecisions = (eventLog ?? []).filter((l) => l.type === 'decision').slice(-2);
  if (recentDecisions.length > 0) {
    const lastDec = recentDecisions[recentDecisions.length - 1]!;
    const decisionTitle = lastDec.title.replace(/^[🚨📋📨⚠️]\s*/, '');
    if (!usedTitles.has(normalizeHeadlineTitle(decisionTitle))) {
      headlines.push({
        id: `hl-decision-${turn}`,
        outletName: 'El Diario del Sur',
        title: `IMPACTO DE LA MEDIDA: ${decisionTitle}`,
        subhead: lastDec.emotionalText ?? lastDec.description,
        category: 'politico',
        bias: 'oficialista',
      });
    }
  }

  // 1. TITULAR MACRO — siempre hay uno
  if (nation.economy.inflation > 70) {
    headlines.push({
      id: `hl-inf-${turn}`,
      outletName: 'El Sur Diario',
      title: `HIPERINFLACIÓN: PRECIOS SUBEN ${Math.round(nation.economy.inflation / 5)}% SEMANAL`,
      subhead: 'Góndolas vacías, remarcaciones diarias. El peso perdió toda credibilidad.',
      category: 'economico',
      bias: 'sensacionalista',
    });
  } else if (nation.economy.inflation > 50) {
    headlines.push({
      id: `hl-inf-${turn}`,
      outletName: 'Portal Financiero del Sur',
      title: 'INFLACIÓN DESCONTROLADA: CANASTA BÁSICA SUPERA EL SALARIO MÍNIMO',
      subhead: 'Familias recurren a ferias populares y trueque en las provincias del interior.',
      category: 'economico',
      bias: 'opositor',
    });
  } else if (nation.economy.reserves < 20) {
    headlines.push({
      id: `hl-res-${turn}`,
      outletName: 'Cronista del Sur',
      title: 'ALERTA ROJA: RESERVAS DEL BANCO CENTRAL EN MÍNIMOS HISTÓRICOS',
      subhead: 'Quedan divisas para solo dos semanas de importaciones críticas. Analistas prevén restricciones cambiarias reforzadas.',
      category: 'economico',
      bias: 'opositor',
    });
  } else if (nation.economy.gdp > 65) {
    headlines.push({
      id: `hl-gdp-${turn}`,
      outletName: 'La Gaceta Oficial',
      title: 'ACTIVIDAD ECONÓMICA EN ALZA: CUARTO MES CONSECUTIVO DE CRECIMIENTO',
      subhead: 'El gobierno destaca la recuperación. Los economistas piden cautela.',
      category: 'economico',
      bias: 'oficialista',
    });
  } else if (nation.society.poverty > 55) {
    headlines.push({
      id: `hl-pov-${turn}`,
      outletName: 'Crónica Reorganizada',
      title: `POBREZA TREPA AL ${Math.round(nation.society.poverty)}%: LA MITAD DEL PAÍS NO LLEGA A FIN DE MES`,
      subhead: 'Ollas populares en las 8 provincias. El hambre ya no es invisible.',
      category: 'social',
      bias: 'sensacionalista',
    });
  } else {
    headlines.push({
      id: `hl-eco-${turn}`,
      outletName: 'La Gaceta Oficial',
      title: pick(rng, [
        'EL GOBIERNO AFIRMA QUE LA ECONOMÍA ENTRÓ EN "FASE DE ESTABILIZACIÓN"',
        'MINISTERIO DE ECONOMÍA: "LOS INDICADORES MEJORAN LENTAMENTE"',
        `SUPERÁVIT COMERCIAL EN ${monthName.toUpperCase()}: EXPORTACIONES SUPERAN IMPORTACIONES`,
        'BANCO CENTRAL MANTIENE TASA SIN CAMBIOS: "EL RUMBO ES CORRECTO"',
      ]),
      subhead: 'Analistas independientes cuestionan la medición oficial de la canasta alimentaria.',
      category: 'economico',
      bias: 'oficialista',
    });
  }

  // 2. TITULAR POLÍTICO / PERSONAL
  if (character.popularity < 25) {
    headlines.push({
      id: `hl-pop-${turn}`,
      outletName: 'Canal 11 Red Federal',
      title: `ENCUESTAS: IMAGEN DE ${character.surname.toUpperCase()} TOCA MÍNIMO HISTÓRICO (${Math.round(character.popularity)}%)`,
      subhead: 'La oposición reclama cambio de gabinete. Rumores de renuncia del Jefe de Gabinete.',
      category: 'politico',
      bias: 'opositor',
    });
  } else if (character.popularity > 65) {
    headlines.push({
      id: `hl-pop-${turn}`,
      outletName: 'La Gaceta Oficial',
      title: `${character.surname.toUpperCase()} LIDERA ENCUESTAS CON ${Math.round(character.popularity)}% DE APROBACIÓN`,
      subhead: 'El oficialismo celebra mientras la oposición busca candidato competitivo.',
      category: 'politico',
      bias: 'oficialista',
    });
  } else {
    headlines.push({
      id: `hl-pol-${turn}`,
      outletName: pick(rng, ['Crónica Reorganizada', 'El Sur Diario', 'Canal 11 Red Federal']),
      title: pick(rng, [
        `${character.surname.toUpperCase()} SE REÚNE CON GOBERNADORES EN AGENDA SECRETA`,
        'RUMORES DE CAMBIO DE GABINETE SACUDEN LA CASA ROSADA DEL SUR',
        'TENSIÓN EN EL BLOQUE: TRES DIPUTADOS AMENAZAN CON ROMPER',
        `${character.surname.toUpperCase()} BUSCA ACUERDO CON LA OPOSICIÓN PARA DESTRABAR EL CONGRESO`,
        'OPERATIVO SEDUCCIÓN: EL OFICIALISMO OFRECE FONDOS A CAMBIO DE VOTOS',
        `INTERNA PARTIDARIA: SECTORES CUESTIONAN EL LIDERAZGO DE ${character.surname.toUpperCase()}`,
      ]),
      subhead: pick(rng, [
        'Fuentes cercanas al poder confirman reuniones nocturnas en la residencia oficial.',
        'La rosca política se calienta de cara a las próximas legislativas.',
        'Analistas advierten que el oficialismo necesita oxígeno político urgente.',
      ]),
      category: 'politico',
      bias: chance(rng, 0.5) ? 'oficialista' : 'opositor',
    });
  }

  // 3. TITULAR SOCIAL / COTIDIANO
  if (nation.society.socialConflicts > 40) {
    headlines.push({
      id: `hl-soc-${turn}`,
      outletName: 'Crónica Reorganizada',
      title: pick(rng, [
        'PIQUETES CORTAN 15 RUTAS EN TODO EL PAÍS',
        'PROTESTAS NOCTURNAS: CACEROLAZO MASIVO EN EL DISTRITO FEDERAL',
        'SINDICATOS AMENAZAN CON PARO GENERAL INDEFINIDO',
        'ORGANIZACIONES SOCIALES ACAMPAN FRENTE A LA CASA DE GOBIERNO',
      ]),
      subhead: 'El malestar social crece y las calles se convierten en el termómetro del país.',
      category: 'social',
      bias: 'sensacionalista',
    });
  } else if (nation.society.insecurity > 50) {
    headlines.push({
      id: `hl-ins-${turn}`,
      outletName: 'Canal 11 Red Federal',
      title: pick(rng, [
        'OLA DE ROBOS EN EL CONURBANO: VECINOS PIDEN INTERVENCIÓN FEDERAL',
        'ASALTO A MANO ARMADA EN PLENO CENTRO: LA INSEGURIDAD NO CEDE',
        'ESTADÍSTICAS DE DELITO: RECORD DE DENUNCIAS EN LAS COMISARÍAS',
      ]),
      subhead: 'Las fuerzas de seguridad admiten estar desbordadas.',
      category: 'social',
      bias: 'sensacionalista',
    });
  }

  // 4. TITULAR SATÍRICO (siempre hay uno)
  const satiricalPicks = [
    'MINISTERIO DE BUROCRACIA LICITA 500 CAFETERAS DE GRADO ESPACIAL',
    'INUNDACIÓN EN LA PAMPA: AUTORIDADES RECOMIENDAN BOTAS DE GOMA Y OPTIMISMO',
    'SENADO APRUEBA DECLARAR EL "DÍA NACIONAL DE LA COMISIÓN INVESTIGADORA"',
    'APAGÓN EN LA CAPITAL: EL INTENDENTE CULPA A UN GATO QUE SE ENGANCHÓ AL CABLEADO',
    'GOBERNADOR INAUGURA LA MISMA ESCUELA POR TERCERA VEZ EN DOS AÑOS',
    'DIPUTADO PRESENTA PROYECTO PARA DECLARAR AL ASADO COMO DEPORTE OLÍMPICO',
    'FUNCIONARIO CONFUNDE WIFI CON INFLACIÓN EN CONFERENCIA DE PRENSA',
    'MUNICIPIO COMPRA 200 FAROLAS SOLARES PARA UN PUEBLO QUE AÚN NO TIENE CALLES',
    'SECRETARIO DE COMUNICACIÓN PUBLICA SU CV EN LA CUENTA OFICIAL POR ERROR',
    'DESCUBREN QUE EL PRESUPUESTO DE CATERING SUPERA EL DE INFRAESTRUCTURA ESCOLAR',
    'LEGISLADOR PROPONE SEMÁFOROS CON IA PARA PUEBLO DE 400 HABITANTES',
    'MINISTERIO ANUNCIA "PLAN ESTRATÉGICO DIGITAL" EN DOCUMENTO ESCANEADO TORCIDO',
  ];

  headlines.push({
    id: `hl-sat-${turn}`,
    outletName: 'El Pasquín del Sur',
    title: pick(rng, satiricalPicks),
    subhead: pick(rng, [
      'Insólita situación desata indignación y memes en redes sociales.',
      'El hashtag ya es trending topic. Nadie sabe si reír o llorar.',
      'La oposición pide informes. El oficialismo responde con emojis.',
      'Las redes sociales no perdonan. La viralización fue instantánea.',
    ]),
    category: 'satirico',
    bias: 'satirico',
  });

  const generatedTitles = new Set<string>();
  return headlines
    .map((headline) => enrichHeadline({ ...headline, title: uniqueTitle(headline.title) }, state))
    .filter((headline) => {
      const key = normalizeHeadlineTitle(headline.title);
      if (usedTitles.has(key) || generatedTitles.has(key)) return false;
      generatedTitles.add(key);
      return true;
    });
}
