import React from 'react';
import type { LogEntry } from '@engine/types';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';

export interface DecisionFlowMapProps {
  eventLog: LogEntry[];
  detectedProfile: string;
}

export const DecisionFlowMap: React.FC<DecisionFlowMapProps> = ({ eventLog, detectedProfile }) => {
  const decisionLogs = eventLog.filter((log) => log.type === 'decision');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header del Perfil Moral / Político */}
      <Card
        title="🗺️ Trayectoria Política y Flujo Moral"
        subtitle="Mapa de decisiones que han moldeado tu gestión sin retorno"
        action={<Badge variant="gold">Perfil Actual: {detectedProfile.toUpperCase()}</Badge>}
        className="border-amber-400/30"
      >
        <p className="text-xs text-slate-300">
          Cada opción tomada dejó huella en las instituciones de la República del Sur. No hay camino único correcto: solo consecuencias e inclinaciones.
        </p>
      </Card>

      {/* Flujo Visual de Nodos Conectados */}
      {decisionLogs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-slate-400 text-sm">Aún no has tomado decisiones decisivas en este mandato.</p>
        </Card>
      ) : (
        <div className="relative pl-6 border-l-2 border-sky-500/40 space-y-6 my-4">
          {decisionLogs.map((log, idx) => {
            const isPragmatic = log.description.toLowerCase().includes('aporte') || log.description.toLowerCase().includes('aumento');
            const isIdealist = log.description.toLowerCase().includes('rechazar') || log.description.toLowerCase().includes('cancelar');

            return (
              <div key={idx} className="relative group">
                {/* Indicador de Nodo en la línea de tiempo */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-950 transition-all group-hover:scale-125 ${
                    isPragmatic ? 'bg-amber-400 shadow-lg shadow-amber-400/50' : isIdealist ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-sky-400 shadow-lg shadow-sky-400/50'
                  }`}
                />

                <Card className="p-4 transition-all group-hover:border-sky-500/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-sky-400">Turno {log.turn}</span>
                    <Badge variant={isPragmatic ? 'gold' : isIdealist ? 'emerald' : 'sky'}>
                      {isPragmatic ? '⚖️ Pragmatismo' : isIdealist ? '🕊️ Principiista' : '🏛️ Institucional'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{log.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 font-medium bg-slate-950/40 p-2 rounded border border-slate-800/80">
                    {log.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
