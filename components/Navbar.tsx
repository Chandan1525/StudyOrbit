import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-[999] bg-transparent border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white whitespace-nowrap flex-shrink-0 relative">
          Study<span className="text-blue-500">Orbit</span>
        </h1>

        {/* Buttons */}
        <div className="flex items-center gap-3 md:gap-4 relative">

          <Link
            href="/auth/login"
            className="text-sm md:text-base text-gray-300 hover:text-white transition duration-300 whitespace-nowrap"
          >
            Login
          </Link>

          <Link
            href="/auth/register"
            className="text-sm md:text-base bg-white text-black px-4 py-1.5 md:px-5 md:py-2 rounded-full font-medium hover:scale-105 transition duration-300 whitespace-nowrap shadow-md"
          >
            Register
          </Link>

        </div>
      </div>
    </nav>
  );
}