# Ukrainian Typing Game - Agent Handoff Document

## Current Status
✅ **Working:** Ukrainian TTS with Oleksa voice is functioning
✅ **Working:** Game runs at http://localhost:5173
✅ **Working:** TTS server runs at http://localhost:3002
✅ **Working:** Progress saving, lesson structure, keyboard layout

## Task: Improve Letter Pronunciation for Better Learning

### Problem
Individual letters are hard to hear when TTS just says the letter name. For example, typing "ф" might say "ef" which isn't helpful for learning the sound.

### Solution Needed
When a single letter is typed correctly, instead of sending just the letter to TTS, send the **phonetic sound** the letter makes.

### Key Information

#### Ukrainian Keyboard Data (Already in Code)
Located in `src/App.jsx` around line 4-44, each letter has:
```javascript
{ uk: 'ф', qwerty: 'a', sound: 'f', finger: 'pinky-l' }
{ uk: 'і', qwerty: 's', sound: 'ee', finger: 'ring-l' }
{ uk: 'а', qwerty: 'f', sound: 'ah', finger: 'index-l' }
```

The `sound` field contains the phonetic pronunciation!

#### Where TTS is Called
**File:** `src/App.jsx`

**Line ~615:** When correct letter typed:
```javascript
if (ttsEnabled) {
  speakUkrainian(targetChar, 0.9);  // <-- Currently sends just the letter
}
```

**Line ~649-657:** When word completed:
```javascript
if (ttsEnabled) {
  setTimeout(() => {
    speakUkrainian(currentTarget, 0.75);  // <-- This is fine, keep as-is
  }, 300);
}
```

#### What to Change
1. Find where `speakUkrainian(targetChar, 0.9)` is called (line ~615)
2. Look up the letter in `LETTER_INFO` object (already exists in code)
3. If it's a single letter AND has a `sound` field, send the sound instead
4. Otherwise send the letter/word as normal

#### Example Implementation
```javascript
// When correct letter typed
if (ttsEnabled) {
  // Look up phonetic sound
  const letterData = LETTER_INFO[targetChar];
  const textToSpeak = letterData?.sound || targetChar;
  speakUkrainian(textToSpeak, 0.9);
}
```

## Project Structure

```
ukrainian typing game/
├── src/
│   ├── App.jsx              <-- Main game component, EDIT THIS FILE
│   └── main.jsx
├── tts-server.py            <-- Python TTS server (Oleksa voice)
├── tts-repo/                <-- Ukrainian TTS library
├── tts-cache/               <-- Cached audio files
├── package.json
└── vite.config.js
```

## Technical Setup

### Starting the App
```bash
cd "C:/Users/michael/Desktop/ukrainian typing game"

# Option 1: Run everything together
npm start  # Runs both Vite dev server (port 5173) and will need TTS separately

# Option 2: Run separately
npm run dev           # Frontend at http://localhost:5173
python tts-server.py  # TTS server at http://localhost:3002
```

### TTS Server Details
- **Library:** https://github.com/robinhad/ukrainian-tts
- **Voice:** Oleksa (male)
- **Port:** 3002
- **Endpoint:** POST /tts with JSON body `{"text": "..."}`
- **Returns:** WAV audio file
- **Caching:** Automatic in `tts-cache/` directory

### Key Code Locations

**LETTER_INFO Object:** Line ~48 in `src/App.jsx`
```javascript
const LETTER_INFO = {};
UKRAINIAN_KEYBOARD.forEach(row => {
  row.forEach(key => {
    UK_TO_QWERTY[key.uk] = key.qwerty;
    LETTER_INFO[key.uk] = key;  // Contains: { uk, qwerty, sound, finger }
  });
});
```

**TTS Function:** Line ~328-359 in `src/App.jsx`
```javascript
const speakUkrainian = async (text, rate = 0.8) => {
  // Sends text to localhost:3002/tts
  // Plays returned audio
}
```

**Letter Typed Handler:** Line ~592-659 in `src/App.jsx`
```javascript
const handleKeyPress = useCallback((e) => {
  // ...
  if (key === targetChar || e.key === targetChar) {
    // Correct! Speak the letter using TTS
    if (ttsEnabled) {
      speakUkrainian(targetChar, 0.9);  // <-- CHANGE THIS
    }
    // ...
  }
  // ...
});
```

## Testing the Change

1. Edit `src/App.jsx`
2. Save (Vite will auto-reload)
3. Refresh browser at http://localhost:5173
4. Start Lesson 1 (Top Row) or Lesson 2 (Middle Row)
5. Type a letter - you should hear the phonetic sound instead of letter name

### Test Cases
- Type "ф" → should say "f" (not "ef")
- Type "і" → should say "ee" (not "i")
- Type "а" → should say "ah" (not "a")
- Complete word "від" → should still say full word "від" (unchanged)

## Important Notes

- **DON'T change word pronunciation** - only single letters
- **Keep the rate parameter** (0.9 for letters, 0.75 for words)
- **The TTS server is working** - no changes needed there
- **All phonetic sounds are already defined** in UKRAINIAN_KEYBOARD data
- **Progress saving works** - user's XP/achievements persist on refresh
- **Lessons are organized by row:** Top (1), Middle (2), Bottom (3), etc.

## Current State Summary
- Game is fully functional with 10 lessons
- Ukrainian TTS working with offline Oleksa voice
- Progress saves to localStorage
- Keyboard layouts correct (fixed earlier bugs)
- Only improvement needed: phonetic letter sounds for better learning

## Dependencies Already Installed
- Python packages: flask, flask-cors, ukrainian-tts, torch, espnet, etc.
- Node packages: vite, react, express, cors, node-fetch, concurrently

## Quick Reference - Ukrainian Alphabet Sounds
From `UKRAINIAN_KEYBOARD` in the code:
- й=y, ц=ts, у=oo, к=k, е=eh, н=n, г=h, ш=sh, щ=shch, з=z, х=kh, ї=yee
- ф=f, і=ee, в=v, а=ah, п=p, р=r, о=oh, л=l, д=d, ж=zh, є=yeh
- я=ya, ч=ch, с=s, м=m, и=ɪ, т=t, ь=(soft), б=b, ю=yu

Good luck! The change should be quick and straightforward.
