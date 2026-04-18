const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const exts = new Set(['.ts', '.tsx']);
const files = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (exts.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
};

walk(root);

let updated = 0;

for (const filePath of files) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (!original.includes("import Tag from '") && !original.includes('import Tag from "')) {
    continue;
  }

  let next = original
    .replace(/import\s+Tag\s+from\s+(['"][^'"]*\/Tag['"]);/g, 'import Badge from $1;')
    .replace(/<Tag\b/g, '<Badge')
    .replace(/<\/Tag>/g, '</Badge>');

  if (next !== original) {
    fs.writeFileSync(filePath, next, 'utf8');
    updated += 1;
  }
}

console.log(`Updated files: ${updated}`);
