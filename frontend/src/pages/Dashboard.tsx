import { useState, useEffect } from "react";
import { 
  Sprout, 
  TrendingUp, 
  Users, 
  FileText,
  Wheat,
  CloudRain,
  Sun,
  Leaf,
  ShoppingCart,
  Award,
  Bell,
  Settings,
  LayoutDashboard,
  BookOpen,
  Stethoscope,
  Volume2
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { speakMessage, isSpeechSupported, initializeVoices } from "@/utils/voiceAssistant";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [farmerName] = useState(() => localStorage.getItem("farmer_name") || "Valued Farmer");
  const { t, language } = useLanguage();
  const speechSupported = isSpeechSupported();
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  // Initialize voices on mount
  useEffect(() => {
    if (speechSupported) {
      initializeVoices();
    }
  }, [speechSupported]);

  // Speak welcome message once when dashboard loads
  useEffect(() => {
    if (speechSupported && !hasSpokenWelcome) {
      const welcomeMsg = language === 'te' 
        ? 'సoil2Crop రైతు డాష్‌బోర్డ్‌కు స్వాగతం. మీ మట్టి పరీక్ష ఫలితాలను అప్‌లోడ్ చేసి, పంట సిఫార్సులను పొందండి.'
        : language === 'hi'
        ? 'Soil2Crop किसान डैशबोर्ड में आपका स्वागत है। अपनी मिट्टी की रिपोर्ट अपलोड करें और फसल सिफारिशें प्राप्त करें।'
        : 'Welcome to Soil2Crop farmer dashboard. Upload your soil report and get personalized crop recommendations.';
      
      speakMessage(welcomeMsg, language, undefined, (err) => {
        console.error('Voice error:', err);
        setHasSpokenWelcome(true);
      });
    }
  }, [speechSupported, language, hasSpokenWelcome]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Agriculture Background */}
      <header className="border-b bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="container max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-green-950/50 shadow-sm">
              <Sprout className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">{(t as any).welcome || "Welcome"}, {farmerName}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Leaf className="w-4 h-4" />
                {(t as any).smartFarming || "Smart Farming Decision Support System"}
              </p>
            </div>
          </div>
          
          {speechSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const welcomeMsg = language === 'te' 
                  ? 'సoil2Crop రైతు డాష్‌బోర్డ్‌కు స్వాగతం'
                  : language === 'hi'
                  ? 'Soil2Crop किसान डैशबोर्ड में आपका स्वागत है'
                  : 'Welcome to Soil2Crop farmer dashboard';
                speakMessage(welcomeMsg, language, undefined, (err) => {
                  console.error('Voice error:', err);
                });
              }}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              🔊 Listen
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<FileText className="w-6 h-6 text-green-600" />}
            iconBg="bg-green-100"
            title={(t as any).navSoilReport || "Soil Report"}
            description={(t as any).uploadSoil || "Upload your soil test report"}
            href="/soil-report"
          />
          <QuickActionCard
            icon={<Wheat className="w-6 h-6 text-amber-600" />}
            iconBg="bg-amber-100"
            title={(t as any).navCropAdvice || "Crop Suggestions"}
            description={(t as any).generate || "Get personalized crop recommendations"}
            href="/crop-suggestion"
          />
          <QuickActionCard
            icon={<Award className="w-6 h-6 text-blue-600" />}
            iconBg="bg-blue-100"
            title={(t as any).settings || "Government Schemes"}
            description={(t as any).advisory || "Explore available government support"}
            href="/government-schemes"
          />
        </section>

        {/* Farm Overview */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-foreground mb-4">
            {(t as any).farmingJourney || "Your Farming Journey"}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{(t as any).soilAnalysis || "Soil Analysis"}</h3>
                <p className="text-sm text-muted-foreground">
                  {(t as any).uploadHint || "Upload your soil test report to get detailed analysis and nutrient recommendations."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Wheat className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{(t as any).cropRecommendations || "Crop Recommendations"}</h3>
                <p className="text-sm text-muted-foreground">
                  {(t as any).simulatedNote || "Receive AI-powered crop suggestions based on your soil conditions and local climate."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{(t as any).supportResources || "Support & Resources"}</h3>
                <p className="text-sm text-muted-foreground">
                  {(t as any).advisory || "Access government schemes, market prices, and expert guidance for successful farming."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<ShoppingCart className="w-5 h-5 text-green-600" />}
            iconBg="bg-green-100"
            title={(t as any).marketPrices || "Market Prices"}
            description={(t as any).monitor || "Real-time mandi prices for better decision making"}
            href="/market-prices"
          />
          <FeatureCard
            icon={<CloudRain className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-100"
            title={(t as any).calendar || "Crop Calendar"}
            description={(t as any).monitor || "Track planting, growth, and harvest schedules"}
            href="/crop-details"
          />
          <FeatureCard
            icon={<Sun className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-100"
            title={(t as any).crops || "Crop Monitoring"}
            description={(t as any).monitor || "Monitor crop health with AI-powered analysis"}
            href="/crop-monitoring"
          />
          <FeatureCard
            icon={<Bell className="w-5 h-5 text-red-600" />}
            iconBg="bg-red-100"
            title={(t as any).navAlerts || "Alerts & Notifications"}
            description={(t as any).alert || "Stay informed about important farm updates"}
            href="/alerts"
          />
          <FeatureCard
            icon={<BookOpen className="w-5 h-5 text-purple-600" />}
            iconBg="bg-purple-100"
            title={(t as any).tutorialsTitle || "Farmer Tutorials"}
            description="Step-by-step guides to use Soil2Crop effectively"
            href="/tutorials"
          />
          <FeatureCard
            icon={<Stethoscope className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-100"
            title="🌿 Crop Health Check"
            description="AI-powered crop disease detection and health analysis"
            href="/crop-health-monitor"
          />
        </section>
      </main>
    </div>
  );
};

// Helper Components
interface QuickActionCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  href: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon, iconBg = "bg-primary/10", title, description, href }) => {
  const navigate = (url: string) => {
    window.location.href = url;
  };

  return (
    <button
      onClick={() => navigate(href)}
      className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
};

interface FeatureCardProps {
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, iconBg = "bg-primary/10", title, description, href }) => {
  const navigate = (url: string) => {
    window.location.href = url;
  };

  return (
    <button
      onClick={() => navigate(href)}
      className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className={`p-2 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
};

export default Dashboard;
