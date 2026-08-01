export const DECISION_POOL = [
    // ─── CRISIS DE RESERVAS Y DIVISAS ───
    {
        id: 'dec-crisis-reservas-urgente',
        title: '🚨 CRISIS DE DIVISAS: BANCO CENTRAL EN ALERTA ROJA',
        description: 'Las reservas líquidas cayeron por debajo del nivel de seguridad. Sin divisas para pagar importaciones de combustibles y medicinas, la economía se encamina a un colapso en 30 días.',
        source: 'Presidente del Banco Central',
        urgency: 'critica',
        category: 'economico',
        repeatable: true,
        cooldown: 4,
        requirements: [],
        choices: [
            {
                id: 'choice-swap-potencias',
                label: 'Firmar Swap de Divisas con Potencia Extranjera',
                description: 'Recibís $5.000M de divisas internacionales de libre disponibilidad a cambio de concesiones portuarias y mineras secretas.',
                preview: {
                    gains: [{ icon: '💵', label: 'Rescate de reservas inmediato', magnitude: 'fuerte' }],
                    losses: [{ icon: '🌐', label: 'Soberanía sobre recursos naturales', magnitude: 'fuerte' }],
                    risks: [{ icon: '🕵️', label: 'Filtración de cláusulas confidenciales', magnitude: 'fuerte' }],
                    beneficiaries: ['Mercados', 'Empresarios'],
                    opponents: ['ONGs', 'Jóvenes'],
                },
                effects: {
                    national: { economy: { reserves: 30 }, governance: { corruption: 4, internationalImage: -4 } },
                    reputation: { mercados: 14, inversores: 10, ongs: -15, jovenes: -10 },
                    character: { popularity: 2, pragmatismo: 8, idealismo: -6 },
                },
                delayedEffects: [
                    {
                        turnsDelay: 4,
                        probability: 0.7,
                        effects: { national: { governance: { institutionality: -6 } }, character: { popularity: -8 } },
                        description: 'Prensa independiente revela que el Swap incluyó la cesión de la base espacial en el Sur.',
                        sourceDecisionId: 'dec-crisis-reservas-urgente',
                        originTurn: 0,
                    },
                ],
            },
            {
                id: 'choice-cepo-extremo',
                label: 'Imponer Restricción Total de Divisas y Control de Importaciones',
                description: 'Cerrás la salida de divisas para turismo y utilidades de multinacionales. Preservás las reservas pero asfixiás el comercio internacional.',
                preview: {
                    gains: [{ icon: '🛡️', label: 'Blindaje de reservas existentes', magnitude: 'fuerte' }],
                    losses: [{ icon: '📉', label: 'Caída de inversión extranjera directa', magnitude: 'fuerte' }],
                    risks: [{ icon: '🏬', label: 'Desabastecimiento de insumos industriales', magnitude: 'fuerte' }],
                    beneficiaries: ['Industria local'],
                    opponents: ['Mercados', 'Inversores', 'Clase Media'],
                },
                effects: {
                    national: { economy: { reserves: 18, investment: -12, exchangeRate: -15 } },
                    reputation: { mercados: -20, inversores: -18, 'clase-media': -12, industria: 6 },
                    character: { pragmatismo: 6 },
                },
                delayedEffects: [],
            },
            {
                id: 'choice-vender-oro',
                label: 'Liquidación de Reservas de Oro Nacional en Custodia Exterior',
                description: 'Liquidás el 20% del lingotaje patriótico depositado en custodias internacionales para obtener liquidez inmediata sin contraer endeudamiento.',
                preview: {
                    gains: [{ icon: '🥇', label: 'Liquidez limpia sin condicionamientos', magnitude: 'fuerte' }],
                    losses: [{ icon: '🏛️', label: 'Respaldo metálico de la moneda nacional', magnitude: 'fuerte' }],
                    risks: [{ icon: '📢', label: 'La oposición denuncia "vaciamiento de la Patria"', magnitude: 'fuerte' }],
                    beneficiaries: ['Inversores'],
                    opponents: ['Trabajadores', 'Campo'],
                },
                effects: {
                    national: { economy: { reserves: 28, inflation: 3 }, society: { trust: -6 } },
                    reputation: { mercados: 8, trabajadores: -10, campo: -8 },
                    character: { popularity: -5, pragmatismo: 7, idealismo: -5 },
                },
                delayedEffects: [],
            },
        ],
    },
    // ─── DECISIONES GENERALES CON 3ER CAMINO ───
    {
        id: 'dec-subsidio-transporte',
        title: 'Aumento de Tarifas de Transporte Público',
        description: 'El Ministerio de Economía sugiere actualizar las tarifas congeladas para reducir el déficit fiscal. Los sindicatos amagan con paros.',
        source: 'Ministro de Economía',
        urgency: 'alta',
        category: 'economico',
        repeatable: true,
        cooldown: 5,
        requirements: [],
        choices: [
            {
                id: 'choice-aumentar-transporte',
                label: 'Aprobar aumento del 40%',
                description: 'Reduce el gasto público pero impacta de lleno en los bolsillos de la clase trabajadora.',
                preview: {
                    gains: [{ icon: '📈', label: 'Reservas del Banco Central', magnitude: 'moderado' }],
                    losses: [{ icon: '🚌', label: 'Popularidad en Clase Trabajadora', magnitude: 'fuerte' }],
                    risks: [{ icon: '⚡', label: 'Riesgo de protestas y paros colectivos', magnitude: 'fuerte' }],
                    beneficiaries: ['Mercados', 'Inversores'],
                    opponents: ['Trabajadores', 'Jóvenes'],
                },
                effects: {
                    national: { economy: { reserves: 4, inflation: 2 }, society: { poverty: 3 } },
                    reputation: { mercados: 8, trabajadores: -12, 'clase-media': -6 },
                    character: { popularity: -5, pragmatismo: 4 },
                },
                delayedEffects: [
                    {
                        turnsDelay: 2,
                        probability: 0.7,
                        effects: { national: { society: { socialConflicts: 8 } } },
                        description: 'Paros sorpresa convocados por la Unión de Transporte.',
                        sourceDecisionId: 'dec-subsidio-transporte',
                        originTurn: 0,
                    },
                ],
            },
            {
                id: 'choice-mantener-transporte',
                label: 'Mantener tarifas congeladas',
                description: 'Evita conflictos en las calles, pero exige emitir más moneda para cubrir los subsidios.',
                preview: {
                    gains: [{ icon: '✊', label: 'Apoyo Sindical y Popular', magnitude: 'moderado' }],
                    losses: [{ icon: '💸', label: 'Inflación a mediano plazo', magnitude: 'fuerte' }],
                    risks: [{ icon: '🔥', label: 'Fuga de reservas en subsidios', magnitude: 'moderado' }],
                    beneficiaries: ['Trabajadores', 'Docentes'],
                    opponents: ['Inversores', 'Mercados'],
                },
                effects: {
                    national: { economy: { reserves: -5, inflation: 4 } },
                    reputation: { trabajadores: 10, mercados: -10 },
                    character: { popularity: 3, idealismo: 3 },
                },
                delayedEffects: [],
            },
            {
                id: 'choice-tarifa-segmentada',
                label: 'Segmentar tarifa por nivel de ingreso',
                description: 'Aumentás la tarifa plena a sectores de altos ingresos y mantenés la tarifa social para sectores vulnerables.',
                preview: {
                    gains: [{ icon: '🎯', label: 'Equidad social e ingreso fiscal moderado', magnitude: 'moderado' }],
                    losses: [{ icon: '📱', label: 'Costo de implementación del sistema de verificación digital', magnitude: 'leve' }],
                    risks: [{ icon: '⚙️', label: 'Fallas en el sistema de verificación', magnitude: 'leve' }],
                    beneficiaries: ['Clase Media', 'Trabajadores'],
                    opponents: ['Empresarios de transporte'],
                },
                effects: {
                    national: { economy: { reserves: 2 }, society: { poverty: -1 } },
                    reputation: { 'clase-media': 5, trabajadores: 4, mercados: 3 },
                    character: { popularity: 4, pragmatismo: 5, idealismo: 4 },
                },
                delayedEffects: [],
            },
        ],
    },
    {
        id: 'dec-cepo-cambiario',
        title: '🚨 CONTROL DE CAMBIOS Y DIVISAS CRÍTICAS',
        description: 'La sangría de divisas en el Banco Central amenaza con dejar sin reservas a las importaciones industriales.',
        source: 'Presidente del Banco Central',
        urgency: 'critica',
        category: 'economico',
        repeatable: true,
        cooldown: 6,
        requirements: [],
        choices: [
            {
                id: 'choice-aplicar-cepo',
                label: 'Imponer cupo estricto de compra de divisas',
                description: 'Frena la sangría inmediata de reservas pero genera brecha cambiaria y mercado paralelo.',
                preview: {
                    gains: [{ icon: '🛡️', label: 'Protección de Reservas', magnitude: 'fuerte' }],
                    losses: [{ icon: '📉', label: 'Confianza de Inversores', magnitude: 'fuerte' }],
                    risks: [{ icon: '🕵️', label: 'Surgimiento de mercado paralelo ilegítimo', magnitude: 'fuerte' }],
                    beneficiaries: ['Industria local'],
                    opponents: ['Mercados', 'Empresarios'],
                },
                effects: {
                    national: { economy: { reserves: 14, exchangeRate: -10, investment: -8 } },
                    reputation: { mercados: -15, inversores: -12, industria: 5 },
                    character: { pragmatismo: 6 },
                },
                delayedEffects: [
                    {
                        turnsDelay: 3,
                        probability: 0.8,
                        effects: { national: { economy: { inflation: 6 } } },
                        description: 'La brecha del tipo de cambio paralelo traslada aumentos a los precios minoristas.',
                        sourceDecisionId: 'dec-cepo-cambiario',
                        originTurn: 0,
                    },
                ],
            },
            {
                id: 'choice-liberar-tipo-cambio',
                label: 'Devaluar y dejar flotar la moneda',
                description: 'Sincroniza los precios internacionales pero provoca un salto inflacionario inmediato.',
                preview: {
                    gains: [{ icon: '🚀', label: 'Competitividad Agroexportadora', magnitude: 'fuerte' }],
                    losses: [{ icon: '💥', label: 'Golpe a Salarios Reales', magnitude: 'fuerte' }],
                    risks: [{ icon: '📉', label: 'Caída brusca de la popularidad', magnitude: 'fuerte' }],
                    beneficiaries: ['Campo', 'Inversores'],
                    opponents: ['Trabajadores', 'Clase Media'],
                },
                effects: {
                    national: { economy: { inflation: 12, reserves: 8, gdp: -2 }, society: { poverty: 6 } },
                    reputation: { campo: 15, mercados: 10, trabajadores: -18, 'clase-media': -10 },
                    character: { popularity: -12, pragmatismo: 8 },
                },
                delayedEffects: [],
            },
            {
                id: 'choice-dolar-diferenciado',
                label: 'Crear tipo de cambio diferenciado por sector',
                description: 'Establecés un tipo de cambio alto para exportaciones e importaciones suntuarias y uno preferencial para medicinas e insumos.',
                preview: {
                    gains: [{ icon: '🎛️', label: 'Control quirúrgico del impacto social', magnitude: 'moderado' }],
                    losses: [{ icon: '🌀', label: 'Complejidad administrativa en Aduana', magnitude: 'moderado' }],
                    risks: [{ icon: '🔍', label: 'Tentación de sobrefacturación en importaciones', magnitude: 'fuerte' }],
                    beneficiaries: ['Industria', 'Campo'],
                    opponents: ['Mercados'],
                },
                effects: {
                    national: { economy: { reserves: 4, gdp: 2, inflation: 3 } },
                    reputation: { industria: 8, campo: 6, mercados: -5 },
                    character: { pragmatismo: 7 },
                },
                delayedEffects: [],
            },
        ],
    },
    {
        id: 'dec-retenciones-agro',
        title: 'Alícuota de Derechos de Exportación Agropecuarios',
        description: 'La Sociedad Rural protesta por la presión impositiva sobre los embarques de granos.',
        source: 'Confederaciones Rurales',
        urgency: 'alta',
        category: 'economico',
        repeatable: true,
        cooldown: 8,
        requirements: [],
        choices: [
            {
                id: 'choice-subir-retenciones',
                label: 'Subir 5% las alícuotas para financiar gasto social',
                description: 'Aumenta la recaudación fiscal pero desata tractorazos y cortes de ruta en la Pampa.',
                preview: {
                    gains: [{ icon: '💵', label: 'Recaudación del Tesoro', magnitude: 'fuerte' }],
                    losses: [{ icon: '🚜', label: 'Relación con el sector agropecuario', magnitude: 'fuerte' }],
                    risks: [{ icon: '🛑', label: 'Cortes de ruta e interrupción de suministros', magnitude: 'moderado' }],
                    beneficiaries: ['Jubilados', 'Trabajadores'],
                    opponents: ['Campo'],
                },
                effects: {
                    national: { economy: { reserves: 5 }, society: { poverty: -2 } },
                    reputation: { campo: -20, trabajadores: 6, jubilados: 5 },
                    character: { popularity: -2 },
                },
                delayedEffects: [],
            },
            {
                id: 'choice-bajar-retenciones',
                label: 'Bajar retenciones para incentivar liquidación',
                description: 'Estimula el ingreso de divisas pero deja al estado sin margen fiscal.',
                preview: {
                    gains: [{ icon: '🌾', label: 'Liquidación masiva de divisas', magnitude: 'fuerte' }],
                    losses: [{ icon: '⚠️', label: 'Déficit en cuentas del estado', magnitude: 'moderado' }],
                    risks: [],
                    beneficiaries: ['Campo', 'Mercados'],
                    opponents: ['ONGs'],
                },
                effects: {
                    national: { economy: { reserves: 7, gdp: 3 } },
                    reputation: { campo: 18, mercados: 10 },
                    character: { popularity: 4, pragmatismo: 3 },
                },
                delayedEffects: [],
            },
            {
                id: 'choice-bono-infraestructura-agro',
                label: 'Devolver 50% de retenciones en bonos de obras rurales',
                description: 'Mantenés la alícuota pero los productores pueden usar la mitad para asfaltar caminos rurales y puertos.',
                preview: {
                    gains: [{ icon: '🛣️', label: 'Mejora de logística productiva', magnitude: 'fuerte' }],
                    losses: [{ icon: '⏳', label: 'Recaudación fiscal diferida', magnitude: 'moderado' }],
                    risks: [],
                    beneficiaries: ['Campo', 'Industria'],
                    opponents: ['Mercados'],
                },
                effects: {
                    national: { economy: { reserves: 3, gdp: 4 } },
                    reputation: { campo: 10, industria: 8, mercados: 2 },
                    character: { popularity: 5, pragmatismo: 6 },
                },
                delayedEffects: [],
            },
        ],
    },
    {
        id: 'dec-paritaria-docente',
        title: 'Negociación Paritaria Nacional Docente',
        description: 'La confederación de educadores exige una recomposición salarial por encima de la inflación anual.',
        source: 'Gremio de Educadores',
        urgency: 'alta',
        category: 'social',
        repeatable: true,
        cooldown: 6,
        requirements: [],
        choices: [
            {
                id: 'choice-conceder-paritaria',
                label: 'Conceder el aumento solicitado del 45%',
                description: 'Garantiza las clases y pacifica las escuelas, pero desequilibra los presupuestos provinciales.',
                preview: {
                    gains: [{ icon: '📚', label: 'Paz Social Escolar', magnitude: 'fuerte' }],
                    losses: [{ icon: '💸', label: 'Presión sobre Tesorerías', magnitude: 'moderado' }],
                    risks: [],
                    beneficiaries: ['Docentes', 'Trabajadores'],
                    opponents: ['Mercados'],
                },
                effects: {
                    national: { society: { education: 5 }, economy: { reserves: -4 } },
                    reputation: { docentes: 16, universidades: 8, mercados: -6 },
                    character: { popularity: 5, idealismo: 4 },
                },
                delayedEffects: [],
            },
            {
                id: 'choice-topar-paritaria',
                label: 'Imponer un techo del 25% por decreto',
                description: 'Defiende las arcas públicas pero provoca paros de 48 horas e itinerantes.',
                preview: {
                    gains: [{ icon: '🛡️', label: 'Disciplina Fiscal', magnitude: 'moderado' }],
                    losses: [{ icon: '🚫', label: 'Días de clases perdidos por huelgas', magnitude: 'fuerte' }],
                    risks: [{ icon: '🔥', label: 'Protestas de docentes y familias', magnitude: 'fuerte' }],
                    beneficiaries: ['Mercados'],
                    opponents: ['Docentes', 'Universidades'],
                },
                effects: {
                    national: { society: { education: -6, socialConflicts: 6 } },
                    reputation: { docentes: -18, universidades: -10, mercados: 8 },
                    character: { popularity: -6, pragmatismo: 5 },
                },
                delayedEffects: [],
            },
            {
                id: 'choice-clausula-gatillo',
                label: 'Ofrecer 30% fijo + cláusula gatillo por inflación',
                description: 'Ajustás los sueldos en función del IPC real cada 3 meses. Evitás paros pero atenás el gasto a la inflación.',
                preview: {
                    gains: [{ icon: '🤝', label: 'Acuerdo firmado sin días perdidos', magnitude: 'fuerte' }],
                    losses: [{ icon: '📊', label: 'Indexación del gasto público', magnitude: 'moderado' }],
                    risks: [],
                    beneficiaries: ['Docentes', 'Clase Media'],
                    opponents: ['Mercados'],
                },
                effects: {
                    national: { society: { education: 3 }, economy: { reserves: -2, inflation: 1 } },
                    reputation: { docentes: 10, 'clase-media': 6, mercados: -2 },
                    character: { popularity: 4, pragmatismo: 6 },
                },
                delayedEffects: [],
            },
        ],
    },
    {
        id: 'dec-fmi-renegociacion',
        title: 'Renegociación con el Organismo Multilateral de Crédito',
        description: 'Vence el plazo para el pago de un tramo de deuda de 4.500 millones de dólares. El staff del organismo exige reformas estructurales.',
        source: 'Ministro de Economía',
        urgency: 'critica',
        category: 'economico',
        repeatable: true,
        cooldown: 12,
        requirements: [],
        choices: [
            {
                id: 'choice-aceptar-condiciones-fmi',
                label: 'Aceptar condiciones y firmar nuevo acuerdo',
                description: 'Llegan dólares frescos pero exigen reducción de empleados públicos, tarifazo y tope salarial.',
                preview: {
                    gains: [{ icon: '💵', label: 'Inyección de dólares al Banco Central', magnitude: 'fuerte' }],
                    losses: [{ icon: '✊', label: 'Conflicto social y huelgas masivas', magnitude: 'fuerte' }],
                    risks: [{ icon: '🔥', label: 'Inestabilidad si el ajuste falla', magnitude: 'fuerte' }],
                    beneficiaries: ['Mercados', 'Inversores', 'Organismos Internacionales'],
                    opponents: ['Trabajadores', 'Docentes', 'Jubilados'],
                },
                effects: {
                    national: { economy: { reserves: 15, debt: 8 }, society: { poverty: 5, employment: -4, socialConflicts: 10 } },
                    reputation: { mercados: 15, inversores: 12, 'organismos-internacionales': 10, trabajadores: -20, jubilados: -15 },
                    character: { popularity: -12, pragmatismo: 10 },
                },
                delayedEffects: [
                    {
                        turnsDelay: 3,
                        probability: 0.8,
                        effects: { national: { society: { socialConflicts: 15 } }, character: { popularity: -8 } },
                        description: 'Paro general de 36 horas contra el ajuste pactado con el organismo acreedor. La Central de Trabajadores marcha a la sede del gobierno.',
                        sourceDecisionId: 'dec-fmi-renegociacion',
                        originTurn: 0,
                    },
                ],
            },
            {
                id: 'choice-rechazar-fmi',
                label: 'Rechazar las condiciones y declarar moratoria',
                description: 'Gesto soberanista que desata euforia popular pero cierra las puertas del crédito internacional.',
                preview: {
                    gains: [{ icon: '🇦🇷', label: 'Éxtasis popular nacionalista', magnitude: 'fuerte' }],
                    losses: [{ icon: '🚫', label: 'Cierre total del crédito internacional', magnitude: 'fuerte' }],
                    risks: [{ icon: '📉', label: 'Corrida cambiaria y devaluación', magnitude: 'fuerte' }],
                    beneficiaries: ['Trabajadores', 'Jóvenes'],
                    opponents: ['Mercados', 'Inversores', 'Organismos Internacionales'],
                },
                effects: {
                    national: { economy: { reserves: -8, inflation: 8 }, governance: { internationalImage: -15 } },
                    reputation: { trabajadores: 18, jovenes: 15, mercados: -25, inversores: -20, 'organismos-internacionales': -18 },
                    character: { popularity: 15, idealismo: 10 },
                },
                delayedEffects: [
                    {
                        turnsDelay: 4,
                        probability: 0.7,
                        effects: { national: { economy: { inflation: 15, reserves: -10 } } },
                        description: 'La corrida cambiaria post-default erosiona los ahorros de la clase media.',
                        sourceDecisionId: 'dec-fmi-renegociacion',
                        originTurn: 0,
                    },
                ],
            },
            {
                id: 'choice-acuerdo-puente-facilidades',
                label: 'Negociar acuerdo puente de facilidades extendidas',
                description: 'Pagás solo intereses y diferís el capital a 10 años prometiendo reformas estructurales progresivas.',
                preview: {
                    gains: [{ icon: '🤝', label: 'Tiempo político y paz cambiaria temporal', magnitude: 'fuerte' }],
                    losses: [{ icon: '⏳', label: 'Deuda extendida en el tiempo', magnitude: 'moderado' }],
                    risks: [{ icon: '📋', label: 'Revisiones trimestrales del organismo acreedor', magnitude: 'moderado' }],
                    beneficiaries: ['Mercados', 'Organismos Internacionales'],
                    opponents: [],
                },
                effects: {
                    national: { economy: { reserves: 6, debt: 3 }, governance: { internationalImage: 4 } },
                    reputation: { mercados: 8, 'organismos-internacionales': 8, 'clase-media': 4 },
                    character: { popularity: 2, pragmatismo: 8 },
                },
                delayedEffects: [],
            },
        ],
    },
];
export function getEligibleDecisions(state) {
    const takenChoiceIds = new Set(state.decisionHistory.map((dh) => dh.choiceId));
    return DECISION_POOL.map((d) => {
        const remainingChoices = d.choices.filter((choice) => !takenChoiceIds.has(choice.id));
        return {
            ...d,
            choices: remainingChoices,
        };
    }).filter((d) => {
        // Si la decisión ya no tiene opciones sin elegir, no es elegible
        if (d.choices.length === 0) {
            return false;
        }
        const history = state.decisionHistory.filter((dh) => dh.id === d.id);
        if (history.length > 0 && !d.repeatable) {
            return false;
        }
        if (d.repeatable && d.cooldown) {
            const lastTaken = history[history.length - 1];
            if (lastTaken && state.turn - lastTaken.turn < d.cooldown) {
                return false;
            }
        }
        return true;
    });
}
