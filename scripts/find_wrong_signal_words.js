const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '6 Practice');

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/^시나리오.*\.md$/.test(entry.name)) files.push(full);
  }
}

const files = [];
walk(root, files);

const correctWords = new Map();
const wrongWords = new Map();

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z][a-z_]{2,}/g) || []);
}

function bump(map, word) {
  map.set(word, (map.get(word) || 0) + 1);
}

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    const m = line.match(/^\*\*([A-D])(\(정답\))?\.\*\*\s*(.*)$/);
    if (!m) continue;
    const isCorrect = !!m[2];
    const words = new Set(tokenize(m[3]));
    for (const w of words) bump(isCorrect ? correctWords : wrongWords, w);
  }
}

const candidates = [];
for (const [word, wrongCount] of wrongWords) {
  const correctCount = correctWords.get(word) || 0;
  if (wrongCount >= 3 && correctCount === 0) {
    candidates.push({ word, wrongCount });
  }
}
candidates.sort((a, b) => b.wrongCount - a.wrongCount);
console.log(candidates.slice(0, 40).map(c => `${c.word}: ${c.wrongCount}`).join('\n'));
