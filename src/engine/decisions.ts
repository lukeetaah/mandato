import type { Decision, DecisionChoice, GameState } from './types';

export const DECISION_POOL: Decision[] = [
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
      {
        id: 'choice-sostener-reservas-propias',
        label: 'No intervenir — Sostener liquidez con reservas corrientes',
        description: 'Rechazás acuerdos o ventas de emergencia. Confiás en que el nivel de divisas actual alcance para cubrir los vencimientos sin sobresaltos.',
        preview: {
          gains: [{ icon: '🏛️', label: 'Autonomía de gestión sin deuda extra', magnitude: 'moderado' }],
          losses: [{ icon: '📉', label: 'Margen de liquidez ajustado', magnitude: 'moderado' }],
          risks: [{ icon: '⚠️', label: 'Riesgo de tensiones si las divisas caen', magnitude: 'moderado' }],
          beneficiaries: ['Clase Media', 'Jóvenes'],
          opponents: ['Mercados'],
        },
        effects: {
          national: { economy: { reserves: -4 } },
          reputation: { 'clase-media': 6, mercados: -6 },
          character: { idealismo: 6, pragmatismo: -4 },
        },
        delayedEffects: [],
      },
    ],
  },

  // ─── DECISIONES TRÁGICAS, CÓMICAS Y CULTURALES (LORE) ───
  {
    id: 'dec-mundial-feriado',
    title: '🎉 ¡EL PAÍS LLEGÓ A LA FINAL DEL MUNDIAL DE FÚTBOL!',
    description: 'La selección nacional disputará el partido decisivo este domingo. Los sindicatos y alcaldes exigen decretar feriado nacional de 48 horas para "celebrar la gloria o procesar el duelo". Los empresarios advierten pérdidas millonarias.',
    source: 'Jefe de Gabinete & Unión Sindical',
    urgency: 'alta',
    category: 'politico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-feriado-total',
        label: 'Decretar Feriado Nacional de 48 horas con Asueto Total',
        description: 'Parás el país entero. Millones celebran en las calles con banderas y cornetas. La industria pierde un día de producción.',
        preview: {
          gains: [{ icon: '🎉', label: 'Popularidad y fiesta popular masiva', magnitude: 'fuerte' }],
          losses: [{ icon: '🏭', label: 'Actividad industrial y recaudación fiscal', magnitude: 'fuerte' }],
          risks: [{ icon: '🍺', label: 'Desbordes en las plazas y transporte público', magnitude: 'moderado' }],
          beneficiaries: ['Trabajadores', 'Jóvenes'],
          opponents: ['Empresarios', 'Mercados'],
        },
        effects: {
          national: { economy: { gdp: -2, reserves: -1 }, society: { trust: 12, socialConflicts: -10 } },
          reputation: { trabajadores: 16, jovenes: 18, mercados: -14, empresarios: -16 },
          character: { popularity: 14, ego: 10, idealismo: 8 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-sin-feriado',
        label: 'Mantener día hábil estricto: "El país se saca adelante trabajando"',
        description: 'Rechazás el feriado. Te ganas el aplauso de las cámaras empresarias pero el 70% de los empleados falta a sus puestos de todos modos.',
        preview: {
          gains: [{ icon: '📊', label: 'Respeto de los sectores productivos', magnitude: 'moderado' }],
          losses: [{ icon: '😡', label: 'Furia popular y ausentismo récord', magnitude: 'fuerte' }],
          risks: [{ icon: '📢', label: 'Cacerolazos y abucheos en estadios', magnitude: 'fuerte' }],
          beneficiaries: ['Empresarios', 'Mercados'],
          opponents: ['Trabajadores', 'Jóvenes'],
        },
        effects: {
          national: { economy: { gdp: 1 }, society: { trust: -10 } },
          reputation: { empresarios: 12, mercados: 10, trabajadores: -18, jovenes: -20 },
          character: { popularity: -12, pragmatismo: 10 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-mascota-cadena',
    title: '🐶 POLÉMICA POR USO DE CADENA NACIONAL',
    description: 'En un impulso de comunicación humana, transmitiste por Cadena Nacional de Radio y TV un mensaje especial por el cumpleaños de tu mascota. Los medios opositores hablan de "bochorno institucional".',
    source: 'Secretario de Comunicación',
    urgency: 'media',
    category: 'mediatico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-defender-mascota',
        label: 'Ratificar el mensaje: "La empatía con los animales también es política de Estado"',
        description: 'Publicás fotos con la mascota en redes oficiales. Se viralizan memes a favor y en contra.',
        preview: {
          gains: [{ icon: '🐶', label: 'Empatía en sectores jóvenes y proteccionistas', magnitude: 'moderado' }],
          losses: [{ icon: '📰', label: 'Respeto de analistas políticos e instituciones', magnitude: 'moderado' }],
          risks: [{ icon: '🤡', label: 'Sátiras permanentes en programas de humor', magnitude: 'fuerte' }],
          beneficiaries: ['Jóvenes', 'ONGs'],
          opponents: ['Oposición', 'Mercados'],
        },
        effects: {
          national: { governance: { institutionality: -4 } },
          reputation: { jovenes: 10, ongs: 12, mercados: -8 },
          character: { popularity: -2, ego: 8 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-disculpa-tecnica',
        label: 'Emitir aclaración técnica alegando error de programación en la red federal',
        description: 'Le echás la culpa a un técnico de guardia y prometés revisar los protocolos de transmisión.',
        preview: {
          gains: [{ icon: '🛡️', label: 'Control de daños institucional', magnitude: 'leve' }],
          losses: [{ icon: '🤦', label: 'Imagen de falta de control interno', magnitude: 'leve' }],
          risks: [{ icon: '📰', label: 'Filtración del técnico despedido', magnitude: 'leve' }],
          beneficiaries: ['Clase Media'],
          opponents: ['Trabajadores'],
        },
        effects: {
          national: { governance: { institutionality: 2 } },
          reputation: { 'clase-media': 4 },
          character: { pragmatismo: 4 },
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

const compactPreview = (gain: string, loss: string, risk: string) => ({
  gains: [{ icon: '✓', label: gain, magnitude: 'moderado' as const }],
  losses: [{ icon: '⚠', label: loss, magnitude: 'moderado' as const }],
  risks: [{ icon: '!', label: risk, magnitude: 'moderado' as const }],
  beneficiaries: [],
  opponents: [],
});

const campaignChoice = (id: string, label: string, description: string, effects: DecisionChoice['effects'], flag: string): DecisionChoice => ({
  id,
  label,
  description,
  preview: compactPreview('Más chances de ganar votos', 'Costo político y reputacional', 'Una filtración puede cambiar la lectura'),
  effects,
  delayedEffects: [],
  flags: [flag],
});

const CAMPAIGN_DECISIONS: Decision[] = [
  {
    id: 'dec-campana-legislativa',
    title: 'CAMPAÑA LEGISLATIVA: EL CONGRESO SE JUEGA EN LA CALLE',
    description: 'Faltan pocas semanas para las legislativas. No alcanza con inaugurar una obra: tenés que decidir qué vínculo vas a construir con prensa, redes, influencers y los territorios que todavía no te perdonaron.',
    source: 'Jefatura de Gabinete y equipo electoral',
    urgency: 'alta',
    category: 'politico',
    repeatable: true,
    cooldown: 24,
    requirements: [],
    choices: [
      campaignChoice('choice-legislativa-medios', 'Pactar cobertura favorable con medios nacionales', 'Garantizás entrevistas y tapas amables. La prensa empieza a cobrarte la gentileza con intereses.', { reputation: { prensa: 10, 'clase-media': 3 }, character: { popularity: 4, pragmatismo: 3 } }, 'campaign-legislative-media'),
      campaignChoice('choice-legislativa-influencers', 'Financiar una red de influencers territoriales', 'Creadores locales convierten tus políticas en videos, chistes internos y recorridas con mate. Nadie sabe quién les paga.', { national: { society: { polarization: 4 } }, reputation: { jovenes: 12, prensa: -3 }, character: { popularity: 5, ego: 3 } }, 'campaign-legislative-influencers'),
      campaignChoice('choice-legislativa-territorio', 'Hacer campaña puerta a puerta con gobernadores', 'Dejás el estudio de televisión y aceptás que cada gobernador te cobre la foto con una promesa de obra.', { national: { economy: { investment: 2 } }, reputation: { campo: 5, 'clase-media': 4 }, character: { popularity: 4, pragmatismo: 4 } }, 'campaign-legislative-territory'),
    ],
  },
  // ─── NUEVAS CRISIS Y DECISIONES ESTRATÉGICAS ───
  {
    id: 'dec-narcotrafico-frontera',
    title: '🚨 ALERTA DE SEGURIDAD: EXPANSIÓN DEL NARCOTRÁFICO EN EL NORTE',
    description: 'Bandas criminales internacionales han tomado el control de puertos y rutas fronterizas en el Noroeste Andino. La policía local está desbordada y la población exige respuestas.',
    source: 'Ministro de Seguridad',
    urgency: 'critica',
    category: 'politico',
    repeatable: true,
    cooldown: 12,
    requirements: [],
    choices: [
      {
        id: 'choice-militarizar-frontera',
        label: 'Desplegar las Fuerzas Armadas en la Frontera Norte',
        description: 'Enviás al Ejército a patrullar la frontera y puertos. Restablece el orden rápido pero genera alarma internacional.',
        preview: {
          gains: [{ icon: '🛡️', label: 'Baja inmediata de inseguridad', magnitude: 'fuerte' }],
          losses: [{ icon: '⚖️', label: 'Imagen de institucionalidad internacional', magnitude: 'moderado' }],
          risks: [{ icon: '⚠️', label: 'Tensiones con organismos de derechos humanos', magnitude: 'moderado' }],
          beneficiaries: ['Clase Media', 'Gobernadores del Norte'],
          opponents: ['ONGs', 'Jóvenes'],
        },
        effects: {
          national: { society: { insecurity: -12, socialConflicts: 4 }, governance: { internationalImage: -6 } },
          reputation: { 'clase-media': 10, ongs: -14, jovenes: -8 },
          character: { popularity: 6, pragmatismo: 7, idealismo: -5 },
        },
        delayedEffects: [
          {
            turnsDelay: 6,
            probability: 0.4,
            effects: { national: { governance: { institutionality: -5 } }, character: { stress: 4 } },
            description: 'Un choque armado en la frontera deja víctimas civiles y la oposición exige interpelar al Ministro.',
            sourceDecisionId: 'dec-narcotrafico-frontera',
            originTurn: 0,
          },
        ],
      },
      {
        id: 'choice-agencia-antidrogas',
        label: 'Crear Agencia Federal Antidrogas con Fondos Reservados',
        description: 'Creás un cuerpo élite de inteligencia e investigación. Proceso profesional pero costoso y de resultado a mediano plazo.',
        preview: {
          gains: [{ icon: '🕵️', label: 'Capacidad de inteligencia estratégica', magnitude: 'fuerte' }],
          losses: [{ icon: '💵', label: 'Costo fiscal y reservas', magnitude: 'moderado' }],
          risks: [{ icon: '💼', label: 'Riesgo de corrupción interna en la nueva agencia', magnitude: 'fuerte' }],
          beneficiaries: ['Justicia', 'Empresarios'],
          opponents: ['Sindicatos'],
        },
        effects: {
          national: { society: { insecurity: -6 }, economy: { reserves: -3 }, governance: { institutionality: 4 } },
          reputation: { mercados: 5, prensa: 8, 'clase-media': 6 },
          character: { popularity: 3, pragmatismo: 6 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-reforma-laboral-flexibilidad',
    title: '📜 PROYECTO DE REFORMA Y MODERNIZACIÓN LABORAL',
    description: 'Las cámaras empresarias y los fondos de inversión exigen flexibilizar las indemnizaciones y contratos para contratar más personal. Los sindicatos prometen paro general indeterminado.',
    source: 'Ministro de Trabajo & Cámaras Empresarias',
    urgency: 'alta',
    category: 'economico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-reforma-empresarial-total',
        label: 'Aprobar Reforma Laboral por Decreto de Necesidad y Urgencia',
        description: 'Reemplazás indemnizaciones por fondo de cese y desregulas horas de trabajo. Aplauso de mercados y furia sindical.',
        preview: {
          gains: [{ icon: '🚀', label: 'Inversión extranjera y empleo privado', magnitude: 'fuerte' }],
          losses: [{ icon: '🔥', label: 'Conflicto social y huelga general', magnitude: 'fuerte' }],
          risks: [{ icon: '⚖️', label: 'La Corte Suprema declara inconstitucional el DNU', magnitude: 'fuerte' }],
          beneficiaries: ['Inversores', 'Empresarios', 'Mercados'],
          opponents: ['Trabajadores', 'Docentes'],
        },
        effects: {
          national: { economy: { investment: 15 }, society: { employment: 8, socialConflicts: 16, poverty: 4 } },
          reputation: { mercados: 18, empresarios: 20, trabajadores: -25, docentes: -15 },
          character: { popularity: -8, pragmatismo: 10, idealismo: -10 },
        },
        delayedEffects: [
          {
            turnsDelay: 3,
            probability: 0.75,
            effects: { national: { society: { socialConflicts: 12 }, governance: { institutionality: -6 } }, character: { stress: 8 } },
            description: 'Paro general nacional paraliza puertos, trenes y aeropuertos por 72 horas.',
            sourceDecisionId: 'dec-reforma-laboral-flexibilidad',
            originTurn: 0,
          },
        ],
      },
      {
        id: 'choice-reforma-tripartita',
        label: 'Convocar Mesa Tripartita (Gobierno, Sindicatos, Empresarios)',
        description: 'Buscás un acuerdo de modernización gradual negociando punto por punto.',
        preview: {
          gains: [{ icon: '🤝', label: 'Consenso político y paz social', magnitude: 'moderado' }],
          losses: [{ icon: '⏳', label: 'Impacto económico lento', magnitude: 'leve' }],
          risks: [],
          beneficiaries: ['Clase Media', 'Trabajadores'],
          opponents: ['Sectores duros de la oposición'],
        },
        effects: {
          national: { economy: { investment: 4 }, society: { employment: 3, socialConflicts: -4 }, governance: { institutionality: 6 } },
          reputation: { trabajadores: 8, empresarios: 6, 'clase-media': 10 },
          character: { popularity: 5, pragmatismo: 6, idealismo: 4 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-crisis-energia-invierno',
    title: '❄️ COLAPSO ENERGÉTICO EN PICO INVERNAL',
    description: 'Una ola de frío polar sin precedentes dispara la demanda de gas y electricidad. Las reservas de gas son insuficientes y hay riesgo de apagón nacional masivo en 48 horas.',
    source: 'Secretario de Energía',
    urgency: 'critica',
    category: 'economico',
    repeatable: true,
    cooldown: 10,
    requirements: [],
    choices: [
      {
        id: 'choice-cortar-gas-industria',
        label: 'Cortar suministro de gas a industrias para priorizar hogares',
        description: 'Evitás que la población sufra hipotermia, pero la industria se frena por completo.',
        preview: {
          gains: [{ icon: '🏠', label: 'Hogares calefaccionados y paz social', magnitude: 'fuerte' }],
          losses: [{ icon: '🏭', label: 'Pérdidas industriales y caída de PBI', magnitude: 'fuerte' }],
          risks: [],
          beneficiaries: ['Clase Media', 'Trabajadores'],
          opponents: ['Empresarios', 'Industria'],
        },
        effects: {
          national: { economy: { gdp: -3, investment: -4 }, society: { trust: 4, socialConflicts: -2 } },
          reputation: { 'clase-media': 8, empresarios: -14, industria: -16 },
          character: { popularity: 4, idealismo: 5 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-importar-barcos-gnl',
        label: 'Importar Barcos de Gas Natural Licuado (GNL) de Emergencia',
        description: 'Comprás barcos metaneros a precio spot internacional. Sostenés hogares e industrias pero vaciás las reservas.',
        preview: {
          gains: [{ icon: '⚡', label: 'Suministro continuo sin cortes', magnitude: 'fuerte' }],
          losses: [{ icon: '💵', label: 'Sangría masiva de reservas en divisas', magnitude: 'fuerte' }],
          risks: [{ icon: '📉', label: 'Aceleración del riesgo país', magnitude: 'moderado' }],
          beneficiaries: ['Empresarios', 'Industria'],
          opponents: ['Mercados'],
        },
        effects: {
          national: { economy: { reserves: -12, gdp: 2 } },
          reputation: { empresarios: 10, mercados: -12 },
          character: { popularity: 2, pragmatismo: 8 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-catastrofe-ambiental-incendios',
    title: '🔥 EMERGENCY: INCENDIOS FORESTALES DESCONTROLADOS EN EL SUR',
    description: 'Miles de hectáreas de bosques nativos y zonas turísticas están ardiendo en el Sur Patagónico. Los gobernadores locales exigen auxilio federal e infraestructura de bomberos.',
    source: 'Gobernador del Sur Patagónico',
    urgency: 'alta',
    category: 'social',
    repeatable: true,
    cooldown: 12,
    requirements: [],
    choices: [
      {
        id: 'choice-fondo-emergencia-incendios',
        label: 'Enviar Fondo de Emergencia y Cuadrillas Federales',
        description: 'Movilizás el Fondo Nacional del Fuego e instalás un comando militarizado de contención.',
        preview: {
          gains: [{ icon: '🌲', label: 'Contención del fuego e impacto ambiental', magnitude: 'fuerte' }],
          losses: [{ icon: '💸', label: 'Costo fiscal imprevisto', magnitude: 'moderado' }],
          risks: [],
          beneficiaries: ['Jóvenes', 'ONGs', 'Sur Patagónico'],
          opponents: ['Mercados'],
        },
        effects: {
          national: { economy: { reserves: -4 }, society: { trust: 6 }, governance: { internationalImage: 4 } },
          reputation: { jovenes: 12, ongs: 15, 'clase-media': 6 },
          character: { popularity: 6, idealismo: 8 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-pedir-ayuda-internacional',
        label: 'Solicitar Asistencia Técnica y Aviones Hidrantes a Vecinos',
        description: 'Pedís ayuda humanitaria internacional. Ahorrás recursos pero la oposición crítica la falta de equipamiento nacional.',
        preview: {
          gains: [{ icon: '✈️', label: 'Ayuda técnica sin gran costo fiscal', magnitude: 'fuerte' }],
          losses: [{ icon: '📰', label: 'Críticas por improvisación en equipamiento', magnitude: 'moderado' }],
          risks: [],
          beneficiaries: ['Mercados'],
          opponents: ['Prensa'],
        },
        effects: {
          national: { economy: { reserves: -1 }, governance: { internationalImage: -2 } },
          reputation: { prensa: -8, 'clase-media': -4 },
          character: { popularity: -3, pragmatismo: 5 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-espionaje-ilegal-carpetas',
    title: '🕵️ ESCÁNDALO DE FILTRACIÓN DE ESCUCHAS Y ESPIONAJE',
    description: 'Un portal opositor filtró miles de horas de audios del Organismo Federal de Inteligencia que muestran espionaje a jueces, periodistas y legisladores.',
    source: 'Secretario de Inteligencia',
    urgency: 'critica',
    category: 'mediatico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-disolver-inteligencia',
        label: 'Disolver el Organismo y Entregar Archivos a la Justicia',
        description: 'Tomás una medida drástica de institucionalidad moral. Limpiás la imagen pero perdés el control de la inteligencia.',
        preview: {
          gains: [{ icon: '⚖️', label: 'Salto cualitativo en calidad institucional', magnitude: 'fuerte' }],
          losses: [{ icon: '🛡️', label: 'Pérdida de inteligencia política y seguridad', magnitude: 'fuerte' }],
          risks: [],
          beneficiaries: ['Prensa', 'ONGs', 'Jóvenes'],
          opponents: ['Operadores Políticos'],
        },
        effects: {
          national: { governance: { institutionality: 18, corruption: -10 } },
          reputation: { prensa: 15, ongs: 18, jovenes: 10, mercados: 5 },
          character: { popularity: 8, idealismo: 15, pragmatismo: -8 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-desmentir-audio-ia',
        label: 'Declarar que los audios fueron generados con Inteligencia Artificial',
        description: 'Lanzás una contraofensiva mediática asegurando que es una operación de guerra sucia de servicios extranjeros.',
        preview: {
          gains: [{ icon: '🛡️', label: 'Protección de cuadros propios', magnitude: 'moderado' }],
          losses: [{ icon: '🤦', label: 'Credibilidad en sectores analíticos', magnitude: 'fuerte' }],
          risks: [{ icon: '💣', label: 'Un peritaje técnico independiente confirma la veracidad', magnitude: 'fuerte' }],
          beneficiaries: ['Aliados Políticos'],
          opponents: ['Prensa', 'Clase Media'],
        },
        effects: {
          national: { governance: { corruption: 6, institutionality: -8 } },
          reputation: { prensa: -16, 'clase-media': -10 },
          character: { popularity: -6, pragmatismo: 8, idealismo: -10 },
        },
        delayedEffects: [
          {
            turnsDelay: 4,
            probability: 0.8,
            effects: { national: { governance: { institutionality: -10 }, society: { trust: -8 } }, character: { popularity: -10 } },
            description: 'Peritos internacionales demuestran la autenticidad de las grabaciones de inteligencia.',
            sourceDecisionId: 'dec-espionaje-ilegal-carpetas',
            originTurn: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'dec-reforma-judicial-corte',
    title: '⚖️ REFORMA DEL PODER JUDICIAL Y CORTE SUPREMA',
    description: 'Varios fallos judiciales adversos frenan decretos del Ejecutivo. El bloque oficialista propone ampliar la Corte Suprema de 5 a 15 miembros.',
    source: 'Ministro de Justicia',
    urgency: 'alta',
    category: 'politico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-ampliar-corte',
        label: 'Aprobar la Ampliación de la Corte Suprema a 15 Jueces',
        description: 'Nombrás jueces afines y te garantizás mayoría jurídica para tus reformas. Severa condena internacional.',
        preview: {
          gains: [{ icon: '⚡', label: 'Gobernabilidad y avance de decretos', magnitude: 'fuerte' }],
          losses: [{ icon: '🏛️', label: 'Independencia de poderes e imagen exterior', magnitude: 'fuerte' }],
          risks: [{ icon: '📢', label: 'Denuncia internacional en el Tribunal Interamericano', magnitude: 'fuerte' }],
          beneficiaries: ['Militancia', 'Gobernadores'],
          opponents: ['Prensa', 'Mercados', 'ONGs'],
        },
        effects: {
          national: { governance: { institutionality: -16, corruption: 8, internationalImage: -12 } },
          reputation: { prensa: -18, mercados: -14, ongs: -20, 'clase-media': -12 },
          character: { popularity: -6, pragmatismo: 12, idealismo: -15 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-pacto-judicial-consenso',
        label: 'Negociar Pliegos de Consenso para Cubrir Vacantes Existentes',
        description: 'Enviás candidatos con acuerdo de la oposición y de colegios de abogados.',
        preview: {
          gains: [{ icon: '🤝', label: 'Estabilidad y prestigio institucional', magnitude: 'fuerte' }],
          losses: [{ icon: '⏳', label: 'Pérdida de control directo sobre fallos', magnitude: 'moderado' }],
          risks: [],
          beneficiaries: ['Clase Media', 'Prensa', 'Mercados'],
          opponents: ['Sectores Ultra-oficialistas'],
        },
        effects: {
          national: { governance: { institutionality: 12, internationalImage: 8 } },
          reputation: { prensa: 10, mercados: 12, 'clase-media': 14 },
          character: { popularity: 6, idealismo: 10, pragmatismo: 5 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-licitacion-litio-patria',
    title: '🔋 LICITACIÓN ESTRATÉGICA DEL RECURSO DEL LITIO',
    description: 'Los yacimientos de litio del Noroeste Andino reciben ofertas multimillonarias. Se debate entre explotación privada multinacional o control estatal.',
    source: 'Gobernadora del Noroeste Andino',
    urgency: 'alta',
    category: 'economico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-licitacion-multinacional',
        label: 'Conceder la Explotación a Consorcio Multinacional Privado',
        description: 'Cobrás un canon inmediato de $3.000M en divisas y garantizás inversión tecnológica masiva.',
        preview: {
          gains: [{ icon: '💵', label: 'Inyección millonaria de reservas y divisas', magnitude: 'fuerte' }],
          losses: [{ icon: '🌐', label: 'Soberanía sobre recursos minerales', magnitude: 'fuerte' }],
          risks: [],
          beneficiaries: ['Mercados', 'Inversores'],
          opponents: ['ONGs', 'Jóvenes'],
        },
        effects: {
          national: { economy: { reserves: 22, investment: 16, gdp: 5 } },
          reputation: { mercados: 20, inversores: 22, ongs: -15, jovenes: -12 },
          character: { popularity: 4, pragmatismo: 10, idealismo: -8 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-empresa-litio-estatal',
        label: 'Crear Empresa Estatal "Litio Sur" con 51% de Control del Estado',
        description: 'Asegurás el valor agregado nacional y la industrialización local de baterías.',
        preview: {
          gains: [{ icon: '🏭', label: 'Desarrollo tecnológico e industrial soberano', magnitude: 'fuerte' }],
          losses: [{ icon: '⏳', label: 'Resultados fiscales a muy largo plazo', magnitude: 'fuerte' }],
          risks: [],
          beneficiaries: ['Trabajadores', 'Jóvenes', 'Industria'],
          opponents: ['Mercados', 'Inversores'],
        },
        effects: {
          national: { economy: { gdp: 2, reserves: -4 }, society: { employment: 6 } },
          reputation: { industria: 14, trabajadores: 12, jovenes: 10, mercados: -12 },
          character: { popularity: 8, idealismo: 12, pragmatismo: -4 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-conflicto-universitario-toma',
    title: '🎓 TENSIÓN EN LAS UNIVERSIDADES NACIONALES',
    description: 'Estudiantes y docentes mantienen tomadas 20 facultades en protesta por el congelamiento del presupuesto universitario y partidas de investigación.',
    source: 'Federación Universitaria & Decanos',
    urgency: 'alta',
    category: 'social',
    repeatable: true,
    cooldown: 8,
    requirements: [],
    choices: [
      {
        id: 'choice-actualizar-presupuesto-universitario',
        label: 'Actualizar el Presupuesto Universitario por Inflación',
        description: 'Recomponés gastos de funcionamiento y becas. Desactivás la protesta inmediatamente.',
        preview: {
          gains: [{ icon: '📚', label: 'Reapertura de aulas y apoyo joven', magnitude: 'fuerte' }],
          losses: [{ icon: '💸', label: 'Erosión del superávit fiscal', magnitude: 'moderado' }],
          risks: [],
          beneficiaries: ['Docentes', 'Jóvenes', 'Universidades'],
          opponents: ['Mercados'],
        },
        effects: {
          national: { society: { education: 8, socialConflicts: -8 }, economy: { reserves: -5 } },
          reputation: { docentes: 18, universidades: 20, jovenes: 16, mercados: -8 },
          character: { popularity: 7, idealismo: 8 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-auditar-gastos-universitarios',
        label: 'Exigir Auditoría General Externa antes de Enviar Fondos',
        description: 'Cuestionás el uso de los fondos por los decanos y condicionás los desembolsos.',
        preview: {
          gains: [{ icon: '🔍', label: 'Transparencia fiscal y control de gasto', magnitude: 'moderado' }],
          losses: [{ icon: '🔥', label: 'Escalación del conflicto estudiantil', magnitude: 'fuerte' }],
          risks: [],
          beneficiaries: ['Clase Media', 'Mercados'],
          opponents: ['Docentes', 'Universidades', 'Jóvenes'],
        },
        effects: {
          national: { society: { socialConflicts: 10 }, governance: { institutionality: 4 } },
          reputation: { 'clase-media': 8, docentes: -15, universidades: -18, jovenes: -14 },
          character: { popularity: -4, pragmatismo: 7 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-pensiones-jubilaciones-indexacion',
    title: '👵 REFORMA DE LA FÓRMULA DE MOVILIDAD JUBILATORIA',
    description: 'La fórmula actual de haberes previsionales ha dejado a los jubilados perdiendo un 25% contra la inflación. El Congreso presiona para votar una recomposición obligatoria.',
    source: 'Ministro de Economía & Congreso',
    urgency: 'alta',
    category: 'social',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-indexar-jubilaciones-inflacion',
        label: 'Aprobar la Indexación Mensual por Inflación',
        description: 'Garantizás que los haberes no pierdan poder adquisitivo. Aumenta el gasto estructural del Tesoro.',
        preview: {
          gains: [{ icon: '👵', label: 'Dignidad previsional y alivio social', magnitude: 'fuerte' }],
          losses: [{ icon: '📊', label: 'Presión continua sobre las cuentas públicas', magnitude: 'fuerte' }],
          risks: [],
          beneficiaries: ['Jubilados', 'Clase Media', 'Trabajadores'],
          opponents: ['Mercados', 'FMI'],
        },
        effects: {
          national: { society: { poverty: -4, trust: 8 }, economy: { reserves: -6, inflation: 2 } },
          reputation: { jubilados: 25, 'clase-media': 10, trabajadores: 8, mercados: -10 },
          character: { popularity: 8, idealismo: 10, pragmatismo: -4 },
        },
        delayedEffects: [],
      },
      {
        id: 'choice-bonos-discrecionales-jubilados',
        label: 'Veto parcial y Otorgamiento de Bonos de Emergencia Discrecionales',
        description: 'Pagás sumas fijas a los haberes mínimos según disponibilidad de caja sin modificar la ley de fondo.',
        preview: {
          gains: [{ icon: '🎛️', label: 'Control total de la caja fiscal', magnitude: 'moderado' }],
          losses: [{ icon: '👵', label: 'Descontento de la clase media jubilada', magnitude: 'moderado' }],
          risks: [{ icon: '⚖️', label: 'Juicios por reajuste de haberes en la Justicia', magnitude: 'fuerte' }],
          beneficiaries: ['Mercados'],
          opponents: ['Jubilados'],
        },
        effects: {
          national: { economy: { reserves: 2 }, society: { poverty: 2 } },
          reputation: { jubilados: -12, mercados: 8 },
          character: { popularity: -4, pragmatismo: 8 },
        },
        delayedEffects: [
          {
            turnsDelay: 8,
            probability: 0.6,
            effects: { national: { economy: { reserves: -8 } } },
            description: 'Fallo masivo de la Corte Suprema obliga al Estado a pagar reajustes acumulados a jubilados.',
            sourceDecisionId: 'dec-pensiones-jubilaciones-indexacion',
            originTurn: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'dec-fondos-reservas-cripto',
    title: '🪙 INICIATIVA: RESERVA NACIONAL ESTRATÉGICA EN BITCOIN',
    description: 'Un grupo de diputados jóvenes y emprendedores tech proponen diversificar el 5% de las reservas del Banco Central en Bitcoin para proteger al país de la inflación del dólar.',
    source: 'Comisión de Tecnología del Congreso',
    urgency: 'media',
    category: 'economico',
    repeatable: false,
    cooldown: 0,
    requirements: [],
    choices: [
      {
        id: 'choice-comprar-bitcoin-reservas',
        label: 'Autorizar la Compra del 5% de Reservas en Bitcoin',
        description: 'Convertís a la República en pionera financiera global. Volatilidad extrema garantizada.',
        preview: {
          gains: [{ icon: '🚀', label: 'Atracción de inversiones tech y jóvenes', magnitude: 'fuerte' }],
          losses: [{ icon: '📊', label: 'Riesgo de volatilidad en las reservas', magnitude: 'fuerte' }],
          risks: [{ icon: '💥', label: 'Una caída del mercado cripto desploma las reservas', magnitude: 'fuerte' }],
          beneficiaries: ['Jóvenes', 'Inversores Tech'],
          opponents: ['FMI', 'Banco Central', 'Mercados Tradicionales'],
        },
        effects: {
          national: { economy: { reserves: 5, investment: 12 }, governance: { internationalImage: 6 } },
          reputation: { jovenes: 22, inversores: 14, mercados: -10 },
          character: { popularity: 5, pragmatismo: 4, ego: 10 },
        },
        delayedEffects: [
          {
            turnsDelay: 5,
            probability: 0.5,
            effects: { national: { economy: { reserves: 15 } } },
            description: 'El precio de Bitcoin se duplica y la jugada financiera genera entusiasmo mundial.',
            sourceDecisionId: 'dec-fondos-reservas-cripto',
            originTurn: 0,
          },
          {
            turnsDelay: 5,
            probability: 0.35,
            effects: { national: { economy: { reserves: -12 } } },
            description: 'Colapso temporal del mercado cripto evapora divisas del Banco Central.',
            sourceDecisionId: 'dec-fondos-reservas-cripto',
            originTurn: 0,
          },
        ],
      },
      {
        id: 'choice-rechazar-cripto',
        label: 'Rechazar la propuesta y mantener reservas en monedas tradicionales',
        description: 'Priorizás la prudencia ortodoxa y el diálogo con organismos multilaterales.',
        preview: {
          gains: [{ icon: '🏛️', label: 'Prudencia y aval de organismos multilaterales', magnitude: 'moderado' }],
          losses: [{ icon: '🔌', label: 'Pérdida de impulso en la agenda de innovación', magnitude: 'leve' }],
          risks: [],
          beneficiaries: ['Mercados Tradicionales', 'FMI'],
          opponents: ['Jóvenes'],
        },
        effects: {
          national: { economy: { investment: -2 } },
          reputation: { mercados: 6, jovenes: -8 },
          character: { pragmatismo: 6 },
        },
        delayedEffects: [],
      },
    ],
  },
  {
    id: 'dec-campana-presidencial',
    title: 'CAMPAÑA PRESIDENCIAL: CUATRO AÑOS EN UN DEBATE',
    description: 'La elección presidencial ya no se gana solamente con indicadores. Tu rival ofrece una salida simple; vos tenés que decidir si defendés el balance, atacás a la prensa o negociás con quienes pueden cambiar el humor de una provincia en una tarde.',
    source: 'Comando de campaña',
    urgency: 'critica',
    category: 'politico',
    repeatable: true,
    cooldown: 48,
    requirements: [],
    choices: [
      campaignChoice('choice-presidencial-debate', 'Ir al debate y defender cada costo del mandato', 'Mostrás números, cicatrices y decisiones incómodas. No prometés milagros: prometés memoria.', { reputation: { 'clase-media': 8, prensa: 4 }, character: { popularity: 5, stress: 3 } }, 'campaign-presidential-debate'),
      campaignChoice('choice-presidencial-redes', 'Entregar la campaña a las redes y al escándalo', 'Tu equipo fabrica una conversación diaria: clips, filtraciones y una guerra de hashtags. La campaña arde; la República también.', { national: { society: { polarization: 8 } }, reputation: { jovenes: 10, prensa: -8 }, character: { popularity: 6, stress: 5 } }, 'campaign-presidential-networks'),
      campaignChoice('choice-presidencial-acuerdo', 'Cerrar acuerdos con gobernadores e influencers', 'Asegurás fiscales, pauta y videos virales. La gobernabilidad de mañana empieza con una foto que hoy preferirías no explicar.', { reputation: { jovenes: 6, prensa: -4, campo: 4 }, character: { popularity: 4, pragmatismo: 6 } }, 'campaign-presidential-deals'),
    ],
  },
  {
    id: 'dec-oposicion-prensa',
    title: 'OPOSICIÓN: LA CARPETA QUE PUEDE DEVOLVERTE AL CENTRO',
    description: 'Ya no firmás decretos, pero seguís teniendo nombre, contactos y memoria. Un periodista te ofrece publicar una investigación sobre el nuevo gobierno si aceptás compartirle documentos y bancar el costo político.',
    source: 'Periodista de investigación',
    urgency: 'media',
    category: 'mediatico',
    repeatable: true,
    cooldown: 6,
    requirements: [],
    choices: [
      campaignChoice('choice-oposicion-investigar', 'Entregar la carpeta y denunciar desde afuera', 'Convertís tu memoria de Estado en munición opositora. Nadie va a olvidar quién abrió el archivo.', { national: { society: { polarization: 4 } }, reputation: { prensa: 8, jovenes: 3 }, character: { popularity: 3, stress: 2 } }, 'opposition-investigator'),
      campaignChoice('choice-oposicion-negociar', 'Negociar una denuncia a cambio de una reforma', 'No perdonás: negociás. El gobierno salva una cara y vos conseguís que avance una ley que no pudiste aprobar.', { national: { governance: { institutionality: 3 } }, reputation: { prensa: -2, 'clase-media': 6 }, character: { pragmatismo: 5 } }, 'opposition-negotiator'),
    ],
  },
];

export function getDecisionFamilyId(decision: Pick<Decision, 'id' | 'familyId'>): string {
  return decision.familyId ?? decision.id;
}

export function getDecisionCauseKey(decision: Pick<Decision, 'id' | 'causeKey'>, state: GameState): string {
  const { economy } = state.nation;
  const { society, governance } = state.nation;
  const scars = (state.scars ?? []).map((scar) => scar.familyId ?? scar.id).sort().join(',');
  const consequences = (state.persistentConsequences ?? [])
    .filter((consequence) => !consequence.resolved)
    .map((consequence) => consequence.familyId ?? consequence.id)
    .sort()
    .join(',');
  return [
    decision.causeKey ?? decision.id,
    `inf:${Math.floor(economy.inflation / 10)}`,
    `res:${Math.floor(economy.reserves / 10)}`,
    `debt:${Math.floor(economy.debt / 10)}`,
    `conf:${Math.floor(society.socialConflicts / 10)}`,
    `edu:${Math.floor(society.education / 5)}`,
    `inst:${Math.floor(governance.institutionality / 10)}`,
    `scars:${scars}`,
    `consequences:${consequences}`,
  ].join('|');
}

export function getEligibleDecisions(state: GameState): Decision[] {
  return [...DECISION_POOL, ...CAMPAIGN_DECISIONS].filter((d) => {
    const familyId = getDecisionFamilyId(d);
    const causeKey = getDecisionCauseKey(d, state);
    const history = state.decisionHistory.filter((dh) => (dh.familyId ?? dh.id) === familyId);
    if (history.length > 0 && !d.repeatable) {
      return false;
    }

    if (d.repeatable) {
      const lastTaken = history[history.length - 1];
      // El cooldown de datos era demasiado corto: un expediente podía volver
      // a la mesa antes de que el país hubiera tenido tiempo de absorberlo.
      const minimumNarrativeGap = d.id === 'dec-subsidio-transporte' ? 20 : Math.max(12, d.cooldown ?? 0);
      if (lastTaken && state.turn - lastTaken.turn < minimumNarrativeGap) {
        return false;
      }
      if (history.some((entry) => entry.causeKey && entry.causeKey === causeKey)) {
        return false;
      }
    }
    return isRelevantToCountry(d.id, state);
  }).map((decision) => {
    return prepareDecisionForState(decision, state);
  });
}

/** Aplica la misma memoria a expedientes normales y a decisiones nacidas de un evento. */
export function prepareDecisionForState(decision: Decision, state: GameState): Decision {
  const contextualized = contextualizeDecision(contextualizeRecurringDecision(decision, state), state);
  const memoryAware = contextualizeChoiceSet(contextualized, state);
  const withExceptionalPath = addExceptionalPath(memoryAware, state);
  const causeKey = getDecisionCauseKey(decision, state);
  return {
    ...withExceptionalPath,
    familyId: getDecisionFamilyId(decision),
    causeKey,
    choices: annotateChoiceAvailability(withExceptionalPath, state),
  };
}

/** Evita expedientes absurdos: cada tema aparece cuando el país tiene una razón para discutirlo. */
function contextualizeDecision(decision: Decision, state: GameState): Decision {
  if (decision.id !== 'dec-subsidio-transporte') return decision;
  const history = state.decisionHistory.filter((entry) => entry.id === decision.id);
  if (history.length === 0) return decision;

  const round = history.length;
  if (round % 2 === 1) {
    return {
      ...decision,
      title: `TRANSPORTE: LA TARIFA SOCIAL SE ROMPE POR EL MEDIO · Fase ${round + 1}`,
      description: 'Ya aplicaste una solución general y el problema volvió con otra cara. La auditoría muestra que los subsidios llegan distinto según la provincia; esta vez la discusión no es cuánto aumentar, sino quién paga y quién queda afuera.',
      choices: [
        { id: `choice-transporte-ruta-${round}`, label: 'Subsidio focalizado por recorrido y horario', description: 'Protegés los trayectos esenciales y dejás que el resto cubra una parte mayor del costo.', preview: compactPreview('Ayuda a quienes realmente viajan', 'Sistema difícil de controlar', 'Municipios que inventan pasajeros'), effects: { national: { economy: { reserves: -2 }, society: { poverty: -2, trust: 3 } }, reputation: { trabajadores: 8, 'clase-media': 5, mercados: -3 }, character: { popularity: 4, pragmatismo: 3 } }, delayedEffects: [] },
        { id: `choice-transporte-concesiones-${round}`, label: 'Auditar concesiones y publicar los costos reales', description: 'Congelás el aumento durante un mes para mostrar contratos, frecuencias y ganancias. La transparencia llega con olor a nafta.', preview: compactPreview('Control institucional', 'Demora en la solución', 'Una carpeta compromete a aliados'), effects: { national: { governance: { institutionality: 4 }, economy: { investment: -1 } }, reputation: { prensa: 8, 'clase-media': 4, empresarios: -8 }, character: { popularity: 2, stress: 3 } }, delayedEffects: [{ turnsDelay: 5, probability: 0.65, effects: { national: { governance: { corruption: -4 }, society: { socialConflicts: 4 } } }, description: 'La auditoría encuentra una flota fantasma: colectivos que cobran subsidio, pero solo existen en una planilla.', sourceDecisionId: decision.id, originTurn: 0 }] },
        { id: `choice-transporte-regional-${round}`, label: 'Dar autonomía tarifaria a las provincias', description: 'Dejás de administrar cada boleto desde la capital y obligás a cada gobernador a explicar su propia tarifa.', preview: compactPreview('Federalismo y responsabilidad local', 'Un país con precios distintos', 'Gobernadores que usan el boleto como campaña'), effects: { national: { governance: { institutionality: 2 }, society: { trust: -3 } }, reputation: { 'clase-media': -4, campo: 6 }, character: { pragmatismo: 5 } }, delayedEffects: [] },
      ],
    };
  }

  return {
    ...decision,
    title: `TRANSPORTE: EL PARO QUE NO CABE EN UNA PLANILLA · Fase ${round + 1}`,
    description: 'La primera suba y la segunda reforma no resolvieron el fondo. Ahora los choferes paran por turnos, los usuarios organizan mapas de frecuencias y un streamer transmite desde una terminal con más audiencia que el noticiero.',
    choices: [
      { id: `choice-transporte-renegociar-${round}`, label: 'Renegociar concesiones a cambio de frecuencia mínima', description: 'El Estado sostiene los recorridos indispensables; las empresas aceptan ganar menos y mostrar sus libros.', preview: compactPreview('Servicio garantizado', 'Costo fiscal', 'Aliados que pierden negocios'), effects: { national: { economy: { reserves: -3 }, society: { employment: 2, socialConflicts: -7 } }, reputation: { trabajadores: 7, empresarios: -5 }, character: { popularity: 5 } }, delayedEffects: [] },
      { id: `choice-transporte-datos-${round}`, label: 'Publicar un tablero nacional de frecuencias', description: 'La gente puede ver qué línea funciona, cuál cobra y quién incumple. La transparencia no mueve colectivos, pero mueve votos.', preview: compactPreview('Control ciudadano', 'Costo tecnológico', 'Memes con cada demora'), effects: { national: { governance: { institutionality: 3 }, economy: { investment: -1 } }, reputation: { jovenes: 6, prensa: 5 }, character: { popularity: 3, pragmatismo: 3 } }, delayedEffects: [] },
      { id: `choice-transporte-desregulacion-${round}`, label: 'Desregular y dejar entrar nuevos operadores', description: 'Abrís la puerta a cooperativas, aplicaciones y empresas provinciales. Competencia, sí; coordinación, veremos.', preview: compactPreview('Más oferta potencial', 'Regulación más débil', 'Accidentes y concentración'), effects: { national: { economy: { investment: 4 }, governance: { institutionality: -2 } }, reputation: { mercados: 7, trabajadores: -10 }, character: { pragmatismo: 6 } }, delayedEffects: [] },
    ],
  };
}

const RECURRENT_DECISION_TITLES: Record<string, string[]> = {
  'dec-paritaria-docente': [
    'Negociación Paritaria Nacional Docente',
    'EDUCACIÓN: LA PARITARIA YA CARGA CON EL AÑO PASADO',
    'ESCUELAS: EL SALARIO TAMBIÉN ES CAPACIDAD DE ENSEÑAR',
    'EDUCACIÓN: SE DISCUTE QUÉ PAÍS QUEDA EN EL AULA',
  ],
  'dec-fmi-renegociacion': [
    'Renegociación con el Organismo Multilateral de Crédito',
    'DEUDA: EL ACUERDO ANTERIOR YA NO ALCANZA',
    'CRÉDITO: EL ORGANISMO PIDE RESULTADOS, NO PROMESAS',
    'DEUDA: EL PAÍS NEGOCIA CON MEMORIA',
  ],
  'dec-retenciones-agro': [
    'Alícuota de Derechos de Exportación Agropecuarios',
    'CAMPO: LA RETENCIÓN YA TIENE COSTO TERRITORIAL',
    'EXPORTACIONES: EL GOBIERNO NEGOCIA CADA TONELADA',
    'CAMPO: LA DISCUSIÓN YA NO ES SOLO IMPOSITIVA',
  ],
  'dec-cepo-cambiario': [
    '🚨 CONTROL DE CAMBIOS Y DIVISAS CRÍTICAS',
    'DIVISAS: EL CEPO VUELVE CON UNA BRECHA MÁS CARA',
    'DÓLARES: LA INDUSTRIA PIDE UNA SALIDA QUE NO SEA OTRA TRABA',
    'CAMBIO: EL MERCADO YA RECUERDA CADA RESTRICCIÓN',
  ],
  'dec-subsidio-transporte': [
    'Aumento de Tarifas de Transporte Público',
    'TRANSPORTE: LA TARIFA SOCIAL SE ROMPE POR EL MEDIO',
    'TRANSPORTE: EL BOLETO SE CONVIERTE EN MAPA POLÍTICO',
    'TRANSPORTE: LA RED YA NO PUEDE VOLVER AL PUNTO DE PARTIDA',
  ],
  'dec-campana-legislativa': [
    'CAMPAÑA LEGISLATIVA: EL CONGRESO SE JUEGA EN LA CALLE',
    'CONGRESO: LA CAMPAÑA YA PAGA LAS DEUDAS DEL PRIMER AÑO',
    'ELECCIONES: EL MAPA SE DISCUTE PROVINCIA POR PROVINCIA',
  ],
  'dec-oposicion-prensa': [
    'OPOSICIÓN: LA CARPETA QUE PUEDE DEVOLVERTE AL CENTRO',
    'OPOSICIÓN: LA INVESTIGACIÓN CAMBIA DE MANOS',
    'OPOSICIÓN: EL PASADO VUELVE COMO CAPITAL POLÍTICO',
  ],
};

function contextualizeRecurringDecision(decision: Decision, state: GameState): Decision {
  const familyId = getDecisionFamilyId(decision);
  const occurrenceCount = state.decisionHistory.filter((entry) => (entry.familyId ?? entry.id) === familyId).length;
  if (occurrenceCount === 0) return decision;

  const variants = RECURRENT_DECISION_TITLES[decision.id] ?? [];
  const variantTitle = variants[Math.min(occurrenceCount, variants.length - 1)];
  const title = variantTitle
    ? occurrenceCount >= variants.length ? `${variantTitle} · Fase ${occurrenceCount + 1}` : variantTitle
    : `${decision.title} · Revisión ${occurrenceCount + 1}`;
  return {
    ...decision,
    title,
    description: `${decision.description} El expediente conserva memoria de lo ocurrido y reaparece porque la causa cambió, no porque el país haya olvidado.`,
  };
}

function choiceFamilyId(choiceId: string): string {
  return choiceId.replace(/-(?:ciclo|fase)-\d+$/i, '').replace(/-\d+$/, '');
}

function hasUsedChoice(state: GameState, choiceId: string): boolean {
  const familyId = choiceFamilyId(choiceId);
  return state.decisionHistory.some((entry) => choiceFamilyId(entry.choiceId) === familyId);
}

function getImplicitPoliticalCapital(state: GameState): number {
  const reputations = Object.values(state.reputation ?? {});
  const averageReputation = reputations.length > 0
    ? reputations.reduce((sum, value) => sum + value, 0) / reputations.length
    : 50;
  return Math.max(0, Math.min(100, Math.round(
    averageReputation * 0.65
      + state.nation.governance.institutionality * 0.25
      - state.nation.society.socialConflicts * 0.1,
  )));
}

function contextualizeChoiceSet(decision: Decision, state: GameState): Decision {
  const historyCount = state.decisionHistory.filter((entry) => (entry.familyId ?? entry.id) === getDecisionFamilyId(decision)).length;
  if (historyCount === 0) return decision;

  if (decision.id === 'dec-paritaria-docente') {
    const usedTrigger = hasUsedChoice(state, 'choice-clausula-gatillo');
    const usedRaise = hasUsedChoice(state, 'choice-conceder-paritaria');
    const latePhaseLabelSets = [
      ['Mantener el acuerdo vigente y revisar su alcance', 'Usar fondos de emergencia para evitar otro paro', 'Abrir una mesa técnica con calendario público'],
      ['Suspender beneficios no esenciales hasta cerrar la paritaria', 'Vincular futuros aumentos a metas de aprendizaje', 'Convocar una mediación federal con acta pública'],
      ['Revisar la cláusula de actualización con universidades', 'Crear un fondo salarial con aportes extraordinarios', 'Delegar la ejecución a las provincias con auditoría nacional'],
    ];
    const latePhaseLabels = latePhaseLabelSets[Math.max(0, (historyCount - 2) % latePhaseLabelSets.length)] ?? latePhaseLabelSets[0]!;
    const labels = usedTrigger
      ? ['Mantener el acuerdo gatillo vigente', 'Abrir una mesa técnica para renegociar el porcentaje', 'Escalonar el aumento restante en dos tramos']
      : historyCount >= 2
        ? latePhaseLabels
        : ['Escalonar aumentos para proteger las aulas', 'Declarar conciliación obligatoria y negociar', 'Ofrecer bonos extraordinarios sin ampliar la base salarial'];
    const evolvedChoices = decision.choices.map((choice, index) => ({
      ...choice,
      id: `choice-paritaria-evolution-${historyCount}-${index}`,
      label: labels[index] ?? choice.label,
      description: usedRaise && index === 0
        ? 'Ya concediste el 45% en un antecedente. Esta opción conserva lo firmado sin repetir el desembolso inicial.'
        : choice.description,
    }));
    const blockedPastChoice = usedRaise
      ? [{
        ...decision.choices[0]!,
        id: `choice-paritaria-exhausted-${historyCount}`,
        label: 'Conceder nuevamente el aumento del 45%',
        disabled: true,
        disabledReason: 'No disponible: ya existe un acuerdo salarial vigente con ese porcentaje.',
      }]
      : [];
    return {
      ...decision,
      choices: [...blockedPastChoice, ...evolvedChoices],
    };
  }

  if (decision.id === 'dec-fmi-renegociacion') {
    const remainingReserves = Math.max(0, Math.round(state.nation.economy.reserves));
    return {
      ...decision,
      choices: decision.choices.map((choice) => choice.id.includes('aceptar-condiciones')
        ? { ...choice, label: `Renegociar el acuerdo vigente con margen de reservas (${remainingReserves}% disponible)` }
        : choice),
    };
  }

  return decision;
}

function addExceptionalPath(decision: Decision, state: GameState): Decision {
  const canAppear = state.nation.governance.corruption >= 42
    || state.reputation.prensa <= 38
    || getImplicitPoliticalCapital(state) <= 28;
  const applicable = decision.repeatable && ['economico', 'politico', 'social', 'mediatico'].includes(decision.category);
  if (!canAppear || !applicable || decision.choices.some((choice) => choice.id.startsWith('choice-via-informal-'))) return decision;

  const choiceId = `choice-via-informal-${decision.id}`;
  return {
    ...decision,
    choices: [
      ...decision.choices,
      {
        id: choiceId,
        label: 'Usar una vía informal para cerrar el conflicto',
        description: 'Un operador cercano ofrece acelerar el acuerdo por fuera del procedimiento. La ventaja llega hoy; la prueba puede aparecer mucho después.',
        preview: {
          gains: [{ icon: '⚡', label: 'Resolución política inmediata', magnitude: 'fuerte' }, { icon: '🤝', label: 'Apoyo de aliados', magnitude: 'moderado' }],
          losses: [{ icon: '⚠️', label: 'Riesgo institucional acumulativo', magnitude: 'fuerte' }],
          risks: [{ icon: '🕵️', label: 'Filtraciones, investigación y causa futura', magnitude: 'fuerte' }],
          beneficiaries: ['Operadores políticos', 'Empresarios cercanos'],
          opponents: ['Prensa', 'Justicia', 'Oposición'],
        },
        effects: {
          national: { governance: { corruption: 7, institutionality: -2 } },
          reputation: { empresarios: 7, prensa: -5, 'clase-media': -3 },
          character: { popularity: 2, pragmatismo: 5, idealismo: -6 },
        },
        delayedEffects: [
          { turnsDelay: 6, probability: 0.55, effects: { national: { governance: { corruption: 6 } }, reputation: { prensa: -5 } }, description: 'Un periodista encuentra una transferencia que conecta al operador con la decisión y abre una investigación.', sourceDecisionId: decision.id, originTurn: 0 },
          { turnsDelay: 18, probability: 0.35, effects: { national: { governance: { institutionality: -8 }, society: { trust: -5 } }, character: { popularity: -8 } }, description: 'Una declaración de arrepentido reconstruye quién participó, quién sabía y qué pruebas todavía existen.', sourceDecisionId: decision.id, originTurn: 0 },
          { turnsDelay: 36, probability: 0.2, effects: { national: { governance: { institutionality: -10 } }, character: { stress: 8, popularity: -10 } }, description: 'La causa judicial alcanza al gobierno cuando la memoria pública ya creía cerrado el expediente.', sourceDecisionId: decision.id, originTurn: 0 },
        ],
      },
    ],
  };
}

function annotateChoiceAvailability(decision: Decision, state: GameState): DecisionChoice[] {
  const politicalCapital = getImplicitPoliticalCapital(state);
  const reserves = state.nation.economy.reserves;
  const investment = state.nation.economy.investment;
  return decision.choices.map((choice) => {
    let disabledReason: string | undefined = choice.disabledReason;
    const reserveCost = Math.max(0, -(choice.effects.national?.economy?.reserves ?? 0));
    const investmentCost = Math.max(0, -(choice.effects.national?.economy?.investment ?? 0));
    const politicalCost = Object.values(choice.effects.reputation ?? {})
      .filter((value) => value < 0)
      .reduce((sum, value) => sum + Math.abs(value), 0)
      + Math.max(0, -(choice.effects.national?.governance?.institutionality ?? 0)) * 2;

    if (choice.disabled) {
      disabledReason ??= 'No disponible: esta opción ya fue agotada por la historia del mandato.';
    } else if (reserveCost > reserves) {
      disabledReason = `No disponible: quedan ${Math.round(reserves)}% de reservas y esta opción requiere ${reserveCost}%.`;
    } else if (investmentCost > investment) {
      disabledReason = `No disponible: el margen de obra e inversión restante es ${Math.round(investment)}%.`;
    } else if (hasUsedChoice(state, choice.id) && (
      choice.id.includes('oro')
      || choice.id.includes('swap')
      || choice.id.includes('informal')
      || (decision.id === 'dec-paritaria-docente' && (choice.id.includes('conceder-paritaria') || choice.id.includes('clausula-gatillo')))
    )) {
      disabledReason = 'No disponible: este recurso o vía ya fue utilizado durante el mandato.';
    } else if (politicalCost >= 28 && politicalCapital < 22) {
      disabledReason = `No disponible: el capital político implícito ya no alcanza para absorber este costo (${politicalCapital}/100).`;
    }

    return disabledReason
      ? { ...choice, disabled: true, disabledReason }
      : { ...choice, disabled: false, disabledReason: undefined };
  });
}

function isCampaignWindow(state: GameState, election: 'legislative' | 'presidential'): boolean {
  const turns = election === 'legislative' ? state.calendar.turnsUntilLegislative : state.calendar.turnsUntilPresidential;
  return turns > 0 && turns <= 10;
}

function isRelevantToCountry(decisionId: string, state: GameState): boolean {
  const { economy, society } = state.nation;
  const scarFamilies = new Set((state.scars ?? []).map((scar) => scar.familyId ?? scar.id));
  const hasEnergyScar = scarFamilies.has('el-invierno-frio');
  const hasEducationScar = scarFamilies.has('la-tension-universitaria');
  const hasEmploymentScar = scarFamilies.has('la-crisis-de-empleo');

  switch (decisionId) {
    case 'dec-crisis-reservas-urgente':
      return economy.reserves < 42 || hasEnergyScar;
    case 'dec-cepo-cambiario':
      return economy.reserves < 55 || economy.inflation > 58;
    case 'dec-fmi-renegociacion':
      return economy.debt > 48 || economy.reserves < 28;
    case 'dec-retenciones-agro':
      return economy.reserves < 62 || state.reputation.campo < 42;
    case 'dec-paritaria-docente':
      return society.education < 57 || state.reputation.docentes < 45 || economy.inflation > 46 || hasEducationScar;
    case 'dec-subsidio-transporte':
      return economy.inflation > 42 || society.socialConflicts > 30 || hasEmploymentScar;
    case 'dec-mundial-feriado':
      return state.turn >= 10 && state.turn <= 34;
    case 'dec-mascota-cadena':
      return state.character.popularity < 48 || state.socialMedia.memeAboutPlayer;
    case 'dec-campana-legislativa':
      return state.phase === 'playing' && isCampaignWindow(state, 'legislative');
    case 'dec-campana-presidencial':
      return state.phase === 'playing' && isCampaignWindow(state, 'presidential');
    case 'dec-oposicion-prensa':
      return state.phase === 'opposition';
    default:
      return true;
  }
}
