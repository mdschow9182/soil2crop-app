/** One browser speech service for every Soil2Crop screen. */

const LOCALES: Record<string, string> = {
  en: "en-IN", te: "te-IN", hi: "hi-IN", ta: "ta-IN", kn: "kn-IN", ml: "ml-IN",
  bn: "bn-IN", mr: "mr-IN",
};

export type SpeechStatus = "success" | "failure" | "unsupported" | "no_voice" | "cancelled" | "error";
export type VoiceSelection = {
  voice: SpeechSynthesisVoice | null;
  requestedLanguage: string;
  actualLanguage: string | null;
  isFallback: boolean;
  reason: string;
};
export type SpeechResult = VoiceSelection & { status: SpeechStatus; error?: string };
type SpeechCallbacks = { onStart?: () => void; onEnd?: () => void; onError?: (error: unknown) => void; onCancel?: () => void };
type SpeechJob = {
  generation: number;
  chunks: string[];
  index: number;
  selection: VoiceSelection;
  callbacks: SpeechCallbacks;
  resolve: (result: SpeechResult) => void;
  started: boolean;
  timer?: number;
  utterance?: SpeechSynthesisUtterance;
};

const INDIAN_LANGUAGES = ["en-IN", "hi-IN", "te-IN", "ta-IN", "kn-IN", "ml-IN", "bn-IN", "mr-IN"];
const MAX_CHUNK_LENGTH = 1200;
const START_TIMEOUT_MS = 12000;
let activeSynthesis: SpeechSynthesis | null = null;
let voiceChangeListener: (() => void) | null = null;
let previousVoiceChangeHandler: ((event: Event) => void) | null = null;
let assignedVoiceChangeHandler: ((event: Event) => void) | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let speechGeneration = 0;
let activeJob: SpeechJob | null = null;
const voiceSubscribers = new Set<(voices: SpeechSynthesisVoice[]) => void>();

export const getSpeechLanguage = (language: string): string => LOCALES[language] || "en-IN";

export const isSpeechSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return typeof window.speechSynthesis?.speak === "function" && typeof SpeechSynthesisUtterance !== "undefined";
  } catch {
    return false;
  }
};

const refreshVoiceList = (): SpeechSynthesisVoice[] => {
  if (typeof window === "undefined" || !window.speechSynthesis?.getVoices) return [];
  try {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  } catch {
    cachedVoices = [];
  }
  voiceSubscribers.forEach((subscriber) => subscriber(cachedVoices.slice()));
  return cachedVoices;
};

export const subscribeToVoiceChanges = (subscriber: (voices: SpeechSynthesisVoice[]) => void) => {
  voiceSubscribers.add(subscriber);
  return () => voiceSubscribers.delete(subscriber);
};

/** Idempotently installs one listener per current SpeechSynthesis instance. */
export const initializeVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === "undefined" || !window.speechSynthesis?.getVoices) return [];
  const synthesis = window.speechSynthesis;
  if (activeSynthesis !== synthesis) {
    if (activeSynthesis && voiceChangeListener) {
      activeSynthesis.removeEventListener?.("voiceschanged", voiceChangeListener);
      if (activeSynthesis.onvoiceschanged === assignedVoiceChangeHandler) {
        activeSynthesis.onvoiceschanged = previousVoiceChangeHandler;
      }
    }
    voiceChangeListener = () => refreshVoiceList();
    previousVoiceChangeHandler = synthesis.onvoiceschanged;
    if (typeof synthesis.addEventListener === "function") {
      synthesis.addEventListener("voiceschanged", voiceChangeListener);
    } else {
      assignedVoiceChangeHandler = (event) => {
        previousVoiceChangeHandler?.call(synthesis, event);
        voiceChangeListener?.();
      };
      synthesis.onvoiceschanged = assignedVoiceChangeHandler;
    }
    activeSynthesis = synthesis;
  }
  return refreshVoiceList();
};

export const getAllVoices = (): SpeechSynthesisVoice[] => initializeVoices().slice();

const waitForVoices = (timeoutMs = 2500): Promise<SpeechSynthesisVoice[]> => new Promise((resolve) => {
  const initial = initializeVoices();
  if (initial.length || typeof window === "undefined") return resolve(initial);
  let settled = false;
  let poll: number | undefined;
  let timeout: number | undefined;
  const unsubscribe = subscribeToVoiceChanges((voices) => {
    if (voices.length) finish(voices);
  });
  const finish = (voices: SpeechSynthesisVoice[]) => {
    if (settled) return;
    settled = true;
    if (poll !== undefined) window.clearInterval(poll);
    if (timeout !== undefined) window.clearTimeout(timeout);
    unsubscribe();
    resolve(voices);
  };
  // Some engines populate voices but never dispatch voiceschanged. Poll only during this bounded wait.
  poll = window.setInterval(() => {
    const voices = refreshVoiceList();
    if (voices.length) finish(voices);
  }, 100);
  timeout = window.setTimeout(() => finish(refreshVoiceList()), timeoutMs);
});

