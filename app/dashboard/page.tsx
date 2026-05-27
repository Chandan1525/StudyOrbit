"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

import {
  Home,
  Search,
  MessageCircle,
  User,
  Bell,
  Heart,
  Users,
  MessageSquare,
  Share2,
  Bookmark,
  Globe,
  Smartphone,
  Brain,
  Code2,
  Sliders,
  MoreVertical,
  CheckCircle2,
  PlayCircle,
  Zap,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Send,
  X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ── Auth header helper ────────────────────────────────────────
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Data ──────────────────────────────────────────────────────
const COMMUNITIES = [
  {
    id: 1,
    tag: "WEB",
    name: "Web Dev",
    members: "12.5K",
    icon: Globe,
    live: true,
    bg: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  },
  {
    id: 2,
    tag: "APP",
    name: "App Dev",
    members: "8.3K",
    icon: Smartphone,
    live: false,
    bg: "linear-gradient(135deg,#0284c7,#3b82f6)",
  },
  {
    id: 3,
    tag: "ML",
    name: "ML Space",
    members: "15.7K",
    icon: Brain,
    live: true,
    bg: "linear-gradient(135deg,#059669,#10b981)",
  },
  {
    id: 4,
    tag: "DSA",
    name: "Algorithms",
    members: "9.1K",
    icon: Code2,
    live: false,
    bg: "linear-gradient(135deg,#db2777,#f43f5e)",
  },
];

const TOPICS = [
  {
    label: "All",
    icon: "🌍",
    gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
    endpoint: "ALL",
  },
  {
    label: "AI & ML",
    icon: "🤖",
    gradient: "linear-gradient(135deg,#5b21b6,#7c3aed)",
    endpoint: "ML",
  },
  {
    label: "Web3",
    icon: "🌐",
    gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
    endpoint: "WEB",
  },
  {
    label: "Mobile",
    icon: "📱",
    gradient: "linear-gradient(135deg,#0284c7,#0ea5e9)",
    endpoint: "APP",
  },
  {
    label: "Cloud",
    icon: "☁️",
    gradient: "linear-gradient(135deg,#059669,#10b981)",
    endpoint: "CLOUD",
  },
  {
    label: "Hackathons",
    icon: "🏆",
    gradient: "linear-gradient(135deg,#7c3aed,#a855f7)",
    endpoint: "HACK",
  },
  {
    label: "DSA",
    icon: "💻",
    gradient: "linear-gradient(135deg,#db2777,#f43f5e)",
    endpoint: "DSA",
  },
];

// ── Skeleton ──────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[30px] p-5 border border-gray-100 dark:border-slate-800 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-800" />
        <div className="flex-1">
          <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-full w-32 mb-2" />
          <div className="h-2.5 bg-gray-100 dark:bg-slate-800/50 rounded-full w-20" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded-full w-full" />
        <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded-full w-4/5" />
      </div>
      <div className="flex gap-6 mt-4">
        <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded-full w-12" />
        <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded-full w-12" />
        <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded-full w-12" />
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center bg-white dark:bg-slate-900 rounded-[30px] border border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
        {message.includes("connect") ? (
          <WifiOff size={28} className="text-red-400 dark:text-red-500" />
        ) : (
          <AlertCircle size={28} className="text-red-400 dark:text-red-500" />
        )}
      </div>
      <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-2">
        {message.includes("connect")
          ? "Can't reach server"
          : "Something went wrong"}
      </h3>
      <p className="text-sm text-gray-400 dark:text-slate-400 mb-5 leading-relaxed max-w-xs">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent text-white text-sm font-semibold shadow-lg transition-transform active:scale-95"
      >
        <RefreshCw size={15} /> Try again
      </button>
    </div>
  );
}

