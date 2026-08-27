import { create } from 'zustand';

export type ActiveTab = 'dashboard' | 'decisiones' | 'calendario' | 'camino' | 'provincias' | 'personaje' | 'prensa' | 'historial';
export type ThemeMode = 'light' | 'dark';

interface UIStore {
  activeTab: ActiveTab;
  selectedProvinceId: string | null;
  isLogOpen: boolean;
  sidebarCollapsed: boolean;
  theme: ThemeMode;

  setActiveTab: (tab: ActiveTab) => void;
  setSelectedProvinceId: (id: string | null) => void;
  toggleLog: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const initialSidebarCollapsed = typeof window !== 'undefined'
  ? window.localStorage.getItem('mi-mandato-sidebar-collapsed') === 'true'
  : false;

// El modo oscuro es la experiencia base; si el jugador eligió otro, respetamos su preferencia.
const initialTheme: ThemeMode = (typeof window !== 'undefined' && window.localStorage.getItem('mi-mandato-theme') as ThemeMode) || 'dark';

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'dashboard',
  selectedProvinceId: null,
  isLogOpen: false,
  sidebarCollapsed: initialSidebarCollapsed,
  theme: initialTheme,

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
  toggleTheme: () => set((s) => {
    const nextTheme: ThemeMode = s.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') window.localStorage.setItem('mi-mandato-theme', nextTheme);
    return { theme: nextTheme };
  }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') window.localStorage.setItem('mi-mandato-theme', theme);
    set({ theme });
  },
}));
