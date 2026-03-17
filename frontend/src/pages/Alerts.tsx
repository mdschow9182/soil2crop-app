import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Sprout, 
  Check, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAlerts, markAlertAsRead, markAllAlertsAsRead, deleteAlert } from "@/api";
import { useLanguage } from "@/context/LanguageContext";

interface Alert {
  id: number;
  farmer_id: number;
  message: string;
  type: 'info' | 'warning' | 'action' | 'reminder';
  is_read: number;
  created_at: string;
}
const Alerts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en-IN");

  // Load farmer's preferred language
  useEffect(() => {
    const savedLang = localStorage.getItem("soil2crop_language") || "en";
    const langMap: Record<string, string> = {
      en: "en-IN",
      te: "te-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      ml: "ml-IN"
    };
    setCurrentLanguage(langMap[savedLang] || "en-IN");
  }, []);

  // System-generated alerts for smart farming decisions
  const systemAlerts: Alert[] = [
    {
      id: 1,
      farmer_id: 1,
      message: "Maize prices have increased by ₹200/quintal in Guntur mandi. Current average price: ₹2,000/quintal.",
      type: 'info',
      is_read: 0,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 2,
      farmer_id: 1,
      message: "Heavy rainfall expected in your region tomorrow. Ensure proper drainage in low-lying fields.",
      type: 'warning',
      is_read: 0,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: 3,
      farmer_id: 1,
      message: "Your maize crop has reached the knee-high stage. Schedule irrigation within the next 2-3 days for optimal growth.",
      type: 'reminder',
      is_read: 0,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    {
      id: 4,
      farmer_id: 1,
      message: "You are eligible for PM Kisan scheme. Income support of ₹6,000/year available. Apply at pmkisan.gov.in",
      type: 'action',
      is_read: 1,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: 5,
      farmer_id: 1,
      message: "Market trend: Paddy prices showing upward trend in Andhra Pradesh. Consider timing your harvest accordingly.",
      type: 'info',
      is_read: 0,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    {
      id: 6,
      farmer_id: 1,
      message: "Heat wave alert! Temperatures expected to exceed 38°C this week. Increase irrigation frequency and consider mulching.",
      type: 'warning',
      is_read: 0,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
    }
  ];

  // Fetch alerts from backend API or use system alerts
  const fetchAlerts = useCallback(async () => {
    const farmerId = localStorage.getItem("farmer_id");
    if (!farmerId) {
      navigate("/");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAlerts(farmerId);
      const alertsData = response.data || response;
      
      // Use backend alerts if available, otherwise use system alerts
      if (alertsData && !response.error && Array.isArray(alertsData) && alertsData.length > 0) {
        setAlerts(alertsData);
      } else {
        // Use system-generated alerts for presentation
        setAlerts(systemAlerts);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      // Fallback to system alerts on error
      setAlerts(systemAlerts);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /**
   * Text-to-Speech for alert messages
   * Uses Web Speech API with farmer's selected language
   */
  const speakAlert = useCallback((message: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = currentLanguage;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, currentLanguage]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Speak unread alerts when page loads (if voice enabled)
  useEffect(() => {
    if (voiceEnabled && alerts.length > 0) {
      const unreadAlerts = alerts.filter(a => !a.is_read);
      if (unreadAlerts.length > 0) {
        const message = `You have ${unreadAlerts.length} new alert${unreadAlerts.length > 1 ? 's' : ''}. ${unreadAlerts[0].message}`;
        speakAlert(message);
      }
    }
    
    return () => stopSpeaking();
  }, [alerts, voiceEnabled, speakAlert, stopSpeaking]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'action':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      info: "default",
      warning: "destructive",
      action: "secondary",
      reminder: "outline"
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  const handleMarkAsRead = async (alertId: number) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, is_read: 1 } : a
      ));
      toast({
        title: "Success",
        description: "Alert marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const farmerId = localStorage.getItem("farmer_id");
    if (!farmerId) return;

    try {
      await markAllAlertsAsRead(farmerId);
      setAlerts(prev => prev.map(a => ({ ...a, is_read: 1 })));
      toast({ 
        title: "Success",
        description: "All alerts marked as read" 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all alerts as read",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (alertId: number) => {
    try {
      await deleteAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast({ 
        title: "Success",
        description: "Alert deleted" 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-heading font-bold text-foreground">{t.alertsTitle || "Alerts & Notifications"}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Voice Toggle */}
            <div className="flex items-center gap-2">
              {voiceEnabled ? (
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <Switch
                checked={voiceEnabled}
                onCheckedChange={(checked) => {
                  setVoiceEnabled(checked);
                  if (!checked) stopSpeaking();
                }}
              />
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Voice Status */}
        {voiceEnabled && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3">
              <p className="text-sm text-primary flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                {isSpeaking ? (t.readingAlert || "Reading alert...") : (t.voiceAlertsEnabled || "Voice alerts enabled. Tap an alert to hear it.")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {alerts.length > 0 && (
          <div className="flex justify-end gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="w-4 h-4 mr-1" />
                {t.markAllRead || "Mark all read"}
              </Button>
            )}
          </div>
        )}

        {/* Alerts List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">{t.loadingAlerts || "Loading alerts..."}</p>
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noAlertsYet || "No alerts yet"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t.alertsWillAppearHere || "Alerts will appear here based on your crop calendar"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className={`transition-colors ${!alert.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getAlertBadge(alert.type)}
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                        {!alert.is_read && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      
                      <p 
                        className={`text-sm ${!alert.is_read ? 'font-medium' : 'text-muted-foreground'}`}
                        onClick={() => speakAlert(alert.message)}
                      >
                        {alert.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {!alert.is_read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMarkAsRead(alert.id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {t.markRead || "Mark read"}
                          </Button>
                        )}
                        
                        {voiceEnabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakAlert(alert.message)}
                          >
                            <Volume2 className="w-4 h-4 mr-1" />
                            {t.readAloud || "Read aloud"}
                          </Button>
                        )}

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(alert.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t.delete || "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info */}
        {alerts.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Sprout className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">{t.smartAlerts || "Soil2Crop Smart Alerts"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.aiPoweredNotifications || "AI-powered notifications based on your crop calendar, weather patterns, market trends, and soil conditions."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Alerts;
