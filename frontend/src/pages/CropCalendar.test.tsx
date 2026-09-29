import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CropCalendar from "./CropCalendar";
import CropSuggestion from "./CropSuggestion";
import api, { getVerifiedCropAdvice } from "@/api";
import { translations } from "@/i18n/translations";

vi.mock("@/api", () => ({ default: { get: vi.fn() }, getVerifiedCropAdvice: vi.fn() }));
vi.mock("@/context/LanguageContext", () => ({ useLanguage: () => ({ t: translations.en, language: "en" }) }));

const calendarResponse = {
  data: {
    success: true,
    data: {
      crop: "Rice",
      state: "Andhra Pradesh",
      sowing_time: { display_text: "June - July" },
      harvesting_time: { display_text: "October - November" },
      duration_days: 120,
      fertilizer_schedule: [{ stage: "Basal Dose", timing: "At transplanting", fertilizer_type: "NPK", amount_per_hectare: "existing dataset value" }],
      irrigation_schedule: [],
      best_practices: [],
    },
  },
};

const renderCalendar = (state?: Record<string, string>) => render(
  <MemoryRouter initialEntries={[{ pathname: "/crop-calendar", state }]}>
    <Routes><Route path="/crop-calendar" element={<CropCalendar />} /></Routes>
  </MemoryRouter>,
);

