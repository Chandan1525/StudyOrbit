"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useEffect, useState, Suspense } from "react";

// ─── 3D Fluid WebGL Background (Emerald & Cyan Theme) ────────────────────────
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

          // EMERALD / CYAN PALETTE FOR SECURITY/VERIFICATION
          vec3 colorBase = vec3(0.02, 0.05, 0.04);    // Deep dark teal/green
          vec3 colorGreen = vec3(0.06, 0.72, 0.50);   // Emerald (#10b981)
          vec3 colorCyan = vec3(0.02, 0.71, 0.83);    // Cyan (#06b6d4)

          vec3 col = mix(colorBase, colorGreen, clamp((f * f) * 1.5, 0.0, 1.0));
          col = mix(col, colorCyan, clamp(length(q) * 0.3, 0.0, 1.0));
          col = mix(col, colorBase, clamp(length(r.x) * 1.5, 0.0, 1.0));

          float highlight = smoothstep(0.3, 0.7, f);
          col += highlight * vec3(0.1, 0.25, 0.2); // Soft green specular highlight

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
    index: number,
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, otp: finalOtp }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Pass the identifier to the final reset password page
        router.push(
          `/auth/reset-password?identifier=${encodeURIComponent(identifier)}`,
        );
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-10 w-full max-w-md"
    >
      <div
        className="relative rounded-[28px] p-10 shadow-2xl overflow-hidden"
        style={{
          background: "rgba(5, 15, 10, 0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(16, 185, 129, 0.15)",
        }}
      >
        {/* Internal Gloss Highlight */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05), transparent 40%)",
          }}
        />

        {/* Logo */}
        <div className="text-center mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black text-white"
              style={{
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
              }}
            >
              SO
            </div>
            <span className="font-display text-3xl font-black text-white tracking-wide">
              Study<span style={{ color: "#10b981" }}>Orbit</span>
            </span>
          </Link>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6 relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
            }}
          >
            <ShieldCheck size={32} style={{ color: "#10b981" }} />
          </div>
        </div>

        {/* Heading */}
        <h2 className="font-display text-2xl font-bold text-center text-white mb-3 relative z-10">
          Verify OTP
        </h2>
        <p className="text-[13px] text-center mb-8 relative z-10" style={{ color: "#9ca3af" }}>
          Enter the 6-digit OTP sent to{" "}
          {identifier ? <strong className="text-white">{identifier}</strong> : "your account"}.
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-6 relative z-10">
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
                border: "1px solid rgba(16, 185, 129, 0.2)",
                caretColor: "#10b981",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #10b981";
                e.target.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(16, 185, 129, 0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] font-medium text-red-400 text-center mb-5 relative z-10">{error}</p>
        )}

        {/* Verify Button */}
        <div className="relative z-10">
          <motion.button
            type="button"
            onClick={verifyOtp}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                Verifying...
              </>
            ) : (
              <>
                Verify OTP
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        {/* Resend */}
        <div className="mt-6 text-center relative z-10">
          <button
            onClick={handleResendOtp}
            disabled={isResending || isLoading}
            className="text-[13px] font-medium transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "#10b981" }}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </div>

        {/* Back */}
        <div className="mt-8 text-center relative z-10">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors hover:text-white"
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
export default function VerifyOtpPage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-6 font-sans selection:bg-[#10b981]/30">
      
      {/* ── 3D Fluid WebGL Background ── */}
      <FluidBackground />

      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-[#020a07]/60 z-0 pointer-events-none" />

      <Suspense fallback={<div className="text-white relative z-10">Loading...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}