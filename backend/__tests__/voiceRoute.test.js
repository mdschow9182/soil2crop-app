const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('../services/gnaniService', () => ({
  MAX_AUDIO_BYTES: 1024,
  transcribeAudio: jest.fn(),
  speakText: jest.fn(),
}));

process.env.JWT_SECRET = 'voice-route-tests-secret-with-at-least-32-characters';
const gnaniService = require('../services/gnaniService');
const voiceRoutes = require('../routes/voice');

const app = express();
app.use(express.json());
app.use('/api/voice', voiceRoutes);
const token = () => `Bearer ${jwt.sign({ userId: 'USER-1', farmerId: 'FARMER-1' }, process.env.JWT_SECRET, { algorithm: 'HS256' })}`;
const wav = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVEfmt '), Buffer.alloc(36)]);

describe('Gnani voice API contract', () => {
  beforeEach(() => jest.clearAllMocks());

  test('requires a valid JWT for transcription and speech', async () => {
    const [transcribe, speak] = await Promise.all([
      request(app).post('/api/voice/transcribe'),
      request(app).post('/api/voice/speak').send({ text: 'hello', language: 'en' }),
    ]);
    expect(transcribe.status).toBe(401);
    expect(speak.status).toBe(401);
    expect(gnaniService.transcribeAudio).not.toHaveBeenCalled();
    expect(gnaniService.speakText).not.toHaveBeenCalled();
  });

  test('passes synthetic Telugu audio to the mocked service and returns its transcript', async () => {
    gnaniService.transcribeAudio.mockResolvedValue({ transcript: 'నా నేల ఆరోగ్యం ఎలా ఉంది?', language: 'te-IN' });
    const response = await request(app)
      .post('/api/voice/transcribe')
      .set('Authorization', token())
      .field('language', 'te')
      .attach('audio', wav, { filename: 'synthetic.wav', contentType: 'audio/wav' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, transcript: 'నా నేల ఆరోగ్యం ఎలా ఉంది?', language: 'te-IN' });
    expect(gnaniService.transcribeAudio).toHaveBeenCalledWith(expect.objectContaining({ mimeType: 'audio/wav', language: 'te', buffer: expect.any(Buffer) }));
  });

  test('rejects a missing recording and returns a safe upstream error', async () => {
    const missing = await request(app).post('/api/voice/transcribe').set('Authorization', token()).field('language', 'en');
    expect(missing.status).toBe(400);
    expect(missing.body.message).toMatch(/recording is required/i);

    const upstream = Object.assign(new Error('Voice service timed out. Please try again.'), { status: 504 });
    gnaniService.speakText.mockRejectedValue(upstream);
    const response = await request(app).post('/api/voice/speak').set('Authorization', token()).send({ text: 'hello', language: 'en' });
    expect(response.status).toBe(504);
    expect(response.body).toEqual({ success: false, message: 'Voice service timed out. Please try again.' });
  });

  test('returns mocked Timbre WAV bytes with a browser-playable content type', async () => {
    gnaniService.speakText.mockResolvedValue(wav);
    const response = await request(app)
      .post('/api/voice/speak')
      .set('Authorization', token())
      .send({ text: 'తెలుగు పరీక్ష', language: 'te' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/^audio\/wav/);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(gnaniService.speakText).toHaveBeenCalledWith({ text: 'తెలుగు పరీక్ష', language: 'te' });
  });
});
