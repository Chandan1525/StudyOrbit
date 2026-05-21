"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  User,
  AtSign,
  MapPin,
  Sparkles,
  Save,
  Loader2,
  Check,
  Link2,
  Globe,
  X,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const SKILL_SUGGESTIONS = [
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "TypeScript",
  "MongoDB",
  "AI/ML",
  "DSA",
  "Flutter",
  "Django",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Blockchain",
  "Figma",
];

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
  "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",
  "linear-gradient(135deg,#0d0d2b,#1a0533,#2d1b69)",
  "linear-gradient(135deg,#000428,#004e92)",
  "linear-gradient(135deg,#141e30,#243b55)",
  "linear-gradient(135deg,#200122,#6f0000)",
];

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    location: "",
    about: "",
    avatar: "",
    website: "",
    github: "",
    linkedin: "",
    coverGradient: COVER_GRADIENTS[0],
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setFormData({
        name: user.name || "",
        username: user.username || "",
        location: user.location || "",
        about: user.bio || user.about || "",
        avatar: user.avatar || "",
        website: user.website || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        coverGradient: user.coverGradient || COVER_GRADIENTS[0],
      });
      setAvatarPreview(user.avatar || "");
      if (user.skills) {
        setSkills(
          Array.isArray(user.skills)
            ? user.skills
            : user.skills
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean),
        );
      }
    }
  }, []);

  const handleChange = (e: any) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Avatar URL input (Manual Paste)
  const handleAvatarUrl = (url: string) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    setAvatarPreview(url);
  };

  // 🔥 PHOTO UPLOAD LOGIC: FileReader se image read karke base64 banayein
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, avatar: base64String }));
        setAvatarPreview(base64String); // Turant UI update hoga
      };
      reader.readAsDataURL(file);
    }
  };

  // Add skill
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 12) {
      setSkills((prev) => [...prev, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) =>
    setSkills((prev) => prev.filter((s) => s !== skill));

  // Submit to DB & LocalStorage
const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const updatedData = { ...formData, skills, bio: formData.about };

      // Backend API Call
      const res = await axios.put(
        "http://localhost:5000/api/users/update-profile", 
        updatedData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSaved(true);
        setTimeout(() => router.push("/profile"), 1400);
      }
    } catch (err: any) {
      // 🔥 ASLI ERROR YAHAN DIKHEGA 🔥
      const errorMsg = err.response?.data?.message || err.message;
      alert("🚨 BACKEND REJECTED IT: " + errorMsg); // Yeh popup aayega
      setError("Backend Error: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div
      className="min-h-screen bg-[#0b1020]"
      style={{ fontFamily: "-apple-system,'SF Pro Display',sans-serif" }}
    >
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl border-b px-5 py-4 flex items-center justify-between" style={{ background:"rgba(11,16,32,0.85)", borderColor:"rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-xl font-black text-white">Edit Profile</h1>
        </div>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || saved}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all"
          style={{
            background: saved
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
          }}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <Check size={15} />
          ) : (
            <Save size={15} />
          )}
          {isLoading ? "Saving..." : saved ? "Saved!" : "Save"}
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="pb-16">
        {/* ── Cover + Avatar ── */}
        <div className="relative mb-16">
          {/* Cover */}
          <div
            className="h-36 w-full"
            style={{ background: formData.coverGradient }}
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
                backgroundSize: "30px 30px",
                height: 144,
              }}
            />
          </div>

          {/* Cover gradient picker */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {COVER_GRADIENTS.map((g, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, coverGradient: g }))}
                className="w-6 h-6 rounded-full border-2 transition-all shadow-lg"
                style={{
                  background: g,
                  borderColor:
                    formData.coverGradient === g ? "white" : "transparent",
                  transform:
                    formData.coverGradient === g ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>

          {/* Avatar */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: -44 }}
          >
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-full p-[3px] shadow-2xl"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#ec4899,#f97316)",
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover bg-[#0b1020]"
                    onError={() => setAvatarPreview("")}
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-black"
                    style={{
                      background:
                        "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)",
                    }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/60 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={20} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar URL / File input */}
        <div className="px-5 mb-8 text-center">
          <input
            type="text"
            placeholder="Paste avatar image URL..."
            value={formData.avatar}
            onChange={(e) => handleAvatarUrl(e.target.value)}
            className="w-full max-w-xs mx-auto block text-xs bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:bg-white/10 text-center text-white placeholder-gray-500 transition-all"
          />
          {/* 🔥 HIDDEN FILE INPUT WITH ONCHANGE EVENT 🔥 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload} 
          />
        </div>

        <div className="px-5 space-y-5 max-w-xl mx-auto">
          {/* ── Basic info card ── */}
          <div className="rounded-3xl p-5 border border-white/10 shadow-sm bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                }}
              >
                <User size={16} className="text-white" />
              </div>
              <h2 className="text-base font-black text-white">Basic Info</h2>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Username
                </label>
                <div className="relative">
                  <AtSign
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Bio card ── */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#ec4899,#f97316)",
                }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <h2 className="text-base font-black text-white">About Me</h2>
            </div>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              placeholder="Full-stack dev 🚀 | AI/ML enthusiast 🧠 | Building things that matter..."
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm leading-relaxed outline-none focus:border-indigo-500 focus:bg-white/10 transition-all resize-none text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400 mt-2 text-right font-medium">
              {formData.about.length}/200
            </p>
          </div>

          {/* ── Skills card ── */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#10b981,#059669)",
                }}
              >
                <Sparkles size={16} className="text-white" />
              </div>
              <h2 className="text-base font-black text-white">
                Skills & Interests
              </h2>
            </div>

            {/* Added skills */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
              <AnimatePresence>
                {skills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-white transition-colors ml-1"
                    >
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Skill input */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg hover:opacity-90 transition-opacity"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                }}
              >
                <Plus size={20} className="text-white" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s))
                .slice(0, 8)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all font-medium"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          {/* ── Links card ── */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#0284c7,#3b82f6)",
                }}
              >
                <Link2 size={16} className="text-white" />
              </div>
              <h2 className="text-base font-black text-white">Social Links</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: "website",
                  icon: Globe,
                  placeholder: "yourwebsite.com",
                  label: "Website",
                  color: "#818cf8",
                },
                {
                  name: "github",
                  icon: Globe,
                  placeholder: "github.com/username",
                  label: "GitHub",
                  color: "#9ca3af",
                },
                {
                  name: "linkedin",
                  icon: Globe,
                  placeholder: "linkedin.com/in/name",
                  label: "LinkedIn",
                  color: "#38bdf8",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    {field.label}
                  </label>
                  <div className="relative">
                    <field.icon
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: field.color }}
                    />
                    <input
                      type="text"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-indigo-500 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}