import Link from "next/link";

export default function CTASection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-24 text-center relative z-[2]">
      {/* Container se bg-[#111118], border, aur padding hata di hai */}
      <div className="relative">
        <h2 className="font-display text-[28px] md:text-[46px] font-extrabold tracking-tight leading-[1.15] mb-4 text-white">
          Your tech community<br />is already here.
        </h2>
        <p className="text-[16px] text-[#7a7a8c] mb-10 max-w-[500px] mx-auto">
          120+ students are already posting projects, finding hackathons, and growing together. Join them — it's free.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/auth/register" className="text-[15px] font-semibold text-white bg-[#6c63ff] hover:bg-[#5b54e5] px-7 py-3.5 rounded-xl transition-transform hover:-translate-y-0.5 shadow-lg shadow-[#6c63ff]/20">
            Create your profile →
          </Link>
          <Link href="/auth/login" className="text-[15px] font-medium text-white/70 border border-white/10 hover:border-white/30 hover:text-white px-7 py-3.5 rounded-xl transition-all">
            Explore the feed first
          </Link>
        </div>
      </div>
    </section>
  );
}