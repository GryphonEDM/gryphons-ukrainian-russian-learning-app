#!/usr/bin/env python3
from flask import Flask, request, send_file
from flask_cors import CORS
import hashlib
import os
import sys
import torch

# Resolve all paths relative to this script's directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TTS_MODEL_DIR = os.path.join(SCRIPT_DIR, "tts-model")
CACHE_DIR = os.path.join(SCRIPT_DIR, "tts-cache")
RU_CACHE_DIR = os.path.join(SCRIPT_DIR, "tts-cache-ru")
RU_MODEL_PATH = os.path.join(SCRIPT_DIR, "tts-model-ru", "v5_ru.pt")

# Add the TTS repo to path
sys.path.insert(0, os.path.join(SCRIPT_DIR, 'tts-repo'))

try:
    from ukrainian_tts.tts import TTS, Voices, Stress
    print("[OK] Ukrainian TTS loaded successfully!")
except Exception as e:
    print(f"[ERROR] Failed to load Ukrainian TTS: {e}")
    print("\nTrying to install missing dependencies...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Cache directories
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(RU_CACHE_DIR, exist_ok=True)

# === Ukrainian TTS (ESPnet) ===
print("Loading Ukrainian TTS model (Oleksa voice)...")
os.chdir(TTS_MODEL_DIR)
tts_uk = TTS(cache_folder=".", device="cpu")
os.chdir(SCRIPT_DIR)
print("[OK] Ukrainian TTS model loaded!")

# === Russian TTS (Silero v5) ===
print("Loading Russian TTS model (Silero v5)...")
os.makedirs(os.path.join(SCRIPT_DIR, "tts-model-ru"), exist_ok=True)

if not os.path.isfile(RU_MODEL_PATH):
    print("  Downloading Silero v5 Russian model (~65MB)...")
    torch.hub.download_url_to_file('https://models.silero.ai/models/tts/ru/v5_ru.pt', RU_MODEL_PATH)

tts_ru = torch.package.PackageImporter(RU_MODEL_PATH).load_pickle("tts_models", "model")
tts_ru.to(torch.device('cpu'))
RU_SPEAKER = 'aidar'
RU_SAMPLE_RATE = 48000
print(f"[OK] Russian TTS model loaded! (speaker: {RU_SPEAKER})")

@app.route('/tts', methods=['POST'])
def generate_tts():
    try:
        data = request.get_json()
        text = data.get('text', '')
        lang = data.get('lang', 'uk')

        if not text:
            return {'error': 'Missing text parameter'}, 400

        # Route to the correct TTS engine
        if lang == 'ru':
            return generate_russian_tts(text)
        else:
            return generate_ukrainian_tts(text)

    except Exception as e:
        print(f"[TTS] Error: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}, 500

def generate_ukrainian_tts(text):
    cache_key = hashlib.md5(f"uk_{text}".encode()).hexdigest()
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.wav")

    if os.path.exists(cache_path):
        print(f"[TTS-UK] Cache hit: {len(text)} chars")
        return send_file(cache_path, mimetype='audio/wav')

    print(f"[TTS-UK] Generating: {len(text)} chars")
    with open(cache_path, mode="wb") as file:
        _, output_text = tts_uk.tts(text, Voices.Oleksa.value, Stress.Dictionary.value, file)

    print(f"[TTS-UK] Generated successfully")
    return send_file(cache_path, mimetype='audio/wav')

def generate_russian_tts(text):
    cache_key = hashlib.md5(f"ru_{text}".encode()).hexdigest()
    cache_path = os.path.join(RU_CACHE_DIR, f"{cache_key}.wav")

    if os.path.exists(cache_path):
        print(f"[TTS-RU] Cache hit: {len(text)} chars")
        return send_file(cache_path, mimetype='audio/wav')

    print(f"[TTS-RU] Generating: {len(text)} chars")
    tts_ru.save_wav(text=text, speaker=RU_SPEAKER, sample_rate=RU_SAMPLE_RATE, audio_path=cache_path)

    print(f"[TTS-RU] Generated successfully")
    return send_file(cache_path, mimetype='audio/wav')

if __name__ == '__main__':
    print("\n[SPEAKER] TTS Server (Ukrainian + Russian)")
    print(f"   UK Cache: {CACHE_DIR}")
    print(f"   RU Cache: {RU_CACHE_DIR}")
    print("   Starting on http://localhost:3002\n")
    app.run(host='0.0.0.0', port=3002, debug=False)
