import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  IdentificationIcon,
  CalendarDaysIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  // 1. Ambil data user dari AuthContext
  const { user } = useAuth();

  if (!user) {
    return <div>Memuat profil...</div>;
  }

  // Helper untuk label role yang lebih rapi
  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'student': return 'Mahasiswa';
      case 'lecturer': return 'Dosen';
      case 'admin': return 'Administrator';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-900">Profil Saya</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- KARTU KIRI: FOTO & RINGKASAN --- */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {/* Avatar / Foto Profil */}
              <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center mb-4 ring-4 ring-white shadow-lg overflow-hidden text-primary-600">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-24 w-24" />
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 text-center">{user.fullName}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'lecturer' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            
            <div className="mt-8 border-t border-gray-100 pt-6 space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              {/* Tampilkan NIM atau NIDN jika ada */}
              {(user.studentId || user.lecturerId) && (
                <div className="flex items-center text-sm text-gray-600">
                  <IdentificationIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{user.studentId || user.lecturerId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* --- KARTU KANAN: INFORMASI DETAIL --- */}
        <Card className="md:col-span-2">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Nama Lengkap</dt>
                <dd className="mt-1 text-sm text-gray-900 font-medium">{user.fullName}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  {user.role === 'student' ? 'NIM' : user.role === 'lecturer' ? 'NIDN' : 'ID Pengguna'}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {user.studentId || user.lecturerId || '-'}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status Akun</dt>
                <dd className="mt-1 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Aktif
                  </span>
                </dd>
              </div>

              {/* Data Tambahan (Jika di masa depan backend mengirim phone/address) */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" /> No. Telepon
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.phone || '-'}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" /> Bergabung Sejak
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {/* 👇 Perbaikan di sini: Cek apakah user.createdAt ada */}
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  }) : '-'}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" /> Alamat
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.address || '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;