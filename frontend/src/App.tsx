import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Header from "@/components/Header";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute";
import AIFarmerAssistant from "@/components/AIFarmerAssistant";
import { lazy, Suspense, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { HelpButton } from "@/components/HelpButton";
import { FarmerSupportButton } from "@/components/FarmerSupportButton";
import { cleanupVoiceInitialization, initializeVoices, isSpeechSupported, stopSpeech } from "@/utils/voiceAssistant";

const Login = lazy(() => import("./pages/Login"));
const SoilReport = lazy(() => import("./pages/SoilReport"));
const CropSuggestion = lazy(() => import("./pages/CropSuggestion"));
const CropDetails = lazy(() => import("./pages/CropDetails"));
const CropCalendar = lazy(() => import("./pages/CropCalendar"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Settings = lazy(() => import("./pages/Settings"));
const Alerts = lazy(() => import("./pages/Alerts"));
const GovernmentDashboard = lazy(() => import("./pages/GovernmentDashboard"));
const MarketDashboard = lazy(() => import("./pages/MarketDashboard"));
const IoTDashboard = lazy(() => import("./pages/IoTDashboard"));
const IoTDashboardSimulated = lazy(() => import("./pages/IoTDashboardSimulated"));
const Tutorials = lazy(() => import("./pages/Tutorials"));
const CropMonitoring = lazy(() => import("./pages/CropMonitoring"));
const VoiceDebug = lazy(() => import("@/components/VoiceDebug"));
const ApiConfigurationDebug = lazy(() => import("@/pages/ApiConfigurationDebug"));

const queryClient = new QueryClient();

const SpeechRouteLifecycle = () => {
  const location = useLocation();
  useEffect(() => () => stopSpeech(), [location.pathname]);
  return null;
};

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Initialize voices on app mount
  useEffect(() => {
    if (isSpeechSupported()) {
      initializeVoices();
    }
    return cleanupVoiceInitialization;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "🌐 Back Online",
        description: "Syncing your data...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📡 Offline Mode",
        description: "Showing cached data. You can still work!",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />

          {!isOnline && (
            <div role="status" className="fixed inset-x-0 top-14 z-30 bg-red-600 px-4 py-1 text-center text-xs font-medium text-white">
              📴 Offline
            </div>
          )}

          {isOnline && (
            <div className="fixed inset-x-0 top-0 z-30 bg-green-600 px-4 py-1 text-center text-xs font-medium text-white">
              🌐 Online
            </div>
          )}

          <BrowserRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true
            }}
          >
            <SpeechRouteLifecycle />
            {/* Header with Settings Icon - MUST be inside BrowserRouter for useNavigate() */}
            <Header />

            <div className="container mx-auto flex max-w-5xl justify-end px-4 pb-2 pt-16 sm:px-6">
              <LanguageSwitcher />
            </div>
            <div className="min-h-[calc(100dvh-8rem)] pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-1">
              <Suspense fallback={<div role="status" className="px-4 py-8 text-center text-sm text-muted-foreground">Loading page…</div>}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/soil-report" element={<ProtectedRoute><SoilReport /></ProtectedRoute>} />
                <Route path="/crop-suggestion" element={<ProtectedRoute><CropSuggestion /></ProtectedRoute>} />
                <Route path="/crop-calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
                <Route path="/crop-details" element={<ProtectedRoute><CropDetails /></ProtectedRoute>} />
                <Route path="/crop-monitoring" element={<ProtectedRoute><CropMonitoring /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/iot" element={<ProtectedRoute><IoTDashboard /></ProtectedRoute>} />
                <Route path="/iot-simulated" element={<ProtectedRoute><IoTDashboardSimulated /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/government-schemes" element={<ProtectedRoute><GovernmentDashboard /></ProtectedRoute>} />
                <Route path="/market-prices" element={<ProtectedRoute><MarketDashboard /></ProtectedRoute>} />
                <Route path="/tutorials" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />
                {import.meta.env.DEV && <Route path="/dev/language-voice-diagnostics" element={<VoiceDebug />} />}
                {import.meta.env.DEV && <Route path="/dev/api-configuration" element={<ApiConfigurationDebug />} />}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </div>
            <BottomNav />
          </BrowserRouter>

          {/* AI Farmer Assistant Chat - Available on all pages */}
          <AIFarmerAssistant />

          {/* Help & Feedback Button - Available on all pages */}
          <FarmerSupportButton farmerId={localStorage.getItem('farmerId') || undefined} />
          {/* Note: HelpButton kept for backward compatibility, FarmerSupport is primary */}
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
