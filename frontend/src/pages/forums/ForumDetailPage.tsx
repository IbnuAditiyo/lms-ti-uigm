import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle, 
  Heart, 
  Eye,
  MoreVertical,
  Send,
  Pin,
  Check,
  Edit2,
  Trash2,
  Flag,
  User,
  BookOpen,
  Reply,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { useAuth } from '../../contexts/AuthContext';
import { forumService } from '../../services';
import { ForumPost } from '../../types';
import { Button } from '../../components/ui/Button'; // Menggunakan komponen Button UI kita

const ForumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [sortReplies, setSortReplies] = useState<'latest' | 'oldest' | 'popular'>('oldest');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const isOwner = user?.id === post?.authorId;
  const isLecturer = user?.role === 'lecturer';
  const isAdmin = user?.role === 'admin';
  const canModerate = isOwner || isLecturer || isAdmin;

  useEffect(() => {
    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  useEffect(() => {
    if (id && post && replies.length > 0 && sortReplies !== 'oldest') {
      fetchReplies(id);
    }
  }, [sortReplies]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const postResponse = await forumService.getForumPost(id!);
      const postData = postResponse.data;
      setPost(postData);
      
      if (postData.replies && Array.isArray(postData.replies)) {
        setReplies(postData.replies);
      } else {
        setReplies([]);
      }
      
      try {
        await forumService.markPostAsViewed(id!);
      } catch (viewError) {
        console.warn('Could not mark post as viewed:', viewError);
      }
      
    } catch (error) {
      console.error('Error fetching post details:', error);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (postId: string) => {
    try {
      const repliesResponse = await forumService.getForumReplies(postId, { sort: sortReplies });
      let repliesData = [];
      if (repliesResponse && repliesResponse.data) {
        repliesData = repliesResponse.data;
      } else if (Array.isArray(repliesResponse)) {
        repliesData = repliesResponse;
      }
      setReplies(Array.isArray(repliesData) ? repliesData : []);
    } catch (error) {
      console.error('Error refreshing replies:', error);
    }
  };

  const handleLikePost = async () => {
    if (!post) return;
    try {
      await forumService.toggleLike(post.id);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !post) return;
    try {
      const replyData = {
        content: replyContent.trim(),
        ...(replyingTo && { parentId: replyingTo })
      };
      const newReplyResponse = await forumService.createReply(post.id, replyData);
      const newReplyData = newReplyResponse.data;
      
      if (!newReplyData || typeof newReplyData.id !== 'string') {
        throw new Error("Invalid reply data received from server.");
      }
      const newReply: ForumPost = newReplyData;
      
      setReplies(prevReplies => [...prevReplies, newReply]);
      setReplyContent('');
      setReplyingTo(null);
      
      setPost(prevPost => ({
        ...prevPost!,
        repliesCount: (prevPost!.repliesCount || 0) + 1
      }));
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Gagal mengirim balasan. Silakan coba lagi.');
    }
  };

  const handleUpdateReply = async (replyId: string) => {
    if (!editContent.trim()) return;
    try {
      await forumService.updateForumPost(replyId, { content: editContent });
      setReplies(replies.map(reply => 
        reply.id === replyId ? { ...reply, content: editContent } : reply
      ));
      setEditingReply(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm('Yakin ingin menghapus balasan ini?')) return;
    try {
      await forumService.deleteForumPost(replyId);
      setReplies(replies.filter(reply => reply.id !== replyId));
      if (post && post.repliesCount !== undefined) {
        setPost({
          ...post,
          repliesCount: post.repliesCount - 1
        });
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleMarkAsAnswer = async (replyId: string) => {
    if (!post || !isOwner) return;
    try {
      await forumService.markAsAnswer(post.id, replyId);
      setReplies(replies.map(reply => ({
        ...reply,
        isAnswer: reply.id === replyId
      })));
      setPost({ ...post, isAnswered: true });
    } catch (error) {
      console.error('Error marking as answer:', error);
    }
  };

  const handlePinPost = async () => {
    if (!post || !canModerate) return;
    try {
      await forumService.togglePin(post.id);
      setPost({ ...post, isPinned: !post.isPinned });
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    const intervals = {
      tahun: 31536000,
      bulan: 2592000,
      minggu: 604800,
      hari: 86400,
      jam: 3600,
      menit: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit} yang lalu`;
      }
    }
    return 'Baru saja';
  };

  const toggleReplyExpansion = (replyId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(replyId)) {
      newExpanded.delete(replyId);
    } else {
      newExpanded.add(replyId);
    }
    setExpandedReplies(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
           <MessageCircle className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">Post tidak ditemukan</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/forums')}>Kembali ke Forum</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* 1. HEADER PAGE (Emerald Gradient) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-b-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <MessageCircle className="w-40 h-40 text-white" />
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
           
           <div className="flex flex-wrap gap-2 mb-3">
              {post.isPinned && (
                <span className="bg-yellow-400/20 text-yellow-100 border border-yellow-400/30 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
              {post.isAnswered && (
                <span className="bg-green-400/20 text-green-100 border border-green-400/30 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                  <Check className="w-3 h-3" /> Terjawab
                </span>
              )}
              <span className="bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 backdrop-blur-sm">
                <BookOpen className="w-3 h-3" /> {post.course?.name || 'Umum'}
              </span>
           </div>
           
           <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{post.title}</h1>
           
           <div className="flex items-center gap-3 mt-4 text-emerald-100 text-sm">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {post.author?.fullName?.charAt(0)}
                 </div>
                 <span>{post.author?.fullName}</span>
              </div>
              <span>•</span>
              <span>{getTimeAgo(post.createdAt)}</span>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {/* Main Post Content */}
        <Card className="shadow-sm border-t-4 border-t-emerald-500">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                     post.author?.role === 'lecturer' ? 'bg-purple-600' : 'bg-emerald-600'
                  }`}>
                     {post.author?.fullName?.charAt(0)}
                  </div>
                  <div>
                     <h3 className="font-bold text-gray-900">{post.author?.fullName || 'Unknown User'}</h3>
                     <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.author?.role === 'lecturer' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                     }`}>
                        {post.author?.role === 'lecturer' ? 'Dosen' : 'Mahasiswa'}
                     </span>
                  </div>
               </div>

               {canModerate && (
                 <div className="relative">
                   <button
                     onClick={() => setShowActions(showActions === post.id ? null : post.id)}
                     className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                   >
                     <MoreVertical className="w-5 h-5" />
                   </button>
                   
                   {showActions === post.id && (
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 overflow-hidden">
                       <button
                         onClick={handlePinPost}
                         className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                       >
                         <Pin className="w-4 h-4" />
                         {post.isPinned ? 'Unpin' : 'Pin'} Post
                       </button>
                       {isOwner ? (
                         <>
                           <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700">
                             <Edit2 className="w-4 h-4" /> Edit Post
                           </button>
                           <button className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 border-t border-gray-50">
                             <Trash2 className="w-4 h-4" /> Hapus Post
                           </button>
                         </>
                       ) : (
                         <button className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 border-t border-gray-50">
                           <Flag className="w-4 h-4" /> Laporkan
                         </button>
                       )}
                     </div>
                   )}
                 </div>
               )}
            </div>

            <div 
              className="prose max-w-none mb-8 text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLikePost}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    post.isLiked 
                      ? 'bg-red-50 text-red-600' 
                      : 'hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="font-bold">{post.likesCount || 0}</span>
                </button>
                
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Eye className="w-5 h-5" />
                  <span>{post.viewsCount || 0}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.repliesCount || replies.length}</span>
                </div>
              </div>
              
              <Button
                onClick={() => {
                  setReplyingTo(null);
                  const editorElement = document.querySelector('[data-testid="reply-editor"]');
                  if (editorElement) {
                    editorElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200"
              >
                <Reply className="w-4 h-4 mr-2" />
                Balas Diskusi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                Balasan ({post.repliesCount || replies.length})
              </CardTitle>
              
              <select
                value={sortReplies}
                onChange={(e) => setSortReplies(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="oldest">Terlama</option>
                <option value="latest">Terbaru</option>
                <option value="popular">Terpopuler</option>
              </select>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 p-6">
            {/* Reply Editor */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-100 transition-all" data-testid="reply-editor">
              {replyingTo && (() => {
                const replyTarget = replies.find(r => r.id === replyingTo);
                return (
                  <div className="mb-3 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg flex justify-between items-center">
                    <span>Membalas ke <strong>{replyTarget?.author?.fullName || 'Unknown User'}</strong></span>
                    <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-blue-600 font-bold">✕</button>
                  </div>
                );
              })()}
              
              <RichTextEditor
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Tulis balasan Anda..."
                minHeight={100}
              />
              
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-300"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Balasan
                </Button>
              </div>
            </div>

            {replies.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada balasan. Jadilah yang pertama!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      reply.isAnswer 
                        ? 'border-emerald-200 bg-emerald-50/30' 
                        : 'border-gray-100 bg-white hover:border-emerald-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {reply.author?.fullName?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{reply.author?.fullName || 'Unknown User'}</h4>
                            {reply.isAnswer && (
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Award className="w-3 h-3" /> Jawaban Terbaik
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{getTimeAgo(reply.createdAt)}</p>
                        </div>
                      </div>
                      
                      {(user?.id === reply.authorId || canModerate) && (
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === reply.id ? null : reply.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {showActions === reply.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 overflow-hidden">
                              {isOwner && !reply.isAnswer && (
                                <button
                                  onClick={() => handleMarkAsAnswer(reply.id)}
                                  className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 flex items-center gap-2 text-sm text-emerald-700 font-medium"
                                >
                                  <Check className="w-4 h-4" /> Tandai Jawaban
                                </button>
                              )}
                              {user?.id === reply.authorId && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingReply(reply.id);
                                      setEditContent(reply.content);
                                      setShowActions(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                                  >
                                    <Edit2 className="w-4 h-4" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReply(reply.id)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 border-t border-gray-50"
                                  >
                                    <Trash2 className="w-4 h-4" /> Hapus
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {editingReply === reply.id ? (
                      <div className="space-y-3 mt-2">
                        <RichTextEditor
                          value={editContent}
                          onChange={setEditContent}
                          minHeight={100}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingReply(null); setEditContent(''); }}>Batal</Button>
                          <Button size="sm" onClick={() => handleUpdateReply(reply.id)}>Simpan</Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="prose prose-sm max-w-none text-gray-700 mb-3 ml-13 pl-13"
                        dangerouslySetInnerHTML={{ __html: reply.content }}
                      />
                    )}

                    {/* Nested Replies Toggle */}
                    {reply.children && reply.children.length > 0 && (
                      <div className="mt-4 ml-12">
                        <button
                          onClick={() => toggleReplyExpansion(reply.id)}
                          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {expandedReplies.has(reply.id) ? (
                            <>
                              <ChevronUp className="w-3 h-3" /> Sembunyikan {reply.children.length} balasan
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" /> Lihat {reply.children.length} balasan
                            </>
                          )}
                        </button>
                        
                        {expandedReplies.has(reply.id) && (
                          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
                            {reply.children.map((nestedReply) => (
                              <div key={nestedReply.id} className="p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                                    {nestedReply.author?.fullName?.charAt(0)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <p className="font-bold text-xs text-gray-800">{nestedReply.author?.fullName}</p>
                                     <span className="text-[10px] text-gray-400">• {getTimeAgo(nestedReply.createdAt)}</span>
                                  </div>
                                </div>
                                <div 
                                  className="prose prose-sm max-w-none text-xs text-gray-600"
                                  dangerouslySetInnerHTML={{ __html: nestedReply.content }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumDetailPage;