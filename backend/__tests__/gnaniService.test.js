jest.mock('axios', () => ({ post: jest.fn() }));

const axios = require('axios');
const { speakText, transcribeAudio } = require('../services/gnaniService');

const wav = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVEfmt '), Buffer.alloc(36)]);

describe('Gnani service external API boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GNANI_API_KEY = 'synthetic-test-key';
  });

  test('sends the configured Telugu locale and accepts only a WAV response from Timbre', async () => {
    axios.post.mockResolvedValue({ data: wav, headers: { 'content-type': 'audio/wav' } });
    const audio = await speakText({ text: 'నేల పరీక్ష', language: 'te' });
    expect(audio.equals(wav)).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/api/v1/tts/inference'), expect.objectContaining({ language: 'te-IN', model: 'timbre-v3.0' }), expect.objectContaining({ responseType: 'arraybuffer' }));
  });

  test('does not expose upstream body content when Timbre returns invalid audio', async () => {
    axios.post.mockResolvedValue({ data: Buffer.from('{"secret":"not audio"}'), headers: { 'content-type': 'application/json' } });
    await expect(speakText({ text: 'hello', language: 'en' })).rejects.toMatchObject({ status: 502, message: 'Voice service returned invalid audio. Please try again.' });
  });

  test('rejects unsupported audio formats before making an external STT request', async () => {
    await expect(transcribeAudio({ buffer: Buffer.from('synthetic'), mimeType: 'text/plain', language: 'en' })).rejects.toMatchObject({ status: 415 });
    expect(axios.post).not.toHaveBeenCalled();
  });
});
