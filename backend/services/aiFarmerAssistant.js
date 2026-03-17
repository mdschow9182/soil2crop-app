/**
 * AI Farmer Assistant Service
 * Rule-based Q&A system for common farming queries
 */

class AIFarmerAssistant {
  constructor() {
    this.commonQueries = this.initializeCommonQueries();
  }

  /**
   * Initialize common queries database
   */
  initializeCommonQueries() {
    return {
      // Crop-related queries
      "crop rotation": {
        keywords: ["rotation", "rotate", "alternate", "sequence"],
        response: "🔄 **Crop Rotation Benefits:**\n\n• Improves soil health and fertility\n• Breaks pest and disease cycles\n• Reduces soil erosion\n• Increases crop yields\n\n**Recommended Rotation Pattern:**\n1. Legumes (pulses, groundnut) → Fix nitrogen\n2. Cereals (rice, maize) → Use stored nitrogen\n3. Root crops → Break compacted soil\n\n**Example:** Rice → Groundnut → Maize → Vegetables",
        confidence: 0.95
      },
      
      "best time to plant": {
        keywords: ["when to plant", "sowing time", "planting season", "best time"],
        response: "🌱 **Optimal Planting Times:**\n\n**Kharif Season (June-October):**\n• Rice: June-July (with monsoon onset)\n• Maize: June-July\n• Cotton: May-June\n• Groundnut: May-June\n\n**Rabi Season (November-April):**\n• Wheat: November-December\n• Mustard: October-November\n• Chickpea: October-November\n• Sunflower: November-December\n\n**Tip:** Always check local weather forecast and soil moisture before planting.",
        confidence: 0.95
      },
      
      "pest control": {
        keywords: ["pest", "insect", "bug", "infestation"],
        response: "🐛 **Integrated Pest Management:**\n\n**Natural Methods:**\n1. Neem oil spray (5ml/liter water)\n2. Garlic-chilli solution\n3. Beneficial insects (ladybugs, praying mantis)\n4. Crop rotation\n\n**Chemical Control (Last Resort):**\n• Use recommended pesticides only\n• Follow safety precautions\n• Observe pre-harvest intervals\n\n**Prevention:**\n• Healthy soil = resistant plants\n• Proper spacing for air circulation\n• Regular field monitoring",
        confidence: 0.9
      },
      
      "water management": {
        keywords: ["water", "irrigation", "drought", "dry"],
        response: "💧 **Smart Water Management:**\n\n**Irrigation Methods:**\n1. Drip irrigation (saves 40-60% water)\n2. Sprinkler system\n3. Flood irrigation (least efficient)\n\n**Water Conservation:**\n• Mulching (reduces evaporation)\n• Contour bunding\n• Rainwater harvesting\n• Cover crops\n\n**Signs of Water Stress:**\n• Wilting leaves\n• Yellowing\n• Stunted growth\n\n**Critical Growth Stages:**\n• Flowering stage - most critical\n• Grain filling stage\n• Early vegetative stage",
        confidence: 0.9
      },
      
      "fertilizer": {
        keywords: ["fertilizer", "manure", "nutrient", "NPK"],
        response: "🌿 **Fertilizer Management:**\n\n**NPK Ratio by Crop:**\n• Rice: 80:40:40 (N:P₂O₅:K₂O) kg/ha\n• Wheat: 120:60:40 kg/ha\n• Maize: 100:50:50 kg/ha\n• Pulses: 20:60:40 kg/ha\n\n**Organic Options:**\n• Farm Yard Manure (FYM): 10-15 tons/ha\n• Compost: 5-10 tons/ha\n• Vermicompost: 2-5 tons/ha\n• Green manure crops\n\n**Application Tips:**\n• Split application for better uptake\n• Apply before irrigation/rain\n• Avoid fertilizer burn\n• Test soil every 2-3 years",
        confidence: 0.9
      },
      
      "soil health": {
        keywords: ["soil health", "soil test", "soil quality"],
        response: "🌍 **Soil Health Indicators:**\n\n**Good Soil Characteristics:**\n• pH: 6.0-7.5 (most crops)\n• Organic matter: >1.5%\n• Good drainage\n• Earthworm presence\n\n**Improvement Practices:**\n1. Add organic matter annually\n2. Practice crop rotation\n3. Minimal tillage\n4. Cover cropping\n5. Green manuring\n\n**Soil Testing:**\n• Test every 2-3 years\n• Sample from multiple points\n• Test before each season\n\n**Your soil report shows detailed nutrient levels - check the app!",
        confidence: 0.85
      },
      
      "disease": {
        keywords: ["disease", "fungus", "blight", "rust", "wilt"],
        response: "🦠 **Common Crop Diseases:**\n\n**Fungal Diseases:**\n• Blast (rice): Use resistant varieties, avoid excess N\n• Rust (wheat): Timely sowing, fungicide spray\n• Wilt: Crop rotation, seed treatment\n\n**Bacterial Diseases:**\n• Leaf blight: Copper-based fungicides\n• Bacterial wilt: Resistant varieties\n\n**Prevention is Better:**\n• Seed treatment with Trichoderma\n• Crop rotation\n• Remove infected plants\n• Proper spacing\n\n**Treatment:**\n• Fungicides (as last resort)\n• Biocontrol agents\n• Improve air circulation",
        confidence: 0.85
      },
      
      "market price": {
        keywords: ["price", "sell", "market", "mandi", "profit"],
        response: "💰 **Getting Best Market Prices:**\n\n**Check Before Selling:**\n• Compare prices in nearby mandis\n• Check government procurement centers\n• Monitor market trends in app\n\n**Timing Matters:**\n• Avoid selling immediately after harvest\n• Store safely if possible\n• Sell when prices are favorable\n\n**Government Schemes:**\n• MSP (Minimum Support Price) for wheat, rice\n• State procurement at guaranteed prices\n• Check 'Government Schemes' section in app\n\n**Direct Marketing:**\n• Farmer Producer Organizations (FPOs)\n• e-NAM (National Agricultural Market)\n• Contract farming",
        confidence: 0.85
      },
      
      "government schemes": {
        keywords: ["scheme", "subsidy", "loan", "insurance", "pmkvy"],
        response: "🏛️ **Major Government Schemes:**\n\n**Income Support:**\n• PM-KISAN: ₹6,000/year direct benefit\n\n**Insurance:**\n• PMFBY: Crop insurance at low premium\n\n**Irrigation:**\n• PMKSY: Micro-irrigation subsidies (50-75%)\n\n**Soil Health:**\n• Soil Health Card Scheme: Free soil testing\n\n**Loans:**\n• KCC (Kisan Credit Card): Low-interest loans\n• Interest subvention on crop loans\n\n**How to Apply:**\n• Visit local agriculture office\n• Check Government Schemes section in app\n• Contact your village agriculture officer",
        confidence: 0.9
      },
      
      "organic farming": {
        keywords: ["organic", "natural", "zero budget", "desi"],
        response: "🌾 **Organic/Natural Farming:**\n\n**Zero Budget Natural Farming (ZBNF) Principles:**\n1. Jeevamrutha - microbial culture\n2. Bijamrita - seed treatment\n3. Achhadana - mulching\n4. Whapasa - soil moisture management\n\n**Benefits:**\n• Lower input costs\n• Better soil health\n• Chemical-free produce\n• Premium prices (20-30% more)\n\n**Transition Period:**\n• 2-3 years for full conversion\n• Initial yield dip possible\n• Gradual improvement in soil\n\n**Certification:**\n• PGS-India (Participatory Guarantee System)\n• NPOP (National Programme for Organic Production)\n\n**Toggle natural farming mode in app for recommendations!",
        confidence: 0.9
      }
    };
  }

