"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ArrowLeft, Shield, Eye, EyeOff, Activity, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function PrivacySecurityPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Privacy States
  const [isPublic, setIsPublic] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const currentUser = JSON.parse(stored);
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/profile/${currentUser.id || currentUser._id}`);
      
      if (res.data && res.data.user) {
        // Agar pehle se set nahi hai, toh default true manenge
        setIsPublic(res.data.user.isPublic !== false);
        setShowOnlineStatus(res.data.user.showOnlineStatus !== false);
      }
    } catch (error) {
      console.error("Failed to fetch privacy settings", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (type: "public" | "online") => {
    const newPublicState = type === "public" ? !isPublic : isPublic;
    const newOnlineState = type === "online" ? !showOnlineStatus : showOnlineStatus;

    // Optimistic UI update (turant change dikhega)
    if (type === "public") setIsPublic(newPublicState);
    if (type === "online") setShowOnlineStatus(newOnlineState);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/privacy`,
        { isPublic: newPublicState, showOnlineStatus: newOnlineState },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to update privacy", error);
      // Agar fail hua toh wapas purani state kar do
      if (type === "public") setIsPublic(!newPublicState);
      if (type === "online") setShowOnlineStatus(!newOnlineState);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth/register"); // Ya jahan bhi redirect karna chaho
    } catch (error) {
      console.error("Failed to delete account", error);
      setIsDeleting(false);
      setShowDeleteModal(false);
      alert("Failed to delete account. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 px-5 py-4 flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800 transition-colors">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition"
        >
          <ArrowLeft size={18} className="text-slate-700 dark:text-slate-200" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Privacy & Security</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your account protection</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-8 pb-24 space-y-6">
        
        {/* ── VISIBILITY SECTION ── */}
        <div>
          <h2 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">Visibility</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-gray-200/60 dark:border-slate-800">
            
            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isPublic ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-gray-100 dark:bg-slate-800 text-gray-500"}`}>
                  {isPublic ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Public Profile</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 max-w-[200px] leading-tight">
                    {isPublic ? "Anyone can find and view your profile" : "Only your followers can view your profile"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle("public")}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 flex items-center px-1 ${isPublic ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-700"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${isPublic ? "ml-auto" : "mr-auto"}`} />
              </button>
            </div>

            {/* Online Status Toggle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${showOnlineStatus ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500" : "bg-gray-100 dark:bg-slate-800 text-gray-500"}`}>
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Online Status</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 max-w-[200px] leading-tight">
                    Show others when you are active
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle("online")}
                className={`w-14 h-7 rounded-full relative transition-all duration-300 flex items-center px-1 ${showOnlineStatus ? "bg-blue-500" : "bg-gray-300 dark:bg-slate-700"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${showOnlineStatus ? "ml-auto" : "mr-auto"}`} />
              </button>
            </div>

          </div>
        </div>

        {/* ── DANGER ZONE ── */}
        <div className="pt-4">
          <h2 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3 ml-1">Danger Zone</h2>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-rose-200 dark:border-rose-500/20">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Delete Account</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Once you delete your account, there is no going back. All your projects, posts, and network data will be permanently erased.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-3.5 rounded-xl font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete My Account
            </button>
          </div>
        </div>

      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-rose-600 dark:text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-center text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h3>
              <p className="text-sm text-center text-gray-500 dark:text-slate-400 mb-8">
                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center justify-center shadow-lg shadow-rose-600/20"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Yes, delete it"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}