"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-10 h-[60px] bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
      
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-[17px] font-extrabold tracking-tight shrink-0"
      >
        <span className="text-white">Study</span><span className="text-[#6c63ff]">Orbit</span>
      </Link>

      {/* Desktop nav links — hidden on mobile */}
      <ul className="hidden md:flex gap-8 text-[13px] font-medium text-[#7a7a8c]">
        <li>
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
        </li>
        <li>
          <Link href="#how" className="hover:text-white transition-colors">
            How it works
          </Link>
        </li>
        <li>
          <Link href="#community" className="hover:text-white transition-colors">
            Communities
          </Link>
        </li>
      </ul>

      {/* CTA buttons */}
      <div className="flex items-center gap-2">
        {/* "Log in" — text-only on desktop, hidden on mobile */}
        <Link
          href="/auth/login"
          className="hidden md:inline-flex text-[13px] text-[#7a7a8c] hover:text-white hover:bg-[#18181f] px-3 py-1.5 rounded-lg transition-all"
        >
          Log in
        </Link>

        {/* "Log in" — compact pill on mobile only */}
        <Link
          href="/auth/login"
          className="md:hidden text-[13px] font-medium text-[#7a7a8c] hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all whitespace-nowrap"
        >
          Log in
        </Link>

        {/* "Join free" — always visible */}
        <Link
          href="/auth/register"
          className="text-[13px] font-semibold text-white bg-[#6c63ff] hover:bg-[#5b54e5] px-4 py-2 rounded-lg transition-transform hover:-translate-y-0.5 shadow-md whitespace-nowrap"
        >
          Join free
        </Link>
      </div>
    </nav>
  );
}