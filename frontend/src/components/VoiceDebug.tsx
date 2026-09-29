import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { supportedLanguages, translate, translationCoverage, translations, type LanguageCode } from "@/i18n/translations";
import {
  getAllVoices, getSpeechLanguage, getVoiceSelection, initializeVoices, isSpeechSupported,
  speakMessage, stopSpeech, subscribeToVoiceChanges,
} from "@/utils/voiceAssistant";

const translationRows = [
  ["common.home", "dashboard"], ["common.soilReport", "navSoilReport"],
  ["common.cropAdvice", "navCropAdvice"], ["common.fertilizer", "fertilizerAdvisory"],
  ["common.irrigation", "irrigationAdvisory"], ["common.cropCalendar", "cropCalendar"],
  ["common.listen", "voiceListen"],
] as const;

const localizedVoiceSentences: Record<LanguageCode, string> = {
  en: "This is a Soil2Crop voice test.",
  te: "ఇది సాయిల్2క్రాప్ వాయిస్ పరీక్ష.",
  hi: "यह सॉइल2क्रॉप की आवाज़ की जाँच है।",
  ta: "இது சாயில்2கிராப் குரல் சோதனை.",
  kn: "ಇದು ಸಾಯಿಲ್2ಕ್ರಾಪ್ ಧ್ವನಿ ಪರೀಕ್ಷೆ.",
  ml: "ഇത് സോയിൽ2ക്രോപ്പ് ശബ്ദ പരിശോധനയാണ്.",
};

