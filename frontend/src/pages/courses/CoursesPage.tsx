import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  BookOpen, 
  Users, 
  Calendar,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { courseService } from '../../services/courseService';
import { Course, UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface FilterState {
  semester: string;
  credits: string;
  lecturer: string;
  sortBy: 'name' | 'code' | 'credits' | 'studentsCount';
  sortOrder: 'asc' | 'desc';
}

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    semester: '',
    credits: '',
    lecturer: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const isAdmin = user?.role === UserRole.ADMIN;
  const isLecturer = user?.role === UserRole.LECTURER;
  const isStudent = user?.role === UserRole.STUDENT;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses();
      setCourses(response.data);
    } catch (error) {
      toast.error('Gagal memuat data mata kuliah');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses;

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.semester) {
      filtered = filtered.filter(course => course.semester === filters.semester);
    }
    if (filters.credits) {
      filtered = filtered.filter(course => course.credits === parseInt(filters.credits));
    }
    if (filters.lecturer) {
      filtered = filtered.filter(course => 
        course.lecturer.fullName.toLowerCase().includes(filters.lecturer.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'credits':
          comparison = a.credits - b.credits;
          break;
        case 'studentsCount':
          comparison = (a.studentsCount || 0) - (b.studentsCount || 0);
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [courses, searchQuery, filters]);

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      await courseService.deleteCourse(selectedCourse.id);
      toast.success('Mata kuliah berhasil dihapus');
      fetchCourses();
      setDeleteModalOpen(false);
      setSelectedCourse(null);
    } catch (error) {
      toast.error('Gagal menghapus mata kuliah');
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      toast.success('Berhasil mendaftar mata kuliah');
      fetchCourses();
    } catch (error) {
      toast.error('Gagal mendaftar mata kuliah');
    }
  };

  // --- MODERN CARD DESIGN ---
  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div 
      onClick={() => navigate(`/courses/${course.id}`)}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-emerald-200"
    >
      {/* Decorative Header (Emerald Gradient) */}
      <div className="h-28 bg-gradient-to-br from-emerald-600 to-teal-800 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl -ml-5 -mb-5"></div>
        
        <div className="relative z-10 flex justify-between items-start">
           <span className="bg-white/20 text-white backdrop-blur-md px-2 py-1 rounded text-xs font-bold border border-white/20">
             {course.code}
           </span>
           <span className="bg-white text-emerald-700 px-2 py-1 rounded text-xs font-bold shadow-sm">
             {course.credits} SKS
           </span>
        </div>
      </div>

      <div className="p-5 pt-2">
         {/* Icon overlap effect */}
         <div className="-mt-8 mb-3 relative z-10 inline-block">
            <div className="bg-white p-2 rounded-xl shadow-md">
               <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                  <BookOpen className="w-6 h-6" />
               </div>
            </div>
         </div>

         <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[3.5rem]">
            {course.name}
         </h3>

         <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-gray-500">
               <GraduationCap className="w-4 h-4 mr-2 text-emerald-500" />
               <span className="line-clamp-1">{course.lecturer.fullName}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
               <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  <span>{course.studentsCount || 0} Siswa</span>
               </div>
               <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                  <span>Sem. {course.semester}</span>
               </div>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="border-t border-gray-100 pt-4 flex gap-2">
            {isStudent ? (
               <Button 
                 size="sm" 
                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-lg"
                 onClick={(e) => {
                   e.stopPropagation();
                   handleEnrollCourse(course.id);
                 }}
               >
                 <UserPlus className="w-4 h-4 mr-2" />
                 Daftar
               </Button>
            ) : (
               <>
                 <Button size="sm" className="flex-1 bg-gray-50 text-gray-700 hover:bg-gray-100 border-none rounded-lg">
                    <Eye className="w-4 h-4 mr-2"/> Detail
                 </Button>
                 {/* Menu Edit/Hapus untuk Dosen/Admin */}
                 {(isAdmin || (isLecturer && course.lecturer.id === user?.id)) && (
                    <div className="relative">
                       <Button
                          size="sm"
                          variant="outline"
                          className="px-2 border-gray-200"
                          onClick={(e) => {
                             e.stopPropagation();
                             setShowActionMenu(showActionMenu === course.id ? null : course.id);
                          }}
                       >
                          <MoreVertical className="w-4 h-4" />
                       </Button>
                       {showActionMenu === course.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                             <button
                                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                onClick={(e) => {
                                   e.stopPropagation();
                                   navigate(`/courses/${course.id}/edit`);
                                   setShowActionMenu(null);
                                }}
                             >
                                <Edit className="w-4 h-4 mr-2 text-blue-500" /> Edit
                             </button>
                             <button
                                className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left border-t border-gray-50"
                                onClick={(e) => {
                                   e.stopPropagation();
                                   setSelectedCourse(course);
                                   setDeleteModalOpen(true);
                                   setShowActionMenu(null);
                                }}
                             >
                                <Trash2 className="w-4 h-4 mr-2" /> Hapus
                             </button>
                          </div>
                       )}
                    </div>
                 )}
               </>
            )}
         </div>
      </div>
    </div>
  );

  const CourseListItem: React.FC<{ course: Course }> = ({ course }) => (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <div className="flex items-center gap-4">
         <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6"/>
         </div>
         <div>
            <h3 className="font-bold text-gray-800">{course.name}</h3>
            <div className="flex gap-3 text-sm text-gray-500 mt-1">
               <span className="bg-gray-100 px-2 rounded text-xs flex items-center">{course.code}</span>
               <span>{course.credits} SKS</span>
               <span>•</span>
               <span>{course.lecturer.fullName}</span>
            </div>
         </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300" />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Katalog Mata Kuliah</h1>
          <p className="text-gray-500 mt-1 text-lg">
            Temukan dan pelajari materi yang tersedia untuk semester ini.
          </p>
        </div>
        {!isStudent && (
           <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5 shadow-lg shadow-emerald-200" onClick={() => navigate('/courses/create')}>
              + Buat Mata Kuliah
           </Button>
        )}
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-20 z-30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cari mata kuliah, kode, atau nama dosen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
             <Select
                value={filters.semester}
                onChange={(e) => setFilters({...filters, semester: e.target.value})}
                className="w-40 h-12 rounded-xl border-gray-200"
             >
                <option value="">Semua Sem.</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
             </Select>

             <Button
                variant="outline"
                onClick={() => setShowFilterModal(true)}
                className="h-12 px-4 rounded-xl border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200"
             >
                <Filter className="w-4 h-4 mr-2" /> Filter
             </Button>

             <div className="bg-gray-100 p-1 rounded-xl flex items-center h-12">
                <button
                   className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`}
                   onClick={() => setViewMode('grid')}
                >
                   <Grid className="w-5 h-5" />
                </button>
                <button
                   className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-emerald-600' : 'text-gray-400'}`}
                   onClick={() => setViewMode('list')}
                >
                   <List className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* 3. COURSES GRID/LIST */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Tidak ada mata kuliah ditemukan</h3>
          <p className="text-gray-500">Coba kata kunci lain atau ubah filter pencarian Anda.</p>
          <Button 
             variant="outline" 
             className="mt-6"
             onClick={() => { setSearchQuery(''); setFilters({semester:'', credits:'', lecturer:'', sortBy:'name', sortOrder:'asc'}); }}
          >
             Reset Pencarian
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredAndSortedCourses.map((course) => (
            viewMode === 'grid' ? <CourseCard key={course.id} course={course} /> : <CourseListItem key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* 4. MODALS (Filter & Delete) */}
      {showFilterModal && (
        <Modal onClose={() => setShowFilterModal(false)} title="Filter Lanjutan">
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Urutkan Berdasarkan</label>
              <div className="grid grid-cols-2 gap-2">
                 {['name', 'credits', 'studentsCount'].map((opt) => (
                    <button 
                       key={opt}
                       onClick={() => setFilters({...filters, sortBy: opt as any})}
                       className={`px-4 py-2 text-sm rounded-lg border ${filters.sortBy === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-gray-200 text-gray-600'}`}
                    >
                       {opt === 'name' ? 'Nama (A-Z)' : opt === 'credits' ? 'SKS' : 'Popularitas'}
                    </button>
                 ))}
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
               <Button variant="ghost" onClick={() => setShowFilterModal(false)}>Batal</Button>
               <Button className="bg-emerald-600 text-white" onClick={() => setShowFilterModal(false)}>Terapkan Filter</Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteModalOpen && (
        <Modal onClose={() => setDeleteModalOpen(false)} title="Hapus Mata Kuliah?">
          <div className="text-center p-4">
             <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8"/>
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Penghapusan</h3>
             <p className="text-gray-500 text-sm mb-6">
                Anda akan menghapus mata kuliah <strong>"{selectedCourse?.name}"</strong>. Semua data tugas, materi, dan nilai di dalamnya akan hilang permanen.
             </p>
             <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="w-32">Batal</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white w-32" onClick={handleDeleteCourse}>Ya, Hapus</Button>
             </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default CoursesPage;