describe("CropCalendar flow", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("uses the selected crop name for the existing API and retains its cropId", async () => {
    vi.mocked(api.get).mockResolvedValue(calendarResponse as never);
    const { container } = renderCalendar({ crop: "Rice", cropId: "rice", state: "Andhra Pradesh" });

    await screen.findByText("June - July");
    expect(api.get).toHaveBeenCalledWith("/api/crop-calendar", {
      params: { crop: "Rice", state: "Andhra Pradesh" },
    });
    expect(container.firstElementChild).toHaveAttribute("data-crop-id", "rice");
    expect(screen.queryByText(/Method: Broadcast/)).not.toBeInTheDocument();
  });

  it("does not request data until a missing state is selected", async () => {
    vi.mocked(api.get).mockResolvedValue(calendarResponse as never);
    renderCalendar({ crop: "Rice", cropId: "rice" });

    expect(await screen.findByText("Select your state to view location-specific calendar information.")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Andhra Pradesh" } });
    fireEvent.click(screen.getByRole("button", { name: /Get calendar/i }));
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/api/crop-calendar", {
      params: { crop: "Rice", state: "Andhra Pradesh" },
    }));
    expect(localStorage.getItem("farmer_state")).toBe("Andhra Pradesh");
  });

  it("restores the selected crop and state after refresh", async () => {
    localStorage.setItem("selectedCrop", "Maize");
    localStorage.setItem("selectedCropId", "maize");
    localStorage.setItem("farmer_state", "Andhra Pradesh");
    vi.mocked(api.get).mockResolvedValue({
      ...calendarResponse,
      data: { ...calendarResponse.data, data: { ...calendarResponse.data.data, crop: "Maize" } },
    } as never);

    renderCalendar();
    await waitFor(() => expect(api.get).toHaveBeenCalledWith("/api/crop-calendar", {
      params: { crop: "Maize", state: "Andhra Pradesh" },
    }));
  });

  it("shows the API's specific unknown-crop error", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("No calendar data found for this crop and state combination"));
    renderCalendar({ crop: "Wheat", cropId: "wheat", state: "Andhra Pradesh" });

    expect(await screen.findByText("No calendar data found for this crop and state combination")).toBeInTheDocument();
  });

  it("navigates from a crop recommendation to its existing calendar", async () => {
    localStorage.setItem("farmerId", "6abb8dfbaf309bece807ed4b");
    localStorage.setItem("selectedSoilReportId", "SRMUMIJF2M");
    localStorage.setItem("farmer_state", "Andhra Pradesh");
    vi.mocked(getVerifiedCropAdvice).mockResolvedValue({
      success: true,
      data: {
        soilSummary: {
          ph: { label: "pH", value: 6.5, unit: "pH", status: "available", source: "verified" },
          soilType: { label: "Soil type", value: "Loamy", unit: null, status: "available", source: "verified" },
        },
        recommendations: [{
          cropId: "rice", cropName: "Rice", scientificName: null, score: 100, coveragePercent: 55,
          confidence: "low", suitability: "higher_relative_fit", matchedFactors: ["pH matches"],
          limitingFactors: [], matchedFactorKeys: ["ph_match"], limitingFactorKeys: [], missingInputs: [],
          explanation: "Configured relative match", waterRequirement: "High", growingPeriodDays: 120, ruleProvenance: {},
          fertilizerAdvisory: {
            status: "unavailable", reason: "soil_value_unavailable", reasonCodes: [], availableNutrients: ["nitrogen"],
            missingNutrients: ["phosphorus"], needsReviewNutrients: ["potassium"], calculationPerformed: false,
            nutrients: [
              { nutrient: "nitrogen", label: "Nitrogen", soilStatus: "available", soilValue: 120, soilUnit: "kg/ha", cropRequirementStatus: "unavailable", calculationStatus: "unavailable", reasonCodes: ["crop_requirement_unavailable", "units_or_measurement_basis_incompatible"], calculationPerformed: false },
              { nutrient: "phosphorus", label: "Phosphorus", soilStatus: "missing", soilValue: null, soilUnit: null, cropRequirementStatus: "unavailable", calculationStatus: "unavailable", reasonCodes: ["soil_value_unavailable", "crop_requirement_unavailable", "units_or_measurement_basis_incompatible"], calculationPerformed: false },
              { nutrient: "potassium", label: "Potassium", soilStatus: "needs_review", soilValue: null, soilUnit: null, cropRequirementStatus: "unavailable", calculationStatus: "unavailable", reasonCodes: ["soil_value_needs_review", "crop_requirement_unavailable", "units_or_measurement_basis_incompatible"], calculationPerformed: false },
            ],
          },
          irrigationAdvisory: {
            status: "unavailable", waterRequirement: "High",
            waterRequirementProvenance: { status: "project_configured", sourceReference: null },
            soilType: "Loamy", soilTypeStatus: "available", rainfallAvailability: "unavailable",
            weatherAvailability: "unavailable", waterRateAvailability: "unavailable",
            soilWaterCapacityAvailability: "unavailable", cropStageScheduleAvailability: "unavailable",
            reasonCodes: ["qualitative_water_category_only", "crop_water_rate_unavailable", "weather_data_unavailable"],
            reason: "Qualitative crop water category only", explanation: "No irrigation amount or schedule was calculated.",
            calculationPerformed: false, scheduleCalculated: false,
          },
        }],
        catalogAvailability: "available", missingInputs: [], sufficientData: true,
        fertilizerAdvisory: [], irrigationAdvisory: [], weatherAvailability: "unavailable", disclaimer: "Decision support only",
      },
    } as never);
    vi.mocked(api.get).mockResolvedValue(calendarResponse as never);

    render(
      <MemoryRouter initialEntries={["/crop-suggestion"]}>
        <Routes>
          <Route path="/crop-suggestion" element={<CropSuggestion />} />
          <Route path="/crop-calendar" element={<CropCalendar />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Select crop for fertilizer advisory" }));
    expect(await screen.findByText("Soil nutrient status")).toBeInTheDocument();
    expect(screen.getByText("Nitrogen: Available (120 kg/ha)")).toBeInTheDocument();
    expect(screen.getByText("Phosphorus information is unavailable, so a recommendation cannot be calculated.")).toBeInTheDocument();
    expect(screen.getByText("The available soil-test measurement cannot be safely compared with the configured crop requirement.")).toBeInTheDocument();
    expect(screen.getByText("Irrigation advisory: Rice")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("Existing crop catalog water category") === true)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("Confirmed soil type: Loamy") === true)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("Rainfall and current weather") === true)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("Unavailable information") === true)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent?.includes("documented crop water rates") === true)).toBeInTheDocument();
    expect(screen.queryByText(/litres\/(?:day|acre)|mm\/day|irrigation interval|watering schedule|evapotranspiration/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open crop calendar" }));
    await screen.findByText("June - July");
    expect(api.get).toHaveBeenCalledWith("/api/crop-calendar", {
      params: { crop: "Rice", state: "Andhra Pradesh" },
    });
    expect(localStorage.getItem("selectedCropId")).toBe("rice");
  });
});