export const VoiceDebug = () => {
  const { language } = useLanguage();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testing, setTesting] = useState(false);
  const [lastSpeechError, setLastSpeechError] = useState("");
  const [speechEvent, setSpeechEvent] = useState("idle");
  const [testResult, setTestResult] = useState("not tested");
  const [testSelection, setTestSelection] = useState<{ name: string; locale: string } | null>(null);
  const [englishTestPassed, setEnglishTestPassed] = useState(false);
  const [languageTestResults, setLanguageTestResults] = useState<Partial<Record<LanguageCode, string>>>({});
  const [selectedVoices, setSelectedVoices] = useState(() => Object.fromEntries(
    supportedLanguages.map(({ code }) => [code, {
      voice: null,
      requestedLanguage: getSpeechLanguage(code),
      actualLanguage: null,
      isFallback: true,
      reason: "voices_not_loaded",
    }]),
  ) as Record<LanguageCode, ReturnType<typeof getVoiceSelection>>);
  const supported = isSpeechSupported();
  const userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const browserName = /Edg\//.test(userAgent) ? "Microsoft Edge"
    : /Firefox\//.test(userAgent) ? "Firefox"
      : /Chrome\//.test(userAgent) ? "Google Chrome"
        : /Safari\//.test(userAgent) ? "Safari" : "Unknown browser";
  const platformName = typeof navigator === "undefined" ? "Unavailable" : navigator.platform || "Unknown platform";

  useEffect(() => {
    const refresh = (nextVoices?: SpeechSynthesisVoice[]) => {
      const fresh = nextVoices || getAllVoices();
      setVoices((current) => current.length === fresh.length && current.every((voice, index) => {
        const next = fresh[index];
        return voice.voiceURI === next.voiceURI && voice.name === next.name && voice.lang === next.lang
          && voice.default === next.default && voice.localService === next.localService;
      }) ? current : fresh);
    };
    refresh(initializeVoices());
    return subscribeToVoiceChanges(refresh);
  }, []);

  useEffect(() => {
    setSelectedVoices(Object.fromEntries(
      supportedLanguages.map(({ code }) => [code, getVoiceSelection(code)]),
    ) as Record<LanguageCode, ReturnType<typeof getVoiceSelection>>);
  }, [voices]);
  const voiceCounts = useMemo(() => Object.fromEntries(
    supportedLanguages.map(({ code }) => [code,
      voices.filter((voice) => voice.lang.toLowerCase().startsWith(`${code}-`) || voice.lang.toLowerCase() === code).length]),
  ) as Record<LanguageCode, number>, [voices]);

  const runTest = async (code: LanguageCode, voice?: SpeechSynthesisVoice) => {
    setTesting(true);
    setLastSpeechError("");
    setSpeechEvent("waiting for start");
    setTestResult("pending");
    const selection = voice ? { voice, actualLanguage: voice.lang } : selectedVoices[code];
    setTestSelection(selection.voice ? { name: selection.voice.name, locale: selection.actualLanguage || selection.voice.lang } : null);
    try {
      const result = await speakMessage(
        voice ? "This is a Soil2Crop system voice test." : localizedVoiceSentences[code],
        code,
        () => { setSpeechEvent("ended"); },
        (error) => {
          const detail = typeof error === "object" && error && "error" in error
            ? String(error.error) : error instanceof Error ? error.message : String(error);
          setLastSpeechError(detail);
          setSpeechEvent(`error: ${detail}`);
        },
        () => setSpeechEvent("started"),
        voice,
      );
      const resultLabel = result.status === "success" ? "ended successfully" : `${result.status}: ${result.reason}`;
      setTestResult(resultLabel);
      if (!voice) setLanguageTestResults((current) => ({ ...current, [code]: resultLabel }));
      if (!voice && code === "en") setEnglishTestPassed(result.status === "success");
      if (result.status === "no_voice") {
        const languageName = supportedLanguages.find((item) => item.code === code)?.name || code;
        setLastSpeechError(`${languageName} voice is not installed/available on this device.`);
      } else if (result.status !== "success") {
        setLastSpeechError(result.error || result.reason);
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setLastSpeechError(detail);
      setSpeechEvent(`error: ${detail}`);
      setTestResult("error");
      if (!voice) setLanguageTestResults((current) => ({ ...current, [code]: `error: ${detail}` }));
    } finally {
      setTesting(false);
    }
  };

  const selected = selectedVoices[language];
  return (
    <main className="mx-auto max-w-5xl space-y-5 p-4 pb-24" data-testid="locale-voice-diagnostics">
      <header>
        <h1 className="text-2xl font-bold">Voice Assistance Diagnostics</h1>
        <p className="text-sm font-medium">Development-only diagnostic page</p>
        <p className="text-sm text-muted-foreground">A test is successful only after the browser reports speech ended. This page cannot establish real device behavior from automated tests.</p>
        <p className="text-sm"><strong>Browser:</strong> {browserName} <span aria-hidden="true">·</span> <strong>Platform:</strong> {platformName}</p>
      </header>

      <Card>
        <CardHeader><CardTitle>English system voice test</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p><strong>Speech synthesis supported:</strong> {supported ? "YES" : "NO"}</p>
          <p><strong>Voices loaded:</strong> {voices.length ? "YES" : "NO"}</p>
          <p><strong>Total voices:</strong> {voices.length}</p>
          <p><strong>Selected English voice:</strong> {selectedVoices.en.voice?.name || "No English voice available"}</p>
          <p><strong>Selected voice language:</strong> {selectedVoices.en.actualLanguage || "Unavailable"}</p>
          <p><strong>Speech event:</strong> {speechEvent}</p>
          <p><strong>Result:</strong> {testResult}</p>
          <p><strong>Regional and per-voice tests:</strong> {englishTestPassed ? "Enabled after English completed" : "Run and complete the English test first"}</p>
          <p><strong>Last speech error:</strong> {lastSpeechError || "None"}</p>
          <Button className="sm:col-span-2" disabled={!supported || testing} onClick={() => void runTest("en")}>
            Test English system voice: “This is a Soil2Crop voice test.”
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Translation test (KEY / EXPECTED / ACTUAL)</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead><tr><th className="border p-2">KEY</th><th className="border p-2">EXPECTED</th><th className="border p-2">ACTUAL</th><th className="border p-2">STATUS</th></tr></thead>
            <tbody>{supportedLanguages.flatMap((locale) => translationRows.map(([displayKey, key]) => {
              const missing = translationCoverage[locale.code].includes(key);
              return <tr key={`${locale.code}-${key}`}>
                <td className="border p-2 font-mono">{displayKey}</td>
                <td className="border p-2">{translations[locale.code][key]}</td>
                <td className="border p-2">{translate(locale.code, key)}</td>
                <td className={`border p-2 font-semibold ${missing ? "text-destructive" : "text-green-700"}`}>{missing ? "MISSING — English fallback" : "TRANSLATED"}</td>
              </tr>;
            }))}</tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Language voice tests</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {supportedLanguages.map(({ code, name }) => {
            const chosen = selectedVoices[code];
            return <div className="flex flex-wrap items-center justify-between gap-3 rounded border p-3" key={code}>
              <div className="min-w-48 text-sm">
                <p className="font-semibold">{name} — requested {getSpeechLanguage(code)}</p>
                <p>Available voices: {voiceCounts[code]}</p>
                <p>Selected: {chosen.voice?.name || `${name} voice is not installed/available on this device.`}</p>
                <p>Actual locale: {chosen.actualLanguage || "Unavailable"}</p>
                <p>Test result: {languageTestResults[code] || "Not tested"}</p>
              </div>
              <Button variant="outline" disabled={!supported || testing || !chosen.voice || (code !== "en" && !englishTestPassed)} onClick={() => void runTest(code)}>
                Test {name}
              </Button>
            </div>;
          })}
          {testSelection && <p className="text-sm"><strong>Last selected voice:</strong> {testSelection.name} ({testSelection.locale})</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Every browser/device system voice</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" disabled={testing} onClick={() => setVoices(initializeVoices())}>Refresh voice list</Button>
          <div className="max-h-[34rem] overflow-auto rounded border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-background"><tr><th className="p-2">Voice name</th><th className="p-2">Locale</th><th className="p-2">Default</th><th className="p-2">Local service</th><th className="p-2">Test</th></tr></thead>
              <tbody>{voices.map((voice, index) => <tr className="border-t" key={`${voice.voiceURI}-${index}`}>
                <td className="p-2">{voice.name}</td><td className="p-2">{voice.lang}</td><td className="p-2">{voice.default ? "YES" : "NO"}</td>
                <td className="p-2">{"localService" in voice ? (voice.localService ? "YES" : "NO") : "Unknown"}</td>
                <td className="p-2"><Button size="sm" variant="outline" disabled={!supported || testing || !englishTestPassed} onClick={() => void runTest(language, voice)}>Test Voice</Button></td>
              </tr>)}</tbody>
            </table>
            {!voices.length && <p className="p-3 text-sm text-muted-foreground">No browser voices are currently exposed. Use Refresh voice list after the device voice services finish loading.</p>}
          </div>
          {testing && <Button variant="destructive" onClick={() => { stopSpeech(); setTesting(false); setSpeechEvent("cancelled"); setTestResult("cancelled"); }}>Stop</Button>}
        </CardContent>
      </Card>
    </main>
  );
};

export default VoiceDebug;