  /**
   * Process user query and generate response
   * @param {string} query - User's question
   * @param {string} language - Preferred language code (en, te, hi, ta, kn, ml)
   */
  async getResponse(query, language = 'en') {
    const normalizedQuery = query.toLowerCase().trim();
    
    console.log('[AI Assistant] Processing query:', query, 'Language:', language);
    
    // Find matching query
    const match = this.findBestMatch(normalizedQuery);
    
    let response;
    if (match) {
      response = {
        success: true,
        response: match.response,
        confidence: match.confidence,
        source: 'knowledge_base'
      };
    } else {
      // Try to extract intent and provide helpful response
      const fallbackResponse = this.generateFallbackResponse(normalizedQuery);
      response = fallbackResponse;
    }
    
    // Translate response if language is not English
    if (language !== 'en') {
      try {
        response.response = await this.translateResponse(response.response, language);
      } catch (error) {
        console.error('[AI Assistant] Translation error:', error.message);
        // Return English response if translation fails
        response.response += '\n\n[Note: Response available in English only]';
      }
    }
    
    return response;
  }

  /**
   * Translate response to target language
   * Uses simple dictionary-based translation for prototype
   * Can be replaced with Google Translate API or LibreTranslate API later
   */
  async translateResponse(englishText, targetLanguage) {
    // For prototype, we'll use predefined translations
    // In production, replace this with actual translation API
    
    const translations = {
      te: {
        // Common farming terms
        "Crop Rotation": "పంట మార్పిడి",
        "soil health": "మట్టి ఆరోగ్యం",
        "fertilizer": "ఎరువులు",
        "water": "నీరు",
        "pest": "తెగులు",
        "disease": "వ్యాధి",
        "market price": "మార్కెట్ ధర",
        "government schemes": "ప్రభుత్వ పథకాలు",
        
        // Greeting patterns
        "🙏 Namaste!": "🙏 నమస్కారం!",
        "I'm your AI Farming Assistant": "నేను మీ AI వ్యవసాయ సహాయకుడిని",
        
        // Full responses (simplified for demo)
        "🔄 **Crop Rotation Benefits:**": "🔄 **పంట మార్పిడి ప్రయోజనాలు:**\n\n• మట్టి సారవంతత పెరుగుతుంది\n• తెగుళ్లు మరియు వ్యాధులు తగ్గుతాయి\n• మట్టి కోత తగ్గుతుంది\n• పంట దిగుబడి పెరుగుతుంది",
        
        "🌱 **Optimal Planting Times:**": "🌱 **ఉత్తమ నాటడ సమయాలు:**\n\n**ఖరీఫ్ సీజన్ (జూన్-అక్టోబర్):**\n• వరి: జూన్-జూలై\n• మొక్కజొన్న: జూన్-జూలై\n• పత్తి: మే-జూన్\n• వేరుశెనగ: మే-జూన్",
        
        "🐛 **Integrated Pest Management:**": "🐛 **సమగ్ర తెగులు నియంత్రణ:**\n\n**సహజ పద్ధతులు:**\n1. వేప నూనె స్ప్రే (5ml/లీటర్ నీళ్లు)\n2. వెల్లుల్లి-మిర్చి ద్రావణం\n3. ప్రయోజనకర కీటకాలు\n4. పంట మార్పిడి",
        
        "💧 **Smart Water Management:**": "💧 **స్మార్ట్ నీటి నిర్వహణ:**\n\n**సాగు పద్ధతులు:**\n1. డ్రిప్ సాగు (40-60% నీటి పొదుపు)\n2. స్ప్రింక్లర్ వ్యవస్థ\n3. వరద సాగు (తక్కువ సమర్థవంతం)",
        
        "🌿 **Fertilizer Management:**": "🌿 **ఎరువుల నిర్వహణ:**\n\n**NPK నిష్పత్తి:**\n• వరి: 80:40:40 kg/ha\n• గోధుమ: 120:60:40 kg/ha\n• మొక్కజొన్న: 100:50:50 kg/ha",
        
        "🌍 **Soil Health Indicators:**": "🌍 **మట్టి ఆరోగ్య సూచికలు:**\n\n**మంచి మట్టి లక్షణాలు:**\n• pH: 6.0-7.5 (చాలా పంటలకు)\n• సేంద్రియ పదార్థం: >1.5%\n• మంచి డ్రైనేజీ",
        
        "💰 **Getting Best Market Prices:**": "💰 **ఉత్తమ మార్కెట్ ధరలు పొందడం:**\n\n**విక్రయించే ముందు తనిఖీ చేయండి:**\n• సమీప మండీలలో ధరలను పోల్చండి\n• ప్రభుత్వ కొనుగోలు కేంద్రాలను తనిఖీ చేయండి",
        
        "🏛️ **Major Government Schemes:**": "🏛️ **ప్రధాన ప్రభుత్వ పథకాలు:**\n\n**ఆదాయ మద్దతు:**\n• PM-KISAN: ₹6,000/సంవత్సరం\n\n**బీమా:**\n• PMFBY: తక్కువ ప్రీమియంతో పంట బీమా"
      },
      hi: {
        "Crop Rotation": "फसल चक्र",
        "soil health": "मिट्टी का स्वास्थ्य",
        "fertilizer": "उर्वरक",
        "water": "पानी",
        "pest": "कीट",
        "disease": "बीमारी",
        "market price": "बाजार मूल्य",
        "government schemes": "सरकारी योजनाएं",
        
        "🙏 Namaste!": "🙏 नमस्ते!",
        "I'm your AI Farming Assistant": "मैं आपका AI कृषि सहायक हूँ",
        
        "🔄 **Crop Rotation Benefits:**": "🔄 **फसल चक्र के लाभ:**\n\n• मिट्टी की उर्वरता बढ़ती है\n• कीट और रोग चक्र टूटता है\n• मृदा अपरदन कम होता है\n• फसल उपज बढ़ती है",
        
        "🌱 **Optimal Planting Times:**": "🌱 **बुवाई का सर्वोत्तम समय:**\n\n**खरीफ सीजन (जून-अक्टूबर):**\n• चावल: जून-जुलाई\n• मक्का: जून-जुलाई\n• कपास: मई-जून",
        
        "💰 **Getting Best Market Prices:**": "💰 **सर्वोत्तम बाजार मूल्य प्राप्त करना:**\n\n**बेचने से पहले जांचें:**\n• पास के मंडियों में मूल्यों की तुलना करें",
        
        "🏛️ **Major Government Schemes:**": "🏛️ **प्रमुख सरकारी योजनाएं:**\n\n**आय समर्थन:**\n• PM-KISAN: ₹6,000/वर्ष"
      },
      ta: {
        "Crop Rotation": "பயிர் சுழற்சி",
        "soil health": "மண் ஆரோக்கியம்",
        "fertilizer": "உரம்",
        "water": "தண்ணீர்",
        "🙏 Namaste!": "🙏 வணக்கம்!",
        "I'm your AI Farming Assistant": "நான் உங்கள் AI விவசாய உதவியாளர்"
      },
      kn: {
        "Crop Rotation": "ಬೆಳೆ ಸುತ್ತು",
        "soil health": "ಮಣ್ಣಿನ ಆರೋಗ್ಯ",
        "fertilizer": "ಗೊಬ್ಬರ",
        "water": "ನೀರು",
        "🙏 Namaste!": "🙏 ನಮಸ್ಕಾರ!",
        "I'm your AI Farming Assistant": "ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ"
      },
      ml: {
        "Crop Rotation": "വിള കറക്കം",
        "soil health": "മണ്ണിന്റെ ആരോഗ്യം",
        "fertilizer": "വളം",
        "water": "വെള്ളം",
        "🙏 Namaste!": "🙏 നമസ്കാരം!",
        "I'm your AI Farming Assistant": "ഞാൻ നിങ്ങളുടെ AI കാർഷിക സഹായി"
      }
    };
    
    // Get translation dictionary for target language
    const langDict = translations[targetLanguage];
    if (!langDict) {
      return englishText; // Return English if language not supported
    }
    
    // Simple pattern-based translation
    let translatedText = englishText;
    
    // Replace key phrases (in production, use proper translation API)
    for (const [english, native] of Object.entries(langDict)) {
      const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translatedText = translatedText.replace(regex, native);
    }
    
    // If no translation found, return original with note
    if (translatedText === englishText && targetLanguage !== 'en') {
      // For demo purposes, add a note that full translation needs API
      return `[${targetLanguage.toUpperCase()}] ${englishText}\n\n(പൂർണ്ണമായ തർജ്ജമയ്ക്ക് Google Translate API ആവശ്യമാണ്)`;
    }
    
    return translatedText;
  }

