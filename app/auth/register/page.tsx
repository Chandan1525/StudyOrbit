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
import { useRef, useCallback, useEffect, useState } from "react";
import { GoogleLogin } from '@react-oauth/google';

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
    const cx = W * 0.52;
    const cy = H * 0.48;

    for (let i = 0; i < 22; i++) {
      const progress = i / 22;
      const phase = t * 0.4 + i * 0.28;
      const baseRx = 40 + i * 22 + Math.sin(phase * 0.7) * 18;
      const baseRy = 28 + i * 15 + Math.cos(phase * 0.5) * 14;
      const angle = t * 0.015 + i * 0.04;
      const alpha = 0.65 - progress * 0.015;

      ctx.beginPath();
      for (let s = 0; s <= 120; s++) {
        const theta = (s / 120) * Math.PI * 2;
        const distort =
          Math.sin(theta * 2 + phase) * 0.12 +
          Math.sin(theta * 3 - phase * 0.6) * 0.08;

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
      ctx.strokeStyle = `hsla(40, 78%, 45%, ${alpha})`;
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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.95 }}
    />
  );
}

// ───────────────── PAGE ─────────────────
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/register`, {
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
      });

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Since Google gives us a verified login token immediately,
        // we can bypass the "Go to login" popup and send them straight to the dashboard!
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
    <main className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-4 py-10">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top left, #312e81 0%, #1e1b4b 25%, #0f172a 55%, #000000 100%)",
        }}
      />

      {/* Purple Glow */}
      <div
        className="absolute top-[-150px] right-[-120px] w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Blue Glow */}
      <div
        className="absolute bottom-[-180px] left-[-120px] w-[450px] h-[450px] rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 70%)",
        }}
      />

      {/* Animated Canvas */}
      <TopoCanvas />

      {/* Register Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 60,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 w-full max-w-[430px]"
      >
        <div
          className="relative rounded-[26px] px-8 py-7 shadow-2xl overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.34)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(139,92,246,0.18)",
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.35),
              0 0 40px rgba(139,92,246,0.08)
            `,
          }}
        >
          {/* Gloss */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.06), transparent 40%)",
            }}
          />

          {/* Logo */}
          <div className="text-center mb-6 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-black"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                }}
              >
                SO
              </div>

              <span className="text-2xl font-black tracking-wide text-white">
                Study
                <span
                  style={{
                    color: "#8b5cf6",
                  }}
                >
                  Orbit
                </span>
              </span>
            </Link>

            <h2 className="text-lg font-bold text-white mb-1">
              Create account
            </h2>

            <p
              className="text-sm"
              style={{
                color: "#7a6a4a",
              }}
            >
              Start your journey with StudyOrbit
            </p>
          </div>

          {/* Google Button Component */}
          <div className="relative z-10 flex justify-center w-full mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log('Google Registration Failed');
                alert('Google Registration Failed. Please try again.');
              }}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          </div>

          {/* Divider */}
          <div className="relative z-10 flex items-center gap-4 mb-5">
            <div
              className="flex-1 h-px"
              style={{
                background: "rgba(200,160,40,0.12)",
              }}
            />

            <span
              className="text-[11px]"
              style={{
                color: "#5a4e32",
              }}
            >
              OR REGISTER WITH EMAIL
            </span>

            <div
              className="flex-1 h-px"
              style={{
                background: "rgba(200,160,40,0.12)",
              }}
            />
          </div>

          {/* Form */}
          <div className="relative z-10 space-y-3.5">
            {/* Full Name */}
            <div>
              <label
                className="text-[11px] font-semibold mb-2 block uppercase tracking-wider"
                style={{
                  color: "#8a7a5a",
                }}
              >
                Full Name
              </label>

              <div className="relative">
                <User
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "#6a5a3a",
                  }}
                />

                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-2xl text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(200,160,40,0.15)",
                  }}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label
                className="text-[11px] font-semibold mb-2 block uppercase tracking-wider"
                style={{
                  color: "#8a7a5a",
                }}
              >
                Username
              </label>

              <div className="relative">
                <AtSign
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "#6a5a3a",
                  }}
                />

                <input
                  type="text"
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-2xl text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(200,160,40,0.15)",
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="text-[11px] font-semibold mb-2 block uppercase tracking-wider"
                style={{
                  color: "#8a7a5a",
                }}
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "#6a5a3a",
                  }}
                />

                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-2xl text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(200,160,40,0.15)",
                  }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                className="text-[11px] font-semibold mb-2 block uppercase tracking-wider"
                style={{
                  color: "#8a7a5a",
                }}
              >
                Mobile Number
              </label>

              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "#6a5a3a",
                  }}
                />

                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 rounded-2xl text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(200,160,40,0.15)",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="text-[11px] font-semibold mb-2 block uppercase tracking-wider"
                style={{
                  color: "#8a7a5a",
                }}
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "#6a5a3a",
                  }}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 rounded-2xl text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(200,160,40,0.15)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "#6a5a3a",
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <motion.button
              type="button"
              onClick={handleRegister}
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 mt-2"
              style={{
                background: "linear-gradient(135deg, #f5c842, #8b5cf6)",
              }}
            >
              Create Account
              <ArrowRight size={16} />
            </motion.button>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-center mt-6 text-sm">
            <span
              style={{
                color: "#6a5a3a",
              }}
            >
              Already have an account?{" "}
            </span>

            <Link
              href="/auth/login"
              className="hover:underline"
              style={{
                color: "#8b5cf6",
              }}
            >
              Login
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Success Popup */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.25,
            }}
            className="w-[90%] max-w-[360px] rounded-2xl px-7 py-8 text-center"
            style={{
              background: "rgba(15,23,42,0.88)",
              border: "1px solid rgba(139,92,246,0.18)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            <h2 className="text-xl font-bold text-white mb-3">
              Account Created
            </h2>

            <p
              className="text-sm leading-6 mb-6"
              style={{
                color: "#9ca3af",
              }}
            >
              Your account has been created successfully. Please login to
              continue.
            </p>

            <Link href="/auth/login">
              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="w-full py-3 rounded-xl font-semibold text-black text-sm"
                style={{
                  background: "linear-gradient(135deg,#f5c842,#8b5cf6)",
                }}
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