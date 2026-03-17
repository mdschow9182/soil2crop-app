import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Sprout, 
  AlertTriangle, 
  CheckCircle, 
  Droplets, 
  DollarSign, 
  TrendingUp, 
  ArrowLeft,
  Calendar,
  Sun,
  Shovel,
  Wheat
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitSoilData } from "@/api";
import { useToast } from "@/hooks/use-toast";

interface CropComparison {
  crop: string;
  soil_match: string;
  rain_dependency: string;
  input_cost: string;
  market_risk: string;
  confidence: number;
  reasoning: string;
  risks: string[];
}

interface AnalysisData {
  soil_summary: string;
  crop_comparison: CropComparison[];
  fertilizer_advice: string[];
  disclaimer: string;
}

interface CropCalendarData {
  sowing: {
    period: string;
    details: string;
    tips: string[];
  };
  fertilizer: {
    period: string;
    details: string;
    tips: string[];
  };
  irrigation: {
    period: string;
    details: string;
    tips: string[];
  };
  harvest: {
    period: string;
    details: string;
    tips: string[];
  };
}

// Crop Calendar Database
const cropCalendars: Record<string, CropCalendarData> = {
  maize: {
    sowing: {
      period: "June-July (Kharif) | February-March (Rabi)",
      details: "Sow seeds at 4-5 cm depth with 60cm row spacing",
      tips: [
        "Treat seeds with fungicide before sowing",
        "Ensure proper soil moisture at sowing time",
        "Use treated seeds for better germination"
      ]
    },
    fertilizer: {
      period: "At sowing + 30-35 days after sowing",
      details: "Apply NPK @ 120:60:40 kg/ha in 3 split doses",
      tips: [
        "Basal dose: Full P, K and 1/3 N at sowing",
        "Top dressing: Remaining N at knee-high stage",
        "Apply Zinc sulphate @ 25 kg/ha if deficient"
      ]
    },
    irrigation: {
      period: "Every 7-10 days depending on rainfall",
      details: "Critical stages: Tasseling and silking",
      tips: [
        "Irrigate at 50% depletion of available soil moisture",
        "Avoid waterlogging during seedling stage",
        "Critical irrigation at flowering stage"
      ]
    },
    harvest: {
      period: "90-120 days after sowing (variety dependent)",
      details: "Harvest when husk turns brown and dry",
      tips: [
        "Grain moisture should be 20-25% at harvest",
        "Dry cobs in sun to reduce moisture to 12-14%",
        "Store grains in clean, dry place"
      ]
    }
  },
  rice: {
    sowing: {
      period: "June-July (Kharif) | January-February (Rabi)",
      details: "Transplant 20-25 day old seedlings at 20x10cm spacing",
      tips: [
        "Soak seeds in water for 24 hours before sowing",
        "Prepare nursery bed 1 month before transplanting",
        "Maintain 2-3 cm water depth after transplanting"
      ]
    },
    fertilizer: {
      period: "Basal + 3 top dressings at 30, 60, 90 days",
      details: "Apply NPK @ 80:40:40 kg/ha + ZnSO4 @ 25 kg/ha",
      tips: [
        "Apply full P, K and Zn as basal dose",
        "Split N application in 3-4 doses",
        "Use leaf color chart for N management"
      ]
    },
    irrigation: {
      period: "Continuous standing water (5cm depth)",
      details: "Drain field 1 week before harvest",
      tips: [
        "Maintain 5cm water level throughout growth",
        "Intermittent irrigation saves water",
        "Drain 7-10 days before harvest for uniform ripening"
      ]
    },
    harvest: {
      period: "120-150 days after transplanting",
      details: "Harvest when 80% grains are straw colored",
      tips: [
        "Cut plants close to ground level",
        "Dry paddy to 12-14% moisture for storage",
        "Thresh immediately after harvesting"
      ]
    }
  },
  cotton: {
    sowing: {
      period: "May-June (before monsoon onset)",
      details: "Sow at 90x60cm spacing with 2-3 seeds per hill",
      tips: [
        "Treat seeds with Imidacloprid before sowing",
        "Go for line sowing for better intercultural operations",
        "Maintain proper plant population"
      ]
    },
    fertilizer: {
      period: "Basal + 2 top dressings at 40 and 70 days",
      details: "Apply NPK @ 120:60:60 kg/ha + Micronutrients",
      tips: [
        "Apply full P and K as basal dose",
        "Split N in 3 equal doses",
        "Foliar spray of micronutrients boosts yield"
      ]
    },
    irrigation: {
      period: "Every 10-12 days (critical at flowering)",
      details: "Avoid irrigation during boll burst stage",
      tips: [
        "First irrigation at 30-35 days after sowing",
        "Critical stages: Flowering and boll formation",
        "Stop irrigation 15 days before last picking"
      ]
    },
    harvest: {
      period: "150-180 days (multiple pickings)",
      details: "Pick open bolls in 3-4 rounds",
      tips: [
        "Start picking when bolls burst open",
        "Pick in morning hours for better quality",
        "Dry cotton in shade, not in direct sun"
      ]
    }
  },
  wheat: {
    sowing: {
      period: "October-November (Timely sowing)",
      details: "Sow at 22.5cm row spacing with seed rate 100kg/ha",
      tips: [
        "Treat seeds with Carbendazim before sowing",
        "Sow in lines for better weed management",
        "Ensure proper seed-bed preparation"
      ]
    },
    fertilizer: {
      period: "Basal + 2 irrigations at crown root initiation and tillering",
      details: "Apply NPK @ 120:60:40 kg/ha",
      tips: [
        "Apply full P and K as basal dose",
        "Split N in 3 doses at sowing, CRI and tillering",
        "Apply Sulphur @ 40kg/ha in deficient soils"
      ]
    },
    irrigation: {
      period: "5-6 irrigations at critical stages",
      details: "Critical stages: CRI, tillering, jointing, flowering, grain filling",
      tips: [
        "First irrigation at CRI (21 days after sowing)",
        "Avoid irrigation at dough stage",
        "Life-saving irrigation if no winter rains"
      ]
    },
    harvest: {
      period: "140-160 days after sowing",
      details: "Harvest when grains are hard and straw is dry",
      tips: [
        "Combine harvest when grain moisture is 12-14%",
        "Dry grains to 10-12% moisture for storage",
        "Clean and grade grains before storage"
      ]
    }
  },
  groundnut: {
    sowing: {
      period: "May-June (Kharif) | January-February (Summer)",
      details: "Sow at 30x10cm spacing with seed rate 100-120kg/ha",
      tips: [
        "Treat seeds with Rhizobium and PSB cultures",
        "Select bold and healthy seeds",
        "Maintain proper plant population"
      ]
    },
    fertilizer: {
      period: "Basal dose at sowing time",
      details: "Apply NPK @ 40:80:80 kg/ha + Gypsum @ 200kg/ha",
      tips: [
        "Apply full dose as basal",
        "Gypsum is essential for pod development",
        "Inoculate with Rhizobium for N fixation"
      ]
    },
    irrigation: {
      period: "Every 10-12 days depending on soil type",
      details: "Critical stages: Flowering and peg penetration",
      tips: [
        "Light and frequent irrigation preferred",
        "Avoid waterlogging",
        "Stop irrigation 15 days before harvest"
      ]
    },
    harvest: {
      period: "100-120 days after sowing",
      details: "Harvest when leaves turn yellow and shed",
      tips: [
        "Pull out entire plant with pods",
        "Strip pods immediately after harvest",
        "Dry pods to 5-6% moisture for storage"
      ]
    }
  }
};

