const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const gnaniService = require('../services/gnaniService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: gnaniService.MAX_AUDIO_BYTES, files: 1 } });
const publicError = (res, error) => res.status(error.status || 502).json({ success: false, message: error.status ? error.message : 'Voice service request failed. Please try again.' });

router.post('/transcribe', auth, (req, res, next) => {
  upload.single('audio')(req, res, (error) => {
    if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ success: false, message: 'Audio upload is invalid or exceeds 15 MB.' });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Audio recording is required.' });
  try {
    const result = await gnaniService.transcribeAudio({ buffer: req.file.buffer, mimeType: req.file.mimetype, language: req.body.language });
    return res.json({ success: true, ...result });
  } catch (error) { return publicError(res, error); }
});

router.post('/speak', auth, async (req, res) => {
  try {
    const audio = await gnaniService.speakText({ text: req.body?.text, language: req.body?.language });
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': String(audio.length), 'Cache-Control': 'no-store' });
    return res.send(audio);
  } catch (error) { return publicError(res, error); }
});

module.exports = router;
