"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import BottomNav from "@/components/BottomNav"; 


import {
  Settings,
  ArrowLeft,
  Grid3X3,
  FolderGit2,
  QrCode,
  MapPin,
  Link2,
  Heart,
  Star,
  ExternalLink,
  MoreVertical,
  Users,
  BookOpen,
  ChevronRight,
  Home,
  Search,
  Compass,
  MessageCircle,
  User,
  Bell,
  Zap,
  PlusSquare,
  Share2,
} from "lucide-react";

// ── Static Fallback Data ──────────────────────────────────────────────────
const FALLBACK_USER = {
  name: "Student",
  username: "student",
  avatar: "U",
  avatarGradient: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  coverGradient: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
  location: "Earth",
  website: "studyorbit.com",
  bio: "Welcome to my StudyOrbit profile! Open to new connections.",
  followers: 0,
  following: 0,
  skills: [],
  network: [
    { initials: "AV", gradient: "linear-gradient(135deg,#ec4899,#f97316)" },
    { initials: "RK", gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)" },
    { initials: "PS", gradient: "linear-gradient(135deg,#f59e0b,#ef4444)" },
    { initials: "MK", gradient: "linear-gradient(135deg,#8b5cf6,#ec4899)" },
    { initials: "AN", gradient: "linear-gradient(135deg,#10b981,#3b82f6)" },
  ],
};

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

// ── QR Code SVG ────────────────────────────────────────────────────────────
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

