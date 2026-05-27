"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Users, MessageCircle, User } from "lucide-react";
import { io } from "socket.io-client";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const socket = io(API);

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname(); // 👈 Ye apne aap detect karega ki tum kis page par ho
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get user info
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  // 🔥 GLOBAL GREEN DOT LISTENER 🔥
  useEffect(() => {
    if (localStorage.getItem("has_new_msg") === "true") {
      setHasNewMessage(true);
    }

    const handleGlobalMsg = (data: any) => {
      const myId = currentUser?._id || currentUser?.id;
      if (data.sender !== myId && pathname !== "/messages") {
        setHasNewMessage(true);
        localStorage.setItem("has_new_msg", "true");
      }
    };

    socket.on("receive_message", handleGlobalMsg);

    return () => {
      socket.off("receive_message", handleGlobalMsg);
    };
  }, [currentUser, pathname]);

  const NAV = [
    { id: "dashboard", route: "/dashboard", icon: Home, label: "Home" },
    { id: "search", route: "/search", icon: Search, label: "Search" },
    { id: "community", route: "/community", icon: Users, label: "Community" },
    { id: "messages", route: "/messages", icon: MessageCircle, label: "Chats" },
    { id: "profile", route: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999]">
      <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-slate-800 px-2 py-2.5 flex items-center justify-around transition-colors">
        {NAV.map((item) => {
          // Check if current URL matches the item route
          const active = pathname.includes(item.route);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "messages") {
                  setHasNewMessage(false);
                  localStorage.removeItem("has_new_msg");
                }
                router.push(item.route);
              }}
              className="relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-300"
            >
              {active && (
                <div className="absolute inset-0 rounded-2xl bg-accent opacity-10 dark:opacity-15" />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <item.icon
                  size={22}
                  className={`transition-all duration-300 ${
                    active ? "" : "text-gray-400 dark:text-white/40"
                  }`}
                  style={{ color: active ? "var(--accent-color)" : "currentColor" }}
                />
                
                {/* GREEN DOT LOGIC */}
                {item.id === "messages" && hasNewMessage && !active && (
                  <span className="absolute top-0 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 animate-pulse shadow-sm shadow-green-500/50" />
                )}
                
                <span
                  className={`text-[10px] font-bold transition-colors duration-300 mt-1 ${
                    active ? "" : "text-gray-500 dark:text-white/40"
                  }`}
                  style={{ color: active ? "var(--accent-color)" : "" }}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}