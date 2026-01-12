#!/usr/bin/env python3
from flask import Flask, request, send_file
from flask_cors import CORS
import hashlib
import os
import sys

# Add the TTS repo to path
sys.path.insert(0, 'tts-repo')

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

# Cache directory
CACHE_DIR = './tts-cache'
os.makedirs(CACHE_DIR, exist_ok=True)

# Initialize TTS (this takes a moment)
print("Loading TTS model (Oleksa voice)...")
tts = TTS(device="cpu")
print("[OK] TTS model loaded!")

@app.route('/tts', methods=['POST'])
def generate_tts():
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return {'error': 'Missing text parameter'}, 400

        # Create cache key
        cache_key = hashlib.md5(text.encode()).hexdigest()
        cache_path = os.path.join(CACHE_DIR, f"{cache_key}.wav")

        # Check cache
        if os.path.exists(cache_path):
            print(f"[TTS] Cache hit: {len(text)} chars")
            return send_file(cache_path, mimetype='audio/wav')

        # Generate audio
        print(f"[TTS] Generating: {len(text)} chars")
        with open(cache_path, mode="wb") as file:
            _, output_text = tts.tts(text, Voices.Oleksa.value, Stress.Dictionary.value, file)

        print(f"[TTS] Generated successfully")
        return send_file(cache_path, mimetype='audio/wav')

    except Exception as e:
        print(f"[TTS] Error: {repr(e)}")
        import traceback
        traceback.print_exc()
        return {'error': str(e)}, 500

if __name__ == '__main__':
    print("\n[SPEAKER] Ukrainian TTS Server (Oleksa voice)")
    print(f"   Cache: {os.path.abspath(CACHE_DIR)}")
    print("   Starting on http://localhost:3002\n")
    app.run(host='0.0.0.0', port=3002, debug=False)
