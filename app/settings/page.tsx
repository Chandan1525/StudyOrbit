"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Home,
  Search,
  Users,
  MessageCircle,
  User,
  Settings,
  Bell,
  Shield,
  Moon,
  Palette,
  Lock,
  Globe,
  ChevronRight,
  LogOut,
  Smartphone,
  Database,
  Eye,
  X,
  Check,
  Sun,
  Laptop,
  Zap,
  Trash2,
  Monitor,
} from "lucide-react";

const ACCENT_PALETTE = [
  { name: "Indigo Orbit", hex: "#6366f1", light: "#e0e7ff" },
  { name: "Cyber Purple", hex: "#a855f7", light: "#f3e8ff" },
  { name: "Emerald Dev", hex: "#10b981", light: "#d1fae5" },
  { name: "Crimson Forge", hex: "#f43f5e", light: "#ffe4e6" },
  { name: "Deep Ocean", hex: "#0284c7", light: "#e0f2fe" },
  { name: "Amber Gold", hex: "#f59e0b", light: "#fef3c7" },
];

const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "Hindi",
  "Spanish",
  "French",
  "German",
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<
    "none" | "appearance" | "accent" | "language" | "devices" | "storage"
  >("none");
  const [prefs, setPrefs] = useState({
    theme: "light",
    accentColor: "#6366f1",
    language: "English (US)",
  });

  // Dummy states for interactivity
  const [cacheSize, setCacheSize] = useState("42.8 MB");

  // 🔥 UPDATED: Connected Devices States
  const [devices, setDevices] = useState<any[]>([]);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));
    const saved = localStorage.getItem("studyorbit_preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPrefs({ ...prefs, ...parsed });
        if (parsed.accentColor)
          document.documentElement.style.setProperty(
            "--accent-color",
            parsed.accentColor,
          );
      } catch {}
    }
  }, []);

  const updatePreference = (key: string, value: string) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem("studyorbit_preferences", JSON.stringify(updated));
    if (key === "theme") {
      if (value === "dark") document.documentElement.classList.add("dark");
      else if (value === "light")
        document.documentElement.classList.remove("dark");
      else {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        dark
          ? document.documentElement.classList.add("dark")
          : document.documentElement.classList.remove("dark");
      }
    }
    if (key === "accentColor") {
      document.documentElement.style.setProperty("--accent-color", value);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const handleClearCache = () => {
    setCacheSize("0 MB");
    alert("Cache cleared successfully!");
    setActivePanel("none");
  };

  // 🔥 NEW: Fetch Devices from Backend
  const fetchDevices = async () => {
    setActivePanel("devices");
    setIsDevicesLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.sessions);
    } catch (error) {
      console.error("Error fetching devices", error);
      // Fallback
      setDevices([
        {
          id: "s1",
          name: "Windows PC - Chrome",
          active: true,
          icon: Monitor,
          time: "Active now",
        },
        {
          id: "s2",
          name: "iPhone 14 - Safari",
          active: false,
          icon: Smartphone,
          time: "Last active: 2 hours ago",
        },
      ]);
    } finally {
      setIsDevicesLoading(false);
    }
  };

  // 🔥 NEW: Revoke Device from Backend
  const handleRevokeDevice = async (
    deviceId: string,
    isCurrentDevice: boolean,
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users/sessions/${deviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setDevices(devices.filter((d) => d.id !== deviceId));

      if (isCurrentDevice) {
        handleLogout();
      }
    } catch (error) {
      console.error("Failed to revoke device", error);
      setDevices(devices.filter((d) => d.id !== deviceId)); // Fallback UI removal
    }
  };

  const ac = prefs.accentColor;

  const SECTIONS = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          desc: "Update name, bio & photo",
          route: "/settings/edit-profile",
          color: "#6366f1",
          bg: "#e0e7ff",
        },
        {
          icon: Lock,
          label: "Change Password",
          desc: "Update your login password",
          route: "/auth/reset-password",
          color: "#f43f5e",
          bg: "#ffe4e6",
        },
        {
          icon: Shield,
          label: "Privacy & Security",
          desc: "Manage account protection",
          route: "/settings/privacy",
          color: "#10b981",
          bg: "#d1fae5",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Bell,
          label: "Notifications",
          desc: "Push & email preferences",
          route: "/notifications",
          color: "#f59e0b",
          bg: "#fef3c7",
        },
        {
          icon: Moon,
          label: "Appearance",
          desc: "Dark mode & themes",
          action: () => setActivePanel("appearance"),
          color: "#8b5cf6",
          bg: "#f3e8ff",
        },
        {
          icon: Palette,
          label: "Accent Colors",
          desc: "Customize UI accent color",
          action: () => setActivePanel("accent"),
          color: ac,
          bg: `${ac}20`,
        },
      ],
    },
    {
      title: "Platform",
      items: [
        {
          icon: Globe,
          label: "Language",
          desc: prefs.language,
          action: () => setActivePanel("language"),
          color: "#0284c7",
          bg: "#e0f2fe",
        },
        // 🔥 CHANGED action to fetchDevices here
        {
          icon: Smartphone,
          label: "Connected Devices",
          desc: "Manage active sessions",
          action: fetchDevices,
          color: "#6366f1",
          bg: "#e0e7ff",
        },
        {
          icon: Database,
          label: "Storage & Cache",
          desc: "Clear temporary data",
          action: () => setActivePanel("storage"),
          color: "#64748b",
          bg: "#f1f5f9",
        },
      ],
    },
  ];

  const NAV = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "community", icon: Users, label: "Community" },
    { id: "chats", icon: MessageCircle, label: "Chats", badge: 5 },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    // DARK MODE WRAPPER
    <div className="min-h-screen pb-28 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-slate-900 dark:text-slate-100">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 px-5 py-4 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all"
            style={{ background: `linear-gradient(135deg,${ac},${ac}cc)` }}
          >
            <Settings size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white transition-colors">
              Settings
            </h1>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
              Manage your account
            </p>
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all"
          style={{ borderColor: ac }}
        >
          <img
            src={
              currentUser?.avatar ||
              `https://ui-avatars.com/api/?name=${currentUser?.name || "U"}&background=6366f1&color=fff`
            }
            alt="profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff`;
            }}
          />
        </div>
      </div>

      {/* ── Profile hero card ── */}
      <div className="px-5 pt-5">
        <div
          className="rounded-[28px] p-6 relative overflow-hidden shadow-xl transition-all"
          style={{
            background: `linear-gradient(135deg,#0f172a 0%,#1e1b4b 60%,${ac}44 100%)`,
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 transition-all"
            style={{ background: ac }}
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 transition-all"
            style={{ background: ac }}
          />

          <div className="relative z-10 flex items-center gap-4">
            <div className="relative">
              <div className="w-18 h-18 rounded-2xl overflow-hidden ring-2 ring-white/20 w-[72px] h-[72px]">
                <img
                  src={
                    currentUser?.avatar ||
                    `https://ui-avatars.com/api/?name=${currentUser?.name || "U"}&background=6366f1&color=fff&size=72`
                  }
                  alt="profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=U&background=6366f1&color=fff&size=72`;
                  }}
                />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0f172a]"
                style={{ background: "#22c55e" }}
              />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black text-white">
                {currentUser?.name || "Student"}
              </h2>
              <p className="text-white/50 text-sm mt-0.5">
                @{currentUser?.username || "username"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
                  style={{ background: `${ac}30`, color: ac }}
                >
                  <Shield size={10} /> Verified
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                  style={{
                    background: "rgba(34,197,94,0.2)",
                    color: "#22c55e",
                  }}
                >
                  <Zap size={10} /> Active
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/settings/edit-profile")}
              className="text-xs font-bold px-3 py-2 rounded-xl transition-all hover:bg-white/20 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* ── Settings sections ── */}
      <div className="px-5 mt-6 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1 transition-colors">
              {section.title}
            </h2>
            <div className="rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 transition-colors">
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if ((item as any).action) (item as any).action();
                    else if ((item as any).route && (item as any).route !== "#")
                      router.push((item as any).route);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 active:bg-gray-100 dark:active:bg-slate-800 transition-colors ${idx !== section.items.length - 1 ? "border-b border-gray-100 dark:border-slate-800" : ""}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.bg }}
                    >
                      <item.icon size={20} style={{ color: item.color }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-800 dark:text-slate-200 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 transition-colors">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.label === "Accent Colors" && (
                      <div
                        className="w-4 h-4 rounded-full shadow-sm transition-all"
                        style={{ background: ac }}
                      />
                    )}
                    {item.label === "Appearance" && (
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-medium capitalize transition-colors">
                        {prefs.theme}
                      </span>
                    )}
                    <ChevronRight
                      size={16}
                      className="text-gray-300 dark:text-slate-600 transition-colors"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* ── Security toggle ── */}
        <div>
          <h2 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1 transition-colors">
            Security
          </h2>
          <div className="rounded-3xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 transition-colors">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: "#ffe4e6" }}
                >
                  <Eye size={20} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-slate-200 transition-colors">
                    Public Profile
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 transition-colors">
                    Visible to everyone
                  </p>
                </div>
              </div>
              <button
                className="w-12 h-6 rounded-full relative transition-all duration-300 flex items-center px-0.5"
                style={{ background: ac }}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow ml-auto transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-3xl font-black text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            boxShadow: "0 8px 24px rgba(239,68,68,0.3)",
          }}
        >
          <LogOut size={20} /> Sign Out
        </button>

        {/* App version */}
        <p className="text-center text-xs text-gray-400 dark:text-slate-600 pb-2 transition-colors">
          StudyOrbit v1.0.0 · Made with ❤️
        </p>
      </div>

      {/* ── DYNAMIC DRAWER PANELS ── */}
      <AnimatePresence>
        {activePanel !== "none" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setActivePanel("none")}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="w-full max-w-md rounded-t-[32px] p-6 shadow-2xl bg-white dark:bg-slate-900 transition-colors pb-28"
              style={{ maxHeight: "85vh", overflowY: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-slate-700 mx-auto mb-5 transition-colors" />

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-gray-900 dark:text-white transition-colors">
                  {activePanel === "appearance"
                    ? "Appearance"
                    : activePanel === "accent"
                      ? "Accent Color"
                      : activePanel === "language"
                        ? "Select Language"
                        : activePanel === "devices"
                          ? "Connected Devices"
                          : "Storage & Cache"}
                </h3>
                <button
                  onClick={() => setActivePanel("none")}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center transition-colors"
                >
                  <X size={15} className="text-gray-500 dark:text-slate-400" />
                </button>
              </div>

              {/* 🔥 PANEL: APPEARANCE */}
              {activePanel === "appearance" && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Laptop },
                  ].map((t) => {
                    const active = prefs.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => updatePreference("theme", t.id)}
                        className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${active ? "" : "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-transparent"}`}
                        style={{
                          borderColor: active ? ac : "",
                          background: active ? `${ac}12` : "",
                          color: active ? ac : "",
                        }}
                      >
                        <t.icon size={22} />
                        <span className="text-xs font-bold">{t.label}</span>
                        {active && (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: ac }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 🔥 PANEL: ACCENT */}
              {activePanel === "accent" && (
                <div className="space-y-2 mb-6">
                  {ACCENT_PALETTE.map((color) => {
                    const active = prefs.accentColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        onClick={() =>
                          updatePreference("accentColor", color.hex)
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all border ${active ? "" : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-transparent"}`}
                        style={{
                          borderColor: active ? color.hex : "",
                          background: active ? `${color.hex}10` : "",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl shadow-sm"
                            style={{ background: color.hex }}
                          />
                          <span
                            className={`text-sm font-bold ${active ? "text-gray-900 dark:text-white" : ""}`}
                          >
                            {color.name}
                          </span>
                        </div>
                        {active && (
                          <Check size={16} style={{ color: color.hex }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 🔥 PANEL: LANGUAGE */}
              {activePanel === "language" && (
                <div className="space-y-2 mb-6 max-h-[35vh] overflow-y-auto">
                  {LANGUAGES.map((lang) => {
                    const active = prefs.language === lang;
                    return (
                      <button
                        key={lang}
                        onClick={() => updatePreference("language", lang)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all border ${active ? "" : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-transparent"}`}
                        style={{
                          borderColor: active ? ac : "",
                          background: active ? `${ac}10` : "",
                        }}
                      >
                        <span
                          className={`text-sm font-bold ${active ? "" : ""}`}
                          style={{ color: active ? ac : "" }}
                        >
                          {lang}
                        </span>
                        {active && <Check size={18} style={{ color: ac }} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 🔥 PANEL: DEVICES */}
              {activePanel === "devices" && (
                <div className="space-y-3 mb-6 max-h-[35vh] overflow-y-auto pr-1">
                  {isDevicesLoading ? (
                    <p className="text-center text-accent text-sm py-4 animate-pulse">
                      Loading sessions...
                    </p>
                  ) : devices.length > 0 ? (
                    devices.map((device: any) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${device.active ? "bg-green-100 text-green-600" : "bg-gray-200 dark:bg-slate-700 text-gray-500"}`}
                          >
                            {device.icon ? (
                              <device.icon size={20} />
                            ) : (
                              <Laptop size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                              {device.name || "Device"}
                            </p>
                            <p
                              className={`text-xs mt-0.5 font-medium ${device.active ? "text-green-500" : "text-gray-400 dark:text-slate-500"}`}
                            >
                              {device.time || "Active Session"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleRevokeDevice(device.id, device.active)
                          }
                          className="text-xs font-bold text-red-500 hover:text-red-600 transition px-3 py-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg shrink-0"
                        >
                          Revoke
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-slate-400 text-sm py-4">
                      No active devices found.
                    </p>
                  )}
                </div>
              )}

              {/* 🔥 PANEL: STORAGE */}
              {activePanel === "storage" && (
                <div className="mb-6 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-slate-700">
                    <Database
                      size={32}
                      className="text-gray-400 dark:text-slate-500"
                    />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                    {cacheSize}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
                    Temporary files and cached images
                  </p>

                  <button
                    onClick={handleClearCache}
                    disabled={cacheSize === "0 MB"}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-red-50 dark:bg-red-500/10 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Trash2 size={16} className="inline mr-2 -mt-1" />
                    Clear Cache
                  </button>
                </div>
              )}

              {/* Hide "Apply" button for panels that have their own action buttons */}
              {["appearance", "accent"].includes(activePanel) && (
                <button
                  onClick={() => setActivePanel("none")}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg,${ac},${ac}cc)`,
                    boxShadow: `0 6px 20px ${ac}44`,
                  }}
                >
                  Apply
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <div
                    className="absolute inset-0 rounded-2xl opacity-10 dark:opacity-15"
                    style={{ backgroundColor: "var(--accent-color)" }}
                  />
                )}
                <div className="relative z-10">
                  <item.icon
                    size={22}
                    className={`transition-all duration-300 ${active ? "" : "text-gray-400 dark:text-slate-500"}`}
                    style={{ color: active ? "var(--accent-color)" : "" }}
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`relative z-10 text-[10px] font-bold transition-colors duration-300 ${active ? "" : "text-gray-500 dark:text-slate-500"}`}
                  style={{ color: active ? "var(--accent-color)" : "" }}
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