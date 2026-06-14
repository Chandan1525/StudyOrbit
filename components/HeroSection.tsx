"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

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
    content:
      "Smart India Hackathon 2026 registrations are open! Anyone in EdTech looking for teammates with React + Node experience?",
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
    content:
      "Just shipped my first computer vision project — it detects drowsiness in students during online lectures using MediaPipe. Feedback appreciated!",
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
    content:
      "Google just updated their interview format — trees & graphs now have a 45-min limit. Here's what changed and how to prepare for it...",
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
    content:
      "Made my first open source contribution to VS Code! Just a small docs fix but it feels HUGE. Anyone else starting their OSS journey?",
    likes: 217,
    comments: 58,
  },
  {
    id: 5,
    initials: "VK",
    name: "Vikram Kaur",
    community: "DevOps",
    time: "3h ago",
    badge: "Discussion",
    badgeColor: "text-[#3ecfad] bg-[#0d3a2d]",
    avColor: "bg-[#0f4a3a] text-[#3ecfad]",
    content:
      "K8s or Docker Swarm for a college-scale project? Let's settle this once and for all — pros and cons inside the thread.",
    likes: 99,
    comments: 35,
  },
];

const COMMUNITIES = [
  "🧠 AI / ML",
  "🌐 Web Dev",
  "⚡ DSA & CP",
  "📱 Android Dev",
  "🔗 Blockchain",
  "🐧 Open Source",
  "☁️ DevOps",
  "🔐 Cybersecurity",
  "🤖 Robotics",
  "🎮 Game Dev",
  "📊 Data Science",
  "🧬 Bioinformatics",
];

