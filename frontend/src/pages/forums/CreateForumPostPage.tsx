import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus,
  BookOpen,
  Type,
  FileText,
  AlertCircle,
  Info,
  PenTool
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { useAuth } from '../../contexts/AuthContext';
import { courseService, forumService } from '../../services';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface FormData {
  title: string;
  content: string;
  courseId: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  courseId?: string;
}

const CreateForumPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    courseId: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const courses = await courseService.getMyCourses();
      setCourses(courses);
      if (courses.length === 1) {
        setFormData(prev => ({ ...prev, courseId: courses[0].id }));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Judul diskusi wajib diisi';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Judul minimal 10 karakter';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Judul maksimal 200 karakter';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Konten diskusi wajib diisi';
    } else if (formData.content.replace(/<[^>]*>/g, '').length < 20) {
      newErrors.content = 'Konten minimal 20 karakter';
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Pilih mata kuliah untuk diskusi ini';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        courseId: formData.courseId
      };
      
      const forumPost = await forumService.createForumPost(postData);
      navigate(`/forums/${forumPost.id}`);
    } catch (error) {
      console.error('Error creating forum post:', error);
      alert('Gagal membuat diskusi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* 1. HEADER PAGE (Emerald Gradient) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-b-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <PenTool className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => navigate('/forums')}
             className="mb-4 text-emerald-100 hover:text-white hover:bg-white/10 pl-0"
           >
             <ArrowLeft className="w-4 h-4 mr-2" />
             Kembali ke Forum
           </Button>
           <h1 className="text-3xl font-bold mb-2 tracking-tight">Buat Diskusi Baru</h1>
           <p className="text-emerald-100/90 text-lg">Bagikan pertanyaan, ide, atau informasi dengan komunitas pembelajaran.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Course & Title Section */}
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6 space-y-6">
               <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                     <BookOpen className="w-4 h-4 text-emerald-600"/> Mata Kuliah
                  </label>
                  <Select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className={`w-full ${errors.courseId ? 'border-red-500' : ''}`}
                  >
                    <option value="">-- Pilih Mata Kuliah --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </Select>
                  {errors.courseId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.courseId}
                    </p>
                  )}
               </div>

               <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                     <Type className="w-4 h-4 text-emerald-600"/> Judul Diskusi
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Bagaimana cara mengimplementasikan Algoritma Dijkstra?"
                    className={errors.title ? 'border-red-500' : ''}
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {errors.title && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.title}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formData.title.length}/200
                    </span>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Content Section */}
          <Card className="shadow-sm border border-gray-100">
            <CardContent className="p-6">
               <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600"/> Konten
               </label>
               
               <RichTextEditor
                 value={formData.content}
                 onChange={(value) => setFormData({ ...formData, content: value })}
                 placeholder="Jelaskan pertanyaan atau topik diskusi Anda secara detail..."
                 minHeight={300}
               />
               
               {errors.content && (
                 <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                   <AlertCircle className="w-3 h-3" /> {errors.content}
                 </p>
               )}
               
               <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                 <h4 className="flex items-center gap-2 font-bold text-emerald-900 mb-2 text-sm">
                   <Info className="w-4 h-4" /> Tips Diskusi Efektif:
                 </h4>
                 <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside ml-1">
                   <li>Gunakan judul yang spesifik agar mudah ditemukan.</li>
                   <li>Jelaskan konteks masalah dengan jelas.</li>
                   <li>Sertakan potongan kode atau screenshot jika perlu.</li>
                   <li>Gunakan bahasa yang sopan dan mudah dipahami.</li>
                 </ul>
               </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/forums')}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200"
            >
              {loading ? 'Memproses...' : <><Plus className="w-4 h-4 mr-2" /> Buat Diskusi</>}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateForumPostPage;