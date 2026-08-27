import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@components/ui/Button';
import { PROVINCES } from '@engine/constants';

export interface MandateIntroProps {
  onContinue: () => void;
  onBack: () => void;
}

const overviewItems = [
  {
    title: 'Despacho',
    text: 'Es el centro de mando: diarios, llamadas, expedientes y cartas aparecen sobre la mesa. Desde ahí inspeccionás asuntos y abrís decisiones.',
    icon: '🏛️',
  },
  {
    title: 'Regiones',
    text: 'El país está dividido en ocho macro-regiones. Podés revisar humor social, economía, infraestructura, recursos y acciones territoriales.',
    icon: '🗺️',
  },
  {
    title: 'Prensa y redes',
    text: 'Los medios narran tu gobierno y las redes deforman o amplifican cada gesto. Ahí ves tapas, tendencias, memes y costo público.',
    icon: '📰',
  },
  {
    title: 'Calendario',
    text: 'Cada quincena mueve la historia. El calendario muestra ciclos, elecciones, meses críticos y cuándo vuelven algunas consecuencias.',
    icon: '📅',
  },
  {
    title: 'Historial',
    text: 'Nada importante desaparece: decisiones, eventos, escándalos, cicatrices y resoluciones quedan en una línea temporal del mandato.',
    icon: '📜',
  },
  {
    title: 'Presidente',
    text: 'Tu personaje tiene salud, estrés, reputación, bienes, contradicciones y un retrato que cambia con el desgaste o la consolidación.',
    icon: '👤',
  },
];

const sampleHeadlines = [
  'El Central espera una señal antes del cierre de la quincena',
  'Gobernadores piden que el ajuste no se decida solo desde la capital',
  'Tendencia en redes: “primeras 48 horas de gobierno”',
];

const collapseBeats = [
  ['2027', 'La automatización y la IA reordenan trabajo, precios, comunicación y administración pública más rápido de lo que las instituciones pueden absorber.'],
  ['2029', 'El ciclo posterior a Milei detona políticamente: alianzas partidas, provincias enfrentadas al centro y una crisis de legitimidad que deja al viejo mapa irreconocible.'],
  ['2032', 'La República del Sur nace como una reconstrucción institucional. No es otro país por capricho: es el nombre de un sistema que intenta sobrevivir al colapso.'],
];

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.075 },
  },
};

