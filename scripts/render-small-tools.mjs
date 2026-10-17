import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSmallToolsList } from '../assets/small-tools.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const start = '<!-- small-tools:start -->';
const end = '<!-- small-tools:end -->';
const pages = ['index.html', 'tools/index.html'];

function stamp(relativePath) {
  const file = resolve(root, relativePath);
  const html = readFileSync(file, 'utf8');
  const startAt = html.indexOf(start);
  const endAt = html.indexOf(end);
  if (startAt < 0 || endAt < startAt) {
    throw new Error(relativePath + ' is missing small-tools markers');
  }

  const lineAt = html.lastIndexOf('\n', startAt) + 1;
  const indent = html.slice(lineAt, startAt).match(/^[ \t]*/)[0];
  const block = renderSmallToolsList()
    .split('\n')
    .map((line) => (line ? indent + line : line))
    .join('\n');
  const next = html.slice(0, startAt + start.length) + '\n' + block + '\n' + indent + html.slice(endAt);
  writeFileSync(file, next);
}

for (const page of pages) stamp(page);
console.log('Stamped small tools into ' + pages.join(', ') + '.');
