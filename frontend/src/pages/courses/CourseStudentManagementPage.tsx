import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  UserPlus,
  UserMinus,
  Mail,
  Download,
  MoreVertical,
  Eye,
  AlertCircle,
  CheckCircle,
  GraduationCap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { courseService, CourseStudent } from '../../services/courseService';
import { Course, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/date';

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

interface EnrollmentStats {
  totalStudents: number;
  recentEnrollments: number;
  activeStudents: number;
}

const CourseStudentManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<CourseStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [removeStudentModalOpen, setRemoveStudentModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [stats, setStats] = useState<EnrollmentStats>({
    totalStudents: 0,
    recentEnrollments: 0,
    activeStudents: 0
  });
  
  const [studentsQuery, setStudentsQuery] = useState<StudentsQueryParams>({
    page: 1,
    limit: 24,
    sortBy: 'fullName',
    sortOrder: 'ASC'
  });
  const [studentsMeta, setStudentsMeta] = useState<any>({});
  
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    email: '',
    selectedStudentIds: [],
  });

  const isAdmin = user?.role === UserRole.ADMIN;
  const isLecturer = user?.role === UserRole.LECTURER;
  const isCourseLecturer = course?.lecturer.id === user?.id;
  const canManageStudents = isAdmin || isCourseLecturer;

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  useEffect(() => {
    if (course) {
      fetchStudents();
    }
  }, [course, studentsQuery]);

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

  const fetchStudents = async () => {
    if (!course) return;

    try {
      setStudentsLoading(true);
      const response = await courseService.getCourseStudents(course.id, studentsQuery);
      setStudents(response.data);
      setStudentsMeta(response.meta);
      
      // Update stats
      setStats({
        totalStudents: response.meta?.total || response.data.length,
        recentEnrollments: response.data.filter(s => 
          new Date(s.enrolledAt || new Date()).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
        activeStudents: response.data.filter(s => s.isActive).length
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal memuat data mahasiswa');
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    if (!course || !canManageStudents) return;

    try {
      const data = await courseService.getAvailableStudents(course.id);
      setAvailableStudents(data);
    } catch (error) {
      console.error('Error fetching available students:', error);
      toast.error('Gagal memuat data mahasiswa tersedia');
    }
  };

  const handleStudentSearch = (searchTerm: string) => {
    setStudentsQuery(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  const handleEnrollStudentByEmail = async () => {
    if (!course || !studentForm.email.trim()) {
      toast.error('Email mahasiswa wajib diisi');
      return;
    }

    try {
      setSubmitting(true);
      await courseService.addStudentByEmail(course.id, { email: studentForm.email });
      toast.success('Mahasiswa berhasil ditambahkan');
      setStudentForm(prev => ({ ...prev, email: '' }));
      fetchStudents();
      fetchAvailableStudents();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Gagal menambahkan mahasiswa';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnrollMultipleStudents = async () => {
    if (!course || studentForm.selectedStudentIds.length === 0) {
      toast.error('Pilih minimal satu mahasiswa');
      return;
    }

    try {
      setSubmitting(true);
      const result = await courseService.enrollMultipleStudents(course.id, {
        studentIds: studentForm.selectedStudentIds
      });
      
      toast.success(result.message);
      
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
      }

      setStudentModalOpen(false);
      setStudentForm({ email: '', selectedStudentIds: [] });
      fetchStudents();
      fetchAvailableStudents();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Gagal menambahkan mahasiswa';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!course || !selectedStudent) return;

    try {
      await courseService.removeStudentFromCourse(course.id, selectedStudent.id);
      toast.success('Mahasiswa berhasil dihapus dari mata kuliah');
      setRemoveStudentModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
      fetchAvailableStudents();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Gagal menghapus mahasiswa';
      toast.error(errorMessage);
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      email: '',
      selectedStudentIds: [],
    });
  };

  const handleExportStudents = () => {
    const csvHeader = 'Nama,NIM,Email,Status,Tanggal Daftar\n';
    const csvContent = students.map(student => 
      `"${student.fullName}","${student.studentId}","${student.email}","${student.isActive ? 'Aktif' : 'Tidak Aktif'}","${formatDate(student.enrolledAt || new Date())}"`
    ).join('\n');
    
    const csvData = csvHeader + csvContent;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `mahasiswa_${course?.code}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Data mahasiswa berhasil diexport');
    setExportModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="large" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HEADER PAGE (Emerald Gradient) */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <GraduationCap className="w-40 h-40 text-white" />
        </div>
        
        <div className="relative z-10">
           <div className="flex items-center mb-6">
             <Button
               variant="ghost"
               size="sm"
               onClick={() => navigate(`/courses/${course.id}`)}
               className="mr-4 text-emerald-100 hover:text-white hover:bg-white/10 pl-0"
             >
               <ArrowLeft className="w-4 h-4 mr-2" />
               Kembali ke Mata Kuliah
             </Button>
             <Badge className="bg-emerald-500/30 text-emerald-50 border-emerald-400/30 backdrop-blur-sm">
               {course.code}
             </Badge>
           </div>
           <h1 className="text-3xl font-bold mb-2 tracking-tight">Kelola Mahasiswa</h1>
           <p className="text-emerald-100/90 text-lg">{course.name}</p>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-emerald-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Mahasiswa</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalStudents}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                 <Users className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-blue-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mahasiswa Aktif</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeStudents}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                 <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-purple-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Baru Terdaftar</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.recentEnrollments}</p>
                <p className="text-xs text-gray-400 mt-1">Minggu ini</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                 <UserPlus className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. ACTIONS & FILTERS */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full">
              <div className="relative flex-1 sm:max-w-md w-full">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari nama atau NIM..."
                  className="pl-10 w-full"
                  value={studentsQuery.search || ''}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <Select
                   value={studentsQuery.sortBy}
                   onChange={(e) => setStudentsQuery(prev => ({ 
                     ...prev, 
                     sortBy: e.target.value as any,
                     page: 1 
                   }))}
                   className="w-full sm:w-40"
                 >
                   <option value="fullName">Nama</option>
                   <option value="studentId">NIM</option>
                   <option value="enrolledAt">Tgl Daftar</option>
                 </Select>
                 <Select
                   value={studentsQuery.sortOrder}
                   onChange={(e) => setStudentsQuery(prev => ({ 
                     ...prev, 
                     sortOrder: e.target.value as any,
                     page: 1 
                   }))}
                   className="w-full sm:w-32"
                 >
                   <option value="ASC">A-Z</option>
                   <option value="DESC">Z-A</option>
                 </Select>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setExportModalOpen(true)}
                className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              {canManageStudents && (
                <Button 
                  onClick={() => {
                    setStudentModalOpen(true);
                    fetchAvailableStudents();
                  }}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  Tambah Mahasiswa
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. STUDENTS GRID */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
            <span>Daftar Mahasiswa</span>
            {studentsQuery.search && (
              <Badge variant="info" className="bg-blue-50 text-blue-600 border-blue-100">
                {students.length} hasil pencarian
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {studentsLoading ? (
            <div className="flex justify-center py-20 bg-white rounded-2xl border border-gray-100">
              <Loader size="large" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {studentsQuery.search ? 'Tidak ada mahasiswa yang ditemukan' : 'Belum ada mahasiswa yang terdaftar'}
              </p>
              {canManageStudents && !studentsQuery.search && (
                <Button 
                  onClick={() => {
                    setStudentModalOpen(true);
                    fetchAvailableStudents();
                  }}
                  className="mt-6 bg-emerald-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Tambah Mahasiswa Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.map(student => (
                  <div
                    key={student.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg shadow-inner">
                          {student.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{student.fullName}</h4>
                          <p className="text-xs text-gray-500 font-mono bg-gray-50 inline-block px-1.5 rounded mt-1">{student.studentId}</p>
                        </div>
                      </div>
                      
                      {canManageStudents && (
                        <div className="relative">
                          <button
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setShowActionMenu(showActionMenu === student.id ? null : student.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {showActionMenu === student.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-xl z-20 border border-gray-100 overflow-hidden py-1">
                              <button
                                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors"
                                onClick={() => {
                                  toast('Fitur detail mahasiswa akan segera tersedia');
                                  setShowActionMenu(null);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-3 text-blue-500" />
                                Lihat Detail
                              </button>
                              <div className="h-px bg-gray-50 my-1"></div>
                              <button
                                className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setRemoveStudentModalOpen(true);
                                  setShowActionMenu(null);
                                }}
                              >
                                <UserMinus className="w-4 h-4 mr-3" />
                                Hapus dari Kelas
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate text-xs">{student.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={student.isActive ? 'success' : 'warning'} className="text-[10px] px-2 py-0.5">
                          {student.isActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                        {student.enrolledAt && (
                          <span className="text-[10px] text-gray-400">
                            Terdaftar: {formatDate(student.enrolledAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {studentsMeta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={studentsQuery.page === 1}
                    onClick={() => setStudentsQuery(prev => ({ ...prev, page: prev.page! - 1 }))}
                    className="rounded-xl"
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                    Halaman {studentsQuery.page} dari {studentsMeta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={studentsQuery.page === studentsMeta.totalPages}
                    onClick={() => setStudentsQuery(prev => ({ ...prev, page: prev.page! + 1 }))}
                    className="rounded-xl"
                  >
                    Selanjutnya
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      {studentModalOpen && (
        <Modal
          onClose={() => {
            setStudentModalOpen(false);
            resetStudentForm();
          }}
          title="Tambah Mahasiswa"
          size="lg"
        >
          <div className="space-y-6">
            {/* Add by Email */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Via Email</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Masukkan email mahasiswa..."
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white"
                  />
                </div>
                <Button
                  onClick={handleEnrollStudentByEmail}
                  disabled={submitting || !studentForm.email.trim()}
                  className="bg-emerald-600 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Undang
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Pilih dari Database</h3>
              
              {availableStudents.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                   <Users className="w-10 h-10 text-gray-300 mx-auto mb-2"/>
                   <p className="text-gray-500 text-sm">Semua mahasiswa sudah terdaftar di kelas ini.</p>
                </div>
              ) : (
                <>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl scrollbar-thin">
                    {availableStudents.map(student => (
                      <label
                        key={student.id}
                        className="flex items-center p-3 hover:bg-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={studentForm.selectedStudentIds.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStudentForm(prev => ({
                                ...prev,
                                selectedStudentIds: [...prev.selectedStudentIds, student.id]
                              }));
                            } else {
                              setStudentForm(prev => ({
                                ...prev,
                                selectedStudentIds: prev.selectedStudentIds.filter(id => id !== student.id)
                              }));
                            }
                          }}
                          className="mr-4 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{student.fullName}</p>
                            <p className="text-xs text-gray-500">{student.studentId}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {studentForm.selectedStudentIds.length > 0 && (
                    <div className="mt-3 flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <p className="text-sm font-bold text-emerald-800">
                        {studentForm.selectedStudentIds.length} mahasiswa dipilih
                      </p>
                      <Button size="sm" variant="ghost" className="text-emerald-600 h-auto p-0 hover:bg-transparent" onClick={()=>setStudentForm(prev=>({...prev, selectedStudentIds: []}))}>Reset</Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => {
                  setStudentModalOpen(false);
                  resetStudentForm();
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleEnrollMultipleStudents}
                disabled={submitting || studentForm.selectedStudentIds.length === 0}
                className="bg-emerald-600 text-white"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <Loader size="small" className="mr-2 border-white" />
                    Menambahkan...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tambahkan {studentForm.selectedStudentIds.length > 0 ? `(${studentForm.selectedStudentIds.length})` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Student Modal */}
      {removeStudentModalOpen && selectedStudent && (
        <Modal
          onClose={() => setRemoveStudentModalOpen(false)}
          title="Konfirmasi Hapus"
        >
          <div className="space-y-6 text-center pt-2">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
               <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <div>
               <h3 className="text-lg font-bold text-gray-900">Hapus Mahasiswa?</h3>
               <p className="text-gray-500 text-sm mt-2 px-6">
                 Apakah Anda yakin ingin menghapus <strong>{selectedStudent.fullName}</strong> dari mata kuliah ini? Semua data nilai dan tugas mereka akan hilang.
               </p>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setRemoveStudentModalOpen(false)}
                className="w-32"
              >
                Batal
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700 text-white w-32 border-none"
                onClick={handleRemoveStudent}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <Modal
          onClose={() => setExportModalOpen(false)}
          title="Export Data"
        >
          <div className="space-y-5">
            <p className="text-gray-600">Download data mahasiswa dalam format CSV untuk diolah di Excel.</p>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-3 text-sm flex items-center gap-2">
                 <Download className="w-4 h-4"/> Kolom Data:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                 <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3"/> Nama Lengkap</span>
                 <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3"/> NIM</span>
                 <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3"/> Email</span>
                 <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3"/> Status Keaktifan</span>
                 <span className="flex items-center gap-2"><CheckCircle className="w-3 h-3"/> Tanggal Masuk</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setExportModalOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleExportStudents} className="bg-blue-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseStudentManagementPage;