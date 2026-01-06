import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Search,
  Filter,
  Plus,
  TrendingUp,
  BookOpen,
  Coffee,
  MessageCircle,
  Hash
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import InteractivePostCard from '../../components/ui/InteractivePostCard';
import { useAuth } from '../../contexts/AuthContext';
import { forumService, courseService } from '../../services';
import { Course, ForumPost } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const ForumsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'oldest'>('latest');

  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchData();
  }, [selectedCourse, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const coursesResponse = await courseService.getMyCourses();
      setCourses(coursesResponse || []);

      const params: any = {
        sort: sortBy,
        search: searchQuery
      };
      
      let allPosts: ForumPost[] = [];
      
      if (selectedCourse !== 'all') {
        const postsResponse = await forumService.getForumPosts(selectedCourse, params);
        allPosts = postsResponse.data || [];
      } else {
        const courseList = coursesResponse || [];
        const postPromises = courseList.map(course => 
          forumService.getForumPosts(course.id, params).catch(() => ({ data: [] }))
        );
        
        const postsResponses = await Promise.all(postPromises);
        allPosts = postsResponses.flatMap(response => response.data || []);
      }

      if (sortBy === 'latest') {
        allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (sortBy === 'popular') {
        allPosts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      } else if (sortBy === 'oldest') {
        allPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }

      setForumPosts(allPosts);
    } catch (error) {
      console.error('Error fetching forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleQuickReact = async (postId: string, reactionType: string) => {
    try {
      await forumService.toggleLike(postId);
      setForumPosts(posts => 
        posts.map(post => 
          post.id === postId 
            ? { ...post, likesCount: (post.likesCount || 0) + 1 }
            : post
        )
      );
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const handleBookmark = async (postId: string) => {
    console.log('Bookmark post:', postId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HEADER PAGE (Emerald Gradient) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <MessageSquare className="w-40 h-40 text-white" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center py-4">
           <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Forum Diskusi</h1>
           <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
             Tempat berdiskusi, bertanya, dan berbagi pemahaman dengan dosen dan teman sekelas.
           </p>
           
           <div className="flex justify-center gap-4">
              {isStudent && (
                <Button 
                  onClick={() => navigate('/forums/dashboard')}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                   <TrendingUp className="w-4 h-4 mr-2" /> Dashboard Aktivitas
                </Button>
              )}
              <Button 
                onClick={() => navigate('/forums/create')}
                className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-lg shadow-emerald-900/20"
              >
                 <Plus className="w-4 h-4 mr-2" /> Buat Diskusi Baru
              </Button>
           </div>
        </div>
      </div>

      {/* 2. FILTERS BAR */}
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              
              {/* Course Filter */}
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Mata Kuliah</label>
                <div className="relative">
                   <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm appearance-none cursor-pointer hover:bg-white transition-colors"
                   >
                      <option value="all">Semua Mata Kuliah</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                   </select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="w-full lg:w-48">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Urutkan</label>
                <div className="relative">
                   <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm appearance-none cursor-pointer hover:bg-white transition-colors"
                   >
                      <option value="latest">Terbaru</option>
                      <option value="popular">Terpopuler</option>
                      <option value="oldest">Terlama</option>
                   </select>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Pencarian</label>
                <form onSubmit={handleSearch} className="flex gap-2">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari topik diskusi..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                      />
                   </div>
                   <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4">
                      Cari
                   </Button>
                </form>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. POSTS LIST */}
      <div className="max-w-4xl mx-auto space-y-6">
        {forumPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada diskusi'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {searchQuery 
                ? 'Coba gunakan kata kunci lain atau ubah filter pencarian Anda.'
                : 'Jadilah yang pertama memulai diskusi di kelas ini! Pertanyaan Anda mungkin membantu teman yang lain.'
              }
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate('/forums/create')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5"
              >
                <Plus className="w-4 h-4 mr-2" /> Mulai Diskusi
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
             {forumPosts.map((post) => (
               <InteractivePostCard
                 key={post.id}
                 post={post}
                 onQuickReact={handleQuickReact}
                 onBookmark={handleBookmark}
                 showReactionBar={true}
               />
             ))}
          </div>
        )}

        {/* Load More Button */}
        {forumPosts.length >= 10 && (
          <div className="text-center pt-4">
            <Button 
               variant="outline" 
               className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-full px-8"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ForumsPage;