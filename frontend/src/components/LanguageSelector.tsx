import React from "react";
import { Globe } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";

// Define supported languages with proper metadata
const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
] as const;

type LanguageCode = typeof LANGUAGES[number]["code"];

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleChange = (value: string) => {
    // Validate the value is a supported language code
    const isValidLanguage = LANGUAGES.some(lang => lang.code === value);
    
    if (!isValidLanguage) {
      console.error('[LanguageSelector] Invalid language selected:', value);
      return;
    }

    console.log('[LanguageSelector] Changing language to:', value);
    setLanguage(value as LanguageCode);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={language} onValueChange={handleChange}>
        <SelectTrigger className="w-[140px] h-9 text-sm" aria-label="Select language">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              aria-label={`${lang.name} language`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{lang.native}</span>
                <span className="text-xs text-muted-foreground">({lang.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
