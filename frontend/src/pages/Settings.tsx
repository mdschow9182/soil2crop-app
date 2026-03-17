import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Globe, User, Bell, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
];

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleLanguageChange = (newLanguage: string) => {
    console.log('[Settings] handleLanguageChange called with:', newLanguage);
    console.log('[Settings] current language:', language);
    
    setLanguage(newLanguage as any);
    
    const langName = LANGUAGES.find(l => l.code === newLanguage)?.name || newLanguage;
    console.log('[Settings] after setLanguage, toast message:', langName);
    
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
          <h1 className="text-xl font-heading font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Farmer Name</Label>
              <p className="text-lg font-medium">{farmerName}</p>
            </div>
            {farmerId && (
              <div>
                <Label className="text-muted-foreground">Farmer ID</Label>
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
              Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Select App Language</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
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
                Current Language Code: <span className="font-bold">{language}</span>
              </p>
            </div>

            {/* Preview */}
            <div className="rounded-lg bg-secondary p-4 space-y-2">
              <p className="text-sm font-medium text-secondary-foreground">Preview (Auto-updates):</p>
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
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Crop calendar alerts and reminders will appear here.
            </p>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={() => {
            localStorage.removeItem("farmer_id");
            localStorage.removeItem("farmer_name");
            window.location.href = "/";
          }}
        >
          Logout
        </Button>
      </main>
    </div>
  );
};

export default Settings;
