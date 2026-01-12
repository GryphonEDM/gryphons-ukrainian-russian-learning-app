import React, { useState, useEffect, useCallback, useRef } from 'react';

// Ukrainian keyboard layout data with pronunciation guides and finger positions
const UKRAINIAN_KEYBOARD = [
  [
    { uk: 'й', qwerty: 'q', sound: 'y (short)', ukrainianPhonetic: 'йот', finger: 'pinky-l' },
    { uk: 'ц', qwerty: 'w', sound: 'ts', ukrainianPhonetic: 'це', finger: 'ring-l' },
    { uk: 'у', qwerty: 'e', sound: 'oo', ukrainianPhonetic: 'у', finger: 'middle-l' },
    { uk: 'к', qwerty: 'r', sound: 'k', ukrainianPhonetic: 'ка', finger: 'index-l' },
    { uk: 'е', qwerty: 't', sound: 'eh', ukrainianPhonetic: 'е', finger: 'index-l' },
    { uk: 'н', qwerty: 'y', sound: 'n', ukrainianPhonetic: 'ен', finger: 'index-r' },
    { uk: 'г', qwerty: 'u', sound: 'h (voiced)', ukrainianPhonetic: 'ге', finger: 'index-r' },
    { uk: 'ш', qwerty: 'i', sound: 'sh', ukrainianPhonetic: 'ша', finger: 'middle-r' },
    { uk: 'щ', qwerty: 'o', sound: 'shch', ukrainianPhonetic: 'ща', finger: 'ring-r' },
    { uk: 'з', qwerty: 'p', sound: 'z', ukrainianPhonetic: 'зе', finger: 'pinky-r' },
    { uk: 'х', qwerty: '[', sound: 'kh', ukrainianPhonetic: 'ха', finger: 'pinky-r' },
    { uk: 'ї', qwerty: ']', sound: 'yee', ukrainianPhonetic: 'ї', finger: 'pinky-r' },
  ],
  [
    { uk: 'ф', qwerty: 'a', sound: 'f', ukrainianPhonetic: 'еф', finger: 'pinky-l' },
    { uk: 'і', qwerty: 's', sound: 'ee', ukrainianPhonetic: 'і', finger: 'ring-l' },
    { uk: 'в', qwerty: 'd', sound: 'v', ukrainianPhonetic: 'ве', finger: 'middle-l' },
    { uk: 'а', qwerty: 'f', sound: 'ah', ukrainianPhonetic: 'а', finger: 'index-l' },
    { uk: 'п', qwerty: 'g', sound: 'p', ukrainianPhonetic: 'пе', finger: 'index-l' },
    { uk: 'р', qwerty: 'h', sound: 'r (rolled)', ukrainianPhonetic: 'ер', finger: 'index-r' },
    { uk: 'о', qwerty: 'j', sound: 'oh', ukrainianPhonetic: 'о', finger: 'index-r' },
    { uk: 'л', qwerty: 'k', sound: 'l', ukrainianPhonetic: 'ел', finger: 'middle-r' },
    { uk: 'д', qwerty: 'l', sound: 'd', ukrainianPhonetic: 'де', finger: 'ring-r' },
    { uk: 'ж', qwerty: ';', sound: 'zh (pleasure)', ukrainianPhonetic: 'же', finger: 'pinky-r' },
    { uk: 'є', qwerty: "'", sound: 'yeh', ukrainianPhonetic: 'є', finger: 'pinky-r' },
  ],
  [
    { uk: 'я', qwerty: 'z', sound: 'ya', ukrainianPhonetic: 'йа', finger: 'pinky-l' },
    { uk: 'ч', qwerty: 'x', sound: 'ch', ukrainianPhonetic: 'че', finger: 'ring-l' },
    { uk: 'с', qwerty: 'c', sound: 's', ukrainianPhonetic: 'ес', finger: 'middle-l' },
    { uk: 'м', qwerty: 'v', sound: 'm', ukrainianPhonetic: 'ем', finger: 'index-l' },
    { uk: 'и', qwerty: 'b', sound: 'ɪ (short i)', ukrainianPhonetic: 'и', finger: 'index-l' },
    { uk: 'т', qwerty: 'n', sound: 't', ukrainianPhonetic: 'те', finger: 'index-r' },
    { uk: 'ь', qwerty: 'm', sound: '(soft sign)', ukrainianPhonetic: 'м\'який знак', finger: 'index-r' },
    { uk: 'б', qwerty: ',', sound: 'b', ukrainianPhonetic: 'бе', finger: 'middle-r' },
    { uk: 'ю', qwerty: '.', sound: 'yu', ukrainianPhonetic: 'ю', finger: 'ring-r' },
    { uk: '.', qwerty: '/', sound: '(period)', ukrainianPhonetic: 'крапка', finger: 'pinky-r' },
  ]
];

// Build lookup maps from keyboard data
const UK_TO_QWERTY = {};
const LETTER_INFO = {};
UKRAINIAN_KEYBOARD.forEach(row => {
  row.forEach(key => {
    UK_TO_QWERTY[key.uk] = key.qwerty;
    UK_TO_QWERTY[key.uk.toUpperCase()] = key.qwerty.toUpperCase();
    LETTER_INFO[key.uk] = key;
  });
});
UK_TO_QWERTY[' '] = ' ';
UK_TO_QWERTY["'"] = "'";
UK_TO_QWERTY['ґ'] = '`';

// Helper function to clean phonetic sounds for TTS
// Removes parenthetical explanations like "y (short)" -> "y"
const cleanSoundForTTS = (sound) => {
  if (!sound) return '';
  // Remove anything in parentheses and trim whitespace
  return sound.replace(/\([^)]*\)/g, '').trim();
};

// Word translations for vocabulary building
const TRANSLATIONS = {
  // Level 1
  'від': 'from', 'рід': 'kin/family', 'вода': 'water', 'пора': 'time/season',
  'лапа': 'paw', 'діло': 'deed/matter', 'воля': 'freedom', 'доля': 'fate',
  'пара': 'pair/steam', 'рада': 'advice/council',
  // Level 2
  'око': 'eye', 'вухо': 'ear', 'море': 'sea', 'поле': 'field',
  'село': 'village', 'небо': 'sky', 'дерево': 'tree', 'озеро': 'lake',
  // Level 3
  'кіт': 'cat', 'сон': 'dream/sleep', 'там': 'there', 'тут': 'here',
  'так': 'yes', 'ні': 'no', 'він': 'he', 'вона': 'she', 'вони': 'they',
  'мати': 'mother', 'тато': 'dad',
  // Level 4
  'хліб': 'bread', 'цей': 'this', 'цукор': 'sugar', 'школа': 'school',
  'щастя': 'happiness', 'зима': 'winter', 'їжа': 'food', 'їхати': 'to go (vehicle)',
  // Level 5
  'яблуко': 'apple', 'чай': 'tea', 'читати': 'to read', 'любов': 'love',
  'людина': 'person', 'будинок': 'building', 'бути': 'to be', 'юнак': 'young man',
  // Level 6
  'і': 'and', 'в': 'in', 'на': 'on', 'що': 'what/that', 'як': 'how',
  'але': 'but', 'це': 'this is', 'той': 'that', 'весь': 'all/whole',
  'свій': 'own', 'один': 'one', 'такий': 'such', 'тільки': 'only',
  'можна': 'can/may', 'треба': 'need to',
  // Level 7
  'привіт': 'hi', 'добрий': 'good', 'ранок': 'morning', 'день': 'day',
  'вечір': 'evening', 'дякую': 'thank you', 'будь ласка': 'please',
  'добре': 'good/okay', 'до побачення': 'goodbye',
  // Level 8
  'два': 'two', 'три': 'three', 'чотири': 'four', "п'ять": 'five',
  'шість': 'six', 'сім': 'seven', 'вісім': 'eight', "дев'ять": 'nine',
  'десять': 'ten', 'сто': 'hundred', 'тисяча': 'thousand',
  // Level 9
  'борщ': 'borscht (beet soup)', 'вареники': 'dumplings', 'сало': 'cured pork fat',
  'молоко': 'milk', 'кава': 'coffee', "м'ясо": 'meat', 'риба': 'fish',
  'овочі': 'vegetables', 'фрукти': 'fruits',
  // Level 10
  'я люблю': 'I love', 'це добре': 'this is good', 'як справи': 'how are you?',
  'все гаразд': 'everything is fine', 'до зустрічі': 'see you',
  'слава україні': 'glory to Ukraine', 'я вивчаю': 'I am learning',
  'дуже дякую': 'thank you very much',
  // Bonus
  'україна': 'Ukraine', 'київ': 'Kyiv', 'мова': 'language', 'друг': 'friend',
};

