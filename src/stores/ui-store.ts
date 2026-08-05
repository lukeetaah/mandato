import { create } from 'zustand';

export type ActiveTab = 'dashboard' | 'decisiones' | 'calendario' | 'camino' | 'provincias' | 'personaje' | 'prensa' | 'historial';

interface UIStore {
  activeTab: ActiveTab;
  selectedProvinceId: string | null;
  isLogOpen: boolean;
  sidebarCollapsed: boolean;

  setActiveTab: (tab: ActiveTab) => void;
  setSelectedProvinceId: (id: string | null) => void;
  toggleLog: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const initialSidebarCollapsed = typeof window !== 'undefined'
  ? window.localStorage.getItem('mi-mandato-sidebar-collapsed') === 'true'
  : false;

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'dashboard',
  selectedProvinceId: null,
  isLogOpen: false,
  sidebarCollapsed: initialSidebarCollapsed,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedProvinceId: (id) => set({ selectedProvinceId: id }),
  toggleLog: () => set((s) => ({ isLogOpen: !s.isLogOpen })),
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('mi-mandato-sidebar-collapsed', String(collapsed));
    set({ sidebarCollapsed: collapsed });
  },
  toggleSidebar: () => set((s) => {
    const collapsed = !s.sidebarCollapsed;
    if (typeof window !== 'undefined') window.localStorage.setItem('mi-mandato-sidebar-collapsed', String(collapsed));
    return { sidebarCollapsed: collapsed };
  }),
}));
