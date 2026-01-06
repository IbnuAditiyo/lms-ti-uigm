import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid';
import { courseService, DashboardStats } from '../../services/courseService';
import { assignmentService } from '../../services/assignmentService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Card } from '../../components/ui/Card'; // Pastikan import Card
import { toast } from 'react-hot-toast';

const EnhancedLecturerDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [quickGradeData, setQuickGradeData] = useState<{[key: string]: {score: string, feedback: string}}>({});
  
  const queryClient = useQueryClient();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Logic Penentu Salam
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat Pagi');
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang');
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    return () => clearInterval(timer);
  }, []);

  const { data: dashboardData, isLoading, error, refetch } = useQuery<DashboardStats>(
    'lecturer-dashboard-stats',
    async () => {
      const response = await courseService.getDashboardStats();
      return response.data;
    },
    {
      refetchInterval: 30000, 
      retry: 3,
    }
  );

  // Quick grading mutation
  const gradeMutation = useMutation(
    async ({ submissionId, gradeData }: { submissionId: string, gradeData: any }) => {
      return await assignmentService.gradeSubmission(submissionId, gradeData);
    },
    {
      onSuccess: (data, variables) => {
        toast.success('✅ Submission berhasil dinilai!');
        queryClient.invalidateQueries('lecturer-dashboard-stats');
        setQuickGradeData(prev => {
          const newData = { ...prev };
          delete newData[variables.submissionId];
          return newData;
        });
      },
      onError: (error: any) => {
        toast.error('❌ Gagal menilai submission: ' + (error.message || 'Unknown error'));
      },
    }
  );

  const handleQuickGrade = (submissionId: string) => {
    const gradeData = quickGradeData[submissionId];
    if (!gradeData || !gradeData.score) {
      toast.error('Silakan masukkan nilai terlebih dahulu');
      return;
    }

    const score = parseFloat(gradeData.score);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Nilai harus berupa angka antara 0-100');
      return;
    }

    gradeMutation.mutate({
      submissionId,
      gradeData: {
        score: score,
        feedback: gradeData.feedback || 'Dinilai via dashboard'
      }
    });
  };

  const updateQuickGradeData = (submissionId: string, field: 'score' | 'feedback', value: string) => {
    setQuickGradeData(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari lalu`;
  };

  if (isLoading) return <div className="flex h-96 justify-center items-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message="Gagal memuat dashboard." />;

  const stats = [
    {
      id: 'courses',
      title: 'Mata Kuliah',
      value: dashboardData?.overview.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-500'
    },
    {
      id: 'students',
      title: 'Total Mahasiswa',
      value: dashboardData?.overview.totalStudents || 0,
      icon: UserGroupIcon,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-500'
    },
    {
      id: 'pending',
      title: 'Perlu Review',
      value: dashboardData?.overview.pendingGrading || 0,
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-orange-50 text-orange-600',
      border: 'border-orange-500'
    },
    {
      id: 'completion',
      title: 'Rata-rata Kelulusan',
      value: `${dashboardData?.overview.completionRate || 0}%`,
      icon: ChartBarIcon,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-500'
    },
  ];

  const pendingSubmissions = dashboardData?.pendingSubmissions || [];

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HERO SECTION (Emerald Gradient) */}
      <div className="relative bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-8 pt-10 shadow-2xl overflow-hidden text-white">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {greeting}, Bapak/Ibu Dosen! 👋
            </h1>
            <p className="text-emerald-100 text-lg">
              Semoga hari ini menyenangkan. Berikut ringkasan aktivitas akademik Anda.
            </p>
          </div>

          {/* Jam & Tanggal */}
          <div className="flex items-center px-4 py-2 text-white bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
             <CalendarDaysIcon className="h-5 w-5 mr-3 text-yellow-300" />
             <div className="text-right">
                <p className="text-xs text-emerald-200 font-medium uppercase tracking-wider">{formatDate(currentTime)}</p>
                <p className="text-lg font-bold font-mono leading-none">{currentTime.toLocaleTimeString('id-ID')}</p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. FLOATING STATS (Di atas Hero) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20 relative z-20 px-2">
        {stats.map((stat, index) => (
          <Card 
            key={stat.id}
            className={`p-6 shadow-xl border-t-4 ${stat.border} hover:-translate-y-1 transition-all duration-300 cursor-pointer ${activeCard === stat.id ? 'ring-2 ring-emerald-400' : ''}`}
            onClick={() => setActiveCard(activeCard === stat.id ? null : stat.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} shadow-sm`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. PRIORITY SECTION (Pending Review) */}
      {pendingSubmissions.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-3xl p-6 shadow-md relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                 <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <ExclamationTriangleIconSolid className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-gray-900">Perlu Penilaian Segera</h2>
                    <p className="text-sm text-gray-500">Ada <span className="font-bold text-orange-600">{pendingSubmissions.length} tugas</span> mahasiswa yang menunggu feedback Anda.</p>
                 </div>
              </div>
              <Link to="/assignments" className="text-sm font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1">
                 Lihat Semua <ArrowRightIcon className="w-4 h-4"/>
              </Link>
           </div>

           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {pendingSubmissions.slice(0, 2).map((submission) => (
                 <div key={submission.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h3 className="font-bold text-gray-800">{submission.studentName}</h3>
                          <p className="text-sm text-gray-500">{submission.assignmentTitle}</p>
                          <p className="text-xs text-emerald-600 mt-1 font-medium">{submission.courseName}</p>
                       </div>
                       <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${submission.isLate ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {submission.isLate ? 'Terlambat' : 'Tepat Waktu'}
                       </span>
                    </div>

                    {/* Quick Grade Form */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                       <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-1">
                             <label className="text-[10px] font-bold text-gray-500 uppercase">Nilai (0-100)</label>
                             <input 
                               type="number" min="0" max="100" placeholder="0"
                               className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                               value={quickGradeData[submission.id]?.score || ''}
                               onChange={(e) => updateQuickGradeData(submission.id, 'score', e.target.value)}
                             />
                          </div>
                          <div className="col-span-2">
                             <label className="text-[10px] font-bold text-gray-500 uppercase">Feedback</label>
                             <input 
                               type="text" placeholder="Bagus, tingkatkan..."
                               className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                               value={quickGradeData[submission.id]?.feedback || ''}
                               onChange={(e) => updateQuickGradeData(submission.id, 'feedback', e.target.value)}
                             />
                          </div>
                       </div>
                       <button 
                          onClick={() => handleQuickGrade(submission.id)}
                          disabled={gradeMutation.isLoading || !quickGradeData[submission.id]?.score}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded flex items-center justify-center gap-2 disabled:bg-gray-300"
                       >
                          {gradeMutation.isLoading ? 'Menyimpan...' : <><CheckCircleIconSolid className="w-3.5 h-3.5"/> Kirim Nilai</>}
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* 4. MAIN LAYOUT (Courses & Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Mata Kuliah Aktif */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                 Mata Kuliah Aktif
              </h2>
              <Link to="/courses" className="text-sm text-blue-600 font-medium hover:underline">Kelola Course</Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData?.courseStats.slice(0, 4).map((course) => (
                 <Card key={course.id} className="group hover:border-blue-300 transition-all border border-transparent shadow-sm p-5">
                    <div className="flex items-start justify-between">
                       <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                          <AcademicCapIcon className="w-6 h-6"/>
                       </div>
                       <Link to={`/courses/${course.id}`} className="text-gray-400 hover:text-blue-600">
                          <EyeIcon className="w-5 h-5" />
                       </Link>
                    </div>
                    <h3 className="font-bold text-gray-900 mt-4 line-clamp-1 group-hover:text-blue-700">{course.name}</h3>
                    <p className="text-xs text-gray-500 mb-4">{course.code} • {course.semester}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-50">
                       <span className="flex items-center gap-1"><UserGroupIcon className="w-3.5 h-3.5"/> {course.studentsCount} Mhs</span>
                       <span className="flex items-center gap-1"><DocumentTextIcon className="w-3.5 h-3.5"/> {course.assignmentsCount} Tugas</span>
                    </div>
                 </Card>
              ))}
              
              {(!dashboardData?.courseStats || dashboardData.courseStats.length === 0) && (
                 <div className="col-span-2 text-center py-10 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                    <AcademicCapIcon className="w-12 h-12 text-gray-300 mx-auto mb-2"/>
                    <p className="text-gray-500">Belum ada mata kuliah.</p>
                 </div>
              )}
           </div>

           {/* Quick Actions Bar */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
              <h3 className="font-bold text-gray-800 mb-4 text-sm">Aksi Cepat</h3>
              <div className="flex flex-wrap gap-3">
                 <Link to="/assignments/create">
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-bold border border-emerald-100">
                       <DocumentTextIcon className="w-4 h-4"/> Buat Tugas Baru
                    </button>
                 </Link>
                 <Link to="/courses">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-bold border border-blue-100">
                       <BookOpenIcon className="w-4 h-4"/> Tambah Materi
                    </button>
                 </Link>
                 <Link to="/assignments">
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-bold border border-orange-100">
                       <ClipboardDocumentCheckIcon className="w-4 h-4"/> Rekap Nilai
                    </button>
                 </Link>
              </div>
           </div>
        </div>

        {/* Kolom Kanan: Jadwal & Aktivitas */}
        <div className="space-y-6">
           {/* Jadwal */}
           <Card className="border-none shadow-lg">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                 <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-purple-500"/> Jadwal Hari Ini
                 </h2>
              </div>
              <div className="p-4 space-y-3">
                 {dashboardData?.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
                    dashboardData.todaySchedule.map((item) => (
                       <div key={item.id} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                          <div className="w-12 text-center">
                             <p className="text-xs font-bold text-gray-800">{item.time.split(':')[0]}:{item.time.split(':')[1]}</p>
                             <p className="text-[10px] text-gray-400">WIB</p>
                          </div>
                          <div className="border-l-2 border-purple-300 pl-3">
                             <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.title}</p>
                             <p className="text-xs text-gray-500 line-clamp-1">{item.courseName}</p>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-6 text-gray-400 text-sm italic">Tidak ada jadwal mengajar.</div>
                 )}
              </div>
           </Card>

           {/* Aktivitas Terbaru */}
           <Card className="border-none shadow-lg">
              <div className="p-5 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                 <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-emerald-500"/> Riwayat
                 </h2>
              </div>
              <div className="p-0">
                 {dashboardData?.recentActivity.submissions && dashboardData.recentActivity.submissions.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                       {dashboardData.recentActivity.submissions.slice(0, 4).map((sub) => (
                          <div key={sub.id} className="p-4 flex gap-3 items-center hover:bg-gray-50">
                             <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.status === 'graded' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                             <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{sub.studentName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{sub.assignmentTitle}</p>
                             </div>
                             <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatRelativeTime(sub.submittedAt)}</span>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-6 text-gray-400 text-sm">Belum ada aktivitas.</div>
                 )}
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default EnhancedLecturerDashboard;