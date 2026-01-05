import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
// import Sidebar from './Sidebar'; // HAPUS ATAU KOMENTAR INI
// import Header from './Header';   // HAPUS ATAU KOMENTAR INI

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]"> {/* Background Abu Terang Modern */}
      
      {/* GANTI SIDEBAR & HEADER LAMA DENGAN TOPNAVBAR */}
      <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      {/* MOBILE MENU DRAWER (Opsional, simpel saja untuk layout ini) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
           <div className="absolute right-0 top-0 h-full w-64 bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-6">Menu</h2>
              {/* List menu mobile bisa ditaruh di sini jika perlu */}
           </div>
        </div>
      )}
      
      {/* MAIN CONTENT WRAPPER */}
      {/* Hapus margin-left (ml-64) karena tidak ada sidebar lagi */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
           {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 text-center border-t border-gray-200 mt-auto">
         <p className="text-sm text-gray-400 font-medium">
           &copy; {new Date().getFullYear()} LMS Teknik Informatika UIGM
         </p>
      </footer>
    </div>
  );
};

export default Layout;