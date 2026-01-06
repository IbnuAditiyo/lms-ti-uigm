import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Clock,
  FileText,
  Video,
  Link as LinkIcon,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  FileText as AssignmentIcon,
  Info,
  Settings,
  ChevronRight,
  MoreVertical,
  Share2,
  AlertCircle,
  Search,
  UserPlus,
  UserMinus,
  Mail,
  Filter,
  GraduationCap,
  Play,
  ExternalLink,
  BarChart3,
  CheckCircle,
  Layout,
  Star // <--- PERBAIKAN: Icon Star ditambahkan di sini
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { courseService, CourseStudent } from '../../services/courseService';
import { assignmentService } from '../../services/assignmentService';
import { forumService } from '../../services/forumService';
import { attendanceService } from '../../services/attendanceService';
import { Course, CourseMaterial, MaterialType, Assignment, ForumPost, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/date';

type TabType = 'overview' | 'materials' | 'assignments' | 'forums' | 'students' | 'attendance' | 'settings';

interface MaterialFormData {
  title: string;
  description: string;
  type: MaterialType;
  week: number;
  orderIndex: number;
  file?: File;
  url?: string;
  isAttendanceTrigger: boolean;
  attendanceThreshold: number;
}

interface StudentFormData {
  email: string;
  selectedStudentIds: string[];
}

interface StudentsQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'fullName' | 'studentId' | 'enrolledAt';
  sortOrder?: 'ASC' | 'DESC';
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [forums, setForums] = useState<ForumPost[]>([]);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<CourseStudent[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  
  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('materials');
  
  // Modals
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [deleteMaterialModalOpen, setDeleteMaterialModalOpen] = useState(false);
  const [removeStudentModalOpen, setRemoveStudentModalOpen] = useState(false);
  
  // Selected Items
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  
  // Forms & Query
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [studentsQuery, setStudentsQuery] = useState<StudentsQueryParams>({
    page: 1, limit: 20, sortBy: 'fullName', sortOrder: 'ASC'
  });
  const [studentsMeta, setStudentsMeta] = useState<any>({});
  
  const [materialForm, setMaterialForm] = useState<MaterialFormData>({
    title: '', description: '', type: MaterialType.PDF, week: 1, orderIndex: 1,
    isAttendanceTrigger: false, attendanceThreshold: 80,
  });

  const [studentForm, setStudentForm] = useState<StudentFormData>({
    email: '', selectedStudentIds: [],
  });

  // Roles
  const isAdmin = user?.role === UserRole.ADMIN;
  const isLecturer = user?.role === UserRole.LECTURER;
  const isStudent = user?.role === UserRole.STUDENT;
  const isCourseLecturer = course?.lecturer.id === user?.id;
  const canManageCourse = isAdmin || isCourseLecturer;

  // Effects
  useEffect(() => { if (id) fetchCourseData(); }, [id]);
  useEffect(() => { if (course) fetchTabData(); }, [course, activeTab, studentsQuery]);
  useEffect(() => { if (course && activeTab === 'attendance' && canManageCourse) fetchAttendanceData(); }, [selectedWeek]);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu && !(event.target as Element).closest('.action-menu')) setShowActionMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionMenu]);

  // Data Fetching Functions
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourse(id!);
      setCourse(data);
    } catch (error) {
      toast.error('Gagal memuat data mata kuliah');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    if (!course) return;
    try {
      switch (activeTab) {
        case 'materials':
          const materialsData = await courseService.getCourseMaterials(course.id);
          setMaterials(materialsData);
          break;
        case 'assignments':
          const assignmentsData = await assignmentService.getAssignments({ courseId: course.id });
          setAssignments(assignmentsData.data);
          break;
        case 'forums':
          try {
            const forumsResponse = await forumService.getForumPosts(course.id);
            const forumsData = forumsResponse.data || forumsResponse;
            setForums(Array.isArray(forumsData) ? forumsData : []);
          } catch { setForums([]); }
          break;
        case 'students': await fetchStudents(); break;
        case 'attendance': if (canManageCourse) await fetchAttendanceData(); break;
      }
    } catch (error) {
      if (activeTab !== 'forums') toast.error(`Gagal memuat data ${activeTab}`);
    }
  };

  const fetchStudents = async () => {
    if (!course) return;
    try {
      setStudentsLoading(true);
      const response = await courseService.getCourseStudents(course.id, studentsQuery);
      setStudents(response.data);
      setStudentsMeta(response.meta);
    } catch { toast.error('Gagal memuat data mahasiswa'); } 
    finally { setStudentsLoading(false); }
  };

  const fetchAvailableStudents = async () => {
    if (!course || !canManageCourse) return;
    try {
      const data = await courseService.getAvailableStudents(course.id);
      setAvailableStudents(data);
    } catch { toast.error('Gagal memuat data mahasiswa tersedia'); }
  };

  const fetchAttendanceData = async () => {
    if (!course || !canManageCourse) return;
    try {
      setAttendanceLoading(true);
      const data = await attendanceService.getCourseAttendanceByWeek(course.id, selectedWeek || undefined);
      setAttendanceData(data);
    } catch { toast.error('Gagal memuat data absensi'); } 
    finally { setAttendanceLoading(false); }
  };

  // Handlers
  const validateMaterialForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    if (!materialForm.title?.trim()) errors.title = 'Judul materi wajib diisi';
    if (!materialForm.type) errors.type = 'Tipe materi wajib dipilih';
    if (!materialForm.week || materialForm.week < 1 || materialForm.week > 16) errors.week = 'Minggu 1-16';
    if (materialForm.type === MaterialType.LINK && !materialForm.url?.trim()) errors.url = 'URL wajib diisi';
    if (materialForm.type !== MaterialType.LINK && !materialForm.file && !editingMaterial) errors.file = 'File wajib diupload';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !validateMaterialForm()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();
      Object.entries(materialForm).forEach(([key, value]) => {
        if (value !== undefined && key !== 'file') formData.append(key, value.toString());
      });
      if (materialForm.file) formData.append('file', materialForm.file);
      formData.append('isVisible', 'true');

      if (editingMaterial) {
        await courseService.updateCourseMaterial(course.id, editingMaterial.id, formData);
        toast.success('Materi diperbarui');
      } else {
        await courseService.createCourseMaterial(course.id, formData);
        toast.success('Materi ditambahkan');
      }
      setMaterialModalOpen(false); resetMaterialForm(); fetchTabData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gagal menyimpan materi');
    } finally { setSubmitting(false); }
  };

  const handleDeleteMaterial = async () => {
    if (!course || !selectedMaterial) return;
    try {
      await courseService.deleteCourseMaterial(course.id, selectedMaterial.id);
      toast.success('Materi dihapus');
      setDeleteMaterialModalOpen(false); setSelectedMaterial(null); fetchTabData();
    } catch { toast.error('Gagal menghapus materi'); }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      toast.success('Berhasil mendaftar mata kuliah');
      fetchCourseData();
    } catch (error) {
      toast.error('Gagal mendaftar mata kuliah');
    }
  };

  // Helper Functions
  const resetMaterialForm = () => {
    setMaterialForm({
      title: '', description: '', type: MaterialType.PDF, week: 1, orderIndex: 1,
      isAttendanceTrigger: false, attendanceThreshold: 80,
    });
    setEditingMaterial(null); setFormErrors({});
  };
  
  const getFileDownloadUrl = (material: CourseMaterial) => {
    if (material.type === MaterialType.LINK) return material.url || '#';
    if (material.filePath) {
      const baseUrl = (process.env.REACT_APP_API_URL || 'http://203.194.113.5:3000/api').replace('/api', '');
      let cleanPath = material.filePath.replace('course-materials/', '').replace(/^uploads[\\/]/, '').replace(/\\/g, '/');
      if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
      return `${baseUrl}/uploads/${cleanPath}`;
    }
    return '#';
  };

  // Styling Helpers
  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case MaterialType.PDF: return <FileText className="w-5 h-5 text-red-500" />;
      case MaterialType.VIDEO: return <Video className="w-5 h-5 text-blue-500" />;
      case MaterialType.LINK: return <LinkIcon className="w-5 h-5 text-purple-500" />;
      default: return <BookOpen className="w-5 h-5 text-emerald-500" />;
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'materials', label: 'Materi Belajar', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'assignments', label: 'Tugas', icon: <AssignmentIcon className="w-4 h-4" /> },
    { id: 'forums', label: 'Diskusi', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'students', label: 'Peserta', icon: <Users className="w-4 h-4" /> },
    { id: 'overview', label: 'Info', icon: <Info className="w-4 h-4" /> },
  ];
  if (canManageCourse) {
    tabs.splice(4, 0, { id: 'attendance', label: 'Absensi', icon: <GraduationCap className="w-4 h-4" /> });
    tabs.push({ id: 'settings', label: 'Setting', icon: <Settings className="w-4 h-4" /> });
  }

  if (loading || !course) return <div className="flex h-screen items-center justify-center"><Loader size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* 1. IMMERSIVE HERO HEADER */}
      <div className="relative bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 text-white overflow-hidden rounded-b-3xl shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 p-12 opacity-20">
           <BookOpen className="w-64 h-64 text-emerald-200" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 pt-8 pb-12">
           <Button variant="ghost" size="sm" onClick={() => navigate('/courses')} className="text-emerald-100 hover:text-white hover:bg-white/10 mb-6 pl-0">
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar
           </Button>

           <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-4 max-w-3xl">
                 <div className="flex gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 backdrop-blur-sm px-3 py-1">
                       {course.code}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-100 border border-blue-400/30 backdrop-blur-sm px-3 py-1">
                       {course.credits} SKS
                    </Badge>
                 </div>
                 <h1 className="text-4xl font-bold tracking-tight leading-tight">{course.name}</h1>
                 <div className="flex items-center gap-6 text-emerald-100 text-sm">
                    <div className="flex items-center gap-2">
                       <GraduationCap className="w-4 h-4" />
                       <span>{course.lecturer.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4" />
                       <span>Sem. {course.semester}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Users className="w-4 h-4" />
                       <span>{students.length} Mahasiswa</span>
                    </div>
                 </div>
              </div>

              {canManageCourse && (
                 <div className="flex gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate(`/courses/${course.id}/edit`)}>
                       <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                       <Share2 className="w-4 h-4" />
                    </Button>
                 </div>
              )}
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8 relative z-20">
         {/* 2. MODERN TABS */}
         <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex overflow-x-auto gap-2 mb-8 no-scrollbar">
            {tabs.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                     flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                     ${activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                     }
                  `}
               >
                  {tab.icon}
                  {tab.label}
                  {['students', 'forums'].includes(tab.id) && (
                     <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                        {tab.id === 'students' ? students.length : forums.length}
                     </span>
                  )}
               </button>
            ))}
         </div>

         {/* 3. TAB CONTENT AREA */}
         <div className="min-h-[500px]">
            {/* --- MATERIALS TAB --- */}
            {activeTab === 'materials' && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Sidebar Timeline (Left) */}
                  <div className="lg:col-span-8 space-y-8">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                           <BookOpen className="w-6 h-6 text-emerald-600"/> Materi Pembelajaran
                        </h2>
                        {canManageCourse && (
                           <Button onClick={() => setMaterialModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-emerald-200 shadow-lg">
                              <Plus className="w-4 h-4 mr-2"/> Upload Materi
                           </Button>
                        )}
                     </div>

                     {materials.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                           <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Layout className="w-8 h-8 text-gray-400"/>
                           </div>
                           <p className="text-gray-500 font-medium">Belum ada materi yang diunggah.</p>
                        </div>
                     ) : (
                        <div className="space-y-8">
                           {Array.from(new Set(materials.map(m => m.week))).sort((a,b) => a-b).map(week => {
                              const weekMaterials = materials.filter(m => m.week === week).sort((a,b) => (a.orderIndex || 0) - (b.orderIndex || 0));
                              return (
                                 <div key={week} className="relative pl-8 border-l-2 border-emerald-100 space-y-4">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white"></div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Minggu ke-{week}</h3>
                                    
                                    <div className="grid gap-4">
                                       {weekMaterials.map(material => (
                                          <div key={material.id} className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-start gap-4">
                                             <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-emerald-50 transition-colors">
                                                {getMaterialIcon(material.type)}
                                             </div>
                                             
                                             <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                   <h4 className="font-bold text-gray-800 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                                                      {material.title}
                                                   </h4>
                                                   {/* Actions Menu */}
                                                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      {material.type === MaterialType.VIDEO ? (
                                                         <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg" onClick={() => navigate(`/courses/${course.id}/materials/${material.id}/video`)}>
                                                            <Play className="w-3 h-3 mr-1"/> Tonton
                                                         </Button>
                                                      ) : (
                                                         <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => window.open(getFileDownloadUrl(material), '_blank')}>
                                                            <Download className="w-3 h-3 mr-1"/> Unduh
                                                         </Button>
                                                      )}
                                                      
                                                      {canManageCourse && (
                                                         <div className="relative action-menu">
                                                            <button 
                                                               onClick={() => setShowActionMenu(showActionMenu === material.id ? null : material.id)}
                                                               className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                                                            >
                                                               <MoreVertical className="w-4 h-4"/>
                                                            </button>
                                                            {showActionMenu === material.id && (
                                                               <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                                                                  <button onClick={() => { setEditingMaterial(material); setMaterialForm({...materialForm, ...material, type: material.type}); setMaterialModalOpen(true); setShowActionMenu(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Edit className="w-3 h-3"/> Edit</button>
                                                                  <button onClick={() => { setSelectedMaterial(material); setDeleteMaterialModalOpen(true); setShowActionMenu(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-3 h-3"/> Hapus</button>
                                                               </div>
                                                            )}
                                                         </div>
                                                      )}
                                                   </div>
                                                </div>
                                                
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{material.description || 'Tidak ada deskripsi.'}</p>
                                                
                                                <div className="flex gap-3 mt-3">
                                                   <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50 border-transparent px-2 py-0.5">
                                                      {material.type}
                                                   </Badge>
                                                   {material.isAttendanceTrigger && (
                                                      <Badge className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 flex items-center gap-1">
                                                         <CheckCircle className="w-3 h-3"/> Wajib Tonton ({material.attendanceThreshold}%)
                                                      </Badge>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </div>

                  {/* Right Sidebar (Info Widget) */}
                  <div className="lg:col-span-4 space-y-6">
                     <Card className="bg-emerald-50 border-emerald-100">
                        <CardContent className="p-6">
                           <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                              <Info className="w-5 h-5"/> Ringkasan Kelas
                           </h3>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                 <span className="text-sm text-gray-600">Total Materi</span>
                                 <span className="font-bold text-emerald-600 text-lg">{materials.length}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                 <span className="text-sm text-gray-600">Video</span>
                                 <span className="font-bold text-blue-600 text-lg">{materials.filter(m=>m.type===MaterialType.VIDEO).length}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                 <span className="text-sm text-gray-600">Dokumen</span>
                                 <span className="font-bold text-orange-600 text-lg">{materials.filter(m=>m.type===MaterialType.PDF || m.type===MaterialType.DOCUMENT).length}</span>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               </div>
            )}

            {/* --- ASSIGNMENTS TAB --- */}
            {activeTab === 'assignments' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h2 className="text-xl font-bold text-gray-800">Daftar Tugas</h2>
                     {canManageCourse && (
                        <Button onClick={() => navigate(`/courses/${course.id}/assignments/create`)} className="bg-emerald-600 text-white rounded-lg">
                           <Plus className="w-4 h-4 mr-2"/> Buat Tugas
                        </Button>
                     )}
                  </div>
                  
                  {assignments.length === 0 ? <div className="text-center py-10 text-gray-500">Belum ada tugas.</div> : 
                     assignments.map(a => (
                        <Card key={a.id} className="hover:border-emerald-300 transition-all cursor-pointer" onClick={()=>navigate(`/assignments/${a.id}`)}>
                           <CardContent className="p-5 flex justify-between items-center">
                              <div>
                                 <h4 className="font-bold text-gray-800 text-lg">{a.title}</h4>
                                 <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {formatDate(a.dueDate)}</span>
                                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500"/> {a.maxScore} Poin</span>
                                 </div>
                              </div>
                              <ChevronRight className="text-gray-300"/>
                           </CardContent>
                        </Card>
                     ))
                  }
               </div>
            )}

            {/* --- STUDENTS TAB --- */}
            {activeTab === 'students' && (
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <h2 className="text-xl font-bold text-gray-800">Mahasiswa Terdaftar ({students.length})</h2>
                     {canManageCourse && (
                        <Button onClick={() => { setStudentModalOpen(true); fetchAvailableStudents(); }} className="bg-emerald-600 text-white rounded-lg">
                           <UserPlus className="w-4 h-4 mr-2"/> Tambah Mahasiswa
                        </Button>
                     )}
                  </div>
                  {/* Grid Students */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {students.map(s => (
                        <div key={s.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                           <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                              {s.fullName.charAt(0)}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 truncate">{s.fullName}</p>
                              <p className="text-xs text-gray-500">{s.studentId}</p>
                           </div>
                           {canManageCourse && (
                              <button onClick={() => { setSelectedStudent(s); setRemoveStudentModalOpen(true); }} className="text-red-400 hover:text-red-600">
                                 <UserMinus className="w-4 h-4"/>
                              </button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Material Modal */}
      {materialModalOpen && (
         <Modal onClose={() => { setMaterialModalOpen(false); resetMaterialForm(); }} title={editingMaterial ? 'Edit Materi' : 'Tambah Materi Baru'} size="lg">
            <form onSubmit={handleMaterialSubmit} className="space-y-5">
               <Input label="Judul Materi" value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} required />
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
                  <textarea className="w-full border border-gray-300 rounded-lg p-2" rows={3} value={materialForm.description} onChange={e => setMaterialForm({...materialForm, description: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Select label="Tipe" value={materialForm.type} onChange={e => setMaterialForm({...materialForm, type: e.target.value as any})}>
                     <option value={MaterialType.PDF}>📄 PDF Document</option>
                     <option value={MaterialType.VIDEO}>🎥 Video Pembelajaran</option>
                     <option value={MaterialType.LINK}>🔗 External Link</option>
                  </Select>
                  <Input label="Minggu Ke-" type="number" value={materialForm.week} onChange={e => setMaterialForm({...materialForm, week: parseInt(e.target.value)})} />
               </div>
               
               {/* Conditional Inputs based on Type */}
               {materialForm.type === MaterialType.VIDEO && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={materialForm.isAttendanceTrigger} onChange={e => setMaterialForm({...materialForm, isAttendanceTrigger: e.target.checked})} className="w-4 h-4 text-blue-600 rounded"/>
                        <span className="font-bold text-blue-800 text-sm">Gunakan sebagai Absensi Otomatis?</span>
                     </label>
                     {materialForm.isAttendanceTrigger && (
                        <div className="mt-3">
                           <Input label="Syarat Menonton (%)" type="number" value={materialForm.attendanceThreshold} onChange={e => setMaterialForm({...materialForm, attendanceThreshold: parseInt(e.target.value)})} />
                           <p className="text-xs text-gray-500 mt-1">Mahasiswa dianggap hadir jika menonton sekian persen durasi video.</p>
                        </div>
                     )}
                  </div>
               )}

               {materialForm.type === MaterialType.LINK ? (
                  <Input label="URL Link" value={materialForm.url} onChange={e => setMaterialForm({...materialForm, url: e.target.value})} placeholder="https://..." required />
               ) : (
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Upload File</label>
                     <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" onChange={e => e.target.files && setMaterialForm({...materialForm, file: e.target.files[0]})} />
                  </div>
               )}

               <div className="flex justify-end gap-2 pt-4">
                  <Button variant="ghost" onClick={() => setMaterialModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={submitting} className="bg-emerald-600 text-white">{submitting ? 'Menyimpan...' : 'Simpan Materi'}</Button>
               </div>
            </form>
         </Modal>
      )}

      {/* Delete Modal */}
      {deleteMaterialModalOpen && (
         <Modal onClose={() => setDeleteMaterialModalOpen(false)} title="Hapus Materi?">
            <div className="text-center p-4">
               <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3"/>
               <p className="mb-6">Yakin ingin menghapus materi <strong>{selectedMaterial?.title}</strong>? Tindakan ini permanen.</p>
               <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setDeleteMaterialModalOpen(false)}>Batal</Button>
                  <Button className="bg-red-600 text-white" onClick={handleDeleteMaterial}>Hapus</Button>
               </div>
            </div>
         </Modal>
      )}

      {/* Student Modals */}
      {studentModalOpen && (
         <Modal onClose={() => setStudentModalOpen(false)} title="Tambah Mahasiswa">
             <div className="p-4 text-center text-gray-500">
                <p>Fitur tambah mahasiswa akan diimplementasikan di sini.</p>
                <div className="mt-4 flex justify-end">
                   <Button onClick={() => setStudentModalOpen(false)}>Tutup</Button>
                </div>
             </div>
         </Modal>
      )}

    </div>
  );
};

export default CourseDetailPage;