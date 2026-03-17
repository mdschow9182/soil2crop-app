import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Upload, FlaskConical, ArrowRight, FileText, RotateCcw, AlertCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { useLanguage } from "@/context/LanguageContext";
import { submitSoilData, uploadSoilReport } from "@/api";
import { useToast } from "@/hooks/use-toast";

const SoilReport = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Strict mode: "upload" or "manual" or null
  const [inputMode, setInputMode] = useState<"upload" | "manual" | null>(null);
  
  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Manual input state
  const [ph, setPh] = useState("");
  const [soilType, setSoilType] = useState("Loamy");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file",
        description: "Upload PDF, JPG, or PNG only",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max 10MB",
        variant: "destructive",
      });
      return;
    }

    // Switch to upload mode
    setInputMode("upload");
    setUploadedFile(file);
    await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    const farmerId = localStorage.getItem("farmer_id");
    if (!farmerId) {
      toast({ title: "Error", description: "Not logged in", variant: "destructive" });
      navigate("/");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("soil_report", file);
      formData.append("farmer_id", farmerId);

      const result = await uploadSoilReport(formData);
      
      if (result.success && result.data?.extracted_values) {
        const ext = result.data.extracted_values;
        if (ext.ph) setPh(ext.ph.toString());
        if (ext.soil_type) setSoilType(ext.soil_type);
        if (ext.nitrogen) setNitrogen(ext.nitrogen.toString());
        if (ext.phosphorus) setPhosphorus(ext.phosphorus.toString());
        if (ext.potassium) setPotassium(ext.potassium.toString());
        
        toast({
          title: "Upload successful",
          description: "Values extracted. Review and click Analyze.",
        });
      } else {
        toast({
          title: "Upload successful",
          description: "Enter values manually below.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    const farmerId = localStorage.getItem("farmer_id");
    if (!farmerId) {
      toast({ title: "Error", description: "Not logged in", variant: "destructive" });
      navigate("/");
      return;
    }

    // Validate pH and soil type
    if (!ph.trim() || !soilType.trim()) {
      toast({
        title: "Missing data",
        description: "pH and Soil Type are required",
        variant: "destructive",
      });
      return;
    }

    const phNum = parseFloat(ph);
    if (isNaN(phNum) || phNum < 0 || phNum > 14) {
      toast({
        title: "Invalid pH",
        description: "Must be 0–14",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await submitSoilData({
        farmer_id: farmerId,
        soilType: soilType.trim(),
        pH: phNum,
      });

      if (response.success) {
        navigate("/crop-suggestion", {
          state: {
            ph,
            soilType,
            nitrogen,
            phosphorus,
            potassium,
            apiResponse: response,
          }
        });
      } else {
        toast({
          title: "Analysis failed",
          description: response.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setInputMode(null);
    setUploadedFile(null);
    setPh("");
    setSoilType("Loamy");
    setNitrogen("");
    setPhosphorus("");
    setPotassium("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Sprout className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-xl font-heading font-bold">{t.uploadSoil}</h1>
            <p className="text-xs text-muted-foreground">Choose one input method</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Mode selector (if no mode chosen yet) */}
        {!inputMode && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode("upload")}
              className="rounded-lg border-2 border-dashed p-6 text-center hover:border-primary hover:bg-primary/5 transition"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">Upload Report</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
            </button>
            <button
              onClick={() => setInputMode("manual")}
              className="rounded-lg border-2 border-dashed p-6 text-center hover:border-primary hover:bg-primary/5 transition"
            >
              <FlaskConical className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">Manual Entry</p>
              <p className="text-xs text-muted-foreground">Enter values directly</p>
            </button>
          </div>
        )}

        {/* Upload mode */}
        {inputMode === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Soil Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadedFile ? (
                <div className="rounded-lg bg-secondary p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">{uploadedFile.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setPh("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="rounded-lg border-2 border-dashed p-6 text-center cursor-pointer hover:bg-primary/5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG (max 10MB)</p>
                </label>
              )}
              {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </CardContent>
          </Card>
        )}

        {/* Manual entry mode */}
        {inputMode === "manual" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Enter Soil Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>pH (0–14) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  placeholder="6.5"
                />
              </div>

              <div>
                <Label>Soil Type *</Label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sandy">Sandy</SelectItem>
                    <SelectItem value="Loamy">Loamy</SelectItem>
                    <SelectItem value="Clay">Clay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">N (kg/ha)</Label>
                  <Input
                    type="number"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    placeholder="—"
                  />
                </div>
                <div>
                  <Label className="text-xs">P (kg/ha)</Label>
                  <Input
                    type="number"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    placeholder="—"
                  />
                </div>
                <div>
                  <Label className="text-xs">K (kg/ha)</Label>
                  <Input
                    type="number"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    placeholder="—"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        {inputMode && (
          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              className="flex-1"
              disabled={isUploading || !ph || !soilType}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Analyze
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t.advisory}
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
};

export default SoilReport;