// ─── 3-D Particle Canvas ──────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Brand colours with alpha placeholder
    const COLORS = [
      "rgba(108,99,255,",  // purple
      "rgba(62,207,173,",  // teal
      "rgba(157,149,245,", // soft lavender
      "rgba(66,184,245,",  // blue
    ] as const;

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Particles
    const COUNT = 90;
    type Particle = {
      x: number; y: number; z: number;
      vx: number; vy: number;
      color: string; size: number; opacity: number;
    };
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: rand(0, 1),
      y: rand(0, 1),
      z: rand(0.2, 1),
      vx: rand(-0.00012, 0.00012),
      vy: rand(-0.00008, 0.00008),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: rand(1.2, 3.5),
      opacity: rand(0.3, 0.85),
    }));

    // Drifting light streaks
    type Streak = {
      x1: number; y1: number; x2: number; y2: number;
      vx1: number; vy1: number; vx2: number; vy2: number;
      color: string; opacity: number;
    };
    const streaks: Streak[] = Array.from({ length: 12 }, () => ({
      x1: rand(0, 0.55), y1: rand(0.1, 0.9),
      x2: rand(0, 0.55), y2: rand(0.1, 0.9),
      vx1: rand(-0.00008, 0.00008), vy1: rand(-0.00006, 0.00006),
      vx2: rand(-0.00008, 0.00008), vy2: rand(-0.00006, 0.00006),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: rand(0.04, 0.12),
    }));

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Draw streaks
      for (const s of streaks) {
        s.x1 += s.vx1; s.y1 += s.vy1;
        s.x2 += s.vx2; s.y2 += s.vy2;
        if (s.x1 < 0 || s.x1 > 1) s.vx1 *= -1;
        if (s.y1 < 0 || s.y1 > 1) s.vy1 *= -1;
        if (s.x2 < 0 || s.x2 > 1) s.vx2 *= -1;
        if (s.y2 < 0 || s.y2 > 1) s.vy2 *= -1;
        ctx.beginPath();
        ctx.moveTo(s.x1 * W, s.y1 * H);
        ctx.lineTo(s.x2 * W, s.y2 * H);
        ctx.strokeStyle = s.color + s.opacity + ")";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw particles depth-sorted: far → near
      const sorted = [...particles].sort((a, b) => a.z - b.z);
      for (let i = 0; i < sorted.length; i++) {
        const p = sorted[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        const px = p.x * W;
        const py = p.y * H;
        const r = p.size * p.z;

        // Glow halo
        const grd = ctx.createRadialGradient(px, py, 0, px, py, r * 2.8);
        grd.addColorStop(0, p.color + p.opacity * p.z + ")");
        grd.addColorStop(1, p.color + "0)");
        ctx.beginPath();
        ctx.arc(px, py, r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Constellation lines between nearby particles
        for (let j = i + 1; j < sorted.length; j++) {
          const q = sorted[j];
          const dx = (p.x - q.x) * W;
          const dy = (p.y - q.y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            const alpha = (1 - dist / 80) * 0.07 * Math.min(p.z, q.z);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(q.x * W, q.y * H);
            ctx.strokeStyle = p.color + alpha + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <>
      {/* ── Main hero wrapper ── */}
      <section className="relative max-w-[1200px] mx-auto overflow-hidden bg-[#0a0a0f]">
        {/* 3-D canvas background */}
        <ParticleCanvas />

        {/* Radial colour blobs layered above canvas */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 28% 50%, rgba(108,99,255,0.10) 0%, transparent 70%), " +
              "radial-gradient(ellipse 38% 42% at 80% 28%, rgba(62,207,173,0.07) 0%, transparent 60%)",
          }}
        />

        {/* Content grid */}
        <div className="relative z-[2] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center px-6 md:px-10 py-16 md:py-20 min-h-[calc(100vh-60px)]">

          {/* ── Left: Copy ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:pr-16"
          >
            {/* Live badge — font-sans = Inter (via globals.css @theme) */}
            <div className="inline-flex items-center gap-2 text-[12px] font-medium text-[#3ecfad] tracking-widest uppercase mb-6 font-sans">
              <motion.div
                animate={{ scale: [1, 0.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#3ecfad]"
              />
              Tech community for students
            </div>

            {/* Headline — font-display = Syne (via globals.css @theme) */}
            <h1 className="font-display text-[40px] md:text-[56px] font-extrabold leading-[1.08] tracking-tight mb-6 text-white">
              LinkedIn for <br />
              <span className="text-[#6c63ff]">tech students.</span>
              <br />
              <span className="text-[#3ecfad]">Built different.</span>
            </h1>

            {/* Subtext — font-sans = Inter */}
            <p className="font-sans text-[#7a7a8c] text-[16px] leading-relaxed mb-10 max-w-[440px]">
              Share projects, discover hackathons, join communities and chat
              with people who actually care about tech — not reels, not
              filters, not noise.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                href="/auth/register"
                className="font-sans text-[15px] font-semibold text-white bg-[#6c63ff] hover:bg-[#5b54e5] px-7 py-3.5 rounded-xl transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#6c63ff]/20"
              >
                Join the community →
              </Link>
              <Link
                href="/explore"
                className="font-sans text-[15px] font-medium text-[#7a7a8c] border border-white/10 hover:border-white/30 hover:text-white px-7 py-3.5 rounded-xl transition-all"
              >
                See what&apos;s inside
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-white/10">
              {[
                { val: "12K+", lbl: "Students joined" },
                { val: "340+", lbl: "Active communities" },
                { val: "1.8K+", lbl: "Projects shared" },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  {/* font-display = Syne for brand numbers */}
                  <div className="font-display text-[22px] font-extrabold tracking-tight text-white">
                    {val}
                  </div>
                  {/* font-sans = Inter for labels */}
                  <div className="font-sans text-[12px] text-[#7a7a8c] mt-0.5">
                    {lbl}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Auto-scrolling feed mockup ── */}
          <div className="relative w-full h-[550px] overflow-hidden rounded-2xl">
            {/* Fade masks */}
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 w-full h-[80px] bg-gradient-to-b from-[#0a0a0f] to-transparent z-10 pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-full h-[120px] bg-gradient-to-t from-[#0a0a0f] to-transparent z-10 pointer-events-none"
            />

            {/* Animated feed — duplicated for seamless loop */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col gap-4 pt-10 animate-feed-scroll"
            >
              {[...FEED_POSTS, ...FEED_POSTS].map((post, idx) => (
                <motion.div
                  key={`${post.id}-${idx}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.2 + (idx % FEED_POSTS.length) * 0.12,
                    duration: 0.5,
                  }}
                  whileHover={{ borderColor: "rgba(255,255,255,0.15)" }}
                  className="bg-[#111118] border border-white/5 rounded-[14px] p-4 transition-colors"
                >
                  {/* Post header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 font-sans ${post.avColor}`}
                    >
                      {post.initials}
                    </div>
                    <div>
                      <div className="font-sans text-[13px] font-semibold text-white">
                        {post.name}
                      </div>
                      <div className="font-sans text-[11px] text-[#4a4a5a]">
                        {post.community} · {post.time}
                      </div>
                    </div>
                    <span
                      className={`ml-auto font-sans text-[10px] font-semibold px-2.5 py-1 rounded-full ${post.badgeColor}`}
                    >
                      {post.badge}
                    </span>
                  </div>

                  {/* Post body */}
                  <p className="font-sans text-[13px] text-[#7a7a8c] leading-[1.6] mb-3">
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-4 font-sans text-[11px] text-[#4a4a5a]">
                    <span className="flex items-center gap-1.5">
                      <Heart size={13} className="opacity-60" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle size={13} className="opacity-60" />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Share2 size={13} className="opacity-60" />
                      Share
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Community strip ── */}
      <div
        id="community"
        className="bg-[#111118] border-y border-white/5 py-4 overflow-hidden flex"
      >
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex gap-3 whitespace-nowrap min-w-max"
        >
          {[...COMMUNITIES, ...COMMUNITIES].map((comm, idx) => (
            <span
              key={idx}
              className="font-sans text-[12px] font-medium px-4 py-1.5 rounded-full border border-white/5 bg-[#18181f] text-[#7a7a8c] hover:border-white/10 hover:text-white transition-colors cursor-default"
            >
              {comm}
            </span>
          ))}
        </motion.div>
      </div>
    </>
  );
}