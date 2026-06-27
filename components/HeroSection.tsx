"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef } from "react";

// ─── 3D Fluid WebGL Background ───────────────────────────────────────────────

function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Vertex Shader: Maps the canvas to a 2D plane
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Generates the 3D fluid silk effect
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      // Classic rotation and noise functions
      mat2 rot(float a) {
          float s = sin(a), c = cos(a);
          return mat2(c, -s, s, c);
      }

      float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Fractional Brownian Motion for the fluid ripples
      float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          vec2 shift = vec2(100.0);
          for (int i = 0; i < 6; ++i) {
              v += a * noise(p);
              p = rot(0.5) * p * 2.0 + shift;
              a *= 0.5;
          }
          return v;
      }

      void main() {
          // Normalize coordinates
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;

          // Domain warping (feeding noise into noise to get liquid folds)
          vec2 q = vec2(0.0);
          q.x = fbm(uv + 0.1 * u_time);
          q.y = fbm(uv + vec2(1.0));

          vec2 r = vec2(0.0);
          // Slowed down the time multiplier for a heavy, viscous liquid feel
          r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.05 * u_time);
          r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.05 * u_time);

          float f = fbm(uv + r);

          // Brand Colors
          vec3 colorBlack = vec3(0.02, 0.02, 0.04); // Deep background black
          vec3 colorPurple = vec3(0.42, 0.39, 1.0); // #6c63ff
          vec3 colorTeal = vec3(0.24, 0.81, 0.68);  // #3ecfad

          // Mix colors based on the noise coordinates to create flowing gradients
          vec3 col = mix(colorBlack, colorPurple, clamp((f * f) * 1.5, 0.0, 1.0));
          col = mix(col, colorTeal, clamp(length(q) * 0.3, 0.0, 1.0));
          col = mix(col, colorBlack, clamp(length(r.x) * 1.5, 0.0, 1.0));

          // Fake 3D Specular lighting (the shiny silk highlights)
          float highlight = smoothstep(0.3, 0.7, f);
          col += highlight * vec3(0.15, 0.15, 0.2);

          // Vignette / Deepen overall shadows
          col *= smoothstep(0.0, 0.8, f + 0.3);

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Boilerplate WebGL setup
    function createShader(
      gl: WebGLRenderingContext,
      type: number,
      source: string,
    ) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();

    if (!program || !vertexShader || !fragmentShader) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Create a full-screen quad
    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;
    let startTime = performance.now();

    const render = (time: number) => {
      const elapsedTime = (time - startTime) / 1000;
      gl.uniform1f(timeLocation, elapsedTime);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
    />
  );
}

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

// ─── Hero Section ─────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <>
      {/* ── Main hero wrapper — full width, no max-width so background spans whole screen ── */}
      <section className="relative w-full overflow-hidden bg-black">
        {/* WebGL Fluid Background — spans full section */}
        <FluidBackground />

        {/* Bottom fade so the fluid blends smoothly into the next (flat black) section */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full h-[220px] bg-gradient-to-b from-transparent to-black z-[1] pointer-events-none"
        />

        {/* Content grid — constrained to max-w-[1400px] and centered */}
        <div className="relative z-[2] max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center px-6 md:px-10 py-16 md:py-20 min-h-screen">
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
            {/* 🔥 Headline — Large Font Size Applied 🔥 */}
            <h1 className="font-display text-[50px] md:text-[72px] font-bold leading-[1] tracking-tight mb-8 text-white">
              LinkedIn for <br />
              <span className="text-[#6c63ff]">tech students.</span>
              <br />
              <span className="text-[#3ecfad]">Built different.</span>
            </h1>

            {/* Subtext — font-sans = Inter */}
            <p className="font-sans text-[#7a7a8c] text-[16px] leading-relaxed mb-10 max-w-[440px]">
              Share projects, discover hackathons, join communities and chat
              with people who actually care about tech — not reels, not filters,
              not noise.
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
                { val: "50+", lbl: "Students joined" },
                { val: "10+", lbl: "Active communities" },
                { val: "20+", lbl: "Projects shared" },
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
              className="absolute top-0 left-0 w-full h-[80px] bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-full h-[120px] bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"
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
                  // Adjusted background opacity slightly so the fluid shows through the cards
                  className="bg-[#111118]/80 backdrop-blur-md border border-white/5 rounded-[14px] p-4 transition-colors"
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
        className="bg-[#111118] border-y border-white/5 py-4 overflow-hidden flex relative z-[2]"
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
