"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, EyeOff, Eye, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useEffect, useState, Suspense } from "react";

// ── Background Canvas ──
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
        const rotX = rx * Math.cos(theta) * Math.cos(angle) - ry * Math.sin(theta) * Math.sin(angle);
        const rotY = rx * Math.cos(theta) * Math.sin(angle) + ry * Math.sin(theta) * Math.cos(angle);
        s === 0 ? ctx.moveTo(cx + rotX, cy + rotY) : ctx.lineTo(cx + rotX, cy + rotY);
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }

    const cx2 = W * 0.82;
    const cy2 = H * 0.72;
    for (let i = 0; i < 14; i++) {
      const progress = i / 14;
      const phase = t * 0.35 + i * 0.32 + 2.5;
      const baseRx = 20 + i * 13 + Math.sin(phase * 0.6) * 10;
      const baseRy = 14 + i * 9 + Math.cos(phase * 0.5) * 8;
      const angle = -t * 0.012 + i * 0.05;
      const hue = 350 - progress * 15;
      const alpha = 0.48 - progress * 0.02;
      ctx.beginPath();
      for (let s = 0; s <= 100; s++) {
        const theta = (s / 100) * Math.PI * 2;
        const distort =
          Math.sin(theta * 2 + phase) * 0.1 +
          Math.sin(theta * 4 - phase * 0.5) * 0.07 +
          Math.cos(theta * 3 + phase * 0.9) * 0.05;
        const rx = baseRx * (1 + distort);
        const ry = baseRy * (1 + distort * 0.7);
        const rotX = rx * Math.cos(theta) * Math.cos(angle) - ry * Math.sin(theta) * Math.sin(angle);
        const rotY = rx * Math.cos(theta) * Math.sin(angle) + ry * Math.sin(theta) * Math.cos(angle);
        s === 0 ? ctx.moveTo(cx2 + rotX, cy2 + rotY) : ctx.lineTo(cx2 + rotX, cy2 + rotY);
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue}, 68%, 48%, ${alpha})`;
      ctx.lineWidth = 1;
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.95 }} />;
}

// Password strength checker
function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#e03050" };
  if (score <= 2) return { score, label: "Fair", color: "#f97316" };
  if (score <= 3) return { score, label: "Good", color: "#eab308" };
  return { score, label: "Strong", color: "#22c55e" };
}

type Step = "reset" | "success";

// ── Main Content Component ──
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier"); // Grab the email/username

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<Step>("reset");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const strength = getStrength(newPassword);

  const handleSubmit = async () => {
    setError("");

    if (!identifier) {
      setError("Session expired. Please restart the password reset process.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // 🚀 Send the new password to the backend to update MongoDB
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier: identifier, 
          password: newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // If MongoDB updated successfully, show the success checkmark screen!
        setStep("success");
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Server error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(220,60,80,0.18)",
    caretColor: "#e05070",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(220,60,80,0.55)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(220,60,80,0.08)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(220,60,80,0.18)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
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
          border: "1px solid rgba(220,60,80,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(200,40,60,0.07)",
        }}
      >
        {/* Gloss */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), transparent 35%)" }}
        />

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
              style={{ background: "linear-gradient(135deg, #e03050, #a01030)" }}>
              LO
            </div>
            <span className="text-2xl font-black tracking-wide text-white">
              Study<span style={{ color: "#e05070" }}>Orbit</span>
            </span>
          </Link>
        </div>

        {/* ── STEP 1: Set new password ── */}
        {step === "reset" && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(220,60,80,0.1)", border: "1px solid rgba(220,60,80,0.2)" }}>
                <ShieldCheck size={28} style={{ color: "#e05070" }} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white text-center mb-2">Set new password</h2>
            <p className="text-sm text-center mb-8" style={{ color: "#7a5a5e" }}>
              Your new password must be different from your previous one.
            </p>

            <div className="space-y-5">
              {/* New password */}
              <div>
                <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "#8a6a6e" }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#6a3a3e" }} />
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    disabled={isLoading}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm text-white outline-none transition-all duration-200 disabled:opacity-50"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#6a3a3e" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e05070"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6a3a3e"; }}
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength bar */}
                {newPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <div className="flex gap-1.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <div key={bar} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background: bar <= strength.score ? strength.color : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Password strength
                      </span>
                      <span className="text-xs font-semibold" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>

                    {/* Requirements */}
                    <div className="mt-3 space-y-1.5">
                      {[
                        { label: "At least 8 characters", met: newPassword.length >= 8 },
                        { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
                        { label: "One number", met: /[0-9]/.test(newPassword) },
                        { label: "One special character", met: /[^A-Za-z0-9]/.test(newPassword) },
                      ].map((req) => (
                        <div key={req.label} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                            style={{
                              background: req.met ? "rgba(220,60,80,0.2)" : "rgba(255,255,255,0.05)",
                              border: req.met ? "1px solid rgba(220,60,80,0.4)" : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {req.met && (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1 4l2 2 4-4" stroke="#e05070" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-xs transition-colors duration-200"
                            style={{ color: req.met ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-semibold mb-2 block uppercase tracking-wider" style={{ color: "#8a6a6e" }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#6a3a3e" }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    disabled={isLoading}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm text-white outline-none transition-all duration-200 disabled:opacity-50"
                    style={{
                      ...inputStyle,
                      border: confirmPassword.length > 0
                        ? confirmPassword === newPassword
                          ? "1px solid rgba(34,197,94,0.4)"
                          : "1px solid rgba(220,60,80,0.45)"
                        : inputStyle.border,
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#6a3a3e" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e05070"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6a3a3e"; }}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <p className="text-xs mt-2" style={{
                    color: confirmPassword === newPassword ? "#22c55e" : "#e05070"
                  }}>
                    {confirmPassword === newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Error Box */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl px-4 py-3 text-sm text-center font-medium"
                  style={{ background: "rgba(220,60,80,0.1)", border: "1px solid rgba(220,60,80,0.2)", color: "#e05070" }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #e03050, #a01030)",
                  boxShadow: "0 8px 32px rgba(200,40,60,0.28)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    Reset Password <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Success ── */}
        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(220,60,80,0.12)", border: "1px solid rgba(220,60,80,0.3)" }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M6 18l8 8L30 8" stroke="#e05070" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Password reset!</h2>
            <p className="text-sm mb-10" style={{ color: "#7a5a5e" }}>
              Your password has been updated successfully. You can now sign in with your new password.
            </p>

            <Link href="/auth/login">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #e03050, #a01030)",
                  boxShadow: "0 8px 32px rgba(200,40,60,0.28)",
                }}
              >
                Back to Sign In <ArrowRight size={16} />
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Back to login (only on reset step) */}
        {step === "reset" && (
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: "#5a3a3e" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#e05070"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#5a3a3e"; }}
            >
              <ArrowLeft size={14} /> Cancel
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Wrapper with Suspense ──
export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-6">
      {/* Dark red backgrounds */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 130% 90% at 65% 55%, #140004 0%, #0a0003 45%, #000000 100%)" }}
      />
      <div className="absolute bottom-0 left-0 w-[520px] h-[420px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 0% 100%, rgba(180,0,40,0.13) 0%, transparent 65%)" }}
      />
      <div className="absolute pointer-events-none"
        style={{ width: 420, height: 360, top: "18%", left: "38%", background: "radial-gradient(ellipse, rgba(200,0,50,0.08) 0%, transparent 70%)" }}
      />
      <TopoCanvas />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 65% 70% at 22% 50%, transparent 25%, rgba(0,0,0,0.55) 100%)" }}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}