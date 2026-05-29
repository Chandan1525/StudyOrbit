"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import BottomNav from "@/components/BottomNav";
import EmojiPicker, { Theme } from "emoji-picker-react";

import {
  Search,
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const socket = io(API);

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { Authorization: `Bearer ${token}` };
};

// 🔥 ASLI CHAT COMPONENT 🔥
function ChatInterface() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedUserId = searchParams.get("chat");

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Emoji & Attachment States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit / Delete / View States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // For Mobile Taps
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null); // For Image Previews

  // Green Dot Track
  const [unreadChats, setUnreadChats] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Chat Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingMute, setSettingMute] = useState(false);
  const [settingOnline, setSettingOnline] = useState(true);
  const [chatWallpaper, setChatWallpaper] = useState<string>("");

  // 🔥 NEW: Load the saved wallpaper when the page refreshes
  useEffect(() => {
    const savedWallpaper = localStorage.getItem("chatWallpaper");
    if (savedWallpaper) {
      setChatWallpaper(savedWallpaper);
    }
  }, []);

  const WALLPAPERS = [
    { id: "default", name: "Default", url: "" },
    {
      id: "doodle",
      name: "Doodle",
      url: "https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg",
    },
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      url: "https://w0.peakpx.com/wallpaper/32/79/HD-wallpaper-cyberpunk-city-pixel-art-neon-city.jpg",
    },
    {
      id: "abstract",
      name: "Abstract",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    },
    {
      id: "dark-mesh",
      name: "Dark Mesh",
      url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2570&auto=format&fit=crop",
    },
    {
      id: "neon-lines",
      name: "Geometric Neon",
      url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2570&auto=format&fit=crop",
    },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  

  useEffect(() => {
    if (currentUser) {
      if (settingOnline) {
        socket.connect();
        socket.emit("add_user", currentUser._id || currentUser.id);
      } else {
        socket.disconnect();
      }
    }
    socket.on("get_online_users", (usersArray) => setOnlineUsers(usersArray));
    return () => {
      socket.off("get_online_users");
    };
  }, [currentUser, settingOnline]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API}/api/users/sidebar`, {
          headers: getAuthHeaders(),
        });
        const userList = res.data.users || res.data || [];
        const otherUsers = userList.filter(
          (u: any) => u._id !== currentUser?._id && u._id !== currentUser?.id,
        );
        setChatUsers(otherUsers);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    if (currentUser) fetchUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!preSelectedUserId) return;
    const existingUser = chatUsers.find(
      (u) => u._id === preSelectedUserId || u.id === preSelectedUserId,
    );
    if (existingUser) {
      setActiveChat(existingUser);
    } else if (currentUser) {
      axios
        .get(`${API}/api/users/profile/${preSelectedUserId}`)
        .then((res) => {
          const u = res.data.user;
          const formattedUser = {
            _id: u.id || u._id,
            name: u.name,
            username: u.username,
            avatar: u.avatar,
          };
          setChatUsers((prev) => {
            if (prev.some((p) => p._id === formattedUser._id)) return prev;
            return [formattedUser, ...prev];
          });
          setActiveChat(formattedUser);
        })
        .catch((err) => console.error("Could not fetch user", err));
    }
  }, [preSelectedUserId, chatUsers.length, currentUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      try {
        const res = await axios.get(`${API}/api/messages/${activeChat._id}`, {
          headers: getAuthHeaders(),
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();
  }, [activeChat]);

  // SOCKET LISTENERS
  useEffect(() => {
    const handleReceiveMessage = (data: any) => {
      const myId = currentUser?._id || currentUser?.id;
      if (
        activeChat &&
        (data.sender === activeChat._id ||
          data.receiver === activeChat._id ||
          data.sender === myId)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data._id)) return prev;
          return [...prev, data];
        });
      } else {
        if (data.sender !== myId) {
          setUnreadChats((prev) => ({ ...prev, [data.sender]: true }));
          if (!settingMute) {
            try {
              const audio = new Audio(
                "https://cdn.pixabay.com/audio/2022/03/15/audio_7a89843c1a.mp3",
              );
              audio
                .play()
                .catch(() => console.log("Browser blocked auto-play"));
            } catch (error) {
              console.error("Audio error", error);
            }
          }
        }
      }

      setChatUsers((prevUsers) => {
        const targetUserId = data.sender === myId ? data.receiver : data.sender;
        const existingIndex = prevUsers.findIndex(
          (u) => u._id === targetUserId || u.id === targetUserId,
        );
        if (existingIndex > -1) {
          const userToMove = prevUsers[existingIndex];
          const newUsers = [...prevUsers];
          newUsers.splice(existingIndex, 1);
          return [userToMove, ...newUsers];
        }
        return prevUsers;
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_edited", (data: { _id: string; text: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data._id ? { ...msg, text: data.text } : msg,
        ),
      );
    });
    socket.on("message_deleted", (data: { _id: string }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== data._id));
    });

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, [activeChat, currentUser, settingMute]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  // 🔥 SEND MESSAGE
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !activeChat) return;

    const msgId = Date.now().toString();
    let localImageUrl = "";
    if (selectedFile) localImageUrl = URL.createObjectURL(selectedFile);

    const tempMsg = {
      _id: msgId,
      sender: currentUser?._id || currentUser?.id,
      receiver: activeChat._id,
      text: newMessage,
      image: localImageUrl,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    const textToSend = newMessage;
    const fileToSend = selectedFile;
    setNewMessage("");
    setSelectedFile(null);
    setShowEmojiPicker(false);

    setChatUsers((prev) => {
      const otherUsers = prev.filter((u) => u._id !== activeChat._id);
      return [activeChat, ...otherUsers];
    });

    const formData = new FormData();
    if (textToSend) formData.append("text", textToSend);
    if (fileToSend) formData.append("image", fileToSend);

    try {
      const res = await axios.post(
        `${API}/api/messages/${activeChat._id}`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        },
      );
      socket.emit("send_message", res.data);
    } catch (err) {
      console.error("Message save failed", err);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    }
  };

  // 🔥 DELETE MESSAGE
  const handleDeleteMessage = async (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== msgId));
    socket.emit("delete_message", { _id: msgId, receiver: activeChat._id });
    try {
      await axios.delete(`${API}/api/messages/${msgId}`, {
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  // 🔥 SUBMIT EDIT
  const submitEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    setMessages((prev) =>
      prev.map((msg) => (msg._id === msgId ? { ...msg, text: editText } : msg)),
    );
    setEditingMessageId(null);
    setActiveMenuId(null);
    socket.emit("edit_message", {
      _id: msgId,
      text: editText,
      receiver: activeChat._id,
    });

    try {
      await axios.put(
        `${API}/api/messages/${msgId}`,
        { text: editText },
        { headers: getAuthHeaders() },
      );
    } catch (err) {
      console.error("Failed to edit message", err);
    }
  };

  const filteredUsers = chatUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-[100dvh] w-full bg-transparent dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden flex flex-col justify-between transition-colors duration-300">
      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* ── SIDEBAR ── */}
        <div
          className={`${activeChat ? "hidden md:flex" : "flex w-full"} md:w-[320px] md:max-w-[320px] border-r border-gray-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl flex-col h-full flex-shrink-0 z-20 transition-colors`}
        >
          <div className="h-20 px-6 flex items-center border-b border-gray-200/80 dark:border-slate-800/80 flex-shrink-0 transition-colors justify-between relative">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Messages
              </h1>
              <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5 font-medium">
                Connect with developers
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-9 h-9 rounded-[12px] border flex items-center justify-center transition shadow-sm ${isMenuOpen ? "bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600" : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:shadow-md"}`}
              >
                <MoreVertical
                  size={18}
                  className="text-gray-600 dark:text-white/70"
                />
              </button>
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in duration-200">
                    <button
                      onClick={() => {
                        setUnreadChats({});
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                    >
                      ✅ Mark all as read
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                    >
                      ⚙️ Chat Settings
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-5 border-b border-gray-200/80 dark:border-slate-800/80 flex-shrink-0 transition-colors">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center gap-3 px-4 py-3 shadow-sm transition-colors focus-within:ring-2 ring-accent">
              <Search
                size={18}
                className="text-gray-400 dark:text-slate-500 flex-shrink-0"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-36 custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isActive = activeChat?._id === user._id;
                const isUserOnline = onlineUsers.includes(user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => {
                      setActiveChat(user);
                      setUnreadChats((prev) => ({
                        ...prev,
                        [user._id]: false,
                      }));
                    }}
                    className={`w-full p-3 rounded-[20px] transition-all duration-300 flex items-center gap-3 text-left ${isActive ? "bg-accent/10 dark:bg-accent/20 ring-1 ring-accent/30 shadow-sm" : "hover:bg-gray-100 dark:hover:bg-slate-800/50"}`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${user.name || "U"}&background=random`
                        }
                        alt={user.name}
                        className="w-11 h-11 rounded-[14px] object-cover shadow-sm border border-gray-100 dark:border-slate-700"
                      />
                      {isUserOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3
                        className={`font-bold text-[15px] truncate ${isActive ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-slate-200"}`}
                      >
                        {user.name || user.username}
                      </h3>
                      <p
                        className={`text-[11px] font-medium mt-0.5 truncate ${isActive ? "text-gray-600 dark:text-white/80" : "text-gray-400 dark:text-slate-500"}`}
                      >
                        {unreadChats[user._id] ? (
                          <span className="text-green-500 font-bold">
                            New message received
                          </span>
                        ) : (
                          "Tap to view chat"
                        )}
                      </p>
                    </div>
                    {unreadChats[user._id] && (
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-center text-gray-400 dark:text-slate-500 text-sm mt-10 font-medium">
                No users found
              </p>
            )}
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div
          className={`${activeChat ? "flex" : "hidden md:flex"} flex-1 flex-col bg-transparent dark:bg-slate-950 h-full relative overflow-hidden transition-colors bg-cover bg-center`}
          style={{
            backgroundImage: chatWallpaper ? `url(${chatWallpaper})` : "none",
          }}
        >
          {chatWallpaper && (
            <div className="absolute inset-0 bg-slate-900/60 z-0 pointer-events-none transition-opacity duration-300" />
          )}

          {activeChat ? (
            <div className="flex flex-col h-full w-full justify-between relative z-10">
              <div className="h-20 border-b border-gray-200/80 dark:border-slate-800/80 px-4 md:px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex-shrink-0 z-10 transition-colors">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <button
                    onClick={() => {
                      router.push("/messages");
                      setActiveChat(null);
                    }}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition text-gray-600 dark:text-white/70"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div
                    className="relative cursor-pointer flex-shrink-0"
                    onClick={() => router.push(`/profile/${activeChat._id}`)}
                  >
                    <img
                      src={
                        activeChat.avatar ||
                        `https://ui-avatars.com/api/?name=${activeChat.name || "U"}&background=random`
                      }
                      className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] object-cover shadow-sm border border-gray-100 dark:border-slate-700"
                    />
                    {onlineUsers.includes(activeChat._id) && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div className="truncate">
                    <h2
                      onClick={() => router.push(`/profile/${activeChat._id}`)}
                      className="text-lg md:text-xl font-black text-gray-900 dark:text-white truncate cursor-pointer hover:text-accent transition-colors"
                    >
                      {activeChat.name || activeChat.username}
                    </h2>
                    <p
                      className={`${onlineUsers.includes(activeChat._id) ? "text-green-500" : "text-gray-400 dark:text-slate-500"} text-xs font-bold mt-0.5`}
                    >
                      {onlineUsers.includes(activeChat._id)
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MESSAGES LAYER WITH CLICK-AWAY LISTENER */}
              <div
                onClick={() => setActiveMenuId(null)}
                className="flex-1 overflow-y-auto px-4 md:px-8 py-7 space-y-4 custom-scrollbar pb-44"
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMe =
                      msg.sender === (currentUser?._id || currentUser?.id) ||
                      msg.sender?._id === (currentUser?._id || currentUser?.id);
                    return (
                      <div
                        key={msg._id || index}
                        className={`flex w-full group ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {/* 🔥 ACTION BUTTONS: Shown on Desktop Hover OR Mobile Tap 🔥 */}
                        {isMe && editingMessageId !== msg._id && (
                          <div
                            className={`flex items-center gap-2 mr-2 transition-all duration-200 ${
                              activeMenuId === msg._id
                                ? "opacity-100 translate-x-0 pointer-events-auto"
                                : "opacity-0 scale-95 md:group-hover:opacity-100 md:group-hover:scale-100 pointer-events-none md:pointer-events-auto"
                            }`}
                          >
                            {msg.text && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMessageId(msg._id);
                                  setEditText(msg.text);
                                  setActiveMenuId(null);
                                }}
                                className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-xl transition bg-gray-50 dark:bg-slate-800 md:bg-transparent border md:border-0 dark:border-slate-700 shadow-sm md:shadow-none"
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(msg._id);
                                setActiveMenuId(null);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition bg-gray-50 dark:bg-slate-800 md:bg-transparent border md:border-0 dark:border-slate-700 shadow-sm md:shadow-none"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}

                        <div
                          onClick={(e) => {
                            e.stopPropagation(); // 👈 THIS WAS MISSING: Prevents the background tap from firing!
                            if (isMe && !editingMessageId) {
                              setActiveMenuId(
                                activeMenuId === msg._id ? null : msg._id,
                              );
                            }
                          }}
                          className={`max-w-[75%] px-5 py-3.5 shadow-sm transition-colors relative cursor-pointer select-none ${
                            isMe
                              ? "bg-accent/10 text-gray-800 dark:bg-accent/20 dark:text-white border border-accent/20 rounded-[20px] rounded-tr-sm"
                              : "bg-white dark:bg-slate-800/80 text-gray-700 dark:text-white/90 border border-gray-100 dark:border-slate-700/50 rounded-[20px] rounded-tl-sm"
                          }`}
                        >
                          {/* Image rendering */}
                          {msg.image && (
                            <img
                              src={msg.image}
                              alt="Shared attachment"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFullScreenImage(msg.image);
                              }}
                              className="max-w-full h-auto rounded-lg mb-2 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ maxHeight: "300px" }}
                            />
                          )}

                          {/* Editable Text Field OR Standard Text */}
                          {editingMessageId === msg._id ? (
                            <div
                              className="flex items-center gap-2 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && submitEdit(msg._id)
                                }
                                autoFocus
                                className="bg-white dark:bg-slate-900 border border-accent/30 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-accent w-full text-gray-900 dark:text-white"
                              />
                              <button
                                onClick={() => submitEdit(msg._id)}
                                className="text-green-500 hover:text-green-600 transition"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="text-red-500 hover:text-red-600 transition"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            msg.text && (
                              <p className="leading-relaxed text-[15px]">
                                {msg.text}
                              </p>
                            )
                          )}

                          <p
                            className={`text-[10px] mt-1.5 font-medium text-right ${isMe ? "text-gray-500 dark:text-white/60" : "text-gray-400 dark:text-white/40"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-IN",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                    <MessageCircle
                      size={48}
                      className="mb-4 opacity-20 text-accent"
                    />
                    <p className="font-medium">
                      Say hi to {activeChat.name || activeChat.username}! 👋
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* CHAT INPUT LAYER */}
              <div
                onClick={() => setActiveMenuId(null)} // Clear active mobile menus
                className="absolute md:fixed left-0 md:left-[320px] right-0 bottom-[80px] px-4 md:px-8 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-gray-200/80 dark:border-slate-800 z-40 transition-colors"
              >
                <div className="max-w-4xl mx-auto relative">
                  {showEmojiPicker && (
                    <div className="absolute bottom-[70px] right-0 z-50 shadow-2xl rounded-lg">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        theme={Theme.AUTO}
                      />
                    </div>
                  )}

                  {selectedFile && (
                    <div className="mb-2 p-2 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-between text-sm max-w-sm border border-gray-200 dark:border-slate-700">
                      <span className="truncate text-gray-700 dark:text-gray-300 font-medium">
                        📎 {selectedFile.name}
                      </span>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700 ml-4 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[24px] px-3 py-2 shadow-sm transition-colors focus-within:ring-2 ring-accent">
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      id="file-upload" // Added an ID
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.heic,.heif" // Tells iPhone to open the camera roll
                    />

                    {/* Attachment Button (Changed to a Label) */}
                    <label
                      htmlFor="file-upload" // Links directly to the input ID
                      className="w-10 h-10 rounded-[14px] bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center justify-center text-gray-500 dark:text-white border border-gray-100 dark:border-slate-700 cursor-pointer flex-shrink-0"
                    >
                      <Paperclip size={18} />
                    </label>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 rounded-[14px] bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center justify-center text-gray-500 dark:text-white border border-gray-100 dark:border-slate-700"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 text-[15px] px-2"
                    />
                    <button
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className="w-10 h-10 rounded-[14px] transition flex items-center justify-center text-gray-400 hover:text-accent dark:hover:text-accent"
                    >
                      <Smile size={20} />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && !selectedFile}
                      className="w-10 h-10 rounded-[14px] bg-accent shadow-md shadow-accent/20 flex items-center justify-center flex-shrink-0 hover:opacity-90 transition disabled:opacity-50"
                    >
                      <Send
                        size={16}
                        className="text-white"
                        style={{ marginLeft: "2px", marginBottom: "2px" }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-transparent w-full h-full transition-colors relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-md flex flex-col items-center w-full px-4"
              >
                <div className="w-20 h-20 rounded-[24px] bg-accent flex items-center justify-center text-white shadow-xl mb-6 shadow-accent/20 transition-colors">
                  <MessageCircle size={36} />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
                  Your Messages
                </h2>
                <p className="text-gray-500 dark:text-white/50 text-sm font-medium leading-relaxed mb-6 px-2">
                  Pick someone from the list to start chatting privately.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* ── CHAT SETTINGS MODAL ── */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSettingsOpen(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-[#0b141a] dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden border border-gray-800"
          >
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0b141a]">
              <h3 className="text-lg font-black text-white">Chat Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Mute Notifications
                  </h4>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                    Pause chat sounds and alerts
                  </p>
                </div>
                <button
                  onClick={() => setSettingMute(!settingMute)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settingMute ? "bg-[#a855f7]" : "bg-gray-700"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${settingMute ? "translate-x-6" : "translate-x-0"}`}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Show Online Status
                  </h4>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                    Let others see when you're active
                  </p>
                </div>
                <button
                  onClick={() => setSettingOnline(!settingOnline)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settingOnline ? "bg-[#a855f7]" : "bg-gray-700"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${settingOnline ? "translate-x-6" : "translate-x-0"}`}
                  ></div>
                </button>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Chat Wallpaper
                  </h4>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5 mb-4">
                    Customize your background
                  </p>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {WALLPAPERS.map((wp) => {
                    const isSelected = chatWallpaper === wp.url;
                    return (
                      <button
                        key={wp.id}
                        onClick={() => {
                          setChatWallpaper(wp.url); // Updates the screen immediately
                          localStorage.setItem("chatWallpaper", wp.url); // Saves it permanently
                        }}
                        className={`relative w-[84px] h-[112px] rounded-2xl flex-shrink-0 bg-cover bg-center overflow-hidden transition-all duration-200 snap-center ${isSelected ? "border-[3px] border-[#a855f7] scale-95" : "border border-gray-800 hover:border-gray-700"}`}
                        style={{
                          backgroundImage: wp.url ? `url(${wp.url})` : "none",
                          backgroundColor: !wp.url ? "#0f172a" : "transparent",
                        }}
                      >
                        {!wp.url && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400">
                            Default
                          </span>
                        )}
                        {isSelected && (
                          <div className="absolute bottom-1.5 right-1.5 w-[22px] h-[22px] bg-[#a855f7] rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-[11px] font-bold">
                              ✓
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 🔥 FULL SCREEN IMAGE PREVIEW MODAL 🔥 ── */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
          >
            <X size={24} />
          </button>
          <img
            src={fullScreenImage}
            alt="Full screen view"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl scale-in-100 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-accent font-bold">
          Loading Chats...
        </div>
      }
    >
      <ChatInterface />
    </Suspense>
  );
}
