import React, { useState } from 'react';
import type { HeadlineIssue } from '@engine/types';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';

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
  const [selectedIssueIdx, setSelectedIssueIdx] = useState(0);

  if (hemeroteca.length === 0) return null;

  const currentIssue = hemeroteca[selectedIssueIdx] ?? hemeroteca[0]!;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📚 Hemeroteca Nacional del Sur">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        <p className="text-xs text-slate-300">
          Registro gráfico e histórico impreso de cada mes de gobierno. Seleccioná una edición para consultar la prensa de la época.
        </p>

        {/* Lista horizontal de ediciones */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
          {hemeroteca.map((issue, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIssueIdx(idx)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedIssueIdx === idx
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              N° {issue.editionNumber} — {issue.fortnight === 1 ? '1ª Quincena' : '2ª Quincena'} {issue.season} {issue.year}
            </button>
          ))}
        </div>

        {/* Portada del Periódico de la Época */}
        <div className="p-6 rounded-2xl bg-[#f4ebd9] text-slate-900 border-4 border-[#d6c7a1] shadow-2xl font-serif">
          {/* Cabecera */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
            <div className="flex justify-between text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">
              <span>{currentIssue.dateString}</span>
              <span>República del Sur</span>
              <span>Precio: $120</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 uppercase font-serif">
              EL DIARIO DEL SUR
            </h1>
            <p className="text-[10px] text-slate-700 italic">"El decano de la prensa nacional de la República"</p>
          </div>

          {/* Gran Titular de Portada */}
          <div className="p-4 bg-[#ede0c4] rounded-lg border border-[#c4b38a] mb-4">
            <Badge variant="rose">{currentIssue.mainHeadline.bias.toUpperCase()}</Badge>
            <h2 className="text-2xl font-black text-slate-950 mt-2 mb-1 leading-tight font-serif">
              {currentIssue.mainHeadline.title}
            </h2>
            <p className="text-xs text-slate-800 font-sans italic">
              {currentIssue.mainHeadline.subhead}
            </p>
          </div>

          {/* Secciones de Columnas y Caricatura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3 bg-[#ede0c4] rounded-lg border border-[#c4b38a]">
              <h4 className="font-bold text-slate-950 border-b border-slate-700 pb-1 mb-2">Editorial de la época</h4>
              <p className="text-slate-800 leading-relaxed text-[11px]">
                {currentIssue.editorialText}
              </p>
            </div>

            <div className="p-3 bg-[#ede0c4] rounded-lg border border-[#c4b38a]">
              <h4 className="font-bold text-slate-950 border-b border-slate-700 pb-1 mb-2">Humor gráfico / Caricatura</h4>
              <div className="p-3 bg-[#e0d0b0] rounded text-center italic text-slate-800 text-[11px]">
                🎨 "{currentIssue.caricatureCaption}"
              </div>
            </div>
          </div>

          {/* Pie de página con clasificados satíricos */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-sans flex justify-between items-center text-slate-700">
            <span><b>Aviso publicitario:</b> {currentIssue.adSatire}</span>
            <span><b>Obituario:</b> {currentIssue.obituary}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
