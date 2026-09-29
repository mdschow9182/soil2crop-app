import React from "react";
import { Globe } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { supportedLanguages, type LanguageCode } from "@/i18n/translations";

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (value: string) => {
    // Validate the value is a supported language code
    const isValidLanguage = supportedLanguages.some(lang => lang.code === value);
    
    if (!isValidLanguage) {
      console.error('[LanguageSwitcher] Invalid language selected:', value);
      return;
    }

    console.log('[LanguageSwitcher] Changing language to:', value);
    setLanguage(value as LanguageCode);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Globe className="w-5 h-5 text-muted-foreground" />
      <Select value={language} onValueChange={handleChange}>
        <SelectTrigger className="h-11 w-[160px] text-sm" aria-label={t.selectAppLanguage}>
          <SelectValue placeholder={t.selectAppLanguage} />
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
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

export default LanguageSwitcher;
