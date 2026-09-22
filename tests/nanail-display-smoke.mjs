import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = resolve(repoRoot, 'nanail/display/index.html');
const html = readFileSync(pagePath, 'utf8');

assert.match(
  html,
  /<link\s+rel="canonical"\s+href="https:\/\/nanail\.charliebuild\.com\/">/,
  'display declares the NaNail subdomain as canonical',
);

assert.match(html, /assets\/instagram-qr\.png/, 'Instagram QR asset is rendered');
assert.match(
  html,
  /https:\/\/www\.instagram\.com\/nanail_studio_a\//,
  'Instagram QR card links to @nanail_studio_a',
);
assert.match(html, /alt="NaNail Instagram 二维码"/, 'Instagram QR has useful alt text');

assert.match(html, /assets\/wechat-qr\.png/, 'WeChat QR asset is rendered');
assert.match(html, /alt="NaNail 微信二维码"/, 'WeChat QR has useful alt text');

assert.match(html, /class="booking-mascot"/, 'booking section contains the generated mascot');
assert.match(html, /assets\/booking-mascot\.png/, 'booking mascot uses the generated raster asset');

const sceneSafeZones = html.match(/<div class="scene[^"]*" data-copy-zone="[^"]+"/g) ?? [];
assert.equal(sceneSafeZones.length, 4, 'every work scene declares an image-specific copy-safe zone');

assert.match(
  html,
  /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.booking-mascot/,
  'reduced-motion rules include the booking mascot',
);

for (const match of html.matchAll(/(?:src|href)="\.\/(assets\/[^"?#]+)"/g)) {
  const assetPath = resolve(dirname(pagePath), match[1]);
  assert.ok(existsSync(assetPath), `referenced asset exists: ${match[1]}`);
}

console.log('NaNail display smoke test passed.');
