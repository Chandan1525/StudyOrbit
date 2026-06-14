import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0f]">
      
      {/* 🔥 UPDATED: Removed circle, colored "Orbit" 🔥 */}
      <div className="flex items-center font-display text-[15px] font-extrabold tracking-tight text-white">
        Study<span className="text-[#6c63ff]">Orbit</span>
      </div>
      
      <div className="text-[12px] text-[#4a4a5a]">
        © 2026 StudyOrbit. Built for students, by students.
      </div>
      
      <div className="flex gap-6 text-[12px] text-[#4a4a5a]">
        <Link href="/privacy" className="hover:text-[#7a7a8c] transition-colors">Privacy</Link>
        {/* 🔥 UPDATED: Added /terms link 🔥 */}
        <Link href="/terms" className="hover:text-[#7a7a8c] transition-colors">Terms</Link>
        <Link href="#" className="hover:text-[#7a7a8c] transition-colors">GitHub</Link>
        <Link href="#" className="hover:text-[#7a7a8c] transition-colors">LinkedIn</Link>
      </div>
    </footer>
  );
}