import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  onRefresh?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  onNavigate,
  children,
  onRefresh
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F1F5F9] text-slate-900">
      {/* Left Sidebar - Professional Dark Navy */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F1F5F9]">
        {/* Top Header - Crisp Professional White */}
        <Header onRefresh={onRefresh} />

        {/* Scrollable Viewport - desktop-first, zero horizontal scrolling */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F1F5F9] p-4 lg:p-6">
          <div className="max-w-[1920px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
