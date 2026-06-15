"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  FolderGit2,
  ExternalLink,
  Type,
  AlignLeft,
  Send,
} from "lucide-react";

// 🔥 Custom Github Icon (Error fix)
const GithubIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    tech: "",
    github: "",
    live: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.desc)
      return alert("Name and description are required!");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/project`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("✅ Project added successfully!");
      router.push("/profile"); // Wapas profile par bhej do
    } catch (error) {
      console.error("Failed to add project", error);
      alert("Error adding project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft
              size={18}
              className="text-slate-700 dark:text-slate-200"
            />
          </button>

          {/* 🔥 FONT DISPLAY & BRAND STYLING APPLIED 🔥 */}
          <h1 className="font-display text-xl font-black flex items-center gap-2 text-gray-900 dark:text-white transition-colors">
            <FolderGit2 size={20} className="text-accent" /> Add New Project
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-bold text-sm rounded-full hover:opacity-90 transition disabled:opacity-50 active:scale-95 shadow-md shadow-accent/20"
        >
          {loading ? "Saving..." : "Publish"} <Send size={14} />
        </button>
      </div>

      {/* ── FORM AREA ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <Type size={16} className="text-accent" /> Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., knowCars, TESTFORGE..."
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <AlignLeft size={16} className="text-accent" /> Description *
            </label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="What does this project do? What problem does it solve?"
              rows={4}
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent transition-colors custom-scrollbar"
              required
            />
          </div>

          {/* Tech Stack */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <FolderGit2 size={16} className="text-accent" /> Technologies Used
            </label>
            <input
              type="text"
              name="tech"
              value={formData.tech}
              onChange={handleChange}
              placeholder="e.g., HTML, CSS, React.js, Node.js (Comma separated)"
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent transition-colors"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <GithubIcon
                  size={16}
                  className="text-gray-900 dark:text-white"
                />{" "}
                GitHub URL
              </label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <ExternalLink size={16} className="text-blue-500" /> Live Demo
                URL
              </label>
              <input
                type="url"
                name="live"
                value={formData.live}
                onChange={handleChange}
                placeholder="https://your-project.com"
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent transition-colors"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
