import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Upload, FlaskConical, ArrowRight, FileText, RotateCcw, Loader2, Camera } from "lucide-react";

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
import { translate } from "@/i18n/translations";
import { getSoilReports, submitSoilData, uploadSoilReport } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { VoiceButton } from "@/components/VoiceButton";

const SOIL_PARAMETER_LABELS: Record<string, string> = {
  ph: "pH", electricalConductivity: "Electrical Conductivity", organicCarbon: "Organic Carbon",
  nitrogen: "Nitrogen", phosphorus: "Phosphorus", potassium: "Potassium", sulphur: "Sulphur",
  zinc: "Zinc", iron: "Iron", manganese: "Manganese", copper: "Copper", boron: "Boron",
};

type RecentSoilReport = {
  reportId?: string;
  fileName?: string | null;
  reportDate?: string | null;
  createdAt?: string | null;
  extractionStatus?: string | null;
  soilType?: string | null;
  ph?: number | null;
};

const SoilReport = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const formatParsingNote = (note: string) => {
    if (language === "en") return note;
    if (note === "Only the first 8 pages were processed") return t.soilNoteOnlyFirstPages;
    if (note === "No readable text was found. Enter soil values manually.") return t.soilNoteNoReadableText;
    if (note === "No soil parameters were detected. Enter values manually.") return t.soilNoteNoParameters;

    const match = note.match(/^([^:]+?)(?::\s*(.*)|\s+was not found in the report)$/);
    if (!match) return `${t.soilNoteUntranslated} ${note}`;
    const englishLabel = match[1].trim();
    const parameterKey = Object.entries(SOIL_PARAMETER_LABELS).find(([, label]) => label.toLowerCase() === englishLabel.toLowerCase())?.[0];
    if (!parameterKey) return `${t.soilNoteUntranslated} ${note}`;
    const parameter = translate(language, `parameter_${parameterKey}`);
    const detail = match[2];
    if (!detail) return t.soilNoteParameterMissing.replace("{parameter}", parameter);

    let detailMatch = detail.match(/^Value is outside the accepted range \(([-+\d.]+)[–-]([-+\d.]+)\)$/i);
    if (detailMatch) return t.soilNoteOutsideRange.replace("{parameter}", parameter).replace("{minimum}", detailMatch[1]).replace("{maximum}", detailMatch[2]);
    if (/^Value is unusual and should be checked against the report$/i.test(detail)) return t.soilNoteUnusual.replace("{parameter}", parameter);
    if (/^Unit was not found; please verify it$/i.test(detail)) return t.soilNoteUnitMissing.replace("{parameter}", parameter);
    detailMatch = detail.match(/^Unit ["“](.*?)["”] is not recognized for .+$/i);
    if (detailMatch) return t.soilNoteUnitUnknown.replace("{parameter}", parameter).replace("{unit}", detailMatch[1]);
    if (/^Extraction confidence is low; please verify this value$/i.test(detail)) return t.soilNoteConfidenceLow.replace("{parameter}", parameter);
    if (/^Value is not a valid number$/i.test(detail)) return t.soilNoteInvalidNumber.replace("{parameter}", parameter);
    return `${t.soilNoteUntranslated} ${note}`;
  };

  // Strict mode: "upload" or "manual" or null
  const [inputMode, setInputMode] = useState<"upload" | "manual" | null>(null);
  
  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotes, setUploadNotes] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Manual input state
  const [ph, setPh] = useState("");
  const [soilType, setSoilType] = useState("Unknown");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [reviewReport, setReviewReport] = useState<any>(null);
  const [reviewValues, setReviewValues] = useState<Record<string, { value: string; unit: string; source?: string; status?: string }>>({});
  const [recentReports, setRecentReports] = useState<RecentSoilReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const farmerId = localStorage.getItem("farmerId") || localStorage.getItem("farmer_id");
    if (!farmerId) {
      setReportsLoading(false);
      return () => { cancelled = true; };
    }
    getSoilReports(farmerId)
      .then((result) => {
        if (cancelled) return;
        setRecentReports(Array.isArray(result.data) ? result.data : []);
        setReportsError(result.success === false);
      })
      .catch(() => { if (!cancelled) setReportsError(true); })
      .finally(() => { if (!cancelled) setReportsLoading(false); });
    return () => { cancelled = true; };
  }, []);

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
    // Use farmerId (MongoDB _id) for API calls
    const farmerId = localStorage.getItem("farmerId");
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
      formData.append("farmer_id", farmerId); // Send MongoDB _id

      console.log("[SoilReport] FormData prepared, sending to API");
      const result = await uploadSoilReport(formData);
      
      console.log("[SoilReport] Upload response:", result);
      
      if (!result) {
        throw new Error("Empty response from server");
      }
      
      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      setInputMode("manual");
      const report = result.report || {};
      const ext = report.parameters || {};
      const notes = report.parsingNotes || report.parsing_notes || [];
      setReviewReport(report);
      setReviewValues(Object.fromEntries(Object.entries(ext).map(([key, item]: [string, any]) => [key, { value: item.value == null ? "" : String(item.value), unit: item.unit || "", source: item.source, status: item.status }])));
      const extractedCount = Object.values(ext).filter((item: any) => item?.value !== null && item?.value !== undefined).length;
      
      console.log("[SoilReport] Extracted values:", ext);
      console.log("[SoilReport] Parsing notes:", notes);
      console.log("[SoilReport] Extracted field count:", extractedCount);
      
      setUploadNotes(notes);

      if (extractedCount > 0) {
        // Values were extracted from PDF - prefill the form
        if (ext.ph?.value != null) setPh(String(ext.ph.value));
        if (ext.nitrogen?.value != null) setNitrogen(String(ext.nitrogen.value));
        if (ext.phosphorus?.value != null) setPhosphorus(String(ext.phosphorus.value));
        if (ext.potassium?.value != null) setPotassium(String(ext.potassium.value));
        
        toast({
          title: t.extractionSuccess,
          description: `${extractedCount} ${t.valuesExtracted}`,
        });
        
      } else {
        // No values extracted (scanned PDF, image, or empty PDF)
        toast({
          title: t.manualRequired,
          description: t.noValues,
        });
        
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
    const farmerId = reviewReport?.userId || localStorage.getItem("farmer_id") || localStorage.getItem("farmerId");
    if (!farmerId) {
      toast({ title: "Error", description: "Not logged in", variant: "destructive" });
      navigate("/");
      return;
    }

    if (reviewReport?.reportId) {
      const soilParameters = Object.fromEntries(Object.entries(reviewValues).map(([key, item]) => [key, {
        value: item.value.trim() === "" ? null : Number(item.value), unit: item.unit || null,
        status: item.source && item.value.trim() !== "" ? "extracted" : "manually_entered",
        originalText: item.source ? undefined : null,
      }]));
      if (Object.values(soilParameters).some((item: any) => item.value !== null && !Number.isFinite(item.value))) {
        toast({ title: "Invalid value", description: "Use a number or leave the field empty.", variant: "destructive" });
        return;
      }
      setIsAnalyzing(true);
      try {
        const response = await submitSoilData({ userId: farmerId, reportId: reviewReport.reportId, soilParameters, soilType });
        if (!response.success) throw new Error(response.message || "Could not save verified values");
        toast({ title: "Soil values saved", description: "Your reviewed values are now recorded." });
        setReviewReport(null);
        localStorage.setItem("selectedSoilReportId", response.report?.reportId || reviewReport.reportId);
        navigate("/crop-suggestion", { state: { reportId: response.report?.reportId || reviewReport.reportId, ...Object.fromEntries(Object.entries(soilParameters).map(([key, item]: [string, any]) => [key, item.value])), soilType, apiResponse: response } });
      } catch (error) {
        toast({ title: "Save failed", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
      } finally { setIsAnalyzing(false); }
      return;
    }

    const phNum = ph.trim() ? parseFloat(ph) : null;
    if (ph.trim() && (phNum === null || isNaN(phNum) || phNum < 0 || phNum > 14)) {
      toast({
        title: "Invalid pH",
        description: "Must be 0–14",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const soilData = {
        userId: farmerId,
        nitrogen: nitrogen.trim() ? Number(nitrogen) : null,
        phosphorus: phosphorus.trim() ? Number(phosphorus) : null,
        potassium: potassium.trim() ? Number(potassium) : null,
        ph: phNum,
        soilType,
      };

      console.log("[SoilReport] Submitting soil data:", soilData);

      const response = await submitSoilData(soilData);

      if (response.success) {
        const reportId = response.report?.reportId;
        if (reportId) localStorage.setItem("selectedSoilReportId", reportId);
        navigate("/crop-suggestion", {
          state: {
            reportId,
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
    setReviewReport(null);
    setReviewValues({});
    setPh("");
    setSoilType("Unknown");
    setNitrogen("");
    setPhosphorus("");
    setPotassium("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
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

      <main className="container mx-auto max-w-3xl space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
          <p className="text-sm font-medium">{t.chooseMethod}</p>
          <VoiceButton language={language} message={`${t.uploadSoil}. ${t.chooseMethod}. ${t.uploadReport}. ${t.manualEntry}.`} />
        </div>

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
                      if (cameraInputRef.current) cameraInputRef.current.value = "";
                    }}
                    className="inline-flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {t.remove}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                  <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png" capture="environment" onChange={handleFileSelect} className="sr-only" aria-label={t.takePhoto} disabled={isUploading} />
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="sr-only" aria-label={t.chooseFile} disabled={isUploading} />
                  <Button type="button" variant="outline" className="h-12 w-full" onClick={() => cameraInputRef.current?.click()} disabled={isUploading}>
                    <Camera className="mr-2 h-5 w-5" />{t.takePhoto}
                  </Button>
                  <Button type="button" variant="outline" className="h-12 w-full" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    <Upload className="mr-2 h-5 w-5" />{t.chooseFile}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground min-[380px]:col-span-2">{t.maxSize}</p>
                </div>
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
              {reviewReport?.reportId && <div className="space-y-3">
                <Alert><AlertDescription>Review every extracted value. Values remain unverified until you save this review. Empty values stay missing.</AlertDescription></Alert>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(SOIL_PARAMETER_LABELS).map(([key, fallbackLabel]) => {
                    const label = translate(language, `parameter_${key}`) || fallbackLabel;
                    return <div key={key}>
                    <Label>{label} {reviewValues[key]?.status === "needs_review" ? t.needsReview : ""}</Label>
                    <div className="flex gap-2">
                      <Input type="number" step="any" value={reviewValues[key]?.value ?? ""} placeholder={t.notAvailable} onChange={(e) => setReviewValues((current) => ({ ...current, [key]: { ...current[key], value: e.target.value, source: undefined } }))} />
                      <Input aria-label={`${label} unit`} value={reviewValues[key]?.unit ?? ""} placeholder="Unit" className="max-w-28" onChange={(e) => setReviewValues((current) => ({ ...current, [key]: { ...current[key], unit: e.target.value, source: undefined } }))} />
                    </div>
                  </div>;
                  })}
                </div>
              </div>}
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
                    <SelectItem value="Unknown">{t.notAvailable}</SelectItem>
                    <SelectItem value="Sandy">{t.sandy}</SelectItem>
                    <SelectItem value="Loamy">{t.loamy}</SelectItem>
                    <SelectItem value="Clay">{t.clay}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
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
              disabled={isUploading || isAnalyzing || (!reviewReport && !soilType)}
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

        <Card>
          <CardHeader><CardTitle>{t.recentReports}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {reportsLoading ? <p role="status" className="text-sm text-muted-foreground">{t.loading}</p>
              : reportsError ? <p role="status" className="text-sm text-destructive">{t.reportsLoadFailed}</p>
                : recentReports.length === 0 ? <p className="text-sm text-muted-foreground">{t.noReportsYet}</p>
                  : recentReports.slice(0, 5).map((report, index) => {
                    const verified = report.extractionStatus === "verified";
                    const dateValue = report.reportDate || report.createdAt;
                    const date = dateValue && !Number.isNaN(Date.parse(dateValue)) ? new Date(dateValue).toLocaleDateString() : "";
                    return <button
                      key={report.reportId || `${date}-${index}`}
                      type="button"
                      disabled={!verified || !report.reportId}
                      onClick={() => {
                        if (!report.reportId) return;
                        localStorage.setItem("selectedSoilReportId", report.reportId);
                        navigate("/crop-suggestion", { state: { reportId: report.reportId } });
                      }}
                      className="flex min-h-16 w-full items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 text-left disabled:cursor-default disabled:opacity-70 enabled:hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-medium">{report.fileName || report.reportId || t.uploadSoilReport}</span>
                        <span className="block text-xs text-muted-foreground">{[date, report.soilType, report.ph != null ? `pH ${report.ph}` : ""].filter(Boolean).join(" · ")}</span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">{report.extractionStatus || t.notAvailable}</span>
                    </button>;
                  })}
          </CardContent>
        </Card>

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
