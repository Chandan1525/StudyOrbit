"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from '@react-oauth/google';

// ── Topo Canvas ────────────────────────────────────────────────────────
function TopoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const timeRef   = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const t = timeRef.current;
    const cx = W * 0.52, cy = H * 0.48;
    for (let i = 0; i < 22; i++) {
      const progress = i / 22;
      const phase  = t * 0.4 + i * 0.28;
      const baseRx = 40 + i * 22 + Math.sin(phase * 0.7) * 18;
      const baseRy = 28 + i * 15 + Math.cos(phase * 0.5) * 14;
      const angle  = t * 0.015 + i * 0.04;
      const hue = 40 - progress * 6, sat = 78 - progress * 12;
      const light = 35 + progress * 22, alpha = 0.65 - progress * 0.015;
      ctx.beginPath();
      for (let s = 0; s <= 120; s++) {
        const theta = (s / 120) * Math.PI * 2;
        const distort = Math.sin(theta*2+phase)*0.12 + Math.sin(theta*3-phase*0.6)*0.08 + Math.sin(theta*5+phase*0.4)*0.05 + Math.cos(theta*4+phase*0.8)*0.06;
        const rx = baseRx*(1+distort), ry = baseRy*(1+distort*0.8);
        const rotX = rx*Math.cos(theta)*Math.cos(angle) - ry*Math.sin(theta)*Math.sin(angle);
        const rotY = rx*Math.cos(theta)*Math.sin(angle) + ry*Math.sin(theta)*Math.cos(angle);
        s === 0 ? ctx.moveTo(cx+rotX, cy+rotY) : ctx.lineTo(cx+rotX, cy+rotY);
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue},${sat}%,${light}%,${alpha})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
    timeRef.current += 0.012;
    frameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    frameRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(frameRef.current); };
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity:0.95 }} />;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier]     = useState("");
  const [password, setPassword]         = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState("");
  const router = useRouter();

  // ── Standard email/password login ────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) { setError("Please fill in all fields."); return; }
    setIsLoading(true); setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        // 🔥 FIX: Ab seedha backend ka fresh data save hoga, purana mix nahi hoga
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err: any) {
      if (err.message?.includes("fetch")) {
        setError("Cannot connect to server. Make sure backend is running on port 5000.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google OAuth login ────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true); setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        // 🔥 FIX: Yahan par bhi seedha backend ka fresh data save hoga
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.message || "Google Login failed.");
      }
    } catch {
      setError("Cannot connect to server for Google Login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-6">
      <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 130% 90% at 65% 55%, #0f0c00 0%, #080600 45%, #000000 100%)" }} />
      <div className="absolute bottom-0 left-0 w-[520px] h-[420px] pointer-events-none" style={{ background:"radial-gradient(ellipse at 0% 100%, rgba(180,130,0,0.12) 0%, transparent 65%)" }} />
      <div className="absolute pointer-events-none" style={{ width:420, height:360, top:"18%", left:"38%", background:"radial-gradient(ellipse, rgba(200,150,0,0.09) 0%, transparent 70%)" }} />
      <TopoCanvas />
      <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 65% 70% at 22% 50%, transparent 25%, rgba(0,0,0,0.55) 100%)" }} />

      <motion.div
        initial={{ opacity:0, y:60 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative rounded-[28px] p-10 shadow-2xl overflow-hidden"
          style={{ background:"rgba(10,10,10,0.32)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", border:"1px solid rgba(245,200,66,0.18)", boxShadow:"0 8px 32px rgba(0,0,0,0.45), 0 0 40px rgba(245,200,66,0.08)" }}>
          <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.08),transparent 35%)" }} />

          {/* Logo */}
          <div className="text-center mb-9">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-black"
                style={{ background:"linear-gradient(135deg,#f5c842,#c9a227)" }}>SO</div>
              <span className="text-2xl font-black tracking-wide text-white">
                Study<span style={{ color:"#c9a227" }}>Orbit</span>
              </span>
            </Link>
            <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-sm" style={{ color:"#7a6a4a" }}>Sign in to your student ecosystem</p>
          </div>

          {/* Google */}
          <div className="flex justify-center mb-6 w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed. Please try again.")}
              theme="filled_black" shape="pill" text="continue_with"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background:"rgba(200,160,40,0.12)" }} />
            <span className="text-xs" style={{ color:"#5a4e32" }}>OR SIGN IN WITH EMAIL</span>
            <div className="flex-1 h-px" style={{ background:"rgba(200,160,40,0.12)" }} />
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl text-xs font-semibold text-center"
              style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color:"#8a7a5a" }}>Email / Username</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color:"#6a5a3a" }} />
                <input type="text" placeholder="Enter your email or username"
                  value={identifier} onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-5 py-3.5 rounded-2xl text-sm text-white placeholder-[#4a3e28] outline-none"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(200,160,40,0.15)" }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color:"#8a7a5a" }}>Password</label>
                <Link href="/auth/forgot-password" className="text-xs" style={{ color:"#c9a227" }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color:"#6a5a3a" }} />
                <input type={showPassword ? "text" : "password"} placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm text-white placeholder-[#4a3e28] outline-none"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(200,160,40,0.15)" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.button type="submit" disabled={isLoading}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              className="w-full py-4 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 shadow-lg mt-2"
              style={{ background:"linear-gradient(135deg,#f5c842,#c9a227)", opacity:isLoading?0.7:1 }}>
              {isLoading ? "Signing in..." : <> Sign In <ArrowRight size={16} /> </>}
            </motion.button>
          </form>

          {/* Register */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background:"rgba(200,160,40,0.12)" }} />
            <span className="text-xs" style={{ color:"#5a4e32" }}>NEW TO STUDYORBIT?</span>
            <div className="flex-1 h-px" style={{ background:"rgba(200,160,40,0.12)" }} />
          </div>

          <Link href="/auth/register">
            <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-center cursor-pointer"
              style={{ border:"1px solid rgba(200,160,40,0.25)", color:"#c9a227", background:"rgba(200,160,40,0.04)" }}>
              Create a free account →
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}