import React, { useState } from 'react';
import { Modal } from '@components/ui/Modal';


export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: 'Asunción presidencial: tu perfil de gobierno',
    content: `Bienvenido a la Presidencia de la República del Sur.
    
Asumís el poder en un contexto de altísima volatilidad. Tus decisiones iniciales y la orientación ideológica de tu gabinete determinarán cómo reaccionan los sectores clave:

• **Si priorizás al pueblo / trabajadores**: Ganás respaldo popular inmediato y contención en la calle, pero los mercados y empresarios exigirán disciplina fiscal y reservas.

• **Si priorizás los mercados / derecha**: Atraés inversiones y confianza financiera, pero la tensión social, sindicatos y protestas aumentarán la presión.

• **Si mantenés el centro institucional**: Lográs consensos en el Congreso, pero serás cuestionado por la prensa y la oposición si no definís un rumbo claro.`,
  },
  {
    title: 'El despacho presidencial y los canales de entrada',
    content: `En la pestaña **Nación / Despacho** encontrarás la mesa oficial de trabajo.

Los asuntos no llegan por una sola vía:
• 📞 **Teléfono rojo**: Llamadas directas de ministros, embajadores y emergencias.
• 📰 **Prensa diaria**: Noticias del día y estado de opinión pública.
• 📁 **Expedientes**: Proyectos de ley, decretos y solicitudes de presupuesto.
• ✉️ **Cartas de Gobernadores**: Demandas regionales de coparticipación.

Cada quincena deberás resolver los asuntos urgentes o dejar que tu gabinete tome medidas por defecto antes de presionar **Avanzar quincena**.`,
  },
  {
    title: 'Regiones, vida personal y prensa',
    content: `Para gobernar con éxito debés utilizar todos los recursos del Estado:

• 🗺️ **Regiones**: Invertí en infraestructura regional, enviá fuerzas federales o firmá pactos con los gobernadores para asegurar votos en el Senado.

• 👤 **Perfil y Vida**: Gestioná tu salud física y estrés. Podés trasladarte a Olivos, descansar o realizar gestos de austeridad para proteger tu imagen pública.

• 📰 **Prensa y Redes**: Monitoreá la percepción de los medios y el humor social quincena a quincena.`,
  },
  {
    title: 'Apariencia y opciones de partida',
    content: `El juego inicia en modo oscuro para que puedas concentrarte en los indicadores. Si preferís una vista más cálida, tocá el botón de luna o sol en la esquina superior derecha: podés alternar el tema cuando quieras.

El botón **Menú** abre las opciones de partida. Desde ahí guardás, salís al inicio o reiniciás el mandato. No hace falta memorizarlo: ambos controles permanecen visibles durante toda la gestión.`,
  },
  {
    title: 'Reglas de reelección e indicadores vitales',
    content: `No existen decisiones limpias. Cada medida resuelve un problema y genera nuevas tensiones.

**Indicadores críticos**:
• **Reservas del Central**: Si caen por debajo del 20%, arriesgás una corrida bancaria.
• **Estrés / Salud**: Si supera el 80%, podés colapsar médicamente.
• **Elecciones**: Cada 2 años hay legislativas (requiere +40% popularidad) y cada 4 presidenciales.

¿Estás listo para asumir el mandato?`,
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const currentStep = TOUR_STEPS[step]!;
  const isLastStep = step === TOUR_STEPS.length - 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={currentStep.title}>
      <div className="space-y-4 text-sm font-sans leading-relaxed">
        {/* Indicador de progreso */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === step ? 'bg-amber-400 w-8' : idx < step ? 'bg-sky-400 w-3' : 'bg-slate-700 w-3'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            Paso {step + 1} de {TOUR_STEPS.length}
          </span>
        </div>

        {/* Texto del paso */}
        <div className="whitespace-pre-line text-xs leading-relaxed p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 min-h-[220px]">
          {currentStep.content.split('**').map((part, idx) => (
            idx % 2 === 1
              ? <strong key={idx} className="text-amber-300 font-bold">{part}</strong>
              : <span key={idx}>{part}</span>
          ))}
        </div>

        {/* Botones de navegación con opción explícita de Omitir */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer underline px-2 py-1"
          >
            Omitir tutorial
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-colors"
              >
                ← Anterior
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer transition-colors shadow-lg"
              >
                Asumir mandato ➔
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
