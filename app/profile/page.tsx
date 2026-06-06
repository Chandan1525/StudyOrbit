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
  Bookmark,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

// ── Custom Github & Linkedin Icons (Fix for lucide-react issue) ──
const GithubIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

const LinkedinIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// ── Static Fallback Data ──────────────────────────────────────────────────
const FALLBACK_USER = {
  name: "Student",
  username: "student",
  avatar: "",
  avatarGradient: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
  coverGradient: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
  location: "Earth",
  website: "studyorbit.com",
  bio: "Welcome to my StudyOrbit profile! Open to new connections.",
  followers: 0,
  following: 0,
  skills: [],
};

// ── Dynamic Gradient Generator ─────────────────────────────────────────────
const generateGradient = (name: string) => {
  const colors = [
    "linear-gradient(135deg,#ec4899,#f97316)",
    "linear-gradient(135deg,#3b82f6,#06b6d4)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#8b5cf6,#ec4899)",
    "linear-gradient(135deg,#10b981,#3b82f6)",
  ];
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// ── Dynamic Post Grid Cell (UPDATED WITH DELETE OPTION) ────────────────────
function PostCell({ post, isOwner, onDelete }: { post: any, isOwner?: boolean, onDelete?: (id: string) => void }) {
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

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

      {/* Hover Overlay for Likes, Share & Delete Buttons */}
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
            <div className="flex items-center gap-1.5 text-white text-sm font-bold bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
              <Heart size={15} fill="white" className="text-white" />
              {post.likes?.length || 0}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareClick}
              className="flex items-center justify-center p-2.5 rounded-full bg-accent text-white shadow-lg transition-all border border-white/20 relative z-30 cursor-pointer"
            >
              <Share2 size={15} />
            </motion.button>

            {/* 🔥 DELETE BUTTON FOR POSTS 🔥 */}
            {isOwner && onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(post._id);
                }}
                className="flex items-center justify-center p-2.5 rounded-full bg-red-500 text-white shadow-lg transition-all border border-white/20 relative z-30 cursor-pointer hover:bg-red-600"
                title="Delete Post"
              >
                <Trash2 size={15} />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Profile Page ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"posts" | "projects" | "qr" | "saved">("posts");
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🔥 NETWORK MODAL STATES
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkTab, setNetworkTab] = useState<"followers" | "following">("followers");

  // 🔥 PROJECT EDIT/DELETE STATES
  const [editingProject, setEditingProject] = useState<any>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

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
        setLoggedInUserId(userId);
        const token = localStorage.getItem("token");

        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        // 🔥 1. SETUP ALL PROMISES FOR PARALLEL FETCHING 🔥
        const profilePromise = axios.get(`${baseUrl}/api/users/profile/${userId}`);
        
        const postsPromise = axios.get(`${baseUrl}/api/posts/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(err => {
          console.warn("Could not fetch user posts");
          return { data: [] };
        });

        let notifPromise = Promise.resolve({ data: [] });
        let savedPromise = Promise.resolve({ data: [] });

        if (token) {
          notifPromise = axios.get(`${baseUrl}/api/notifications`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }).catch(err => {
            console.warn("Could not fetch notifications");
            return { data: [] };
          });

          savedPromise = axios.get(`${baseUrl}/api/posts/saved`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }).catch(err => {
            console.warn("Could not fetch saved posts");
            return { data: [] };
          });
        }

        // 🔥 2. FIRE ALL PROMISES AT ONCE 🔥
        const [profileRes, postsRes, notifRes, savedRes] = await Promise.all([
          profilePromise,
          postsPromise,
          notifPromise,
          savedPromise
        ]);

        // 🔥 3. SET ALL DATA 🔥
        setProfileUser(profileRes.data.user);
        setPosts(postsRes.data || []);

        if (token) {
          const unread = (notifRes.data || []).filter((n: any) => !n.read).length;
          setUnreadCount(unread);
          setSavedPosts(savedRes.data || []);
        }

      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfileAndPosts();
  }, [router]);

  // 🔥 HANDLE POST DELETE
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/posts/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // UI se turant hata do
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      alert("✅ Post deleted successfully!");
    } catch (error) {
      console.error("Failed to delete post", error);
      alert("Error deleting post.");
    }
  };

  // 🔥 HANDLE PROJECT DELETE
  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/project/${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileUser((prev: any) => ({
        ...prev,
        projects: prev.projects.filter((p: any) => p._id !== projectId)
      }));
    } catch (error) {
      console.error("Failed to delete project", error);
      alert("Error deleting project.");
    }
  };

  // 🔥 HANDLE PROJECT EDIT
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/project/${editingProject._id}`,
        {
          name: editingProject.name,
          desc: editingProject.desc,
          tech: typeof editingProject.tech === 'string' ? editingProject.tech : editingProject.tech.join(', '),
          github: editingProject.github,
          live: editingProject.live
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProfileUser((prev: any) => ({
        ...prev,
        projects: prev.projects.map((p: any) => p._id === editingProject._id ? res.data.project : p)
      }));
      setEditingProject(null);
      alert("✅ Project updated!");
    } catch (error) {
      console.error("Failed to update project", error);
    }
  };

  // Derived user values
  const actualFollowers = profileUser?.followers || [];
  const actualFollowing = profileUser?.following || [];

  const networkPreview = actualFollowers
    .slice(0, 5)
    .map((f: any, index: number) => ({
      id: f._id || f.id || (typeof f === "string" ? f : index),
      name: f.name || "User",
      avatar: f.avatar,
      initials: (f.name || "U").substring(0, 2).toUpperCase(),
      gradient: generateGradient(f.name || "User"),
    }));

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
    github: profileUser?.github || "",     
    linkedin: profileUser?.linkedin || "", 
    coverGradient: profileUser?.coverGradient || FALLBACK_USER.coverGradient,
    skills: profileUser?.skills?.length
      ? profileUser.skills
      : FALLBACK_USER.skills,
    posts: (posts?.length || 0).toString(),
    followers: actualFollowers.length,
    following: actualFollowing.length,
  };

  // PROFILE OWNER CHECK (Safe check ensuring it matches actual login)
  const isOwner = Boolean(loggedInUserId && (loggedInUserId === profileUser?._id || loggedInUserId === profileUser?.id));

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
    return list.map((user: any) => (
      <div
        key={user._id || user.id}
        onClick={() => router.push(`/profile/${user._id || user.id}`)}
        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
          style={{
            background: user.avatar
              ? "transparent"
              : generateGradient(user.name || "U"),
          }}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              className="w-full h-full object-cover rounded-full"
              alt="avatar"
            />
          ) : (
            (user.name || "U").substring(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {user.name}
          </p>
          <p className="text-xs font-medium text-accent truncate">
            @{user.username}
          </p>
        </div>
        <ChevronRight size={16} className="text-gray-300 dark:text-slate-600" />
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent dark:bg-slate-950 flex items-center justify-center text-accent font-bold transition-colors">
        Loading Space...
      </div>
    );
  }

  return (
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
          
          {/* 🔥 SOCIAL LINKS ROW 🔥 */}
          <div className="flex items-center justify-center gap-4 mt-2 flex-wrap text-xs text-gray-500 dark:text-slate-400 transition-colors">
            {USER.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-gray-400 dark:text-slate-500" />
                <span className="text-gray-400 dark:text-slate-500">{USER.location}</span>
              </span>
            )}
            
            {USER.website && (
              <a 
                href={USER.website.startsWith('http') ? USER.website : `https://${USER.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-accent hover:underline transition-colors"
              >
                <Link2 size={12} /> {USER.website.replace(/^https?:\/\//, "")}
              </a>
            )}

            {USER.github && (
              <a 
                href={USER.github.startsWith('http') ? USER.github : `https://${USER.github}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-accent hover:underline transition-colors"
              >
                <GithubIcon size={12} /> GitHub
              </a>
            )}

            {USER.linkedin && (
              <a 
                href={USER.linkedin.startsWith('http') ? USER.linkedin : `https://${USER.linkedin}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 text-accent hover:underline transition-colors"
              >
                <LinkedinIcon size={12} /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="flex items-center justify-center gap-0 mb-5 mx-5">
          {[
            { label: "Posts", value: USER.posts, action: null },
            {
              label: "Followers",
              value: USER.followers,
              action: () => {
                setNetworkTab("followers");
                setShowNetworkModal(true);
              },
            },
            {
              label: "Following",
              value: USER.following,
              action: () => {
                setNetworkTab("following");
                setShowNetworkModal(true);
              },
            },
          ].map((s, i) => (
            <div
              key={s.label}
              onClick={s.action || undefined}
              className={`flex-1 text-center py-3 ${i !== 2 ? "border-r border-gray-100 dark:border-slate-800" : ""} bg-white dark:bg-slate-900 transition-colors duration-300 ${s.action ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/80" : ""}`}
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

        {/* ── Dynamic Network Section ── */}
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
              <button
                onClick={() => setShowNetworkModal(true)}
                className="text-xs font-semibold flex items-center gap-0.5 text-accent transition-colors p-1 hover:opacity-80"
              >
                See all <ChevronRight size={12} />
              </button>
            </div>

            <div
              onClick={() => setShowNetworkModal(true)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              {networkPreview.length > 0 ? (
                <>
                  {networkPreview.map((n: any, i: number) => (
                    <motion.div
                      key={n.id || i}
                      whileHover={{ y: -3, scale: 1.1 }}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-900 shadow-sm transition-colors overflow-hidden"
                      style={{
                        background: n.avatar ? "transparent" : n.gradient,
                        marginLeft: i > 0 ? -8 : 0,
                        zIndex: networkPreview.length - i,
                      }}
                    >
                      {n.avatar ? (
                        <img
                          src={n.avatar}
                          className="w-full h-full object-cover"
                          alt="av"
                        />
                      ) : (
                        n.initials
                      )}
                    </motion.div>
                  ))}
                  {actualFollowers.length > 5 && (
                    <div className="ml-2 text-xs text-gray-500 dark:text-slate-500 font-medium transition-colors group-hover:text-accent">
                      +{actualFollowers.length - 5} more
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                  Build your network to see connections here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs List ── */}
        <div className="px-5 mb-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 flex shadow-sm border border-gray-50 dark:border-slate-800 transition-colors">
            {[
              { id: "posts", icon: Grid3X3, label: "Posts" },
              { id: "saved", icon: Bookmark, label: "Saved" },
              { id: "projects", icon: FolderGit2, label: "Projects" },
              { id: "qr", icon: QrCode, label: "QR Code" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200"
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
                          <PostCell post={post} isOwner={isOwner} onDelete={handleDeletePost} />
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

          {/* ── Saved Posts Tab ── */}
          {activeTab === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="px-5"
            >
              {savedPosts.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedPosts.map((post, i) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        {/* They shouldn't delete original posts from saved feed, so we don't pass onDelete here */}
                        <PostCell post={post} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-gray-50 dark:border-slate-800 shadow-sm transition-colors">
                  <Bookmark
                    size={30}
                    className="mx-auto text-gray-300 dark:text-slate-600 mb-3"
                  />
                  <p className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-1 transition-colors">
                    Only you can see what you've saved
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    Save photos and videos that you want to see again.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Projects Tab ── */}
          {activeTab === "projects" && (
            <AnimatePresence mode="wait">
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4 px-5"
              >
                {/* Add Project Button */}
                {isOwner && (
                  <Link href="/create-project">
                    <button className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-3xl text-gray-500 dark:text-slate-400 font-bold hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                      <PlusSquare size={18} /> Add New Project
                    </button>
                  </Link>
                )}

                {/* Display Projects */}
                {profileUser?.projects && profileUser.projects.length > 0 ? (
                  profileUser.projects.map((p: any, i: number) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 transition-colors relative group"
                    >
                      {/* EDIT & DELETE BUTTONS */}
                      {isOwner && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingProject(p)}
                            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 shadow-md"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p._id)}
                            className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 shadow-md"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}

                      <div
                        className="h-1.5 w-full"
                        style={{
                          background:
                            p.gradient ||
                            "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        }}
                      />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                              style={{
                                background:
                                  p.gradient ||
                                  "linear-gradient(135deg,#6366f1,#8b5cf6)",
                              }}
                            >
                              {p.icon || "🚀"}
                            </div>
                            <div>
                              <h3 className="text-base font-black text-gray-900 dark:text-white transition-colors">
                                {p.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Star
                                  size={12}
                                  className="text-amber-400 fill-amber-400"
                                />
                                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium transition-colors">
                                  {p.stars || 0} stars
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-1">
                            {p.github && (
                              <motion.a
                                href={p.github}
                                target="_blank"
                                whileTap={{ scale: 0.9 }}
                                className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center transition-colors shadow-sm"
                              >
                                <GithubIcon
                                  size={16}
                                  className="text-gray-900 dark:text-white"
                                />
                              </motion.a>
                            )}
                            {p.live && (
                              <motion.a
                                href={p.live}
                                target="_blank"
                                whileTap={{ scale: 0.9 }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-accent transition-colors shadow-sm shadow-accent/30"
                              >
                                <ExternalLink
                                  size={16}
                                  className="text-white"
                                />
                              </motion.a>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-4 transition-colors">
                          {p.desc}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {p.tech &&
                            p.tech.map((t: string) => (
                              <span
                                key={t}
                                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-accent/10 text-accent transition-colors"
                              >
                                {t}
                              </span>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-gray-50 dark:border-slate-800 shadow-sm transition-colors">
                    <p className="text-sm font-bold text-gray-500 dark:text-slate-400 mb-3">
                      No projects added yet!
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

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
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  Network
                </h2>
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
                    initial={{
                      opacity: 0,
                      x: networkTab === "followers" ? -20 : 20,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{
                      opacity: 0,
                      x: networkTab === "followers" ? 20 : -20,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {networkTab === "followers"
                      ? renderNetworkList(actualFollowers)
                      : renderNetworkList(actualFollowing)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT PROJECT MODAL ── */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Edit Project</h3>
                <button onClick={() => setEditingProject(null)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleUpdateProject} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Project Name</label>
                  <input required type="text" value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-sm outline-none focus:border-accent text-gray-900 dark:text-white transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Description</label>
                  <textarea required rows={3} value={editingProject.desc} onChange={(e) => setEditingProject({...editingProject, desc: e.target.value})} className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-sm outline-none focus:border-accent text-gray-900 dark:text-white transition-colors custom-scrollbar" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Tech Stack (Comma Separated)</label>
                  <input type="text" value={typeof editingProject.tech === 'string' ? editingProject.tech : editingProject.tech?.join(', ')} onChange={(e) => setEditingProject({...editingProject, tech: e.target.value})} className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-sm outline-none focus:border-accent text-gray-900 dark:text-white transition-colors" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">GitHub URL</label>
                    <input type="url" value={editingProject.github || ''} onChange={(e) => setEditingProject({...editingProject, github: e.target.value})} className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-sm outline-none focus:border-accent text-gray-900 dark:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">Live Demo</label>
                    <input type="url" value={editingProject.live || ''} onChange={(e) => setEditingProject({...editingProject, live: e.target.value})} className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-sm outline-none focus:border-accent text-gray-900 dark:text-white transition-colors" />
                  </div>
                </div>
                <button type="submit" className="w-full py-3.5 bg-accent text-white font-bold rounded-xl mt-4 hover:opacity-90 transition-opacity shadow-lg shadow-accent/20">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}