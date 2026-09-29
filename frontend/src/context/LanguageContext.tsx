import { createContext, useContext, useState, useEffect, useRef } from "react";
import { translations } from "@/i18n/translations";
import type { LanguageCode } from "@/i18n/translations";
import { updateFarmerLanguage, getFarmerById } from "@/api";
import { stopSpeech } from "@/utils/voiceAssistant";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const LANGUAGE_KEY = "soil2crop_language";

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const hadStoredPreference = useRef(Boolean(localStorage.getItem(LANGUAGE_KEY)));
  const userChangedLanguage = useRef(false);
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Auto-load saved language
    const saved = localStorage.getItem(LANGUAGE_KEY) as LanguageCode | null;
    return saved && translations[saved] ? saved : "en";
  });

  // Sync locale changes to localStorage
  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    stopSpeech();
  }, [language]);

  // Fetch farmer's language preference on mount
  useEffect(() => {
    const farmerId = localStorage.getItem("farmer_id");
    if (farmerId) {
      getFarmerById(farmerId)
        .then((res) => {
          const fetchedLang = res.farmer?.language || res.data?.language || res.language;
          // A delayed profile response must not overwrite a saved or in-session choice.
          if (!hadStoredPreference.current && !userChangedLanguage.current && fetchedLang && translations[fetchedLang]) {
            setLanguageState(fetchedLang);
            localStorage.setItem(LANGUAGE_KEY, fetchedLang);
          }
        })
        .catch((err) => {
          // If farmer not found, clear stale ID (likely DB reset)
          if (err.message === 'Farmer not found') {
            localStorage.removeItem('farmer_id');
          }
        });
    }
  }, []);

  const setLanguage = (newLanguage: LanguageCode) => {
    // Validate
    if (!translations[newLanguage]) {
      console.error('[LanguageProvider] invalid language code:', newLanguage);
      return;
    }
    userChangedLanguage.current = true;
    // Update state - triggers re-render
    setLanguageState(newLanguage);
    // Persist immediately
    localStorage.setItem(LANGUAGE_KEY, newLanguage);
    // Sync to backend
    const farmerId = localStorage.getItem("farmer_id");
    if (farmerId) {
      updateFarmerLanguage(farmerId, newLanguage)
        .catch((err) => console.warn('[LanguageProvider] backend sync error:', err.message));
    }
  };

  const t = translations[language] || translations.en;

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
