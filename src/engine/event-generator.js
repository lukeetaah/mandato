import { createRng, pick, randomInt, chance } from './rng';
const REGIONAL_SECTORS = [
    { name: 'Noroeste Andino', focus: 'minería de litio', group: 'universidades' },
    { name: 'Litoral Subtropical', focus: 'represa hidroeléctrica', group: 'trabajadores' },
    { name: 'Cuyo y Valles Secos', focus: 'cuenca vitivinícola', group: 'campo' },
    { name: 'Sierras del Centro', focus: 'parque automotriz', group: 'industria' },
    { name: 'Pampa Agrícola Central', focus: 'cosecha de granos', group: 'campo' },
    { name: 'Distrito Federal Metropolitano', focus: 'sistema financiero', group: 'mercados' },
    { name: 'Costa Marítima Atlántica', focus: 'flota pesquera', group: 'empresarios' },
    { name: 'Sur Estepario Patagónico', focus: 'yacimientos no convencionales', group: 'fuerzas-seguridad' },
];
const ANOMALIES_SATIRICAL = [
    'Descubren que el sistema de cómputos corría sobre una computadora de 2004.',
    'Un perro callejero fue electo concejal por votos nulos en un municipio del interior.',
    'Licitación de 10.000 banderas con el mapa impreso al revés.',
    'Diputado vota por error a favor del proyecto opositor mientras atendía una llamada.',
    'Un gato en la sala de máquinas del Banco Central causa apagón de 2 horas en el mercado bursátil.',
    'Funcionarios confunden el presupuesto de salud con el de catering oficial.',
];
/**
 * Generador Combinatorio de Eventos Dinámicos (Más de 500 variaciones posibles)
 */
export function generateSystemicEvent(state, seed) {
    const rng = createRng(seed);
    const sector = pick(rng, REGIONAL_SECTORS);
    const turn = state.turn;
    const season = state.calendar.season;
    const isSatirical = chance(rng, 0.25);
    if (isSatirical) {
        const anomaly = pick(rng, ANOMALIES_SATIRICAL);
        return {
            id: `ev-sys-sat-${turn}-${seed}`,
            title: `Insólita situación en ${sector.name}`,
            description: `${anomaly} El hecho desata una marea de memes y debates en medios nacionales.`,
            category: 'satirico',
            effects: {
                reputation: { jovenes: randomInt(rng, 2, 5), prensa: randomInt(rng, -4, 2) },
                character: { popularity: randomInt(rng, -2, 2) },
            },
            turnOccurred: turn,
        };
    }
    // Evento socio-económico condicionado por indicadores
    if (state.nation.economy.inflation > 60) {
        return {
            id: `ev-sys-inf-${turn}-${seed}`,
            title: `Tensión laboral por paritarias en ${sector.name}`,
            description: `La aceleración inflacionaria destruye los salarios del sector de ${sector.focus}. El gremio local amenaza con huelga por tiempo indeterminado.`,
            category: 'social',
            effects: {
                national: { society: { socialConflicts: randomInt(rng, 4, 8) } },
                reputation: { [sector.group]: randomInt(rng, -10, -4) },
            },
            turnOccurred: turn,
        };
    }
    if (state.nation.economy.reserves < 25) {
        return {
            id: `ev-sys-res-${turn}-${seed}`,
            title: `Falta de insumos importados paraliza ${sector.focus}`,
            description: `La escasez de dólares impide liberar contenedores en la aduana de ${sector.name}. Fábricas locales reducen turnos.`,
            category: 'economico',
            effects: {
                national: { economy: { gdp: randomInt(rng, -3, -1) } },
                reputation: { industria: randomInt(rng, -8, -3), empresarios: randomInt(rng, -6, -2) },
            },
            turnOccurred: turn,
        };
    }
    // Evento positivo estacional
    if (season === 'Verano' && sector.name === 'Costa Marítima Atlántica') {
        return {
            id: `ev-sys-ver-${turn}-${seed}`,
            title: `Récord de reservas turísticas en la costa`,
            description: `El turismo interno colapsa hoteles y restaurantes. Excelente recaudación local e ingreso de divisas.`,
            category: 'economico',
            effects: {
                national: { economy: { tourism: randomInt(rng, 5, 10), reserves: randomInt(rng, 2, 4) } },
                reputation: { 'clase-media': randomInt(rng, 4, 8) },
            },
            turnOccurred: turn,
        };
    }
    // Evento estándar regional
    return {
        id: `ev-sys-std-${turn}-${seed}`,
        title: `Inversión privada proyectada en ${sector.name}`,
        description: `Un consorcio regional anuncia intenciones de ampliar la producción de ${sector.focus}, sujeto a estabilidad fiscal.`,
        category: 'economico',
        effects: {
            national: { economy: { investment: randomInt(rng, 2, 5) } },
            reputation: { inversores: randomInt(rng, 3, 6) },
        },
        turnOccurred: turn,
    };
}
