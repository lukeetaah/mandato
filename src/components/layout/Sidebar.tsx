import React from 'react';
import { useUIStore, type ActiveTab } from '@stores/ui-store';
import { useGameStore } from '@stores/game-store';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar } = useUIStore();
  const pendingDecisionsCount = useGameStore((s) => s.gameState?.pendingDecisions.length ?? 0);

  const tabs: { id: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Nación', icon: '🏛️' },
    { id: 'decisiones', label: 'Decisiones pendientes', icon: '⚖️', badge: pendingDecisionsCount },
    { id: 'calendario', label: 'Calendario', icon: '📅' },
    { id: 'camino', label: 'Trayectoria política', icon: '🛤️' },
    { id: 'provincias', label: 'Provincias', icon: '🗺️' },
    { id: 'personaje', label: 'Perfil y vida', icon: '👤' },
    { id: 'prensa', label: 'Prensa y redes', icon: '📰' },
    { id: 'historial', label: 'Historial del mandato', icon: '📜' },
  ];

  return (
    <aside className={`${sidebarCollapsed ? 'w-[4.5rem]' : 'w-64'} shrink-0 glass-panel border-r border-slate-800 p-3 flex flex-col gap-2 transition-[width] duration-200`}>
      <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
        {!sidebarCollapsed && <span className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Navegación</span>}
        <button
          type="button"
          onClick={toggleSidebar}
          className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100 hover:border-sky-500/40 transition-colors cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Minimizar menú lateral'}
          title={sidebarCollapsed ? 'Expandir menú' : 'Minimizar menú'}
        >
          {sidebarCollapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
              title={sidebarCollapsed ? tab.label : undefined}
              className={`relative w-full flex items-center justify-between ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3'} py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                <span className="text-base">{tab.icon}</span>
                {!sidebarCollapsed && <span>{tab.label}</span>}
              </div>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`${sidebarCollapsed ? 'absolute ml-7 -mt-6 min-w-4 px-1' : 'px-2'} bg-amber-400 text-slate-950 text-[10px] font-black py-0.5 rounded-full shadow-sm`}>
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
