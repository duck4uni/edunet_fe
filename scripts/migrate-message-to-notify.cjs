const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const extensions = new Set(['.ts', '.tsx']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function removeMessageImport(line) {
  const match = line.match(/^import\s*\{([^}]*)\}\s*from\s*['"]antd['"]\s*;?\s*$/);
  if (!match) {
    return { touched: false, removed: false, line };
  }

  const specifiers = match[1]
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const hasMessage = specifiers.some((item) => item.split(' as ')[0].trim() === 'message');
  if (!hasMessage) {
    return { touched: false, removed: false, line };
  }

  const kept = specifiers.filter((item) => item.split(' as ')[0].trim() !== 'message');
  if (kept.length === 0) {
    return { touched: true, removed: true, line: '' };
  }

  return {
    touched: true,
    removed: true,
    line: `import { ${kept.join(', ')} } from 'antd';`,
  };
}

function addNotifyImport(content, importPath) {
  if (/import\s*\{\s*notify\s*\}\s*from\s*['"][^'"]+['"]\s*;?/.test(content)) {
    return content;
  }

  const importRegex = /^import\s.+;\s*$/gm;
  const matches = [...content.matchAll(importRegex)];
  const notifyImport = `import { notify } from '${importPath}';`;

  if (matches.length === 0) {
    return `${notifyImport}\n${content}`;
  }

  const last = matches[matches.length - 1];
  const insertPos = last.index + last[0].length;
  return `${content.slice(0, insertPos)}\n${notifyImport}${content.slice(insertPos)}`;
}

let updatedFiles = 0;

for (const filePath of walk(root)) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split(/\r?\n/);

  let removedMessage = false;
  let touched = false;

  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].includes("from 'antd'") && !lines[i].includes('from "antd"')) {
      continue;
    }

    const result = removeMessageImport(lines[i]);
    if (result.touched) {
      touched = true;
      removedMessage = removedMessage || result.removed;
      lines[i] = result.line;
    }
  }

  let next = lines
    .filter((line, index, arr) => !(line === '' && arr[index - 1] === ''))
    .join('\n');

  if (removedMessage) {
    next = next.replace(/\bmessage\s*\./g, 'notify.');

    const relative = path
      .relative(path.dirname(filePath), path.join(root, 'utils', 'notify'))
      .replace(/\\/g, '/');
    const importPath = relative.startsWith('.') ? relative : `./${relative}`;
    next = addNotifyImport(next, importPath);
  }

  if (next !== original || touched) {
    fs.writeFileSync(filePath, next, 'utf8');
    updatedFiles += 1;
  }
}

console.log(`Updated files: ${updatedFiles}`);