// ── Comment section ───────────────────────────────────────────
function CommentSection({
  post,
  currentUser,
}: {
  post: any;
  currentUser: any;
}) {
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const submitComment = async () => {
    if (!text.trim() || isPosting) return;
    setIsPosting(true);

    const temp = {
      _id: "temp_" + Date.now(),
      text: text.trim(),
      user: currentUser,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, temp]);
    setText("");

    try {
      const res = await axios.post(
        `${API}/api/posts/${post._id}/comments`,
        { text: text.trim() },
        { headers: authHeader() },
      );
      const newComment = res.data?.comment || temp;
      setComments((prev) =>
        prev.map((c) => (c._id === temp._id ? newComment : c)),
      );
    } catch {
      setComments((prev) => prev.filter((c) => c._id !== temp._id));
      alert("Failed to post comment. Try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800">
      {comments.length > 0 && (
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {comments.map((c: any) => (
            <div key={c._id} className="flex gap-2.5">
              <img
                src={
                  c.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || "U")}&background=6366f1&color=fff&size=32`
                }
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=32`;
                }}
              />
              <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-2xl px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                    {c.user?.name || c.user?.username || "Student"}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : ""}
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2.5 items-center">
        <img
          src={
            currentUser?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "U")}&background=6366f1&color=fff&size=32`
          }
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=32`;
          }}
        />
        <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 rounded-2xl px-3 py-2 border border-gray-100 dark:border-slate-700 focus-within:border-accent transition-colors">
          <input
            type="text"
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitComment()}
            className="flex-1 bg-transparent text-xs outline-none text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
          />
          <button
            onClick={submitComment}
            disabled={!text.trim() || isPosting}
            className="text-accent disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post card ─────────────────────────────────────────────────
