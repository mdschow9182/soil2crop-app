import { expect, test } from "@playwright/test";

const report = {
  reportId: "SR-SYNTHETIC-1", userId: "FARMER-1", extractionStatus: "pending_review",
  parameters: { ph: { value: 6.5, unit: "pH", status: "extracted", source: "pdf_text" } }, parsingNotes: ["Synthetic fixture: review required"],
};
const cropAdvice = {
  success: true,
  data: {
    soilSummary: { ph: { label: "pH", value: 6.5, unit: "pH", status: "available", source: "verified" } },
    recommendations: [], catalogAvailability: "available", missingInputs: ["waterAvailability"], sufficientData: false,
    fertilizerAdvisory: [], irrigationAdvisory: [], weatherAvailability: "unavailable", disclaimer: "Synthetic browser-test response",
  },
};

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:5001/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === "/api/auth/login") return route.fulfill({ json: { success: true, token: "synthetic-browser-token", farmer: { _id: "FARMER-MONGO-1", farmer_id: "FARMER-1", name: "Synthetic Farmer" } } });
    if (path.startsWith("/api/reports/")) return route.fulfill({ json: { success: true, data: [] } });
    if (path === "/api/soilreport/upload") return route.fulfill({ json: { success: true, report } });
    if (path === "/api/soilreport") return route.fulfill({ json: { success: true, report: { ...report, extractionStatus: "verified" } } });
    if (path === "/api/crop-suggestion") return route.fulfill({ json: cropAdvice });
    if (path === "/api/farmer-assistant") return route.fulfill({ json: { success: true, data: { response: "Synthetic Telugu farming answer.", confidence: 0.8 } } });
    if (path === "/api/farmer-assistant/suggestions") return route.fulfill({ json: { success: true, data: [] } });
    return route.fulfill({ status: 404, json: { success: false, message: "Synthetic route not configured" } });
  });
});

test("synthetic farmer can log in, upload a report, review it, see crop advice, and ask the assistant", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel(/mobile number/i).fill("9876543210");
  await page.getByLabel(/^password$/i).fill("synthetic-password");
  await page.getByRole("button", { name: /farmer login/i }).click();
  await expect(page).toHaveURL(/soil-report/);

  await page.getByRole("button", { name: /upload report/i }).click();
  await page.locator('input[type="file"]').nth(1).setInputFiles({ name: "synthetic-soil.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 synthetic test fixture") });
  await expect(page.getByText(/review every extracted value/i)).toBeVisible();
  await page.getByRole("button", { name: /analyze/i }).click();
  await expect(page).toHaveURL(/crop-suggestion/);
  await expect(page.getByText(/crop advice/i)).toBeVisible();

  await page.getByRole("button", { name: "Open AI Farming Assistant" }).click();
  await page.getByPlaceholder("Ask about farming...").fill("నా నేల ఎలా ఉంది?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Synthetic Telugu farming answer.")).toBeVisible();
});

test("login layout stays within a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Soil2Crop" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
