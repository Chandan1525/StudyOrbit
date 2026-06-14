"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <>
          <p className="mb-4">When you use StudyOrbit, we collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li><strong>Account Information:</strong> Name, email address, password, and profile picture.</li>
            <li><strong>Profile Data:</strong> Skills, projects, GitHub/LinkedIn links, and educational details you choose to share.</li>
            <li><strong>Communication Data:</strong> Messages sent through our real-time chat, forum posts, and comments.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with the platform, including log data and device information.</li>
          </ul>
        </>
      ),
    },
    {
      title: "2. How We Use Your Information",
      content: (
        <>
          <p className="mb-4">We use the collected data to provide, maintain, and improve our services, specifically to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Create and secure your StudyOrbit account.</li>
            <li>Facilitate networking and display your profile to other students and recruiters.</li>
            <li>Enable real-time messaging and community discussions.</li>
            <li>Send important security alerts (like password changes) and platform updates.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Data Sharing & Visibility",
      content: (
        <p>
          We do not sell your personal data. Your profile information is visible to other registered users based on your privacy settings. You have full control over what is public and what is private. We may share data with trusted third-party service providers (e.g., hosting, database services) strictly for operational purposes, or if required by law.
        </p>
      ),
    },
    {
      title: "4. Data Security",
      content: (
        <p>
          We implement industry-standard security measures, including encrypted passwords and secure token-based authentication (JWT), to protect your data. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      ),
    },
    {
      title: "5. Your Rights & Choices",
      content: (
        <p>
          You have the right to access, update, or delete your personal information at any time through your account settings. You can also toggle your active status and profile visibility. If you wish to completely delete your account, you can do so from the Settings page.
        </p>
      ),
    },
    {
      title: "6. Changes to This Policy",
      content: (
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
        </p>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-gray-500/30">
      <Navbar />

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
        <div className="absolute top-[-10%] w-[600px] h-[400px] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <button 
            onClick={() => router.back()}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-600 bg-gray-900/50 px-5 py-2.5 rounded-full shadow-lg"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center border border-gray-600 shadow-lg">
              <Shield className="text-gray-300" size={24} />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Last Updated: May 2026</p>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-12"
        >
          <div className="prose prose-invert prose-gray max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-10 text-justify">
              Welcome to StudyOrbit. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>

            {sections.map((section, index) => (
              <div key={index} className="mb-10">
                <h2 className="font-display text-2xl font-bold mb-5 text-gray-100 border-b border-gray-800 pb-3">
                  {section.title}
                </h2>
                {/* 🔥 YAHAN CHANGE KIYA HAI: text-justify aur thoda extra spacing add kiya hai 🔥 */}
                <div className="text-gray-400 leading-relaxed text-base text-justify">
                  {section.content}
                </div>
              </div>
            ))}

            <div className="mt-16 p-6 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-800 text-center">
              <h3 className="font-display text-xl font-bold mb-2 text-gray-200">Contact Us</h3>
              <p className="text-gray-400 mb-4">
                If you have any questions about this Privacy Policy, please contact us.
              </p>
              <a href="mailto:studyorbit11@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                studyorbit11@gmail.com
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}