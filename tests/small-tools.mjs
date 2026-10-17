import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSmallToolsList, smallTools } from '../assets/small-tools.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function read(path) {
  return readFileSync(resolve(repoRoot, path), 'utf8');
}

function webpSize(path) {
  const buf = readFileSync(path);
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF', path);
  assert.equal(buf.toString('ascii', 8, 12), 'WEBP', path);
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8 ') {
    assert.equal(buf[23], 0x9d, path);
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (kind === 'VP8X') {
    return {
      width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
      height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
    };
  }
  if (kind === 'VP8L') {
    const b1 = buf[21];
    const b2 = buf[22];
    const b3 = buf[23];
    const b4 = buf[24];
    return {
      width: 1 + (((b2 & 0x3f) << 8) | b1),
      height: 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)),
    };
  }
  throw new Error('unsupported webp chunk ' + kind);
}

function between(html) {
  const start = '<!-- small-tools:start -->';
  const end = '<!-- small-tools:end -->';
  const startAt = html.indexOf(start);
  const endAt = html.indexOf(end);
  assert.ok(startAt >= 0 && endAt > startAt, 'small-tools markers');
  return html.slice(startAt + start.length, endAt);
}

function normalize(html) {
  return html
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

assert.ok(Array.isArray(smallTools) && smallTools.length >= 1, 'tools array');

for (const tool of smallTools) {
  assert.equal(typeof tool.name, 'string');
  assert.equal(typeof tool.hook, 'string');
  assert.equal(typeof tool.href, 'string');
  assert.equal(typeof tool.image, 'string');
  assert.equal(typeof tool.alt, 'string');
  assert.equal(typeof tool.width, 'number');
  assert.equal(typeof tool.height, 'number');
  assert.ok(tool.name.trim(), 'name');
  assert.ok(tool.hook.trim(), 'hook');
  assert.ok(tool.alt.trim(), 'alt');
  assert.match(tool.href, /^https:\/\/charliebuild\.com\/tools\/[^/]+\/$/);
  assert.equal(tool.href.includes('pages.dev'), false, tool.href);
  assert.match(tool.image, /^\/assets\/tools\/.+\.(webp|avif)$/);
  const file = resolve(repoRoot, tool.image.slice(1));
  assert.equal(existsSync(file), true, tool.image);
  const size = webpSize(file);
  assert.equal(tool.width, size.width, tool.image);
  assert.equal(tool.height, size.height, tool.image);
}

const mortgage = smallTools[0];
assert.equal(mortgage.name, 'Canadian mortgage calculator');
assert.equal(mortgage.hook, '$800k · 20% down · $3,542/mo');
assert.equal(mortgage.href, 'https://charliebuild.com/tools/mortgage/');

const rendered = normalize(renderSmallToolsList());
assert.match(rendered, /loading="lazy"/);
assert.match(rendered, /width="1280"/);
assert.match(rendered, /height="730"/);
assert.equal(mortgage.width, 1280);
assert.equal(mortgage.height, 730);
assert.match(rendered, /class="tool-card"/);
assert.match(rendered, /Canadian mortgage calculator/);

const home = read('index.html');
const toolsPage = read('tools/index.html');
const css = read('assets/small-tools.css');

assert.equal(normalize(between(home)), rendered, 'homepage cards drifted from the tools array');
assert.equal(normalize(between(toolsPage)), rendered, '/tools cards drifted from the tools array');

const hero = home.indexOf('class="hero"');
const projects = home.indexOf('class="projects"');
const section = home.indexOf('class="small-tools"');
const foot = home.indexOf('class="site-foot"');
assert.ok(hero >= 0 && projects > hero && section > projects && foot > section, 'section order');
assert.match(home, /<a class="small-tools-all" href="\/tools">all small tools<\/a>/);
assert.match(home, /href="\/assets\/small-tools\.css"/);
assert.doesNotMatch(home, /href=["'][^"']*interview\//);

assert.match(toolsPage, /<h1 class="tools-heading" id="tools-heading">Small tools<\/h1>/);
assert.match(toolsPage, /Live utilities I ship and keep honest\./);
assert.match(toolsPage, /href="\/assets\/small-tools\.css"/);
assert.match(toolsPage, /<a class="tools-home" href="\/">Charlie Guo<\/a>/);

assert.match(css, /grid-template-columns:\s*1fr;/);
assert.match(css, /grid-template-columns:\s*1fr 1fr;/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /focus-visible/);
assert.match(css, /#5c6166/i);

assert.equal(existsSync(resolve(repoRoot, 'tools/index.html')), true);
assert.equal(existsSync(resolve(repoRoot, 'tools/mortgage')), false);
assert.equal(existsSync(resolve(repoRoot, 'tools/mortgage.html')), false);
assert.equal(existsSync(resolve(repoRoot, 'tools/mortgage/index.html')), false);

function rejectMortgageRoute(dir) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const path = resolve(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name === 'mortgage' && dir.endsWith('/tools')) {
      assert.fail('this repo must not own /tools/mortgage');
    }
    rejectMortgageRoute(path);
  }
}
rejectMortgageRoute(repoRoot);

for (const config of ['_redirects', 'wrangler.jsonc', 'wrangler.toml']) {
  const path = resolve(repoRoot, config);
  if (!existsSync(path)) continue;
  assert.doesNotMatch(readFileSync(path, 'utf8'), /\/tools\/mortgage/);
}

console.log('Small tools contract test passed.');
