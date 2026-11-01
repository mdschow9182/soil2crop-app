const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'https://api.vachana.ai';
const LOCALES = Object.freeze({
  en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN',
});
const AUDIO_TYPES = Object.freeze({
  'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3', 'audio/ogg': 'ogg', 'audio/flac': 'flac',
  'audio/aac': 'aac', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a',
});
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

const localeFor = (language) => {
  const locale = LOCALES[language];
  if (!locale) {
    const error = new Error('Unsupported language');
    error.status = 400;
    throw error;
  }
  return locale;
};

const getApiKey = () => {
  if (!process.env.GNANI_API_KEY) {
    const error = new Error('Voice service is not configured');
    error.status = 503;
    throw error;
  }
  return process.env.GNANI_API_KEY;
};

const transcribeAudio = async ({ buffer, mimeType, language }) => {
  const locale = localeFor(language);
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > MAX_AUDIO_BYTES) {
    const error = new Error('Audio must be between 1 byte and 15 MB');
    error.status = 400;
    throw error;
  }
  const extension = AUDIO_TYPES[mimeType];
  if (!extension) {
    const error = new Error('Unsupported audio format. Use WAV, MP3, OGG, FLAC, AAC, or M4A.');
    error.status = 415;
    throw error;
  }
  const form = new FormData();
  form.append('audio_file', buffer, { filename: `recording.${extension}`, contentType: mimeType });
  form.append('language_code', locale);
  form.append('model', 'prisma-v3.0');
  try {
    const response = await axios.post(`${BASE_URL}/stt/v3`, form, {
      headers: { ...form.getHeaders(), 'X-API-Key-ID': getApiKey() },
      timeout: 30000,
      maxBodyLength: MAX_AUDIO_BYTES,
      maxContentLength: 1024 * 1024,
    });
    return { transcript: response.data?.transcript || '', language: response.data?.detected_language_code || locale };
  } catch (error) {
    throw upstreamError(error, 'Prisma STT');
  }
};

const speakText = async ({ text, language }) => {
  const locale = localeFor(language);
  if (typeof text !== 'string' || !text.trim() || text.length > 5000) {
    const error = new Error('Text must contain 1 to 5000 characters');
    error.status = 400;
    throw error;
  }
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/tts/inference`, {
      text: text.trim(),
      model: 'timbre-v3.0',
      voice: 'Lakshmi',
      language: locale,
      audio_config: { encoding: 'linear_pcm', container: 'wav', num_channels: 1, sample_rate: 24000, sample_width: 2 },
    }, {
      headers: { 'X-API-Key-ID': getApiKey(), 'Content-Type': 'application/json' },
      timeout: 30000,
      responseType: 'arraybuffer',
      maxContentLength: 12 * 1024 * 1024,
    });
    const audio = Buffer.from(response.data);
    if (audio.length < 44 || audio.toString('ascii', 0, 4) !== 'RIFF' || audio.toString('ascii', 8, 12) !== 'WAVE') {
      console.error('[Gnani] Timbre returned an invalid WAV payload', {
        contentType: response.headers?.['content-type'] || 'unknown',
        byteLength: audio.length,
      });
      const invalidAudio = new Error('Voice service returned invalid audio. Please try again.');
      invalidAudio.status = 502;
      throw invalidAudio;
    }
    return audio;
  } catch (error) {
    throw upstreamError(error, 'Timbre TTS');
  }
};

const upstreamError = (error, operation) => {
  if (error.status) return error;
  console.error(`[Gnani] ${operation} request failed`, {
    status: error.response?.status || null,
    code: error.code || null,
  });
  const result = new Error(error.code === 'ECONNABORTED' ? 'Voice service timed out. Please try again.' : 'Voice service request failed. Please try again.');
  result.status = error.code === 'ECONNABORTED' ? 504 : 502;
  return result;
};

module.exports = { transcribeAudio, speakText, LOCALES, AUDIO_TYPES, MAX_AUDIO_BYTES };
