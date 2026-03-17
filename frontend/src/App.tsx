import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Login from "./pages/Login";
import SoilReport from "./pages/SoilReport";
import CropSuggestion from "./pages/CropSuggestion";
import CropDetails from "./pages/CropDetails";
import CropCalendar from "./pages/CropCalendar";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import Settings from "./pages/Settings";
import Alerts from "./pages/Alerts";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import MarketDashboard from "./pages/MarketDashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import AIFarmerAssistant from "@/components/AIFarmerAssistant";
import Tutorials from "./pages/Tutorials";
import CropMonitoring from "./pages/CropMonitoring";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { HelpButton } from "@/components/HelpButton";
import { FarmerSupportButton } from "@/components/FarmerSupportButton";
import { initializeVoices, isSpeechSupported } from "@/utils/voiceAssistant";


const queryClient = new QueryClient();

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Initialize voices on app mount
  useEffect(() => {
    if (isSpeechSupported()) {
      initializeVoices();
      console.log('[App] Voice initialization complete');
    }
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          
          {/* Online indicator */}
          {isOnline && (
            <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-1 text-center text-xs font-medium z-50">
              🌐 Online
            </div>
          )}
          
          <div className="container max-w-3xl mx-auto px-4 pt-8 pb-3 flex justify-end">
            <LanguageSwitcher />
          </div>
          <BrowserRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true
            }}
          >
            <div className="pb-16">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/soil-report" element={<ProtectedRoute><SoilReport /></ProtectedRoute>} />
                <Route path="/crop-suggestion" element={<ProtectedRoute><CropSuggestion /></ProtectedRoute>} />
                <Route path="/crop-calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
                <Route path="/crop-details" element={<ProtectedRoute><CropDetails /></ProtectedRoute>} />
                <Route path="/crop-monitoring" element={<ProtectedRoute><CropMonitoring /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/government-schemes" element={<ProtectedRoute><GovernmentDashboard /></ProtectedRoute>} />
                <Route path="/market-prices" element={<ProtectedRoute><MarketDashboard /></ProtectedRoute>} />
                <Route path="/tutorials" element={<ProtectedRoute><Tutorials /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
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
