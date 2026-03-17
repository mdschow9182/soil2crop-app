import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/i18n/translations";
import { updateFarmerLanguage, getFarmerById } from "@/api";

type Language = "en" | "te" | "hi" | "ta" | "kn" | "ml";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANGUAGE_KEY = "soil2crop_language";

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Auto-load saved language
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
    console.log('[LanguageProvider] init: language =', saved || "en (default)");
    return saved && translations[saved] ? saved : "en";
  });

  // Sync locale changes to localStorage
  useEffect(() => {
    console.log('[LanguageProvider] effect: saving to localStorage:', language);
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  // Fetch farmer's language preference on mount
  useEffect(() => {
    const farmerId = localStorage.getItem("farmer_id");
    if (farmerId) {
      getFarmerById(farmerId)
        .then((res) => {
          const fetchedLang = res.data?.language || res.language;
          console.log('[LanguageProvider] fetched language from backend:', fetchedLang);
          if (fetchedLang && translations[fetchedLang]) {
            setLanguage(fetchedLang); // Use setLanguage to sync/persist
          }
        })
        .catch((err) => {
          // Silently fail - farmer might not exist in backend yet
          // This is OK for development/demo mode
          console.debug('[LanguageProvider] Using local language preference (backend unavailable)');
        });
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    console.log('[LanguageProvider] setLanguage:', newLanguage);
    // Validate
    if (!translations[newLanguage]) {
      console.error('[LanguageProvider] invalid language code:', newLanguage);
      return;
    }
    // Update state - triggers re-render
    setLanguageState(newLanguage);
    // Persist immediately
    localStorage.setItem(LANGUAGE_KEY, newLanguage);
    // Sync to backend
    const farmerId = localStorage.getItem("farmer_id");
    if (farmerId) {
      updateFarmerLanguage(farmerId, newLanguage)
        .then(() => console.log('[LanguageProvider] backend synced'))
        .catch((err) => console.warn('[LanguageProvider] backend sync error:', err.message));
    }
  };

  const t = translations[language];

  console.log('[LanguageProvider] render: language =', language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
