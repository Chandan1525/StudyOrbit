"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MessageSquare, UserPlus, Send, CheckCheck, BellRing } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/notifications/read", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const handleNotificationClick = (n: any) => {
    if (n.type === "like" || n.type === "comment") {
      const postId = n.post?._id || (typeof n.post === "string" ? n.post : null);
      if (postId) {
        router.push(`/post/${postId}`);
      } else {
        alert("Oops! This post may have been deleted.");
      }
    } else if (n.type === "follow") {
      router.push(`/profile/${n.sender._id}`);
    } else if (n.type === "message") {
      router.push(`/messages?chat=${n.sender._id}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return (
          <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-pink-500 fill-pink-500" />
          </div>
        );
      case "comment":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={18} className="text-blue-500 fill-blue-500" />
          </div>
        );
      case "follow":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
            <UserPlus size={18} className="text-purple-500" />
          </div>
        );
      case "message":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
            <Send size={18} className="text-emerald-500" />
          </div>
        );
      default:
        return <BellRing size={18} />;
    }
  };

  const getMessage = (n: any) => {
    const user = (
      <span
        className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/profile/${n.sender._id}`);
        }}
      >
        {n.sender.name}
      </span>
    );

    switch (n.type) {
      case "like":
        return <>{user} liked your post.</>;
      case "comment":
        return <>{user} commented: "{n.text}"</>;
      case "follow":
        return <>{user} started following you.</>;
      case "message":
        return <>{user} sent you a message.</>;
      default:
        return "";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center font-bold text-indigo-500">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-24 font-sans transition-colors duration-300">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          >
            <ArrowLeft size={18} className="text-gray-700 dark:text-gray-200" />
          </button>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleNotificationClick(n)}
                className={`flex items-start gap-4 p-4 rounded-2xl mb-3 cursor-pointer transition-colors ${
                  n.read
                    ? "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    : "bg-indigo-50/50 dark:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-700 shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-800"
                }`}
              >
                <img
                  src={
                    n.sender.avatar ||
                    `https://ui-avatars.com/api/?name=${n.sender.name}`
                  }
                  alt={`${n.sender.name}'s avatar`}
                  className="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/profile/${n.sender._id}`);
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
                    {getMessage(n)}
                  </p>
                  {n.post && n.post.caption && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 border-l-2 border-indigo-200 dark:border-indigo-700 pl-2">
                      {n.post.caption}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-semibold">
                    {new Date(n.createdAt).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                {getIcon(n.type)}
              </motion.div>
            ))
          ) : (
            <div className="text-center mt-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BellRing size={32} className="text-gray-300 dark:text-gray-500" />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                No notifications yet
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                When someone interacts with you, it will show up here.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