export const filterIndianVoices = (voices: SpeechSynthesisVoice[]) => voices.filter((voice) =>
  INDIAN_LANGUAGES.some((locale) => {
    const prefix = locale.split("-")[0].toLowerCase();
    const actual = voice.lang.toLowerCase();
    return prefix === "en" ? actual.startsWith("en-in") : actual === prefix || actual.startsWith(`${prefix}-`);
  }),
);

export const getIndianVoices = () => filterIndianVoices(initializeVoices());

export const getVoiceSelection = (language: string): VoiceSelection => {
  const requestedLanguage = getSpeechLanguage(language);
  if (!isSpeechSupported()) return { voice: null, requestedLanguage, actualLanguage: null, isFallback: true, reason: "speech_unavailable" };
  const voices = initializeVoices();
  if (!voices.length) return { voice: null, requestedLanguage, actualLanguage: null, isFallback: true, reason: "voices_not_loaded" };

  const target = requestedLanguage.toLowerCase();
  const prefix = target.split("-")[0];
  const sameLanguage = voices.filter((voice) => voice.lang.toLowerCase() === prefix || voice.lang.toLowerCase().startsWith(`${prefix}-`));
  const exact = sameLanguage.find((voice) => voice.lang.toLowerCase() === target);
  const indian = sameLanguage.filter((voice) => /-in(?:-|$)/i.test(voice.lang));
  const regional = indian.find((voice) => voice.default || voice.localService) || indian[0];
  const voice = exact || regional || sameLanguage.find((candidate) => candidate.default || candidate.localService) || sameLanguage[0] || null;
  const reason = !voice ? "no_voice_available" : exact ? "exact" : regional ? "indian_locale_match" : "language_prefix";
  return {
    voice,
    requestedLanguage,
    actualLanguage: voice?.lang || null,
    isFallback: !voice || voice.lang.toLowerCase() !== target,
    reason,
  };
};

export const getVoiceByLanguage = (language: string) => getVoiceSelection(language).voice;

const splitSpeechText = (text: string): string[] => {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > MAX_CHUNK_LENGTH) {
    const windowed = remaining.slice(0, MAX_CHUNK_LENGTH + 1);
    const sentenceBreak = Math.max(windowed.lastIndexOf(". "), windowed.lastIndexOf("? "), windowed.lastIndexOf("! "));
    const wordBreak = windowed.lastIndexOf(" ");
    const cut = sentenceBreak > MAX_CHUNK_LENGTH * 0.45 ? sentenceBreak + 1 : wordBreak > 0 ? wordBreak : MAX_CHUNK_LENGTH;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
};

const settleJob = (job: SpeechJob, result: SpeechResult) => {
  if (activeJob !== job) return;
  if (job.timer !== undefined) window.clearTimeout(job.timer);
  if (job.utterance) {
    job.utterance.onstart = null;
    job.utterance.onend = null;
    job.utterance.onerror = null;
  }
  activeJob = null;
  if (result.status === "cancelled") job.callbacks.onCancel?.();
  job.resolve(result);
};

const speakChunk = (job: SpeechJob) => {
  if (activeJob !== job || job.generation !== speechGeneration) return;
  if (job.index >= job.chunks.length) {
    job.callbacks.onEnd?.();
    settleJob(job, { ...job.selection, status: "success" });
    return;
  }
  try {
    const utterance = new SpeechSynthesisUtterance(job.chunks[job.index]);
    let chunkStarted = false;
    job.started = false;
    job.utterance = utterance;
    utterance.voice = job.selection.voice;
    utterance.lang = job.selection.voice?.lang || job.selection.requestedLanguage;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      if (activeJob !== job) return;
      chunkStarted = true;
      job.started = true;
      if (job.timer !== undefined) window.clearTimeout(job.timer);
      job.timer = window.setTimeout(() => {
        if (activeJob !== job) return;
        const error = "speech_timeout";
        job.callbacks.onError?.(new Error(error));
        settleJob(job, { ...job.selection, status: "error", reason: error, error });
        try { window.speechSynthesis.cancel(); } catch { /* Ignore secondary browser failures. */ }
      }, START_TIMEOUT_MS);
      job.callbacks.onStart?.();
    };
    utterance.onend = () => {
      if (activeJob !== job) return;
      if (job.timer !== undefined) window.clearTimeout(job.timer);
      if (!chunkStarted) {
        const error = "speech_ended_without_start_event";
        job.callbacks.onError?.(new Error(error));
        settleJob(job, { ...job.selection, status: "error", reason: error, error });
        return;
      }
      job.index += 1;
      speakChunk(job);
    };
    utterance.onerror = (event) => {
      if (activeJob !== job) return;
      const error = event.error || "speech_error";
      job.callbacks.onError?.(event);
      settleJob(job, { ...job.selection, status: "error", reason: "speech_error", error });
    };
    job.timer = window.setTimeout(() => {
      if (activeJob !== job) return;
      const error = job.started ? "speech_timeout" : "speech_start_timeout";
      const event = new Error(error);
      job.callbacks.onError?.(event);
      settleJob(job, { ...job.selection, status: "error", reason: error, error });
      try { window.speechSynthesis.cancel(); } catch { /* Ignore secondary browser failures. */ }
    }, START_TIMEOUT_MS);
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    job.callbacks.onError?.(error);
    settleJob(job, { ...job.selection, status: "error", reason: "speech_error", error: error instanceof Error ? error.message : String(error) });
  }
};

