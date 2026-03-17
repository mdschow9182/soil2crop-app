import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  MapPin, 
  IndianRupee, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Award,
  FileText,
  ExternalLink,
  Sprout,
  Users,
  Droplets,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMarketPrice, getAllMarketPrices, getSchemeRecommendations } from "@/api";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import MarketTrends from "./MarketTrends";
import { speakMessage, isSpeechSupported, initializeVoices } from "@/utils/voiceAssistant";

interface MarketPrice {
  crop: string;
  location: string;
  min_price: number;
  max_price: number;
  avg_price: number;
  currency: string;
  unit: string;
  market_trend: 'rising' | 'falling' | 'stable';
  last_updated?: string;
}

interface Scheme {
  name: string;
  benefit: string;
  eligibility: string;
  link: string;
  category: string;
}

const MarketDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("guntur");
  const [priceData, setPriceData] = useState<MarketPrice | null>(null);
  const [allPrices, setAllPrices] = useState<MarketPrice[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSpokenPrices, setHasSpokenPrices] = useState(false);
  const speechSupported = isSpeechSupported();

  // Initialize voices on mount
  useEffect(() => {
    if (speechSupported) {
      initializeVoices();
    }
  }, [speechSupported]);

  // Default government schemes as fallback
  const defaultSchemes: Scheme[] = [
    {
      name: "PM-Kisan Samman Nidhi",
      benefit: "Income support of ₹6,000 per year in 3 equal installments",
      eligibility: "All farmer families who own cultivable land",
      link: "https://pmkisan.gov.in/",
      category: "Income Support"
    },
    {
      name: "Pradhan Mantri Fasal Bima Yojana",
      benefit: "Comprehensive crop insurance coverage against crop loss",
      eligibility: "All farmers including sharecroppers and tenant farmers",
      link: "https://pmfby.gov.in/",
      category: "Insurance"
    },
    {
      name: "Soil Health Card Scheme",
      benefit: "Free soil testing and nutrient recommendations",
      eligibility: "All farmers across India",
      link: "https://soilhealth.dac.gov.in/",
      category: "Soil Management"
    },
    {
      name: "Paramparagat Krishi Vikas Yojana",
      benefit: "Support for organic farming practices",
      eligibility: "Groups of farmers forming clusters",
      link: "#",
      category: "Organic Farming"
    },
    {
      name: "Pradhan Mantri Krishi Sinchai Yojana",
      benefit: "Irrigation facilities and water conservation",
      eligibility: "All farmers",
      link: "#",
      category: "Irrigation"
    }
  ];

  const crops = [
    "Maize", "Paddy", "Wheat", "Cotton", "Groundnut", 
    "Sugarcane", "Soybean", "Mustard"
  ];

  const locations = [
    { code: "guntur", name: "Guntur" },
    { code: "mumbai", name: "Mumbai" },
    { code: "delhi", name: "Delhi" },
    { code: "chennai", name: "Chennai" }
  ];

  useEffect(() => {
    fetchAllPrices();
    fetchSchemes();
  }, []);

  const fetchAllPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllMarketPrices(selectedLocation);
      
      if (response.success && response.data) {
        const prices = response.data.prices || [];
        setAllPrices(prices.length > 0 ? prices : getDefaultPrices());
        
        // Speak when prices are loaded
        if (speechSupported && !hasSpokenPrices && prices.length > 0) {
          const priceMsg = language === 'te'
            ? `ప్రస్తుత మార్కెట్ ధరలు ${prices.length} పంటలకు అందుబాటులో ఉన్నాయి.`
            : language === 'hi'
            ? `${prices.length} फसलों के लिए वर्तमान बाजार मूल्य उपलब्ध हैं।`
            : `Current market prices for ${prices.length} crops are now displayed.`;
          
          speakMessage(priceMsg, language, undefined, (err) => {
            console.error('Voice error:', err);
            setHasSpokenPrices(true);
          });
        }
      } else {
        throw new Error("Failed to fetch market prices");
      }
    } catch (err: any) {
      console.error("[MarketDashboard] Error fetching prices:", err);
      // Use default fallback data instead of showing error
      setAllPrices(getDefaultPrices());
      toast({
        title: "Notice",
        description: "Using default market prices. Live data may be unavailable.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPrices = (): MarketPrice[] => {
    return [
      { crop: "Rice", location: "Guntur", min_price: 2100, max_price: 2300, avg_price: 2200, currency: "INR", unit: "quintal", market_trend: "stable" },
      { crop: "Maize", location: "Guntur", min_price: 1800, max_price: 2000, avg_price: 1900, currency: "INR", unit: "quintal", market_trend: "rising" },
      { crop: "Cotton", location: "Guntur", min_price: 7000, max_price: 7500, avg_price: 7250, currency: "INR", unit: "quintal", market_trend: "falling" },
      { crop: "Groundnut", location: "Guntur", min_price: 5200, max_price: 5600, avg_price: 5400, currency: "INR", unit: "quintal", market_trend: "stable" }
    ];
  };

  const fetchSchemes = async () => {
    try {
      // Get stored soil data from localStorage or session
      const soilData = JSON.parse(localStorage.getItem("lastSoilData") || "{}");
      const cropData = JSON.parse(localStorage.getItem("lastCropData") || "{}");
      
      const criteria = {
        soil_type: soilData.soilType || "Loamy",
        crop_selected: cropData.crop_name || "Maize",
        field_size: 1.5,
        farmer_location: "Guntur"
      };

      console.log("[MarketDashboard] Fetching schemes with criteria:", criteria);
      
      const response = await getSchemeRecommendations(criteria);
      
      if (response.success && response.data) {
        const fetchedSchemes = response.data.recommended_schemes || [];
        // Use fetched schemes if available, otherwise use default schemes
        setSchemes(fetchedSchemes.length > 0 ? fetchedSchemes : defaultSchemes);
      } else {
        // Fallback to default schemes
        setSchemes(defaultSchemes);
      }
    } catch (err: any) {
      console.error("[MarketDashboard] Error fetching schemes:", err);
      // Fallback to default schemes on error
      setSchemes(defaultSchemes);
      toast({
        title: "Notice",
        description: "Using default government schemes. API may be unavailable.",
        variant: "default",
      });
    }
  };

  const handleCropSelect = async (crop: string) => {
    // Clear selection if "all" is selected
    if (crop === "all") {
      setSelectedCrop("");
      setPriceData(null);
      return;
    }
    
    setSelectedCrop(crop);
    try {
      const response = await getMarketPrice(crop, selectedLocation);
      
      if (response.success && response.data) {
        setPriceData(response.data);
      } else {
        // Use fallback data for selected crop
        setPriceData(getDefaultPriceForCrop(crop));
      }
    } catch (err: any) {
      console.error("[MarketDashboard] Error fetching crop price:", err);
      // Use fallback data instead of showing error
      setPriceData(getDefaultPriceForCrop(crop));
      toast({
        title: "Notice",
        description: `Using default price for ${crop}. Live data may be unavailable.`,
        variant: "default",
      });
    }
  };

  const getDefaultPriceForCrop = (cropName: string): MarketPrice => {
    const defaultPrices: Record<string, MarketPrice> = {
      rice: { crop: "Rice", location: "Guntur", min_price: 2100, max_price: 2300, avg_price: 2200, currency: "INR", unit: "quintal", market_trend: "stable" },
      maize: { crop: "Maize", location: "Guntur", min_price: 1800, max_price: 2000, avg_price: 1900, currency: "INR", unit: "quintal", market_trend: "rising" },
      wheat: { crop: "Wheat", location: "Guntur", min_price: 2200, max_price: 2400, avg_price: 2300, currency: "INR", unit: "quintal", market_trend: "stable" },
      cotton: { crop: "Cotton", location: "Guntur", min_price: 7000, max_price: 7500, avg_price: 7250, currency: "INR", unit: "quintal", market_trend: "falling" },
      groundnut: { crop: "Groundnut", location: "Guntur", min_price: 5200, max_price: 5600, avg_price: 5400, currency: "INR", unit: "quintal", market_trend: "stable" }
    };
    return defaultPrices[cropName.toLowerCase()] || { 
      crop: cropName, 
      location: "Guntur", 
      min_price: 2000, 
      max_price: 2500, 
      avg_price: 2250, 
      currency: "INR", 
      unit: "quintal", 
      market_trend: "stable" 
    };
  };

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location);
    fetchAllPrices();
    if (selectedCrop) {
      handleCropSelect(selectedCrop);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <ArrowUpRight className="w-5 h-5 text-green-600" />;
      case 'falling':
        return <ArrowDownRight className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return "text-green-600 bg-green-50";
      case 'falling':
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Income Support":
        return <Award className="w-5 h-5" />;
      case "Insurance":
        return <FileText className="w-5 h-5" />;
      case "Irrigation":
        return <Droplets className="w-5 h-5" />;
      case "Organic Farming":
        return <Sprout className="w-5 h-5" />;
      case "Soil Management":
        return <Users className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Income Support":
        return "bg-green-100 text-green-800 border-green-300";
      case "Insurance":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Irrigation":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      case "Organic Farming":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Soil Management":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <BarChart3 className="w-12 h-12 text-primary animate-pulse mx-auto" />
            <p className="text-muted-foreground">Loading market prices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Market & Schemes
          </h1>
          <p className="text-muted-foreground">
            Real-time mandi prices and government support schemes
          </p>
        </div>

        {/* Section 1: Market Prices */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-heading font-bold text-foreground">{t.marketPricesTitle || "Market Prices"}</h2>
          </div>

          {/* Market Trends Chart */}
          <MarketTrends />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>{t.filterPrices || "Filter Prices"}</CardTitle>
            <CardDescription>Select crop and location to view prices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">{t.selectLocationLabel || "Location"}</Label>
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.code} value={loc.code}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {loc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop">{t.selectCropLabel || "Select Crop"} (Optional)</Label>
                <Select value={selectedCrop || "all"} onValueChange={handleCropSelect}>
                  <SelectTrigger id="crop">
                    <SelectValue placeholder={t.selectCropLabel || "Select crop"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCrops || "All Crops"}</SelectItem>
                    {crops.map((crop) => (
                      <SelectItem key={crop} value={crop.toLowerCase()}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Crop Price Details */}
        {priceData && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {priceData.crop} Price in {priceData.location}
              </CardTitle>
              <CardDescription>Last updated: {new Date(priceData.last_updated).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.minPrice || "Min Price"}</p>
                  <p className="text-xl font-bold">₹{priceData.min_price}</p>
                  <p className="text-xs text-muted-foreground">per quintal</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.avgPrice || "Avg Price"}</p>
                  <p className="text-2xl font-bold text-primary">₹{priceData.avg_price}</p>
                  <p className="text-xs text-muted-foreground">per quintal</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t.maxPrice || "Max Price"}</p>
                  <p className="text-xl font-bold">₹{priceData.max_price}</p>
                  <p className="text-xs text-muted-foreground">per quintal</p>
                </div>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getTrendColor(priceData.market_trend)}`}>
                {getTrendIcon(priceData.market_trend)}
                <span className="text-sm font-medium capitalize">
                  {t.marketTrend || "Market Trend"}: {priceData.market_trend}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Prices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              All Crop Prices - {locations.find(l => l.code === selectedLocation)?.name || 'All India'}
            </CardTitle>
            <CardDescription>Current market rates across all crops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allPrices.length === 0 ? (
                <p className="text-center text-muted-foreground">No price data available</p>
              ) : (
                allPrices.map((price, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleCropSelect(price.crop.toLowerCase())}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{price.crop}</p>
                        <p className="text-xs text-muted-foreground">
                          {price.location !== 'All India' ? price.location : 'Average'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{price.avg_price}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{price.min_price} - ₹{price.max_price}
                        </p>
                      </div>
                      <div className={`p-1.5 rounded-full ${getTrendColor(price.market_trend)}`}>
                        {getTrendIcon(price.market_trend)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Understanding Market Prices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong>Rising:</strong> Prices are increasing - good time to sell
              </p>
            </div>
            <div className="flex items-start gap-2">
              <ArrowDownRight className="w-4 h-4 text-red-600 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong>Falling:</strong> Prices are decreasing - consider waiting
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Minus className="w-4 h-4 text-gray-600 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong>Stable:</strong> Prices are steady - normal market conditions
              </p>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Note: Prices are indicative and may vary by mandi. Always check local market rates before selling.
            </p>
          </CardContent>
        </Card>
        </section>

        {/* Section 2: Government Schemes */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-heading font-bold text-foreground">Government Schemes</h2>
          </div>

          {/* Schemes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((scheme, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getCategoryColor(scheme.category)}`}>
                        {getCategoryIcon(scheme.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{scheme.name}</CardTitle>
                        <div className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full border ${getCategoryColor(scheme.category)}`}>
                          {scheme.category}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Benefits:
                    </h4>
                    <p className="text-sm text-muted-foreground">{scheme.benefit}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Eligibility:
                    </h4>
                    <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                  </div>

                  {scheme.link && scheme.link !== "#" && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => window.open(scheme.link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Official Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {schemes.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No government schemes available at the moment.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default MarketDashboard;
