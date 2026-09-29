import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSpeechLanguage, getVoiceSelection, initializeVoices, isSpeechSupported,
  speakMessage, stopSpeech,
} from "./voiceAssistant";

class MockUtterance {
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
  constructor(public text: string) {}
}

const voice = (lang: string, name = `${lang} voice`, options: Partial<SpeechSynthesisVoice> = {}) => ({
  lang, name, voiceURI: name, default: false, localService: false, ...options,
}) as SpeechSynthesisVoice;

const setSpeech = (voices: SpeechSynthesisVoice[]) => {
  const speak = vi.fn();
  const synthesis = { getVoices: () => voices, speak, cancel: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synthesis });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: MockUtterance });
  return { speak, synthesis };
};

const finishUtterance = (speak: ReturnType<typeof vi.fn>, index = 0) => {
  const utterance = speak.mock.calls[index][0] as MockUtterance;
  utterance.onstart?.();
  utterance.onend?.();
  return utterance;
};

afterEach(() => {
  vi.useRealTimers();
  stopSpeech();
  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
});

describe("canonical browser voice service", () => {
  it("maps the six app languages to their requested Indian BCP-47 locales", () => {
    const mappings = { en: "en-IN", te: "te-IN", hi: "hi-IN", ta: "ta-IN", kn: "kn-IN", ml: "ml-IN" };
    Object.entries(mappings).forEach(([language, locale]) => expect(getSpeechLanguage(language)).toBe(locale));
  });

  it("reports supported and unsupported browser speech APIs", () => {
    setSpeech([]);
    expect(isSpeechSupported()).toBe(true);
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: undefined });
    expect(isSpeechSupported()).toBe(false);
  });

  it("selects exact, prefix, then preferred Indian locale voices", () => {
    const exact = voice("te-IN");
    setSpeech([voice("te"), voice("te-AU"), exact]);
    expect(getVoiceSelection("te")).toMatchObject({ voice: exact, actualLanguage: "te-IN", isFallback: false, reason: "exact" });

    const prefix = voice("ta");
    setSpeech([prefix]);
    expect(getVoiceSelection("ta")).toMatchObject({ voice: prefix, actualLanguage: "ta", isFallback: true, reason: "language_prefix" });

    const Indian = voice("hi-IN", "Indian Hindi", { localService: true });
    setSpeech([voice("hi-US", "Hindi other region", { default: true }), Indian]);
    expect(getVoiceSelection("hi").voice).toBe(Indian);
  });

  it("does not fake a regional voice with English when a language voice is absent", () => {
    setSpeech([voice("en-US", "English")]);
    expect(getVoiceSelection("kn")).toMatchObject({ voice: null, actualLanguage: null, isFallback: true, reason: "no_voice_available" });
  });

  it("waits for later voiceschanged events and refreshes the inventory", async () => {
    const te = voice("te-IN");
    let voices: SpeechSynthesisVoice[] = [];
    let changed: (() => void) | undefined;
    const synthesis = {
      getVoices: () => voices, speak: vi.fn(), cancel: vi.fn(),
      addEventListener: (_event: string, listener: () => void) => { changed = listener; },
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synthesis });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: MockUtterance });
    const resultPromise = speakMessage("తెలుగు మాట", "te");
    voices = [te];
    changed?.();
    await vi.waitFor(() => expect(synthesis.speak).toHaveBeenCalledOnce());
    finishUtterance(synthesis.speak);
    await expect(resultPromise).resolves.toMatchObject({ status: "success", actualLanguage: "te-IN" });
    expect(initializeVoices()).toEqual([te]);
  });

  it("returns no_voice after the bounded empty voice wait", async () => {
    vi.useFakeTimers();
    setSpeech([]);
    const resultPromise = speakMessage("Hello", "en");
    await vi.advanceTimersByTimeAsync(2500);
    await expect(resultPromise).resolves.toMatchObject({ status: "no_voice", reason: "voices_unavailable" });
  });

  it("reports success only after start and end events", async () => {
    const { speak } = setSpeech([voice("en-IN")]);
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const resultPromise = speakMessage("This is a Soil2Crop voice test.", "en", onEnd, undefined, onStart);
    await vi.waitFor(() => expect(speak).toHaveBeenCalledOnce());
    expect(onStart).not.toHaveBeenCalled();
    const utterance = speak.mock.calls[0][0] as MockUtterance;
    utterance.onstart?.();
    expect(onStart).toHaveBeenCalledOnce();
    utterance.onend?.();
    expect(onEnd).toHaveBeenCalledOnce();
    await expect(resultPromise).resolves.toMatchObject({ status: "success" });
  });

  it("reports the browser's actual speech error", async () => {
    const { speak } = setSpeech([voice("ta-IN")]);
    const onError = vi.fn();
    const resultPromise = speakMessage("வணக்கம்", "ta", undefined, onError);
    await vi.waitFor(() => expect(speak).toHaveBeenCalledOnce());
    const utterance = speak.mock.calls[0][0] as MockUtterance;
    utterance.onerror?.({ error: "audio-busy" } as SpeechSynthesisErrorEvent);
    await expect(resultPromise).resolves.toMatchObject({ status: "error", error: "audio-busy" });
    expect(onError).toHaveBeenCalledOnce();
  });

  it("returns a speech error when the browser rejects speak() synchronously", async () => {
    const { speak, synthesis } = setSpeech([voice("en-IN")]);
    speak.mockImplementation(() => { throw new Error("system denied playback"); });
    await expect(speakMessage("English test", "en")).resolves.toMatchObject({
      status: "error", reason: "speech_error", error: "system denied playback",
    });
    expect(synthesis.cancel).toHaveBeenCalledOnce();
  });

  it("fails clearly if the engine ends without a start event", async () => {
    const { speak } = setSpeech([voice("en-IN")]);
    const resultPromise = speakMessage("English test", "en");
    await vi.waitFor(() => expect(speak).toHaveBeenCalledOnce());
    (speak.mock.calls[0][0] as MockUtterance).onend?.();
    await expect(resultPromise).resolves.toMatchObject({ status: "error", reason: "speech_ended_without_start_event" });
  });

  it("rejects empty text without calling system speech", async () => {
    const { speak } = setSpeech([voice("en-IN")]);
    await expect(speakMessage("  ", "en")).resolves.toMatchObject({ status: "failure", reason: "empty_text" });
    expect(speak).not.toHaveBeenCalled();
  });

  it("splits long text into sequential chunks and stops the entire queue", async () => {
    const { speak } = setSpeech([voice("en-IN")]);
    const longText = `${"Sentence one. ".repeat(150)}Tail.`;
    const resultPromise = speakMessage(longText, "en");
    await vi.waitFor(() => expect(speak).toHaveBeenCalledOnce());
    const first = finishUtterance(speak, 0);
    await vi.waitFor(() => expect(speak).toHaveBeenCalledTimes(2));
    expect(first.text.length).toBeLessThanOrEqual(1200);
    stopSpeech();
    await expect(resultPromise).resolves.toMatchObject({ status: "cancelled" });
  });

  it("ignores cancellation callbacks from speech that is no longer current", async () => {
    const { speak } = setSpeech([voice("hi-IN")]);
    const onError = vi.fn();
    const resultPromise = speakMessage("नमस्ते", "hi", undefined, onError);
    await vi.waitFor(() => expect(speak).toHaveBeenCalledOnce());
    const utterance = speak.mock.calls[0][0] as MockUtterance;
    stopSpeech();
    utterance.onerror?.({ error: "canceled" } as SpeechSynthesisErrorEvent);
    await expect(resultPromise).resolves.toMatchObject({ status: "cancelled" });
    expect(onError).not.toHaveBeenCalled();
  });
});
