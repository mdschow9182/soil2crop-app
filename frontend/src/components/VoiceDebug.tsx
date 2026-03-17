/**
 * Voice Debug Component
 * Use this to test if voice is working in your browser
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Volume2, VolumeX, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { speakMessage, isSpeechSupported, getIndianVoices, filterIndianVoices } from '@/utils/voiceAssistant';

export const VoiceDebug = () => {
 const [isSpeaking, setIsSpeaking] = useState(false);
 const [allVoicesCount, setAllVoicesCount] = useState(0);
 const [indianVoices, setIndianVoices] = useState<SpeechSynthesisVoice[]>([]);
 const supported = isSpeechSupported();

  useEffect(() => {
    // Load and filter voices
   const loadVoices = () => {
     const allVoices = window.speechSynthesis.getVoices();
      setAllVoicesCount(allVoices.length);
      
     const filtered = getIndianVoices();
      setIndianVoices(filtered);
     console.log('[VoiceDebug] All voices:', allVoices.length);
      console.log('[VoiceDebug] Indian voices:', filtered.length);
      console.log('[VoiceDebug] Filtered voices:');
      filtered.forEach(voice => {
       console.log(`  - ${voice.name} (${voice.lang})`);
      });
    };

   loadVoices();

    // Voices load asynchronously in some browsers
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

 const handleTestEnglish = () => {
    if (!supported) return;
    setIsSpeaking(true);
    speakMessage(
      "Hello! This is a test of the voice guidance system. If you can hear this, voice is working correctly.",
      'en',
      () => setIsSpeaking(false),
      (error) => {
       console.error('[VoiceDebug] Error:', error);
        setIsSpeaking(false);
      }
    );
  };

 const handleTestTelugu = () => {
    if (!supported) return;
    setIsSpeaking(true);
    speakMessage(
      "నమస్కారం! ఇది వాయిస్ గైడెన్స్ సిస్టమ్ పరీక్ష. మీకు ఇది వినిపిస్తే, వాయిస్ సరిగ్గా పనిచేస్తుంది.",
      'te',
      () => setIsSpeaking(false),
      (error) => {
       console.error('[VoiceDebug] Error:', error);
        setIsSpeaking(false);
      }
    );
  };

 const handleTestHindi = () => {
    if (!supported) return;
    setIsSpeaking(true);
    speakMessage(
      "नमस्ते! यह वॉइस गाइडेंस सिस्टम का परीक्षण है। यदि आप इसे सुन सकते हैं, तो वॉइस ठीक से काम कर रहा है।",
      'hi',
      () => setIsSpeaking(false),
      (error) => {
       console.error('[VoiceDebug] Error:', error);
        setIsSpeaking(false);
      }
    );
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {supported ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          🔊 Voice Debug Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Support Status */}
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm font-semibold mb-1">Browser Support:</p>
          <p className={`text-sm ${supported ? 'text-green-600' : 'text-red-600'}`}>
            {supported ? '✅ Speech synthesis is supported' : '❌ Speech synthesis NOT supported'}
          </p>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-muted-foreground">
              Total voices: {allVoicesCount}
            </span>
            <span className="text-green-600 font-semibold">
              🇮🇳 Indian voices: {indianVoices.length}
            </span>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleTestEnglish}
            disabled={!supported || isSpeaking}
            variant="outline"
           size="sm"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Test English
          </Button>
          <Button
            onClick={handleTestTelugu}
            disabled={!supported || isSpeaking}
            variant="outline"
           size="sm"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Test Telugu
          </Button>
          <Button
            onClick={handleTestHindi}
            disabled={!supported || isSpeaking}
            variant="outline"
           size="sm"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Test Hindi
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Voice Filtering Active:
          </p>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Only Indian language voices are displayed (Hindi, Telugu, Tamil, etc.)</li>
            <li>International voices (French, Japanese, German) are filtered out</li>
            <li>Voice automatically selects best match for current app language</li>
            <li>Fallback to English (India) if regional voice not available</li>
          </ul>
        </div>

        {/* Voice List */}
        {indianVoices.length > 0 && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Show filtered Indian voices ({indianVoices.length})
            </summary>
            <div className="mt-2 p-2 rounded bg-muted max-h-40 overflow-y-auto">
              {indianVoices.map((voice, idx) => (
                <div key={idx} className="py-1 border-b last:border-0">
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-muted-foreground ml-2">({voice.lang})</span>
                  {voice.default && <span className="text-blue-600 ml-2">• Default</span>}
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
};
