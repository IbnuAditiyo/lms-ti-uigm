import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area with proper margin compensation for fixed sidebar */}
      <div className="md:ml-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main Content */}
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]">
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* Footer Sederhana & Modern (Opsional) */}
        <footer className="px-10 py-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-medium text-slate-400">
              © {new Date().getFullYear()} Universitas Indo Global Mandiri. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors">Bantuan</a>
              <a href="#" className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors">Kebijakan Privasi</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Layout;