/**
 * Voice Assistant Utility
 * Browser-based text-to-speech for multi-language farming assistance
 * 
 * Supports: English (en-IN), Telugu (te-IN), Hindi (hi-IN)
 */

// Allowed Indian language codes
const INDIAN_LANGUAGES = [
  'en-IN',    // English (India)
  'hi-IN',    // Hindi
  'te-IN',    // Telugu
  'ta-IN',    // Tamil
  'kn-IN',    // Kannada
  'ml-IN',    // Malayalam
  'bn-IN',    // Bengali
  'mr-IN'     // Marathi
];

/**
 * Map app language codes to speech synthesis language codes
 */
export const getSpeechLanguage = (appLanguage) => {
  const languageMap = {
    'en': 'en-IN',
    'te': 'te-IN',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'bn': 'bn-IN',
    'mr': 'mr-IN'
  };
  
  return languageMap[appLanguage] || 'en-IN';
};

/**
 * Initialize voices - browsers load them asynchronously
 * Call this once when app starts or component mounts
 */
export const initializeVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  // Trigger voice loading
  window.speechSynthesis.getVoices();
  
  // Listen for voice changes (voices loaded asynchronously)
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log(`[VoiceAssistant] Voices loaded: ${voices.length} total`);
    };
  }
  
  return getIndianVoices();
};

/**
 * Filter voices to only show Indian regional languages
 */
export const filterIndianVoices = (voices) => {
  return voices.filter(voice => 
    INDIAN_LANGUAGES.some(lang => voice.lang.startsWith(lang.split('-')[0]))
  );
};

/**
 * Get only Indian language voices from the browser
 */
export const getIndianVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  
  const allVoices = window.speechSynthesis.getVoices();
  const indianVoices = filterIndianVoices(allVoices);
  
  console.log(`[VoiceAssistant] Found ${indianVoices.length} Indian voices out of ${allVoices.length} total voices`);
  
  return indianVoices;
};

/**
 * Get the best voice for a specific language with 5-level fallback
 */
export const getVoiceByLanguage = (language) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const targetLang = getSpeechLanguage(language);
  const indianVoices = getIndianVoices();
  
  // Priority 1: Exact language match
  let selectedVoice = indianVoices.find(voice => voice.lang === targetLang);
  
  if (selectedVoice) {
    console.log(`[VoiceAssistant] Found exact match for ${targetLang}: ${selectedVoice.name}`);
    return selectedVoice;
  }
  
  // Priority 2: Same language family
  const langFamily = targetLang.split('-')[0];
  selectedVoice = indianVoices.find(voice => voice.lang.startsWith(langFamily));
  
  if (selectedVoice) {
    console.log(`[VoiceAssistant] Found related voice for ${langFamily}: ${selectedVoice.name}`);
    return selectedVoice;
  }
  
  // Priority 3: Fallback to English (India)
  if (targetLang !== 'en-IN') {
    selectedVoice = indianVoices.find(voice => voice.lang === 'en-IN');
    if (selectedVoice) {
      console.log(`[VoiceAssistant] Using English (India) fallback: ${selectedVoice.name}`);
      return selectedVoice;
    }
  }
  
  // Priority 4: Any Indian voice
  if (indianVoices.length > 0) {
    selectedVoice = indianVoices[0];
    console.log(`[VoiceAssistant] Using first available Indian voice: ${selectedVoice.name}`);
    return selectedVoice;
  }
  
  // Priority 5: Last resort - any browser voice
  const allVoices = window.speechSynthesis.getVoices();
  selectedVoice = allVoices.find(voice => voice.default) || allVoices[0];
  
  if (selectedVoice) {
    console.warn(`[VoiceAssistant] No Indian voice found, using: ${selectedVoice.name} (${selectedVoice.lang})`);
    return selectedVoice;
  }
  
  console.error('[VoiceAssistant] No voices available in browser');
  return null;
};

/**
 * Check if speech synthesis is supported
 */
export const isSpeechSupported = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'speechSynthesis' in window;
};

/**
 * Speak a message using browser SpeechSynthesis API
 * @param {string} message - Text to speak
 * @param {string} language - Language code (en, te, hi, etc.)
 * @param {Function} onEnd - Callback when speech ends
 * @param {Function} onError - Callback when speech error occurs
 */
export const speakMessage = (message, language, onEnd, onError) => {
  if (!isSpeechSupported()) {
    console.warn('[VoiceAssistant] Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  
  // Get best voice for the language
  const selectedVoice = getVoiceByLanguage(language);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  // Set language
  utterance.lang = getSpeechLanguage(language);
  
  // Configure speech parameters
  utterance.rate = 0.9;    // Slightly slower for clarity
  utterance.pitch = 1.0;   // Normal pitch
  utterance.volume = 1.0;  // Full volume

  // Event handlers
  utterance.onend = () => {
    console.log('[VoiceAssistant] Speech completed');
    if (onEnd) onEnd();
  };

  utterance.onerror = (event) => {
    console.error('[VoiceAssistant] Speech synthesis error:', event);
    if (onError) onError(event);
  };

  // Start speaking
  console.log(`[VoiceAssistant] Speaking: "${message}" in ${utterance.lang}`);
  window.speechSynthesis.speak(utterance);
};

/**
 * Speak a message without interrupting current speech
 * Queues the message to be spoken after current speech completes
 */
export const queueMessage = (message, language) => {
  if (!isSpeechSupported()) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  const selectedVoice = getVoiceByLanguage(language);
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  utterance.lang = getSpeechLanguage(language);
  utterance.rate = 0.9;
  
  window.speechSynthesis.speak(utterance);
};

/**
 * Stop current speech
 */
export const stopSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
    console.log('[VoiceAssistant] Speech stopped');
  }
};

/**
 * Pause current speech
 */
export const pauseSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
    console.log('[VoiceAssistant] Speech paused');
  }
};

/**
 * Resume paused speech
 */
export const resumeSpeech = () => {
  if (isSpeechSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    console.log('[VoiceAssistant] Speech resumed');
  }
};

/**
 * Get list of available Indian voices
 */
export const getAvailableVoicesList = () => {
  if (!isSpeechSupported()) {
    return [];
  }
  
  const voices = getIndianVoices();
  return voices.map(voice => ({
    name: voice.name,
    lang: voice.lang,
    default: voice.default,
    localService: voice.localService
  }));
};

export default {
  speakMessage,
  queueMessage,
  stopSpeech,
  pauseSpeech,
  resumeSpeech,
  isSpeechSupported,
  getSpeechLanguage,
  getVoiceByLanguage,
  getIndianVoices,
  filterIndianVoices,
  getAvailableVoicesList
};
