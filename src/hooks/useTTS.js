import { useRef, useCallback } from 'react';

/**
 * Custom hook for Text-to-Speech functionality
 * Manages Ukrainian TTS with volume control and playback rate
 */
export const useTTS = (volume = 0.8) => {
  const currentAudioRef = useRef(null);

  const speak = useCallback(async (text, rate = 0.8, customVolume = null) => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    try {
      console.log(`[TTS] Requesting: "${text}"`);
      const response = await fetch('http://localhost:3002/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        console.log('[TTS] Server error:', response.statusText);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.playbackRate = rate;
      audio.volume = customVolume !== null ? customVolume : volume;
      currentAudioRef.current = audio;

      // Return a promise that resolves when audio finishes playing
      return new Promise((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          resolve();
        };
        audio.play().then(() => {
          console.log(`[TTS] Playing: "${text}"`);
        }).catch(err => {
          console.log('[TTS] Play error:', err.message);
          resolve(); // Resolve even on error so the game doesn't hang
        });
      });
    } catch (err) {
      console.log('[TTS] Error:', err.message);
    }
  }, [volume]);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying: currentAudioRef.current !== null
  };
};
