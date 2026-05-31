"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const STATS = [
  { value: "50K+", label: "Students" },
  { value: "200+", label: "Communities" },
  { value: "12K+", label: "Resources" },
  { value: "3K+", label: "Opportunities" },
];

// ── Topographic contour canvas — matches the reference image ──
function TopoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const t = timeRef.current;
    const cx = W * 0.52;
    const cy = H * 0.48;
    const LINES = 22;

    for (let i = 0; i < LINES; i++) {
      const progress = i / LINES; // 0 → 1
      // Each contour is slightly offset & phase-shifted for organic feel
      const phase = t * 0.4 + i * 0.28;
      const baseRx = 40 + i * 22 + Math.sin(phase * 0.7) * 18;
      const baseRy = 28 + i * 15 + Math.cos(phase * 0.5) * 14;

      // Rotate each layer slightly over time
      const angle = t * 0.015 + i * 0.04;

      // Color: deep blue → purple → pink (matching the reference)
      const hue = 220 + progress * 100; // 220 blue → 320 pink
      const sat = 70 + progress * 20;
      const light = 45 + progress * 20;
      const alpha = 0.55 - progress * 0.02;

      ctx.beginPath();

      // Draw a distorted ellipse as the contour line
      const segments = 120;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;

        // Noise-like distortion using multiple sine harmonics
        const distort =
          Math.sin(theta * 2 + phase) * 0.12 +
          Math.sin(theta * 3 - phase * 0.6) * 0.08 +
          Math.sin(theta * 5 + phase * 0.4) * 0.05 +
          Math.cos(theta * 4 + phase * 0.8) * 0.06;

        const rx = baseRx * (1 + distort);
        const ry = baseRy * (1 + distort * 0.8);

        // Apply rotation
        const rotX =
          rx * Math.cos(theta) * Math.cos(angle) -
          ry * Math.sin(theta) * Math.sin(angle);
        const rotY =
          rx * Math.cos(theta) * Math.sin(angle) +
          ry * Math.sin(theta) * Math.cos(angle);

        const x = cx + rotX;
        const y = cy + rotY;

        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Bottom-right smaller cluster (like in reference image)
    const cx2 = W * 0.82;
    const cy2 = H * 0.72;
    const LINES2 = 14;

    for (let i = 0; i < LINES2; i++) {
      const progress = i / LINES2;
      const phase = t * 0.35 + i * 0.32 + 2.5;
      const baseRx = 20 + i * 13 + Math.sin(phase * 0.6) * 10;
      const baseRy = 14 + i * 9 + Math.cos(phase * 0.5) * 8;
      const angle = -t * 0.012 + i * 0.05;

      const hue = 230 + progress * 90;
      const alpha = 0.45 - progress * 0.02;

      ctx.beginPath();
      const segments = 100;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const distort =
          Math.sin(theta * 2 + phase) * 0.1 +
          Math.sin(theta * 4 - phase * 0.5) * 0.07 +
          Math.cos(theta * 3 + phase * 0.9) * 0.05;

        const rx = baseRx * (1 + distort);
        const ry = baseRy * (1 + distort * 0.7);
        const rotX =
          rx * Math.cos(theta) * Math.cos(angle) -
          ry * Math.sin(theta) * Math.sin(angle);
        const rotY =
          rx * Math.cos(theta) * Math.sin(angle) +
          ry * Math.sin(theta) * Math.cos(angle);

        const x = cx2 + rotX;
        const y = cy2 + rotY;
        s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue}, 65%, 50%, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    timeRef.current += 0.012;
    frameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.9 }}
    />
  );
}

export default function HeroSection() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  // 🔥 Smooth Scroll Function 🔥
  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("Element with id 'features' not found. Add id='features' to your next section!");
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden flex flex-col"
    >
      {/* Very dark navy base — matches reference exactly */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 60% 50%, #0d0d2b 0%, #06060f 60%, #000000 100%)",
        }}
      />

      {/* Subtle bottom-left purple glow */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 0% 100%, rgba(88,28,255,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Topographic contour lines — THE KEY VISUAL */}
      <TopoCanvas />

      {/* Slight vignette over canvas so text pops */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 25% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Hero Content */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 flex flex-col items-center justify-start pt-[120px] md:pt-[160px] text-center px-4 flex-1 pb-16 w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="uppercase text-blue-400 text-xs md:text-sm mb-6 font-medium"
          ></motion.p>

          <h1
            className="font-black tracking-tighter leading-[0.9] mb-4"
            style={{ fontSize: "clamp(3.5rem, 18vw, 9rem)" }}
          >
            STUDY
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #60a5fa, #a855f7, #ec4899, #f97316)",
              }}
            >
              ORBIT
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-gray-400 text-base md:text-lg mt-8 leading-relaxed">
            A growth-oriented platform where students learn, collaborate,
            showcase projects, and launch careers — together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            {/* 🔥 Get Started: Route to Register 🔥 */}
            <motion.button
              onClick={() => router.push("/auth/register")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white text-black px-8 py-3.5 rounded-full font-semibold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-shadow duration-300"
            >
              Get Started <ArrowRight size={16} />
            </motion.button>
            
            {/* 🔥 Explore Platform: Smooth Scroll 🔥 */}
            <motion.button
              onClick={() => router.push("/explore")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="border border-white/20 px-8 py-3.5 rounded-full text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
            >
              Explore Platform
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-10 mt-16">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {s.value}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-widest">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}