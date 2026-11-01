import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AIFarmerAssistant from "./AIFarmerAssistant";
import { LanguageProvider } from "@/context/LanguageContext";

const api = vi.hoisted(() => ({ fetchFarmerAssistant: vi.fn(), getSuggestedQuestions: vi.fn().mockResolvedValue({ data: [] }) }));
vi.mock("@/api", () => api);
vi.mock("./VoiceButton", () => ({ VoiceButton: () => <button type="button">Listen</button> }));

describe("AIFarmerAssistant", () => {
  beforeEach(() => {
    localStorage.clear(); vi.clearAllMocks(); api.getSuggestedQuestions.mockResolvedValue({ data: [] });
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  });

  it("sends a Telugu chat request and renders the response and confidence-compatible payload", async () => {
    api.fetchFarmerAssistant.mockResolvedValue({ data: { response: "మీ నివేదికను తనిఖీ చేయండి.", confidence: 0.82 } });
    localStorage.setItem("soil2crop_language", "te");
    render(<LanguageProvider><AIFarmerAssistant /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Open AI Farming Assistant" }));
    fireEvent.change(screen.getByPlaceholderText("Ask about farming..."), { target: { value: "నా నేల ఎలా ఉంది?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("మీ నివేదికను తనిఖీ చేయండి.")).toBeInTheDocument();
    expect(api.fetchFarmerAssistant).toHaveBeenCalledWith("నా నేల ఎలా ఉంది?", "te");
  });
});
