"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Scale } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function TermsPage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: (
        <p>
          By accessing and using StudyOrbit, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not use our platform. These terms apply to all visitors, users, and others who access or use the Service.
        </p>
      ),
    },
    {
      title: "2. User Accounts & Responsibilities",
      content: (
        <>
          <p className="mb-4">When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>You are responsible for safeguarding the password that you use to access the Service.</li>
            <li>You agree not to disclose your password to any third party.</li>
            <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. Acceptable Use Policy",
      content: (
        <>
          <p className="mb-4">StudyOrbit is a platform built for students and developers to network, learn, and showcase their projects. You agree not to use the Service to:</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>Post or transmit any content that is illegal, abusive, harassing, or discriminatory.</li>
            <li>Spam other users with unsolicited promotional messages or misleading links.</li>
            <li>Upload malicious code, viruses, or attempt to disrupt the platform's infrastructure.</li>
            <li>Impersonate any person or entity, or falsely state your affiliation with a person or entity.</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Intellectual Property & Content Ownership",
      content: (
        <p>
          You retain full ownership of the code, projects, and text you share on StudyOrbit. However, by posting content, you grant us a non-exclusive, royalty-free license to use, display, and distribute your content across the platform (e.g., in the 'Trending' feed or community groups). StudyOrbit's logo, design, and original code are the exclusive property of StudyOrbit and its founders.
        </p>
      ),
    },
    {
      title: "5. Account Termination",
      content: (
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
        </p>
      ),
    },
    {
      title: "6. Limitation of Liability",
      content: (
        <p>
          In no event shall StudyOrbit, nor its directors, employees, partners, or agents, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
        </p>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-gray-500/30">
      <Navbar />

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-start justify-center">
        <div className="absolute top-[-10%] w-[600px] h-[400px] bg-[#6c63ff]/[0.02] blur-[120px] rounded-full" />
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
              <Scale className="text-gray-300" size={24} />
            </div>
            {/* 🔥 FONT DISPLAY APPLIED 🔥 */}
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-white">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Effective Date: May 2026</p>
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
              Please read these terms carefully before using the StudyOrbit platform. These terms govern your use of our website, applications, and services.
            </p>

            {sections.map((section, index) => (
              <div key={index} className="mb-10">
                {/* 🔥 FONT DISPLAY APPLIED 🔥 */}
                <h2 className="font-display text-2xl font-bold mb-5 text-gray-100 border-b border-gray-800 pb-3">
                  {section.title}
                </h2>
                <div className="text-gray-400 leading-relaxed text-base text-justify">
                  {section.content}
                </div>
              </div>
            ))}

            <div className="mt-16 p-6 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-800 text-center">
              {/* 🔥 FONT DISPLAY APPLIED 🔥 */}
              <h3 className="font-display text-xl font-bold mb-2 text-gray-200">Got Questions?</h3>
              <p className="text-gray-400 mb-4">
                If you have any questions or concerns about these Terms, feel free to reach out.
              </p>
              <a href="mailto:studyorbit11@gmail.com" className="text-[#6c63ff] hover:text-[#5b54e5] transition-colors font-medium">
                studyorbit11@gmail.com
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}