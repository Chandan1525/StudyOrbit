"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  ArrowLeft,
  Loader2, // <-- Added a loader icon for the sending state
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useCallback, useEffect, useState } from "react";

// ───────────────── TOPO BACKGROUND ─────────────────
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

    for (let i = 0; i < 22; i++) {
      const progress = i / 22;
      const phase = t * 0.4 + i * 0.28;
      const baseRx = 40 + i * 22 + Math.sin(phase * 0.7) * 18;
      const baseRy = 28 + i * 15 + Math.cos(phase * 0.5) * 14;
      const angle = t * 0.015 + i * 0.04;
      const hue = 355 - progress * 20;
      const sat = 72 - progress * 14;
      const light = 42 + progress * 24;
      const alpha = 0.62 - progress * 0.015;

      ctx.beginPath();

      for (let s = 0; s <= 120; s++) {
        const theta = (s / 120) * Math.PI * 2;
        const distort =
          Math.sin(theta * 2 + phase) * 0.12 +
          Math.sin(theta * 3 - phase * 0.6) * 0.08 +
          Math.sin(theta * 5 + phase * 0.4) * 0.05 +
          Math.cos(theta * 4 + phase * 0.8) * 0.06;

        const rx = baseRx * (1 + distort);
        const ry = baseRy * (1 + distort * 0.8);

        const rotX =
          rx * Math.cos(theta) * Math.cos(angle) -
          ry * Math.sin(theta) * Math.sin(angle);

        const rotY =
          rx * Math.cos(theta) * Math.sin(angle) +
          ry * Math.sin(theta) * Math.cos(angle);

        if (s === 0) {
          ctx.moveTo(cx + rotX, cy + rotY);
        } else {
          ctx.lineTo(cx + rotX, cy + rotY);
        }
      }

      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      ctx.lineWidth = 1.3;
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
      style={{ opacity: 0.95 }}
    />
  );
}

// ───────────────── PAGE ─────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();

  // Changed state name to 'identifier' to match your backend logic (email/username/phone)
  const [identifier, setIdentifier] = useState("");

  // New states for API handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ───────────────── SUBMIT ─────────────────
  const handleSubmit = async () => {
    if (!identifier) {
      setError("Please enter your email, username, or phone.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Route to verify page and pass the identifier in the URL so the next page knows who it is
        router.push(
          `/auth/verify-otp?identifier=${encodeURIComponent(identifier)}`,
        );
      } else {
        // Display backend error message (e.g., "User not found")
        setError(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-6">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 65% 55%, #140004 0%, #0a0003 45%, #000000 100%)",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-0 w-[520px] h-[420px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 0% 100%, rgba(180,0,40,0.13) 0%, transparent 65%)",
        }}
      />

      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 420,
          height: 360,
          top: "18%",
          left: "38%",
          background:
            "radial-gradient(ellipse, rgba(200,0,50,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Animated lines */}
      <TopoCanvas />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 70% at 22% 50%, transparent 25%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="relative rounded-[28px] p-10 shadow-2xl overflow-hidden"
          style={{
            background: "rgba(10, 3, 4, 0.38)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(220, 60, 80, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(200,40,60,0.07)",
          }}
        >
          {/* Gloss */}
          <div
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06), transparent 35%)",
            }}
          />

          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #e03050, #a01030)",
                }}
              >
                SO
              </div>
              <span className="font-display text-4xl font-bold text-white">
                Study
                <span style={{ color: "#e05070" }}>Orbit</span>
              </span>
            </Link>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(220,60,80,0.12)",
                border: "1px solid rgba(220,60,80,0.2)",
              }}
            >
              <Mail size={28} style={{ color: "#e05070" }} />
            </div>
          </div>

          {/* Heading */}
          <h2 className="font-display text-xl font-bold text-white text-center mb-2">
            Forgot your password?
          </h2>
          <p className="text-sm text-center mb-8" style={{ color: "#7a5a5e" }}>
            Enter your email, username or phone number and we’ll send you a
            6-digit OTP.
          </p>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label
                className="text-xs font-semibold mb-2 block uppercase tracking-wider"
                style={{ color: "#8a6a6e" }}
              >
                Email / Username / Phone
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#6a3a3e" }}
                />
                <input
                  type="text"
                  placeholder="Enter email, username or phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={isLoading}
                  className="w-full pl-11 pr-5 py-3.5 rounded-2xl text-sm text-white outline-none transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(220,60,80,0.18)",
                    caretColor: "#e05070",
                  }}
                />
              </div>

              {/* Error Message Display */}
              {error && (
                <p className="text-red-400 text-xs mt-2 font-medium px-1">
                  {error}
                </p>
              )}
            </div>

            {/* Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #e03050, #a01030)",
                boxShadow: "0 8px 32px rgba(200,40,60,0.28)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </div>

          {/* Back */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm transition-colors hover:text-white"
              style={{ color: "#5a3a3e" }}
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
