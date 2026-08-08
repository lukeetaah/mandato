import { useState } from 'react';
import type { GameState, DeskObject } from '@engine/types';
import { useGameStore } from '@stores/game-store';
import { useUIStore } from '@stores/ui-store';
import { Modal } from '@components/ui/Modal';
import { getPacingMode } from '@engine/simulation';

export interface PresidentialDeskProps {
  gameState: GameState;
}

// Configuración de hotspots sobre la imagen del escritorio presidencial (estilo point-and-click Origin)
interface DeskHotspotConfig {
  type: string;
  label: string;
  icon: string;
  channel: string;
  position: { top: string; left: string; width: string; height: string };
  glowColor: string;
}

const HOTSPOT_MAPPING: Record<string, DeskHotspotConfig> = {
  telefono: {
    type: 'telefono',
    label: 'Teléfono rojo presidencial',
    icon: '📞',
    channel: 'Llamada directa de emergencia',
    position: { top: '50%', left: '76%', width: '18%', height: '26%' },
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  diario: {
    type: 'diario',
    label: 'Prensa y diario del día',
    icon: '📰',
    channel: 'Edición matutina de opinión pública',
    position: { top: '64%', left: '40%', width: '24%', height: '22%' },
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  expediente: {
    type: 'expediente',
    label: 'Expediente ministerial urgente',
    icon: '📁',
    channel: 'Decreto y proyecto en firmas',
    position: { top: '56%', left: '14%', width: '22%', height: '26%' },
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  'carpeta-roja': {
    type: 'carpeta-roja',
    label: 'Carpeta roja clasificada',
    icon: '📕',
    channel: 'Operación secreta de Estado',
    position: { top: '44%', left: '4%', width: '18%', height: '24%' },
    glowColor: 'rgba(225, 29, 72, 0.6)',
  },
  'carta-gobernador': {
    type: 'carta-gobernador',
    label: 'Correspondencia federal',
    icon: '✉️',
    channel: 'Exigencia de provincias y coparticipación',
    position: { top: '38%', left: '38%', width: '20%', height: '20%' },
    glowColor: 'rgba(16, 185, 129, 0.5)',
  },
  'informe-inteligencia': {
    type: 'informe-inteligencia',
    label: 'Informe confidencial AFI',
    icon: '🕵️',
    channel: 'Reporte de riesgo e inteligencia',
    position: { top: '42%', left: '60%', width: '18%', height: '22%' },
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
};

export const PresidentialDesk: React.FC<PresidentialDeskProps> = ({ gameState }) => {
  const nextTurn = useGameStore((s) => s.nextTurn);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  const { calendar, deskObjects, character, nation } = gameState;
  const [activeObject, setActiveObject] = useState<DeskObject | null>(null);
  const [dismissedObjects, setDismissedObjects] = useState<Set<string>>(new Set());
  const [showSkipWarning, setShowSkipWarning] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  const safeDeskObjects = deskObjects ?? [];
  const visibleObjects = safeDeskObjects.filter(obj => {
    if (dismissedObjects.has(obj.id)) return false;
    if (obj.id.startsWith('desk-report-') && obj.inspectText.includes('No hubo sobresaltos nacionales')) return false;
    return true;
  });

  const hasDecisionItems = visibleObjects.some(obj => obj.associatedDecisionId);
  const pacingMode = getPacingMode(gameState);

  const weatherIcons: Record<string, string> = {
    despejado: '☀️',
    lluvia: '🌧️',
    niebla: '🌫️',
    tormenta: '🌩️',
    nieve: '❄️',
  };

  const handleObjectClick = (obj: DeskObject) => {
    if (obj.associatedDecisionId) {
      const el = document.getElementById('asuntos-urgentes');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    setActiveObject(obj);
  };

  const handleAdvance = () => {
    if (hasDecisionItems) {
      setShowSkipWarning(true);
      return;
    }
    nextTurn();
    setDismissedObjects(new Set());
  };

  const handleForceAdvance = () => {
    setShowSkipWarning(false);
    nextTurn();
    setDismissedObjects(new Set());
  };

  const timeOfDay = calendar.timeOfDay ?? 'mañana';
  const weatherCondition = calendar.weatherCondition ?? 'despejado';
  const fortnight = calendar.fortnight ?? 1;

  // Clases dinámicas de filtro para momento del día
  const timeOfDayFilterClass: Record<string, string> = {
    mañana: 'brightness-[0.98] contrast-[1.02]',
    tarde: 'brightness-[0.92] contrast-[1.08] sepia-[0.15]',
    noche: 'brightness-[0.78] contrast-[1.20] hue-rotate-[10deg]',
  };
  const activeTimeFilter = timeOfDayFilterClass[timeOfDay] ?? 'brightness-[0.95]';

  return (
    <div className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden border flex flex-col font-sans transition-all ${
      isLight
        ? 'bg-white border-slate-200 text-slate-900 shadow-md'
        : 'bg-[#161B22] border-[#30363D] text-[#F8FAFC] shadow-2xl'
    }`}>
      {/* ─── 1. CABECERA Y PLACA DEL PRESIDENTE ─── */}
      <div className={`p-4 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black tracking-wide flex items-center gap-2">
              <span>🏛️</span> Despacho Presidencial
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Sillón de Rivadavia
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Presidente <b>{character.name} {character.surname}</b> · {fortnight === 1 ? '1ª Quincena' : '2ª Quincena'} de {calendar.monthCycleName} ({calendar.year})
          </p>
        </div>

        {/* Indicadores rápidos de clima y ritmo */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className={`px-3 py-1 rounded-2xl border flex items-center gap-1.5 ${
            isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <span>{weatherIcons[weatherCondition] ?? '☀️'}</span>
            <span className="capitalize">{weatherCondition} · {timeOfDay}</span>
          </span>

          <span className={`px-3 py-1 rounded-2xl border flex items-center gap-1.5 ${
            nation.economy.reserves >= 50
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}>
            <span>🏦</span> Reservas: {Math.round(nation.economy.reserves)}%
          </span>
        </div>
      </div>

      {/* ─── 2. ESCRITORIO POINT-AND-CLICK CON IMAGEN LIMPIA Y EFECTOS CLIMÁTICOS ─── */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[580px] overflow-hidden bg-slate-950 select-none">
        {/* Imagen de Fondo del Escritorio */}
        <img
          src="/presidential-desk.jpg"
          alt="Escritorio Presidencial"
          className={`w-full h-full object-cover object-center transition-all duration-700 ${activeTimeFilter}`}
        />

        {/* 🌅 CAPA DE ILUMINACIÓN POR MOMENTO DEL DÍA */}
        {timeOfDay === 'tarde' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/30 via-orange-600/15 to-transparent mix-blend-color-burn pointer-events-none" />
        )}
        {timeOfDay === 'noche' && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90 pointer-events-none" />
        )}
        {timeOfDay === 'mañana' && (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-100/10 via-transparent to-slate-950/40 pointer-events-none" />
        )}

        {/* 🌧️ CAPAS DINÁMICAS DE CLIMA */}
        {weatherCondition === 'lluvia' && (
          <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:14px_22px] animate-pulse" />
        )}
        {weatherCondition === 'tormenta' && (
          <>
            <div className="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(#64748b_1.5px,transparent_1.5px)] [background-size:10px_20px] animate-pulse" />
            <div className="absolute inset-0 bg-sky-200/10 animate-ping pointer-events-none duration-1000" />
          </>
        )}
        {weatherCondition === 'niebla' && (
          <div className="absolute inset-0 backdrop-blur-[1px] bg-slate-300/15 pointer-events-none transition-opacity" />
        )}

        {/* HOTSPOTS INTERACTIVOS DE OBJETOS PRESENTES */}
        {visibleObjects.map((obj) => {
          const config = HOTSPOT_MAPPING[obj.type] ?? {
            type: obj.type,
            label: obj.title,
            icon: '📄',
            channel: 'Documento sobre el escritorio',
            position: { top: '55%', left: '50%', width: '20%', height: '20%' },
            glowColor: 'rgba(59, 130, 246, 0.5)',
          };

          const isHovered = hoveredHotspot === obj.id;
          const hasUrgentDecision = !!obj.associatedDecisionId;

          return (
            <div
              key={obj.id}
              onClick={() => handleObjectClick(obj)}
              onMouseEnter={() => setHoveredHotspot(obj.id)}
              onMouseLeave={() => setHoveredHotspot(null)}
              style={{
                top: config.position.top,
                left: config.position.left,
                width: config.position.width,
                height: config.position.height,
              }}
              className="absolute cursor-pointer transition-all duration-200 group flex items-center justify-center rounded-2xl"
            >
              {/* Resplandor / Pulse para destacar objetos interactivos */}
              <div
                style={{
                  boxShadow: isHovered
                    ? `0 0 25px 8px ${config.glowColor}`
                    : hasUrgentDecision
                    ? `0 0 15px 3px ${config.glowColor}`
                    : 'none',
                }}
                className={`absolute inset-0 rounded-2xl border-2 transition-all ${
                  hasUrgentDecision
                    ? 'border-amber-400 bg-amber-500/10 animate-pulse'
                    : isHovered
                    ? 'border-sky-400 bg-sky-500/20'
                    : 'border-white/20 bg-black/20 hover:border-white/50'
                }`}
              />

              {/* Icono Flotante Badge */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-3xl md:text-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform">
                  {config.icon}
                </span>

                {hasUrgentDecision && (
                  <span className="mt-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-full shadow-lg animate-bounce">
                    Requerido
                  </span>
                )}
              </div>

              {/* Tooltip flotante al pasar el mouse (Point-and-Click style) */}
              {isHovered && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none whitespace-nowrap bg-slate-900/95 text-white border border-slate-700 px-3 py-1.5 rounded-xl shadow-2xl text-xs space-y-0.5 text-center">
                  <div className="font-extrabold flex items-center gap-1.5 justify-center">
                    <span>{config.icon}</span>
                    <span>{obj.title}</span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-semibold">{config.channel}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Estado Escritorio Limpio (Sin llamadas u objetos pendientes) */}
        {visibleObjects.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 backdrop-blur-[2px]">
            <span className="text-5xl mb-2 opacity-80">☕</span>
            <h4 className="text-base font-extrabold text-white">El despacho está despejado</h4>
            <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
              No hay asuntos urgentes ni llamadas de emergencia en esta quincena. Podés avanzar al siguiente período constitucional o revisar la coyuntura.
            </p>
          </div>
        )}

        {/* Notificación flotante de canal directo sobre el escritorio */}
        {visibleObjects.length > 0 && (
          <div className="absolute bottom-3 left-4 right-4 md:right-auto md:max-w-md z-20 p-2.5 px-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-white text-xs backdrop-blur-md flex items-center justify-between gap-3 shadow-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-400 text-base animate-pulse">🛎️</span>
              <div className="truncate">
                <span className="font-extrabold block text-xs">
                  {visibleObjects.length} asunto{visibleObjects.length === 1 ? '' : 's'} en el escritorio
                </span>
                <span className="text-[10px] text-slate-400">
                  Tocá cualquier objeto para inspeccionar o decidir
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. BARRA INFERIOR DE ACCIÓN (AVANZAR QUINCENA) ─── */}
      <div className={`p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="text-xs text-slate-500 text-center sm:text-left">
          <span className="font-bold text-slate-700 dark:text-slate-300">República del Sur</span> — Período Constitucional 2032-2036
          <span className="block text-[11px] text-slate-400 mt-0.5">
            {pacingMode === 'acelerado' ? 'Ritmo acelerado: sin emergencias activas' : 'Ritmo quincenal: gestión de coyuntura'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdvance}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>▶</span> AVANZAR QUINCENA
        </button>
      </div>

      {/* Modal Inspector de Documentos Informativos */}
      {activeObject && (
        <Modal
          isOpen={true}
          onClose={() => setActiveObject(null)}
          title={`📄 Inspeccionar: ${activeObject.title}`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <div>
                  <h4 className="font-extrabold text-sm">{activeObject.title}</h4>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">
                    Documento oficial de despacho
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed italic border-t pt-2 border-slate-200/60 font-serif">
                "{activeObject.inspectText}"
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDismissedObjects(prev => new Set(prev).add(activeObject.id));
                  setActiveObject(null);
                }}
                className="px-4 py-2 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
              >
                ✕ Archivar documento
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Advertencia de decisiones pendientes antes de avanzar */}
      {showSkipWarning && (
        <Modal
          isOpen={true}
          onClose={() => setShowSkipWarning(false)}
          title="⚠️ Decisiones requeridas en el escritorio"
        >
          <div className="space-y-4 text-xs font-sans">
            <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
              Tenés asuntos urgentes de Estado sobre el escritorio sin resolver. Si avanzás sin tomar una decisión, el gabinete o la coyuntura resolverán por defecto.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSkipWarning(false);
                  const el = document.getElementById('asuntos-urgentes');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs cursor-pointer transition-colors"
              >
                Volver y decidir
              </button>
              <button
                type="button"
                onClick={handleForceAdvance}
                className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition-colors"
              >
                Avanzar sin decidir
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
