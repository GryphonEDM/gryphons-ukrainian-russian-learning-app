# Ukrainian & Russian Typing Game

A free, open-source web app for learning to type in Ukrainian and Russian. Includes typing lessons, vocabulary flashcards (4000+ words), grammar exercises, reading practice, dialogue practice, a translator, and text-to-speech pronunciation.

## Features

- **Ukrainian + Russian** - Full support for both languages with one-click switching
- **Typing Lessons** - Progressive lessons from individual letters to full words
- **Alphabet Speed Challenge** - Type the entire alphabet as fast as you can
- **Keyboard Explorer** - Click any key to hear its sound and learn its position
- **4000+ Word Vocabulary** - Flashcards across 20+ themed categories
- **Grammar Lessons** - Cases, verbs, pronouns, adjectives, word order
- **Sentence Building** - Arrange words into correct sentences
- **Dialogue Practice** - Practice real conversations (restaurant, directions, shopping, greetings)
- **Reading Practice** - Read passages and answer comprehension questions
- **Translation Practice** - Translate words between English and your target language
- **Listening Practice** - Hear words and type what you hear
- **Translator** - Look up words and phrases
- **Text-to-Speech** - Hear any word or letter pronounced (requires TTS server)
- **Achievement System** - 20 achievements to unlock
- **Progress Tracking** - XP, streaks, and stats saved per language

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [Python](https://www.python.org/downloads/) 3.8+ (only needed for TTS)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd ukrainian-typing-game
npm install
```

### 2. Run the web app

```bash
npm run dev
```

Open http://localhost:5173 in your browser. The app is fully functional without TTS - you just won't hear pronunciation.

### 3. (Optional) Enable text-to-speech

TTS lets you hear every letter and word pronounced. There are two options:

#### Option A: Local TTS server (higher quality, offline)

```bash
# Install the TTS library
cd tts-repo
pip install -e .
cd ..

# Install Flask
pip install flask flask-cors

# Start the TTS server
python tts-server.py
```

The first run will automatically download the model files (~425 MB) from GitHub. After that it works offline.

#### Option B: HuggingFace API (no model download, requires internet)

```bash
node tts-server.js
```

This calls the HuggingFace API and runs on port 3001. To use it, change the port in `src/App.jsx` from `3002` to `3001`.

### Windows one-click start

Double-click `start.bat` to automatically install dependencies and start both the web app and TTS server.

### Mac/Linux one-click start

```bash
chmod +x start.sh
./start.sh
```

## How to play

1. **Set up your keyboard** - Add Ukrainian or Russian as an input language in your OS settings (click the Keyboard Setup Guide in the app for instructions)
2. **Switch your keyboard** - Use `Win+Space` (Windows), `Ctrl+Space` (Mac), or `Super+Space` (Linux) to switch to the target language
3. **Start typing** - Pick a lesson and type the letters/words shown. The virtual keyboard highlights which key to press
4. **Explore other modes** - Try flashcards, grammar lessons, reading practice, and more from the main menu

## Project Structure

```
├── src/                    # React application source
│   ├── App.jsx             # Main app component
│   ├── components/modes/   # Game mode components (flashcards, grammar, etc.)
│   ├── data/               # Ukrainian language data (lessons, vocabulary, grammar)
│   ├── data/ru/            # Russian language data
│   └── utils/              # Helpers (dictionary builder, sound effects)
├── tts-repo/               # Ukrainian TTS library (from robinhad/ukrainian-tts)
├── tts-server.py           # Local TTS server (Python, port 3002)
├── tts-server.js           # API TTS server (Node.js, port 3001)
├── start.bat               # Windows startup script
├── start.sh                # Mac/Linux startup script
├── index.html              # Vite entry point
├── package.json            # Node.js dependencies
└── vite.config.js          # Vite config
```

## Troubleshooting

**App works but no sound?**
- Make sure TTS is enabled in Settings (bottom of main menu)
- Check that the TTS server is running (`python tts-server.py`)
- The TTS server should show "TTS model loaded!" when ready

**Python dependency issues?**
```bash
pip install torch
pip install espnet
pip install flask flask-cors
```

**Port already in use?**
- Close other apps using ports 5173 or 3002
- Or edit the port in `vite.config.js` / `tts-server.py`

## Credits

- Ukrainian TTS model by [robinhad](https://github.com/robinhad/ukrainian-tts)
- Built with React + Vite
