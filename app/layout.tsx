import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from "@/context/LanguageContext"; // 🟢 Language Provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🔥 PWA Manifest linked here
export const metadata: Metadata = {
  title: "StudyOrbit",
  description: "Your modern learning platform",
  manifest: "/manifest.json", 
};

// 🔥 Mobile status bar color for true Native App feel
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,       // 🔥 Prevents iOS auto-zoom bug on inputs
  userScalable: false,   // 🔥 Locks the UI like a real Native App
};

// 🟢 SIRF EK BAAR ROOT LAYOUT
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 🔥 PROJECT-WIDE THEME & ACCENT INITIALIZER 🔥 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedPrefs = localStorage.getItem("studyorbit_preferences");
                  if (savedPrefs) {
                    const { theme, accentColor } = JSON.parse(savedPrefs);
                    
                    // 1. Theme Mode Sync
                    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                      document.documentElement.classList.add("dark");
                    } else {
                      document.documentElement.classList.remove("dark");
                    }
                    
                    // 2. Accent Color Custom Property Variable Setup
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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        
        <GoogleOAuthProvider clientId="58335293080-50hknia78iak3a7i8bf4ea8lu8s9cvmm.apps.googleusercontent.com">
          {/* 🟢 LANGUAGE PROVIDER WRAPPER */}
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </GoogleOAuthProvider>

      </body>
    </html>
  );
}