import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@stores/ui-store';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const isLight = useUIStore((s) => s.theme === 'light');
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative glass-panel w-full max-w-3xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] rounded-2xl p-4 sm:p-6 shadow-2xl z-10 border flex flex-col ${isLight ? 'border-[#D7C6AD]' : 'border-slate-700/50'}`}
          >
            <div className={`flex justify-between items-center gap-3 mb-3 border-b pb-3 shrink-0 ${isLight ? 'border-[#DECDB5]' : 'border-slate-800'}`}>
              <h2 className={`text-lg sm:text-xl font-bold ${isLight ? 'text-[#312A22]' : 'text-slate-100'}`}>{title}</h2>
              <button
                onClick={onClose}
                aria-label="Cerrar ventana"
                className={`text-lg font-bold p-2 -mr-1 -mt-1 cursor-pointer shrink-0 ${isLight ? 'text-[#806D59] hover:text-[#312A22]' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain pr-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