const itemAnimation = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export const MandateIntro: React.FC<MandateIntroProps> = ({ onContinue, onBack }) => {
  const [step, setStep] = useState<'country' | 'overview'>('country');
  const visibleRegions = PROVINCES.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100 flex items-center justify-center p-5 sm:p-6 relative overflow-hidden">
      <motion.div
        aria-hidden
        animate={{ opacity: [0.45, 0.78, 0.45], scale: [1, 1.04, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4ed833,transparent_36%),radial-gradient(circle_at_bottom_right,#f59e0b22,transparent_34%)] pointer-events-none"
      />

      {step === 'country' ? (
        <motion.section
          key="country"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 max-w-4xl w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-stretch"
        >
          <div className="space-y-6">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-slate-100 font-bold cursor-pointer"
            >
              Volver al inicio
            </button>

            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">República del Sur, 2032</span>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                Vas a asumir un país que no espera.
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                MI MANDATO no empieza con un formulario: empieza con una responsabilidad. Recibís una economía frágil, una sociedad cansada, instituciones bajo sospecha y ocho macro-regiones que no viven la crisis de la misma manera.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Esta es una línea histórica ficticia: veníamos de la Argentina posterior a Milei, pero en 2029 el sistema político estalló justo cuando la automatización y la IA empezaron a tomar decisiones sobre trabajo, información, precios y burocracia. La República del Sur es lo que quedó después de intentar reconstruir el tablero.
              </p>
            </div>

            <motion.div
              variants={containerAnimation}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
            >
              {[
                ['El país', 'Reservas escasas, inflación persistente y regiones que reclaman ser escuchadas.'],
                ['El poder', 'Ministros, gobernadores, prensa, mercados y sindicatos empujan cada decisión.'],
                ['La consecuencia', 'Algunas medidas se sienten hoy. Otras vuelven meses después con otro nombre.'],
                ['Tu mandato', 'Cada firma deja memoria: en la calle, en los actores políticos y en tu propio cuerpo.'],
              ].map(([title, body]) => (
                <motion.div key={title} variants={itemAnimation} className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4">
                  <h2 className="text-sm font-black text-amber-300 mb-1">{title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="gold" size="lg" onClick={() => setStep('overview')}>
                Ver qué podés revisar
              </Button>
              <p className="text-xs text-slate-400 leading-relaxed sm:max-w-xs">
                Primero entendés dónde estás. Después ves el tablero que vas a tener que leer.
              </p>
            </div>
          </div>

          <aside className="rounded-2xl border border-sky-500/25 bg-slate-950/60 p-5 flex flex-col justify-between min-h-[360px]">
            <div className="space-y-3">
              <span className="text-xs font-black text-sky-300 uppercase tracking-[0.18em]">Cómo llegamos hasta acá</span>
              <div className="space-y-3">
                {collapseBeats.map(([year, text]) => (
                  <div key={year} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    <span className="text-amber-300 text-xs font-black">{year}</span>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-700 p-4">
              <p className="text-sm font-serif italic text-slate-200">
                “Gobernar no es elegir entre bien y mal. Es decidir qué costo puede soportar el país sin romperse.”
              </p>
            </div>
          </aside>
        </motion.section>
      ) : (
        <motion.section
          key="overview"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 max-w-6xl w-full space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => setStep('country')}
                className="text-xs text-slate-400 hover:text-slate-100 font-bold cursor-pointer mb-4"
              >
                Volver al contexto
              </button>
              <span className="text-xs font-black uppercase tracking-[0.24em] text-sky-300">Lo que podés revisar</span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight mt-2">
                Gobernar también es mirar bien.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mt-3">
                Antes de elegir presidente, este es el tablero que vas a leer durante la partida. No todo exige una firma inmediata: a veces conviene revisar una tapa, una región, una tendencia o una cicatriz vieja antes de decidir.
              </p>
            </div>

            <Button variant="gold" size="lg" onClick={onContinue}>
              Elegir presidente
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5">
            <motion.div variants={containerAnimation} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {overviewItems.map((item) => (
                <motion.div
                  key={item.title}
                  variants={itemAnimation}
                  whileHover={{ y: -3, borderColor: 'rgba(56,189,248,0.55)' }}
                  className="rounded-2xl border border-slate-700/70 bg-slate-900/75 p-4 min-h-[136px]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xl">{item.icon}</span>
                    <h2 className="text-sm font-black text-amber-300">{item.title}</h2>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black text-sky-300">Distribución territorial inicial</h2>
                  <span className="text-[10px] text-slate-400 font-bold">8 macro-regiones</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {visibleRegions.map((region, index) => {
                    const mood = region.socialMood;
                    const moodLabel = mood > 8 ? 'favorable' : mood < -10 ? 'tensa' : 'expectante';
                    const moodColor = mood > 8 ? 'bg-emerald-400' : mood < -10 ? 'bg-rose-400' : 'bg-amber-300';
                    return (
                      <motion.div
                        key={region.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.18 + index * 0.035 }}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 p-3"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-100 truncate">{region.name}</span>
                          <span className="text-[10px] text-slate-400">{moodLabel}</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(12, Math.min(100, Math.abs(mood) * 4 + 28))}%` }}
                            transition={{ delay: 0.28 + index * 0.04, duration: 0.55 }}
                            className={`h-full ${moodColor}`}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22 }}
                className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4"
              >
                <h2 className="text-sm font-black text-amber-300 mb-3">Noticias y redes antes de jurar</h2>
                <div className="space-y-2">
                  {sampleHeadlines.map((headline, index) => (
                    <motion.div
                      key={headline}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 + index * 0.08 }}
                      className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300"
                    >
                      {headline}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-500/25 bg-sky-950/20 p-4 text-xs text-slate-300 leading-relaxed">
            El orden lógico dentro de la partida queda así: inspeccionás el despacho, abrís una decisión si corresponde, revisás regiones/prensa/calendario cuando necesitás contexto, confirmás una medida y después leés su resolución en el historial y en el nuevo estado del mundo.
          </div>
        </motion.section>
      )}
    </div>
  );
};
