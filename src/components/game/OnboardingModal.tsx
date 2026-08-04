import React, { useState } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LORE_PAGES = [
  {
    title: '🌎 Año 2029 — El Colapso',
    content: `La República Argentina dejó de existir tal como la conocíamos.

Una crisis institucional sin precedentes —combinación de default soberano, polarización extrema y colapso del sistema judicial— forzó un proceso de reorganización territorial.

Las 24 jurisdicciones —23 provincias y la Ciudad Autónoma de Buenos Aires— fueron consolidadas en 8 macro-regiones bajo el nuevo nombre de la **República del Sur**.

El Congreso fue reformado. La Constitución, reescrita. Los partidos tradicionales se fragmentaron en nuevas fuerzas.

Nada de lo viejo sobrevivió intacto.`,
  },
  {
    title: '🗺️ La República del Sur — 8 Provincias',
    content: `**Noroeste Andino** — Minería, vino y montaña. Comunidades originarias y una economía extractiva en tensión permanente.

**Litoral Subtropical** — Tierra caliente, yerba mate, represas y un río que lo inunda todo cada temporada.

**Cuyo y los Valles** — Cordillera, energía solar y bodegas. Zona sísmica y frontera porosa.

**Sierras del Centro** — El corazón universitario e industrial. Fábricas, tecnología y sindicatos fuertes.

**Pampa Agrícola** — El granero del mundo. Soja, trigo y tractorazos. Aquí se decide si el país come.

**Distrito Federal** — La capital. Poder concentrado, medios, protestas y la sede de todo lo que importa.

**Costa Atlántica** — Turismo, puertos pesqueros y bases navales. El turismo salva pero la pesca depreda.

**Sur Patagónico** — Petróleo, viento, hielo y soledad. El territorio más vasto y menos poblado.`,
  },
  {
    title: '⚖️ Las Reglas del Poder',
    content: `En la República del Sur no existen decisiones limpias.

**Cada medida resuelve un problema y crea dos nuevos.**

• La prensa, los mercados y las redes operan con intereses propios. Nada es transparente.

• El sistema aprende: tus patrones de negociación, favores y medidas modifican cómo te responden sindicatos, empresarios y gobernadores.

• Las consecuencias son diferidas: las bombas de tiempo estallan turnos después de que firmes una licitación o prometas un favor.

• Tu salud y estrés importan: gobernar destruye el cuerpo. Si colapsás, tu mandato termina.

• Hay elecciones cada 2 años (legislativas) y cada 4 (presidenciales). Perder las presidenciales es game over.

**La verdadera pregunta nunca es "¿qué decisión es correcta?"**

**Sino: "¿qué costo estás dispuesto a pagar?"**`,
  },
  {
    title: '🎮 Cómo Jugar',
    content: `**Cada turno = 1 mes** de gobierno.

📊 **Dashboard** → Indicadores macro de economía, sociedad y gobernanza. Hover en cada barra para ver tips de cómo moverlas.

⚖️ **Decisiones** → Situaciones que exigen tu respuesta. Cada opción tiene beneficiarios, opositores y riesgos. Algunas tienen bombas de tiempo.

🗺️ **Provincias** → Mapa interactivo con datos de cada región. El humor social varía según tus políticas.

🛤️ **Trayectoria** → Mapa visual de todas tus decisiones. ¿Sos pragmático, idealista o algo más oscuro?

📰 **Prensa** → Titulares del día, medios con línea editorial propia, y redes sociales con vida propia.

**No hay camino correcto. Solo consecuencias.**`,
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [page, setPage] = useState(0);
  const currentPage = LORE_PAGES[page]!;
  const isLastPage = page === LORE_PAGES.length - 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={currentPage.title}>
      <div className="space-y-4 text-sm text-slate-300 leading-relaxed min-h-[280px]">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-2">
          {LORE_PAGES.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === page ? 'bg-amber-400 w-6' : idx < page ? 'bg-sky-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="whitespace-pre-line text-[13px] leading-relaxed">
          {currentPage.content.split('**').map((part, idx) => (
            idx % 2 === 1
              ? <strong key={idx} className="text-sky-300 font-semibold">{part}</strong>
              : <span key={idx}>{part}</span>
          ))}
        </div>

        {/* Navigation */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          {page > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setPage(page - 1)}>
              ← Anterior
            </Button>
          ) : (
            <div />
          )}

          {isLastPage ? (
            <Button variant="gold" size="md" onClick={onClose}>
              Iniciar Mandato ➔
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={() => setPage(page + 1)}>
              Siguiente →
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
