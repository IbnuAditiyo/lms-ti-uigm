import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftIcon,
  BellIcon,
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TrophyIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { StatisticsChart, chartConfigs } from '../../components/charts/StatisticsChart';
import { courseService, assignmentService, notificationService, forumService } from '../../services';
import { formatDate, getDeadlineStatus } from '../../utils/date';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface DashboardStats {
  enrolledCourses: number;
  pendingAssignments: number;
  unreadNotifications: number;
  activeDiscussions: number;
  completionRate: number;
  averageGrade: number;
  totalStudyHours: number;
  streakDays: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    courseName: string;
    dueDate: string;
    status: 'urgent' | 'warning' | 'normal';
  }>;
  recentActivities: Array<{
    id: string;
    type: 'assignment' | 'announcement' | 'grade' | 'forum';
    title: string;
    description: string;
    timestamp: string;
  }>;
  learningProgress: number[];
  gradeDistribution: number[];
  weeklyActivity: number[];
  courseProgress: Array<{
    courseName: string;
    progress: number;
    grade: string;
  }>;
}

const EnhancedStudentDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>(
    'enhanced-student-dashboard-stats',
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
      const pendingAssignments = assignments.filter(a => !a.mySubmission || a.mySubmission.status !== 'submitted').length;
      const completedAssignments = assignments.filter(a => a.mySubmission && a.mySubmission.status === 'submitted').length;
      const completionRate = assignments.length > 0 
        ? Math.round((completedAssignments / assignments.length) * 100)
        : 0;

      // Calculate average grade (mock data for now)
      const averageGrade = 3.85; // Mock IPK

      // Mock data for demonstration
      const totalStudyHours = 124;
      const streakDays = 12;
      const learningProgress = [65, 70, 72, 78, 82, 85];
      const gradeDistribution = [12, 18, 8, 3, 1];
      const weeklyActivity = [8, 12, 10, 15, 9, 6, 4];

      // Get upcoming deadlines
      const upcomingDeadlines = assignments
        .filter(a => (!a.mySubmission || a.mySubmission.status !== 'submitted') && new Date(a.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5)
        .map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          courseName: assignment.course.name,
          dueDate: assignment.dueDate,
          status: getDeadlineStatus(assignment.dueDate)
        }));

      // Get recent activities
      const recentActivities = [
        ...assignments.slice(0, 3).map(a => ({
          id: a.id,
          type: 'assignment' as const,
          title: `Tugas baru: ${a.title}`,
          description: a.course.name,
          timestamp: a.createdAt
        })),
        ...notifications.slice(0, 3).map(n => ({
          id: n.id,
          type: n.type as 'announcement' | 'grade',
          title: n.title,
          description: n.message,
          timestamp: n.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      // Course progress data
      const courseProgress = courses.map(course => ({
        courseName: course.name,
        progress: Math.floor(Math.random() * 40) + 60, // Mock data 60-100
        grade: ['A', 'A-', 'B+', 'B'][Math.floor(Math.random() * 4)]
      }));

      return {
        enrolledCourses: courses.length,
        pendingAssignments,
        unreadNotifications: notifications.filter(n => !n.isRead).length,
        activeDiscussions: forums.filter(f => !f.isLocked).length,
        completionRate,
        averageGrade,
        totalStudyHours,
        streakDays,
        upcomingDeadlines,
        recentActivities,
        learningProgress,
        gradeDistribution,
        weeklyActivity,
        courseProgress
      };
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const chartData = useMemo(() => {
    if (!stats) return null;
    
    return {
      learningProgress: chartConfigs.learningProgress(stats.learningProgress),
      gradeDistribution: chartConfigs.gradeDistribution(stats.gradeDistribution),
      assignmentStatus: chartConfigs.assignmentStatus(
        stats.completionRate,
        stats.pendingAssignments,
        Math.floor(stats.pendingAssignments * 0.2)
      ),
      weeklyActivity: chartConfigs.weeklyActivity(stats.weeklyActivity)
    };
  }, [stats]);

  if (isLoading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;
  if (error || !chartData) return <ErrorMessage message="Gagal memuat dashboard. Silakan coba lagi." />;

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HERO BANNER (Updated to Emerald Gradient) */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 rounded-3xl shadow-xl p-8 text-white overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-emerald-50 text-xs font-medium mb-3">
               <FireIcon className="w-4 h-4 text-yellow-300" />
               <span>On Fire!</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Dashboard Akademik</h1>
            <p className="text-emerald-100 text-lg max-w-xl">
              Selamat datang kembali! Kamu sudah mempertahankan streak belajar selama <span className="font-bold text-white border-b border-yellow-400">{stats?.streakDays} hari</span>. Pertahankan!
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
               <TrophyIcon className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
               <p className="text-2xl font-bold">{stats?.averageGrade}</p>
               <p className="text-xs text-emerald-200 uppercase tracking-wide">IPK</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
               <ClockIcon className="h-8 w-8 text-blue-300 mx-auto mb-2" />
               <p className="text-2xl font-bold">{stats?.totalStudyHours}h</p>
               <p className="text-xs text-emerald-200 uppercase tracking-wide">Fokus</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID (Updated Colors & Border) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Courses */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-emerald-500 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mata Kuliah</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.enrolledCourses || 0}</p>
              <div className="flex items-center mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> +2 SKS
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
              <BookOpenIcon className="h-8 w-8" />
            </div>
          </div>
        </Card>

        {/* Card 2: Pending Tasks */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-yellow-500 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tugas Pending</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.pendingAssignments || 0}</p>
              <div className="flex items-center mt-2 text-xs font-medium text-yellow-600 bg-yellow-50 w-fit px-2 py-0.5 rounded-full">
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1" /> -1 dari kemarin
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600 group-hover:scale-110 transition-transform">
              <ClipboardDocumentListIcon className="h-8 w-8" />
            </div>
          </div>
        </Card>

        {/* Card 3: Notifications */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-red-500 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pesan Baru</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.unreadNotifications || 0}</p>
              <div className="flex items-center mt-2 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded-full">
                 Perlu Cek
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
              <BellIcon className="h-8 w-8" />
            </div>
          </div>
        </Card>

        {/* Card 4: Progress */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 border-t-4 border-blue-500 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Semester</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.completionRate || 0}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
              <ChartBarIcon className="h-8 w-8" />
            </div>
          </div>
          <ProgressBar value={stats?.completionRate || 0} className="h-1.5" />
        </Card>
      </div>

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatisticsChart
          type="line"
          title="Analisis Pembelajaran"
          data={chartData.learningProgress}
          height={300}
        />
        <StatisticsChart
          type="bar"
          title="Distribusi Nilai"
          data={chartData.gradeDistribution}
          height={300}
        />
      </div>

      {/* 4. DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Progress */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Progress Matkul</h2>
              <span className="text-xs text-gray-400">Semester Ini</span>
            </div>
            <div className="p-6 space-y-5">
              {stats?.courseProgress.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{course.courseName}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        course.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>{course.grade}</span>
                  </div>
                  <div className="relative">
                    <ProgressBar value={course.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weekly Activity Chart */}
        <div className="lg:col-span-1">
          <StatisticsChart
            type="bar"
            title="Aktivitas Mingguan"
            data={chartData.weeklyActivity}
            height={350}
          />
        </div>

        {/* Assignment Status Doughnut */}
        <div className="lg:col-span-1">
          <StatisticsChart
            type="doughnut"
            title="Status Tugas"
            data={chartData.assignmentStatus}
            height={350}
          />
        </div>
      </div>

      {/* 5. DEADLINES & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Deadlines */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-md">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
               <div className="h-6 w-1 bg-red-500 rounded-full"></div>
               <h2 className="font-bold text-gray-800">Deadline Mendatang</h2>
            </div>
            <div className="p-6 space-y-3">
              {stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
                stats.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${
                            deadline.status === 'urgent' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}>
                            <span className="text-[10px] font-bold uppercase">{new Date(deadline.dueDate).toLocaleString('id-ID', { month: 'short' })}</span>
                            <span className="text-lg font-bold leading-none">{new Date(deadline.dueDate).getDate()}</span>
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{deadline.title}</h3>
                           <p className="text-xs text-gray-500">{deadline.courseName}</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-400 mb-1">{new Date(deadline.dueDate).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB</p>
                       <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                          deadline.status === 'urgent' ? 'bg-red-100 text-red-600' : 
                          deadline.status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                       }`}>
                          {deadline.status}
                       </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">Tidak ada deadline dekat.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full border-none shadow-md bg-gradient-to-b from-white to-gray-50">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
               <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
               <h2 className="font-bold text-gray-800">Aksi Cepat</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link to="/assignments" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-2"><ClipboardDocumentListIcon className="h-6 w-6" /></div>
                <span className="text-xs font-bold text-gray-600">Tugas</span>
              </Link>
              <Link to="/courses" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-2"><BookOpenIcon className="h-6 w-6" /></div>
                <span className="text-xs font-bold text-gray-600">Materi</span>
              </Link>
              <Link to="/forums" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-2"><ChatBubbleLeftIcon className="h-6 w-6" /></div>
                <span className="text-xs font-bold text-gray-600">Diskusi</span>
              </Link>
              <Link to="/announcements" className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full mb-2"><BellIcon className="h-6 w-6" /></div>
                <span className="text-xs font-bold text-gray-600">Info</span>
              </Link>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;