/** Speaks only the supplied, already-localized text. A regional voice is never faked. */
export const speakMessage = async (
  message: string,
  language: string,
  onEnd?: () => void,
  onError?: (error: unknown) => void,
  onStart?: () => void,
  requestedVoice?: SpeechSynthesisVoice,
  onCancel?: () => void,
): Promise<SpeechResult> => {
  if (!message?.trim()) {
    const selection = getVoiceSelection(language);
    return { ...selection, status: "failure", reason: "empty_text", error: "empty_text" };
  }
  if (!isSpeechSupported()) {
    const selection = getVoiceSelection(language);
    return { ...selection, status: "unsupported", reason: "speech_unavailable" };
  }
  stopSpeech();
  const generation = speechGeneration;
  const voices = await waitForVoices();
  if (generation !== speechGeneration) {
    const selection = getVoiceSelection(language);
    return { ...selection, status: "cancelled", reason: "cancelled" };
  }
  const normalSelection = getVoiceSelection(language);
  const selection: VoiceSelection = requestedVoice
    ? { voice: requestedVoice, requestedLanguage: requestedVoice.lang, actualLanguage: requestedVoice.lang, isFallback: false, reason: "explicit_voice_test" }
    : normalSelection;
  if (requestedVoice && !voices.some((voice) => voice.voiceURI === requestedVoice.voiceURI)) {
    return { ...selection, voice: null, actualLanguage: null, isFallback: true, status: "no_voice", reason: "voice_no_longer_available" };
  }
  if (!voices.length || !selection.voice) {
    const result: SpeechResult = { ...selection, status: "no_voice", reason: voices.length ? "no_voice_available" : "voices_unavailable" };
    onError?.(new Error(result.reason));
    return result;
  }
  return new Promise((resolve) => {
    const job: SpeechJob = {
      generation,
      chunks: splitSpeechText(message.trim()),
      index: 0,
      selection,
      callbacks: { onStart, onEnd, onError, onCancel },
      resolve,
      started: false,
    };
    activeJob = job;
    speakChunk(job);
  });
};

/** All cancellation, including queued long-text chunks, goes through this method. */
export const stopSpeech = () => {
  speechGeneration += 1;
  const job = activeJob;
  if (job) settleJob(job, { ...job.selection, status: "cancelled", reason: "cancelled" });
  if (isSpeechSupported()) {
    try { window.speechSynthesis.cancel(); } catch { /* Browser speech implementation is unavailable. */ }
  }
};

export const stopSpeaking = stopSpeech;

/** Compatibility API; it now uses the same cancellation and utterance lifecycle. */
export const queueMessage = (message: string, language: string) => speakMessage(message, language);

export const cleanupVoiceInitialization = () => {
  stopSpeech();
  if (activeSynthesis && voiceChangeListener) {
    activeSynthesis.removeEventListener?.("voiceschanged", voiceChangeListener);
    if (activeSynthesis.onvoiceschanged === assignedVoiceChangeHandler) activeSynthesis.onvoiceschanged = previousVoiceChangeHandler;
  }
  activeSynthesis = null;
  voiceChangeListener = null;
  previousVoiceChangeHandler = null;
  assignedVoiceChangeHandler = null;
  cachedVoices = [];
  voiceSubscribers.clear();
};

export const pauseSpeech = () => { if (isSpeechSupported()) window.speechSynthesis.pause(); };
export const resumeSpeech = () => { if (isSpeechSupported() && window.speechSynthesis.paused) window.speechSynthesis.resume(); };
export const getAvailableVoicesList = () => isSpeechSupported() ? getIndianVoices().map((voice) => ({
  name: voice.name, lang: voice.lang, default: voice.default, localService: voice.localService,
})) : [];

export default {
  speakMessage, queueMessage, stopSpeech, stopSpeaking, pauseSpeech, resumeSpeech,
  isSpeechSupported, getSpeechLanguage, getVoiceByLanguage, getVoiceSelection,
  getIndianVoices, filterIndianVoices, getAvailableVoicesList,
};
