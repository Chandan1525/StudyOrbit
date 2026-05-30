"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Link2, Settings, 
  MoreVertical, BookOpen, Users, Grid, 
  Folder, QrCode, Heart, MessageSquare, Share2, Bookmark, CheckCircle2, FolderGit2, Star, ExternalLink, X, ChevronRight
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

// ── Dynamic Gradient Generator ──
const generateGradient = (name: string) => {
  const colors = [
    "linear-gradient(135deg,#ec4899,#f97316)",
    "linear-gradient(135deg,#3b82f6,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#8b5cf6,#ec4899)",
    "linear-gradient(135deg,#10b981,#3b82f6)",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

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

  // 🔥 NETWORK MODAL STATES
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkTab, setNetworkTab] = useState<"followers" | "following">("followers");

  useEffect(() => {
    let currentUser: any = null;
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token"); 

    if (stored) {
      currentUser = JSON.parse(stored);
      setLoggedInUser(currentUser);
    }

    const fetchData = async () => {
      try {
        const profileRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile/${userId}`);
        const data = profileRes.data.user;
        setProfileData(data);
        
        setFollowersCount(data.followers?.length || 0);
        
        if (currentUser && data.followers) {
          const amIFollowing = data.followers.some(
            (f: any) => f._id === currentUser.id || f._id === currentUser._id || f === currentUser.id
          );
          setIsFollowing(amIFollowing);
        }

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

  // 🔥 NETWORK LIST RENDERER (For Modal)
  const renderNetworkList = (list: any[]) => {
    if (!list || list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-slate-500">
          <Users size={40} className="mb-3 opacity-50" />
          <p className="text-sm font-bold">No users found</p>
        </div>
      );
    }
    return list.map((user: any, index: number) => (
      <div 
        key={user._id || user.id || index}
        onClick={() => {
          setShowNetworkModal(false);
          router.push(`/profile/${user._id || user.id}`);
        }}
        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
      >
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
          style={{ background: user.avatar ? "transparent" : generateGradient(user.name || "U") }}
        >
          {user.avatar ? (
            <img src={user.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
          ) : (
            (user.name || "U").substring(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
          <p className="text-xs font-medium text-accent truncate">@{user.username}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300 dark:text-slate-600" />
      </div>
    ));
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-accent font-bold transition-colors">Loading Space...</div>;
  }
  if (!profileData) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center font-bold text-gray-500 transition-colors">User not found</div>;
  }

  const currentUserId = loggedInUser?.id || loggedInUser?._id;
  const targetUserId = profileData?.id || profileData?._id;
  const isOwner = currentUserId && targetUserId && currentUserId === targetUserId;

  // 🔥 EXTRACT FOLLOWERS/FOLLOWING FOR DYNAMIC PREVIEW
  const actualFollowers = profileData?.followers || [];
  const actualFollowing = profileData?.following || [];

  const networkPreview = actualFollowers.slice(0, 5).map((f: any, index: number) => ({
    id: f._id || f.id || index,
    name: f.name || "User",
    avatar: f.avatar,
    initials: (f.name || "U").substring(0, 2).toUpperCase(),
    gradient: generateGradient(f.name || "User")
  }));

  return (
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
          <div 
            className="flex-1 text-center border-r border-gray-100 dark:border-slate-800 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"
            onClick={() => { setNetworkTab("followers"); setShowNetworkModal(true); }}
          >
            <div className="text-xl font-black text-gray-900 dark:text-white transition-colors">{followersCount}</div>
            <div className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1">Followers</div>
          </div>
          <div 
            className="flex-1 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-r-2xl"
            onClick={() => { setNetworkTab("following"); setShowNetworkModal(true); }}
          >
            <div className="text-xl font-black text-gray-900 dark:text-white transition-colors">{actualFollowing.length}</div>
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

        {/* ── DYNAMIC NETWORK CARD ── */}
        <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center transition-colors">
                <Users size={12} className="text-accent" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">Network</h3>
            </div>
            <button onClick={() => setShowNetworkModal(true)} className="text-xs font-bold text-accent transition-colors p-1 hover:opacity-80">See all &gt;</button>
          </div>
          <div className="flex items-center cursor-pointer group" onClick={() => setShowNetworkModal(true)}>
            {networkPreview.length > 0 ? (
              <>
                {networkPreview.map((n: any, i: number) => (
                  <motion.div
                    key={n.id}
                    whileHover={{ y: -3, scale: 1.1 }}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold -ml-3 first:ml-0 shadow-sm transition-colors overflow-hidden"
                    style={{ background: n.avatar ? "transparent" : n.gradient, zIndex: networkPreview.length - i }}
                  >
                    {n.avatar ? <img src={n.avatar} className="w-full h-full object-cover" alt="av" /> : n.initials}
                  </motion.div>
                ))}
                {actualFollowers.length > 5 && (
                  <span className="ml-3 text-xs font-semibold text-gray-400 dark:text-slate-500 transition-colors group-hover:text-accent">+{actualFollowers.length - 5} more</span>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">No connections yet.</p>
            )}
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

      {/* ── 🔥 NEW: NETWORK MODAL 🔥 ── */}
      <AnimatePresence>
        {showNetworkModal && (
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full md:max-w-md h-[75vh] md:h-[600px] bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Network</h2>
                <button 
                  onClick={() => setShowNetworkModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div className="flex border-b border-gray-100 dark:border-slate-800">
                <button 
                  onClick={() => setNetworkTab("followers")}
                  className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${networkTab === "followers" ? "border-accent text-accent" : "border-transparent text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
                >
                  Followers ({actualFollowers.length})
                </button>
                <button 
                  onClick={() => setNetworkTab("following")}
                  className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${networkTab === "following" ? "border-accent text-accent" : "border-transparent text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800/50"}`}
                >
                  Following ({actualFollowing.length})
                </button>
              </div>

              {/* Modal List */}
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={networkTab}
                    initial={{ opacity: 0, x: networkTab === "followers" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: networkTab === "followers" ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {networkTab === "followers" 
                      ? renderNetworkList(actualFollowers) 
                      : renderNetworkList(actualFollowing)
                    }
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}