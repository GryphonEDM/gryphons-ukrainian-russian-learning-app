import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Cache directory for TTS audio files
const CACHE_DIR = './tts-cache';
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

// Hugging Face API endpoint for Ukrainian TTS
// Using the robinhad model which is actively maintained
const HF_API_URL = 'https://api-inference.huggingface.co/models/Yehor/speecht5_tts_uk';

app.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    // Check cache first
    const cacheKey = Buffer.from(text).toString('base64').replace(/[/+=]/g, '_');
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.wav`);

    if (fs.existsSync(cachePath)) {
      console.log(`[TTS] Cache hit: "${text}"`);
      const audioBuffer = fs.readFileSync(cachePath);
      res.set('Content-Type', 'audio/wav');
      return res.send(audioBuffer);
    }

    console.log(`[TTS] Generating: "${text}"`);

    // Call Hugging Face API
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text })
    });

    if (!response.ok) {
      console.error(`[TTS] API error:`, response.statusText);
      return res.status(response.status).json({ error: 'TTS generation failed' });
    }

    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    // Save to cache
    fs.writeFileSync(cachePath, buffer);
    console.log(`[TTS] Cached: "${text}"`);

    res.set('Content-Type', 'audio/wav');
    res.send(buffer);
  } catch (err) {
    console.error('[TTS] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔊 Ukrainian TTS Server running on http://localhost:${PORT}`);
  console.log(`   Cache directory: ${path.resolve(CACHE_DIR)}`);
});
