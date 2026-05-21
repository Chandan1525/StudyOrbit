"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { ImagePlus, X, Send, Hash, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const ORBITS = [
  { id: "ML", label: "AI & ML" },
  { id: "WEB", label: "Web3 & Web" },
  { id: "APP", label: "Mobile Dev" },
  { id: "CLOUD", label: "Cloud & DevOps" },
  { id: "DSA", label: "Algorithms" },
  { id: "HACK", label: "Hackathons" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [orbit, setOrbit] = useState("WEB");
  const [hashtagsStr, setHashtagsStr] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check login status
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    } else {
      alert("Please login to create a post.");
      router.push("/auth/login");
    }
  }, [router]);

  // Handle Base64 Image Parsing
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Data to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return alert("Caption is required!");
    if (!currentUser?.id) return alert("User not found. Please log in again.");

    setIsLoading(true);

    const parsedTags = hashtagsStr
      .split(/[\s,]+/)
      .map((tag) => tag.replace("#", "").trim())
      .filter((tag) => tag.length > 0);

    const postData = {
      caption,
      orbit,
      hashtags: parsedTags,
      image: imagePreview || "",
      authorId: currentUser.id,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/posts", postData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (res.data.success) {
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error("Create post error:", error);
      alert(error.response?.data?.message || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 🔥 DARK MODE WRAPPER
    <main className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800 px-5 py-4 flex items-center justify-between shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition text-slate-800 dark:text-slate-200">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-900 dark:text-white transition-colors">Create Post</h1>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isLoading || !caption.trim()}
          className="px-5 py-2.5 rounded-full bg-accent text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent/30 transition-all hover:opacity-90"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} style={{ marginLeft: "2px", marginBottom: "2px" }} />}
          Publish
        </motion.button>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* User Profile Preview */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full p-[2px] bg-accent transition-colors">
              <img 
                src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "U")}&background=6366f1&color=fff`} 
                className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-950 transition-colors"
                alt="avatar"
              />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white transition-colors">{currentUser?.name || "Chandan Kumar"}</p>
              <p className="text-xs text-accent font-medium transition-colors">@{currentUser?.username || "chandan_dev"}</p>
            </div>
          </div>

          {/* Caption Area */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening in your orbit? Share a project, idea, or ask a question..."
            className="w-full bg-transparent text-lg text-slate-800 dark:text-slate-200 resize-none outline-none placeholder-slate-400 dark:placeholder-slate-500 min-h-[100px] transition-colors"
            autoFocus
          />

          {/* Image Upload Area */}
          {imagePreview ? (
            <div className="relative rounded-3xl overflow-hidden group shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
              <img src={imagePreview} alt="Preview" className="w-full max-h-[400px] object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition shadow-lg"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 dark:bg-accent/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all group"
            >
              <ImagePlus size={28} className="text-accent/70 group-hover:text-accent transition-colors" />
              <span className="text-sm font-semibold text-accent/70 group-hover:text-accent transition-colors">Add an image to your post</span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          )}

          <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-slate-800 transition-colors">
            {/* Orbit Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 transition-colors">
                <Sparkles size={16} className="text-amber-500" /> Select Orbit
              </label>
              <div className="flex flex-wrap gap-2">
                {ORBITS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOrbit(o.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm ${
                      orbit === o.id 
                        ? "bg-accent text-white shadow-accent/20" 
                        : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags Input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 transition-colors">
                <Hash size={16} className="text-rose-500" /> Tags & Keywords
              </label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={(e) => setHashtagsStr(e.target.value)}
                placeholder="e.g. #reactjs #webdev #hackathon"
                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all shadow-sm placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}