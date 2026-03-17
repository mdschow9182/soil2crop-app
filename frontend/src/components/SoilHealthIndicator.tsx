import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Droplets, Sprout, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface SoilHealthIndicatorProps {
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  soilType?: string;
  showRecommendations?: boolean;
}

const SoilHealthIndicator: React.FC<SoilHealthIndicatorProps> = ({
  ph,
  nitrogen,
  phosphorus,
  potassium,
  soilType,
  showRecommendations = true
}) => {
  // Calculate health score (client-side for display)
  const calculateHealthScore = () => {
    const phScore = ph ? (ph >= 6.0 && ph <= 7.5 ? 100 : ph >= 5.5 ? 80 : 60) : 50;
    const nScore = nitrogen ? (nitrogen >= 200 && nitrogen <= 350 ? 100 : nitrogen >= 150 ? 80 : 60) : 50;
    const pScore = phosphorus ? (phosphorus >= 15 && phosphorus <= 30 ? 100 : phosphorus >= 10 ? 80 : 60) : 50;
    const kScore = potassium ? (potassium >= 150 && potassium <= 300 ? 100 : potassium >= 100 ? 80 : 60) : 50;
    
    const totalScore = Math.round((phScore * 0.25) + (nScore * 0.25) + (pScore * 0.25) + (kScore * 0.25));
    return totalScore;
  };

  const healthScore = calculateHealthScore();
  
  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-lime-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 35) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 65) return 'bg-lime-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 35) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Moderate';
    if (score >= 35) return 'Poor';
    return 'Critical';
  };

  const getRecommendations = () => {
    const recs = [];
    
    if (ph && ph < 6.0) {
      recs.push({ issue: 'Low pH', action: 'Apply lime to raise pH', priority: 'high' });
    } else if (ph && ph > 7.5) {
      recs.push({ issue: 'High pH', action: 'Add organic matter to lower pH', priority: 'high' });
    }
    
    if (nitrogen && nitrogen < 150) {
      recs.push({ issue: 'Low Nitrogen', action: 'Apply urea or compost', priority: 'medium' });
    }
    
    if (phosphorus && phosphorus < 10) {
      recs.push({ issue: 'Low Phosphorus', action: 'Apply DAP or bone meal', priority: 'medium' });
    }
    
    if (potassium && potassium < 100) {
      recs.push({ issue: 'Low Potassium', action: 'Apply MOP or wood ash', priority: 'medium' });
    }
    
    return recs;
  };

  const recommendations = showRecommendations ? getRecommendations() : [];

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" />
            Soil Health Score
          </h3>
          <Badge className={getStatusBg(healthScore)} variant="secondary">
            {getStatusText(healthScore)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Health Score Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Health</span>
            <span className={`text-2xl font-bold ${getStatusColor(healthScore)}`}>
              {healthScore}/100
            </span>
          </div>
          <Progress value={healthScore} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {soilType && `Soil Type: ${soilType}`}
          </p>
        </div>

        {/* Nutrient Levels */}
        <div className="grid grid-cols-3 gap-3">
          <NutrientBadge 
            label="N" 
            value={nitrogen} 
            unit="kg/ha"
            optimal={[200, 350]}
            icon={<TrendingUp className="w-3 h-3" />}
          />
          <NutrientBadge 
            label="P" 
            value={phosphorus} 
            unit="kg/ha"
            optimal={[15, 30]}
            icon={<Droplets className="w-3 h-3" />}
          />
          <NutrientBadge 
            label="K" 
            value={potassium} 
            unit="kg/ha"
            optimal={[150, 300]}
            icon={<Sprout className="w-3 h-3" />}
          />
        </div>

        {/* pH Level */}
        {(ph || ph === 0) && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-sm text-muted-foreground">Soil pH</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{ph}</span>
              <Badge variant={ph >= 6.0 && ph <= 7.5 ? "default" : "secondary"}>
                {ph >= 6.0 && ph <= 7.5 ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {ph >= 6.0 && ph <= 7.5 ? 'Optimal' : ph < 6.0 ? 'Acidic' : 'Alkaline'}
              </Badge>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${
                    rec.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                  <span>
                    <strong>{rec.issue}:</strong> {rec.action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for nutrient badges
const NutrientBadge = ({ label, value, unit, optimal, icon }) => {
  const getStatus = () => {
    if (!value) return { color: 'text-gray-500', bg: 'bg-gray-100' };
    const [min, max] = optimal;
    if (value >= min && value <= max) return { color: 'text-green-600', bg: 'bg-green-100' };
    if (value >= min * 0.7 && value < min) return { color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (value > max && value <= max * 1.2) return { color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { color: 'text-red-600', bg: 'bg-red-100' };
  };

  const status = getStatus();

  return (
    <div className={`${status.bg} ${status.color} rounded-lg p-2 text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="font-bold text-sm">{label}</span>
      </div>
      <div className="text-xs font-medium">
        {value ? `${value} ${unit}` : 'N/A'}
      </div>
    </div>
  );
};

export default SoilHealthIndicator;
