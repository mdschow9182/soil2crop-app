import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { supportedLanguages, translations } from "@/i18n/translations";

const apiMocks = vi.hoisted(() => ({ updateFarmerLanguage: vi.fn().mockResolvedValue({}), getFarmerById: vi.fn() }));
vi.mock("@/api", () => apiMocks);

function LanguageHarness() {
  const { language, setLanguage, t } = useLanguage();
  return <div><output role="status">{language}</output><p>{t.login}</p>{supportedLanguages.map(({ code, native }) =>
    <button key={code} onClick={() => setLanguage(code)}>{native}</button>)}</div>;
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("switches through all supported languages and persists the selection", () => {
    render(<LanguageProvider><LanguageHarness /></LanguageProvider>);
    for (const { code, native } of supportedLanguages) {
      fireEvent.click(screen.getByRole("button", { name: native }));
      expect(screen.getByRole("status").textContent).toBe(code);
      expect(localStorage.getItem("soil2crop_language")).toBe(code);
      expect(screen.getByText((_, element) => element?.tagName === "P")).toHaveTextContent(translations[code].login);
    }
  });

  it("does not let a delayed backend preference overwrite a user's new selection", async () => {
    let resolveProfile!: (value: unknown) => void;
    apiMocks.getFarmerById.mockReturnValue(new Promise((resolve) => { resolveProfile = resolve; }));
    localStorage.setItem("farmer_id", "farmer-1");
    const { unmount } = render(<LanguageProvider><LanguageHarness /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "తెలుగు" }));
    act(() => resolveProfile({ farmer: { language: "hi" } }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("te"));
    expect(localStorage.getItem("soil2crop_language")).toBe("te");
    unmount();
  });

  it("restores the selected language after provider remount", () => {
    const first = render(<LanguageProvider><LanguageHarness /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "ಕನ್ನಡ" }));
    expect(screen.getByRole("status")).toHaveTextContent("kn");
    first.unmount();
    render(<LanguageProvider><LanguageHarness /></LanguageProvider>);
    expect(screen.getByRole("status")).toHaveTextContent("kn");
  });
});

const testsLoginText = {
  en: "Farmer Login", te: "రైతు లాగిన్", hi: "किसान लॉगिन", ta: "விவசாயி உள்நுழைவு", kn: "ರೈತರ ಲಾಗಿನ್", ml: "കർഷക ലോഗിൻ",
} as const;
