import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, FileText, ExternalLink, Award, TrendingUp, Users, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSchemeRecommendations } from "@/api";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Scheme {
  name: string;
  benefit: string;
  eligibility: string;
  link: string;
  category: string;
}

const GovernmentDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemeRecommendations();
  }, []);

  const fetchSchemeRecommendations = async () => {
    try {
      // Get stored soil data from localStorage or session
      const soilData = JSON.parse(localStorage.getItem("lastSoilData") || "{}");
      const cropData = JSON.parse(localStorage.getItem("lastCropData") || "{}");
      
      const criteria = {
        soil_type: soilData.soilType || "Loamy",
        crop_selected: cropData.crop_name || "Maize",
        field_size: 1.5, // Default small farmer
        farmer_location: "Guntur" // Could be enhanced with actual location
      };

      console.log("[GovtDashboard] Fetching schemes with criteria:", criteria);
      
      const response = await getSchemeRecommendations(criteria);
      
      if (response.success && response.data) {
        const fetchedSchemes = response.data.recommended_schemes || [];
        setSchemes(fetchedSchemes.length > 0 ? fetchedSchemes : getDefaultSchemes());
      } else {
        throw new Error("Failed to fetch scheme recommendations");
      }
    } catch (err: any) {
      console.error("[GovtDashboard] Error fetching schemes:", err);
      // Use default schemes instead of showing error
      setSchemes(getDefaultSchemes());
      toast({
        title: "Notice",
        description: "Using default government schemes. Live data may be unavailable.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSchemes = (): Scheme[] => {
    return [
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
      case "General Development":
        return <TrendingUp className="w-5 h-5" />;
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
      case "General Development":
        return "bg-purple-100 text-purple-800 border-purple-300";
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
            <Sprout className="w-12 h-12 text-primary animate-pulse mx-auto" />
            <p className="text-muted-foreground">Loading government schemes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Government Schemes
          </h1>
          <p className="text-muted-foreground">
            Discover schemes that can support your farming journey
          </p>
        </div>

        {/* Schemes Count */}
        {schemes.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Recommended for you
                </p>
                <p className="text-2xl font-bold text-primary">
                  {schemes.length} {schemes.length === 1 ? 'Scheme' : 'Schemes'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schemes List */}
        {schemes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Schemes Found</CardTitle>
              <CardDescription>
                Try updating your soil data or crop selection
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schemes.map((scheme, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${getCategoryColor(scheme.category)}`}>
                      {getCategoryIcon(scheme.category)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(scheme.category)}`}>
                      {scheme.category}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{scheme.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.benefits || "Benefits"}:</p>
                    <p className="text-sm text-muted-foreground">{scheme.benefit}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.eligibility || "Eligibility"}:</p>
                    <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(scheme.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t.visitWebsite || "Visit Website"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Apply?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Click on "Visit Official Website" for any scheme</li>
              <li>Review the eligibility criteria carefully</li>
              <li>Prepare required documents (Aadhaar, Land Records, Bank Details)</li>
              <li>Complete the online application process</li>
              <li>Note down your application reference number</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GovernmentDashboard;
