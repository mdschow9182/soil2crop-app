import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LanguageProvider } from "@/context/LanguageContext";
import { VoiceButton } from "./VoiceButton";

describe("farmer voice control", () => {
  afterEach(() => {
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
  });

  it("renders the translated listen control when speech is available", () => {
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
    });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: class {} });
    render(<LanguageProvider><VoiceButton message="Summary" language="en" /></LanguageProvider>);
    expect(screen.getByRole("button", { name: "Listen" })).toBeInTheDocument();
  });

  it("shows a safe translated status instead of crashing when browser speech is unavailable", () => {
    render(<LanguageProvider><VoiceButton message="Summary" language="en" /></LanguageProvider>);
    expect(screen.getByRole("status")).toHaveTextContent("Voice playback is unavailable");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("speaks on user request and changes to Stop only while the browser is speaking", async () => {
    const speak = vi.fn();
    const synthesis = {
      speak, cancel: vi.fn(), getVoices: () => [{ voiceURI: "en", name: "English", lang: "en-IN", default: true, localService: true }],
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synthesis });
    class Utterance {
      lang = ""; voice: SpeechSynthesisVoice | null = null; rate = 1; pitch = 1; volume = 1;
      onstart: (() => void) | null = null; onend: (() => void) | null = null;
      onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
      constructor(public text: string) {}
    }
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: Utterance });
    render(<LanguageProvider><VoiceButton message="Localized summary" language="en" /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Listen" }));
    await waitFor(() => expect(speak).toHaveBeenCalledOnce());
    expect((speak.mock.calls[0][0] as Utterance).text).toBe("Localized summary");
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    const utterance = speak.mock.calls[0][0] as Utterance;
    act(() => { utterance.onstart?.(); utterance.onend?.(); });
    await waitFor(() => expect(screen.getByRole("button", { name: "Listen" })).toBeInTheDocument());
  });

  it("cancels stale speech when displayed text changes and speaks the new text", async () => {
    const speak = vi.fn();
    const synthesis = {
      speak, cancel: vi.fn(), getVoices: () => [
        { voiceURI: "en", name: "English", lang: "en-IN", default: true, localService: true },
        { voiceURI: "te", name: "Telugu", lang: "te-IN", default: false, localService: true },
      ], addEventListener: vi.fn(), removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synthesis });
    class Utterance {
      lang = ""; voice: SpeechSynthesisVoice | null = null; rate = 1; pitch = 1; volume = 1;
      onstart: (() => void) | null = null; onend: (() => void) | null = null;
      onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
      constructor(public text: string) {}
    }
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: Utterance });
    const view = render(<LanguageProvider><VoiceButton message="English summary" language="en" /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Listen" }));
    await waitFor(() => expect(speak).toHaveBeenCalledOnce());
    view.rerender(<LanguageProvider><VoiceButton message="తెలుగు సారాంశం" language="te" /></LanguageProvider>);
    expect(synthesis.cancel).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole("button", { name: "Listen" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Listen" }));
    await waitFor(() => expect(speak).toHaveBeenCalledTimes(2));
    expect((speak.mock.calls[1][0] as Utterance).text).toBe("తెలుగు సారాంశం");
  });
});