  /**
   * Generate fallback response for unknown queries
   */
  generateFallbackResponse(query) {
    return {
      success: true,
      response: "Thank you for your question! I specialize in farming topics like crop management, soil health, pest control, and government schemes. Could you please rephrase your question using farming-related terms?",
      confidence: 0.3,
      source: 'fallback'
    };
  }

  /**
   * Find best matching query from knowledge base
   */
  findBestMatch(query) {
    let bestMatch = null;
    let highestScore = 0;

    for (const [topic, data] of Object.entries(this.commonQueries)) {
      const score = this.calculateMatchScore(query, data.keywords);
      
      if (score > highestScore && score >= 0.3) {
        highestScore = score;
        bestMatch = data;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate match score between query and keywords
   */
  calculateMatchScore(query, keywords) {
    let score = 0;
    
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        score += 1;
      }
    }
    
    // Normalize score
    return Math.min(score / keywords.length, 1.0);
  }

  /**
   * Generate fallback response for unknown queries
   */
  generateFallbackResponse(query) {
    // Check for specific topics
    if (query.includes('weather') || query.includes('rain')) {
      return "🌤️ For weather information, please check the Weather section in your app. It provides:\n\n• Current temperature and conditions\n• Rainfall forecasts\n• Irrigation recommendations\n• Weather alerts\n\nWould you like me to guide you to the weather page?";
    }
    
    if (query.includes('hello') || query.includes('hi') || query.includes('namaste')) {
      return "🙏 Namaste! I'm your AI Farming Assistant.\n\nI can help you with:\n• Crop recommendations\n• Pest and disease management\n• Water and fertilizer guidance\n• Market prices\n• Government schemes\n\nWhat would you like to know?";
    }
    
    if (query.includes('thank')) {
      return "😊 You're welcome! Feel free to ask anything about farming. I'm here to help you succeed!";
    }
    
    // Default response
    return "Thanks for your question! Here's what I suggest:\n\n**For Specific Advice:**\n1. Upload your soil report for personalized recommendations\n2. Check the Crop Calendar for seasonal guidance\n3. Browse Government Schemes for available support\n\n**General Topics I Can Help With:**\n• Crop selection and rotation\n• Pest and disease management\n• Water and fertilizer use\n• Market prices and selling tips\n\nPlease ask me anything related to farming!";
  }

  /**
   * Get suggested questions for users
   */
  getSuggestedQuestions() {
    return [
      "When is the best time to plant rice?",
      "How do I control pests naturally?",
      "What is crop rotation?",
      "How much fertilizer should I use?",
      "What government schemes are available?",
      "How can I improve soil health?",
      "What are the current market prices?",
      "How do I practice organic farming?"
    ];
  }
}

// Export singleton instance
const aiFarmerAssistant = new AIFarmerAssistant();

module.exports = aiFarmerAssistant;
