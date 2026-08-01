import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUIStore } from '@stores/ui-store';
import { useGameStore } from '@stores/game-store';
export const Sidebar = () => {
    const { activeTab, setActiveTab } = useUIStore();
    const pendingDecisionsCount = useGameStore((s) => s.gameState?.pendingDecisions.length ?? 0);
    const tabs = [
        { id: 'dashboard', label: 'Nación', icon: '🏛️' },
        { id: 'decisiones', label: 'Decisiones pendientes', icon: '⚖️', badge: pendingDecisionsCount },
        { id: 'camino', label: 'Trayectoria política', icon: '🛤️' },
        { id: 'provincias', label: 'Provincias', icon: '🗺️' },
        { id: 'personaje', label: 'Perfil y vida', icon: '👤' },
        { id: 'prensa', label: 'Prensa y redes', icon: '📰' },
        { id: 'historial', label: 'Historial del mandato', icon: '📜' },
    ];
    return (_jsx("aside", { className: "w-64 glass-panel border-r border-slate-800 p-4 flex flex-col gap-2", children: _jsx("nav", { className: "flex-1 space-y-1", children: tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${isActive
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-base", children: tab.icon }), _jsx("span", { children: tab.label })] }), tab.badge !== undefined && tab.badge > 0 && (_jsx("span", { className: "bg-amber-400 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full shadow-sm", children: tab.badge }))] }, tab.id));
            }) }) }));
};
