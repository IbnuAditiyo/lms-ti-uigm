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
      
      {/* WRAPPER UTAMA:
         Ditambahkan 'flex flex-col min-h-screen' agar footer selalu di bawah (sticky).
      */}
      <div className="flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* MAIN CONTENT:
           Ubah 'min-h-screen' jadi 'flex-1' agar tidak mendorong footer terlalu jauh 
           sampai keluar layar kalau kontennya sedikit.
        */}
        <main className="flex-1 bg-gray-50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[calc(100vh-8rem)]">
              <div className="p-6">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* --- FOOTER FIX (BRANDING TI UIGM) --- */}
        <footer className="mt-auto border-t border-gray-200 bg-white py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
            
            {/* Kiri: Copyright & Identitas Prodi */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-primary-600">Teknik Informatika</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Universitas Indo Global Mandiri
              </p>
            </div>

            {/* Kanan: Link Bantuan */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors">
                Bantuan
              </a>
              <a href="#" className="text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors">
                Kebijakan Privasi
              </a>
            </div>
            
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Layout;