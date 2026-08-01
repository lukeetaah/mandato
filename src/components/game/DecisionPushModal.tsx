import React from 'react';
import type { Decision } from '@engine/types';
import { Modal } from '@components/ui/Modal';
import { DecisionCard } from './DecisionCard';

export interface DecisionPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisions: Decision[];
}

export const DecisionPushModal: React.FC<DecisionPushModalProps> = ({
  isOpen,
  onClose,
  decisions,
}) => {
  if (decisions.length === 0) return null;

  const currentDecision = decisions[0]!;
  const urgencyLabel = {
    baja: '📋 Asunto Pendiente',
    media: '📨 Requiere Atención',
    alta: '⚠️ Situación Urgente',
    critica: '🚨 CRISIS — Acción Inmediata',
  }[currentDecision.urgency] ?? '⚠️ Decisión Pendiente';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={urgencyLabel}>
      <div className="max-h-[75vh] overflow-y-auto pr-1 space-y-4">
        {currentDecision.urgency === 'critica' && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-rose-200 text-xs animate-pulse">
            <b>⚡ Esta situación no puede esperar.</b> Ignorarla tendrá consecuencias automáticas en el próximo turno.
          </div>
        )}
        <DecisionCard 
          decision={currentDecision} 
          onDecisionMade={() => {
            if (decisions.length <= 1) {
              onClose();
            }
          }} 
        />
        {decisions.length > 1 && (
          <p className="text-xs text-slate-500 text-center">
            Asunto 1 de {decisions.length}
          </p>
        )}
      </div>
    </Modal>
  );
};
