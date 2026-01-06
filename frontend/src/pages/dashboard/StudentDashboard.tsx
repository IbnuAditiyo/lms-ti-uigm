import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftIcon,
  BellIcon,
  ClockIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { courseService, assignmentService, notificationService, forumService } from '../../services';
import { formatDate, getDeadlineStatus } from '../../utils/date';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface DashboardStats {
  enrolledCourses: number;
  pendingAssignments: number;
  unreadNotifications: number;
  activeDiscussions: number;
  completionRate: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    courseName: string;
    dueDate: string;
    status: 'urgent' | 'warning' | 'normal';
  }>;
  recentActivities: Array<{
    id:string;
    type: 'assignment' | 'announcement' | 'grade' | 'forum';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

const StudentDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error, isFetching } = useQuery<DashboardStats>(
    'student-dashboard-stats',
    async () => {
      const [courses, assignmentsResponse, notificationsResponse, forums] = await Promise.all([
        courseService.getMyCourses(),
        assignmentService.getAssignments(),
        notificationService.getMyNotifications(),
        forumService.getMyDiscussions()
      ]);

      // Extract data from API responses
      const assignments = assignmentsResponse.data || [];
      const notifications = notificationsResponse.data || [];

      // Calculate statistics
      const pendingAssignments = assignments.filter(a => !a.mySubmission || a.mySubmission.status !== 'graded').length;
      const completedAssignments = assignments.filter(a => a.mySubmission && a.mySubmission.status === 'graded').length;
      const completionRate = assignments.length > 0 
        ? Math.round((completedAssignments / assignments.length) * 100)
        : 0;

      // Get upcoming deadlines
      const upcomingDeadlines = assignments
        .filter(a => (!a.mySubmission || a.mySubmission.status !== 'graded') && new Date(a.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5)
        .map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          courseName: assignment.course.name,
          dueDate: assignment.dueDate,
          status: getDeadlineStatus(assignment.dueDate)
        }));

      // Get recent activities from various sources
      const recentAssignments = assignments
        .filter(a => new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // last 7 days
        .map(a => ({
          id: a.id,
          type: 'assignment' as const,
          title: `Tugas baru: ${a.title}`,
          description: a.course.name,
          timestamp: a.createdAt
      }));
      
      const recentSubmissions = assignments
        .filter(a => a.mySubmission && new Date(a.mySubmission.submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .map(a => ({
            id: a.mySubmission!.id,
            type: (a.mySubmission!.status === 'graded' ? 'grade' : 'assignment') as 'grade' | 'assignment',
            title: a.mySubmission!.status === 'graded' ? `Tugas dinilai: ${a.title}` : `Tugas dikumpulkan: ${a.title}`,
            description: a.course.name,
            timestamp: a.mySubmission!.submittedAt
        }));

      const recentNotifications = notifications.slice(0, 5).map(n => ({
        id: n.id,
        type: n.type as 'announcement' | 'grade',
        title: n.title,
        description: n.message,
        timestamp: n.createdAt
      }));

      const recentActivities = [...recentAssignments, ...recentSubmissions, ...recentNotifications]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      return {
        enrolledCourses: courses.length,
        pendingAssignments,
        unreadNotifications: notifications.filter(n => !n.isRead).length,
        activeDiscussions: forums.filter(f => !f.isLocked).length,
        completionRate,
        upcomingDeadlines,
        recentActivities
      };
    },
    {
      refetchOnWindowFocus: false, // Disable auto-refresh on focus
    }
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries('student-dashboard-stats');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Gagal memuat dashboard. Silakan coba lagi." />;
  }

  return (
    <div className="space-y-8 pb-8">
      
      {/* 1. HERO SECTION BARU (Ganti Header Lama) */}
      <div className="relative bg-gradient-to-br from-emerald-700 to-teal-900 rounded-3xl p-8 pt-10 shadow-2xl overflow-hidden text-white">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard Mahasiswa</h1>
            <p className="text-emerald-100 text-lg">
              Selamat datang kembali! Tetap semangat mengejar target belajarmu hari ini.
            </p>
          </div>

          {/* FITUR REFRESH & TANGGAL (Dipertahankan tapi didesain ulang) */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl">
             <Button 
                onClick={handleRefresh} 
                variant="ghost" 
                size="sm" 
                disabled={isFetching}
                className="text-white hover:bg-white/20 hover:text-white border-transparent"
             >
                <ArrowPathIcon className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="ml-2 font-medium">{isFetching ? 'Memuat...' : 'Refresh Data'}</span>
             </Button>
             
             <div className="hidden sm:block w-px bg-white/20 my-1"></div>
             
             <div className="flex items-center px-4 py-2 text-white bg-black/20 rounded-xl border border-white/5 shadow-inner">
                <CalendarIcon className="h-5 w-5 mr-2 text-yellow-300" />
                <span className="text-sm font-semibold">{formatDate(new Date(), 'full')}</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID (Desain Floating Card di atas Banner) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 relative z-20 px-2">
        
        {/* Card 1: Courses */}
        <Card className="p-6 shadow-xl border-t-4 border-t-blue-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mata Kuliah</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.enrolledCourses || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shadow-sm">
              <BookOpenIcon className="h-6 w-6" />
            </div>
          </div>
          <Link to="/courses" className="mt-4 inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 group">
            Lihat Detail <ArrowPathIcon className="ml-1 h-3 w-3 transform group-hover:rotate-45 transition-transform opacity-0 group-hover:opacity-100" />
          </Link>
        </Card>

        {/* Card 2: Pending Tasks */}
        <Card className="p-6 shadow-xl border-t-4 border-t-yellow-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tugas Pending</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.pendingAssignments || 0}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600 shadow-sm">
              <ClipboardDocumentListIcon className="h-6 w-6" />
            </div>
          </div>
          <Link to="/assignments" className="mt-4 inline-flex items-center text-xs font-bold text-yellow-600 hover:text-yellow-800">
            Kerjakan Sekarang
          </Link>
        </Card>

        {/* Card 3: Notifications */}
        <Card className="p-6 shadow-xl border-t-4 border-t-red-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notifikasi</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.unreadNotifications || 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-600 shadow-sm">
              <BellIcon className="h-6 w-6" />
            </div>
          </div>
          <Link to="/notifications" className="mt-4 inline-flex items-center text-xs font-bold text-red-600 hover:text-red-800">
            Cek Inbox
          </Link>
        </Card>

        {/* Card 4: Progress (Fitur Progress Bar TETAP ADA) */}
        <Card className="p-6 shadow-xl border-t-4 border-t-emerald-500 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Penyelesaian</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.completionRate || 0}%</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shadow-sm">
              <ChartBarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={stats?.completionRate || 0} className="h-2.5 bg-gray-100" />
            <p className="text-xs text-gray-400 mt-2 text-right">Target Semester</p>
          </div>
        </Card>
      </div>

      {/* 3. MAIN CONTENT (2 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Deadline (Lebih Lebar) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="h-8 w-1.5 bg-emerald-500 rounded-full"></div>
                Deadline Mendatang
             </h2>
             <Link to="/assignments" className="text-sm text-emerald-600 font-medium hover:underline">Lihat Semua</Link>
          </div>

          <div className="space-y-4">
            {stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
              stats.upcomingDeadlines.map((deadline) => (
                <Card key={deadline.id} className="group hover:border-emerald-300 transition-colors border border-transparent shadow-sm">
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    {/* Date Box */}
                    <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border ${
                            deadline.status === 'urgent' ? 'bg-red-50 border-red-100 text-red-600' :
                            deadline.status === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-600' :
                            'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                            <span className="text-xs font-bold uppercase">{new Date(deadline.dueDate).toLocaleString('id-ID', { month: 'short' })}</span>
                            <span className="text-lg font-bold">{new Date(deadline.dueDate).getDate()}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{deadline.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                               <BookOpenIcon className="w-3.5 h-3.5"/> {deadline.courseName}
                            </p>
                        </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                       <div className="text-right">
                          <p className="text-sm font-bold text-gray-700">
                             {new Date(deadline.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </p>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                            deadline.status === 'urgent' ? 'bg-red-100 text-red-700' :
                            deadline.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {deadline.status === 'urgent' ? 'Segera!' : deadline.status === 'warning' ? 'Mendekat' : 'Aman'}
                          </span>
                       </div>
                       <Link to={`/assignments/${deadline.id}`}>
                          <Button size="sm" variant="outline" className="rounded-xl border-gray-200 hover:border-emerald-500 hover:text-emerald-600">
                             Detail
                          </Button>
                       </Link>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                   <CheckCircleIcon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-900">Tugas Aman!</h3>
                <p className="text-gray-500 text-sm mt-1">Tidak ada deadline yang mendesak saat ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Recent Activities */}
        <div>
          <div className="flex items-center gap-2 mb-6">
             <div className="h-8 w-1.5 bg-yellow-400 rounded-full"></div>
             <h2 className="text-xl font-bold text-gray-800">Aktivitas Terbaru</h2>
          </div>
          
          <Card className="border-none shadow-lg bg-white overflow-hidden">
            <div className="p-0">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {stats.recentActivities.map((activity, idx) => (
                    <div key={activity.id || idx} className="p-5 hover:bg-gray-50 transition-colors flex gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                        activity.type === 'assignment' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'announcement' ? 'bg-yellow-100 text-yellow-600' :
                        activity.type === 'grade' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'assignment' && <ClipboardDocumentListIcon className="h-5 w-5" />}
                        {activity.type === 'announcement' && <BellIcon className="h-5 w-5" />}
                        {activity.type === 'grade' && <ChartBarIcon className="h-5 w-5" />}
                        {activity.type === 'forum' && <ChatBubbleLeftIcon className="h-5 w-5" />}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{activity.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{activity.description}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-md">
                           {formatDate(activity.timestamp, 'relative')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Belum ada aktivitas tercatat.</p>
                </div>
              )}
            </div>
            {/* Footer Kecil */}
            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
               <span className="text-xs text-gray-400">Menampilkan 5 aktivitas terakhir</span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;