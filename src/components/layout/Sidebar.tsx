import React from 'react';
import { useUIStore, type ActiveTab } from '@stores/ui-store';
import { useGameStore } from '@stores/game-store';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const pendingDecisionsCount = useGameStore((s) => s.gameState?.pendingDecisions.length ?? 0);

  const tabs: { id: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Nación', icon: '🏛️' },
    { id: 'decisiones', label: 'Decisiones pendientes', icon: '⚖️', badge: pendingDecisionsCount },
    { id: 'camino', label: 'Trayectoria política', icon: '🛤️' },
    { id: 'provincias', label: 'Provincias', icon: '🗺️' },
    { id: 'personaje', label: 'Perfil y vida', icon: '👤' },
    { id: 'prensa', label: 'Prensa y redes', icon: '📰' },
    { id: 'historial', label: 'Historial del mandato', icon: '📜' },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 p-4 flex flex-col gap-2">
      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
