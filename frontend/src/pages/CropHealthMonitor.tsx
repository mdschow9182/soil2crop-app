import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Sprout, AlertCircle, CheckCircle, Leaf, Droplets, Sun, Loader2, ArrowLeft, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { analyzeCropHealth } from "@/api";
import { useLanguage } from "@/context/LanguageContext";
import { speakMessage, isSpeechSupported } from "@/utils/voiceAssistant";
import { getVoiceMessage } from "@/utils/voiceMessages";

interface HealthAnalysisResult {
  healthStatus: string;
  issue: string;
  recommendation: string;
  confidence?: number;
}

const CropHealthMonitor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<HealthAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechSupported = isSpeechSupported();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file (JPG, PNG)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setAnalysisResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please upload a crop image first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const farmerId = localStorage.getItem("farmer_id");
      if (!farmerId) {
        toast({
          title: "Not logged in",
          description: "Please login to use this feature",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      const formData = new FormData();
      formData.append("crop_image", selectedImage);
      formData.append("farmer_id", farmerId);

      const result = await analyzeCropHealth(formData);

      if (result.success && result.data) {
        setAnalysisResult(result.data);
        
        // Speak analysis results
        if (speechSupported) {
          const healthMsg = result.data.healthStatus === 'Healthy' 
            ? getVoiceMessage(language, 'healthyCrop')
            : getVoiceMessage(language, 'diseaseDetected');
          
          const message = `${getVoiceMessage(language, 'analysisComplete')} ${healthMsg} ${result.data.issue || ''}`;
          speakMessage(message, language);
        }
        
        toast({
          title: "Analysis Complete",
          description: "Crop health analysis completed successfully",
        });
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error: any) {
      console.error("Crop health analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getHealthColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("healthy") || statusLower.includes("good")) return "bg-green-500";
    if (statusLower.includes("moderate") || statusLower.includes("stress")) return "bg-yellow-500";
    if (statusLower.includes("diseased") || statusLower.includes("poor") || statusLower.includes("critical")) return "bg-red-500";
    return "bg-gray-500";
  };

  const getHealthIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("healthy") || statusLower.includes("good")) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (statusLower.includes("moderate") || statusLower.includes("stress")) return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    if (statusLower.includes("diseased") || statusLower.includes("poor") || statusLower.includes("critical")) return <AlertCircle className="w-6 h-6 text-red-600" />;
    return <Leaf className="w-6 h-6 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Sprout className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-xl font-heading font-bold">Crop Health Check</h1>
            <p className="text-xs text-muted-foreground">AI-powered crop health analysis</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Crop Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
                variant="outline"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
                variant="outline"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-primary/20 bg-muted p-4">
                <img
                  src={imagePreview}
                  alt="Selected crop"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReset}
                  className="absolute top-2 right-2"
                >
                  Remove
                </Button>
              </div>
            )}

            {!imagePreview && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Click to upload or take photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG (max 5MB)</p>
              </div>
            )}

            {selectedImage && !analysisResult && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Crop...
                  </>
                ) : (
                  <>
                    <Leaf className="w-5 h-5 mr-2" />
                    Analyze Crop Health
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getHealthIcon(analysisResult.healthStatus)}
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Health Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getHealthColor(analysisResult.healthStatus)}`}></div>
                  <span className="font-semibold">Health Status</span>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {analysisResult.healthStatus}
                </Badge>
              </div>

              {/* Issue Detected */}
              {analysisResult.issue && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-medium">
                    {analysisResult.issue}
                  </AlertDescription>
                </Alert>
              )}

              {/* Recommendation */}
              {analysisResult.recommendation && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                        Suggested Action
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {analysisResult.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              {analysisResult.confidence && (
                <div className="text-xs text-muted-foreground text-center">
                  Analysis confidence: {Math.round(analysisResult.confidence * 100)}%
                </div>
              )}

              {/* Additional Tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                  <Droplets className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">Watering</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Monitor soil moisture</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200">
                  <Sun className="w-5 h-5 text-yellow-600 mb-2" />
                  <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">Sunlight</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Ensure adequate light</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                  <Leaf className="w-5 h-5 text-green-600 mb-2" />
                  <p className="text-xs font-semibold text-green-900 dark:text-green-100">Nutrients</p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">Follow recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">How it works</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Take a clear photo of the affected crop leaf or plant</li>
                  <li>Ensure good lighting and focus on the problem area</li>
                  <li>Our AI analyzes the image for common issues</li>
                  <li>Get instant health status and recommendations</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  Note: This is an advisory tool. For serious issues, consult agricultural experts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CropHealthMonitor;