function PostCard({ post, currentUser }: { post: any; currentUser: any }) {
  const userId = currentUser?._id || currentUser?.id || "";

  const [liked, setLiked] = useState(
    () =>
      post.likes?.some((id: any) => id === userId || id?._id === userId) ??
      false,
  );
  const [likesCount, setLikesCount] = useState(() => post.likes?.length ?? 0);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const getTagColors = (orbit: string) => {
    switch (orbit?.toUpperCase()) {
      case "WEB":
        return { color: "#059669", bg: "#d1fae5" };
      case "ML":
      case "AI":
        return { color: "#7c3aed", bg: "#f3e8ff" };
      case "APP":
        return { color: "#0284c7", bg: "#e0f2fe" };
      case "DSA":
        return { color: "#db2777", bg: "#fce7f3" };
      default:
        return { color: "var(--accent-color)", bg: "color-mix(in srgb, var(--accent-color) 15%, transparent)" };
    }
  };
  const colors = getTagColors(post.orbit);

  const handleLike = async () => {
    if (!userId) return alert("Please login to like posts");

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((l: number) => (wasLiked ? l - 1 : l + 1));

    try {
      const res = await axios.put(
        `${API}/api/posts/like/${post._id}`,
        {},
        { headers: authHeader() },
      );

      if (res.data && res.data.likes) {
        setLikesCount(res.data.likes.length);
        const userHasLiked = res.data.likes.some(
          (id: any) => id === userId || id?._id === userId,
        );
        setLiked(userHasLiked);
      }
    } catch (err) {
      console.error("Like error:", err);
      setLiked(wasLiked);
      setLikesCount((l: number) => (wasLiked ? l + 1 : l - 1));
    }
  };

  const handleDashboardShare = () => {
    if (typeof window !== "undefined") {
      const postLink = `${window.location.origin}/post/${post._id}`;

      navigator.clipboard
        .writeText(postLink)
        .then(() => {
          alert("🔗 Link copied to clipboard! Share it in your orbit.");
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
          alert("Could not copy link. Please try again.");
        });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[30px] p-5 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link
          href={`/profile/${post.author?._id}`}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img
            src={
              post.author?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "U")}&background=6366f1&color=fff`
            }
            alt=""
            className="w-12 h-12 rounded-full object-cover group-hover:ring-2 ring-accent transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff`;
            }}
          />
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-gray-900 dark:text-slate-100 group-hover:text-accent transition-colors">
                {post.author?.name || post.author?.username || "Student"}
              </h3>
              <CheckCircle2 size={14} className="text-blue-500" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 dark:text-slate-500">
                @{post.author?.username || "user"}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700" />
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
            </div>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1">
          <MoreVertical size={17} />
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {post.orbit && (
          <span
            className="inline-flex px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ color: colors.color, background: colors.bg }}
          >
            {post.orbit}
          </span>
        )}
        <p className="text-gray-800 dark:text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">
          {post.caption}
        </p>
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.hashtags.map((tag: string, idx: number) => (
              <span key={idx} className="text-accent text-xs font-semibold">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="mt-4 rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
          <img
            src={post.image}
            alt="post"
            className="w-full h-auto max-h-[500px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50 dark:border-slate-800">
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-all ${liked ? "text-rose-500 scale-110" : "text-gray-400 dark:text-slate-500 hover:text-rose-400 dark:hover:text-rose-400"}`}
          >
            <Heart
              size={19}
              fill={liked ? "#f43f5e" : "none"}
              strokeWidth={liked ? 0 : 2}
            />
            <span className="text-sm font-semibold">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments((v) => !v)}
            className={`flex items-center gap-1.5 transition-colors ${showComments ? "text-accent" : "text-gray-400 dark:text-slate-500 hover:text-accent"}`}
          >
            <MessageSquare size={19} />
            <span className="text-sm font-semibold">
              {post.comments?.length ?? 0}
            </span>
          </button>

          <button
            onClick={handleDashboardShare}
            className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500 hover:text-green-500 transition-colors active:scale-95 cursor-pointer"
          >
            <Share2 size={19} />
            <span className="text-sm font-semibold">{post.shares ?? 0}</span>
          </button>
        </div>

        <button
          onClick={() => setSaved((v) => !v)}
          className={`transition-colors ${saved ? "text-accent" : "text-gray-400 dark:text-slate-500 hover:text-accent"}`}
        >
          <Bookmark size={19} fill={saved ? "var(--accent-color)" : "none"} />
        </button>
      </div>

      {showComments && <CommentSection post={post} currentUser={currentUser} />}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("home");
  const [activeInterest, setActiveInterest] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const unread = res.data.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notification count", error);
      }
    };

    fetchUnreadNotifications();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setFetchError("");

      let url = `${API}/api/posts/feed`;
      if (searchQuery.trim().length > 2) {
        url = `${API}/api/posts/search?q=${encodeURIComponent(searchQuery.trim())}`;
      } else if (activeInterest !== "All") {
        const t = TOPICS.find((t) => t.label === activeInterest);
        if (t) url = `${API}/api/posts/topic/${t.endpoint}`;
      }

      try {
        const res = await axios.get(url, {
          headers: authHeader(),
          timeout: 30000,
        });
        let data: any[] = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (Array.isArray(res.data?.posts)) data = res.data.posts;
        else if (Array.isArray(res.data?.data)) data = res.data.data;
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setPosts(data);
      } catch (err: any) {
        if (
          err.code === "ECONNREFUSED" ||
          err.message?.includes("Network Error")
        ) {
          setFetchError(
            "Cannot connect to server. Make sure your backend is running on port 5000.",
          );
        } else if (err.response?.status === 401) {
          setFetchError("Session expired. Please login again.");
          setTimeout(() => router.push("/auth/login"), 2000);
        } else if (err.response?.status === 404) {
          setFetchError(
            `API route not found: ${url} — check your postRoutes.js`,
          );
        } else {
          setFetchError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load posts.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    const t = setTimeout(fetchPosts, searchQuery ? 400 : 0);
    return () => clearTimeout(t);
  }, [activeInterest, searchQuery, retryCount, router]);

  const handleNav = (id: string) => {
    setActiveTab(id);
    const routes: Record<string, string> = {
      home: "/dashboard",
      search: "/search",
      community: "/community",
      chats: "/messages",
      profile: "/profile",
    };
    if (routes[id]) router.push(routes[id]);
  };

  const NAV = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "community", icon: Users, label: "Community" },
    { id: "chats", icon: MessageCircle, label: "Chats" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    // 🌟 ADDED `dark:` mode classes and transitions to main container
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-24">
      
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          {/* 🌟 Dynamic Accent Background */}
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg transition-colors">
            <Zap size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">StudyOrbit</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => router.push("/notifications")}
              className="relative p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            >
              <Bell size={20} className="text-gray-700 dark:text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          <Link href="/profile">
            <img
              src={
                currentUser?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "U")}&background=6366f1&color=fff`
              }
              alt="profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-accent cursor-pointer transition-all"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff`;
              }}
            />
          </Link>
        </div>
      </div>

      {/* Communities */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-gray-900 dark:text-white transition-colors">Your Orbits</h2>
          <button className="text-accent font-bold text-sm transition-colors">
            View all
          </button>
        </div>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {COMMUNITIES.map((c) => (
            <div
              key={c.id}
              className="flex-shrink-0 w-[150px] h-[180px] rounded-[32px] p-5 relative overflow-hidden cursor-pointer active:scale-[0.97] transition-transform shadow-sm"
              style={{ background: c.bg }}
            >
              <div className="absolute -top-5 -right-5 w-28 h-28 bg-white/10 rounded-full" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xl flex items-center justify-center">
                    <c.icon size={22} className="text-white" />
                  </div>
                  {c.live && (
                    <div className="px-2 py-1 rounded-full bg-black/20 text-[10px] text-white font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-white text-[32px] font-black leading-none">
                    {c.tag}
                  </h3>
                  <p className="text-white/90 mt-2 font-semibold text-sm">
                    {c.name}
                  </p>
                  <div className="text-white/70 text-xs mt-3 flex items-center gap-1">
                    <User size={11} /> {c.members}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center gap-3 px-4 py-3.5 shadow-sm transition-colors">
            <Search size={18} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search posts, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
          {/* 🌟 Dynamic Accent Button */}
          <button className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg transition-colors">
            <Sliders size={18} />
          </button>
        </div>
      </div>

      {/* Topics */}
      <div className="px-5 mt-8">
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 transition-colors">
          Discover Topics
        </h2>
        <div
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none" }}
        >
          {TOPICS.map((item) => {
            const active = activeInterest === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveInterest(item.label)}
                className="flex-shrink-0 w-[145px] h-[165px] rounded-[30px] p-5 relative overflow-hidden text-left active:scale-95 transition-transform"
                style={{ background: item.gradient }}
              >
                <div className="absolute -top-5 -right-5 w-28 h-28 bg-white/10 rounded-full" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-black">
                      {item.label}
                    </h3>
                    {active && (
                      <div className="mt-2 px-2.5 py-1 bg-black/20 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />{" "}
                        Active
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div className="px-5 mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle size={20} className="text-accent transition-colors" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white transition-colors">
              {searchQuery ? `Results for "${searchQuery}"` : "Trending Now"}
            </h2>
          </div>
          {!isLoading && !fetchError && (
            <span className="text-xs text-gray-400 dark:text-slate-400 font-medium bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md transition-colors">
              {posts.length} posts
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-5">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : fetchError ? (
          <ErrorState
            message={fetchError}
            onRetry={() => setRetryCount((c) => c + 1)}
          />
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} currentUser={currentUser} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white dark:bg-slate-900 rounded-[30px] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-1">No posts yet</h3>
            <p className="text-sm text-gray-400 dark:text-slate-500">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "Be the first to post in this topic!"}
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-r from-[#0f172a]/95 via-[#111827]/95 to-[#1e1b4b]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
          {NAV.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-300"
              >
                {active && (
                  <div className="absolute inset-0 rounded-2xl bg-accent opacity-15" />
                )}
                <div className="relative z-10">
                  <item.icon
                    size={22}
                    className="transition-all duration-300"
                    style={{ color: active ? "var(--accent-color)" : "rgba(255,255,255,0.4)" }}
                  />
                  {(item as any).badge && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {(item as any).badge}
                    </span>
                  )}
                </div>
                <span
                  className="relative z-10 text-[11px] font-semibold transition-colors duration-300"
                  style={{ color: active ? "var(--accent-color)" : "rgba(255,255,255,0.4)" }}
                >
                  {item.label}
                </span>
                {active && (
                  <div 
                    className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-accent" 
                    style={{ boxShadow: "0 0 10px var(--accent-color)" }} 
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}