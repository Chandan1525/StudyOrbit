import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0f]">
      <div className="flex items-center gap-2 font-display text-[15px] font-extrabold tracking-tight text-[#7a7a8c]">
        <div className="w-5 h-5 rounded-full border-[1.5px] border-[#6c63ff] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#6c63ff]" />
        </div>
        StudyOrbit
      </div>
      
      <div className="text-[12px] text-[#4a4a5a]">
        © 2026 StudyOrbit. Built for students, by students.
      </div>
      
      <div className="flex gap-6 text-[12px] text-[#4a4a5a]">
        <Link href="/privacy" className="hover:text-[#7a7a8c] transition-colors">Privacy</Link>
        <Link href="#" className="hover:text-[#7a7a8c] transition-colors">Terms</Link>
        <Link href="#" className="hover:text-[#7a7a8c] transition-colors">GitHub</Link>
        <Link href="#" className="hover:text-[#7a7a8c] transition-colors">LinkedIn</Link>
      </div>
    </footer>
  );
}