// Russian lesson content organized by keyboard rows (JCUKEN layout)
// Top row:    й ц у к е н г ш щ з х ъ (qwerty: q w e r t y u i o p [ ])
// Middle row: ф ы в а п р о л д ж э (qwerty: a s d f g h j k l ; ')
// Bottom row: я ч с м и т ь б ю (qwerty: z x c v b n m , .)

export const RU_ALPHABET_CHALLENGE = {
  name: "Alphabet Speed Run",
  nameRu: "Алфавит",
  description: "Type the Russian alphabet А-Я as fast as you can!",
  hint: "Type each letter in order - loops automatically!",
  letters: ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'],
  words: [],
  xpPerLetter: 5,
  xpPerWord: 0,
  requiredXp: 0,
  isAlphabetMode: true
};

export const RU_LESSONS = {
  1: {
    name: "Top Row",
    nameRu: "Верхний ряд",
    icon: "⬆️",
    description: "Learn the top row of the Russian keyboard",
    hint: "й ц у к е н г ш щ з х ъ",
    letters: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
    words: ['ещё', 'кухне', 'щуку', 'цех', 'неё', 'нож', 'шкуну'],
    xpPerLetter: 10,
    xpPerWord: 25,
    requiredXp: 0
  },
  2: {
    name: "Middle Row",
    nameRu: "Средний ряд",
    icon: "🏠",
    description: "Learn the home row - where your fingers rest!",
    hint: "ф ы в а п р о л д ж э",
    letters: ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    words: ['вод', 'род', 'вода', 'пора', 'лапа', 'дело', 'воля', 'доля', 'пара', 'рада', 'жар', 'выл'],
    xpPerLetter: 10,
    xpPerWord: 25,
    requiredXp: 0
  },
  3: {
    name: "Bottom Row",
    nameRu: "Нижний ряд",
    icon: "⬇️",
    description: "Learn the bottom row of the keyboard",
    hint: "я ч с м и т ь б ю",
    letters: ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
    words: ['там', 'тут', 'сам', 'миг', 'быть', 'чуть', 'смех', 'мытьё', 'бытие', 'тишь'],
    xpPerLetter: 10,
    xpPerWord: 25,
    requiredXp: 0
  },
  4: {
    name: "Top + Middle",
    nameRu: "Верх + Середина",
    icon: "🔀",
    description: "Combine top and middle rows!",
    hint: "Practice switching between rows",
    letters: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    words: ['он', 'она', 'око', 'ухо', 'поле', 'школа', 'дерево', 'озеро', 'кино', 'кефир'],
    xpPerLetter: 12,
    xpPerWord: 30,
    requiredXp: 150
  },
  5: {
    name: "All Rows",
    nameRu: "Все ряды",
    icon: "⌨️",
    description: "Use the entire keyboard!",
    hint: "You know all the keys now!",
    letters: ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
    words: ['кот', 'сон', 'мать', 'папа', 'хлеб', 'яблоко', 'читать', 'любовь', 'здание'],
    xpPerLetter: 15,
    xpPerWord: 40,
    requiredXp: 350
  },
  6: {
    name: "Common Words",
    nameRu: "Частые слова",
    icon: "📚",
    description: "Practice the most common Russian words!",
    hint: "These words appear everywhere in Russian",
    letters: [],
    words: ['и', 'в', 'на', 'что', 'как', 'но', 'это', 'тот', 'весь', 'свой', 'один', 'такой', 'только', 'можно', 'надо'],
    xpPerLetter: 15,
    xpPerWord: 50,
    requiredXp: 600
  },
  7: {
    name: "Greetings",
    nameRu: "Приветствия",
    icon: "👋",
    description: "Learn essential greetings and phrases!",
    hint: "Impress your Russian-speaking friends!",
    letters: [],
    words: ['привет', 'добрый', 'утро', 'день', 'вечер', 'спасибо', 'пожалуйста', 'да', 'нет', 'хорошо', 'до свидания'],
    xpPerLetter: 18,
    xpPerWord: 60,
    requiredXp: 900
  },
  8: {
    name: "Numbers",
    nameRu: "Числа",
    icon: "🔢",
    description: "Count in Russian!",
    hint: "один, два, три... поехали!",
    letters: [],
    words: ['один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'сто', 'тысяча'],
    xpPerLetter: 18,
    xpPerWord: 55,
    requiredXp: 1250
  },
  9: {
    name: "Food",
    nameRu: "Еда",
    icon: "🍲",
    description: "Delicious Russian vocabulary!",
    hint: "Russian cuisine is amazing!",
    letters: [],
    words: ['борщ', 'пельмени', 'сало', 'хлеб', 'молоко', 'вода', 'кофе', 'чай', 'мясо', 'рыба', 'овощи', 'фрукты'],
    xpPerLetter: 20,
    xpPerWord: 65,
    requiredXp: 1650
  },
  10: {
    name: "Phrases",
    nameRu: "Фразы",
    icon: "💬",
    description: "Put it all together with full sentences!",
    hint: "You're ready for real Russian text!",
    letters: [],
    words: ['я люблю', 'это хорошо', 'как дела', 'всё хорошо', 'до встречи', 'ура победа', 'я учу', 'большое спасибо'],
    xpPerLetter: 20,
    xpPerWord: 80,
    requiredXp: 2100
  }
};
