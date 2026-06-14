import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Syne } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: 'swap',
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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
      {/* Tailwind v4 automatically maps font-sans to the --font-sans variable we define in globals.css 
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