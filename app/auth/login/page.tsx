"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

// ─── 3D Fluid WebGL Background (Matching Landing Page) ───────────────────────
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

          // Brand Colors
          vec3 colorBlack = vec3(0.02, 0.03, 0.05);
          vec3 colorPurple = vec3(0.42, 0.39, 1.0); // #6c63ff
          vec3 colorTeal = vec3(0.24, 0.81, 0.68);  // #3ecfad

          vec3 col = mix(colorBlack, colorPurple, clamp((f * f) * 1.5, 0.0, 1.0));
          col = mix(col, colorTeal, clamp(length(q) * 0.3, 0.0, 1.0));
          col = mix(col, colorBlack, clamp(length(r.x) * 1.5, 0.0, 1.0));

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

// ─── Login Form Component ────────────────────────────────────────────────────
function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const callbackUrl = searchParams.get("callbackUrl");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err: any) {
      if (err.message?.includes("fetch")) {
        setError(
          "Cannot connect to server. Make sure backend is running on port 5000."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Google Login failed.");
      }
    } catch {
      setError("Cannot connect to server for Google Login.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleCredential = searchParams.get("credential");
  
  useEffect(() => {
    if (googleCredential) {
      const tokenKey = `used_token_${googleCredential.substring(0, 20)}`;
      if (!sessionStorage.getItem(tokenKey)) {
        sessionStorage.setItem(tokenKey, "true");
        router.replace(pathname);
        handleGoogleSuccess({ credential: googleCredential });
      }
    }
  }, [googleCredential, pathname, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white flex items-center justify-center px-6 pb-12 font-sans selection:bg-[#6c63ff]/30">
      
      {/* ── 3D Fluid Animation Background ── */}
      <FluidBackground />

      {/* ── Optional Overlay to ensure form remains readable ── */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mt-12"
      >
        {/* ── Card Container ── */}
        <div className="relative rounded-[24px] p-10 overflow-hidden bg-[#111118]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          
          <div
            className="absolute inset-0 rounded-[24px] pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03), transparent 40%)",
            }}
          />

          {/* Logo */}
          <div className="text-center mb-9 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="font-display w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white bg-[#6c63ff]">
                SO
              </div>
              <span className="font-display text-2xl font-black tracking-wide text-white">
                Study<span className="text-[#6c63ff]">Orbit</span>
              </span>
            </Link>
            <h2 className="font-display text-2xl font-bold text-white mb-1.5">Welcome back</h2>
            <p className="text-sm text-[#7a7a8c] font-medium">
              Sign in to your student ecosystem
            </p>
          </div>

          {/* Google */}
          <div className="flex justify-center mb-6 w-full relative z-10">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed. Please try again.")}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              ux_mode="redirect"
              login_uri={
                typeof window !== "undefined"
                  ? `${window.location.origin}/api/auth/google-pwa`
                  : ""
              }
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] font-semibold tracking-widest text-[#7a7a8c]">
              OR SIGN IN WITH EMAIL
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-xs font-semibold text-center bg-red-500/10 border border-red-500/20 text-red-400 relative z-10">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="text-[11px] font-bold mb-2 block uppercase tracking-wider text-[#7a7a8c]">
                Email / Username
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7a8c]"
                />
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-5 py-3.5 rounded-xl text-sm text-white placeholder-[#4a4a5a] bg-[#0d0d12]/80 border border-white/10 outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition-all"
                  style={{ userSelect: "text", WebkitUserSelect: "text" }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7a7a8c]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-[#3ecfad] hover:text-[#52e8c5] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7a8c]"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm text-white placeholder-[#4a4a5a] bg-[#0d0d12]/80 border border-white/10 outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition-all"
                  style={{ userSelect: "text", WebkitUserSelect: "text" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7a7a8c] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3.5 rounded-xl font-semibold text-[15px] text-white flex items-center justify-center gap-2 shadow-lg shadow-[#6c63ff]/20 transition-all mt-2 ${
                isLoading ? "bg-[#5b54e5] opacity-70" : "bg-[#6c63ff] hover:bg-[#5b54e5]"
              }`}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="flex items-center gap-4 my-6 relative z-10">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] font-semibold tracking-widest text-[#7a7a8c]">
              NEW TO STUDYORBIT?
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link href="/auth/register" className="block relative z-10">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-xl text-[14px] font-medium text-center transition-colors border border-white/10 text-[#3ecfad] bg-white/5 hover:bg-white/10 hover:border-white/20"
            >
              Create a free account →
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center text-white bg-black">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}