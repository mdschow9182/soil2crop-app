/**
 * Voice Messages Dictionary
 * Pre-translated voice messages for common farming events
 * Supports: English, Telugu, Hindi
 */

export const voiceMessages = {
  // Soil Report Upload Success
  soilUploadSuccess: {
    en: 'Soil report uploaded successfully. Analyzing your soil data.',
    te: 'మట్టి నివేదిక విజయవంతంగా అప్‌లోడ్ అయింది. మీ మట్టి డేటాను విశ్లేషిస్తున్నాము.',
    hi: 'मिट्टी रिपोर्ट सफलतापूर्वक अपलोड हो गई। आपकी मिट्टी का विश्लेषण कर रहे हैं।'
  },

  // Crop Recommendation Generated
  cropRecommendation: {
    en: 'Based on your soil report, these crops are suitable for your farm.',
    te: 'మీ మట్టి నివేదిక ఆధారంగా, ఈ పంటలు మీ పొలానికి అనుకూలంగా ఉంటాయి.',
    hi: 'आपकी मिट्टी की रिपोर्ट के आधार पर, ये फसलें आपके खेत के लिए उपयुक्त हैं।'
  },

  // Specific Crop Suggestion
  specificCropSuggestion: {
    en: (crop) => `${crop} is recommended for your soil type.`,
    te: (crop) => `మీ మట్టి రకానికి ${crop} సిఫార్సు చేయబడింది.`,
    hi: (crop) => `आपकी मिट्टी के प्रकार के लिए ${crop} की सिफारिश की जाती है।`
  },

  // Alerts Opened
  alertsOpened: {
    en: 'Opening farming alerts and notifications.',
    te: 'వ్యవసాయ హెచ్చరికలు మరియు నోటిఫికేషన్‌లు తెరుస్తోంది.',
    hi: 'खेती अलर्ट और सूचनाएं खोल रहे हैं।'
  },

  // New Alert Available
  newAlert: {
    en: 'You have a new farming alert.',
    te: 'మీకు కొత్త వ్యవసాయ హెచ్చరిక ఉంది.',
    hi: 'आपके पास एक नया कृषि अलर्ट है।'
  },

  // Crop Calendar Displayed
  cropCalendarDisplayed: {
    en: 'Showing crop calendar with weekly farming activities.',
    te: 'వారం వారీ వ్యవసాయ కార్యకలాపాలతో పంట క్యాలెండర్ చూపిస్తున్నాము.',
    hi: 'साप्ताहिक खेती गतिविधियों के साथ फसल कैलेंडर दिखा रहे हैं।'
  },

  // Current Growth Stage
  currentGrowthStage: {
    en: (stage) => `Your crop is in ${stage} stage.`,
    te: (stage) => `మీ పంట ${stage} దశలో ఉంది.`,
    hi: (stage) => `आपकी फसल ${stage} चरण में है।`
  },

  // Market Price Update
  marketPriceUpdate: {
    en: 'Market prices updated for your crops.',
    te: 'మీ పంటలకు మార్కెట్ ధరలు నవీకరించబడ్డాయి.',
    hi: 'आपकी फसलों के लिए बाजार मूल्य अपडेट किए गए।'
  },

  // Price Trend Increasing
  priceIncreasing: {
    en: 'Prices are increasing. Consider selling after a few days.',
    te: 'ధరలు పెరుగుతున్నాయి. కొన్ని రోజుల తర్వాత అమ్మడాన్ని పరిగణించండి.',
    hi: 'कीमतें बढ़ रही हैं। कुछ दिनों बाद बेचने पर विचार करें।'
  },

  // Price Trend Decreasing
  priceDecreasing: {
    en: 'Prices are decreasing. Consider selling soon.',
    te: 'ధరలు తగ్గుతున్నాయి. త్వరగా అమ్మడాన్ని పరిగణించండి.',
    hi: 'कीमतें घट रही हैं। जल्दी बेचने पर विचार करें।'
  },

  // Weather Alert
  weatherAlert: {
    en: 'Weather alert for your region. Please check details.',
    te: 'మీ ప్రాంతానికి వాతావరణ హెచ్చరిక. దయచేసి వివరాలు తనిఖీ చేయండి.',
    hi: 'आपके क्षेत्र के लिए मौसम चेतावनी। कृपया विवरण जांचें।'
  },

  // Government Scheme Available
  schemeAvailable: {
    en: 'New government scheme available for farmers.',
    te: 'రైతులకు కొత్త ప్రభుత్వ పథకం అందుబాటులో ఉంది.',
    hi: 'किसानों के लिए नई सरकारी योजना उपलब्ध है।'
  },

  // Success Message
  success: {
    en: 'Task completed successfully.',
    te: 'పని విజయవంతంగా పూర్తయింది.',
    hi: 'कार्य सफलतापूर्वक पूरा हुआ।'
  },

  // Error Message
  error: {
    en: 'An error occurred. Please try again.',
    te: 'లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
    hi: 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।'
  },

  // Welcome Message
  welcome: {
    en: 'Welcome to Soil2Crop. Your smart farming assistant.',
    te: 'సాయిల్2క్రాప్‌కు స్వాగతం. మీ స్మార్ట్ వ్యవసాయ సహాయకుడు.',
    hi: 'Soil2Crop में आपका स्वागत है। आपका स्मार्ट फार्मिंग सहायक।'
  }
};

/**
 * Get voice message for a specific event
 * @param {string} eventKey - Key from voiceMessages object
 * @param {string} language - Language code (en, te, hi)
 * @param {any} param - Optional parameter for dynamic messages
 * @returns {string} Translated message
 */
export const getVoiceMessage = (eventKey, language = 'en', param = null) => {
  const event = voiceMessages[eventKey];
  
  if (!event) {
    console.warn(`[VoiceMessages] Event "${eventKey}" not found`);
    return '';
  }

  const message = event[language] || event.en;
  
  if (typeof message === 'function') {
    return message(param);
  }
  
  return message;
};

/**
 * Get all voice messages for a category
 * @param {string} category - Category prefix (e.g., 'soil', 'crop', 'market')
 * @returns {Object} Filtered messages object
 */
export const getMessagesByCategory = (category) => {
  const result = {};
  
  Object.entries(voiceMessages).forEach(([key, value]) => {
    if (key.toLowerCase().startsWith(category.toLowerCase())) {
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * Check if a language is supported
 * @param {string} language - Language code to check
 * @returns {boolean} True if supported
 */
export const isLanguageSupported = (language) => {
  const supportedLanguages = ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'bn', 'mr'];
  return supportedLanguages.includes(language);
};

/**
 * Get list of supported languages
 * @returns {Array} Array of supported language codes
 */
export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English' },
    { code: 'te', name: 'Telugu' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' }
  ];
};

export default {
  voiceMessages,
  getVoiceMessage,
  getMessagesByCategory,
  isLanguageSupported,
  getSupportedLanguages
};
