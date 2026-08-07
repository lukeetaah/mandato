import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@stores/ui-store';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useUIStore((s) => s.theme);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'light'
        ? 'bg-[#F1F5F9] text-[#0F172A] selection:bg-[#3B82F6]/20'
        : 'bg-[#0D1117] text-[#F8FAFC] selection:bg-[#3B82F6]/30'
    }`}>
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">{children}</main>
      </div>
    </div>
  );
};
