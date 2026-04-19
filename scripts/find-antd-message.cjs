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

const regex = /import\s*\{[\s\S]*?\bmessage\b[\s\S]*?\}\s*from\s*['"]antd['"]/m;
const hits = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (regex.test(content)) {
    hits.push(path.relative(root, filePath).replace(/\\/g, '/'));
  }
}

console.log(hits.join('\n'));
console.log('TOTAL', hits.length);
