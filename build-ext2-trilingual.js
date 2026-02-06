// Script to build trilingual comprehensive-dictionary-ext2.json
const fs = require("fs");
const path = require("path");

const ukFile = JSON.parse(fs.readFileSync(path.join(__dirname, "src/data/vocabulary/comprehensive-dictionary-ext2.json"), "utf8"));
const ruFile = JSON.parse(fs.readFileSync(path.join(__dirname, "src/data/ru/vocabulary/comprehensive-dictionary-ext2.json"), "utf8"));

const ruByEn = {};
ruFile.words.forEach(w => { ruByEn[w.en] = w; });

const manualRu = {
  "brave/courageous": ["смелый", "smelyy"],
  "cowardly": ["трусливый", "truslivyy"],
