import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { 
  HomeIcon, 
  BookOpenIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  Bars3Icon, 
  ArrowRightOnRectangleIcon, 
  BellIcon,
  UserCircleIcon // Icon baru untuk menu profil
} from '@heroicons/react/24/outline';

interface TopNavbarProps {
  onMobileMenuToggle: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Mata Kuliah', href: '/courses', icon: BookOpenIcon },
    { name: 'Tugas', href: '/assignments', icon: DocumentTextIcon },
    { name: 'Forum', href: '/forums', icon: ChatBubbleLeftRightIcon, roles: [UserRole.STUDENT, UserRole.LECTURER] },
  ];

  const canAccess = (item: any) => !item.roles || (user && item.roles.includes(user.role));
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* 1. LOGO & BRAND */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-primary-50 p-2 rounded-xl">
                 <img src="/logo-prodi.png" alt="Logo" className="h-8 w-8 object-contain" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900 leading-none">LMS Informatika</h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">Universitas IGM</p>
              </div>
            </Link>

            {/* 2. DESKTOP NAVIGATION */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => canAccess(item) && (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
                    ${isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* 3. RIGHT SECTION */}
          <div className="flex items-center gap-4">
            
            {/* PERBAIKAN 1: Tombol Notifikasi sekarang bisa diklik */}
            <Link 
              to="/notifications" 
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-all relative group"
              title="Notifikasi"
            >
               <BellIcon className="h-6 w-6 group-hover:animate-swing" />
               {/* Indikator merah (bisa dikondisikan nanti jika ada data notifikasi belum dibaca) */}
               <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-gray-100 hover:border-primary-100 hover:bg-primary-50 transition-all focus:ring-2 focus:ring-primary-100"
              >
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-bold text-gray-800 leading-tight">{user?.fullName}</p>
                   <p className="text-[10px] text-gray-500 uppercase tracking-wider">{user?.role}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    user?.fullName?.charAt(0)
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                  
                  {/* Info User di Mobile (karena di navbar disembunyikan) */}
                  <div className="px-4 py-3 border-b border-gray-50 mb-2 bg-gray-50/50 sm:hidden">
                     <p className="font-bold text-gray-900 truncate">{user?.fullName}</p>
                     <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                  </div>

                  {/* PERBAIKAN 2: Menu Lihat Profil Ditambahkan */}
                  <Link 
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-3 transition-colors"
                  >
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    Lihat Profil
                  </Link>

                  <div className="my-1 border-t border-gray-100"></div>

                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Keluar
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;