const getCalendarForCrop = (cropName: string): CropCalendarData | null => {
  const cropKey = Object.keys(cropCalendars).find(key => 
    cropName.toLowerCase().includes(key)
  );
  return cropKey ? cropCalendars[cropKey] : null;
};

// Crop Calendar Section Component - Simplified Version
interface CropCalendarSectionProps {
  cropName: string;
}

interface SimpleCropCalendar {
  sowing: string;
  fertilizer: string;
  irrigation: string;
  harvest: string;
}

const simpleCropCalendars: Record<string, SimpleCropCalendar> = {
  maize: {
    sowing: "June – July",
    fertilizer: "20 days after sowing",
    irrigation: "Every 7–10 days",
    harvest: "October – November"
  },
  rice: {
    sowing: "June – July",
    fertilizer: "30, 60, 90 days",
    irrigation: "Continuous standing water",
    harvest: "October – November"
  },
  cotton: {
    sowing: "May – June",
    fertilizer: "40 and 70 days",
    irrigation: "Every 10–12 days",
    harvest: "November – December"
  },
  wheat: {
    sowing: "October – November",
    fertilizer: "At sowing + 2 irrigations",
    irrigation: "5-6 critical stages",
    harvest: "March – April"
  },
  groundnut: {
    sowing: "May – June",
    fertilizer: "At sowing time",
    irrigation: "Every 10–12 days",
    harvest: "September – October"
  }
};

