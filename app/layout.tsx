import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Syne } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from "@/context/LanguageContext";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Inter — body / reading copy  →  font-inter
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Syne — brand / display headlines  →  font-syne
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ─── Metadata & Viewport ─────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "StudyOrbit | The Launchpad for Your Student Career",
  description: "Share projects, discover hackathons, and join tech communities.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// ─── Root Layout ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${inter.variable}
        ${syne.variable}
        h-full antialiased
      `}
      suppressHydrationWarning
    >
      <head>
        {/* Inline theme + accent-color script — runs before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedPrefs = localStorage.getItem("studyorbit_preferences");
                  if (savedPrefs) {
                    const { theme, accentColor } = JSON.parse(savedPrefs);
                    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                      document.documentElement.classList.add("dark");
                    } else {
                      document.documentElement.classList.remove("dark");
                    }
                    if (accentColor) {
                      document.documentElement.style.setProperty("--accent-color", accentColor);
                    }
                  } else {
                    document.documentElement.style.setProperty("--accent-color", "#6366f1");
                  }
                } catch (e) {
                  console.error("Theme script hydration failed", e);
                }
              })();
            `,
          }}
        />
      </head>

      {/*
        font-sans resolves to --font-sans which should be mapped to Inter
        in your globals.css / Tailwind v4 config (see globals.css note below).
        font-syne  →  use className="font-syne"  on headlines
        font-inter →  use className="font-inter" on body copy / UI
      */}
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <GoogleOAuthProvider clientId="58335293080-50hknia78iak3a7i8bf4ea8lu8s9cvmm.apps.googleusercontent.com">
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}