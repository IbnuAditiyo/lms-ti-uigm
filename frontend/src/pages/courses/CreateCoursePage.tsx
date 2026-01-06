import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Info, ShieldCheck, BookOpen } from 'lucide-react';

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* 1. HEADER PAGE (Emerald Gradient) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-b-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <BookOpen className="w-40 h-40 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => navigate(-1)}
             className="mb-4 text-emerald-100 hover:text-white hover:bg-white/10 pl-0"
           >
             <ArrowLeft className="w-4 h-4 mr-2" />
             Kembali
           </Button>
           <h1 className="text-3xl font-bold mb-2 tracking-tight">Buat Mata Kuliah Baru</h1>
           <p className="text-emerald-100/90 text-lg">Pusat manajemen pembuatan kelas dan materi.</p>
        </div>
      </div>

      {/* 2. CONTENT CARD */}
      <div className="max-w-3xl mx-auto px-6">
        <Card className="border-t-4 border-t-emerald-500 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
               <div className="bg-emerald-50 p-3 rounded-full">
                  <Info className="w-8 h-8 text-emerald-600" />
               </div>
               <div className="space-y-4 flex-1">
                  <h2 className="text-xl font-bold text-gray-800">Informasi Pembuatan Kelas</h2>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-800 text-sm">
                     <p>
                        Halaman ini adalah titik navigasi. Untuk menjaga konsistensi data, pembuatan mata kuliah dilakukan melalui <strong>Panel Admin</strong> atau modal khusus.
                     </p>
                  </div>

                  <div className="space-y-4 pt-2">
                     <p className="text-gray-600 font-medium">Silakan pilih metode di bawah ini:</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                           onClick={() => navigate('/admin/courses')}
                           className="cursor-pointer group p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                        >
                           <div className="flex items-center gap-2 mb-2">
                              <ShieldCheck className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
                              <span className="font-bold text-gray-800 group-hover:text-emerald-700">Admin Panel</span>
                           </div>
                           <p className="text-xs text-gray-500 group-hover:text-emerald-600">
                              Kelola semua mata kuliah, jadwal, dan pengajar dari satu tempat terpusat.
                           </p>
                        </div>

                        <div 
                           onClick={() => navigate('/courses')}
                           className="cursor-pointer group p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                           <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                              <span className="font-bold text-gray-800 group-hover:text-blue-700">Daftar Course</span>
                           </div>
                           <p className="text-xs text-gray-500 group-hover:text-blue-600">
                              Kembali ke daftar mata kuliah untuk melihat kelas yang sudah tersedia.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCoursePage;