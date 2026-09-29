import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CalendarDays, Loader2, Sprout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getVerifiedCropAdvice } from "@/api";
import { useLanguage } from "@/context/LanguageContext";
import { translate } from "@/i18n/translations";
import { VoiceButton } from "@/components/VoiceButton";

type SoilSummaryItem = { label: string; value: number | string | null; unit: string | null; status: "available" | "missing" | "needs_review"; source: string | null };
type CropRecommendation = {
  cropId: string; cropName: string; scientificName: string | null; score: number | null;
  coveragePercent: number; confidence: string; suitability: string; matchedFactors: string[];
  limitingFactors: string[]; matchedFactorKeys?: string[]; limitingFactorKeys?: string[]; missingInputs: string[]; explanation: string;
  waterRequirement: string | null; growingPeriodDays: number | null;
  ruleProvenance: Record<string, { status: string; sourceReference?: string | null; provenanceNote?: string }>;
  fertilizerAdvisory: {
    status: "unavailable"; reason: string; reasonCodes: string[]; availableNutrients: string[];
    missingNutrients: string[]; needsReviewNutrients: string[]; calculationPerformed: false;
    nutrients: Array<{
      nutrient: "nitrogen" | "phosphorus" | "potassium"; label: string;
      soilStatus: "available" | "missing" | "needs_review"; soilValue: number | null; soilUnit: string | null;
      cropRequirementStatus: "available" | "unavailable"; calculationStatus: "unavailable";
      reasonCodes: string[]; calculationPerformed: false;
    }>;
  };
  irrigationAdvisory?: {
    status: "unavailable"; waterRequirement: string | null;
    waterRequirementProvenance: { status: string; sourceReference?: string | null; provenanceNote?: string };
    soilType: string | null; soilTypeStatus: "available" | "missing" | "needs_review";
    rainfallAvailability: string; weatherAvailability: string; waterRateAvailability: string;
    soilWaterCapacityAvailability: string; cropStageScheduleAvailability: string;
    reasonCodes: string[]; reason: string; explanation: string;
    calculationPerformed: false; scheduleCalculated: false;
  };
};
type AdviceData = {
  soilSummary: Record<string, SoilSummaryItem>; recommendations: CropRecommendation[];
  catalogAvailability: "available" | "empty";
  missingInputs: string[]; sufficientData: boolean;
  fertilizerAdvisory: Array<{ nutrient: string; status: string; reason: string }>;
  irrigationAdvisory: Array<{ cropId: string; status: string; waterRequirement: string | null; reason: string }>;
  weatherAvailability: string; disclaimer: string;
};

const PARAMETER_LABELS: Record<string, string> = {
  ph: "pH", nitrogen: "Nitrogen", phosphorus: "Phosphorus", potassium: "Potassium",
  electricalConductivity: "Electrical conductivity", organicCarbon: "Organic carbon",
  sulphur: "Sulphur", zinc: "Zinc", iron: "Iron", manganese: "Manganese", copper: "Copper", boron: "Boron"
};
const FACTOR_KEYS: Record<string, string> = {
  ph_match: "factorPhMatch", ph_outside_range: "factorPhOutside", ph_rule_unavailable: "factorPhRuleUnavailable",
  soilType_match: "factorSoilMatch", soilType_mismatch: "factorSoilMismatch", soilType_missing: "factorSoilMissing",
  soilType_rule_unavailable: "factorSoilRuleUnavailable", no_configured_match: "factorNoMatch",
  season_rule_unavailable: "factorSeasonUnavailable", rainfall_rule_unavailable: "factorRainfallUnavailable",
  cropStages_rule_unavailable: "factorStagesUnavailable"
};
const statusKeys: Record<string, string> = { available: "available", missing: "missing", needs_review: "needsReview" };

