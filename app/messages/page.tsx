"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import BottomNav from "@/components/BottomNav";

import {
  Search,
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  ArrowLeft,
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
  const preSelectedUserId = searchParams.get("chat"); // URL se ID nikal li

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // 🔥 Green Dot Track karne ke liye state
  const [unreadChats, setUnreadChats] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🔥 Chat Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingMute, setSettingMute] = useState(false);
  const [settingOnline, setSettingOnline] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Get Current User
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  // 2. Socket Connection (AB TOGGLE KE SATH CONNECTED HAI)
  useEffect(() => {
    if (currentUser) {
      if (settingOnline) {
        // Agar switch ON hai, toh sabko batao main online hu
        socket.connect(); // In case it was disconnected
        socket.emit("add_user", currentUser._id || currentUser.id);
      } else {
        // 🔥 JAISE HI SWITCH OFF HOGA, TUM GAYAB HO JAOGE 🔥
        socket.disconnect(); // Socket connection kaat do, tum offline dikhoge
      }
    }

    socket.on("get_online_users", (usersArray) => {
      setOnlineUsers(usersArray);
    });

    return () => {
      socket.off("get_online_users");
    };
  }, [currentUser, settingOnline]); // 👈 yahan settingOnline add kiya

  // 3. Fetch Sidebar Users
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

  // 4. AUTO-SELECT CHAT IF URL HAS '?chat=ID'
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
        .catch((err) =>
          console.error("Could not fetch user for direct chat", err),
        );
    }
  }, [preSelectedUserId, chatUsers.length, currentUser]);

  // 5. Fetch Messages
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

  // 6. 🔥 Real-time incoming messages (SORTING & GREEN DOT ADDED) 🔥
  useEffect(() => {
    const handleReceiveMessage = (data: any) => {
      const myId = currentUser?._id || currentUser?.id;

      // Agar active chat open hai aur wahi se message aaya hai
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
        // Agar kisi aur ka message aaya hai, toh use Unread mark karo (Green Dot lagao)
        if (data.sender !== myId) {
          setUnreadChats((prev) => ({ ...prev, [data.sender]: true }));
        }
      }

      // Jisne message bheja hai usko Sidebar list mein NO. 1 par le aao
      setChatUsers((prevUsers) => {
        const targetUserId = data.sender === myId ? data.receiver : data.sender;
        const existingIndex = prevUsers.findIndex(
          (u) => u._id === targetUserId || u.id === targetUserId,
        );

        if (existingIndex > -1) {
          const userToMove = prevUsers[existingIndex];
          const newUsers = [...prevUsers];
          newUsers.splice(existingIndex, 1);
          return [userToMove, ...newUsers]; // User top par push ho gaya
        }
        return prevUsers;
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [activeChat, currentUser]);

  // Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const msgId = Date.now().toString();
    const tempMsg = {
      _id: msgId,
      sender: currentUser?._id || currentUser?.id,
      receiver: activeChat._id,
      text: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");

    setChatUsers((prev) => {
      const otherUsers = prev.filter((u) => u._id !== activeChat._id);
      return [activeChat, ...otherUsers];
    });

    socket.emit("send_message", tempMsg);

    try {
      await axios.post(
        `${API}/api/messages/${activeChat._id}`,
        { text: tempMsg.text },
        { headers: getAuthHeaders() },
      );
    } catch (err) {
      console.error("Message save failed", err);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
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

            {/* 🔥 FUNCTIONAL THREE-DOT MENU 🔥 */}
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

              {/* Dropdown Box */}
              {isMenuOpen && (
                <>
                  {/* Invisible Overlay: Menu ke bahar click karne par band karne ke liye */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  ></div>

                  {/* Menu Items */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in duration-200">
                    <button
                      onClick={() => {
                        setUnreadChats({}); // Saare green dots clear kar dega!
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors flex items-center gap-2"
                    >
                      ✅ Mark all as read
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSettingsOpen(true); // 🔥 Isse Settings Box khulega
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

          {/* Search Box */}
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
                      // 🔥 JAISI HI CHAT KHOLI, GREEN DOT GAYAB 🔥
                      setUnreadChats((prev) => ({
                        ...prev,
                        [user._id]: false,
                      }));
                    }}
                    className={`w-full p-3 rounded-[20px] transition-all duration-300 flex items-center gap-3 text-left ${
                      isActive
                        ? "bg-accent/10 dark:bg-accent/20 ring-1 ring-accent/30 shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-slate-800/50"
                    }`}
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
                        {/* 🔥 TEXT CHANGE KAREGA AGAR NAYA MESSAGE HAI 🔥 */}
                        {unreadChats[user._id] ? (
                          <span className="text-green-500 font-bold">
                            New message received
                          </span>
                        ) : (
                          "Tap to view chat"
                        )}
                      </p>
                    </div>

                    {/* 🔥 CHAMAKTA HUA GREEN DOT 🔥 */}
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
          className={`${activeChat ? "flex" : "hidden md:flex"} flex-1 flex-col bg-transparent dark:bg-slate-950 h-full relative overflow-hidden transition-colors`}
        >
          {activeChat ? (
            <div className="flex flex-col h-full w-full justify-between">
              {/* TOPBAR */}
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

              {/* MESSAGES LAYER */}
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-7 space-y-4 custom-scrollbar pb-44">
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isMe =
                      msg.sender === (currentUser?._id || currentUser?.id) ||
                      msg.sender?._id === (currentUser?._id || currentUser?.id);
                    return (
                      <div
                        key={msg._id || index}
                        className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-5 py-3.5 shadow-sm transition-colors ${
                            isMe
                              ? "bg-accent/10 text-gray-800 dark:bg-accent/20 dark:text-white border border-accent/20 rounded-[20px] rounded-tr-sm"
                              : "bg-white dark:bg-slate-800/80 text-gray-700 dark:text-white/90 border border-gray-100 dark:border-slate-700/50 rounded-[20px] rounded-tl-sm"
                          }`}
                        >
                          <p className="leading-relaxed text-[15px]">
                            {msg.text}
                          </p>
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

              {/* CHAT INPUT */}
              {/* CHAT INPUT */}
              <div className="absolute md:fixed left-0 md:left-[320px] right-0 bottom-[80px] px-4 md:px-8 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-gray-200/80 dark:border-slate-800 z-40 transition-colors">
                <div className="max-w-4xl mx-auto flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[24px] px-3 py-2 shadow-sm transition-colors focus-within:ring-2 ring-accent">
                  <button className="w-10 h-10 rounded-[14px] bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition flex items-center justify-center text-gray-500 dark:text-white border border-gray-100 dark:border-slate-700">
                    <Paperclip size={18} />
                  </button>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 text-[15px] px-2"
                  />
                  <button className="w-10 h-10 rounded-[14px] transition flex items-center justify-center text-gray-400 hover:text-accent dark:hover:text-accent">
                    <Smile size={20} />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
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
          ) : (
            // BLANK CHAT STATE
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-transparent w-full h-full transition-colors">
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

      {/* 🔥 CHAT SETTINGS MODAL 🔥 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blur Background Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSettingsOpen(false)}
          ></div>

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Chat Settings
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200/50 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Options Body */}
            <div className="p-6 space-y-6">
              {/* Option 1: Mute Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Mute Notifications
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    Pause chat sounds and alerts
                  </p>
                </div>
                <button
                  onClick={() => setSettingMute(!settingMute)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settingMute ? "bg-accent" : "bg-gray-200 dark:bg-slate-700"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${settingMute ? "translate-x-6" : "translate-x-0"}`}
                  ></div>
                </button>
              </div>

              {/* Option 2: Show Online Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Show Online Status
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    Let others see when you're active
                  </p>
                </div>
                <button
                  onClick={() => setSettingOnline(!settingOnline)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settingOnline ? "bg-accent" : "bg-gray-200 dark:bg-slate-700"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${settingOnline ? "translate-x-6" : "translate-x-0"}`}
                  ></div>
                </button>
              </div>

              {/* Option 3: Chat Theme (Dummy Button) */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Chat Wallpaper
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    Customize your background
                  </p>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                  Change
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── FOOTER BAR ── */}
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
