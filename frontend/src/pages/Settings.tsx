import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Globe, User, Bell, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supportedLanguages } from "@/i18n/translations";

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = (newLanguage: string) => {
    if (!supportedLanguages.some((item) => item.code === newLanguage)) return;
    const languageCode = newLanguage as typeof supportedLanguages[number]["code"];
    setLanguage(languageCode);
    const langName = supportedLanguages.find((item) => item.code === languageCode)?.name || languageCode;
    
    toast({
      title: t.languageUpdated || "Language Updated",
      description: `${t.appLanguageChangedTo || "App language changed to"} ${langName}`,
    });
  };

  const farmerName = localStorage.getItem("farmer_name") || "Guest";
  const farmerId = localStorage.getItem("farmer_id");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Sprout className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-heading font-bold text-foreground">{t.settingsTitle}</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.profile}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{t.farmerNameLabel}</Label>
              <p className="text-lg font-medium">{farmerName}</p>
            </div>
            {farmerId && (
              <div>
                <Label className="text-muted-foreground">{t.farmerIdLabel}</Label>
                <p className="text-sm text-muted-foreground">#{farmerId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t.language}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t.selectAppLanguage}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.native}</span>
                        <span className="text-muted-foreground">({lang.name})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Language Display */}
            <div className="rounded-lg bg-blue-50/50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {t.currentLanguageCode}: <span className="font-bold">{language}</span>
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-lg bg-secondary p-4 space-y-2">
              <p className="text-sm font-medium text-secondary-foreground">{t.previewAutoUpdates}</p>
              <div className="space-y-1 text-sm">
                <p>• {t.login}</p>
                <p>• {t.uploadSoil}</p>
                <p>• {t.generate}</p>
                <p>• {t.settings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t.notificationsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t.calendarAlertsReminder}
            </p>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={() => {
            localStorage.removeItem("farmer_id");
            localStorage.removeItem("farmerId");
            localStorage.removeItem("soil2crop_token");
            localStorage.removeItem("farmer_name");
            window.location.href = "/";
          }}
        >
          {t.logout}
        </Button>
      </main>
    </div>
  );
};

export default Settings;
