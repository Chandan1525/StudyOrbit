export default function HowItWorksSection() {
  return (
    // 🔥 bg aur border hata diye, transparency maintain rahegi 🔥
    <section id="how" className="py-24 relative z-[2]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        {/* Header styling ko thoda aur refined kiya */}
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#6c63ff] mb-3">
          How it works
        </div>
        <h2 className="font-display text-[28px] md:text-[42px] font-bold tracking-tight leading-[1.15] text-white mb-16">
          From zero to your tech tribe in minutes.
        </h2>
        
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-0">
          {/* Connecting line (white/10) background ke upar clear dikhegi */}
          <div className="hidden md:block absolute top-[28px] left-[12%] right-[12%] h-[1px] bg-white/10" />
          
          <div className="flex flex-col items-center text-center px-4 relative">
            <div className="font-display w-14 h-14 rounded-full border-2 border-[#6c63ff] bg-[#0B1117]/50 text-[#6c63ff] flex items-center justify-center text-[18px] font-bold mb-5 relative z-10">1</div>
            <div className="text-[15px] font-semibold mb-2 text-white">Create your profile</div>
            <div className="text-[13px] text-[#8D9CAE] leading-[1.65]">Sign up in 30 seconds. Add your skills, interests, and what you're currently building.</div>
          </div>
          
          <div className="flex flex-col items-center text-center px-4 relative">
            <div className="font-display w-14 h-14 rounded-full border-2 border-[#3ecfad] bg-[#0B1117]/50 text-[#3ecfad] flex items-center justify-center text-[18px] font-bold mb-5 relative z-10">2</div>
            <div className="text-[15px] font-semibold mb-2 text-white">Join communities</div>
            <div className="text-[13px] text-[#8D9CAE] leading-[1.65]">Pick communities that match your stack — AI, DSA, Web Dev, whatever you're into.</div>
          </div>
          
          <div className="flex flex-col items-center text-center px-4 relative">
            <div className="font-display w-14 h-14 rounded-full border-2 border-[#f572b8] bg-[#0B1117]/50 text-[#f572b8] flex items-center justify-center text-[18px] font-bold mb-5 relative z-10">3</div>
            <div className="text-[15px] font-semibold mb-2 text-white">Share & engage</div>
            <div className="text-[13px] text-[#8D9CAE] leading-[1.65]">Post your project, drop a hackathon link, share an insight. Your audience is already here.</div>
          </div>
          
          <div className="flex flex-col items-center text-center px-4 relative">
            <div className="font-display w-14 h-14 rounded-full border-2 border-[#f5b842] bg-[#0B1117]/50 text-[#f5b842] flex items-center justify-center text-[18px] font-bold mb-5 relative z-10">4</div>
            <div className="text-[15px] font-semibold mb-2 text-white">Grow your network</div>
            <div className="text-[13px] text-[#8D9CAE] leading-[1.65]">Connect with like-minded students, find teammates, get referrals, and land opportunities.</div>
          </div>
        </div>
      </div>
    </section>
  );
}