// Lesson content organized by keyboard rows
// Top row:    й ц у к е н г ш щ з х ї (qwerty: q w e r t y u i o p [ ])
// Middle row: ф і в а п р о л д ж є (qwerty: a s d f g h j k l ; ')
// Bottom row: я ч с м и т ь б ю (qwerty: z x c v b n m , .)

const ALPHABET_CHALLENGE = {
  name: "Alphabet Speed Run",
  nameUk: "Абетка",
  description: "Type the Ukrainian alphabet A-Я as fast as you can!",
  hint: "Type each letter in order - loops automatically!",
  letters: ['а', 'б', 'в', 'г', 'д', 'е', 'є', 'ж', 'з', 'и', 'і', 'ї', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я'],
  words: [],
  xpPerLetter: 5,
  xpPerWord: 0,
  requiredXp: 0,
  isAlphabetMode: true
};

const LESSONS = {
  1: {
    name: "Top Row",
    nameUk: "Верхній ряд",
    icon: "⬆️",
    description: "Learn the top row of the Ukrainian keyboard",
    hint: "й ц у к е н г ш щ з х ї",
    letters: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ї'],
    words: ['ще', 'єн', 'кухне', 'щуку', 'цех', 'неї', 'нею', 'ніж', 'шукун'],
    xpPerLetter: 10,
    xpPerWord: 25,
    requiredXp: 0
  },
  2: {
    name: "Middle Row",
    nameUk: "Середній ряд",
    icon: "🏠",
    description: "Learn the home row - where your fingers rest!",
    hint: "ф і в а п р о л д ж є",
    letters: ['ф', 'і', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'є'],
    words: ['від', 'рід', 'вода', 'пора', 'лапа', 'діло', 'воля', 'доля', 'пара', 'рада', 'жар', 'вже'],
    xpPerLetter: 10,
    xpPerWord: 25,
    requiredXp: 0
  },
  3: {
    name: "Bottom Row",
    nameUk: "Нижній ряд",
    icon: "⬇️",
    description: "Learn the bottom row of the keyboard",
    hint: "я ч с м и т ь б ю",
    letters: ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
    words: ['там', 'тут', 'сам', 'мить', 'бути', 'чути', 'сміх', 'миття', 'буття', 'тиша'],
    xpPerLetter: 10,
    xpPerWord: 25,
    requiredXp: 0
  },
  4: {
    name: "Top + Middle",
    nameUk: "Верх + Середина",
    icon: "🔀",
    description: "Combine top and middle rows!",
    hint: "Practice switching between rows",
    letters: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ї', 'ф', 'і', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'є'],
    words: ['він', 'вона', 'око', 'вухо', 'поле', 'школа', 'дерево', 'озеро', 'кіно', 'кефір'],
    xpPerLetter: 12,
    xpPerWord: 30,
    requiredXp: 150
  },
  5: {
    name: "All Rows",
    nameUk: "Всі ряди",
    icon: "⌨️",
    description: "Use the entire keyboard!",
    hint: "You know all the keys now!",
    letters: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ї', 'ф', 'і', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'є', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
    words: ['кіт', 'сон', 'мати', 'тато', 'хліб', 'яблуко', 'читати', 'любов', 'будинок'],
    xpPerLetter: 15,
    xpPerWord: 40,
    requiredXp: 350
  },
  6: {
    name: "Common Words",
    nameUk: "Часті слова",
    icon: "📚",
    description: "Practice the most common Ukrainian words!",
    hint: "These words appear everywhere in Ukrainian",
    letters: [],
    words: ['і', 'в', 'на', 'що', 'як', 'але', 'це', 'той', 'весь', 'свій', 'один', 'такий', 'тільки', 'можна', 'треба'],
    xpPerLetter: 15,
    xpPerWord: 50,
    requiredXp: 600
  },
  7: {
    name: "Greetings",
    nameUk: "Привітання",
    icon: "👋",
    description: "Learn essential greetings and phrases!",
    hint: "Impress your Ukrainian friends!",
    letters: [],
    words: ['привіт', 'добрий', 'ранок', 'день', 'вечір', 'дякую', 'будь ласка', 'так', 'ні', 'добре', 'до побачення'],
    xpPerLetter: 18,
    xpPerWord: 60,
    requiredXp: 900
  },
  8: {
    name: "Numbers",
    nameUk: "Числа",
    icon: "🔢",
    description: "Count in Ukrainian!",
    hint: "один, два, три... let's go!",
    letters: [],
    words: ['один', 'два', 'три', 'чотири', "п'ять", 'шість', 'сім', 'вісім', "дев'ять", 'десять', 'сто', 'тисяча'],
    xpPerLetter: 18,
    xpPerWord: 55,
    requiredXp: 1250
  },
  9: {
    name: "Food",
    nameUk: "Їжа",
    icon: "🍲",
    description: "Delicious Ukrainian vocabulary!",
    hint: "Ukrainian cuisine is amazing!",
    letters: [],
    words: ['борщ', 'вареники', 'сало', 'хліб', 'молоко', 'вода', 'кава', 'чай', "м'ясо", 'риба', 'овочі', 'фрукти'],
    xpPerLetter: 20,
    xpPerWord: 65,
    requiredXp: 1650
  },
  10: {
    name: "Phrases",
    nameUk: "Фрази",
    icon: "💬",
    description: "Put it all together with full sentences!",
    hint: "You're ready for real Ukrainian text!",
    letters: [],
    words: ['я люблю', 'це добре', 'як справи', 'все гаразд', 'до зустрічі', 'слава україні', 'я вивчаю', 'дуже дякую'],
    xpPerLetter: 20,
    xpPerWord: 80,
    requiredXp: 2100
  }
};

// Achievements - expanded list
const ACHIEVEMENTS = [
  { id: 'first_letter', name: 'First Steps', nameUk: 'Перші кроки', desc: 'Type your first Ukrainian letter', icon: '🐣', xp: 50 },
  { id: 'first_word', name: 'Word Smith', nameUk: 'Словотворець', desc: 'Complete your first word', icon: '📝', xp: 75 },
  { id: 'ten_streak', name: 'On Fire!', nameUk: 'У вогні!', desc: 'Get a 10 letter streak', icon: '🔥', xp: 100 },
  { id: 'twenty_streak', name: 'Unstoppable', nameUk: 'Нестримний', desc: 'Get a 20 letter streak', icon: '💪', xp: 175 },
  { id: 'fifty_streak', name: 'Legendary', nameUk: 'Легендарний', desc: 'Get a 50 letter streak', icon: '🌟', xp: 300 },
  { id: 'level_3', name: 'Rising Star', nameUk: 'Висхідна зірка', desc: 'Unlock level 3', icon: '⭐', xp: 150 },
  { id: 'level_5', name: 'Halfway Hero', nameUk: 'Герой половини шляху', desc: 'Unlock level 5', icon: '🏆', xp: 300 },
  { id: 'level_10', name: 'Master', nameUk: 'Майстер', desc: 'Unlock level 10', icon: '👑', xp: 500 },
  { id: 'speed_demon', name: 'Speed Demon', nameUk: 'Швидкий демон', desc: 'Type 5 letters in 3 seconds', icon: '⚡', xp: 200 },
  { id: 'perfect_word', name: 'Perfectionist', nameUk: 'Перфекціоніст', desc: 'Complete a word with no mistakes', icon: '💎', xp: 125 },
  { id: 'ten_perfect', name: 'Flawless', nameUk: 'Бездоганний', desc: 'Complete 10 words without mistakes', icon: '✨', xp: 250 },
  { id: 'hundred_letters', name: 'Century Club', nameUk: 'Клуб сотні', desc: 'Type 100 letters total', icon: '💯', xp: 200 },
  { id: 'five_hundred', name: 'Dedicated', nameUk: 'Відданий', desc: 'Type 500 letters total', icon: '📚', xp: 350 },
  { id: 'thousand_letters', name: 'Thousand Strong', nameUk: 'Тисяча сильних', desc: 'Type 1000 letters total', icon: '🎖️', xp: 500 },
  { id: 'polyglot', name: 'Polyglot', nameUk: 'Поліглот', desc: 'Complete all 10 levels', icon: '🌍', xp: 750 },
  { id: 'night_owl', name: 'Night Owl', nameUk: 'Нічна сова', desc: 'Practice after 10 PM', icon: '🦉', xp: 100 },
  { id: 'early_bird', name: 'Early Bird', nameUk: 'Рання пташка', desc: 'Practice before 7 AM', icon: '🐦', xp: 100 },
  { id: 'home_row_master', name: 'Home Row Master', nameUk: 'Майстер домашнього ряду', desc: 'Complete 50 home row words', icon: '🏠', xp: 200 },
  { id: 'vowel_master', name: 'Vowel Master', nameUk: 'Майстер голосних', desc: 'Type all 10 Ukrainian vowels', icon: '🅰️', xp: 150 },
];

// Fun encouraging messages
const ENCOURAGEMENTS = [
  "Чудово! (Wonderful!)",
  "Молодець! (Well done!)",
  "Супер! (Super!)",
  "Відмінно! (Excellent!)",
  "Так тримати! (Keep it up!)",
  "Браво! (Bravo!)",
  "Неймовірно! (Incredible!)",
  "Фантастика! (Fantastic!)"
];

const MISTAKE_MESSAGES = [
  "Try again! Спробуй ще!",
  "Almost! Майже!",
  "Keep going! Продовжуй!",
  "You've got this! Ти зможеш!",
  "No worries! Не хвилюйся!"
];

// Sound effects using Web Audio API
const playSound = (type, audioContext) => {
  if (!audioContext) return;
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } else if (type === 'wrong') {
      oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.12);
    } else if (type === 'complete') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.35);
    } else if (type === 'achievement') {
      oscillator.frequency.setValueAtTime(392, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.12);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.24);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.36);
      gainNode.gain.setValueAtTime(0.18, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  } catch (e) { /* Audio not supported */ }
};

