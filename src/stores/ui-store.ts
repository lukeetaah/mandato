import { create } from 'zustand';

export type ActiveTab = 'dashboard' | 'decisiones' | 'camino' | 'provincias' | 'personaje' | 'prensa' | 'historial';

interface UIStore {
  activeTab: ActiveTab;
  selectedProvinceId: string | null;
  isLogOpen: boolean;

  setActiveTab: (tab: ActiveTab) => void;
  setSelectedProvinceId: (id: string | null) => void;
  toggleLog: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'dashboard',
  selectedProvinceId: null,
  isLogOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedProvinceId: (id) => set({ selectedProvinceId: id }),
  toggleLog: () => set((s) => ({ isLogOpen: !s.isLogOpen })),
}));
