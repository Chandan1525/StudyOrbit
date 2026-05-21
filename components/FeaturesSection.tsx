export default function FeaturesSection() {
  return (
    <section className="bg-black text-white py-24 px-6 md:px-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-semibold mb-4">
            Communities
          </h3>

          <p className="text-gray-400">
            Join focused communities like Web Dev, AI/ML,
            Blockchain, and DSA.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-semibold mb-4">
            Opportunities
          </h3>

          <p className="text-gray-400">
            Discover internships, hackathons, and open-source
            opportunities.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-semibold mb-4">
            Student Identity
          </h3>

          <p className="text-gray-400">
            Build your digital profile with projects, skills,
            socials, and achievements.
          </p>
        </div>
      </div>
    </section>
  );
}