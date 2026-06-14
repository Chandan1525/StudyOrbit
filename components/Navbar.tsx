"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 h-[60px] bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
      <Link href="/" className="flex items-center gap-2.5 font-display text-[18px] font-extrabold tracking-tight text-white">
        <div className="w-7 h-7 rounded-full border-2 border-[#6c63ff] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#6c63ff]" />
        </div>
        StudyOrbit
      </Link>
      
      <ul className="hidden md:flex gap-8 text-[13px] font-medium text-[#7a7a8c]">
        <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
        <li><Link href="#how" className="hover:text-white transition-colors">How it works</Link></li>
        <li><Link href="#community" className="hover:text-white transition-colors">Communities</Link></li>
      </ul>
      
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/auth/login" className="text-[13px] text-[#7a7a8c] hover:text-white hover:bg-[#18181f] px-3 py-1.5 rounded-lg transition-all">
          Log in
        </Link>
        <Link href="/auth/register" className="text-[13px] font-medium text-white bg-[#6c63ff] hover:bg-[#5b54e5] px-4 py-2 rounded-lg transition-transform hover:-translate-y-0.5 shadow-md">
          Join free
        </Link>
      </div>
    </nav>
  );
}