const createAudioContext = () => {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { return null; }
};

// Text-to-Speech for Ukrainian using local Hugging Face server
let currentAudio = null;

const speakUkrainian = async (text, rate = 0.8) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
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
    currentAudio = audio;

    // Return a promise that resolves when audio finishes playing
    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
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
};

export default function UkrainianTypingGame() {
  // Game state
  const [gameMode, setGameMode] = useState('menu'); // menu, letters, words, explore
  const [exploreSelectedKey, setExploreSelectedKey] = useState(null);
  const audioContextRef = useRef(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showKeyboardSetup, setShowKeyboardSetup] = useState(false);
  
  // Progress tracking (persisted)
  const [xp, setXp] = useState(0);
  const [totalLettersTyped, setTotalLettersTyped] = useState(0);
  const [totalWordsCompleted, setTotalWordsCompleted] = useState(0);
  const [perfectWordsCount, setPerfectWordsCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [recentAchievement, setRecentAchievement] = useState(null);
  const [typedVowels, setTypedVowels] = useState([]);
  
  // Settings (persisted)
  const [showTranslations, setShowTranslations] = useState(true);
  const [showPronunciation, setShowPronunciation] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true); // Text-to-speech pronunciation
  
  // Current exercise state
  const [currentTarget, setCurrentTarget] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wordMistakes, setWordMistakes] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  const [mistakeMessage, setMistakeMessage] = useState('');
  const [highlightKey, setHighlightKey] = useState('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [levelProgress, setLevelProgress] = useState(0);
  
  // Timing for speed achievement
  const [recentKeyTimes, setRecentKeyTimes] = useState([]);

  // Alphabet mode timing
  const [alphabetLoopHistory, setAlphabetLoopHistory] = useState([]);
  const [alphabetBestTime, setAlphabetBestTime] = useState(null);
  const [alphabetLoopStartTime, setAlphabetLoopStartTime] = useState(null);
  const [showGreenFlash, setShowGreenFlash] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const hasLoadedRef = useRef(false);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ukrainianTypingProgress');
      console.log('[Save] Loading saved progress:', saved ? 'found' : 'none');
      if (saved) {
        const data = JSON.parse(saved);
        setXp(data.xp || 0);
        setTotalLettersTyped(data.totalLettersTyped || 0);
        setTotalWordsCompleted(data.totalWordsCompleted || 0);
        setPerfectWordsCount(data.perfectWordsCount || 0);
        setBestStreak(data.bestStreak || 0);
        setAchievements(data.achievements || []);
        setTypedVowels(data.typedVowels || []);
        setShowTranslations(data.showTranslations !== false);
        setShowPronunciation(data.showPronunciation !== false);
        setSoundEnabled(data.soundEnabled !== false);
        setTtsEnabled(data.ttsEnabled !== false);
        console.log('[Save] Restored XP:', data.xp, 'Letters:', data.totalLettersTyped);
      }
    } catch (e) {
      console.log('[Save] Could not load saved progress:', e);
    }

    // Mark as loaded after a small delay to let state settle
    setTimeout(() => {
      hasLoadedRef.current = true;
      console.log('[Save] Ready to save');
    }, 100);
  }, []);

  // Save progress when it changes (only after initial load)
  useEffect(() => {
    if (!hasLoadedRef.current) {
      console.log('[Save] Skipping save - not loaded yet');
      return;
    }
    try {
      const data = {
        xp, totalLettersTyped, totalWordsCompleted, perfectWordsCount,
        bestStreak, achievements, typedVowels,
        showTranslations, showPronunciation, soundEnabled, ttsEnabled
      };
      localStorage.setItem('ukrainianTypingProgress', JSON.stringify(data));
      console.log('[Save] Saved progress - XP:', xp, 'Letters:', totalLettersTyped);
    } catch (e) {
      console.log('[Save] Could not save progress:', e);
    }
  }, [xp, totalLettersTyped, totalWordsCompleted, perfectWordsCount, bestStreak, achievements, typedVowels, showTranslations, showPronunciation, soundEnabled, ttsEnabled]);
  
  // Get unlocked levels based on XP
  const getUnlockedLevels = useCallback(() => {
    const unlocked = [1];
    Object.entries(LESSONS).forEach(([num, lesson]) => {
      if (xp >= lesson.requiredXp) {
        unlocked.push(parseInt(num));
      }
    });
    return [...new Set(unlocked)];
  }, [xp]);
  
  const unlockedLevels = getUnlockedLevels();
  
  // Calculate player level from XP
  const getPlayerLevel = (xp) => {
    if (xp < 150) return 1;
    if (xp < 350) return 2;
    if (xp < 600) return 3;
    if (xp < 900) return 4;
    if (xp < 1250) return 5;
    if (xp < 1650) return 6;
    if (xp < 2100) return 7;
    if (xp < 2600) return 8;
    if (xp < 3200) return 9;
    return 10;
  };
  
  const xpForPlayerLevel = (level) => {
    const thresholds = [0, 150, 350, 600, 900, 1250, 1650, 2100, 2600, 3200, 99999];
    return thresholds[level] || 0;
  };
  
  const playerLevel = getPlayerLevel(xp);

  // Check and award achievements
  const checkAchievements = useCallback((stats) => {
    const { newXp, newStreak, newTotalLetters, newWordsCompleted, newPerfectWords, newTypedVowels } = stats;
    const newAchievements = [...achievements];
    let awarded = null;

    const tryAward = (id) => {
      if (!newAchievements.includes(id)) {
        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (achievement) {
          newAchievements.push(id);
          awarded = achievement;
          setXp(prev => prev + achievement.xp);
        }
      }
    };

    // Letter milestones
    if (newTotalLetters >= 1) tryAward('first_letter');
    if (newTotalLetters >= 100) tryAward('hundred_letters');
    if (newTotalLetters >= 500) tryAward('five_hundred');
    if (newTotalLetters >= 1000) tryAward('thousand_letters');
    
    // Streak achievements
    if (newStreak >= 10) tryAward('ten_streak');
    if (newStreak >= 20) tryAward('twenty_streak');
    if (newStreak >= 50) tryAward('fifty_streak');
    
    // Word achievements
    if (newWordsCompleted >= 1) tryAward('first_word');
    
    // Perfect word achievements
    if (newPerfectWords >= 1) tryAward('perfect_word');
    if (newPerfectWords >= 10) tryAward('ten_perfect');
    
    // Level unlocks based on XP thresholds
    if (newXp >= LESSONS[3]?.requiredXp) tryAward('level_3');
    if (newXp >= LESSONS[5]?.requiredXp) tryAward('level_5');
    if (newXp >= LESSONS[10]?.requiredXp) tryAward('level_10');
    if (unlockedLevels.length >= 10) tryAward('polyglot');
    
    // Time-based achievements
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) tryAward('night_owl');
    if (hour >= 5 && hour < 7) tryAward('early_bird');
    
    // Vowel master - check if all 10 Ukrainian vowels have been typed
    const allVowels = ['а', 'е', 'и', 'і', 'о', 'у', 'є', 'ї', 'ю', 'я'];
    if (newTypedVowels && allVowels.every(v => newTypedVowels.includes(v))) {
      tryAward('vowel_master');
    }

    if (awarded) {
      setAchievements(newAchievements);
      setRecentAchievement(awarded);
      setTimeout(() => setRecentAchievement(null), 3500);
    }
  }, [achievements, unlockedLevels]);

  // Check speed achievement
  const checkSpeedAchievement = useCallback(() => {
    const now = Date.now();
    const recent = [...recentKeyTimes, now].filter(t => now - t < 3000);
    setRecentKeyTimes(recent);
    
    if (recent.length >= 5 && !achievements.includes('speed_demon')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'speed_demon');
      setAchievements(prev => [...prev, 'speed_demon']);
      setXp(prev => prev + achievement.xp);
      setRecentAchievement(achievement);
      setTimeout(() => setRecentAchievement(null), 3000);
    }
  }, [recentKeyTimes, achievements]);

  // Get next target (letter or word)
  const getNextTarget = useCallback((mode, level, currentLetterIndex = 0) => {
    // Alphabet mode
    if (mode === 'alphabet') {
      return ALPHABET_CHALLENGE.letters[currentLetterIndex % ALPHABET_CHALLENGE.letters.length];
    }

    const lesson = LESSONS[level];
    if (mode === 'letters' && lesson.letters.length > 0) {
      return lesson.letters[Math.floor(Math.random() * lesson.letters.length)];
    } else {
      return lesson.words[Math.floor(Math.random() * lesson.words.length)];
    }
  }, []);

  // Start an exercise
  const startExercise = useCallback((mode, level) => {
    setGameMode(mode);
    setCurrentLevel(level);
    setCurrentTarget(getNextTarget(mode, level, 0));
    setCurrentInput('');
    setCurrentIndex(0);
    setMistakes(0);
    setWordMistakes(0);
    setEncouragement('');
    setMistakeMessage('');
    setWordsCompleted(0);
    setLevelProgress(0);

    // Start timer for alphabet mode
    if (mode === 'alphabet') {
      setAlphabetLoopStartTime(Date.now());
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [getNextTarget]);

  // Handle key press
  const handleKeyPress = useCallback((e) => {
    if (gameMode === 'menu' || gameMode === 'explore') return;
    
    const key = e.key.toLowerCase();
    const targetChar = currentTarget[currentIndex]?.toLowerCase();
    
    if (!targetChar) return;
    
    // Show which key should be pressed
    setHighlightKey(targetChar);
    
    if (key === targetChar || e.key === targetChar) {
      checkSpeedAchievement();

      // Track vowels for achievement
      const vowels = ['а', 'е', 'и', 'і', 'о', 'у', 'є', 'ї', 'ю', 'я'];
      let newTypedVowels = [...typedVowels];
      if (vowels.includes(targetChar) && !typedVowels.includes(targetChar)) {
        newTypedVowels = [...typedVowels, targetChar];
        setTypedVowels(newTypedVowels);
      }

      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentInput(prev => prev + currentTarget[currentIndex]);

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);

      const newTotalLetters = totalLettersTyped + 1;
      setTotalLettersTyped(newTotalLetters);

      const lesson = gameMode === 'alphabet' ? ALPHABET_CHALLENGE : LESSONS[currentLevel];
      setXp(prev => prev + lesson.xpPerLetter);
      setMistakeMessage('');

      // Word/target completed
      if (newIndex >= currentTarget.length) {
        // ALPHABET MODE - Special handling
        if (gameMode === 'alphabet') {
          const nextLetterIndex = wordsCompleted + 1;

          // Speak the letter that was just typed
          if (ttsEnabled) {
            const letterData = LETTER_INFO[targetChar];
            const letterSound = letterData?.ukrainianPhonetic || targetChar;
            speakUkrainian(letterSound, 0.9);
          }

          // Check if completed full loop (33 letters)
          if (nextLetterIndex >= lesson.letters.length) {
            // Calculate loop time
            const loopTime = Date.now() - alphabetLoopStartTime;
            const newHistory = [...alphabetLoopHistory, loopTime];
            setAlphabetLoopHistory(newHistory);

            // Update best time
            if (alphabetBestTime === null || loopTime < alphabetBestTime) {
              setAlphabetBestTime(loopTime);
            }

            // Flash green
            setShowGreenFlash(true);
            setTimeout(() => setShowGreenFlash(false), 200);

            // Restart loop immediately after a brief delay
            setTimeout(() => {
              setWordsCompleted(0);
              setCurrentTarget(getNextTarget(gameMode, currentLevel, 0));
              setCurrentInput('');
              setCurrentIndex(0);
              setWordMistakes(0);
              setAlphabetLoopStartTime(Date.now());
            }, 300);
          } else {
            // Move to next letter in alphabet immediately
            setWordsCompleted(nextLetterIndex);
            setCurrentTarget(getNextTarget(gameMode, currentLevel, nextLetterIndex));
            setCurrentInput('');
            setCurrentIndex(0);
            setWordMistakes(0);
          }
        } else {
          // NORMAL MODE
          const newWordsCompleted = wordsCompleted + 1;
          setWordsCompleted(newWordsCompleted);
          setTotalWordsCompleted(prev => prev + 1);
          setXp(prev => prev + lesson.xpPerWord);
          setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);

          // Track perfect words
          let newPerfectWords = perfectWordsCount;
          if (wordMistakes === 0) {
            newPerfectWords = perfectWordsCount + 1;
            setPerfectWordsCount(newPerfectWords);
          }

          // Progress tracking (need 10 words to "complete" a session)
          const newProgress = Math.min(100, (newWordsCompleted / 10) * 100);
          setLevelProgress(newProgress);

          // Check all achievements
          checkAchievements({
            newXp: xp + lesson.xpPerLetter + lesson.xpPerWord,
            newStreak,
            newTotalLetters,
            newWordsCompleted: totalWordsCompleted + 1,
            newPerfectWords,
            newTypedVowels
          });

          // Speak letter, then word, then move to next word - all sequentially
          if (ttsEnabled) {
            (async () => {
              const letterData = LETTER_INFO[targetChar];
              const letterSound = letterData?.ukrainianPhonetic || targetChar;
              await speakUkrainian(letterSound, 0.9); // Wait for letter to finish
              await speakUkrainian(currentTarget, 0.75); // Wait for word to finish

              // Move to next word only after all speech is done
              setCurrentTarget(getNextTarget(gameMode, currentLevel));
              setCurrentInput('');
              setCurrentIndex(0);
              setWordMistakes(0);
              setEncouragement('');
            })();
          } else {
            // If TTS is disabled, move to next word after brief pause
            setTimeout(() => {
              setCurrentTarget(getNextTarget(gameMode, currentLevel));
              setCurrentInput('');
              setCurrentIndex(0);
              setWordMistakes(0);
              setEncouragement('');
            }, 800);
          }
        }
      } else {
        // Not word completion - just speak the letter
        if (ttsEnabled) {
          const letterData = LETTER_INFO[targetChar];
          const textToSpeak = letterData?.ukrainianPhonetic || targetChar;
          speakUkrainian(textToSpeak, 0.9);
        }
        // Check achievements for letter progress
        checkAchievements({
          newXp: xp + lesson.xpPerLetter,
          newStreak,
          newTotalLetters,
          newWordsCompleted: totalWordsCompleted,
          newPerfectWords: perfectWordsCount,
          newTypedVowels
        });
      }
    } else if (key.length === 1) {
      // Wrong key
      if (soundEnabled) {
        if (!audioContextRef.current) {
          audioContextRef.current = createAudioContext();
        }
        playSound('wrong', audioContextRef.current);
      }
      setMistakes(prev => prev + 1);
      setWordMistakes(prev => prev + 1);
      setStreak(0);
      setMistakeMessage(MISTAKE_MESSAGES[Math.floor(Math.random() * MISTAKE_MESSAGES.length)]);
      setEncouragement('');
    }
  }, [gameMode, currentTarget, currentIndex, currentLevel, streak, bestStreak, xp,
      totalLettersTyped, totalWordsCompleted, wordsCompleted, wordMistakes, perfectWordsCount,
      typedVowels, soundEnabled, ttsEnabled, checkAchievements, checkSpeedAchievement, getNextTarget,
      alphabetLoopStartTime, alphabetLoopHistory, alphabetBestTime]);

  // Keyboard listener
  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [handleKeyPress]);

  // Finger color mapping
  const fingerColors = {
    'pinky-l': '#e74c3c',
    'ring-l': '#e67e22', 
    'middle-l': '#f1c40f',
    'index-l': '#2ecc71',
    'index-r': '#2ecc71',
    'middle-r': '#f1c40f',
    'ring-r': '#e67e22',
    'pinky-r': '#e74c3c',
  };

  // Virtual keyboard component with pronunciation hints
  const VirtualKeyboard = ({ highlight }) => (
    <div className="keyboard">
      {UKRAINIAN_KEYBOARD.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((keyData) => {
            const letter = keyData.uk;
            const isHighlight = highlight === letter;
            return (
              <div
                key={letter}
                className={`key ${isHighlight ? 'highlight' : ''} ${rowIndex === 1 ? 'home-row' : ''}`}
                style={{ '--finger-color': fingerColors[keyData.finger] }}
                title={showPronunciation ? `Sound: ${keyData.sound}` : ''}
              >
                <span className="uk-letter">{letter}</span>
                <span className="qwerty-letter">{keyData.qwerty}</span>
                {showPronunciation && isHighlight && keyData.sound && (
                  <span className="sound-hint">{keyData.sound}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div className="keyboard-row">
        <div className={`key space-key ${highlight === ' ' ? 'highlight' : ''}`}>
          <span className="uk-letter">пробіл (space)</span>
        </div>
      </div>
      <div className="finger-legend">
        <span style={{color: fingerColors['pinky-l']}}>● Мізинець (Pinky)</span>
        <span style={{color: fingerColors['ring-l']}}>● Безіменний (Ring)</span>
        <span style={{color: fingerColors['middle-l']}}>● Середній (Middle)</span>
        <span style={{color: fingerColors['index-l']}}>● Вказівний (Index)</span>
      </div>
    </div>
  );

  // Progress bar component
  const ProgressBar = ({ value, max, label }) => (
    <div className="progress-container">
      <div className="progress-label">{label}</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <div className="progress-text">{value} / {max}</div>
    </div>
  );

  // Achievement popup with Ukrainian name
  const AchievementPopup = ({ achievement }) => (
    <div className="achievement-popup">
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-info">
        <div className="achievement-title">🎉 Achievement Unlocked!</div>
        <div className="achievement-name">{achievement.name}</div>
        {achievement.nameUk && <div className="achievement-name-uk">{achievement.nameUk}</div>}
        <div className="achievement-xp">+{achievement.xp} XP</div>
      </div>
    </div>
  );

  // Keyboard setup modal
  const KeyboardSetupModal = () => (
    <div className="modal-overlay" onClick={() => setShowKeyboardSetup(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>⌨️ Setting Up Your Ukrainian Keyboard</h2>
        
        <div className="setup-section">
          <h3>🪟 Windows</h3>
          <ol>
            <li>Go to <strong>Settings → Time & Language → Language</strong></li>
            <li>Click <strong>Add a language</strong></li>
            <li>Search for <strong>Ukrainian</strong> and install it</li>
            <li>Press <strong>Win + Space</strong> to switch between languages</li>
          </ol>
        </div>
        
        <div className="setup-section">
          <h3>🍎 Mac</h3>
          <ol>
            <li>Go to <strong>System Preferences → Keyboard → Input Sources</strong></li>
            <li>Click <strong>+</strong> and search for <strong>Ukrainian</strong></li>
            <li>Add it and check "Show Input menu in menu bar"</li>
            <li>Press <strong>Ctrl + Space</strong> to switch</li>
          </ol>
        </div>
        
        <div className="setup-section">
          <h3>🐧 Linux</h3>
          <ol>
            <li>Go to <strong>Settings → Region & Language</strong></li>
            <li>Click <strong>+</strong> under Input Sources</li>
            <li>Select <strong>Ukrainian</strong></li>
            <li>Press <strong>Super + Space</strong> to switch</li>
          </ol>
        </div>
        
        <div className="setup-tip">
          <strong>💡 Pro Tip:</strong> Your physical keyboard stays the same! When you switch to Ukrainian, pressing 'A' types 'Ф', pressing 'S' types 'І', etc. The virtual keyboard shows you which physical key to press.
        </div>
        
        <button className="modal-close-btn" onClick={() => setShowKeyboardSetup(false)}>
          Got it! Зрозуміло! ✓
        </button>
      </div>
    </div>
  );

  // Level select card with icons and mode selection
  const LevelCard = ({ level, unlocked }) => {
    const lesson = LESSONS[level];
    return (
      <div className={`level-card ${unlocked ? 'unlocked' : 'locked'}`}>
        <div className="level-header">
          <span className="level-icon">{lesson.icon}</span>
          <span className="level-number">Lesson {level}</span>
        </div>
        <div className="level-name">{lesson.name}</div>
        {lesson.nameUk && <div className="level-name-uk">{lesson.nameUk}</div>}
        <div className="level-desc">
          {unlocked ? lesson.description : `🔒 Requires ${lesson.requiredXp} XP`}
        </div>
        {unlocked && (
          <>
            <div className="level-preview">
              {lesson.letters.length > 0 
                ? `Letters: ${lesson.letters.slice(0, 5).join(' ')}${lesson.letters.length > 5 ? '...' : ''}`
                : `Words: ${lesson.words.slice(0, 3).join(', ')}...`
              }
            </div>
            <div className="level-actions">
              {lesson.letters.length > 0 && (
                <button 
                  className="level-btn letters-btn"
                  onClick={(e) => { e.stopPropagation(); startExercise('letters', level); }}
                >
                  Letters
                </button>
              )}
              <button 
                className="level-btn words-btn"
                onClick={(e) => { e.stopPropagation(); startExercise('words', level); }}
              >
                Words
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const currentPlayerLevel = playerLevel;
  const currentLevelXp = xpForPlayerLevel(currentPlayerLevel - 1);
  const nextLevelXp = xpForPlayerLevel(currentPlayerLevel);

  return (
    <div className="game-container">
      {/* Green flash on alphabet loop completion */}
      {showGreenFlash && <div className="green-flash-overlay" />}

      {/* Achievement popup */}
      {recentAchievement && <AchievementPopup achievement={recentAchievement} />}

      {/* Keyboard setup modal */}
      {showKeyboardSetup && <KeyboardSetupModal />}
      
      {/* Header stats */}
      <header className="game-header">
        <div className="header-left">
          <div className="logo" onClick={() => setGameMode('menu')} style={{cursor: 'pointer'}}>
            <span className="logo-icon">🇺🇦</span>
            <span className="logo-text">Kyiv Arcade</span>
          </div>
        </div>
        <div className="header-center">
          <div className="stat-group">
            <div className="stat">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">Lvl {currentPlayerLevel}</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100}%` }} />
              <span className="xp-text">{xp} XP</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="stat">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{streak}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{bestStreak}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="game-main">
        {gameMode === 'menu' ? (
          <div className="menu-screen">
            <div className="menu-hero">
              <h1>Learn Ukrainian Typing</h1>
              <p>Master the Ukrainian keyboard one letter at a time!</p>
              
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="qs-value">{totalLettersTyped}</span>
                  <span className="qs-label">Letters Typed</span>
                </div>
                <div className="quick-stat">
                  <span className="qs-value">{totalWordsCompleted}</span>
                  <span className="qs-label">Words Completed</span>
                </div>
                <div className="quick-stat">
                  <span className="qs-value">{bestStreak}</span>
                  <span className="qs-label">Best Streak</span>
                </div>
              </div>
              
              <div className="menu-actions">
                <button className="explore-button" onClick={() => setGameMode('explore')}>
                  🔍 Explore Keyboard
                </button>
                <button className="setup-button" onClick={() => setShowKeyboardSetup(true)}>
                  ⌨️ Keyboard Setup Guide
                </button>
              </div>
            </div>

            {/* Alphabet Speed Run Challenge */}
            <div className="alphabet-challenge-section">
              <h2>⚡ Mini-Game Challenge</h2>
              <div className="alphabet-challenge-card">
                <div className="challenge-info">
                  <h3>🔤 {ALPHABET_CHALLENGE.name}</h3>
                  <p className="challenge-desc">{ALPHABET_CHALLENGE.description}</p>
                  <p className="challenge-hint">{ALPHABET_CHALLENGE.hint}</p>
                  {alphabetBestTime && (
                    <p className="challenge-record">🏆 Your Best: {(alphabetBestTime / 1000).toFixed(2)}s</p>
                  )}
                </div>
                <button
                  className="challenge-start-btn"
                  onClick={() => startExercise('alphabet', 0)}
                >
                  Start Challenge
                </button>
              </div>
            </div>

            <div className="level-grid">
              {Object.keys(LESSONS).map(level => (
                <LevelCard
                  key={level}
                  level={parseInt(level)}
                  unlocked={unlockedLevels.includes(parseInt(level))}
                />
              ))}
            </div>

            <div className="achievements-section">
              <h2>🏅 Achievements ({achievements.length}/{ACHIEVEMENTS.length})</h2>
              <div className="achievements-grid">
                {ACHIEVEMENTS.map(a => (
                  <div 
                    key={a.id} 
                    className={`achievement-badge ${achievements.includes(a.id) ? 'earned' : 'locked'}`}
                    title={`${a.name}: ${a.desc}`}
                  >
                    <span className="badge-icon">{a.icon}</span>
                    <span className="badge-name">{a.name}</span>
                    {a.nameUk && achievements.includes(a.id) && (
                      <span className="badge-name-uk">{a.nameUk}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="settings-section">
              <h2>⚙️ Settings / Налаштування</h2>
              <div className="settings-grid">
                <label className="setting-toggle">
                  <input 
                    type="checkbox" 
                    checked={showTranslations} 
                    onChange={e => setShowTranslations(e.target.checked)} 
                  />
                  <span>Show English translations</span>
                </label>
                <label className="setting-toggle">
                  <input 
                    type="checkbox" 
                    checked={showPronunciation} 
                    onChange={e => setShowPronunciation(e.target.checked)} 
                  />
                  <span>Show pronunciation hints</span>
                </label>
                <label className="setting-toggle">
                  <input 
                    type="checkbox" 
                    checked={soundEnabled} 
                    onChange={e => setSoundEnabled(e.target.checked)} 
                  />
                  <span>Sound effects</span>
                </label>
                <label className="setting-toggle">
                  <input 
                    type="checkbox" 
                    checked={ttsEnabled} 
                    onChange={e => setTtsEnabled(e.target.checked)} 
                  />
                  <span>🔊 Speak letters & words (TTS)</span>
                </label>
                <div className="tts-test">
                  <button 
                    className="tts-test-btn"
                    onClick={() => speakUkrainian('Привіт! Це тест.', 0.8)}
                  >
                    🔊 Test TTS: "Привіт"
                  </button>
                  <span className="tts-hint">Click to test if Ukrainian speech works on your browser</span>
                </div>
              </div>
            </div>
          </div>
        ) : gameMode === 'explore' ? (
          <div className="explore-screen">
            <button className="back-button" onClick={() => { setGameMode('menu'); setExploreSelectedKey(null); }}>
              ← Back to Menu
            </button>
            
            <div className="explore-header">
              <h2>🔍 Explore the Ukrainian Keyboard</h2>
              <p>Click any key to learn about it! Познайомся з клавіатурою!</p>
            </div>
            
            <div className="keyboard explore-mode">
              {UKRAINIAN_KEYBOARD.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                  {row.map((keyData) => {
                    const isSelected = exploreSelectedKey?.uk === keyData.uk;
                    return (
                      <div
                        key={keyData.uk}
                        className={`key ${isSelected ? 'selected' : ''} ${rowIndex === 1 ? 'home-row' : ''}`}
                        onClick={() => {
                          setExploreSelectedKey(keyData);
                          if (ttsEnabled) {
                            const textToSpeak = keyData.ukrainianPhonetic || keyData.uk;
                            speakUkrainian(textToSpeak, 0.8);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="uk-letter">{keyData.uk}</span>
                        <span className="qwerty-letter">{keyData.qwerty}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="keyboard-row">
                <div
                  className="key space-key"
                  onClick={() => {
                    if (ttsEnabled) {
                      speakUkrainian('пробіл', 0.8);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="uk-letter">пробіл (space)</span>
                </div>
              </div>
            </div>
            
            {exploreSelectedKey ? (
              <div className="key-info-panel">
                <div className="key-info-main">
                  <div className="key-info-letter">{exploreSelectedKey.uk.toUpperCase()}</div>
                  <div className="key-info-letter-lower">{exploreSelectedKey.uk}</div>
                  <button 
                    className="hear-button"
                    onClick={() => speakUkrainian(exploreSelectedKey.uk, 0.7)}
                  >
                    🔊 Hear it
                  </button>
                </div>
                <div className="key-info-details">
                  <div className="info-row">
                    <span className="info-label">Physical key:</span>
                    <span className="info-value keyboard-key">{exploreSelectedKey.qwerty.toUpperCase()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Sound:</span>
                    <span className="info-value sound-value">{exploreSelectedKey.sound}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Finger:</span>
                    <span className="info-value">{exploreSelectedKey.finger.replace('-l', ' (left hand)').replace('-r', ' (right hand)')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="key-info-panel empty">
                <p>👆 Click a key above to see details</p>
                <p className="hint-uk">Натисни на клавішу вище</p>
              </div>
            )}
            
            <div className="explore-tips">
              <h3>💡 Quick Tips</h3>
              <ul>
                <li><strong>Home row:</strong> Keep your fingers on Ф І В А П Р О Л Д (middle row)</li>
                <li><strong>Vowels:</strong> Ukrainian has 10 vowels - а, е, и, і, о, у, є, ї, ю, я</li>
                <li><strong>Soft sign (ь):</strong> Doesn't make a sound itself, but softens the preceding consonant</li>
                <li><strong>Unique letters:</strong> Ї (yee), Є (yeh), and Ґ (hard g) are unique to Ukrainian</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="practice-screen">
            <button className="back-button" onClick={() => setGameMode('menu')}>
              ← Back to Menu
            </button>
            
            {gameMode !== 'alphabet' && (
              <div className="lesson-header">
                <h2>{LESSONS[currentLevel].name}</h2>
                {LESSONS[currentLevel].nameUk && <p className="lesson-name-uk">{LESSONS[currentLevel].nameUk}</p>}
                <p>{LESSONS[currentLevel].hint}</p>
              </div>
            )}

            {/* Alphabet mode header and stats */}
            {gameMode === 'alphabet' && (
              <>
                <div className="lesson-header">
                  <h2>{ALPHABET_CHALLENGE.name}</h2>
                  <p className="lesson-name-uk">{ALPHABET_CHALLENGE.nameUk}</p>
                  <p>{ALPHABET_CHALLENGE.hint}</p>
                </div>
                <div className="alphabet-stats">
                  <div className="stat-box">
                    <div className="stat-label">Current Progress</div>
                    <div className="stat-value">{wordsCompleted + 1} / {ALPHABET_CHALLENGE.letters.length}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Best Time</div>
                    <div className="stat-value">
                      {alphabetBestTime ? `${(alphabetBestTime / 1000).toFixed(2)}s` : '--'}
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Last Loop</div>
                    <div className="stat-value">
                      {alphabetLoopHistory.length > 0
                        ? `${(alphabetLoopHistory[alphabetLoopHistory.length - 1] / 1000).toFixed(2)}s`
                        : '--'}
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Total Loops</div>
                    <div className="stat-value">{alphabetLoopHistory.length}</div>
                  </div>
                </div>
              </>
            )}

            {gameMode !== 'alphabet' && (
              <div className="progress-section">
                <ProgressBar
                  value={wordsCompleted}
                  max={10}
                  label="Session Progress"
                />
              </div>
            )}

            <div className="typing-area">
              <div className="target-display">
                {currentTarget.split('').map((char, i) => (
                  <span 
                    key={i}
                    className={`target-char ${i < currentIndex ? 'completed' : ''} ${i === currentIndex ? 'current' : ''}`}
                  >
                    {char === ' ' ? '␣' : char}
                  </span>
                ))}
              </div>
              
              {/* Show translation if enabled */}
              {showTranslations && TRANSLATIONS[currentTarget] && (
                <div className="word-translation">
                  "{TRANSLATIONS[currentTarget]}"
                </div>
              )}
              
              <div className="feedback-area">
                {encouragement && <div className="encouragement">{encouragement}</div>}
                {mistakeMessage && <div className="mistake-message">{mistakeMessage}</div>}
              </div>

              <div className="input-hint">
                {currentIndex < currentTarget.length && (
                  <p>
                    Type: <strong>{currentTarget[currentIndex]}</strong> 
                    {UK_TO_QWERTY[currentTarget[currentIndex]?.toLowerCase()] && (
                      <span className="key-hint"> (press '{UK_TO_QWERTY[currentTarget[currentIndex]?.toLowerCase()]}' key)</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <VirtualKeyboard highlight={currentTarget[currentIndex]} />

            <div className="session-stats">
              <div className="session-stat">
                <span className="stat-label">Letters typed</span>
                <span className="stat-number">{currentIndex}</span>
              </div>
              <div className="session-stat">
                <span className="stat-label">Mistakes</span>
                <span className="stat-number">{mistakes}</span>
              </div>
              <div className="session-stat">
                <span className="stat-label">Accuracy</span>
                <span className="stat-number">
                  {currentIndex > 0 ? Math.round((currentIndex / (currentIndex + mistakes)) * 100) : 100}%
                </span>
              </div>
            </div>

            {/* Hidden input for mobile */}
            <input 
              ref={inputRef}
              className="hidden-input"
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .game-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #fff;
          font-family: 'Nunito', sans-serif;
          overflow-x: hidden;
        }

        /* Pixel pattern overlay */
        .game-container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255,215,0,0.03) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(0,87,183,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: rgba(0,0,0,0.3);
          border-bottom: 3px solid #ffd700;
          position: relative;
          z-index: 10;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem;
          color: #ffd700;
          text-shadow: 2px 2px 0 #0057b7;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .stat-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .stat-icon {
          font-size: 1.2rem;
        }

        .stat-value {
          font-weight: 700;
          font-size: 1.1rem;
        }

        .xp-bar {
          width: 150px;
          height: 24px;
          background: rgba(0,0,0,0.4);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          border: 2px solid #ffd700;
        }

        .xp-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ffed4a);
          transition: width 0.3s ease;
        }

        .xp-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          font-weight: 700;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        .header-right {
          display: flex;
          gap: 1rem;
        }

        /* Main content */
        .game-main {
          padding: 2rem;
          position: relative;
          z-index: 5;
        }

        /* Menu screen */
        .menu-screen {
          max-width: 1200px;
          margin: 0 auto;
        }

        .menu-hero {
          text-align: center;
          margin-bottom: 3rem;
        }

        .menu-hero h1 {
          font-family: 'Press Start 2P', cursive;
          font-size: 1.5rem;
          color: #ffd700;
          text-shadow: 3px 3px 0 #0057b7;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .menu-hero p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .hint-text {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255,215,0,0.1);
          border-radius: 10px;
          border: 1px solid rgba(255,215,0,0.3);
          font-size: 1rem !important;
        }

        /* Level grid */
        .level-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .level-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .level-card.unlocked:hover {
          transform: translateY(-5px);
          border-color: #ffd700;
          box-shadow: 0 10px 30px rgba(255,215,0,0.2);
        }

        .level-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .level-card.locked::after {
          content: '🔒';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          opacity: 0.3;
        }

        .level-number {
          font-family: 'Press Start 2P', cursive;
          font-size: 2rem;
          color: #ffd700;
          margin-bottom: 0.5rem;
        }

        .level-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .level-desc {
          font-size: 0.95rem;
          opacity: 0.8;
          margin-bottom: 0.75rem;
        }

        .level-preview {
          font-size: 0.85rem;
          padding: 0.5rem;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          font-family: monospace;
        }

        /* Achievements */
        .achievements-section {
          background: rgba(0,0,0,0.2);
          border-radius: 20px;
          padding: 2rem;
        }

        .achievements-section h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #ffd700;
        }

        .achievements-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }

        .achievement-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          min-width: 100px;
          transition: all 0.3s ease;
        }

        .achievement-badge.earned {
          background: linear-gradient(145deg, rgba(255,215,0,0.2), rgba(255,215,0,0.1));
          border: 2px solid #ffd700;
        }

        .achievement-badge.locked {
          opacity: 0.4;
          filter: grayscale(1);
        }

        .badge-icon {
          font-size: 2rem;
        }

        .badge-name {
          font-size: 0.75rem;
          text-align: center;
          font-weight: 600;
        }

        /* Practice screen */
        .practice-screen {
          max-width: 900px;
          margin: 0 auto;
        }

        .back-button {
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.3);
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }

        .back-button:hover {
          background: rgba(255,255,255,0.2);
          border-color: #ffd700;
        }

        .lesson-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .lesson-header h2 {
          font-family: 'Press Start 2P', cursive;
          font-size: 1.2rem;
          color: #ffd700;
          margin-bottom: 0.75rem;
        }

        .lesson-header p {
          opacity: 0.8;
        }

        /* Progress section */
        .progress-section {
          margin-bottom: 2rem;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-label {
          font-weight: 600;
          min-width: 140px;
        }

        .progress-bar {
          flex: 1;
          height: 20px;
          background: rgba(0,0,0,0.4);
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.2);
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0057b7, #ffd700);
          transition: width 0.3s ease;
        }

        .progress-text {
          min-width: 60px;
          text-align: right;
          font-weight: 600;
        }

        /* Typing area */
        .typing-area {
          background: rgba(0,0,0,0.3);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          border: 3px solid rgba(255,215,0,0.3);
        }

        .target-display {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: 0.1em;
          min-height: 4rem;
        }

        .target-char {
          display: inline-block;
          padding: 0.2em 0.1em;
          transition: all 0.2s ease;
        }

        .target-char.completed {
          color: #4ade80;
          text-shadow: 0 0 10px rgba(74,222,128,0.5);
        }

        .target-char.current {
          color: #ffd700;
          background: rgba(255,215,0,0.2);
          border-radius: 8px;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .feedback-area {
          min-height: 2rem;
          margin-bottom: 1rem;
        }

        .encouragement {
          font-size: 1.5rem;
          color: #4ade80;
          font-weight: 700;
          animation: bounceIn 0.5s ease;
        }

        .mistake-message {
          font-size: 1.2rem;
          color: #f87171;
          font-weight: 600;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        .input-hint {
          font-size: 1.1rem;
        }

        .input-hint strong {
          font-size: 1.5rem;
          color: #ffd700;
        }

        .key-hint {
          opacity: 0.7;
          font-size: 0.95rem;
        }

        /* Virtual keyboard */
        .keyboard {
          background: rgba(0,0,0,0.4);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .keyboard-row {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .keyboard-row:nth-child(2) {
          margin-left: 20px;
        }

        .keyboard-row:nth-child(3) {
          margin-left: 40px;
        }

        .key {
          width: 50px;
          height: 55px;
          background: linear-gradient(145deg, #3a3a5c, #2a2a4c);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border: 2px solid rgba(255,255,255,0.1);
          position: relative;
        }

        .key.home-row {
          border-bottom: 3px solid rgba(255,215,0,0.5);
        }

        .key.highlight {
          background: linear-gradient(145deg, #ffd700, #e6c200);
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(255,215,0,0.5);
          border-color: #fff;
        }

        .key.highlight .uk-letter {
          color: #1a1a2e;
        }

        .uk-letter {
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
        }

        .qwerty-letter {
          font-size: 0.65rem;
          opacity: 0.5;
          margin-top: 2px;
          text-transform: uppercase;
        }

        .space-key {
          width: 250px;
        }

        /* Session stats */
        .session-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }

        .session-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffd700;
        }

        /* Achievement popup */
        .achievement-popup {
          position: fixed;
          top: 100px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(145deg, #2a2a4c, #1a1a2e);
          border: 3px solid #ffd700;
          border-radius: 16px;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 100;
          animation: slideDown 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
          box-shadow: 0 10px 40px rgba(255,215,0,0.3);
        }

        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }

        @keyframes fadeOut {
          to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }

        .achievement-icon {
          font-size: 3rem;
        }

        .achievement-info {
          display: flex;
          flex-direction: column;
        }

        .achievement-title {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .achievement-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: #ffd700;
        }

        .achievement-xp {
          color: #4ade80;
          font-weight: 600;
        }

        /* Hidden input for mobile */
        .hidden-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .game-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .header-center {
            order: -1;
          }

          .menu-hero h1 {
            font-size: 1rem;
          }

          .target-display {
            font-size: 2rem;
          }

          .key {
            width: 32px;
            height: 40px;
          }

          .uk-letter {
            font-size: 1rem;
          }

          .qwerty-letter {
            font-size: 0.5rem;
          }

          .space-key {
            width: 150px;
          }

          .level-grid {
            grid-template-columns: 1fr;
          }

          .session-stats {
            flex-wrap: wrap;
          }
        }
        
        /* New styles for v2 features */
        
        .quick-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 1.5rem 0;
        }
        
        .quick-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .qs-value {
          font-size: 2rem;
          font-weight: 800;
          color: #ffd700;
        }
        
        .qs-label {
          font-size: 0.85rem;
          opacity: 0.7;
        }
        
        .menu-actions {
          margin-top: 1.5rem;
          gap: 1rem;
        }
        
        .explore-button {
          background: linear-gradient(135deg, rgba(0,87,183,0.3), rgba(0,87,183,0.2));
          border: 2px solid rgba(0,87,183,0.5);
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s;
        }
        
        .explore-button:hover {
          background: rgba(0,87,183,0.4);
          border-color: #4dabf7;
          transform: translateY(-2px);
        }
        
        .setup-button {
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.3);
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s;
        }
        
        .setup-button:hover {
          background: rgba(255,255,255,0.2);
          border-color: #ffd700;
        }
        
        /* Explore Screen */
        .explore-screen {
          max-width: 900px;
          margin: 0 auto;
        }
        
        .explore-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .explore-header h2 {
          font-family: 'Press Start 2P', cursive;
          font-size: 1rem;
          color: #ffd700;
          margin-bottom: 0.5rem;
        }
        
        .explore-header p {
          opacity: 0.8;
        }
        
        .keyboard.explore-mode .key {
          transition: all 0.2s;
        }
        
        .keyboard.explore-mode .key:hover {
          transform: scale(1.15);
          z-index: 10;
        }
        
        .keyboard.explore-mode .key.selected {
          background: linear-gradient(145deg, #ffd700, #e6c200);
          transform: scale(1.15);
          box-shadow: 0 0 25px rgba(255,215,0,0.6);
          border-color: #fff;
        }
        
        .keyboard.explore-mode .key.selected .uk-letter {
          color: #1a1a2e;
        }
        
        .key-info-panel {
          margin-top: 2rem;
          background: rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
          border: 2px solid rgba(255,215,0,0.2);
        }
        
        .key-info-panel.empty {
          flex-direction: column;
          text-align: center;
          opacity: 0.7;
        }
        
        .key-info-panel.empty .hint-uk {
          font-size: 0.9rem;
          opacity: 0.6;
        }
        
        .key-info-main {
          text-align: center;
        }
        
        .key-info-letter {
          font-size: 4rem;
          font-weight: 800;
          color: #ffd700;
          line-height: 1;
        }
        
        .key-info-letter-lower {
          font-size: 1.5rem;
          opacity: 0.6;
        }
        
        .hear-button {
          margin-top: 0.75rem;
          background: linear-gradient(135deg, #4dabf7, #339af0);
          border: none;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s;
        }
        
        .hear-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(77,171,247,0.4);
        }
        
        .hear-button:active {
          transform: scale(0.98);
        }
        
        .key-info-details {
          flex: 1;
        }
        
        .info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        
        .info-label {
          font-weight: 600;
          opacity: 0.7;
          min-width: 100px;
        }
        
        .info-value {
          font-size: 1.1rem;
        }
        
        .keyboard-key {
          background: rgba(255,215,0,0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-family: monospace;
          font-weight: 700;
          color: #ffd700;
        }
        
        .sound-value {
          font-style: italic;
          color: #4dabf7;
        }
        
        .explore-tips {
          margin-top: 2rem;
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
          padding: 1.5rem;
        }
        
        .explore-tips h3 {
          color: #ffd700;
          margin-bottom: 1rem;
        }
        
        .explore-tips ul {
          list-style: none;
          padding: 0;
        }
        
        .explore-tips li {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          position: relative;
        }
        
        .explore-tips li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: #ffd700;
        }
        
        .level-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .level-icon {
          font-size: 1.5rem;
        }
        
        .level-name-uk, .lesson-name-uk {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 0.25rem;
        }
        
        .lesson-icon {
          font-size: 2rem;
          margin-right: 0.5rem;
        }
        
        .level-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .level-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          font-family: inherit;
          transition: all 0.2s;
        }
        
        .letters-btn {
          background: rgba(255,215,0,0.2);
          color: #ffd700;
        }
        
        .letters-btn:hover {
          background: rgba(255,215,0,0.3);
        }
        
        .words-btn {
          background: rgba(0,87,183,0.3);
          color: #4dabf7;
        }
        
        .words-btn:hover {
          background: rgba(0,87,183,0.4);
        }
        
        .word-translation {
          font-size: 1.1rem;
          color: #4dabf7;
          margin-bottom: 1rem;
          font-style: italic;
        }
        
        .settings-section {
          background: rgba(0,0,0,0.2);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          margin-top: 2rem;
        }
        
        .settings-section h2 {
          margin-bottom: 1rem;
        }
        
        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .setting-toggle {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        
        .setting-toggle:hover {
          background: rgba(255,255,255,0.05);
        }
        
        .setting-toggle input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: #ffd700;
        }
        
        .tts-test {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .tts-test-btn {
          background: linear-gradient(135deg, #4dabf7, #339af0);
          border: none;
          color: #fff;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s;
        }
        
        .tts-test-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(77,171,247,0.4);
        }
        
        .tts-test-btn:active {
          transform: translateY(0);
        }
        
        .tts-hint {
          font-size: 0.8rem;
          opacity: 0.6;
          text-align: center;
        }
        
        .finger-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 1rem;
          font-size: 0.8rem;
        }
        
        .sound-hint {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.8);
          color: #4dabf7;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.65rem;
          white-space: nowrap;
          z-index: 10;
        }
        
        .achievement-name-uk {
          font-size: 0.9rem;
          opacity: 0.7;
        }
        
        .badge-name-uk {
          font-size: 0.65rem;
          opacity: 0.6;
          display: block;
        }
        
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }
        
        .modal-content {
          background: linear-gradient(145deg, #2a2a4c, #1a1a2e);
          border-radius: 20px;
          padding: 2rem;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border: 2px solid #ffd700;
        }
        
        .modal-content h2 {
          color: #ffd700;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .setup-section {
          margin-bottom: 1.5rem;
          background: rgba(0,0,0,0.2);
          padding: 1rem;
          border-radius: 12px;
        }
        
        .setup-section h3 {
          color: #4dabf7;
          margin-bottom: 0.75rem;
        }
        
        .setup-section ol {
          margin-left: 1.25rem;
        }
        
        .setup-section li {
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .setup-tip {
          background: rgba(255,215,0,0.1);
          border: 1px solid rgba(255,215,0,0.3);
          padding: 1rem;
          border-radius: 12px;
          margin: 1.5rem 0;
        }
        
        .modal-close-btn {
          display: block;
          width: 100%;
          background: linear-gradient(135deg, #ffd700, #e6c200);
          color: #1a1a2e;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s;
        }
        
        .modal-close-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(255,215,0,0.3);
        }

        /* Alphabet mode styles */
        .alphabet-stats {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
          justify-content: center;
          flex-wrap: wrap;
        }

        .alphabet-stats .stat-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          min-width: 140px;
          text-align: center;
        }

        .alphabet-stats .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.5rem;
        }

        .alphabet-stats .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffd700;
        }

        /* Green flash overlay */
        .green-flash-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 255, 0, 0.3);
          pointer-events: none;
          z-index: 9999;
          animation: flashFade 0.2s ease-out;
        }

        @keyframes flashFade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* Alphabet Challenge Section */
        .alphabet-challenge-section {
          margin: 2rem 0;
        }

        .alphabet-challenge-section h2 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .alphabet-challenge-card {
          background: linear-gradient(145deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1));
          border: 2px solid #ffd700;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          transition: all 0.3s;
        }

        .alphabet-challenge-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        }

        .challenge-info h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #ffd700;
        }

        .challenge-desc {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .challenge-hint {
          font-size: 0.95rem;
          opacity: 0.7;
          font-style: italic;
        }

        .challenge-record {
          font-size: 1.2rem;
          color: #ffd700;
          font-weight: 700;
          margin-top: 1rem;
        }

        .challenge-start-btn {
          background: linear-gradient(145deg, #ffd700, #ffb700);
          color: #1a1a2e;
          border: none;
          padding: 1.2rem 2.5rem;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .challenge-start-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        @media (max-width: 768px) {
          .alphabet-challenge-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
