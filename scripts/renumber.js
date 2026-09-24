const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '6 Practice');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/^시나리오.*\.md$/.test(entry.name)) processFile(full);
  }
}

function processFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  let n = 0;
  const updated = content.replace(/^## 질문 \d+/gm, () => `## 질문 ${++n}`);
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`${file}: ${n} questions renumbered`);
  }
}

walk(root);
