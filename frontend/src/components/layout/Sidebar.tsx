import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  CogIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Mata Kuliah',
    href: '/courses',
    icon: BookOpenIcon,
  },
  {
    name: 'Tugas',
    href: '/assignments',
    icon: DocumentTextIcon,
  },
  {
    name: 'Forum Diskusi',
    href: '/forums',
    icon: ChatBubbleLeftRightIcon,
    roles: [UserRole.STUDENT, UserRole.LECTURER],
  },
];

const adminNavigation: NavigationItem[] = [
  {
    name: 'Administrasi',
    href: '/admin',
    icon: CogIcon,
    roles: [UserRole.ADMIN],
    children: [
      {
        name: 'Manajemen Pengguna',
        href: '/admin/users',
        icon: UsersIcon,
      },
      {
        name: 'Manajemen Mata Kuliah',
        href: '/admin/courses',
        icon: AcademicCapIcon,
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth(); // Pastikan ada fungsi logout dari context

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const canAccessItem = (item: NavigationItem) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* --- BRANDING HEADER (LOGO PRODI) --- */}
      <div className="flex flex-col items-center justify-center py-8 px-4 border-b border-gray-100 bg-white">
        <Link to="/dashboard" className="flex flex-col items-center gap-3 group">
          
          {/* Container Logo - Ganti Image di sini */}
          <div className="flex items-center justify-center w-20 h-20 transition-transform duration-300 transform group-hover:scale-105">
            {/* Pastikan file 'logo-prodi.png' ada di folder public */}
            <img 
              src="/logo-prodi.png" 
              alt="Logo Teknik Informatika" 
              className="w-full h-full object-contain filter drop-shadow-sm"
              onError={(e) => {
                // Fallback kalau gambar tidak ditemukan, balik ke ikon
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Fallback Icon (Hidden by default) */}
            <div className="hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center shadow-lg">
               <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {/* Text Branding - Center Alignment */}
          <div className="flex flex-col items-center text-center">
            <span className="text-base font-bold text-gray-900 leading-tight">
              Teknik Informatika
            </span>
            <span className="text-xs font-semibold text-secondary-600 uppercase tracking-wide mt-1">
              Universitas IGM
            </span>
          </div>
        </Link>
      </div>

      {/* --- NAVIGATION CONTENT --- */}
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* Menu Utama */}
        <div>
          <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Menu Utama
          </div>
          <div className="space-y-1">
            {navigation.map((item) => {
              if (!canAccessItem(item)) return null;
              const active = isActiveLink(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors duration-200 ${
                      active ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary-500 shadow-sm" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Menu Section */}
        {user?.role === UserRole.ADMIN && (
          <div>
            <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Administrator
            </div>
            <div className="space-y-1">
              {adminNavigation.map((section) => {
                if (!canAccessItem(section)) return null;
                return (
                  <div key={section.name} className="space-y-1">
                    {section.children?.map((item) => {
                      const active = isActiveLink(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={onClose}
                          className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                            active
                              ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <item.icon
                            className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors duration-200 ${
                              active ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                            }`}
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* --- FOOTER USER INFO --- */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm ring-1 ring-gray-100">
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                src={user.avatar}
                alt={user.fullName}
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white shadow-sm font-bold text-xs ring-2 ring-white">
                {user?.fullName?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => console.log('Logout clicked')}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-50">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white shadow-xl shadow-gray-200/50">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;