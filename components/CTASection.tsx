import Link from "next/link";

export default function CTASection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-24 text-center">
      <div className="bg-[#111118] border border-white/5 rounded-[20px] py-16 md:py-20 px-6 relative overflow-hidden">
        <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#6c63ff]/20 rounded-full blur-[60px] pointer-events-none" />
        
        <h2 className="font-display text-[28px] md:text-[46px] font-extrabold tracking-tight leading-[1.15] mb-4 relative text-white">
          Your tech community<br />is already here.
        </h2>
        <p className="text-[16px] text-[#7a7a8c] mb-10 max-w-[500px] mx-auto relative">
          12,000+ students are already posting projects, finding hackathons, and growing together. Join them — it's free.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center relative">
          <Link href="/auth/register" className="text-[15px] font-semibold text-white bg-[#6c63ff] hover:bg-[#5b54e5] px-7 py-3.5 rounded-xl transition-transform hover:-translate-y-0.5">
            Create your profile →
          </Link>
          <Link href="/auth/login" className="text-[15px] font-medium text-[#7a7a8c] border border-white/10 hover:border-white/30 hover:text-white px-7 py-3.5 rounded-xl transition-all">
            Explore the feed first
          </Link>
        </div>
      </div>
    </section>
  );
}