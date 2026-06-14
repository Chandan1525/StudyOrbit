"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";

const FEED_POSTS = [
  {
    id: 1,
    initials: "RK",
    name: "Rohit Kumar",
    community: "Web Dev community",
    time: "2h ago",
    badge: "Hackathon",
    badgeColor: "text-[#9d95f5] bg-[#1e1a4a]",
    avColor: "bg-[#2a1f6e] text-[#9d95f5]",
    content: "Smart India Hackathon 2026 registrations are open! Anyone in EdTech looking for teammates with React + Node experience?",
    likes: 84,
    comments: 23,
  },
  {
    id: 2,
    initials: "PS",
    name: "Priya Sharma",
    community: "AI / ML community",
    time: "5h ago",
    badge: "Project",
    badgeColor: "text-[#3ecfad] bg-[#0d3a2d]",
    avColor: "bg-[#0f4a3a] text-[#3ecfad]",
    content: "Just shipped my first computer vision project — it detects drowsiness in students during online lectures using MediaPipe. Feedback appreciated!",
    likes: 142,
    comments: 47,
  },
  {
    id: 3,
    initials: "AM",
    name: "Aryan Mishra",
    community: "DSA & CP",
    time: "1d ago",
    badge: "News",
    badgeColor: "text-[#f5b842] bg-[#3a2000]",
    avColor: "bg-[#3a2a0f] text-[#f5b842]",
    content: "Google just updated their interview format — trees & graphs now have a 45-min limit. Here's what changed and how to prepare for it...",
    likes: 310,
    comments: 91,
  },
  {
    id: 4,
    initials: "NS",
    name: "Nisha Singh",
    community: "Open Source",
    time: "2d ago",
    badge: "Open Source",
    badgeColor: "text-[#42b8f5] bg-[#0d2a3a]",
    avColor: "bg-[#1f3a4a] text-[#42b8f5]",
    content: "Made my first open source contribution to VS Code! Just a small docs fix but it feels HUGE. Anyone else starting their OSS journey?",
    likes: 217,
    comments: 58,
  }
];

const COMMUNITIES = [
  "🧠 AI / ML", "🌐 Web Dev", "⚡ DSA & CP", "📱 Android Dev", 
  "🔗 Blockchain", "🐧 Open Source", "☁️ DevOps", "🔐 Cybersecurity", 
  "🤖 Robotics", "🎮 Game Dev", "📊 Data Science", "🧬 Bioinformatics"
];

export default function HeroSection() {
  return (
    <>
      <section className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center px-6 md:px-10 py-16 md:py-20 min-h-[calc(100vh-60px)]">
        
        {/* Left: Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:pr-16"
        >
          <div className="inline-flex items-center gap-2 text-[12px] font-medium text-[#3ecfad] tracking-widest uppercase mb-6">
            <motion.div 
              animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#3ecfad]" 
            />
            Tech community for students
          </div>
          
          <h1 className="font-display text-[40px] md:text-[56px] font-extrabold leading-[1.1] tracking-tight mb-6 text-white">
            LinkedIn for <br />
            <span className="text-[#6c63ff]">tech students.</span><br />
            <span className="text-[#3ecfad]">Built different.</span>
          </h1>
          
          <p className="text-[#7a7a8c] text-[16px] leading-relaxed mb-10 max-w-[440px]">
            Share projects, discover hackathons, join communities and chat with people who actually care about tech — not reels, not filters, not noise.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-12">
            <Link href="/auth/register" className="text-[15px] font-semibold text-white bg-[#6c63ff] hover:bg-[#5b54e5] px-7 py-3.5 rounded-xl transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#6c63ff]/20">
              Join the community →
            </Link>
            
            {/* 🔥 YAHAN CHANGE KIYA HAI: href="/explore" kar diya hai 🔥 */}
            <Link href="/explore" className="text-[15px] font-medium text-[#7a7a8c] border border-white/10 hover:border-white/30 hover:text-white px-7 py-3.5 rounded-xl transition-all">
              See what's inside
            </Link>
          </div>

          <div className="flex gap-8 pt-8 border-t border-white/10">
            <div>
              <div className="font-display text-[22px] font-extrabold tracking-tight text-white">12K+</div>
              <div className="text-[12px] text-[#7a7a8c] mt-0.5">Students joined</div>
            </div>
            <div>
              <div className="font-display text-[22px] font-extrabold tracking-tight text-white">340+</div>
              <div className="text-[12px] text-[#7a7a8c] mt-0.5">Active communities</div>
            </div>
            <div>
              <div className="font-display text-[22px] font-extrabold tracking-tight text-white">1.8K+</div>
              <div className="text-[12px] text-[#7a7a8c] mt-0.5">Projects shared</div>
            </div>
          </div>
        </motion.div>

        {/* Right: Feed Mockup */}
        <div className="relative w-full h-[550px] overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-full h-[80px] bg-gradient-to-b from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-[120px] bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
          
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col gap-4 pt-10"
          >
            {FEED_POSTS.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + (idx * 0.15), duration: 0.5 }}
                whileHover={{ borderColor: "rgba(255,255,255,0.15)" }}
                className="bg-[#111118] border border-white/5 rounded-[14px] p-4 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${post.avColor}`}>
                    {post.initials}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-white">{post.name}</div>
                    <div className="text-[11px] text-[#4a4a5a]">{post.community} · {post.time}</div>
                  </div>
                  <span className={`ml-auto text-[10px] font-medium px-2.5 py-1 rounded-full ${post.badgeColor}`}>
                    {post.badge}
                  </span>
                </div>
                <p className="text-[13px] text-[#7a7a8c] leading-[1.6] mb-3">
                  {post.content}
                </p>
                <div className="flex gap-4 text-[11px] text-[#4a4a5a]">
                  <span className="flex items-center gap-1.5"><Heart size={14} className="opacity-60" /> {post.likes}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle size={14} className="opacity-60" /> {post.comments}</span>
                  <span className="flex items-center gap-1.5"><Share2 size={14} className="opacity-60" /> Share</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Strip */}
      <div id="community" className="bg-[#111118] border-y border-white/5 py-4 overflow-hidden flex">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex gap-3 whitespace-nowrap min-w-max"
        >
          {[...COMMUNITIES, ...COMMUNITIES].map((comm, idx) => (
            <span key={idx} className="text-[12px] font-medium px-4 py-1.5 rounded-full border border-white/5 bg-[#18181f] text-[#7a7a8c] hover:border-white/10 hover:text-white transition-colors cursor-default">
              {comm}
            </span>
          ))}
        </motion.div>
      </div>
    </>
  );
}