const CropCalendarSection: React.FC<CropCalendarSectionProps> = ({ cropName }) => {
  const calendar = simpleCropCalendars[cropName.toLowerCase()] || null;
  
  if (!calendar) {
    return null; // Don't show calendar if crop not found
  }

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            📅 Crop Calendar - {cropName}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sowing */}
          <div className="rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <Sprout className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-800">🌱 Sowing</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">{calendar.sowing}</p>
          </div>

          {/* Fertilizer */}
          <div className="rounded-xl border bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <Sun className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-amber-800">🌿 Fertilizer</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">{calendar.fertilizer}</p>
          </div>

          {/* Irrigation */}
          <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <Droplets className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-800">💧 Irrigation</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">{calendar.irrigation}</p>
          </div>

          {/* Harvest */}
          <div className="rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-100">
                <Wheat className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-amber-800">🌾 Harvest</h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">{calendar.harvest}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CropSuggestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeSoil = async () => {
      const { soilType, ph } = location.state || {};
      const farmerId = localStorage.getItem("farmer_id");

      if (!farmerId || !soilType) {
        setError("Missing soil data. Please go back and enter soil information.");
        setLoading(false);
        return;
      }

      try {
        const response = await submitSoilData({
          farmer_id: farmerId,
          soilType,
          pH: parseFloat(ph) || 7.0,
        });

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || "Failed to analyze soil data");
        }
      } catch (err: any) {
        console.error("Analysis failed:", err);
        setError(err.message || "Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    analyzeSoil();
  }, [location.state]);

  const getMatchColor = (match: string) => {
    switch (match) {
      case "High": return "bg-green-100 text-green-800 border-green-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === "High") return "text-red-600";
    if (risk === "Medium") return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Sprout className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">Analyzing soil data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/soil-report")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Soil Report
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <Sprout className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Crop Suitability Comparison</h1>
          <p className="text-sm text-muted-foreground">Based on your soil analysis</p>
        </div>

        {/* Soil Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{data.soil_summary}</p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            {data.disclaimer || "This is an advisory comparison only. Final crop decision remains with the farmer."}
          </AlertDescription>
        </Alert>

        {/* Crop Comparisons */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Suitable Crops (Max 3)</h2>
          
          {data.crop_comparison?.map((crop, index) => (
            <Card key={crop.crop} className={index === 0 ? "border-primary/50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {index === 0 && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {crop.crop}
                  </CardTitle>
                  <Badge className={getMatchColor(crop.soil_match)}>
                    {crop.soil_match} Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Confidence */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${crop.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(crop.confidence * 100)}%</span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted rounded">
                    <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                    <p className="text-xs text-muted-foreground">Water</p>
                    <p className={`text-sm font-medium ${getRiskColor(crop.rain_dependency)}`}>
                      {crop.rain_dependency}
                    </p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-green-500" />
                    <p className="text-xs text-muted-foreground">Input Cost</p>
                    <p className="text-sm font-medium">{crop.input_cost}</p>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                    <p className="text-xs text-muted-foreground">Market Risk</p>
                    <p className={`text-sm font-medium ${getRiskColor(crop.market_risk)}`}>
                      {crop.market_risk}
                    </p>
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-sm text-muted-foreground">{crop.reasoning}</p>

                {/* Risks */}
                {crop.risks && crop.risks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Considerations:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {crop.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-amber-500">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fertilizer Advice */}
        {data.fertilizer_advice && data.fertilizer_advice.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fertilizer Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.fertilizer_advice.map((advice, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {advice}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Crop Calendar Section */}
        {data.crop_comparison && data.crop_comparison.length > 0 && (
          <CropCalendarSection cropName={data.crop_comparison[0].crop} />
        )}

        {/* Back Button */}
        <Button onClick={() => navigate("/soil-report")} variant="outline" className="w-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Analyze Another Soil Sample
        </Button>
      </div>
    </div>
  );
};

export default CropSuggestion;
