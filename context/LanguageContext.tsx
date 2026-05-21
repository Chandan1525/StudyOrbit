"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// 🔥 PURI WEBSITE KI DICTIONARY YAHAN HOGI 🔥
const TRANSLATIONS: any = {
  "English (US)": {
    // Nav & Common
    home: "Home", search: "Search", community: "Community", chats: "Chats", profile: "Profile",
    apply: "Apply", revoke: "Revoke",
    
    // Settings Page
    settingsTitle: "Settings", settingsDesc: "Manage your account",
    account: "Account", editProfile: "Edit Profile", editProfileDesc: "Update name, bio & photo",
    changePass: "Change Password", changePassDesc: "Update your login password",
    privacy: "Privacy & Security", privacyDesc: "Manage account protection",
    preferences: "Preferences", notif: "Notifications", notifDesc: "Push & email preferences",
    appearance: "Appearance", appearanceDesc: "Dark mode & themes",
    accent: "Accent Colors", accentDesc: "Customize UI accent color",
    platform: "Platform", language: "Language",
    devices: "Connected Devices", devicesDesc: "Manage active sessions",
    storage: "Storage & Cache", storageDesc: "Clear temporary data",
    publicProfile: "Public Profile", publicProfileDesc: "Visible to everyone",
    logout: "Sign Out", noDevices: "No active devices found.",
  },
  "Hindi": {
    // Nav & Common
    home: "होम", search: "खोजें", community: "समुदाय", chats: "चैट्स", profile: "प्रोफ़ाइल",
    apply: "लागू करें", revoke: "हटाएं",
    
    // Settings Page
    settingsTitle: "सेटिंग्स", settingsDesc: "अपना खाता प्रबंधित करें",
    account: "खाता", editProfile: "प्रोफ़ाइल संपादित करें", editProfileDesc: "नाम, बायो और फोटो बदलें",
    changePass: "पासवर्ड बदलें", changePassDesc: "लॉगिन पासवर्ड अपडेट करें",
    privacy: "गोपनीयता और सुरक्षा", privacyDesc: "खाता सुरक्षा प्रबंधित करें",
    preferences: "प्राथमिकताएं", notif: "सूचनाएं", notifDesc: "पुश और ईमेल प्राथमिकताएं",
    appearance: "दिखावट", appearanceDesc: "डार्क मोड और थीम्स",
    accent: "एक्सेंट रंग", accentDesc: "UI रंग को अनुकूलित करें",
    platform: "प्लेटफ़ॉर्म", language: "भाषा",
    devices: "जुड़े हुए उपकरण", devicesDesc: "सक्रिय सत्र प्रबंधित करें",
    storage: "स्टोरेज और कैशे", storageDesc: "अस्थायी डेटा साफ़ करें",
    publicProfile: "सार्वजनिक प्रोफ़ाइल", publicProfileDesc: "सभी को दिखाई दे",
    logout: "लॉग आउट करें", noDevices: "कोई सक्रिय उपकरण नहीं मिला।",
  }
};

const LanguageContext = createContext<any>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState("English (US)");

  useEffect(() => {
    // Load saved language on mount
    const saved = localStorage.getItem("studyorbit_preferences");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.language) setLanguage(parsed.language);
      } catch {}
    }
  }, []);

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    // Update local storage
    const saved = localStorage.getItem("studyorbit_preferences");
    const prefs = saved ? JSON.parse(saved) : {};
    prefs.language = lang;
    localStorage.setItem("studyorbit_preferences", JSON.stringify(prefs));
  };

  // Translation function: Pass a key, get the word in selected language
  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["English (US)"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);