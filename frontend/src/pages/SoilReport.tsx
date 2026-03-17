import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Upload, FlaskConical, ArrowRight, FileText, RotateCcw, Loader2, Volume2 } from "lucide-react";

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
import { speakMessage, isSpeechSupported } from "@/utils/voiceAssistant";
import { getVoiceMessage } from "@/utils/voiceMessages";
import { VoiceDebug } from "@/components/VoiceDebug";

const SoilReport = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechSupported = isSpeechSupported();

  // Strict mode: "upload" or "manual" or null
  const [inputMode, setInputMode] = useState<"upload" | "manual" | null>(null);
  
  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotes, setUploadNotes] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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
      console.log("[SoilReport] Starting file upload:", { fileName: file.name, fileSize: file.size, fileType: file.type, farmerId });
      
      const formData = new FormData();
      formData.append("soil_report", file);
      formData.append("farmer_id", farmerId);

      console.log("[SoilReport] FormData prepared, sending to API");
      const result = await uploadSoilReport(formData);
      
      console.log("[SoilReport] Upload response:", result);
      
      if (!result) {
        throw new Error("Empty response from server");
      }
      
      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      // Always show the input form (prefilled or empty)
      setInputMode("manual");

      // Check if values were extracted (might be empty dict for images)
      const ext = result.data?.extracted_values || {};
      const notes = result.data?.parsing_notes || [];
      const extractedCount = Object.values(ext).filter(v => v !== null && v !== undefined).length;
      
      console.log("[SoilReport] Extracted values:", ext);
      console.log("[SoilReport] Parsing notes:", notes);
      console.log("[SoilReport] Extracted field count:", extractedCount);
      
      setUploadNotes(notes);

      if (extractedCount > 0) {
        // Values were extracted from PDF - prefill the form
        if (ext.ph) setPh(ext.ph.toString());
        if (ext.soil_type) setSoilType(ext.soil_type);
        if (ext.nitrogen) setNitrogen(ext.nitrogen.toString());
        if (ext.phosphorus) setPhosphorus(ext.phosphorus.toString());
        if (ext.potassium) setPotassium(ext.potassium.toString());
        
        const successMsg = getVoiceMessage(language, 'uploadSuccess');
        toast({
          title: "✓ Extraction successful",
          description: `${extractedCount} value(s) extracted. Review and modify as needed.`,
        });
        
        // Speak success message
        if (speechSupported) {
          speakMessage(successMsg, language);
        }
      } else {
        // No values extracted (scanned PDF, image, or empty PDF)
        const manualMsg = getVoiceMessage(language, 'analysisStarted');
        toast({
          title: "⚠️ Manual entry required",
          description: "No values could be extracted. Please enter manually.",
        });
        
        // Speak message
        if (speechSupported) {
          speakMessage(manualMsg, language);
        }
      }
    } catch (error) {
      console.error("[SoilReport] Upload error:", error);
      const errorMsg = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Upload failed",
        description: errorMsg,
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

    setIsAnalyzing(true);
    try {
      const payload: any = {
        farmer_id: farmerId,
        soilType: soilType.trim(),
        pH: phNum,
      };
      
      if (nitrogen.trim()) payload.nitrogen = parseFloat(nitrogen);
      if (phosphorus.trim()) payload.phosphorus = parseFloat(phosphorus);
      if (potassium.trim()) payload.potassium = parseFloat(potassium);

      console.log("[SoilReport] Submitting soil data:", payload);

      const response = await submitSoilData(payload);

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
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setInputMode(null);
    setUploadedFile(null);
    setUploadNotes([]);
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
            <p className="text-xs text-muted-foreground">{t.chooseMethod}</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Voice Debug Component */}
        <VoiceDebug />

        {/* Mode selector (if no mode chosen yet) */}
        {!inputMode && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode("upload")}
              className="rounded-lg border-2 border-dashed p-6 text-center hover:border-primary hover:bg-primary/5 transition"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">{t.uploadReport}</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
            </button>
            <button
              onClick={() => setInputMode("manual")}
              className="rounded-lg border-2 border-dashed p-6 text-center hover:border-primary hover:bg-primary/5 transition"
            >
              <FlaskConical className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">{t.manualEntry}</p>
              <p className="text-xs text-muted-foreground">{t.enterDirectly}</p>
            </button>
          </div>
        )}

        {/* Upload mode */}
        {inputMode === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {t.uploadSoilReport}
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
                    {t.remove}
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
                  <p className="text-sm font-medium">{t.clickUpload}</p>
                  <p className="text-xs text-muted-foreground">{t.maxSize}</p>
                </label>
              )}
              {isUploading && <p className="text-sm text-muted-foreground">{t.uploading}</p>}
            </CardContent>
          </Card>
        )}

        {/* Manual entry mode */}
        {inputMode === "manual" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                {t.enterValues}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display parsing notes if any */}
              {uploadNotes.length > 0 && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertDescription className="text-sm text-amber-900 space-y-1">
                    {uploadNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label>{t.phLabel}</Label>
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
                <Label>{t.soilTypeLabel}</Label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sandy">{t.sandy}</SelectItem>
                    <SelectItem value="Loamy">{t.loamy}</SelectItem>
                    <SelectItem value="Clay">{t.clay}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">{t.nLabel}</Label>
                  <Input
                    type="number"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    placeholder="—"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t.pLabel}</Label>
                  <Input
                    type="number"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    placeholder="—"
                  />
                </div>
                <div>
                  <Label className="text-xs">{t.kLabel}</Label>
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
              disabled={isUploading || isAnalyzing || !ph || !soilType}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {t.analyze}
                </>
              )}
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
          <AlertDescription>
            {t.advisory}
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
};

export default SoilReport;
