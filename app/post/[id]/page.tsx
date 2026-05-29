"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  ArrowLeft, Heart, MessageSquare, CheckCircle2, 
  AlertCircle, Share2, Bookmark, MoreVertical, Trash2 
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function SinglePostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Next.js mein ID nikalne ka naya aur safe tareeqa
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 🔥 3 Dots Menu States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Current user ko local storage se nikalna
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));

    const fetchSinglePost = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Backend ko specific ID ke sath request bhejna
        const res = await axios.get(`${API}/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setPost(res.data);
      } catch (error: any) {
        console.error("Error fetching post", error);
        if (error.response?.status === 404) {
          setErrorMsg("Post not found! Shayad yeh post delete ho chuki hai.");
        } else {
          setErrorMsg("Failed to load post. Server check kijiye.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchSinglePost();
  }, [postId]);

  // 🔥 Handle Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Delete hone ke baad dashboard par wapis bhej do
      router.push("/dashboard"); 
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("Failed to delete post. Try again.");
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-accent animate-pulse">Loading Post...</p>
        </div>
      </div>
    );
  }
  
  // 2. Error State (Agar Post na mile)
  if (errorMsg || !post) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col items-center justify-center p-5">
        <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 text-center max-w-sm">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Oops!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{errorMsg}</p>
          <button onClick={() => router.back()} className="px-5 py-2.5 bg-accent text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Check if the current logged-in user is the author of the post
  const isAuthor = currentUser?.id === post.author?._id || currentUser?._id === post.author?._id;

  // 3. Success State (Asli Post View)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-24 font-sans">
      
      {/* Top Bar with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800 px-5 py-4 flex items-center gap-3 shadow-sm transition-colors">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition">
          <ArrowLeft size={18} className="text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">Post Detail</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-[30px] p-5 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors relative">
          
          {/* Post Header (User Info & 3 Dots) */}
          <div className="flex items-start justify-between">
            <Link href={`/profile/${post.author?._id}`} className="flex items-center gap-3 group cursor-pointer">
              <img
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "U")}&background=6366f1&color=fff`}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover group-hover:ring-2 ring-accent transition-all"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-accent transition-colors">{post.author?.name || post.author?.username}</h3>
                  <CheckCircle2 size={14} className="text-blue-500" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">@{post.author?.username}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    • {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </Link>

            {/* 🔥 3 DOTS MENU */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MoreVertical size={20} />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in duration-200">
                    
                    {/* Copy Link (For Everyone) */}
                    <button 
                      onClick={() => {
                        const link = `${window.location.origin}/post/${postId}`;
                        navigator.clipboard.writeText(link);
                        alert("🔗 Link copied!");
                        setIsMenuOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                    >
                      <Share2 size={14} /> Copy Link
                    </button>

                    {/* Delete Post (Only for Author) */}
                    {isAuthor && (
                      <button 
                        onClick={handleDeletePost} 
                        disabled={isDeleting} 
                        className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 size={14} /> {isDeleting ? "Deleting..." : "Delete Post"}
                      </button>
                    )}

                  </div>
                </>
              )}
            </div>
          </div>

          {/* Post Text & Orbit Tag */}
          <div className="mt-4">
            {post.orbit && (
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3 bg-accent/10 text-accent border border-accent/20 transition-colors">
                {post.orbit}
              </span>
            )}
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base whitespace-pre-wrap transition-colors">{post.caption}</p>
            
            {/* Hashtags */}
            {post.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.hashtags.map((tag: string, idx: number) => (
                  <span key={idx} className="text-accent text-xs font-semibold transition-colors">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="mt-4 rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 transition-colors">
              <img src={post.image} alt="post" className="w-full h-auto max-h-[500px] object-contain" />
            </div>
          )}

          {/* Post Stats */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-rose-500">
                <Heart size={19} fill={post.likes?.includes(currentUser?.id) ? "#f43f5e" : "none"} strokeWidth={post.likes?.includes(currentUser?.id) ? 0 : 2} />
                <span className="text-sm font-semibold">{post.likes?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 transition-colors">
                <MessageSquare size={19} />
                <span className="text-sm font-semibold">{post.comments?.length || 0}</span>
              </div>
            </div>
            <Bookmark size={19} className="text-slate-400 dark:text-slate-500 transition-colors" />
          </div>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4 transition-colors">
              <h4 className="font-black text-slate-900 dark:text-white text-md mb-3 transition-colors">Comments ({post.comments.length})</h4>
              {post.comments.map((c: any) => (
                <div key={c._id} className="flex gap-3">
                  <img 
                    src={c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || "U")}&background=6366f1&color=fff`} 
                    alt="avatar" 
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0" 
                  />
                  <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-2xl px-4 py-3 border border-gray-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white transition-colors">{c.user?.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 transition-colors">
                         {new Date(c.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed transition-colors">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}