// ── Dynamic Post Grid Cell ─────────────────────────────────────────────────
function PostCell({ post }: { post: any }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const gradients = [
    "linear-gradient(135deg,#1e1b4b,#312e81)",
    "linear-gradient(135deg,#064e3b,#065f46)",
    "linear-gradient(135deg,#1e3a5f,#1e40af)",
    "linear-gradient(135deg,#4c1d95,#5b21b6)",
    "linear-gradient(135deg,#7c2d12,#9a3412)",
    "linear-gradient(135deg,#134e4a,#0f766e)",
  ];
  const hash = post.orbit ? post.orbit.length + (post.caption?.length || 0) : 0;
  const bg = post.image ? "transparent" : gradients[hash % gradients.length];

  // 🔥 FIXED CLICK HANDLING FOR SHARING
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 👈 Sabse important! Card navigation handler ko block karega
    e.preventDefault();

    if (typeof window !== "undefined") {
      const postUrl = `${window.location.origin}/post/${post._id}`;

      navigator.clipboard
        .writeText(postUrl)
        .then(() => {
          alert("🔗 Link copied to clipboard! Share it across your orbit.");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
          alert("Failed to copy link. Please try again!");
        });
    }
  };

  return (
    <motion.div
      onClick={() => router.push(`/post/${post._id}`)}
      className="relative rounded-2xl overflow-hidden cursor-pointer aspect-video bg-gray-900 shadow-sm border border-gray-100 dark:border-slate-800 group"
      style={{ background: bg }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {post.image ? (
        <>
          <img
            src={post.image}
            alt={post.orbit}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 pointer-events-none">
            <span className="text-[9px] font-black text-white bg-accent/90 px-2 py-0.5 rounded max-w-fit mb-1 backdrop-blur-sm uppercase tracking-wide transition-colors">
              {post.orbit || "POST"}
            </span>
            <p className="text-white text-[11px] font-medium line-clamp-2 drop-shadow-md leading-snug">
              {post.caption}
            </p>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-white text-[10px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-md mb-3 backdrop-blur-md">
            {post.orbit || "POST"}
          </span>
          <p className="text-white text-xs md:text-sm font-bold leading-relaxed opacity-95 line-clamp-4">
            {post.caption}
          </p>
        </div>
      )}

      {/* Hover Overlay for Likes & Share Buttons */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center gap-3 z-10"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
            }}
          >
            {/* Likes Badge */}
            <div className="flex items-center gap-1.5 text-white text-sm font-bold bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
              <Heart size={15} fill="white" className="text-white" />
              {post.likes?.length || 0}
            </div>

            {/* 🔥 NEAT & CLICKABLE SHARE BUTTON */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareClick} // 👈 Sahi event bind ho gaya
              className="flex items-center justify-center p-2.5 rounded-full bg-accent text-white shadow-lg transition-all border border-white/20 relative z-30 cursor-pointer"
            >
              <Share2 size={15} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Profile Page ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  // Dynamic State
  const [activeTab, setActiveTab] = useState<"posts" | "projects" | "qr">(
    "posts",
  );
  const [following, setFollowing] = useState(false);
  const [navTab, setNavTab] = useState("profile");

  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);

  // 🔥 NAYA STATE: Unread Notification Count ke liye
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔥 FETCH LOGIC: Updated to pull LIVE data from Backend 🔥
  useEffect(() => {
    const fetchMyProfileAndPosts = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/auth/login");
          return;
        }

        const me = JSON.parse(storedUser);
        const userId = me.id || me._id;

        // 1. Fetch FRESH Profile Data (for exact followers/following)
        const profileRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile/${userId}`,
        );
        const freshData = profileRes.data.user;
        setProfileUser(freshData);

        // 2. Fetch Posts
        // 2. Fetch Posts (🔥 FIX: URL Change ki, POSTS wale route par bheja)
        const token = localStorage.getItem("token");
        const postsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/posts/user/${userId}`, 
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setPosts(postsRes.data);

        // 🔥 3. Fetch Unread Notifications Count
        if (token) {
          try {
            const notifRes = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/notifications`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const unread = notifRes.data.filter((n: any) => !n.read).length;
            setUnreadCount(unread);
          } catch (err) {
            console.error("Error fetching notification count", err);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfileAndPosts();
  }, [router]);

  // 🔥 MERGE DYNAMIC USER DATA FROM FRESH DB FETCH
  const USER = {
    ...FALLBACK_USER,
    name: profileUser?.name || FALLBACK_USER.name,
    username: profileUser?.username
      ? `@${profileUser.username}`
      : `@${FALLBACK_USER.username}`,
    avatar: profileUser?.avatar || "",
    location: profileUser?.location || FALLBACK_USER.location,
    bio: profileUser?.bio || profileUser?.about || FALLBACK_USER.bio,
    website: profileUser?.website || FALLBACK_USER.website,
    coverGradient: profileUser?.coverGradient || FALLBACK_USER.coverGradient,
    skills: profileUser?.skills?.length
      ? profileUser.skills
      : FALLBACK_USER.skills,
    posts: (posts?.length || 0).toString(),
    followers: profileUser?.followers?.length || 0,
    following: profileUser?.following || 0,
  };

  // Skill colors mapping for dynamic arrays
  const getSkillColors = (index: number) => {
    const colors = [
      { color: "#06b6d4", bg: "#ecfeff" },
      { color: "#16a34a", bg: "#f0fdf4" },
      { color: "#7c3aed", bg: "#f5f3ff" },
      { color: "#d97706", bg: "#fffbeb" },
      { color: "#059669", bg: "#ecfdf5" },
      { color: "#2563eb", bg: "#eff6ff" },
    ];
    return colors[index % colors.length];
  };

  const NAV = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "explore", icon: Compass, label: "Explore" },
    { id: "chats", icon: MessageCircle, label: "Chats" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent dark:bg-slate-950 flex items-center justify-center text-accent font-bold transition-colors">
        Loading Space...
      </div>
    );
  }

  return (
    // 🔥 DARK MODE/ACCENT WRAPPER 🔥
    <div
      className="min-h-screen flex flex-col bg-transparent dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300"
      style={{
        fontFamily: "-apple-system,'SF Pro Display',sans-serif",
      }}
    >
      {/* ── Cover + Top Bar ── */}
      <div className="relative">
        <div
          className="h-44 w-full relative overflow-hidden"
          style={{ background: USER.coverGradient }}
        >
          <motion.div
            className="absolute rounded-full opacity-30"
            style={{
              width: 180,
              height: 180,
              top: -40,
              left: -40,
              background: "radial-gradient(circle,#8b5cf6,transparent)",
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute rounded-full opacity-20"
            style={{
              width: 140,
              height: 140,
              bottom: -30,
              right: -20,
              background: "radial-gradient(circle,#ec4899,transparent)",
            }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            <ArrowLeft size={16} className="text-white" />
          </motion.button>
          <div className="flex gap-2">
            <Link href="/create">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-accent/30 bg-accent"
              >
                <PlusSquare size={16} className="text-white" />
              </motion.div>
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push("/notifications")}
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Bell size={16} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#1e1b4b] rounded-full"></span>
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push("/settings")}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition shadow-sm"
              style={{
                background: "rgba(0,0,0,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Settings size={20} className="text-white" />
            </motion.button>
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: -44 }}
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-[3px] bg-accent">
              {USER.avatar ? (
                <img
                  src={USER.avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900"
                />
              ) : (
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-black bg-gray-900"
                  style={{ background: FALLBACK_USER.avatarGradient }}
                >
                  {USER.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950"
              style={{ background: "#22c55e" }}
            />
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ paddingTop: 52 }}>
        <div className="text-center px-5 mb-4">
          <h1 className="text-xl font-black text-gray-900 dark:text-white transition-colors">
            {USER.name}
          </h1>
          <p className="text-sm font-medium mt-0.5 text-accent transition-colors">
            {USER.username}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
            {USER.location && (
              <>
                <MapPin
                  size={12}
                  className="text-gray-400 dark:text-slate-500"
                />
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {USER.location}
                </span>
                <span className="text-gray-300 dark:text-slate-600 mx-1">
                  ·
                </span>
              </>
            )}
            {USER.website && (
              <>
                <Link2
                  size={12}
                  className="text-gray-400 dark:text-slate-500"
                />
                <span className="text-xs text-accent">
                  {USER.website.replace(/^https?:\/\//, "")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="flex items-center justify-center gap-0 mb-5 mx-5">
          {[
            { label: "Posts", value: USER.posts },
            { label: "Followers", value: USER.followers },
            { label: "Following", value: USER.following },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 text-center py-3 ${i !== 2 ? "border-r border-gray-100 dark:border-slate-800" : ""} bg-white dark:bg-slate-900 transition-colors duration-300`}
              style={{
                borderRadius:
                  i === 0 ? "16px 0 0 16px" : i === 2 ? "0 16px 16px 0" : "0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div className="text-lg font-black text-gray-900 dark:text-white transition-colors duration-300">
                {s.value}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider transition-colors duration-300">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Enhance Profile Button ── */}
        <div className="px-5 mb-5 w-full">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/settings/edit-profile")}
            className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-accent text-white shadow-lg shadow-accent/30"
          >
            Enhance your profile ✨
          </motion.button>
        </div>

        {/* ── Skills ── */}
        {USER.skills.length > 0 && (
          <div className="px-5 mb-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-gray-50 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent transition-colors">
                  <Zap size={12} className="text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200 transition-colors">
                  Skills & Interests
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {USER.skills.map((skill: any, idx: number) => {
                  const style =
                    typeof skill === "string" ? getSkillColors(idx) : skill;
                  const label = typeof skill === "string" ? skill : skill.label;
                  return (
                    <span
                      key={label}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ color: style.color, background: style.bg }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── About ── */}
        {USER.bio && (
          <div className="px-5 mb-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-gray-50 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent transition-colors">
                  <BookOpen size={12} className="text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200 transition-colors">
                  About
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap transition-colors">
                {USER.bio}
              </p>
            </div>
          </div>
        )}

        {/* ── Network ── */}
        <div className="px-5 mb-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-gray-50 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent transition-colors">
                  <Users size={12} className="text-white" />
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200 transition-colors">
                  Network
                </span>
              </div>
              <button className="text-xs font-semibold flex items-center gap-0.5 text-accent transition-colors">
                See all <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {USER.network.map((n: any, i: number) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900 shadow-sm cursor-pointer transition-colors"
                  style={{
                    background: n.gradient,
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: USER.network.length - i,
                  }}
                >
                  {n.initials}
                </motion.div>
              ))}
              <div className="ml-2 text-xs text-gray-500 dark:text-slate-500 font-medium transition-colors">
                +
                {Math.max(
                  0,
                  parseInt(USER.following || "0") - USER.network.length,
                )}{" "}
                more
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs List ── */}
        <div className="px-5 mb-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 flex shadow-sm border border-gray-50 dark:border-slate-800 transition-colors">
            {[
              { id: "posts", icon: Grid3X3, label: "Posts" },
              { id: "projects", icon: FolderGit2, label: "Projects" },
              { id: "qr", icon: QrCode, label: "QR Code" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={{
                  background:
                    activeTab === tab.id
                      ? "var(--accent-color)"
                      : "transparent",
                  color: activeTab === tab.id ? "white" : "#9ca3af",
                  boxShadow:
                    activeTab === tab.id
                      ? "0 4px 12px var(--accent-color)"
                      : "none",
                }}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Posts Tab ── */}
          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="px-5"
            >
              {posts.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(showAllPosts ? posts : posts.slice(0, 4)).map(
                      (post, i) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <PostCell post={post} />
                        </motion.div>
                      ),
                    )}
                  </div>
                  {posts.length > 4 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAllPosts(!showAllPosts)}
                      className={`w-full py-3 mt-2 mb-4 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${showAllPosts ? "bg-transparent text-gray-500 border-gray-200 dark:border-slate-700 dark:text-slate-400" : "bg-accent/10 text-accent border-accent/20"}`}
                    >
                      {showAllPosts ? "Show Less" : `View all posts`}
                    </motion.button>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-gray-50 dark:border-slate-800 shadow-sm transition-colors">
                  <p className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-3 transition-colors">
                    No posts yet!
                  </p>
                  <Link href="/create">
                    <button className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-accent hover:opacity-90 shadow-lg shadow-accent/20 transition-colors">
                      Create First Post
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Projects Tab ── */}
          {activeTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="px-5 flex flex-col gap-4"
            >
              {PROJECTS.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-gray-50 dark:border-slate-800 transition-colors"
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
          )}

          {/* ── QR Tab ── */}
          {/* ── QR Tab ── */}
          {activeTab === "qr" && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="px-5"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-50 dark:border-slate-800 text-center transition-colors">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-accent">
                    <QrCode size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
                    My StudyOrbit QR
                  </span>
                </div>

                {/* ── Real QR Code ── */}
                <div className="inline-block p-[3px] rounded-3xl mb-4 bg-accent">
                  <div className="bg-white rounded-[22px] p-4">
                    <QRCodeCanvas
                      value={`${typeof window !== "undefined" ? window.location.origin : "https://studyorbit.com"}/profile/${profileUser?._id || profileUser?.id || ""}`}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#1a1a2e"
                      level="H"
                      imageSettings={{
                        src: "/logo.png",
                        height: 36,
                        width: 36,
                        excavate: true,
                      }}
                    />
                  </div>
                </div>

                {/* ── FIXED CLICKABLE LINK USING _ID ── */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">
                    Scan or click to visit profile
                  </p>
                  <Link
                    href={`/profile/${profileUser?._id || profileUser?.id}`}
                    className="text-sm font-bold text-accent hover:underline break-all transition-all block cursor-pointer"
                  >
                    {typeof window !== "undefined"
                      ? window.location.host
                      : "studyorbit.com"}
                    /profile/{profileUser?._id || profileUser?.id}
                  </Link>
                </div>

                {/* Profile card */}
                <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-2xl mb-5 bg-gray-50 dark:bg-slate-800">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: FALLBACK_USER.avatarGradient }}
                  >
                    {profileUser?.avatar ? (
                      <img
                        src={profileUser.avatar}
                        className="w-full h-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-black">
                        {USER.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {USER.name}
                    </p>
                    <p className="text-xs text-accent">{USER.username}</p>
                  </div>
                </div>

                {/* ── Share button (FIXED TO USE _ID) ── */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    const profileUrl = `${window.location.origin}/profile/${profileUser?._id || profileUser?.id}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `${USER.name} on StudyOrbit`,
                          text: `Check out ${USER.name}'s profile on StudyOrbit!`,
                          url: profileUrl,
                        });
                      } catch {}
                    } else {
                      try {
                        await navigator.clipboard.writeText(profileUrl);
                        alert("✅ Profile link copied to clipboard!");
                      } catch {
                        alert("Profile URL: " + profileUrl);
                      }
                    }
                  }}
                  className="w-full py-3 rounded-2xl text-sm font-bold text-white bg-accent shadow-lg shadow-accent/30 flex items-center justify-center gap-2"
                >
                  <Share2 size={15} />
                  Share Profile
                </motion.button>

                {/* Copy link separately (FIXED TO USE _ID) */}
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/profile/${profileUser?._id || profileUser?.id}`;
                    await navigator.clipboard.writeText(url);
                    alert("✅ Link copied!");
                  }}
                  className="w-full mt-2 py-2.5 rounded-2xl text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
                >
                  📋 Copy link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="h-6" />
      </div>

      {/* ── Bottom nav ── */}
      <BottomNav />
    </div>
  );
}