"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AtSign,
  Phone,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

// ─── 3D Fluid WebGL Background (Violet & Blue Tone) ──────────────────────────
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

    // Fragment Shader: Generates the 3D fluid silk effect with Violet/Blue tones
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

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
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          vec2 q = vec2(0.0);
          q.x = fbm(uv + 0.1 * u_time);
          q.y = fbm(uv + vec2(1.0));

          vec2 r = vec2(0.0);
          r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.05 * u_time);
          r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.05 * u_time);

          float f = fbm(uv + r);

          // NEW COLOR PALETTE: Slate, Violet (#8b5cf6), Blue (#3b82f6)
          vec3 colorBase = vec3(0.04, 0.05, 0.08); // Deep Slate
          vec3 colorViolet = vec3(0.545, 0.360, 0.964); // #8b5cf6
          vec3 colorBlue = vec3(0.231, 0.509, 0.964);   // #3b82f6

          vec3 col = mix(colorBase, colorViolet, clamp((f * f) * 1.5, 0.0, 1.0));
          col = mix(col, colorBlue, clamp(length(q) * 0.3, 0.0, 1.0));
          col = mix(col, colorBase, clamp(length(r.x) * 1.5, 0.0, 1.0));

          float highlight = smoothstep(0.3, 0.7, f);
          col += highlight * vec3(0.2, 0.2, 0.25); 

          col *= smoothstep(0.0, 0.8, f + 0.3);

          gl_FragColor = vec4(col, 1.0);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
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

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
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

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  // ───────────────── STANDARD REGISTER ─────────────────
  const handleRegister = async () => {
    if (!name || !username || !email || !phone || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            username,
            email,
            mobile: phone,
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Registration failed");
    }
  };

  // ───────────────── GOOGLE REGISTER ─────────────────
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        alert("Google Account Created & Logged In!");
        router.push("/dashboard");
      } else {
        alert(data.message || "Google Registration failed on server");
        console.error("Backend validation failed:", data.message);
      }
    } catch (error) {
      console.error("Error communicating with backend", error);
      alert("Cannot connect to server for Google Registration.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden overflow-y-auto text-white flex items-center justify-center px-4 py-12 font-sans selection:bg-[#8b5cf6]/30">
      
      {/* ── 3D Fluid Background ── */}
      <FluidBackground />

      {/* Dim overlay to ensure the form stays readable against the fluid */}
      <div className="absolute inset-0 bg-slate-950/40 z-0 pointer-events-none" />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[430px]"
      >
        <div
          className="relative rounded-[26px] px-8 py-8 shadow-2xl overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)`,
          }}
        >
          {/* Gloss */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[26px]"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04), transparent 40%)",
            }}
          />

          {/* Logo */}
          <div className="text-center mb-6 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                }}
              >
                SO
              </div>

              <span className="font-display text-2xl font-black tracking-wide text-white">
                Study<span className="text-[#8b5cf6]">Orbit</span>
              </span>
            </Link>

            <h2 className="font-display text-xl font-bold text-white mb-1">
              Create account
            </h2>

            <p className="text-[13px] text-slate-400 font-medium">
              Start your journey with StudyOrbit
            </p>
          </div>

          {/* Google Button Component */}
          <div className="relative z-10 flex justify-center w-full mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log("Google Registration Failed");
                alert("Google Registration Failed. Please try again.");
              }}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          </div>

          {/* Divider */}
          <div className="relative z-10 flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] font-semibold tracking-widest text-slate-500">
              OR REGISTER WITH EMAIL
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <div className="relative z-10 space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold mb-2 block uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-xl text-[14px] text-white placeholder-slate-500 bg-white/5 border border-white/10 outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-[11px] font-bold mb-2 block uppercase tracking-wider text-slate-400">
                Username
              </label>
              <div className="relative">
                <AtSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-xl text-[14px] text-white placeholder-slate-500 bg-white/5 border border-white/10 outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-bold mb-2 block uppercase tracking-wider text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-xl text-[14px] text-white placeholder-slate-500 bg-white/5 border border-white/10 outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[11px] font-bold mb-2 block uppercase tracking-wider text-slate-400">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-xl text-[14px] text-white placeholder-slate-500 bg-white/5 border border-white/10 outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-bold mb-2 block uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-[14px] text-white placeholder-slate-500 bg-white/5 border border-white/10 outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <motion.button
              type="button"
              onClick={handleRegister}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl font-semibold text-[15px] text-white flex items-center justify-center gap-2 mt-4 shadow-lg shadow-[#8b5cf6]/20"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
            >
              Create Account
              <ArrowRight size={16} />
            </motion.button>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-center mt-6 text-[13px]">
            <span className="text-slate-400">Already have an account? </span>
            <Link href="/auth/login" className="text-[#3b82f6] font-medium hover:text-[#60a5fa] transition-colors">
              Login
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Success Popup */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="w-[90%] max-w-[360px] rounded-2xl px-7 py-8 text-center bg-slate-900 border border-[#8b5cf6]/30 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-white mb-3">
              Account Created
            </h2>
            <p className="text-[14px] leading-6 mb-6 text-slate-400">
              Your account has been created successfully. Please login to continue.
            </p>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold text-white text-[15px] shadow-lg shadow-[#8b5cf6]/20"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}
              >
                Go to Login
              </motion.button>
            </Link>
          </motion.div>
        </div>
      )}
    </main>
  );
}