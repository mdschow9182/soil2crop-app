import { useState, useRef, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Upload, Camera, ShieldAlert, Leaf, ArrowRight, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { uploadCropImage } from "@/api";

const CropMonitoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPG, JPEG, or PNG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Clear selected file
   */
  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Upload image to backend
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No image selected",
        description: "Please select a crop image to upload.",
        variant: "destructive",
      });
      return;
    }

    const farmerId = localStorage.getItem("farmer_id");
    if (!farmerId) {
      toast({
        title: "Not logged in",
        description: "Please login first to upload images.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("crop_image", selectedFile);
      formData.append("farmer_id", farmerId);

      const result = await uploadCropImage(formData);

      // SECURITY: Handle new standardized response format { success, message, data }
      const responseData = result.data || result;

      if (result.success) {
        setUploadResult(responseData);
        toast({
          title: "Upload successful",
          description: "Crop image uploaded and analyzed successfully.",
        });
        // Keep file shown on success
      } else {
        // Show backend error message
        toast({
          title: "Upload failed",
          description: result.message || "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        // Clear file on failure
        clearFile();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload error",
        description: error?.message || "An error occurred while uploading the image. Please check your connection and try again.",
        variant: "destructive",
      });
      // Clear file on error
      clearFile();
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Trigger file input click
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Sprout className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-heading font-bold text-foreground">Crop Monitoring</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Upload Crop Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Area */}
            {!selectedFile ? (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
              >
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Click to select a crop image</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: JPG, JPEG, PNG (max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={previewUrl!}
                    alt="Selected crop"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={handleClearFile}
                    className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* File Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading & Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results — show after successful upload */}
        {uploadResult && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Health Score */}
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Health Score</p>
                    <p className={`text-4xl font-bold ${
                      uploadResult.analysis.health_score >= 0.8 ? "text-green-500" :
                      uploadResult.analysis.health_score >= 0.6 ? "text-yellow-500" :
                      "text-red-500"
                    }`}>
                      {Math.round(uploadResult.analysis.health_score * 100)}%
                    </p>
                  </div>
                </div>

                {/* Status & Issue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-primary/5 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Growth Status</p>
                    <p className="text-lg font-heading font-bold text-primary">
                      {uploadResult.analysis.status === "Healthy" ? "🟢" : 
                       uploadResult.analysis.status === "Moderate" ? "🟡" : "🔴"} {uploadResult.analysis.status}
                    </p>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${
                    uploadResult.analysis.detected_issue ? "bg-accent/10" : "bg-green-50"
                  }`}>
                    <p className="text-xs text-muted-foreground mb-1">Detected Issue</p>
                    <p className={`text-lg font-heading font-bold ${
                      uploadResult.analysis.detected_issue ? "text-accent" : "text-green-600"
                    }`}>
                      {uploadResult.analysis.detected_issue || "None detected"}
                    </p>
                  </div>
                </div>

                {/* Analysis Timestamp */}
                <p className="text-xs text-muted-foreground text-center">
                  Analyzed at: {new Date(uploadResult.analysis.analyzed_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Treatment Guidance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Suggested Actions
                  </p>
                  <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
                    {uploadResult.analysis.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                {uploadResult.analysis.detected_issue && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      ⚗️ Advisory Note
                    </p>
                    <p className="text-sm text-muted-foreground">
                      An issue was detected in your crop. Please consult an agricultural officer for confirmation before applying any treatment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={() => navigate("/dashboard")} className="w-full h-12 text-base font-semibold" size="lg">
              Go to Farmer Dashboard <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </>
        )}

        <p className="text-xs text-center text-muted-foreground rounded-lg bg-secondary p-3">
          ⚠️ AI analysis is for guidance only. Always consult agricultural experts for critical decisions.
        </p>
      </main>
    </div>
  );
};

export default CropMonitoring;
