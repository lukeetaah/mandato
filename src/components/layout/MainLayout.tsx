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
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${theme === 'light' ? 'theme-light' : 'theme-dark'} ${
      theme === 'light'
        ? 'bg-[#F4EBDD] text-[#312A22] selection:bg-amber-300/40'
        : 'bg-[#0D1117] text-[#F8FAFC] selection:bg-[#3B82F6]/30'
    }`}>
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto space-y-4 sm:space-y-6">{children}</main>
      </div>
    </div>
  );
};
