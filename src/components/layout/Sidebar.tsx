import React from 'react';
import { useUIStore, type ActiveTab } from '@stores/ui-store';
import { useGameStore } from '@stores/game-store';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, sidebarCollapsed, toggleSidebar, theme } = useUIStore();
  const pendingDecisionsCount = useGameStore((s) => s.gameState?.pendingDecisions.length ?? 0);

  const tabs: { id: ActiveTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Nación & Decisiones', icon: '🏛️', badge: pendingDecisionsCount },
    { id: 'calendario', label: 'Calendario', icon: '📅' },
    { id: 'camino', label: 'Trayectoria política', icon: '🛤️' },
    { id: 'provincias', label: 'Provincias', icon: '🗺️' },
    { id: 'personaje', label: 'Perfil y vida', icon: '👤' },
    { id: 'prensa', label: 'Prensa y redes', icon: '📰' },
    { id: 'historial', label: 'Historial del mandato', icon: '📜' },
  ];

  const mobileTabs = tabs.filter((t) => ['dashboard', 'provincias', 'prensa', 'historial'].includes(t.id));

  const isLight = theme === 'light';

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-[4.5rem]' : 'w-64'} shrink-0 ${
        isLight ? 'bg-white border-r border-slate-200 shadow-sm' : 'bg-[#161B22] border-r border-[#30363D] shadow-lg'
      } p-4 flex-col gap-3 transition-[width] duration-200`}>
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
          {!sidebarCollapsed && <span className={`px-2 text-[10px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-400' : 'text-[#94A3B8]'}`}>Navegación</span>}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`w-9 h-9 rounded-2xl border flex items-center justify-center font-bold transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-blue-500'
                : 'border-[#30363D] bg-[#0D1117] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#3B82F6]'
            }`}
            aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Minimizar menú lateral'}
            title={sidebarCollapsed ? 'Expandir menú' : 'Minimizar menú'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 font-sans">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={tab.label}
                title={sidebarCollapsed ? tab.label : undefined}
                className={`relative w-full flex items-center justify-between ${sidebarCollapsed ? 'px-2 justify-center' : 'px-3.5'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-blue-50 text-blue-600 border border-blue-500/40 shadow-sm'
                      : 'bg-[#1E293B] text-[#3B82F6] border border-[#3B82F6]/50 shadow-md'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/60 border border-transparent'
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? '' : 'gap-3'}`}>
                  <span className="text-base">{tab.icon}</span>
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`${sidebarCollapsed ? 'absolute ml-7 -mt-6 min-w-4 px-1' : 'px-2.5'} bg-[#F59E0B] text-slate-950 text-[10px] font-black py-0.5 rounded-full shadow-sm`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── MOBILE BOTTOM BAR ─── */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-md border-t flex items-center justify-around px-2 py-2 shadow-2xl ${
        isLight ? 'bg-white/95 border-slate-200' : 'bg-[#161B22]/95 border-[#30363D]'
      }`}>
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl text-[10px] font-bold transition-all ${
                isActive
                  ? isLight ? 'text-blue-600 bg-blue-50' : 'text-[#3B82F6] bg-[#1E293B]'
                  : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label.split(' ')[0]}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-0 right-1 bg-[#F59E0B] text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

