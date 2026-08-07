import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#3B82F6]/30">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">{children}</main>
      </div>
    </div>
  );
};
