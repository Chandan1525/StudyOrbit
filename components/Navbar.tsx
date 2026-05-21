import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-black/10 border-b border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-wide text-white">
          Study<span className="text-blue-500">Orbit</span>
        </h1>

        {/* Buttons */}
        <div className="flex items-center gap-4">

          <Link
            href="/auth/login"
            className="text-gray-300 hover:text-white transition duration-300"
          >
            Login
          </Link>

          <Link
            href="/auth/register"
            className="bg-white text-black px-5 py-2 rounded-full font-medium hover:scale-105 transition duration-300"
          >
            Register
          </Link>

        </div>
      </div>
    </nav>
  );
}