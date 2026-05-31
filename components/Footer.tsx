import Link from "next/link"; // 🔥 Ye import zaroori hai

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-8 px-6 md:px-20 text-gray-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5">
        
        {/* Logo */}
        <h1 className="text-2xl font-bold text-white">
          Study<span className="text-blue-500">Orbit</span>
        </h1>

        {/* Links Container */}
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white transition">
            GitHub
          </a>

          <a href="#" className="hover:text-white transition">
            LinkedIn
          </a>

          {/* 🔥 Privacy Link ko sahi div ke andar daal diya hai 🔥 */}
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-sm">
          © 2026 StudyOrbit. All rights reserved.
        </p>
      </div>
    </footer>
  );
}