"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";

// ─── 3D Fluid WebGL Background (Light Red / Crimson Theme) ───────────────────
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

          // RED PALETTE
          vec3 colorBase = vec3(0.06, 0.01, 0.02);    // Very dark crimson background
          vec3 colorRed1 = vec3(0.88, 0.19, 0.31);    // Light/Bright Red (#e03050)
          vec3 colorRed2 = vec3(0.63, 0.06, 0.19);    // Darker crimson (#a01030)

          vec3 col = mix(colorBase, colorRed1, clamp((f * f) * 1.5, 0.0, 1.0));
          col = mix(col, colorRed2, clamp(length(q) * 0.3, 0.0, 1.0));
          col = mix(col, colorBase, clamp(length(r.x) * 1.5, 0.0, 1.0));

          float highlight = smoothstep(0.3, 0.7, f);
          col += highlight * vec3(0.25, 0.1, 0.15); // Slight pinkish/red specular highlight

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

// ───────────────── PAGE ────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!identifier) {
      setError("Please enter your email, username, or phone.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
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
        router.push(
          `/auth/verify-otp?identifier=${encodeURIComponent(identifier)}`,
        );
      } else {
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
    <main className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-6 font-sans selection:bg-[#e03050]/30">
      
      {/* ── 3D Fluid Animation Background ── */}
      <FluidBackground />

      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-[#0a0003]/50 z-0 pointer-events-none" />

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="relative rounded-[28px] p-10 shadow-2xl overflow-hidden"
          style={{
            background: "rgba(10, 3, 4, 0.6)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(224, 48, 80, 0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(224, 48, 80, 0.15)",
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #e03050, #a01030)",
                }}
              >
                SO
              </div>
              <span className="font-display text-3xl font-black tracking-wide text-white">
                Study<span style={{ color: "#e03050" }}>Orbit</span>
              </span>
            </Link>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6 relative z-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(224, 48, 80, 0.12)",
                border: "1px solid rgba(224, 48, 80, 0.25)",
              }}
            >
              <Mail size={28} style={{ color: "#e03050" }} />
            </div>
          </div>

          {/* Heading */}
          <h2 className="font-display text-xl font-bold text-white text-center mb-2 relative z-10">
            Forgot your password?
          </h2>
          <p className="text-[13px] font-medium text-center mb-8 relative z-10" style={{ color: "#b88a91" }}>
            Enter your email, username or phone number and we’ll send you a 6-digit OTP.
          </p>

          {/* Form */}
          <div className="space-y-5 relative z-10">
            <div>
              <label
                className="text-[11px] font-bold mb-2 block uppercase tracking-wider"
                style={{ color: "#b88a91" }}
              >
                Email / Username / Phone
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#b88a91" }}
                />
                <input
                  type="text"
                  placeholder="Enter email, username or phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={isLoading}
                  className="w-full pl-11 pr-5 py-3.5 rounded-xl text-sm text-white outline-none transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(224, 48, 80, 0.2)",
                    caretColor: "#e03050",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid #e03050";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(224, 48, 80, 0.2)";
                  }}
                />
              </div>

              {/* Error Message Display */}
              {error && (
                <p className="text-[#ff6b81] text-[12px] mt-2 font-semibold px-1">
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
              className="w-full py-3.5 rounded-xl font-bold text-[15px] text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #e03050, #a01030)",
                boxShadow: "0 8px 24px rgba(224, 48, 80, 0.3)",
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
          <div className="mt-8 text-center relative z-10">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors hover:text-white"
              style={{ color: "#b88a91" }}
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