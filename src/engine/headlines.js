import { pick, chance } from './rng';
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
export function generateDailyHeadlines(state, rng) {
    const { nation, character, turn, eventLog } = state;
    const calendar = state.calendar ?? { month: 1, year: 2032 };
    const monthName = MONTH_NAMES[(calendar.month ?? 1) - 1] ?? 'Enero';
    const headlines = [];
    // 0. TITULAR DE DECISIÓN RECIENTE (si el jugador tomó una medida)
    const recentDecisions = (eventLog ?? []).filter((l) => l.type === 'decision').slice(-2);
    if (recentDecisions.length > 0) {
        const lastDec = recentDecisions[recentDecisions.length - 1];
        headlines.push({
            id: `hl-decision-${turn}`,
            outletName: 'El Diario del Sur',
            title: `IMPACTO DE LA MEDIDA: ${lastDec.title.replace(/^[🚨📋📨⚠️]\s*/, '')}`,
            subhead: lastDec.emotionalText ?? lastDec.description,
            category: 'politico',
            bias: 'oficialista',
        });
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
    }
    else if (nation.economy.inflation > 50) {
        headlines.push({
            id: `hl-inf-${turn}`,
            outletName: 'Portal Financiero del Sur',
            title: 'INFLACIÓN DESCONTROLADA: CANASTA BÁSICA SUPERA EL SALARIO MÍNIMO',
            subhead: 'Familias recurren a ferias populares y trueque en las provincias del interior.',
            category: 'economico',
            bias: 'opositor',
        });
    }
    else if (nation.economy.reserves < 20) {
        headlines.push({
            id: `hl-res-${turn}`,
            outletName: 'Cronista del Sur',
            title: 'ALERTA ROJA: RESERVAS DEL BANCO CENTRAL EN MÍNIMOS HISTÓRICOS',
            subhead: 'Quedan divisas para solo dos semanas de importaciones críticas. Analistas prevén restricciones cambiarias reforzadas.',
            category: 'economico',
            bias: 'opositor',
        });
    }
    else if (nation.economy.gdp > 65) {
        headlines.push({
            id: `hl-gdp-${turn}`,
            outletName: 'La Gaceta Oficial',
            title: 'ACTIVIDAD ECONÓMICA EN ALZA: CUARTO MES CONSECUTIVO DE CRECIMIENTO',
            subhead: 'El gobierno destaca la recuperación. Los economistas piden cautela.',
            category: 'economico',
            bias: 'oficialista',
        });
    }
    else if (nation.society.poverty > 55) {
        headlines.push({
            id: `hl-pov-${turn}`,
            outletName: 'Crónica Reorganizada',
            title: `POBREZA TREPA AL ${Math.round(nation.society.poverty)}%: LA MITAD DEL PAÍS NO LLEGA A FIN DE MES`,
            subhead: 'Ollas populares en las 8 provincias. El hambre ya no es invisible.',
            category: 'social',
            bias: 'sensacionalista',
        });
    }
    else {
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
    }
    else if (character.popularity > 65) {
        headlines.push({
            id: `hl-pop-${turn}`,
            outletName: 'La Gaceta Oficial',
            title: `${character.surname.toUpperCase()} LIDERA ENCUESTAS CON ${Math.round(character.popularity)}% DE APROBACIÓN`,
            subhead: 'El oficialismo celebra mientras la oposición busca candidato competitivo.',
            category: 'politico',
            bias: 'oficialista',
        });
    }
    else {
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
    }
    else if (nation.society.insecurity > 50) {
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
    return headlines;
}
