import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Plus,
  Search,
  Filter,
  ArrowLeft,
  User,
  MessageCircle,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import InteractivePostCard from '../../components/ui/InteractivePostCard';
import { useAuth } from '../../contexts/AuthContext';
import { forumService, courseService } from '../../services';
import { ForumPost, Course } from '../../types';
import { Button } from '../../components/ui/Button'; // Gunakan komponen Button UI kita

const StudentForumDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [myPosts, setMyPosts] = useState<ForumPost[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'questions' | 'answers'>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getMyCourses();
      setCourses(coursesData || []);
      const myPostsData = await forumService.getMyDiscussions();
      setMyPosts(myPostsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReact = async (postId: string, reactionType: string) => {
    try {
      await forumService.toggleLike(postId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    console.log('Bookmark post:', postId);
  };

  const filteredPosts = myPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                          (filterType === 'questions' && post.type === 'question') ||
                          (filterType === 'answers' && post.parent);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* 1. HEADER PAGE (Emerald Gradient) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-b-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <User className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto">
           <Button
             variant="ghost"
             size="sm"
             onClick={() => navigate('/forums')}
             className="mb-4 text-emerald-100 hover:text-white hover:bg-white/10 pl-0"
           >
             <ArrowLeft className="w-4 h-4 mr-2" />
             Kembali ke Forum
           </Button>
           <h1 className="text-3xl font-bold mb-2 tracking-tight">Postingan Saya</h1>
           <p className="text-emerald-100/90 text-lg">Kelola semua diskusi dan pertanyaan yang pernah Anda buat.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-6">
        
        {/* 2. STATS & ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="md:col-span-2 border-l-4 border-l-emerald-500 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                 <div>
                    <h3 className="font-bold text-gray-800 text-lg">Total Kontribusi</h3>
                    <p className="text-gray-500 text-sm">Anda telah membuat <strong>{myPosts.length}</strong> post di forum.</p>
                 </div>
                 <div className="bg-emerald-50 p-3 rounded-full">
                    <MessageSquare className="w-8 h-8 text-emerald-600"/>
                 </div>
              </CardContent>
           </Card>
           
           <Card className="flex items-center justify-center p-6 shadow-sm border border-gray-100">
              <Button 
                onClick={() => navigate('/forums/create')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 py-6 text-lg"
              >
                 <Plus className="w-6 h-6 mr-2" /> Buat Diskusi Baru
              </Button>
           </Card>
        </div>

        {/* 3. FILTERS */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari dalam post saya..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                />
              </div>
              
              <div className="flex bg-gray-100 p-1 rounded-xl">
                 <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'all' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Semua
                 </button>
                 <button
                    onClick={() => setFilterType('questions')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filterType === 'questions' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    <HelpCircle className="w-3 h-3"/> Pertanyaan
                 </button>
                 <button
                    onClick={() => setFilterType('answers')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filterType === 'answers' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    <CheckCircle className="w-3 h-3"/> Jawaban
                 </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. POSTS LIST */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 border-dashed">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {searchQuery || filterType !== 'all' ? 'Tidak ditemukan' : 'Belum ada aktivitas'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchQuery || filterType !== 'all' 
                  ? 'Coba ubah kata kunci pencarian atau filter Anda.'
                  : 'Mulai berdiskusi untuk meningkatkan pemahaman materi kuliah.'
                }
              </p>
              {!searchQuery && filterType === 'all' && (
                <Button
                  onClick={() => navigate('/forums/create')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Buat Post Pertama
                </Button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <InteractivePostCard
                key={post.id}
                post={post}
                onQuickReact={handleQuickReact}
                onBookmark={handleBookmark}
                showReactionBar={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForumDashboard;