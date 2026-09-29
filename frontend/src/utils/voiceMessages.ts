/**
 * Voice Messages for Crop Recommendations
 * Pre-formatted voice messages for different scenarios
 */
import { speakMessage as speakWithSharedVoice, stopSpeech as stopSharedSpeech } from "./voiceAssistant";

/**
 * Suitability levels for crops
 */
export const SuitabilityLevel = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
} as const;

export type SuitabilityLevelType = typeof SuitabilityLevel[keyof typeof SuitabilityLevel];

/**
 * Generate voice message for crop recommendations
 */
export const generateRecommendationVoiceMessage = (
  top3Crops: Array<{
    cropName: string;
    suitability: string;
    reasoning: string;
  }>
): string => {
  if (!top3Crops || top3Crops.length === 0) {
    return 'Sorry, no crop recommendations available for your soil conditions.';
  }

  const cropNames = top3Crops.map(c => c.cropName);
  
  if (cropNames.length === 1) {
    return `Based on your soil analysis, the recommended crop is ${cropNames[0]}.`;
  }
  
  if (cropNames.length === 2) {
    return `Based on your soil analysis, the recommended crops are ${cropNames[0]} and ${cropNames[1]}.`;
  }
  
  // For 3 or more crops
  const lastCrop = cropNames[cropNames.length - 1];
  const otherCrops = cropNames.slice(0, -1);
  
  return `Based on your soil analysis, the recommended crops are ${otherCrops.join(', ')}, and ${lastCrop}.`;
};

/**
 * Generate detailed voice message with suitability levels
 */
export const generateDetailedVoiceMessage = (
  top3Crops: Array<{
    cropName: string;
    suitability: string;
    reasoning: string;
  }>
): string => {
  if (!top3Crops || top3Crops.length === 0) {
    return 'No recommendations available.';
  }

  const messages = top3Crops.map((crop, index) => {
    const suitabilityText = crop.suitability === SuitabilityLevel.HIGH 
      ? 'highly suitable' 
      : crop.suitability === SuitabilityLevel.MEDIUM 
        ? 'moderately suitable' 
        : 'suitable';
    
    return `${index + 1}. ${crop.cropName} is ${suitabilityText}. ${crop.reasoning.split('.')[0]}.`;
  });
  
  return messages.join(' ');
};

/**
 * Generate alert voice message for soil issues
 */
export const generateSoilAlertVoiceMessage = (
  pH: number,
  nitrogen: string,
  phosphorus: string,
  potassium: string
): string => {
  const alerts: string[] = [];
  
  // pH alerts
  if (pH < 6) {
    alerts.push('Your soil is acidic. Consider adding lime to improve pH.');
  } else if (pH > 7.5) {
    alerts.push('Your soil is alkaline. Consider adding organic matter to balance pH.');
  }
  
  // Nitrogen alerts
  if (nitrogen === 'Low') {
    alerts.push('Nitrogen levels are low. Consider planting pulses or adding organic fertilizer.');
  } else if (nitrogen === 'High') {
    alerts.push('Nitrogen levels are high. Avoid excessive nitrogen fertilizers.');
  }
  
  // Phosphorus alerts
  if (phosphorus === 'Low') {
    alerts.push('Phosphorus levels are low. Add bone meal or rock phosphate.');
  }
  
  // Potassium alerts
  if (potassium === 'Low') {
    alerts.push('Potassium levels are low. Add wood ash or potash fertilizer.');
  }
  
  if (alerts.length === 0) {
    return 'Your soil parameters are within optimal range. Great job!';
  }
  
  return `Soil Alert: ${alerts.join(' ')}`;
};

/**
 * Generate success voice message
 */
export const generateSuccessVoiceMessage = (cropCount: number): string => {
  if (cropCount === 0) {
    return 'No suitable crops found for your soil conditions.';
  }
  
  return `Successfully analyzed your soil data and generated ${cropCount} crop recommendations.`;
};

/**
 * Get quick summary voice message
 */
export const getQuickSummaryVoiceMessage = (
  pH: number,
  nitrogen: string,
  topCrop: string
): string => {
  const pHStatus = pH < 6 ? 'acidic' : pH > 7.5 ? 'alkaline' : 'neutral';
  
  return `Your soil is ${pHStatus} with ${nitrogen.toLowerCase()} nitrogen. Best recommended crop: ${topCrop}.`;
};

/**
 * Voice messages for different app states
 */
export const VoiceMessages = {
  // Loading states
  loading: 'Analyzing your soil data. Please wait...',
  analyzing: 'Generating crop recommendations based on soil parameters...',
  
  // Error states
  error: 'Sorry, unable to generate recommendations. Please check your connection and try again.',
  noData: 'No soil data provided. Please enter soil test results.',
  
  // Success states
  ready: 'Crop recommendations are ready!',
  refreshed: 'Recommendations updated successfully.',
  
  // Guidance
  instruction: 'Review the recommended crops and their suitability levels. Tap on any crop for detailed information.',
  nextSteps: 'You can save these recommendations, share them, or explore other crop options.'
};

/**
 * Combine multiple voice messages
 */
export const combineVoiceMessages = (...messages: string[]): string => {
  return messages.filter(msg => msg && msg.trim()).join(' ');
};

/**
 * Get voice message for crop recommendations (safe version)
 * Handles arrays, objects, strings, and undefined values
 * @param crops - Crop data (can be array, object, string, or undefined)
 */
export function getVoiceMessage(crops: any): string {
  console.log("Voice crops value:", crops);

  // If crops is empty or undefined
  if (!crops) {
    return "No crop recommendations available.";
  }

  // If crops is an array
  if (Array.isArray(crops)) {
    if (crops.length === 0) {
      return "No crop recommendations available.";
    }

    return (
      "Based on your soil data, the recommended crops are " +
      crops.join(", ") +
      "."
    );
  }

  // If crops is an object
  if (typeof crops === "object") {
    const cropList =
      crops.crops ||
      crops.recommendedCrops ||
      [];

    if (Array.isArray(cropList)) {
      return (
        "Based on your soil data, the recommended crops are " +
        cropList.join(", ") +
        "."
      );
    }
  }

  // If crops is string
  if (typeof crops === "string") {
    return (
      "Based on your soil data, the recommended crop is " +
      crops +
      "."
    );
  }

  return "Crop recommendation available.";
}

/**
 * Speak text using browser's Text-to-Speech API
 * @param message - Text to speak
 */
export function speakText(message: string): void {
  speakWithSharedVoice(message, "en");
}

/**
 * Stop current speech
 */
export function stopSpeech(): void {
  stopSharedSpeech();
}

export default {
  generateRecommendationVoiceMessage,
  generateDetailedVoiceMessage,
  generateSoilAlertVoiceMessage,
  generateSuccessVoiceMessage,
  getQuickSummaryVoiceMessage,
  VoiceMessages,
  combineVoiceMessages,
  getVoiceMessage,
  speakText,
  stopSpeech
};
