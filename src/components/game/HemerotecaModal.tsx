import React, { useState } from 'react';
import type { HeadlineIssue } from '@engine/types';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { useUIStore } from '@stores/ui-store';

export interface HemerotecaModalProps {
  isOpen: boolean;
  onClose: () => void;
  hemeroteca: HeadlineIssue[];
}

export const HemerotecaModal: React.FC<HemerotecaModalProps> = ({
  isOpen,
  onClose,
  hemeroteca,
}) => {
  const [selectedIssueIdx, setSelectedIssueIdx] = useState<number | null>(null);
  const theme = useUIStore((s) => s.theme);
  const isLight = theme === 'light';

  if (hemeroteca.length === 0) return null;

  const currentIssue = selectedIssueIdx !== null ? (hemeroteca[selectedIssueIdx] ?? hemeroteca[0]!) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📚 Hemeroteca e Historial Gráfico de Tapas">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 font-sans">
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">📰</span>
            <p className="leading-snug">
              Carrete histórico de portadas impresas. Hacé click sobre cualquier tapa para ampliar la edición histórica completa.
            </p>
          </div>
          <span className="font-bold text-[11px] px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 shrink-0">
            {hemeroteca.length} {hemeroteca.length === 1 ? 'edición' : 'ediciones'}
          </span>
        </div>

        {/* Carrete Mosaico de Tapas (Estilo Galería iOS Photos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hemeroteca.map((issue, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIssueIdx(idx)}
              className={`group relative p-4 rounded-2xl text-left border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between h-52 bg-[#f5efe0] text-slate-900 border-[#d0c2a0] hover:border-amber-500 hover:shadow-xl hover:scale-[1.02] shadow-md font-serif overflow-hidden`}
            >
              {/* Sello de zoom en hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-400 text-slate-950 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full shadow">
                🔍 Ampliar Tapa
              </div>

              <div>
                <div className="border-b border-slate-700 pb-1 mb-2">
                  <div className="flex justify-between items-center text-[9px] font-sans font-bold text-slate-600 uppercase tracking-wider">
                    <span>Edición #{issue.editionNumber}</span>
                    <span>{issue.dateString}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight font-serif mt-0.5">
                    EL DIARIO DEL SUR
                  </h3>
                </div>

                <div className="space-y-1">
                  <span className="inline-block text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                    {issue.mainHeadline.bias.toUpperCase()}
                  </span>
                  <h4 className="text-xs font-bold text-slate-950 leading-snug line-clamp-3 font-serif">
                    "{issue.mainHeadline.title}"
                  </h4>
                </div>
              </div>

              <div className="border-t border-slate-400/60 pt-2 flex items-center justify-between text-[10px] font-sans text-slate-700">
                <span className="truncate italic">"{issue.caricatureCaption}"</span>
                <span className="font-bold text-amber-700 shrink-0 ml-1">Ver Tapa →</span>
              </div>
            </button>
          ))}
        </div>

        {/* Modal de Tapa Completa en Zoom / Detalle */}
        {currentIssue && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-[#f4ebd9] text-slate-900 border-4 border-[#d6c7a1] shadow-2xl font-serif max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedIssueIdx(null)}
                className="absolute top-3 right-3 text-sm font-sans font-bold px-3 py-1 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕ Cerrar Tapa
              </button>

              {/* Cabecera del diario */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
                <div className="flex justify-between text-[10px] font-sans font-bold text-slate-700 uppercase tracking-widest mb-1">
                  <span>{currentIssue.dateString}</span>
                  <span>Edición N° {currentIssue.editionNumber}</span>
                  <span>República del Sur</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 uppercase font-serif">
                  EL DIARIO DEL SUR
                </h1>
                <p className="text-[10px] font-sans text-slate-700 italic">"El decano de la prensa nacional de la República"</p>
              </div>

              {/* Gran Titular */}
              <div className="p-4 bg-[#ede0c4] rounded-xl border border-[#c4b38a] mb-4">
                <Badge variant="rose">{currentIssue.mainHeadline.bias.toUpperCase()}</Badge>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-2 mb-1 leading-tight font-serif">
                  {currentIssue.mainHeadline.title}
                </h2>
                <p className="text-xs text-slate-800 font-sans italic">
                  {currentIssue.mainHeadline.subhead}
                </p>
              </div>

              {/* Columnas y editorial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-3.5 bg-[#ede0c4] rounded-xl border border-[#c4b38a]">
                  <h4 className="font-bold text-slate-950 border-b border-slate-700 pb-1 mb-2 font-serif">Editorial de la época</h4>
                  <p className="text-slate-800 leading-relaxed text-[11px]">
                    {currentIssue.editorialText}
                  </p>
                </div>

                <div className="p-3.5 bg-[#ede0c4] rounded-xl border border-[#c4b38a]">
                  <h4 className="font-bold text-slate-950 border-b border-slate-700 pb-1 mb-2 font-serif">Frase de época</h4>
                  <div className="p-3 bg-[#e0d0b0] rounded-xl text-center italic text-slate-800 text-[11px]">
                    🖋️ {currentIssue.caricatureCaption}
                  </div>
                </div>
              </div>

              {/* Clasificados */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-sans flex flex-wrap justify-between items-center text-slate-700 gap-2">
                <span><b>Aviso publicitario:</b> {currentIssue.adSatire}</span>
                <span><b>Obituario:</b> {currentIssue.obituary}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
