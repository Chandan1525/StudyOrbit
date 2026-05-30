"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Search,
  Users,
  MessageCircle,
  User,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { io } from "socket.io-client";
import BottomNav from "@/components/BottomNav";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const socket = io(API);

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { Authorization: `Bearer ${token}` };
};

// 🔥 Fake 'members' hata diya gaya hai
const CHANNELS = [
  {
    tag: "WEB",
    name: "Web Dev",
    bg: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  },
  {
    tag: "APP",
    name: "App Dev",
    bg: "linear-gradient(135deg,#0284c7,#3b82f6)",
  },
  {
    tag: "ML",
    name: "AI & ML",
    bg: "linear-gradient(135deg,#059669,#10b981)",
  },
  {
    tag: "BLOCK",
    name: "Blockchain",
    bg: "linear-gradient(135deg,#f59e0b,#f97316)",
  },
  {
    tag: "DSA",
    name: "Algorithms",
    bg: "linear-gradient(135deg,#db2777,#f43f5e)",
  },
];

function CommunityInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedChannel = searchParams.get("channel");

  const [activeTab, setActiveTab] = useState("community");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [likedMessages, setLikedMessages] = useState<string[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgText, setEditMsgText] = useState("");

  const [inviteCopied, setInviteCopied] = useState(false);

  // 🔥 REAL-TIME LIVE COUNTS
  const [liveCounts, setLiveCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  // AUTO-SELECT CHANNEL based on URL
  useEffect(() => {
    if (!preSelectedChannel) return;
    const foundChannel = CHANNELS.find((c) => c.tag === preSelectedChannel);
    if (foundChannel) {
      setActiveChannel(foundChannel);
    }
  }, [preSelectedChannel]);

  // 🔥 GLOBAL LIVE COUNT LISTENER (Hamesha active rahega)
  useEffect(() => {
    const handleActiveCount = (data: any) => {
      setLiveCounts((prev) => ({
        ...prev,
        [data.channel]: data.count,
      }));
    };

    socket.on("community_active_count", handleActiveCount);
    return () => {
      socket.off("community_active_count", handleActiveCount);
    };
  }, []);

  // Fetch Messages when joining a channel
  useEffect(() => {
    if (!activeChannel) return;

    socket.emit("join_community", activeChannel.name);

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API}/api/community/${encodeURIComponent(activeChannel.name)}/messages`,
          { headers: getAuthHeaders() },
        );
        setChatMessages(res.data);
      } catch (err) {
        setChatMessages([]);
      }
    };
    fetchMessages();

    return () => {
      socket.emit("leave_community", activeChannel.name);
    };
  }, [activeChannel?.name]);

  // Specific Channel Socket Listeners
  useEffect(() => {
    if (!activeChannel) return;

    const handleReceive = (data: any) => {
      if (data.channel === activeChannel.name) {
        setChatMessages((prev) => {
          if (
            prev.some(
              (m) => m.id === data.message.id || m._id === data.message.id,
            )
          )
            return prev;
          return [...prev, data.message];
        });
      }
    };

    const handleEdit = (data: any) => {
      if (data.channel === activeChannel.name) {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === data.msgId || m._id === data.msgId
              ? { ...m, text: data.text }
              : m,
          ),
        );
      }
    };

    const handleDelete = (data: any) => {
      if (data.channel === activeChannel.name) {
        setChatMessages((prev) =>
          prev.filter((m) => m.id !== data.msgId && m._id !== data.msgId),
        );
      }
    };

    socket.on("receive_community_message", handleReceive);
    socket.on("message_edited", handleEdit);
    socket.on("message_deleted", handleDelete);

    return () => {
      socket.off("receive_community_message", handleReceive);
      socket.off("message_edited", handleEdit);
      socket.off("message_deleted", handleDelete);
    };
  }, [activeChannel?.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleToggleLike = (msgId: string) => {
    setLikedMessages((prev) =>
      prev.includes(msgId)
        ? prev.filter((id) => id !== msgId)
        : [...prev, msgId],
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeChannel) return;
    const msgId = Date.now().toString();

    const newMsg = {
      id: msgId,
      user: currentUser?.name || currentUser?.username || "Student",
      role: "Member",
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: newMessage.trim(),
      avatar: (currentUser?.name || currentUser?.username || "S")
        .charAt(0)
        .toUpperCase(),
      color: "bg-accent",
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setNewMessage("");

    socket.emit("send_community_message", {
      channel: activeChannel.name,
      message: newMsg,
    });

    try {
      const res = await axios.post(
        `${API}/api/community/${encodeURIComponent(activeChannel.name)}/messages`,
        { text: newMsg.text },
        { headers: getAuthHeaders() },
      );

      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, _id: res.data._id, id: res.data._id } : m,
        ),
      );
    } catch (err) {
      console.error("Failed to save message", err);
    }
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editMsgText.trim() || !activeChannel) return;

    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === msgId || m._id === msgId ? { ...m, text: editMsgText } : m,
      ),
    );
    setEditingMsgId(null);

    socket.emit("edit_community_message", {
      channel: activeChannel.name,
      msgId,
      text: editMsgText,
    });

    try {
      await axios.put(
        `${API}/api/community/${encodeURIComponent(activeChannel.name)}/messages/${msgId}`,
        { text: editMsgText },
        { headers: getAuthHeaders() },
      );
    } catch (err: any) {
      console.error("Edit failed:", err.response?.data || err.message);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!activeChannel) return;

    setChatMessages((prev) =>
      prev.filter((m) => m.id !== msgId && m._id !== msgId),
    );

    socket.emit("delete_community_message", {
      channel: activeChannel.name,
      msgId,
    });

    try {
      await axios.delete(
        `${API}/api/community/${encodeURIComponent(activeChannel.name)}/messages/${msgId}`,
        { headers: getAuthHeaders() },
      );
    } catch (err: any) {
      console.error("Delete failed:", err.response?.data || err.message);
    }
  };

  const handleFocusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleInviteClick = () => {
    if (!activeChannel) return;
    const inviteLink = `${window.location.origin}/community?channel=${encodeURIComponent(activeChannel.tag)}`;
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const filteredChannels = CHANNELS.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-screen w-full bg-transparent dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden flex flex-col justify-between transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* SIDEBAR */}
        <div
          className={`${activeChannel ? "hidden md:flex" : "flex w-full"} md:w-[320px] md:max-w-[320px] border-r border-gray-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl flex-col h-full flex-shrink-0 z-20 transition-colors`}
        >
          <div className="h-20 px-6 flex items-center gap-2 border-b border-gray-200/80 dark:border-slate-800/80 flex-shrink-0 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-lg transition-colors hidden md:flex">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                Study<span className="text-accent">Orbit</span>
              </h1>
            </div>
          </div>

          <div className="p-5 border-b border-gray-200/80 dark:border-slate-800/80 flex-shrink-0 transition-colors">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center gap-3 px-4 py-3.5 shadow-sm transition-colors focus-within:ring-2 ring-accent">
              <Search
                size={18}
                className="text-gray-400 dark:text-slate-500 flex-shrink-0"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-24 custom-scrollbar">
            <div className="flex items-center justify-between px-1 mb-3">
              <h2 className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-white/40">
                Communities
              </h2>
              <span className="text-[11px] text-accent font-bold">
                {filteredChannels.length} Active
              </span>
            </div>

            {filteredChannels.length > 0 ? (
              filteredChannels.map((channel, index) => {
                const isActive = activeChannel?.name === channel.name;
                const liveCount = liveCounts[channel.name] || 0;

                return (
                  <button
                    key={index}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-full h-[135px] rounded-[28px] p-4 relative overflow-hidden transition-all duration-300 text-left shadow-sm hover:shadow-md ${
                      isActive
                        ? "ring-4 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-950 ring-accent scale-[1.02]"
                        : "hover:scale-[1.02]"
                    }`}
                    style={{ background: channel.bg }}
                  >
                    <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 rounded-[14px] bg-white/15 backdrop-blur-xl flex items-center justify-center text-lg text-white shadow-sm">
                          💬
                        </div>

                        {/* 🔥 DYNAMIC LIVE / OFFLINE BADGE 🔥 */}
                        {liveCount > 0 ? (
                          <div className="px-2 py-0.5 rounded-full bg-black/30 text-[9px] text-green-300 font-bold flex items-center gap-1.5 uppercase border border-green-400/20 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                            Live
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded-full bg-black/10 text-[9px] text-white/50 font-bold flex items-center gap-1 uppercase border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                            Offline
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="text-white text-[22px] font-black leading-tight">
                          {channel.tag}
                        </h3>
                        <p className="text-white/90 mt-0.5 font-bold text-[13px]">
                          {channel.name}
                        </p>

                        {/* 🔥 Sahi real-time count dikhega yahan 🔥 */}
                        <div className="text-white/90 text-[11px] mt-1.5 flex items-center gap-1.5 font-bold">
                          <Users size={13} />
                          <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg text-green-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            {liveCount} Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center text-sm text-gray-400 dark:text-white/30 mt-8 font-medium">
                No communities found
              </p>
            )}
          </div>
        </div>

        {/* CHAT CONTAINER PANEL */}
        <div
          className={`${activeChannel ? "flex" : "hidden md:flex"} flex-1 flex-col bg-transparent dark:bg-slate-950 h-full relative overflow-hidden transition-colors`}
        >
          {activeChannel ? (
            <div className="flex flex-col h-full w-full justify-between">
              {/* TOPBAR */}
              <div className="h-20 border-b border-gray-200/80 dark:border-slate-800/80 px-4 md:px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0 z-10 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    onClick={() => {
                      router.push("/community");
                      setActiveChannel(null);
                    }}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition text-gray-600 dark:text-white/70"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="truncate">
                    <h2 className="text-xl md:text-2xl font-black truncate text-gray-900 dark:text-white flex items-center gap-2">
                      {activeChannel.name}
                    </h2>

                    {/* 🔥 TOP BAR mein real-time active chatting members count 🔥 */}
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {liveCounts[activeChannel.name] || 0} currently active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={handleInviteClick}
                    className="px-5 py-2 rounded-[14px] bg-accent hover:opacity-90 transition-all text-xs font-bold shadow-md shadow-accent/20 text-white flex items-center gap-2 active:scale-95"
                  >
                    {inviteCopied ? (
                      <>
                        <Check size={14} /> Copied!
                      </>
                    ) : (
                      "Invite"
                    )}
                  </button>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-7 pb-10 custom-scrollbar">
                {chatMessages.length > 0 ? (
                  chatMessages.map((msg, index) => {
                    const msgId = msg._id || msg.id;
                    const isMine =
                      msg.user === (currentUser?.name || currentUser?.username);

                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 md:gap-4 group w-full"
                      >
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-[16px] bg-accent flex items-center justify-center font-black text-sm md:text-lg text-white shadow-sm flex-shrink-0 transition-colors`}
                        >
                          {msg.avatar}
                        </div>
                        <div className="max-w-2xl w-full">
                          <div className="flex items-baseline gap-2.5 flex-wrap mb-1">
                            <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white">
                              {msg.user}
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-accent font-bold">
                              {msg.role}
                            </span>
                            <span className="text-[10px] text-gray-400 dark:text-white/40 font-medium">
                              {msg.time}
                            </span>
                          </div>

                          {editingMsgId === msgId ? (
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                autoFocus
                                value={editMsgText}
                                onChange={(e) => setEditMsgText(e.target.value)}
                                className="flex-1 bg-white dark:bg-slate-800 border-2 border-accent rounded-xl px-4 py-2.5 outline-none text-sm text-gray-900 dark:text-white shadow-sm"
                              />
                              <button
                                onClick={() => handleSaveEdit(msgId)}
                                className="p-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl transition"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingMsgId(null)}
                                className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl transition"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 rounded-[20px] rounded-tl-sm px-5 py-3.5 shadow-sm text-sm leading-relaxed text-gray-800 dark:text-white/90 break-words transition-colors">
                              {msg.text}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-white/40 font-medium">
                            <button
                              onClick={() => handleToggleLike(msgId)}
                              className={`flex items-center gap-1 transition-all duration-200 ${likedMessages.includes(msgId) ? "text-rose-500 font-bold scale-105" : "hover:text-rose-500 dark:hover:text-rose-400"}`}
                            >
                              <span
                                style={{
                                  color: likedMessages.includes(msgId)
                                    ? "#f43f5e"
                                    : "inherit",
                                }}
                              >
                                {likedMessages.includes(msgId) ? "❤️" : "🤍"}
                              </span>{" "}
                              React
                            </button>

                            {isMine && !editingMsgId && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingMsgId(msgId);
                                    setEditMsgText(msg.text);
                                  }}
                                  className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition ml-1 opacity-0 group-hover:opacity-100"
                                >
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msgId)}
                                  className="flex items-center gap-1 hover:text-rose-500 dark:hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-white/30">
                    <MessageCircle
                      size={48}
                      className="mb-4 opacity-20 text-accent"
                    />
                    <p className="font-medium">
                      Welcome to {activeChannel.name}! Be the first to say hi 👋
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* FIXED MESSAGE INPUT AREA */}
              <div className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 py-3 flex-shrink-0 mb-20 z-10 border-t border-gray-200/80 dark:border-slate-800 transition-colors">
                <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[24px] px-3 py-2 shadow-sm transition-colors focus-within:ring-2 ring-accent">
                  <button className="w-10 h-10 rounded-[14px] bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center justify-center text-xl text-gray-500 dark:text-white border border-gray-100 dark:border-slate-700">
                    +
                  </button>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Message ${activeChannel.name} Community...`}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-white/30 text-gray-900 dark:text-white px-2"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-5 py-2.5 rounded-[14px] bg-accent hover:opacity-90 transition font-bold shadow-md shadow-accent/20 disabled:opacity-50 text-white text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // WELCOME BLANK PAGE STATE
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-transparent w-full h-full transition-colors">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-md flex flex-col items-center w-full px-4"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-accent flex items-center justify-center text-3xl md:text-4xl shadow-xl mb-6 shadow-accent/20 text-white transition-colors">
                  🚀
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
                  Welcome to{" "}
                  <span className="text-accent transition-colors">
                    StudyOrbit
                  </span>
                </h2>
                <p className="text-gray-500 dark:text-white/50 text-sm font-medium leading-relaxed mb-8 px-2">
                  Select a specific domain community from the left sidebar to
                  start collaborating, sharing insights, and connecting with
                  peers.
                </p>
                <button
                  onClick={handleFocusSearch}
                  className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-600 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  <Users size={14} className="text-accent" /> Explore our
                  community
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// 🔥 WRAPPED IN SUSPENSE FOR NEXT.JS
export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-accent font-bold">
          Loading Community...
        </div>
      }
    >
      <CommunityInterface />
    </Suspense>
  );
}
