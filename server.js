import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// Proxy Google TTS requests to avoid CORS issues
app.get('/tts', async (req, res) => {
  const text = req.query.text;
  if (!text) {
    return res.status(400).send('Missing text parameter');
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=uk&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('TTS request failed');
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).send('TTS error');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`TTS server running on http://localhost:${PORT}`);
});
