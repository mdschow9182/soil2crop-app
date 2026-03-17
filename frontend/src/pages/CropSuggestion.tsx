import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sprout, AlertTriangle, CheckCircle, Droplets, DollarSign, TrendingUp, ArrowLeft, Leaf, CloudRain, Info, Calculator, BookOpen, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SoilHealthIndicator from "@/components/SoilHealthIndicator";
import { submitSoilData } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { speakMessage, isSpeechSupported, initializeVoices } from "@/utils/voiceAssistant";
import { getVoiceMessage } from "@/utils/voiceMessages";

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
  soil_health?: {
    score: number;
    status: string;
    color: string;
    description: string;
    recommendations: Array<{
      issue: string;
      action: string;
      priority: string;
    }>;
  };
  natural_farming_mode?: boolean;
}

interface CropProfitEstimate {
  crop: string;
  estimatedYield: { min: number; max: number; unit: string };
  avgPrice: number;
  estimatedIncome: { min: number; max: number; currency: string };
}

const CropSuggestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [naturalFarmingMode, setNaturalFarmingMode] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [hasSpokenRecommendations, setHasSpokenRecommendations] = useState(false);
  const speechSupported = isSpeechSupported();
  
  // Initialize voices on component mount
  useEffect(() => {
    if (speechSupported) {
      initializeVoices();
      console.log('[CropSuggestion] Voice initialization complete');
    }
  }, [speechSupported]);
  
  // Extract soil values from location state
  const { soilType, ph, nitrogen, phosphorus, potassium } = location.state || {};
  
  // Sample crop yield data (quintals per acre)
  const cropYieldData: Record<string, { min: number; max: number }> = {
    "Rice": { min: 18, max: 25 },
    "Wheat": { min: 15, max: 22 },
    "Maize": { min: 18, max: 22 },
    "Groundnut": { min: 10, max: 14 },
    "Cotton": { min: 12, max: 18 },
    "Millets": { min: 8, max: 12 },
    "Pulses": { min: 6, max: 10 },
    "Sugarcane": { min: 80, max: 120 }
  };
  
  // Sample market prices (₹ per quintal)
  const marketPrices: Record<string, number> = {
    "Rice": 2200,
    "Wheat": 2300,
    "Maize": 2000,
    "Groundnut": 5400,
    "Cotton": 7250,
    "Millets": 3500,
    "Pulses": 4000,
    "Sugarcane": 320
  };

  useEffect(() => {
    const analyzeSoil = async () => {
      const { soilType, ph, nitrogen, phosphorus, potassium } = location.state || {};
      const farmerId = localStorage.getItem("farmer_id");
      const farmerLocation = localStorage.getItem("farmer_location") || "Guntur";

      if (!farmerId || !soilType) {
        setError("Missing soil data. Please go back and enter soil information.");
        setLoading(false);
        return;
      }

      // Fetch weather data for location
      try {
        const weatherResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/weather?location=${encodeURIComponent(farmerLocation)}`);
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          setWeatherData(weatherData);
        }
      } catch (err) {
        console.warn("Failed to fetch weather data:", err);
        // Continue without weather data
      }

      try {
        const payload = {
          farmer_id: farmerId,
          soilType,
          pH: parseFloat(ph) || 7.0,
          nitrogen: parseFloat(nitrogen) || undefined,
          phosphorus: parseFloat(phosphorus) || undefined,
          potassium: parseFloat(potassium) || undefined,
          natural_farming: naturalFarmingMode,
        };
        
        console.log('[CropSuggestion] Sending payload:', payload);
        
        const response = await submitSoilData(payload);

        if (response.success && response.data) {
          setData(response.data);
          
          // Speak crop recommendations once data is loaded
          if (speechSupported && !hasSpokenRecommendations && response.data?.crop_comparison?.length > 0) {
            const topCrops = response.data.crop_comparison.slice(0, 3).map(c => c.crop).join(', ');
            const adviceMsg = getVoiceMessage(language, 'cropAdvice');
            const message = `${adviceMsg} ${topCrops}`;
            speakMessage(message, language, undefined, (err) => {
              console.error('Voice error:', err);
              setHasSpokenRecommendations(true);
            });
          }
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
  }, [location.state, naturalFarmingMode]);

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

  const calculateProfitEstimate = (cropName: string): CropProfitEstimate | null => {
    const yieldData = cropYieldData[cropName];
    const price = marketPrices[cropName];
    
    if (!yieldData || !price) return null;
    
    return {
      crop: cropName,
      estimatedYield: {
        min: yieldData.min,
        max: yieldData.max,
        unit: 'quintals/acre'
      },
      avgPrice: price,
      estimatedIncome: {
        min: yieldData.min * price,
        max: yieldData.max * price,
        currency: '₹'
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Sprout className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground">{t.analyzingSoil || "Analyzing soil data..."}</p>
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
            {t.backToSoilReport || "Back to Soil Report"}
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
          <h1 className="text-2xl font-heading font-bold">{t.cropSuitabilityTitle || "Crop Suitability Comparison"}</h1>
          <p className="text-sm text-muted-foreground">{t.cropSuitabilitySubtitle || "Based on your soil analysis"}</p>
        </div>

        {/* Natural Farming Mode Badge */}
        {naturalFarmingMode && (
          <Card className="bg-green-50 border-green-300">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Leaf className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">🌱 Natural Farming Recommendations Active</h3>
                  <p className="text-sm text-green-700">Prioritizing millets, pulses, and low-chemical crops for sustainable agriculture</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Soil Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{data.soil_summary}</p>
          </CardContent>
        </Card>

        {/* Natural Farming Toggle & Weather */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Leaf className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-sm">{t.naturalFarmingMode || "Natural Farming Mode"}</h3>
                  <p className="text-xs text-muted-foreground">{t.naturalFarmingDesc || "Align with AP's 2030 natural farming goal"}</p>
                </div>
              </div>
              <Switch
                checked={naturalFarmingMode}
                onCheckedChange={setNaturalFarmingMode}
                aria-label="Toggle natural farming mode"
              />
            </div>
            
            {weatherData && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <CloudRain className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">{t.weatherInsights || "Weather Insights"}</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {weatherData.rainfall ? `${t.expectedRainfall || "Expected rainfall"}: ${weatherData.rainfall}mm` : t.noSignificantRainfall || 'No significant rainfall expected'}
                    {weatherData.irrigation_advice && ` - ${weatherData.irrigation_advice}`}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Natural Farming Tips */}
        {naturalFarmingMode && data.natural_farming_mode && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Leaf className="w-5 h-5" />
                🌱 Natural Farming Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Use Jeevamrutham for soil enrichment (traditional microbial culture)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Apply mulching to retain soil moisture and suppress weeds
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Use crop rotation with pulses to fix nitrogen naturally
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Avoid chemical fertilizers - use cow dung, urine-based preparations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Practice diverse cropping systems for better resilience
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            {data.disclaimer || (t.advisoryDisclaimer || "This is an advisory comparison only. Final crop decision remains with the farmer.")}
          </AlertDescription>
        </Alert>

        {/* Soil Health Score */}
        {data.soil_health && (
          <SoilHealthIndicator
            ph={parseFloat(ph)}
            nitrogen={parseFloat(nitrogen)}
            phosphorus={parseFloat(phosphorus)}
            potassium={parseFloat(potassium)}
            soilType={soilType}
            showRecommendations={true}
          />
        )}

        {/* Tabbed Interface for Crops */}
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">🌾 {t.recommendations || "Recommendations"}</TabsTrigger>
            <TabsTrigger value="explanations">💡 {t.explanations || "Why These Crops"}</TabsTrigger>
            <TabsTrigger value="profits">💰 {t.profits || "Profit Estimate"}</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t.suitableCrops || "Suitable Crops for Your Soil"}</h2>
              {speechSupported && data.crop_comparison && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const cropNames = data.crop_comparison.map(c => c.crop).join(', ');
                    const message = `Based on your soil analysis, the recommended crops are ${cropNames}`;
                    speakMessage(message, language, undefined, (err) => {
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
            
            {data.crop_comparison?.map((crop, index) => (
              <Card key={crop.crop} className={index === 0 ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {index === 0 && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {crop.crop}
                    </CardTitle>
                    <Badge className={getMatchColor(crop.soil_match)}>
                      {crop.soil_match} {t.matchScore || "Match"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t.matchScore || "Match Score"}:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${crop.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.round(crop.confidence * 100)}%</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded">
                      <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs text-muted-foreground">{t.rainDependency || "Water"}</p>
                      <p className={`text-sm font-medium ${getRiskColor(crop.rain_dependency)}`}>
                        {crop.rain_dependency}
                      </p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <DollarSign className="w-4 h-4 mx-auto mb-1 text-green-500" />
                      <p className="text-xs text-muted-foreground">{t.inputCost || "Cost"}</p>
                      <p className="text-sm font-medium">{crop.input_cost}</p>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                      <p className="text-xs text-muted-foreground">{t.marketRisk || "Risk"}</p>
                      <p className={`text-sm font-medium ${getRiskColor(crop.market_risk)}`}>
                        {crop.market_risk}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="explanations" className="space-y-4 mt-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Why These Crops Are Recommended
            </h2>
            {data.crop_comparison?.map((crop, index) => (
              <Card key={crop.crop}>
                <CardHeader>
                  <CardTitle className="text-lg">{crop.crop}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary">Main Reason:</h4>
                    <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200">
                      {crop.reasoning}
                    </p>
                    
                    <h4 className="font-semibold text-sm text-primary">Why This Crop Fits Your Soil:</h4>
                    <ul className="space-y-2">
                      {crop.risks && crop.risks.length > 0 ? (
                        crop.risks.map((risk, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Excellent match for your soil conditions!</span>
                        </li>
                      )}
                    </ul>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <strong>Confidence Level:</strong> {Math.round(crop.confidence * 100)}% based on soil pH, type, and nutrient levels
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profits" className="space-y-4 mt-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-600" />
              Estimated Profit Analysis
            </h2>
            {data.crop_comparison?.map((crop) => {
              const profitEstimate = calculateProfitEstimate(crop.crop);
              if (!profitEstimate) return null;
              
              return (
                <Card key={crop.crop}>
                  <CardHeader>
                    <CardTitle className="text-lg">{crop.crop}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-semibold text-green-800">{t.estimatedYield || "Estimated Yield"}</span>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                          {profitEstimate.estimatedYield.min}-{profitEstimate.estimatedYield.max}
                        </p>
                        <p className="text-xs text-green-600">{profitEstimate.estimatedYield.unit}</p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-semibold text-blue-800">{t.marketPrice || "Market Price"}</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">
                          ₹{profitEstimate.avgPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600">per quintal</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-300">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-bold text-green-800">{t.estimatedIncome || "Estimated Income per Acre"}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{profitEstimate.estimatedIncome.min.toLocaleString()} - ₹{profitEstimate.estimatedIncome.max.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.basedOnAverage || "Based on average yield and current market prices"}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      {t.noteActualYields || "Note: Actual yields and prices may vary based on farming practices, weather conditions, and market fluctuations."}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

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
