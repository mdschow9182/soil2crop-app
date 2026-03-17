import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  IndianRupee,
  Calendar,
  Info,
  Volume2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getMarketTrends } from "@/api";
import { useLanguage } from "@/context/LanguageContext";
import { speakMessage } from "@/utils/voiceAssistant";
import { getVoiceMessage } from "@/utils/voiceMessages";

interface PricePoint {
  day: string;
  date: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
}

interface MarketTrendData {
  crop: string;
  location: string;
  currentPrice: number;
  currency: string;
  unit: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercent: string;
  recommendation: string;
  prices: PricePoint[];
  lastUpdated: string;
}

const MarketTrends = () => {
  const { language, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<string>("rice");
  const [trendData, setTrendData] = useState<MarketTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const crops = [
    "Rice", "Wheat", "Maize", "Cotton", "Groundnut", 
    "Soybean", "Sugarcane", "Mustard"
  ];

  useEffect(() => {
    fetchMarketTrends(selectedCrop);
  }, [selectedCrop]);

  const fetchMarketTrends = async (crop: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMarketTrends(crop);
      setTrendData(response.data);
      
      // Voice announcement if enabled
      if (voiceEnabled) {
        announceTrend(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch market trends');
    } finally {
      setLoading(false);
    }
  };

  const announceTrend = (data: MarketTrendData) => {
    const trendMessage = data.trend === 'increasing' 
      ? `Market prices for ${data.crop} are increasing by ${data.trendPercent} percent`
      : data.trend === 'decreasing'
      ? `Market prices for ${data.crop} are decreasing by ${data.trendPercent} percent`
      : `Market prices for ${data.crop} are stable`;
    
    const message = `${trendMessage}. Current price is ${data.currentPrice} rupees per quintal. ${data.recommendation}`;
    
    speakMessage(message, language, undefined, (err) => {
      console.error('Voice announcement error:', err);
    });
  };

  const toggleVoice = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    
    if (newValue && trendData) {
      announceTrend(trendData);
    }
  };

  const getTrendIcon = () => {
    if (!trendData) return null;
    
    switch (trendData.trend) {
      case 'increasing':
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-6 w-6 text-red-600" />;
      default:
        return <Minus className="h-6 w-6 text-gray-600" />;
    }
  };

  const getTrendBadge = () => {
    if (!trendData) return null;
    
    const variants = {
      increasing: 'bg-green-100 text-green-800',
      decreasing: 'bg-red-100 text-red-800',
      stable: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[trendData.trend]}>
        {trendData.trend === 'increasing' && '↑'}
        {trendData.trend === 'decreasing' && '↓'}
        {trendData.trend === 'stable' && '→'}
        {' '}{trendData.trend.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading market data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !trendData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Failed to load market trends'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Price Trends
            </CardTitle>
            <CardDescription>
              30-day price history and trend analysis
            </CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVoice}
            className={voiceEnabled ? 'bg-blue-50 border-blue-300' : ''}
          >
            <Volume2 className={`h-4 w-4 mr-2 ${voiceEnabled ? 'text-blue-600' : ''}`} />
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="crop-select">Crop:</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop} value={crop.toLowerCase()}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">₹{trendData.currentPrice}</span>
              <span className="text-sm text-muted-foreground">/quintal</span>
              {getTrendBadge()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Trend Analysis */}
        <div className="mb-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {getTrendIcon()}
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {trendData.trend === 'increasing' && 'Prices Increasing'}
                {trendData.trend === 'decreasing' && 'Prices Decreasing'}
                {trendData.trend === 'stable' && 'Prices Stable'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {trendData.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Price History (30 Days)
          </h3>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.prices}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`₹${value}`, 'Price']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  name="Average Price"
                  stroke="#3b82f6"
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="minPrice" 
                  name="Min Price"
                  stroke="#ef4444"
                  strokeWidth={1}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="maxPrice" 
                  name="Max Price"
                  stroke="#22c55e"
                  strokeWidth={1}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Highest Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.max(...trendData.prices.map(p => p.price))}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Lowest Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.min(...trendData.prices.map(p => p.price))}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.round(trendData.prices.reduce((sum, p) => sum + p.price, 0) / trendData.prices.length)}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Price Change</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                parseFloat(trendData.trendPercent) > 0 
                  ? 'text-green-600' 
                  : parseFloat(trendData.trendPercent) < 0 
                  ? 'text-red-600' 
                  : 'text-gray-600'
              }`}>
                {parseFloat(trendData.trendPercent) > 0 && '+'}
                {trendData.trendPercent}%
              </div>
              <p className="text-xs text-muted-foreground">30-day change</p>
            </CardContent>
          </Card>
        </div>

        {/* Location Info */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Location: {trendData.location}</span>
            <span>Last updated: {new Date(trendData.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketTrends;
