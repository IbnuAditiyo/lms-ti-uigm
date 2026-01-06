import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { userService } from '../../services/userService';
import { courseService } from '../../services/courseService';
import { User, Course, UserRole } from '../../types';
import {
  Users, BookOpen, Activity, RefreshCw, AlertTriangle,
  UserPlus, ShieldCheck, GraduationCap, School, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalAdmins: 0,
    totalCourses: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, coursesResponse] = await Promise.all([
        userService.getUsers({ limit: 100 }),
        courseService.getCourses({ limit: 100 }),
      ]);

      const users = usersResponse.data || [];
      const courses = coursesResponse.data || [];

      const totalStudents = users.filter(u => u.role === UserRole.STUDENT).length;
      const totalLecturers = users.filter(u => u.role === UserRole.LECTURER).length;
      const totalAdmins = users.filter(u => u.role === UserRole.ADMIN).length;
      const activeCourses = courses.filter(c => c.isActive !== false).length;

      setStats({
        totalUsers: users.length,
        totalStudents,
        totalLecturers,
        totalAdmins,
        totalCourses: courses.length,
        activeCourses,
      });

      const sortedUsers = users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const sortedCourses = courses
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentUsers(sortedUsers);
      setRecentCourses(sortedCourses);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center">
           <RefreshCw className="w-10 h-10 text-slate-300 animate-spin mb-4" />
           <p className="text-slate-500 font-medium">Menyiapkan panel admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Panel Administrator
          </h1>
          <p className="text-slate-500 mt-1">
            Pantau kesehatan sistem dan aktivitas pengguna secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-xs text-slate-500 font-medium">
             Updated: {lastUpdated.toLocaleTimeString()}
           </span>
           <Button variant="ghost" size="sm" onClick={handleRefresh} className="ml-2 h-8 w-8 p-0 rounded-full hover:bg-slate-200">
             <RefreshCw className="w-4 h-4 text-slate-600" />
           </Button>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-blue-300 transition-colors">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-24 h-24 text-blue-600" />
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Pengguna</p>
           <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.totalUsers}</h3>
           <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
              <UserPlus className="w-3 h-3" />
              <span>{stats.totalStudents + stats.totalLecturers} Aktif</span>
           </div>
        </div>

        {/* Mahasiswa */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-emerald-300 transition-colors">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <GraduationCap className="w-24 h-24 text-emerald-600" />
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Mahasiswa</p>
           <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.totalStudents}</h3>
           <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(stats.totalStudents / stats.totalUsers) * 100}%` }}></div>
           </div>
        </div>

        {/* Dosen */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-purple-300 transition-colors">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <School className="w-24 h-24 text-purple-600" />
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Dosen</p>
           <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.totalLecturers}</h3>
           <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(stats.totalLecturers / stats.totalUsers) * 100}%` }}></div>
           </div>
        </div>

        {/* Courses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-orange-300 transition-colors">
           <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24 text-orange-600" />
           </div>
           <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Mata Kuliah</p>
           <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.totalCourses}</h3>
           <div className="mt-4 flex items-center gap-2 text-xs font-medium text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded">
              <Activity className="w-3 h-3" />
              <span>{stats.activeCourses} Sedang Berjalan</span>
           </div>
        </div>
      </div>

      {/* System Alert (Jika Kosong) */}
      {stats.totalUsers === 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-4">
           <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
           <div>
              <h4 className="font-bold text-amber-800">Database Kosong</h4>
              <p className="text-sm text-amber-700 mt-1">Belum ada data pengguna. Silakan mulai dengan menambahkan user baru atau melakukan seeding data.</p>
              <Button size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 text-white border-none">Setup Database</Button>
           </div>
        </div>
      )}

      {/* 3. MAIN CONTENT (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <UserPlus className="w-5 h-5 text-blue-500" /> Registrasi Terbaru
              </h3>
              <Link to="/admin/users" className="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</Link>
           </div>
           <div className="divide-y divide-slate-50">
              {recentUsers.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">Belum ada data pengguna.</div>
              ) : (
                 recentUsers.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${
                             user.role === UserRole.ADMIN ? 'bg-slate-800' :
                             user.role === UserRole.LECTURER ? 'bg-purple-500' : 'bg-emerald-500'
                          }`}>
                             {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <p className="font-bold text-slate-800 text-sm">{user.fullName}</p>
                             <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1 ${
                             user.role === UserRole.ADMIN ? 'bg-slate-100 text-slate-600' :
                             user.role === UserRole.LECTURER ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                             {user.role}
                          </span>
                          <p className="text-[10px] text-slate-400">{formatTimeAgo(user.createdAt)}</p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-orange-500" /> Mata Kuliah Baru
              </h3>
              <Link to="/admin/courses" className="text-xs font-bold text-orange-600 hover:underline">Lihat Semua</Link>
           </div>
           <div className="divide-y divide-slate-50">
              {recentCourses.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">Belum ada data mata kuliah.</div>
              ) : (
                 recentCourses.map((course) => (
                    <div key={course.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                             <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-800 text-sm line-clamp-1">{course.name}</p>
                             <p className="text-xs text-slate-500 font-mono">{course.code} • {course.credits} SKS</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="flex items-center justify-end gap-1 mb-1">
                             <span className={`w-2 h-2 rounded-full ${course.isActive !== false ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                             <span className="text-[10px] font-medium text-slate-600">{course.isActive !== false ? 'Active' : 'Draft'}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{formatTimeAgo(course.createdAt)}</p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        </div>

      </div>

      {/* 4. QUICK ACTIONS BAR (Light Theme Fix) */}
      {/* Container diubah jadi putih dengan border, bukan hitam lagi */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
         <div>
            <h3 className="font-bold text-lg text-slate-800">Menu Cepat Administrator</h3>
            <p className="text-slate-500 text-sm">Akses fitur manajemen utama dengan satu klik.</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Tombol Users - Warna Biru Solid */}
            <Link to="/admin/users" className="flex-1 sm:flex-none">
               <Button className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 border-none font-bold shadow-md shadow-blue-100">
                  <Users className="w-4 h-4 mr-2"/> Users
               </Button>
            </Link>
            
            {/* Tombol Courses - Warna Oranye Solid (Agar kontras dan kelihatan) */}
            <Link to="/admin/courses" className="flex-1 sm:flex-none">
               <Button className="w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600 border-none font-bold shadow-md shadow-orange-100">
                  <BookOpen className="w-4 h-4 mr-2"/> Courses
               </Button>
            </Link>

            {/* Tombol Laporan (Opsional) - Outline tapi text gelap */}
            <Link to="/admin/reports" className="flex-1 sm:flex-none">
               <Button variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
                  <Activity className="w-4 h-4 mr-2"/> Laporan
               </Button>
            </Link>
         </div>
      </div>

    </div>
  );
};

export default AdminDashboard;