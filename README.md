# Kyiv Arcade - Ukrainian Typing Game

An interactive typing game to help learn Ukrainian typing with text-to-speech pronunciation support.

## Project Overview

This project consists of two main components:

1. **Web Application** (React + Vite) - Interactive typing game interface
2. **TTS Server** (Python Flask) - Ukrainian text-to-speech synthesis using local models

## Features

- **10 Interactive Typing Lessons** - Progressive lessons from letters to full phrases
- **Alphabet Speed Challenge** - Type all 32 Ukrainian letters as fast as you can
- **Keyboard Explorer** - Interactive tool to learn key positions and pronunciations
- **Text-to-Speech (TTS)** - High-quality Ukrainian pronunciation with adjustable volume
- **252+ Word Vocabulary** - Organized into themed sets (colors, animals, family, emotions, weather, travel, body parts, home)
- **Achievement System** - 20 achievements to unlock with XP rewards
- **Progress Tracking** - Save your progress, streaks, and statistics locally
- **Customizable Settings** - Control TTS volume, translations, pronunciation hints, and sound effects
- **Audio Caching** - Improved performance with server-side audio caching

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** - For the tts-repo submodule

## Project Structure

```
ukrainian-typing-game/
├── src/
│   ├── main.jsx                   # React entry point
│   ├── App.jsx                    # Main application component
│   ├── data/                      # Data files (keyboard, lessons, vocabulary)
│   │   ├── keyboard.js            # Ukrainian keyboard layout data
│   │   ├── lessons.js             # Typing lessons configuration
│   │   ├── achievements.js        # Achievement definitions
│   │   ├── translations.js        # Word translations
│   │   └── vocabulary/            # Themed vocabulary sets
│   │       └── themes/            # JSON files for each theme
│   │           ├── colors.json    # 10 color words
│   │           ├── animals.json   # 20 animal words
│   │           ├── family.json    # 15 family words
│   │           ├── emotions.json  # 15 emotion words
│   │           ├── weather.json   # 12 weather words
│   │           ├── travel.json    # 25 travel words
│   │           ├── body.json      # 15 body part words
│   │           └── house.json     # 20 house/home words
│   └── utils/                     # Utility functions
│       ├── encouragement.js       # Encouraging messages
│       └── soundEffects.js        # Sound effect functions
├── tts-repo/                      # Ukrainian TTS library (submodule)
├── tts-cache/                     # Cached TTS audio files
├── index.html                     # HTML entry point
├── package.json                   # Node.js dependencies
├── tts-server.js                  # Node TTS server (alternative, not used)
├── tts-server.py                  # Python TTS server (active)
├── vite.config.js                 # Vite configuration
├── config.yaml                    # TTS model configuration
├── model.pth                      # TTS model weights (425 MB)
├── feats_stats.npz                # TTS feature statistics
├── spk_xvector.ark                # Speaker embedding
├── start.bat                      # Quick start script (Windows)
└── README.md                      # This file
```

## Installation

### Option 1: Quick Start (Windows)

Simply double-click `start.bat` to automatically:
- Install all Node.js dependencies
- Install all Python dependencies
- Start both servers
- Open the website in your browser

### Option 2: Manual Installation

#### 1. Install Node.js Dependencies

```bash
npm install
```

#### 2. Install Python Dependencies

The TTS server requires several Python packages. Install them with:

```bash
# Install the Ukrainian TTS library
cd tts-repo
pip install -e .
cd ..

# Install additional dependencies
pip install flask flask-cors
```

If you encounter issues, install dependencies from requirements.txt:

```bash
pip install -r tts-repo/requirements.txt
```

## Running the Application

### Option 1: Quick Start (Windows)

```bash
start.bat
```

This will start both the web server and TTS server, then open your browser automatically.

### Option 2: Using npm Scripts

Start both servers simultaneously:

```bash
npm start
```

Note: This command uses `concurrently` to run both servers, but starts the Node.js TTS server (port 3001) instead of the Python one. The application is configured to use the Python TTS server (port 3002), so use Option 3 below instead.

### Option 3: Manual Start (Recommended)

Start each component in separate terminals:

**Terminal 1 - TTS Server:**
```bash
python tts-server.py
```

**Terminal 2 - Web Server:**
```bash
npm run dev
```

The web application will automatically open in your browser at `http://localhost:5173`

## Server Ports

- **Web Application**: http://localhost:5173 (Vite dev server)
- **Python TTS Server**: http://localhost:3002 (Used by the app)
- **Node TTS Server**: http://localhost:3001 (Alternative, uses Hugging Face API)

## TTS Servers

This project includes two TTS server implementations:

### Python TTS Server (Active) - `tts-server.py`
- Runs on port 3002
- Uses local Ukrainian TTS models (Oleksa voice)
- Higher quality but requires model files
- Caches generated audio to `tts-cache/`

### Node.js TTS Server (Alternative) - `tts-server.js`
- Runs on port 3001
- Uses Hugging Face API (online)
- Lighter weight but requires internet
- Also caches audio files

The application is currently configured to use the **Python TTS Server** (port 3002).

## Troubleshooting

### Python Dependencies Issues

If you encounter errors installing Python dependencies:

1. Try installing PyTorch separately first:
```bash
pip install torch
```

2. Install espnet with the specific version:
```bash
pip install espnet==202301
```

3. If scipy issues occur:
```bash
pip install "scipy<1.12.0"
```

### TTS Server Not Starting

- Ensure Python 3.8+ is installed: `python --version`
- Check if the required model files exist:
  - `config.yaml`
  - `model.pth`
  - `feats_stats.npz`
  - `spk_xvector.ark`

### Port Already in Use

If port 5173 or 3002 is already in use:
- Close other applications using those ports
- Or modify the ports in `vite.config.js` (web) and `tts-server.py` (TTS)

### Browser Doesn't Open

If the browser doesn't open automatically:
- Manually navigate to http://localhost:5173
- Check if the Vite server started successfully

## Development

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Technologies Used

### Frontend
- React 18
- Vite
- Modern JavaScript (ES6+)

### Backend
- Python 3
- Flask
- Ukrainian TTS (espnet-based)
- PyTorch

### TTS Model
- Based on SpeechT5
- Trained on Ukrainian speech data
- Oleksa voice model

## License

This project uses the Ukrainian TTS library from https://github.com/egorsmkv/ukrainian-tts

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## Credits

- Ukrainian TTS model by robinhad/Yehor
- SpeechT5 architecture
- espnet framework
