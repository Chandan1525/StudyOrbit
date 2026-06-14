"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useEffect, useState, Suspense } from "react";

// ───────────────── BACKGROUND ─────────────────
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

    const cx = W * 0.5;
    const cy = H * 0.48;

    for (let i = 0; i < 24; i++) {
      const progress = i / 24;
      const phase = t * 0.4 + i * 0.28;
      const baseRx = 70 + i * 22 + Math.sin(phase * 0.7) * 18;
      const baseRy = 45 + i * 16 + Math.cos(phase * 0.5) * 14;
      const angle = t * 0.015 + i * 0.04;
      const hue = 340 - progress * 30;
      const alpha = 0.55 - progress * 0.014;

      ctx.beginPath();
      for (let s = 0; s <= 120; s++) {
        const theta = (s / 120) * Math.PI * 2;
        const distort =
          Math.sin(theta * 2 + phase) * 0.12 +
          Math.sin(theta * 3 - phase * 0.6) * 0.08 +
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
      ctx.strokeStyle = `hsla(${hue}, 78%, 52%, ${alpha})`;
      ctx.lineWidth = 1.2;
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
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.95 }}
    />
  );
}

// ───────────────── PAGE CONTENT ─────────────────
function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the email/username passed from the previous page
  const identifier = searchParams.get("identifier");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // ───────────────── OTP CHANGE ─────────────────
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ───────────────── BACKSPACE ─────────────────
  const handleBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ───────────────── VERIFY OTP API CALL ─────────────────
  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Please enter complete 6-digit OTP.");
      return;
    }

    if (!identifier) {
      setError("Session expired. Please go back and enter your email again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp: finalOtp }),
      });

      const data = await response.json();

      if (data.success) {
        // Pass the identifier to the final reset password page
        router.push(`/auth/reset-password?identifier=${encodeURIComponent(identifier)}`);
      } else {
        // Show backend error (e.g., "Invalid OTP" or "OTP Expired")
        setError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      console.error("Verify error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────── RESEND OTP API CALL ─────────────────
  const handleResendOtp = async () => {
    if (!identifier) {
      setError("Cannot resend. Please go back and enter your email again.");
      return;
    }

    setIsResending(true);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();

    try {
      // Re-trigger the forgot-password endpoint to send a new email
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (data.success) {
        alert("A new OTP has been sent to your email!");
      } else {
        setError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to connect to the server.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative z-10 w-full max-w-md"
    >
      <div
        className="rounded-[30px] p-10 overflow-hidden"
        style={{
          background: "rgba(10,10,20,0.38)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-black font-black text-xs"
              style={{
                background: "linear-gradient(135deg,#ff4d8d,#7c4dff)",
              }}
            >
              SO
            </div>
            <span className="text-3xl font-black">
              Study<span className="text-pink-400">Orbit</span>
            </span>
          </Link>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(255,0,120,0.12)",
              border: "1px solid rgba(255,0,120,0.2)",
            }}
          >
            <ShieldCheck size={30} className="text-pink-400" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center mb-3">Verify OTP</h2>
        <p className="text-sm text-center mb-8" style={{ color: "#9ca3af" }}>
          Enter the 6-digit OTP sent to {identifier ? <strong>{identifier}</strong> : "your account"}.
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-12 h-14 rounded-xl text-center text-xl font-bold text-white outline-none transition-all disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center mb-5">{error}</p>
        )}

        {/* Verify Button */}
        <motion.button
          type="button"
          onClick={verifyOtp}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className="w-full py-4 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg,#ff4d8d,#7c4dff)",
            boxShadow: "0 8px 30px rgba(255,0,120,0.25)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin text-black" />
              Verifying...
            </>
          ) : (
            <>
              Verify OTP
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        {/* Resend */}
        <div className="mt-6 text-center">
          <button
            onClick={handleResendOtp}
            disabled={isResending || isLoading}
            className="text-sm transition-colors hover:text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "#8b5cf6" }}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-sm hover:text-pink-400 transition-colors"
            style={{ color: "#6b7280" }}
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ───────────────── MAIN WRAPPER ─────────────────
// Required to wrap useSearchParams in a Suspense boundary for Next.js build
export default function VerifyOtpPage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 text-white">
      {/* Backgrounds */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 65% 55%, #1b0020 0%, #090010 45%, #000000 100%)",
        }}
      />
      <TopoCanvas />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,0,120,0.08), transparent 35%)",
        }}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}