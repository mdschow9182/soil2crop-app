import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Play, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp,
  Upload,
  Sprout,
  TrendingUp,
  FileText,
  Bell,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface TutorialStep {
  title: string;
  description: string;
  icon?: any;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  color: string;
  steps: TutorialStep[];
  videoUrl?: string;
  duration: string;
}

const Tutorials = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [speakingTutorial, setSpeakingTutorial] = useState<string | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useState(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  });

  // Tutorial data with multi-language support
  const tutorials: Tutorial[] = [
    {
      id: "upload-soil-report",
      title: t.tutorialUploadTitle || "How to Upload Soil Report",
      description: t.tutorialUploadDesc || "Learn how to upload your soil report PDF or image",
      category: "Getting Started",
      icon: Upload,
      color: "bg-blue-500",
      duration: "3 min",
      steps: [
        {
          title: "Navigate to Soil Report",
          description: "From the bottom navigation bar, tap on the 'Soil Report' icon (flask symbol). This will take you to the soil report upload page.",
          icon: Upload
        },
        {
          title: "Choose Upload Method",
          description: "You'll see two options: 'Upload Report' or 'Manual Entry'. Tap on 'Upload Report' to upload your soil report file.",
          icon: FileText
        },
        {
          title: "Select Your File",
          description: "Click on the upload area. You can select PDF, JPG, JPEG, or PNG files. Maximum file size is 10MB.",
          icon: Upload
        },
        {
          title: "Wait for Processing",
          description: "The system will automatically extract soil parameters from your report. This may take a few seconds.",
          icon: CheckCircle
        },
        {
          title: "Review Extracted Values",
          description: "Check the extracted values (pH, Nitrogen, Phosphorus, Potassium). You can modify any incorrect values manually.",
          icon: CheckCircle
        },
        {
          title: "Click Analyze",
          description: "Once all values are correct, click the 'Analyze' button. The system will generate personalized crop recommendations based on your soil data.",
          icon: ArrowRight
        }
      ],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with actual tutorial video
    },
    {
      id: "view-crop-recommendations",
      title: t.tutorialCropsTitle || "Viewing Crop Recommendations",
      description: t.tutorialCropsDesc || "Understand how to read and use crop recommendations",
      category: "Core Features",
      icon: Sprout,
      color: "bg-green-500",
      duration: "4 min",
      steps: [
        {
          title: "Access Recommendations",
          description: "After analyzing your soil report, you'll automatically be taken to the Crop Suggestions page. You can also access it from the bottom navigation.",
          icon: Sprout
        },
        {
          title: "Review Top Recommendations",
          description: "The first crop shown is the most suitable for your soil. Each crop shows a match percentage (Excellent, Good, Moderate, etc.).",
          icon: CheckCircle
        },
        {
          title: "Compare Different Crops",
          description: "Use the tabs to view different perspectives: 'Recommendations' shows all suitable crops, 'Why These Crops' explains the reasoning, 'Profit Estimate' shows potential income.",
          icon: TrendingUp
        },
        {
          title: "Check Natural Farming Mode",
          description: "Toggle the 'Natural Farming Mode' switch to see crops that align with zero-budget natural farming principles. This prioritizes millets, pulses, and groundnut.",
          icon: Sprout
        },
        {
          title: "View Weather Insights",
          description: "Check the weather section for rainfall forecasts and irrigation advice specific to your location.",
          icon: CheckCircle
        },
        {
          title: "Make Your Decision",
          description: "Consider all factors: soil suitability, market prices, water requirements, and your preferences before finalizing which crop to plant.",
          icon: CheckCircle
        }
      ]
    },
    {
      id: "check-market-prices",
      title: t.tutorialMarketTitle || "Checking Market Prices",
      description: t.tutorialMarketDesc || "Find the best prices for your crops in nearby markets",
      category: "Market Intelligence",
      icon: TrendingUp,
      color: "bg-purple-500",
      duration: "3 min",
      steps: [
        {
          title: "Open Market Prices",
          description: "Tap on the 'Market Prices' icon in the bottom navigation bar (graph/chart symbol). This opens the market dashboard.",
          icon: TrendingUp
        },
        {
          title: "Select Your Crop",
          description: "Use the crop selector dropdown to choose the crop you want to check prices for (e.g., Rice, Maize, Cotton).",
          icon: CheckCircle
        },
        {
          title: "View Price Trends",
          description: "See current prices in different mandis (markets). Prices are shown per quintal. Compare prices across different locations.",
          icon: TrendingUp
        },
        {
          title: "Check Historical Data",
          description: "Some markets show price trends over time. Look for upward or downward trends to decide the best time to sell.",
          icon: TrendingUp
        },
        {
          title: "Find Nearest Market",
          description: "Look for markets closest to your location to minimize transportation costs. The app shows distance from your location.",
          icon: CheckCircle
        },
        {
          title: "Plan Your Sale",
          description: "Based on prices and trends, decide which market offers the best price and plan when to take your produce there.",
          icon: CheckCircle
        }
      ]
    },
    {
      id: "view-government-schemes",
      title: t.tutorialSchemesTitle || "Viewing Government Schemes",
      description: t.tutorialSchemesDesc || "Discover and apply for government schemes and subsidies",
      category: "Government Support",
      icon: FileText,
      color: "bg-orange-500",
      duration: "4 min",
      steps: [
        {
          title: "Access Government Schemes",
          description: "Tap on the 'Govt. Schemes' icon in the bottom navigation (document/building symbol). This opens the schemes dashboard.",
          icon: FileText
        },
        {
          title: "Browse Available Schemes",
          description: "You'll see a list of central and state government schemes. Each scheme shows benefits, eligibility, and subsidy amounts.",
          icon: CheckCircle
        },
        {
          title: "Filter by Category",
          description: "Use filters to find schemes for: Income Support (PM-KISAN), Insurance (PMFBY), Irrigation (PMKSY), or Soil Health.",
          icon: FileText
        },
        {
          title: "Check Eligibility",
          description: "Tap on any scheme to see detailed eligibility criteria: land size, crop type, farmer category, location requirements.",
          icon: CheckCircle
        },
        {
          title: "Note Application Process",
          description: "Each scheme shows how to apply: online portal, offline office, required documents, and application deadlines.",
          icon: CheckCircle
        },
        {
          title: "Apply for Scheme",
          description: "Follow the application instructions. Some schemes allow direct online application, others require visiting agriculture office.",
          icon: ArrowRight
        }
      ]
    },
    {
      id: "read-alerts",
      title: t.tutorialAlertsTitle || "Reading Alerts & Notifications",
      description: t.tutorialAlertsDesc || "Stay updated with important farming alerts and weather warnings",
      category: "Notifications",
      icon: Bell,
      color: "bg-red-500",
      duration: "2 min",
      steps: [
        {
          title: "Open Alerts Page",
          description: "Tap on the 'Alerts' icon in the bottom navigation (bell symbol). Red badge shows number of unread alerts.",
          icon: Bell
        },
        {
          title: "Review Alert Types",
          description: "Alerts are color-coded: Red (Critical - drought/flood), Orange (Warning - pest/disease), Yellow (Advisory - weather), Green (Info - schemes).",
          icon: Bell
        },
        {
          title: "Read Alert Details",
          description: "Tap on any alert to read full details including affected areas, recommended actions, and contact information for help.",
          icon: CheckCircle
        },
        {
          title: "Mark as Read",
          description: "After reading an alert, tap on it to mark as read. Read alerts appear in lighter color and move to bottom of list.",
          icon: CheckCircle
        },
        {
          title: "Take Action",
          description: "Follow the recommended actions in critical alerts. For weather alerts, adjust irrigation. For pest alerts, inspect crops.",
          icon: ArrowRight
        },
        {
          title: "Clear Old Alerts",
          description: "Use 'Mark All as Read' button to clear all notifications at once. Old alerts are kept for reference but don't show badge.",
          icon: CheckCircle
        }
      ]
    }
  ];

  // Text-to-speech function
  const speakTutorial = (tutorial: Tutorial) => {
    if (!speechSynthesis) {
      toast({
        title: "Voice Not Available",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    if (speakingTutorial === tutorial.id) {
      // Stop speaking
      speechSynthesis.cancel();
      setSpeakingTutorial(null);
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    // Create speech text
    let speechText = `${tutorial.title}. `;
    tutorial.steps.forEach((step, index) => {
      speechText += `Step ${index + 1}: ${step.title}. ${step.description}. `;
    });

    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Set language based on selected language
    const langMap: Record<string, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      ml: 'ml-IN'
    };
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingTutorial(null);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setSpeakingTutorial(null);
    };

    setSpeakingTutorial(tutorial.id);
    speechSynthesis.speak(utterance);

    toast({
      title: "Voice Narration Started",
      description: "Listening to tutorial...",
    });
  };

  const toggleTutorial = (id: string) => {
    setExpandedTutorial(expandedTutorial === id ? null : id);
    // Stop any playing video when collapsing
    if (expandedTutorial === id) {
      setPlayingVideo(null);
    }
    // Stop speech when collapsing
    if (speakingTutorial && expandedTutorial === id) {
      speechSynthesis?.cancel();
      setSpeakingTutorial(null);
    }
  };

  const handleVideoPlay = (tutorialId: string) => {
    setPlayingVideo(playingVideo === tutorialId ? null : tutorialId);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-primary" />
            <div>
              <h1 className="text-xl font-heading font-bold">
                {t.tutorialsTitle || "Farmer Tutorials"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t.tutorialsSubtitle || "Step-by-step guides to use Soil2Crop"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Tutorial Cards */}
        {tutorials.map((tutorial) => {
          const Icon = tutorial.icon;
          const isExpanded = expandedTutorial === tutorial.id;
          const isSpeaking = speakingTutorial === tutorial.id;
          const isPlaying = playingVideo === tutorial.id;

          return (
            <Card key={tutorial.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
              {/* Card Header - Always Visible */}
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleTutorial(tutorial.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-xl ${tutorial.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{tutorial.title}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {tutorial.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ⏱️ {tutorial.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="space-y-4 animate-in slide-in-from-top-2">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{tutorial.description}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {tutorial.videoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVideoPlay(tutorial.id);
                        }}
                        className="flex-1"
                      >
                        {isPlaying ? (
                          <>
                            <VolumeX className="w-4 h-4 mr-2" />
                            Hide Video
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Watch Video
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakTutorial(tutorial);
                      }}
                      className="flex-1"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4 mr-2" />
                          Stop Voice
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Listen
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Video Player */}
                  {isPlaying && tutorial.videoUrl && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={tutorial.videoUrl}
                        title={tutorial.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Step-by-Step Guide */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Step-by-Step Guide
                    </h3>
                    
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {tutorial.steps.map((step, index) => {
                          const StepIcon = step.icon || CheckCircle;
                          return (
                            <div
                              key={index}
                              className="flex gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <div className={`w-8 h-8 rounded-full ${tutorial.color} flex items-center justify-center shrink-0`}>
                                <span className="text-white font-bold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <StepIcon className="w-4 h-4 text-primary" />
                                  <h4 className="font-semibold text-sm">{step.title}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Completion Badge */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                      After completing these steps, you'll successfully master this feature!
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* No More Tutorials Message */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-2">
          <CardContent className="py-6 text-center space-y-2">
            <BookOpen className="w-12 h-12 mx-auto text-primary opacity-50" />
            <h3 className="font-semibold text-lg">More Tutorials Coming Soon!</h3>
            <p className="text-sm text-muted-foreground">
              We're constantly adding new tutorials to help you get the most out of Soil2Crop.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Tutorials;
