import { create } from 'zustand';
export const useUIStore = create((set) => ({
    activeTab: 'dashboard',
    selectedProvinceId: null,
    isLogOpen: false,
    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedProvinceId: (id) => set({ selectedProvinceId: id }),
    toggleLog: () => set((s) => ({ isLogOpen: !s.isLogOpen })),
}));
