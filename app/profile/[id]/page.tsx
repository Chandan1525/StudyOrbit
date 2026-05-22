"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Link2, Settings, 
  MoreVertical, BookOpen, Users, Grid, 
  Folder, QrCode, Heart, MessageSquare, Share2, Bookmark, CheckCircle2, FolderGit2, Star, ExternalLink
} from "lucide-react";

// ── Static Fallback Data for Projects ──
const PROJECTS = [
  {
    id: 1,
    name: "DevHive Forum",
    desc: "Real-time Q&A platform for developers with Socket.io chat, upvoting, and code highlighting.",
    tech: ["React", "Express", "Socket.io", "MongoDB"],
    stars: 142,
    gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    icon: "💬",
    github: "#",
    live: "#",
  },
  {
    id: 2,
    name: "ML Notes Classifier",
    desc: "NLP-powered tool that auto-tags and organizes study notes using Python and scikit-learn.",
    tech: ["Python", "Flask", "NLTK", "scikit-learn"],
    stars: 89,
    gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
    icon: "🧠",
    github: "#",
    live: "#",
  },
  {
    id: 3,
    name: "StudyOrbit",
    desc: "A growth-oriented student platform for learning, collaborating, and discovering opportunities.",
    tech: ["Next.js", "Node.js", "MongoDB", "Tailwind"],
    stars: 318,
    gradient: "linear-gradient(135deg,#10b981,#059669)",
    icon: "🚀",
    github: "#",
    live: "#",
  },
];

// ── QR Code SVG ──
function QRCodeSVG() {
  const cells = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1],
  ];
  const size = 21;
  const cell = 10;
  return (
    <svg
      width={size * cell}
      height={size * cell}
      viewBox={`0 0 ${size * cell} ${size * cell}`}
    >
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell + 1}
              y={r * cell + 1}
              width={cell - 2}
              height={cell - 2}
              rx="1.5"
              fill="#1a1a2e"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

