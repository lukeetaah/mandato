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
    position: { top: '50%', left: '72%', width: '22%', height: '32%' },
    glowColor: 'rgba(239, 68, 68, 0.6)',
  },
  diario: {
    type: 'diario',
    label: 'Prensa y diario del día',
    icon: '📰',
    channel: 'Edición matutina de opinión pública',
    position: { top: '58%', left: '36%', width: '28%', height: '28%' },
    glowColor: 'rgba(59, 130, 246, 0.6)',
  },
  expediente: {
    type: 'expediente',
    label: 'Expediente ministerial urgente',
    icon: '📁',
    channel: 'Decreto y proyecto en firmas',
    position: { top: '52%', left: '8%', width: '26%', height: '32%' },
    glowColor: 'rgba(245, 158, 11, 0.6)',
  },
  'carpeta-roja': {
    type: 'carpeta-roja',
    label: 'Carpeta roja clasificada',
    icon: '📕',
    channel: 'Operación secreta de Estado',
    position: { top: '40%', left: '6%', width: '22%', height: '26%' },
    glowColor: 'rgba(225, 29, 72, 0.7)',
  },
  'carta-gobernador': {
    type: 'carta-gobernador',
    label: 'Correspondencia federal',
    icon: '✉️',
    channel: 'Exigencia de provincias y coparticipación',
    position: { top: '38%', left: '36%', width: '24%', height: '22%' },
    glowColor: 'rgba(16, 185, 129, 0.6)',
  },
  'informe-inteligencia': {
    type: 'informe-inteligencia',
    label: 'Informe confidencial AFI',
    icon: '🕵️',
    channel: 'Reporte de riesgo e inteligencia',
    position: { top: '40%', left: '62%', width: '22%', height: '26%' },
    glowColor: 'rgba(168, 85, 247, 0.6)',
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

  // Filtros de iluminación fotográfica fotorrealista sobre la escena completa
  const timeOfDayFilterClass: Record<string, string> = {
    mañana: 'brightness-[1.0] contrast-[1.0]',
    tarde: 'brightness-[0.90] contrast-[1.08] sepia-[0.12] hue-rotate-[-5deg]',
    noche: 'brightness-[0.70] contrast-[1.20] saturate-[0.85] hue-rotate-[-10deg]',
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
              <span>🏛️</span> Despacho presidencial
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Sillón de Rivadavia
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Presidente <b>{character.name} {character.surname}</b> · {fortnight === 1 ? '1ª quincena' : '2ª quincena'} de {calendar.monthCycleName} ({calendar.year})
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

      {/* ─── 2. ESCRITORIO POINT-AND-CLICK CON FOTO IMPRESA LIMPIA Y LUZ FOTORREALISTA (SIN RECTÁNGULOS SOBREPUESTOS) ─── */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950 select-none">
        {/* Imagen de Fondo del Escritorio con Filtro de Luz Ambiental */}
        <img
          src="/presidential-desk.jpg"
          alt="Escritorio presidencial"
          className={`w-full h-full object-cover object-center transition-all duration-700 ${activeTimeFilter}`}
        />

        {/* HOTSPOTS INTERACTIVOS DE OBJETOS PRESENTES */}
        {visibleObjects.map((obj) => {
          const config = HOTSPOT_MAPPING[obj.type] ?? {
            type: obj.type,
            label: obj.title,
            icon: '📄',
            channel: 'Documento sobre el escritorio',
            position: { top: '52%', left: '40%', width: '22%', height: '24%' },
            glowColor: 'rgba(59, 130, 246, 0.6)',
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

      </div>

      {/* Notificación limpia de asuntos en el escritorio (debajo de la imagen, sin tapar íconos) */}
      {visibleObjects.length > 0 && (
        <div className={`p-2.5 px-6 border-b flex items-center justify-between gap-3 text-xs ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-slate-900/90 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-amber-500 text-base">🛎️</span>
            <div className="truncate">
              <span className="font-extrabold text-xs">
                {visibleObjects.length} asunto{visibleObjects.length === 1 ? '' : 's'} en el escritorio
              </span>
              <span className="text-[11px] text-slate-500 block sm:inline sm:ml-2">
                Tocá cualquier objeto sobre la mesa para inspeccionar o decidir
              </span>
            </div>
          </div>
        </div>
      )}

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
          <span>▶</span> Avanzar quincena
        </button>
      </div>

      {/* Modal Inspector de Documentos Informativos Enmarcado Elegante */}
      {activeObject && (
        <Modal
          isOpen={true}
          onClose={() => setActiveObject(null)}
          title={`📄 Documento oficial de despacho`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-900 border-slate-700 text-slate-100 shadow-lg'
            }`}>
              <div className="flex items-center gap-3 border-b pb-3 border-slate-200/60 dark:border-slate-800">
                <span className="text-3xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30">📄</span>
                <div>
                  <h4 className="font-extrabold text-sm text-amber-700 dark:text-amber-300">{activeObject.title}</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Despacho presidencial · archivo oficial
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed italic p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800 font-serif">
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
