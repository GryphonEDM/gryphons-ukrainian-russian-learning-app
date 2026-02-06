const fs = require('fs');
const d = JSON.parse(fs.readFileSync('C:/Users/michael/Desktop/ukrainian typing game/src/data/vocabulary/comprehensive-dictionary-ext2.json','utf8'));
const r = JSON.parse(fs.readFileSync('C:/Users/michael/Desktop/ukrainian typing game/src/data/ru/vocabulary/comprehensive-dictionary-ext2.json','utf8'));
const m = {};
for (const w of r.words) m[w.en] = {ru: w.ru, p: w.phonetic};
const u = new Set();
let c = 0, n = 0;
const unmatch = [];
for (const w of d.words) {
  if (m[w.en]) { c++; u.add(w.en); }
  else { n++; unmatch.push(w.en); }
}
const ro = [];
for (const w of r.words) if (!u.has(w.en)) ro.push(w.en);
console.log('UK:', d.words.length, 'RU:', r.words.length, 'Match:', c, 'Unmatch:', n, 'RU-only:', ro.length);
if (ro.length > 0) console.log('RU-only:', JSON.stringify(ro));