export default function CropSuggestion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [advice, setAdvice] = useState<AdviceData | null>(null);
  const [selectedCropId, setSelectedCropId] = useState(() => localStorage.getItem("fertilizerAdvisoryCropId") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const text = (key: string) => translate(language, key);
  const catalogValue = (value: string | null | undefined, kind: "water" | "soil") => {
    if (!value) return text("notAvailable");
    const normalized = value.trim().toLowerCase();
    const keys: Record<string, string> = kind === "water"
      ? { low: "catalogWaterLow", medium: "catalogWaterMedium", high: "catalogWaterHigh" }
      : { sandy: "catalogSoilSandy", loamy: "catalogSoilLoamy", clay: "catalogSoilClay" };
    return keys[normalized] ? text(keys[normalized]) : value;
  };
  const parameterText = (key: string) => {
    const translated = text(`parameter_${key}`);
    return translated === "Translation unavailable" ? PARAMETER_LABELS[key] || text("notAvailable") : translated;
  };

  useEffect(() => {
    let active = true;
    const reportId = location.state?.reportId || localStorage.getItem("selectedSoilReportId");
    const farmerId = localStorage.getItem("farmerId");
    if (!farmerId || !reportId) {
      setError(text("cropAdviceMissingReport"));
      setLoading(false);
      return () => { active = false; };
    }
    getVerifiedCropAdvice({ farmerId, reportId, district: localStorage.getItem("farmer_location") || undefined })
      .then((result) => {
        if (active && result.success) setAdvice(result.data);
        else if (active) setError(text("cropAdviceFailed"));
      })
      .catch(() => { if (active) setError(text("cropAdviceFailed")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [location.state]);

  const factorText = (code: string) => {
    if (FACTOR_KEYS[code]) return text(FACTOR_KEYS[code]);
    const comparison = code.match(/^(ph|nitrogen|phosphorus|potassium|electricalConductivity|organicCarbon)_(match|outside_range)$/);
    if (comparison) return `${text(`parameter_${comparison[1]}`)}: ${text(comparison[2] === "match" ? "factorWithinConfiguredRange" : "factorOutsideConfiguredRange")}`;
    const match = code.match(/^(ph|nitrogen|phosphorus|potassium|electricalConductivity|organicCarbon|sulphur|zinc|iron|manganese|copper|boron)_(missing|needs_review|range_basis_unavailable|requirement_unavailable|rule_unavailable)$/);
    if (match) {
      const label = text(`parameter_${match[1]}`);
      const suffix = match[2] === "missing" ? text("factorValueMissing")
        : match[2] === "needs_review" ? text("factorValueReview")
          : text("factorRuleUnavailable");
      return `${label}: ${suffix}`;
    }
    return text("notAvailable");
  };

  const statusText = (status: string) => text(statusKeys[status] || status);

  if (loading) return <main className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></main>;
  if (error || !advice) return <main className="min-h-screen p-4"><div className="max-w-3xl mx-auto space-y-4">
    <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error || text("cropAdviceFailed")}</AlertDescription></Alert>
    <Button onClick={() => navigate("/soil-report")}><ArrowLeft className="w-4 h-4 mr-2" />{t.backToSoilReport || "Back to Soil Report"}</Button>
  </div></main>;

  return <main className="min-h-screen bg-background px-3 py-4 pb-24 sm:p-6 sm:pb-28"><div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
    <header className="text-center space-y-2">
      <Sprout className="w-9 h-9 mx-auto text-primary" />
      <h1 className="text-2xl font-heading font-bold">{text("cropAdviceVerifiedTitle")}</h1>
      <p className="text-sm text-muted-foreground">{text("ruleDisclaimer")}</p>
    </header>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{text("soilHealthSummary")}</CardTitle>
        <VoiceButton language={language} message={`${text("soilHealthSummary")}. ${Object.entries(advice.soilSummary).map(([key, item]) => `${parameterText(key)}: ${item.status === "available" ? `${item.value}${item.unit ? ` ${item.unit}` : ""}` : text(statusKeys[item.status])}`).join(". ")}`} />
      </CardHeader>
      <CardContent className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.entries(advice.soilSummary).map(([key, item]) => <div key={key} className="rounded-md border p-3">
          <p className="text-sm font-medium">{parameterText(key) || item.label}</p>
          <p className="font-semibold">{item.status === "available" ? `${item.value}${item.unit ? ` ${item.unit}` : ""}` : text(statusKeys[item.status])}</p>
          <Badge variant={item.status === "available" ? "default" : "secondary"}>{statusText(item.status)}</Badge>
        </div>)}
      </CardContent>
    </Card>

    {!advice.recommendations.length && <Alert><AlertTriangle className="h-4 w-4" /><AlertDescription>{text(advice.catalogAvailability === "empty" ? "cropCatalogEmpty" : "noRecommendations")}</AlertDescription></Alert>}

    {advice.recommendations.map((crop) => <Card key={crop.cropId}>
      <CardHeader><div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>{crop.cropName}</CardTitle>
        <VoiceButton language={language} message={`${crop.cropName}. ${text("matchedFactors")}: ${(crop.matchedFactorKeys || crop.matchedFactors).map(factorText).join(". ") || text("notAvailable")}. ${text("limitingFactors")}: ${(crop.limitingFactorKeys || crop.limitingFactors).map(factorText).join(". ") || text("notAvailable")}.`} />
        <Badge variant="secondary">{text("relativeSuitability")}: {crop.score ?? text("notAvailable")}/100 · {text("dataCoverage")}: {crop.coveragePercent}%</Badge>
      </div></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{text("relativeScoreOnly")}</p>
        <p className="text-sm"><strong>{text("confidence")}:</strong> {crop.confidence || text("notAvailable")}</p>
        {crop.explanation && <div><h3 className="text-sm font-semibold">{text("explanation")}</h3><p className="mt-1 text-sm leading-relaxed">{crop.explanation}</p></div>}
        <div><h3 className="font-semibold text-sm">{text("matchedFactors")}</h3>
          {crop.matchedFactors.length ? <ul className="list-disc pl-5 text-sm">{(crop.matchedFactorKeys || crop.matchedFactors).map((factor) => <li key={factor}>{factorText(factor)}</li>)}</ul> : <p className="text-sm">{text("notAvailable")}</p>}
        </div>
        <div><h3 className="font-semibold text-sm">{text("limitingFactors")}</h3>
          {crop.limitingFactors.length ? <ul className="list-disc pl-5 text-sm">{(crop.limitingFactorKeys || crop.limitingFactors).map((factor, index) => <li key={`${factor}-${index}`}>{factorText(factor)}</li>)}</ul> : <p className="text-sm">{text("notAvailable")}</p>}
        </div>
        {crop.missingInputs.length > 0 && <div><h3 className="font-semibold text-sm">{text("missingInformation")}</h3><p className="text-sm">{crop.missingInputs.map(parameterText).join(", ")}</p></div>}
        <div className="grid grid-cols-1 gap-3 text-sm min-[380px]:grid-cols-2">
          <p>{text("waterRequirement")}: {catalogValue(crop.waterRequirement, "water")}</p>
          <p>{text("growingPeriod")}: {crop.growingPeriodDays ? `${crop.growingPeriodDays} ${text("days")}` : text("notAvailable")}</p>
        </div>
        <details className="text-sm"><summary className="cursor-pointer font-medium">{text("viewDetails")}</summary>
          <p className="mt-2">{text("dataSourceDisclosure")}</p>
          {crop.scientificName && <p>{crop.scientificName}</p>}
          <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(crop.ruleProvenance, null, 2)}</pre>
        </details>
        <Button variant="outline" className="w-full" onClick={() => {
          setSelectedCropId(crop.cropId);
          localStorage.setItem("fertilizerAdvisoryCropId", crop.cropId);
        }}>{text(selectedCropId === crop.cropId ? "fertilizerAdvisorySelected" : "selectCropForFertilizer")}</Button>
        {selectedCropId === crop.cropId && <Card className="bg-muted/40">
          <CardHeader><CardTitle>{text("fertilizerAdvisory")}: {crop.cropName}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <VoiceButton language={language} message={`${text("fertilizerAdvisory")}: ${crop.cropName}. ${text("soilNutrientStatus")}: ${crop.fertilizerAdvisory.nutrients.map((item) => `${parameterText(item.nutrient)}: ${text(statusKeys[item.soilStatus])}`).join(". ")}. ${text("cropNutrientRequirementStatus")}: ${text("unavailable")}. ${text("calculationStatus")}: ${text("unavailable")}. ${text("fertilizerCalculationNotPerformed")}.`} />
            <div>
              <h3 className="font-semibold">{text("soilNutrientStatus")}</h3>
              <ul className="mt-1 space-y-1">
                {crop.fertilizerAdvisory.nutrients.map((item) => <li key={item.nutrient}>
                  {parameterText(item.nutrient)}: {text(statusKeys[item.soilStatus] || item.soilStatus)}
                  {item.soilStatus === "available" ? ` (${item.soilValue}${item.soilUnit ? ` ${item.soilUnit}` : ""})` : ""}
                </li>)}
              </ul>
            </div>
            <p><strong>{text("cropNutrientRequirementStatus")}:</strong> {text("unavailable")}</p>
            <p><strong>{text("calculationStatus")}:</strong> {text("unavailable")}</p>
            <div>
              <h3 className="font-semibold">{text("fertilizerExplanation")}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {crop.fertilizerAdvisory.nutrients.filter((item) => item.soilStatus === "missing").map((item) => <li key={`${item.nutrient}-missing`}>
                  {text("fertilizerSoilUnavailable").replace("{nutrient}", parameterText(item.nutrient))}
                </li>)}
                {crop.fertilizerAdvisory.nutrients.filter((item) => item.soilStatus === "needs_review").map((item) => <li key={`${item.nutrient}-review`}>
                  {text("fertilizerSoilNeedsReview").replace("{nutrient}", parameterText(item.nutrient))}
                </li>)}
                {crop.fertilizerAdvisory.nutrients.some((item) => item.reasonCodes.includes("crop_requirement_unavailable") || item.cropRequirementStatus === "unavailable") && <li>{text("cropNutrientRequirementUnavailable")}</li>}
                {crop.fertilizerAdvisory.nutrients.some((item) => item.reasonCodes.includes("units_or_measurement_basis_incompatible")) && <li>{text("soilNutrientUnitIncompatible")}</li>}
              </ul>
            </div>
            <p className="font-medium">{text("fertilizerCalculationNotPerformed")}</p>
          </CardContent>
        </Card>}
        {selectedCropId === crop.cropId && <Card className="bg-muted/40">
          <CardHeader><CardTitle>{text("irrigationAdvisory")}: {crop.cropName}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <VoiceButton language={language} message={`${text("irrigationAdvisory")}: ${crop.cropName}. ${text("irrigationSoilType")}: ${catalogValue(crop.irrigationAdvisory?.soilType, "soil")}. ${text("irrigationCatalogWaterCategory")}: ${catalogValue(crop.irrigationAdvisory?.waterRequirement ?? crop.waterRequirement, "water")}. ${text("irrigationRainfallStatus")}: ${text(`irrigationProvenance_${crop.irrigationAdvisory?.rainfallAvailability ?? "unavailable"}`)}. ${text("irrigationWeatherStatus")}: ${text(`irrigationProvenance_${crop.irrigationAdvisory?.weatherAvailability ?? "unavailable"}`)}. ${text("irrigationCalculationStatus")}: ${text(crop.irrigationAdvisory?.scheduleCalculated ? "available" : "unavailable")}. ${text("irrigationNoPrescription")}.`} />
            <p><strong>{text("irrigationSoilType")}:</strong> {catalogValue(crop.irrigationAdvisory?.soilType ?? (advice.soilSummary?.soilType?.status === "available" ? String(advice.soilSummary.soilType.value) : null), "soil")}</p>
            <p><strong>{text("irrigationCatalogWaterCategory")}:</strong> {catalogValue(crop.irrigationAdvisory?.waterRequirement ?? crop.waterRequirement, "water")} ({text(`irrigationProvenance_${crop.irrigationAdvisory?.waterRequirementProvenance?.status ?? crop.ruleProvenance?.waterRequirement?.status ?? "unavailable"}`)})</p>
            <p>{text("irrigationCategoryCaveat")}</p>
            <p><strong>{text("irrigationRainfallWeather")}:</strong> {text("irrigationRainfallStatus")}: {text(`irrigationProvenance_${crop.irrigationAdvisory?.rainfallAvailability ?? "unavailable"}`)}; {text("irrigationWeatherStatus")}: {text(`irrigationProvenance_${crop.irrigationAdvisory?.weatherAvailability ?? "unavailable"}`)}</p>
            <p><strong>{text("irrigationUnavailableInputs")}:</strong> {text("irrigationWaterRate")}, {text("irrigationSoilWaterCapacity")}, {text("irrigationCropStageSchedule")}</p>
            <p><strong>{text("irrigationCalculationStatus")}:</strong> {crop.irrigationAdvisory?.scheduleCalculated ? text("available") : text("unavailable")}</p>
            <p><strong>{text("irrigationExplanation")}:</strong> {text("irrigationNoPrescription")}</p>
          </CardContent>
        </Card>}
        <Button className="w-full" onClick={() => {
          localStorage.setItem("selectedCrop", crop.cropName);
          localStorage.setItem("selectedCropId", crop.cropId);
          navigate("/crop-calendar", { state: { crop: crop.cropName, cropId: crop.cropId } });
        }}><CalendarDays className="w-4 h-4 mr-2" />{text("cropCalendar")}</Button>
      </CardContent>
    </Card>)}

    <Alert><AlertDescription>{text("ruleDisclaimer")}</AlertDescription></Alert>
    <Alert><AlertDescription>{text("cropYearDataUnavailable")}</AlertDescription></Alert>
  </div></main>;
}
