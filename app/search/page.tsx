"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
  Search,
  Sparkles,
  Users,
  Briefcase,
  Trophy,
  Globe,
  Brain,
  Code2,
  Home,
  MessageCircle,
  User,
  Flame,
  Star,
  ArrowUpRight,
  Heart,
  MessageSquare,
} from "lucide-react";

export default function SearchPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("search");
  const [activeFilter, setActiveFilter] = useState("People");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Data states for MongoDB
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

// 2. Fetch Data from Backend
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch Users
        const usersRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users`, { headers });
        setDbUsers(usersRes.data.users || usersRes.data || []);

        // Fetch Posts (Dhyan rahe, yahan sirf ek baar 'const postsRes' likha hai)
        const postsRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/posts`, { headers });
        setDbPosts(postsRes.data || []);

      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchData();
  }, []);

  const NAV = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "community", icon: Users, label: "Community" },
    { id: "chats", icon: MessageCircle, label: "Chats", badge: 3 },
    { id: "profile", icon: User, label: "Profile" },
  ];

  // Dummy placeholders for tabs that don't have backend endpoints yet
  const communities = [
    {
      name: "AI Orbit",
      members: "12.5K",
      icon: Brain,
      gradient: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    },
    {
      name: "Web Orbit",
      members: "9.2K",
      icon: Globe,
      gradient: "linear-gradient(135deg,#0ea5e9,#2563eb)",
    },
    {
      name: "DSA Orbit",
      members: "14K",
      icon: Code2,
      gradient: "linear-gradient(135deg,#db2777,#f43f5e)",
    },
  ];
  const projects = [
    {
      title: "StudyOrbit",
      stack: "Next.js • Socket.io • MongoDB",
      stars: "1.2K",
      gradient: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    },
    {
      title: "AI Resume Analyzer",
      stack: "OpenAI • React • Node.js",
      stars: "980",
      gradient: "linear-gradient(135deg,#059669,#10b981)",
    },
  ];

  // 🔥 3. Dynamic Filter Logic for MongoDB Data 🔥

  // -- People Search --
  const filteredUsers = dbUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // -- Posts Search (Hashtags, Orbit, Caption) --
  const filteredPosts = dbPosts.filter((p) => {
    const sq = searchQuery.toLowerCase().trim();
    if (!sq) return true;

    // Agar user ne '#' lagaya hai, toh array match karne ke liye use hata dein
    const cleanTagQuery = sq.startsWith("#") ? sq.slice(1) : sq;

    const matchCaption = p.caption?.toLowerCase().includes(sq);
    const matchOrbit = p.orbit?.toLowerCase().includes(sq);

    // Hashtags array mein search karna
    const matchHashtags =
      p.hashtags && Array.isArray(p.hashtags)
        ? p.hashtags.some((tag: string) =>
            tag.toLowerCase().includes(cleanTagQuery),
          )
        : false;

    return matchCaption || matchOrbit || matchHashtags;
  });

  const filteredCommunities = communities.filter((com) =>
    com.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredProjects = projects.filter(
    (proj) =>
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.stack.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Helper to trigger a search from trending topics
  const handleTrendingClick = (tag: string) => {
    setActiveFilter("Posts"); // Automatically switch to Posts tab
    setSearchQuery(tag); // Search for the hashtag
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-24">
      {/* TOPBAR */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-gray-200/80 dark:border-slate-800 px-5 py-5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shadow-xl shadow-accent/20 transition-colors">
            <Sparkles size={20} className="text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">
              Explore
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 transition-colors">
              Discover developers & communities
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mt-5 flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[24px] px-4 py-4 shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
          <Search size={20} className="text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeFilter.toLowerCase()}...`}
            className="bg-transparent outline-none flex-1 text-[15px] text-gray-900 dark:text-white caret-accent placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div
        className="flex gap-3 overflow-x-auto px-5 pt-5 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {["People", "Posts", "Projects", "Communities", "Hackathons"].map(
          (item) => {
            const active = activeFilter === item;
            return (
              <button
                key={item}
                onClick={() => setActiveFilter(item)}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm ${
                  active
                    ? "bg-accent text-white shadow-accent/20"
                    : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:border-accent dark:hover:border-accent"
                }`}
              >
                {item}
              </button>
            );
          },
        )}
      </div>

      {/* DYNAMIC RESULTS RENDERED HERE */}
      <div className="px-5 mt-5">
        {/* ── REAL MONGODB PEOPLE ── */}
        {activeFilter === "People" && (
          <div className="flex flex-col gap-4">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-10 text-gray-400 dark:text-slate-500">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  Type in the search bar to find people.
                </p>
              </div>
            ) : isLoading ? (
              <p className="text-center text-accent text-sm mt-5 font-bold animate-pulse">
                Loading users...
              </p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => router.push(`/profile/${user._id}`)}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm cursor-pointer hover:border-accent transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=6366f1&color=fff`
                      }
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:text-accent hover:border-accent transition-colors">
                    <User size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 dark:text-slate-500 text-sm mt-5 font-medium">
                No people found.
              </p>
            )}
          </div>
        )}

        {/* ── REAL MONGODB POSTS ── */}
        {activeFilter === "Posts" && (
          <div className="flex flex-col gap-4">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-10 text-gray-400 dark:text-slate-500">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  Type in a hashtag or phrase to search posts.
                </p>
              </div>
            ) : isLoading ? (
              <p className="text-center text-accent text-sm mt-5 font-bold animate-pulse">
                Loading posts...
              </p>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => router.push(`/post/${post._id}`)} // 🔥 Routes to single post
                  className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm cursor-pointer hover:border-accent transition-all"
                >
                  {/* Orbit Tag */}
                  {post.orbit && (
                    <span className="inline-block px-2.5 py-1 bg-accent/10 text-accent rounded-md text-[10px] font-black uppercase mb-3">
                      {post.orbit}
                    </span>
                  )}

                  {/* Caption */}
                  <p className="text-sm text-gray-800 dark:text-slate-300 mb-2 leading-relaxed line-clamp-3">
                    {post.caption}
                  </p>

                  {/* Hashtags displayed if they exist */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.hashtags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-accent text-[11px] font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Image */}
                  {post.image && (
                    <img
                      src={post.image}
                      className="w-full h-44 object-cover rounded-xl mb-3 border border-gray-100 dark:border-slate-800"
                      alt="Post content"
                    />
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 dark:text-slate-500 mt-2 pt-3 border-t border-gray-50 dark:border-slate-800">
                    <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                      <Heart size={14} /> {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageSquare size={14} /> {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 dark:text-slate-500 text-sm mt-5 font-medium">
                No posts match your search.
              </p>
            )}
          </div>
        )}

        {/* COMMUNITIES (Dummy) */}
        {activeFilter === "Communities" && (
          <div className="flex flex-col gap-4">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-10 text-gray-400 dark:text-slate-500">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  Type in the search bar to find communities.
                </p>
              </div>
            ) : filteredCommunities.length > 0 ? (
              filteredCommunities.map((com, i) => (
                <div
                  key={i}
                  className="flex items-center p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm gap-4"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ background: com.gradient }}
                  >
                    <com.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {com.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                      {com.members} members
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-accent/10 text-accent font-bold text-xs rounded-xl hover:bg-accent/20 transition-colors">
                    Join
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 dark:text-slate-500 text-sm mt-5 font-medium">
                No communities found.
              </p>
            )}
          </div>
        )}

        {/* PROJECTS (Dummy) */}
        {activeFilter === "Projects" && (
          <div className="flex flex-col gap-4">
            {searchQuery.trim() === "" ? (
              <div className="text-center py-10 text-gray-400 dark:text-slate-500">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  Type in the search bar to find projects.
                </p>
              </div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((proj, i) => (
                <div
                  key={i}
                  className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 mb-3 font-medium">
                    {proj.stack}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-300">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-yellow-500"
                    />{" "}
                    {proj.stars}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 dark:text-slate-500 text-sm mt-5 font-medium">
                No projects found.
              </p>
            )}
          </div>
        )}

        {/* FALLBACK FOR Hackathons */}
        {activeFilter === "Hackathons" && (
          <div className="text-center py-10 text-gray-400 dark:text-slate-500">
            <Search size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              Search results for Hackathons will appear here.
            </p>
          </div>
        )}
      </div>

      {/* TRENDING (Hide when user is actively searching) */}
      {!searchQuery && (
        <div className="px-5 mt-7">
          <div className="flex items-center gap-2 mb-5">
            <Flame size={22} className="text-orange-500" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">
              Trending Topics
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "#AI",
              "#Hackathon",
              "#WebDev",
              "#OpenSource",
              "#Blockchain",
              "#Cloud",
              "#DSA",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTrendingClick(tag)}
                className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-accent/10 hover:text-accent dark:hover:bg-accent/20 dark:hover:text-accent transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-slate-800 px-2 py-2.5 flex items-center justify-around transition-colors">
          {NAV.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === "home") router.push("/dashboard");
                  if (item.id === "search") router.push("/search");
                  if (item.id === "community" || item.id === "explore")
                    router.push("/community");
                  if (item.id === "profile") router.push("/profile");
                  if (item.id === "chats") router.push("/messages");
                }}
                className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-300"
              >
                {active && (
                  <div className="absolute inset-0 rounded-2xl bg-accent opacity-10 dark:opacity-15" />
                )}
                <div className="relative z-10">
                  <item.icon
                    size={22}
                    className="transition-all duration-300"
                    style={{
                      color: active ? "var(--accent-color)" : "currentColor",
                    }}
                    className={
                      active ? "" : "text-gray-400 dark:text-slate-500"
                    }
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`relative z-10 text-[10px] font-bold transition-colors duration-300`}
                  style={{ color: active ? "var(--accent-color)" : "" }}
                  className={active ? "" : "text-gray-500 dark:text-slate-500"}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
