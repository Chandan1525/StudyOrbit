"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Lock,
  EyeOff,
  Eye,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect, useState, Suspense } from "react";

// ─── 3D Fluid WebGL Background (Amber & Orange Theme) ──────────────────────
function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

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

          // AMBER / ORANGE PALETTE
          vec3 colorBase = vec3(0.06, 0.02, 0.01);    // Very dark warm brown/black
          vec3 colorAmber = vec3(0.96, 0.62, 0.04);   // #f59e0b (Amber)
          vec3 colorOrange = vec3(0.91, 0.34, 0.04);  // #ea580c (Orange)

          vec3 col = mix(colorBase, colorAmber, clamp((f * f) * 1.5, 0.0, 1.0));
          col = mix(col, colorOrange, clamp(length(q) * 0.3, 0.0, 1.0));
          col = mix(col, colorBase, clamp(length(r.x) * 1.5, 0.0, 1.0));

          float highlight = smoothstep(0.3, 0.7, f);
          col += highlight * vec3(0.25, 0.15, 0.05); // Warm gold specular highlight

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

// ─── Password Strength Checker ───
function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#ea580c" }; // Orange
  if (score <= 2) return { score, label: "Fair", color: "#f59e0b" }; // Amber
  if (score <= 3) return { score, label: "Good", color: "#eab308" }; // Yellow
  return { score, label: "Strong", color: "#22c55e" };               // Green
}

type Step = "reset" | "success";

// ─── Main Content Component ───
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const identifier = searchParams.get("identifier");

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: identifier,
            password: newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
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
    border: "1px solid rgba(245, 158, 11, 0.2)",
    caretColor: "#f59e0b",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(245, 158, 11, 0.6)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245, 158, 11, 0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.border = "1px solid rgba(245, 158, 11, 0.2)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md"
    >
      <div
        className="relative rounded-[28px] p-10 shadow-2xl overflow-hidden"
        style={{
          background: "rgba(10, 5, 2, 0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(245, 158, 11, 0.15)",
        }}
      >
        {/* Internal Gloss */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05), transparent 40%)",
          }}
        />

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black text-black"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              }}
            >
              SO
            </div>
            <span className="font-display text-3xl font-black tracking-wide text-white">
              Study<span style={{ color: "#f59e0b" }}>Orbit</span>
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
            className="relative z-10"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.25)",
                }}
              >
                <ShieldCheck size={32} style={{ color: "#f59e0b" }} />
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-white text-center mb-2">
              Set new password
            </h2>
            <p className="text-[13px] text-center mb-8" style={{ color: "#d6a15c" }}>
              Your new password must be different from your previous one.
            </p>

            <div className="space-y-5">
              {/* New password */}
              <div>
                <label
                  className="text-[11px] font-bold mb-2 block uppercase tracking-wider"
                  style={{ color: "#d6a15c" }}
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#d6a15c" }}
                  />
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    disabled={isLoading}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white outline-none transition-all duration-200 disabled:opacity-50"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#d6a15c" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#d6a15c";
                    }}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
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
                        <div
                          key={bar}
                          className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{
                            background:
                              bar <= strength.score
                                ? strength.color
                                : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Password strength
                      </span>
                      <span className="text-[11px] uppercase tracking-wider font-bold" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>

                    {/* Requirements */}
                    <div className="mt-4 space-y-2">
                      {[
                        { label: "At least 8 characters", met: newPassword.length >= 8 },
                        { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
                        { label: "One number", met: /[0-9]/.test(newPassword) },
                        { label: "One special character", met: /[^A-Za-z0-9]/.test(newPassword) },
                      ].map((req) => (
                        <div key={req.label} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                            style={{
                              background: req.met ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.05)",
                              border: req.met ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {req.met && (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path
                                  d="M1 4l2 2 4-4"
                                  stroke="#f59e0b"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className="text-[11px] font-medium transition-colors duration-200"
                            style={{ color: req.met ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}
                          >
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
                <label
                  className="text-[11px] font-bold mb-2 block uppercase tracking-wider"
                  style={{ color: "#d6a15c" }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#d6a15c" }}
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    disabled={isLoading}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white outline-none transition-all duration-200 disabled:opacity-50"
                    style={{
                      ...inputStyle,
                      border:
                        confirmPassword.length > 0
                          ? confirmPassword === newPassword
                            ? "1px solid rgba(34,197,94,0.5)"
                            : "1px solid rgba(234, 88, 12, 0.5)"
                          : inputStyle.border,
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#d6a15c" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#d6a15c";
                    }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <p
                    className="text-[11px] font-bold uppercase tracking-wider mt-2"
                    style={{
                      color: confirmPassword === newPassword ? "#22c55e" : "#ea580c",
                    }}
                  >
                    {confirmPassword === newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Error Box */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl px-4 py-3 text-[12px] text-center font-bold"
                  style={{
                    background: "rgba(234, 88, 12, 0.15)",
                    border: "1px solid rgba(234, 88, 12, 0.3)",
                    color: "#fb923c",
                  }}
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
                className="w-full py-3.5 rounded-xl font-bold text-[15px] text-black flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                  boxShadow: "0 8px 24px rgba(234, 88, 12, 0.3)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" /> Updating...
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
            className="text-center relative z-10"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid rgba(34, 197, 94, 0.4)",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path
                    d="M6 18l8 8L30 8"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 font-display">
              Password reset!
            </h2>
            <p className="text-[13px] mb-10" style={{ color: "#d6a15c" }}>
              Your password has been updated successfully. You can now sign in
              with your new password.
            </p>

            <Link href="/auth/login">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-[15px] text-black flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                  boxShadow: "0 8px 24px rgba(234, 88, 12, 0.3)",
                }}
              >
                Back to Sign In <ArrowRight size={16} />
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Back to login (only on reset step) */}
        {step === "reset" && (
          <div className="mt-8 text-center relative z-10">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
              style={{ color: "#d6a15c" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#d6a15c";
              }}
            >
              <ArrowLeft size={14} /> Cancel
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Wrapper with Suspense ───
export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-6 font-sans selection:bg-[#f59e0b]/30">
      
      {/* ── 3D Fluid Animation Background ── */}
      <FluidBackground />

      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-[#0a0500]/60 z-0 pointer-events-none" />

      <Suspense fallback={<div className="text-white relative z-10">Loading...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}