#!/usr/bin/env python3
import sys
sys.path.insert(0, 'tts-repo')

try:
    from ukrainian_tts.tts import TTS, Voices, Stress
    print("✓ Ukrainian TTS imported successfully!")

    print("\nAttempting to initialize TTS...")
    tts = TTS(device="cpu")
    print("✓ TTS initialized!")

    print("\nTesting with a simple letter...")
    output_file = "test_output.wav"
    with open(output_file, mode="wb") as file:
        _, output_text = tts.tts("а", Voices.Dmytro.value, Stress.Dictionary.value, file)
    print(f"✓ Generated audio: {output_file}")
    print(f"  Accented text: {output_text}")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
