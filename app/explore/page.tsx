"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Code2, Users, Lock, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const FEATURES = [
  {
    id: "network",
    title: "Developer Networking",
    subtitle: "Connect & Collaborate",
    description: "Find and connect with fellow students and developers. Build your network through a robust Follower/Following system and discover top talent in the community.",
    icon: Users,
    color: "from-gray-200 to-gray-400", // Metallic Silver
    shadow: "shadow-gray-500/10",
    stats: ["Global Search", "Follower Ecosystem"],
  },
  {
    id: "chat",
    title: "Real-Time Messaging",
    subtitle: "Lightning Fast Chat",
    description: "Seamless, instant communication powered by WebSockets. Features include live online/offline status, unread message alerts, emoji support, and secure media sharing.",
    icon: MessageCircle, 
    color: "from-slate-300 to-slate-500", // Deep Slate
    shadow: "shadow-slate-500/10",
    stats: ["Live Indicators", "Secure File Sharing"],
  },
  {
    id: "showcase",
    title: "Project Showcasing",
    subtitle: "Share Your Work",
    description: "Don't just write code, show it off. Create posts about your latest projects, share updates, and get featured on the 'Trending Now' community feed.",
    icon: Code2,
    color: "from-zinc-300 to-zinc-500", // Platinum/Zinc
    shadow: "shadow-zinc-500/10",
    stats: ["Trending Feed", "Interactive Posts"],
  },
  {
    id: "privacy",
    title: "Total Account Control",
    subtitle: "Privacy & Security",
    description: "You own your data. Toggle your public/private profile visibility, hide your active status, and stay protected with instant Email/SMS security alerts.",
    icon: ShieldCheck, 
    color: "from-stone-300 to-stone-500", // Warm Steel
    shadow: "shadow-stone-500/10",
    stats: ["Granular Privacy", "Instant Alerts"],
  },
];

export default function ExplorePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-gray-500/30 overflow-x-hidden">
      <Navbar />

      {/* ── PREMIUM 3D GRID BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
        {/* Subtle Perspective Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        {/* Deep Premium White/Silver Glow */}
        <div className="absolute top-[-10%] w-[800px] h-[500px] bg-white/[0.03] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* ── HEADER ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <button 
            onClick={() => router.push("/")}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-600 bg-gray-900/50 px-5 py-2.5 rounded-full shadow-lg"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          
          {/* 🔥 ADDED: font-display for main page title 🔥 */}
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-6 text-white">
            Inside the <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400">Orbit</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A sneak peek into the ultimate ecosystem for students. Everything you need to connect, build, and grow, packed in one secure platform.
          </p>
        </motion.div>

        {/* ── FEATURES SHOWCASE ── */}
        <div className="space-y-16 md:space-y-32 relative">
          
          {/* Vertical Connecting Line (Subtle Metallic) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent -translate-x-1/2" />

          {FEATURES.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-16`}
              >
                {/* Feature Content */}
                <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 text-xs font-bold uppercase tracking-widest text-gray-300 mb-6 shadow-md ${isEven ? "md:flex-row-reverse" : ""}`}>
                    <feature.icon size={14} className="text-gray-400" />
                    {feature.subtitle}
                  </div>
                  
                  {/* 🔥 ADDED: font-display for feature titles 🔥 */}
                  <h2 className="font-display text-3xl md:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
                    {feature.title}
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-8">
                    {feature.description}
                  </p>

                  <div className={`flex flex-wrap gap-3 ${isEven ? "md:justify-end" : "md:justify-start"}`}>
                    {feature.stats.map((stat, i) => (
                      <span key={i} className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm font-medium text-gray-400 shadow-inner">
                        {stat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Center Node (Metallic Dot) */}
                <div className="hidden md:flex relative w-12 h-12 items-center justify-center flex-shrink-0 z-10">
                  <div className="absolute inset-0 rounded-full bg-[#050505] border-4 border-[#121212]" />
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${feature.color} shadow-lg ${feature.shadow} ring-1 ring-white/20`} />
                </div>

                {/* 3D Premium Card Mockup */}
                <div className="flex-1 w-full relative group perspective-1000">
                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100" />
                  
                  {/* 🔥 HOVER ANIMATION 🔥 */}
                  <div className="relative rounded-[24px] bg-gradient-to-b from-gray-700 to-gray-900 p-[1px] shadow-[0_20px_40px_rgba(0,0,0,0.6)] transform transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:-translate-y-3 group-hover:shadow-[0_40px_70px_rgba(0,0,0,0.8)]">
                    <div className="bg-gradient-to-br from-[#121217] to-[#08080a] rounded-[23px] p-8 h-full flex flex-col items-center justify-center text-center min-h-[260px] relative overflow-hidden border-t border-white/10 shadow-inner">
                      
                      {/* Premium Shine Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

                      {/* EXCLUSIVE / GATED OVERLAY */}
                      <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
                        {/* 🔥 LOCK ICON ANIMATION 🔥 */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center mb-4 border border-gray-600 shadow-lg transform transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                          <Lock size={22} className="text-gray-300" />
                        </div>
                        {/* 🔥 ADDED: font-display for exclusive overlay title 🔥 */}
                        <p className="font-display text-lg font-bold text-gray-200 transform transition-transform duration-500 group-hover:-translate-y-1">Exclusive Member Area</p>
                        <p className="text-sm text-gray-500 mt-1 transform transition-transform duration-500 group-hover:-translate-y-1">Login to access this feature</p>
                      </div>

                      {/* Faded Background Icon */}
                      <feature.icon size={90} className="opacity-[0.03] text-white absolute transform transition-all duration-700 group-hover:scale-125 group-hover:opacity-[0.05]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── PREMIUM 3D CALL TO ACTION ── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 relative max-w-3xl mx-auto group"
        >
          {/* 3D Floating Container */}
          <div className="relative rounded-[28px] bg-gradient-to-b from-gray-600 to-gray-900 p-[1px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:-translate-y-1">
            
            {/* Inner Card Layer with bottom depth */}
            <div className="relative bg-gradient-to-br from-[#121217] to-[#08080a] rounded-[27px] p-10 md:p-14 text-center border-t border-white/10 border-b-[6px] border-black shadow-inner overflow-hidden">
              
              {/* Premium Subtle Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

              {/* 🔥 ADDED: font-display for CTA heading 🔥 */}
              <h2 className="font-display text-3xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 relative z-10">
                Ready to enter the Orbit?
              </h2>
              
              <p className="text-gray-400 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed relative z-10">
                Join the community to start networking, showcasing your projects, and chatting with peers in a secure environment.
              </p>
              
              {/* Premium 3D Tactile Button */}
              <button 
                onClick={() => router.push("/auth/register")}
                className="relative z-10 bg-gradient-to-b from-gray-100 to-gray-300 text-black px-8 py-4 rounded-full font-bold text-base transition-all duration-200 
                shadow-[0_6px_0_#9ca3af] 
                hover:shadow-[0_4px_0_#9ca3af] hover:translate-y-[2px] 
                active:shadow-[0_0px_0_#9ca3af] active:translate-y-[6px] 
                flex items-center gap-2 mx-auto border border-white/50"
              >
                Create Free Account <ArrowRight size={18} />
              </button>

            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}