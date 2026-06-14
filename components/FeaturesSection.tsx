import { Megaphone, Users, Trophy, Rocket, MessageSquare, Newspaper } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="max-w-[1200px] mx-auto px-6 md:px-10 py-24">
      <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#6c63ff] mb-3">Everything in one place</div>
      <h2 className="font-display text-[28px] md:text-[42px] font-extrabold tracking-tight leading-[1.15] mb-14 max-w-[560px] text-white">
        Not just another social media. It's your tech career HQ.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="group bg-[#111118] border border-white/5 rounded-[14px] p-6 hover:border-white/10 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#6c63ff] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-[#6c63ff]/10 text-[#6c63ff] flex items-center justify-center mb-4">
            <Megaphone size={20} />
          </div>
          <div className="text-[15px] font-semibold mb-2 text-white">Tech-only feed</div>
          <div className="text-[13px] text-[#7a7a8c] leading-[1.65]">Posts only about projects, hackathons, DSA, tech news, and ideas. No noise. No memes. Just signal.</div>
        </div>

        <div className="group bg-[#111118] border border-white/5 rounded-[14px] p-6 hover:border-white/10 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#3ecfad] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-[#3ecfad]/10 text-[#3ecfad] flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <div className="text-[15px] font-semibold mb-2 text-white">Join communities</div>
          <div className="text-[13px] text-[#7a7a8c] leading-[1.65]">300+ communities across AI/ML, Web Dev, Blockchain, DSA and more. Find your people instantly.</div>
        </div>

        <div className="group bg-[#111118] border border-white/5 rounded-[14px] p-6 hover:border-white/10 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#f572b8] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-[#f572b8]/10 text-[#f572b8] flex items-center justify-center mb-4">
            <Trophy size={20} />
          </div>
          <div className="text-[15px] font-semibold mb-2 text-white">Hackathon discovery</div>
          <div className="text-[13px] text-[#7a7a8c] leading-[1.65]">Never miss a hackathon again. Find teammates, register, and share your results — all in one place.</div>
        </div>

        <div className="group bg-[#111118] border border-white/5 rounded-[14px] p-6 hover:border-white/10 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#f5b842] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-[#f5b842]/10 text-[#f5b842] flex items-center justify-center mb-4">
            <Rocket size={20} />
          </div>
          <div className="text-[15px] font-semibold mb-2 text-white">Showcase projects</div>
          <div className="text-[13px] text-[#7a7a8c] leading-[1.65]">Share what you built. Get real feedback from developers who understand code, not just likes.</div>
        </div>

        <div className="group bg-[#111118] border border-white/5 rounded-[14px] p-6 hover:border-white/10 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#42b8f5] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-[#42b8f5]/10 text-[#42b8f5] flex items-center justify-center mb-4">
            <MessageSquare size={20} />
          </div>
          <div className="text-[15px] font-semibold mb-2 text-white">Direct messaging</div>
          <div className="text-[13px] text-[#7a7a8c] leading-[1.65]">DM any student directly. Collaborate on projects, discuss ideas, or find a mentor in your domain.</div>
        </div>

        <div className="group bg-[#111118] border border-white/5 rounded-[14px] p-6 hover:border-white/10 hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#7aeb6f] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 rounded-xl bg-[#7aeb6f]/10 text-[#7aeb6f] flex items-center justify-center mb-4">
            <Newspaper size={20} />
          </div>
          <div className="text-[15px] font-semibold mb-2 text-white">Tech news, curated</div>
          <div className="text-[13px] text-[#7a7a8c] leading-[1.65]">Students share what actually matters — new frameworks, job changes, interview insights. By devs, for devs.</div>
        </div>
      </div>
    </section>
  );
}