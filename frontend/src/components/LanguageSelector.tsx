import React from "react";
import { Globe } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { supportedLanguages, type LanguageCode } from "@/i18n/translations";

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (value: string) => {
    // Validate the value is a supported language code
    const isValidLanguage = supportedLanguages.some(lang => lang.code === value);
    
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
        <SelectTrigger className="w-[140px] h-9 text-sm" aria-label={t.selectAppLanguage}>
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

export default LanguageSelector;