export default function DynamicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const [profileData, setProfileData] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    let currentUser = null;
    const stored = localStorage.getItem("user");
    // 🔥 POSTS FETCH KARNE KE LIYE TOKEN NIKALA
    const token = localStorage.getItem("token"); 

    if (stored) {
      currentUser = JSON.parse(stored);
      setLoggedInUser(currentUser);
    }

    const fetchData = async () => {
      try {
        // 1. Profile Data Load Karna
        const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile/${userId}`);
        const data = profileRes.data.user;
        setProfileData(data);
        
        setFollowersCount(data.followers?.length || 0);
        
        if (currentUser && data.followers) {
          const amIFollowing = data.followers.includes(currentUser.id) || data.followers.includes(currentUser._id);
          setIsFollowing(amIFollowing);
        }

        // 🔥 2. Posts Fetch Karna (With Token Header)
        try {
          const postsRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/posts/user/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          setUserPosts(postsRes.data || []);
        } catch (postErr) {
          console.warn("Could not fetch posts.");
        }

      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFollow = async () => {
    if (!loggedInUser) return alert("Please login to follow users.");
    setIsFollowLoading(true);
    
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowersCount(prev => wasFollowing ? prev - 1 : prev + 1);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsFollowing(res.data.isFollowing);
      setFollowersCount(res.data.followersCount);

      const updatedUser = { ...loggedInUser, following: res.data.followingCount };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setLoggedInUser(updatedUser); 

    } catch (error) {
      console.error("Follow error:", error);
      setIsFollowing(wasFollowing);
      setFollowersCount(prev => wasFollowing ? prev + 1 : prev - 1);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messages?chat=${userId}`);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-accent font-bold transition-colors">Loading Space...</div>;
  }
  if (!profileData) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-bold text-gray-500 transition-colors">User not found</div>;
  }

  // Current exact owner matching check (Kept for the Settings cog in the top bar)
  const currentUserId = loggedInUser?.id || loggedInUser?._id;
  const targetUserId = profileData?.id || profileData?._id;
  const isOwner = currentUserId && targetUserId && currentUserId === targetUserId;

  return (
    // DARK MODE WRAPPER
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans transition-colors duration-300 text-slate-900 dark:text-slate-100">
      
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 transition-colors">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition">
          <ArrowLeft size={18} className="text-slate-700 dark:text-slate-200" />
        </button>
        <h1 className="text-lg font-bold">{profileData.username}</h1>
        {isOwner ? (
           <Link href="/settings">
             <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition"><Settings size={18} className="text-slate-700 dark:text-slate-200" /></button>
           </Link>
        ) : <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition"><MoreVertical size={18} className="text-slate-700 dark:text-slate-200" /></button>}
      </div>

      {/* ── COVER & AVATAR ── */}
      <div className="h-40 w-full relative" style={{ background: profileData.coverGradient || "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }} />
      <div className="relative flex justify-center -mt-14">
        <div className="relative p-1 bg-slate-50 dark:bg-slate-950 rounded-full transition-colors">
          <img
            src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=6366f1&color=fff`}
            alt="avatar"
            className="w-[104px] h-[104px] rounded-full object-cover shadow-md border-4 border-slate-50 dark:border-slate-950 transition-colors"
          />
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-slate-50 dark:border-slate-950 rounded-full transition-colors"></div>
        </div>
      </div>

      {/* ── USER INFO ── */}
      <div className="text-center px-5 mt-2">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">{profileData.name}</h1>
        <p className="text-sm font-medium text-accent transition-colors">@{profileData.username}</p>
        
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap text-xs text-gray-500 dark:text-slate-400 transition-colors">
          <span className="flex items-center gap-1"><MapPin size={12}/> {profileData.location || "Earth"}</span>
          <span className="flex items-center gap-1 text-accent transition-colors"><Link2 size={12}/> {profileData.website ? profileData.website.replace(/^https?:\/\//, '') : "studyorbit.com"}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* ── STATS ROW ── */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm mt-6 p-4 transition-colors">
          <div className="flex-1 text-center border-r border-gray-100 dark:border-slate-800 transition-colors">
            <div className="text-xl font-black text-gray-900 dark:text-white transition-colors">{userPosts.length}</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1">Posts</div>
          </div>
          <div className="flex-1 text-center border-r border-gray-100 dark:border-slate-800 transition-colors">
            <div className="text-xl font-black text-gray-900 dark:text-white transition-colors">{followersCount}</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1">Followers</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-xl font-black text-gray-900 dark:text-white transition-colors">{profileData.following || 0}</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1">Following</div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="mt-4 flex items-center gap-3">
          <button 
            onClick={handleFollow}
            disabled={isFollowLoading}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all ${
              isFollowing 
                ? "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 shadow-sm"
                : "bg-accent text-white shadow-md shadow-accent/20 hover:opacity-90"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          
          <button 
            onClick={handleMessage}
            className="flex-1 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Message
          </button>

          <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
            <MoreVertical size={18} />
          </button>
        </div>

        {/* ── ABOUT CARD ── */}
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center transition-colors">
              <BookOpen size={12} className="text-accent" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">About</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed transition-colors">
            {profileData.bio || "Welcome to my StudyOrbit profile! Open to new connections."}
          </p>
        </div>

        {/* ── NETWORK CARD ── */}
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center transition-colors">
                <Users size={12} className="text-accent" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">Network</h3>
            </div>
            <button className="text-xs font-bold text-accent transition-colors">See all &gt;</button>
          </div>
          <div className="flex items-center">
            {['#ef4444', '#3b82f6', '#f59e0b', '#d946ef', '#06b6d4'].map((color, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold -ml-3 first:ml-0 shadow-sm transition-colors" style={{ backgroundColor: color, zIndex: 10 - i }}>
                {['AV', 'RK', 'PS', 'MK', 'AN'][i]}
              </div>
            ))}
            <span className="ml-3 text-xs font-semibold text-gray-400 dark:text-slate-500 transition-colors">+0 more</span>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-6 flex bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-gray-100 dark:border-slate-800 shadow-sm mb-4 transition-colors">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'posts' ? 'bg-accent text-white shadow-md' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
          >
            <Grid size={16} /> Posts
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'projects' ? 'bg-accent text-white shadow-md' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
          >
            <FolderGit2 size={16} /> Projects
          </button>
          <button 
            onClick={() => setActiveTab('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'qr' ? 'bg-accent text-white shadow-md' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
          >
            <QrCode size={16} /> QR Code
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="mb-10">
          
          {/* POSTS */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post._id} className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">{profileData.name}</h3>
                          <CheckCircle2 size={12} className="text-blue-500" />
                        </div>
                        <span className="text-xs text-gray-400 dark:text-slate-500 transition-colors">@{profileData.username}</span>
                      </div>
                    </div>
                    
                    {post.orbit === "HACK" || post.orbit === "Hackathons" ? (
                      <div className="bg-[#116d62] rounded-2xl p-6 text-center text-white mb-4">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-md text-xs font-black mb-4">HACK</span>
                        <p className="font-bold leading-relaxed text-sm">{post.caption}</p>
                      </div>
                    ) : (
                      <p className="text-gray-800 dark:text-slate-300 text-sm mb-4 transition-colors">{post.caption}</p>
                    )}

                    {post.image && <img src={post.image} className="rounded-xl mb-4 w-full object-cover" alt="post" />}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-slate-800 transition-colors">
                      <div className="flex items-center gap-4 text-gray-400 dark:text-slate-500">
                        <span className="flex items-center gap-1"><Heart size={16}/> {post.likes?.length || 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={16}/> {post.comments?.length || 0}</span>
                        <span className="flex items-center gap-1"><Share2 size={16}/></span>
                      </div>
                      <Bookmark size={16} className="text-gray-400 dark:text-slate-500 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
                  <div className="text-3xl mb-2">📭</div>
                  <h3 className="font-bold text-gray-700 dark:text-slate-300 transition-colors">No posts yet</h3>
                </div>
              )}
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === 'projects' && (
            <AnimatePresence mode="wait">
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {PROJECTS.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 transition-colors"
                  >
                    <div
                      className="h-1.5 w-full"
                      style={{ background: p.gradient }}
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                            style={{ background: p.gradient }}
                          >
                            {p.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-white transition-colors">
                              {p.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star
                                size={10}
                                className="text-amber-400 fill-amber-400"
                              />
                              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium transition-colors">
                                {p.stars} stars
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.a
                            href={p.github}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center transition-colors"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="text-gray-600 dark:text-slate-300"
                            >
                              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                          </motion.a>
                          <motion.a
                            href={p.live}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center bg-accent transition-colors"
                          >
                            <ExternalLink size={14} className="text-white" />
                          </motion.a>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-3 transition-colors">
                        {p.desc}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.tech.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-accent/10 text-accent transition-colors"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* QR CODE */}
          {activeTab === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 text-center transition-colors">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent transition-colors">
                    <QrCode size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200 transition-colors">
                    {profileData.name}'s QR
                  </span>
                </div>
                
                <div className="inline-block p-[3px] rounded-3xl mb-4 bg-accent transition-colors">
                  <div className="bg-white rounded-[22px] p-4">
                    {/* Make sure to use QRCodeCanvas here if you want it to be a real scannable QR code! */}
                    <QRCodeSVG />
                  </div>
                </div>

                {/* ── FIXED CLICKABLE LINK ── */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-1 transition-colors">
                    Scan or click to visit profile
                  </p>
                  <Link 
                    href={`/profile/${profileData?._id || userId}`}
                    className="text-sm font-bold text-accent hover:underline break-all transition-all block cursor-pointer"
                  >
                    {typeof window !== "undefined" ? window.location.host : "studyorbit.com"}/profile/{profileData?._id || userId}
                  </Link>
                </div>
                
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}