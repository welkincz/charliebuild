import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
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
  /href="https:\/\/nanail\.charliebuild\.com\/ig"/,
  'Instagram QR card points at the counted /ig redirect, not straight at instagram.com',
);
assert.match(html, /alt="NaNail Instagram 二维码"/, 'Instagram QR has useful alt text');

assert.match(html, /assets\/wechat-qr\.png/, 'WeChat QR asset is rendered');
assert.match(
  html,
  /href="https:\/\/u\.wechat\.com\//,
  'WeChat QR still points straight at u.wechat.com so the in-app add-friend flow is untouched',
);
assert.match(html, /alt="NaNail 微信二维码"/, 'WeChat QR has useful alt text');

assert.doesNotMatch(
  html,
  /mascot|dog-(?:cameo|figure)|booking-mascot\.png/i,
  'booking section has no mascot or figure content',
);
assert.equal(
  existsSync(resolve(repoRoot, 'nanail/display/assets/booking-mascot.png')),
  false,
  'retired booking figure asset is removed',
);

const sceneSafeZones = html.match(/<div class="scene[^"]*" data-copy-zone="[^"]+"/g) ?? [];
assert.equal(sceneSafeZones.length, 6, 'every work scene declares an image-specific copy-safe zone');

for (const match of html.matchAll(/(?:src|href)="\.\/(assets\/[^"?#]+)"/g)) {
  const assetPath = resolve(dirname(pagePath), match[1]);
  assert.ok(existsSync(assetPath), `referenced asset exists: ${match[1]}`);
}
for (const match of html.matchAll(/url\("\.\/(assets\/[^"?#]+)"\)/g)) {
  const assetPath = resolve(dirname(pagePath), match[1]);
  assert.ok(existsSync(assetPath), `referenced background asset exists: ${match[1]}`);
}

// 门店扫码距离大致等于 10 倍码宽，iPad 是 132pt/英寸。
// 微信码下限 190pt ≈ 3.7cm，Instagram 码下限 132pt ≈ 2.5cm——
// 任何把它们改小的改动都应该是有意识的，所以在这里钉住。
const wechatWidth = html.match(/\.qr-card--wechat \{ width: clamp\((\d+)px/);
assert.ok(wechatWidth && Number(wechatWidth[1]) >= 190, 'WeChat QR keeps a storefront-sized floor');
const instagramWidth = html.match(/\.qr-card--instagram \{ width: clamp\((\d+)px/);
assert.ok(instagramWidth && Number(instagramWidth[1]) >= 132, 'Instagram QR keeps a storefront-sized floor');

// 店里靠手机热点，断网兜底不能悄悄掉。
const swPath = resolve(repoRoot, 'nanail/display/sw.js');
assert.ok(existsSync(swPath), 'offline service worker ships with the display');
assert.match(html, /serviceWorker\.register\('\.\/sw\.js'/, 'the page registers the service worker');

const sw = readFileSync(swPath, 'utf8');
const precached = [...sw.matchAll(/'(\/assets\/[^']+)'/g)].map((match) => match[1]);
assert.ok(precached.length > 0, 'service worker precaches the display assets');
for (const assetPath of precached) {
  assert.ok(
    existsSync(resolve(repoRoot, 'nanail/display', assetPath.slice(1))),
    `precached asset exists: ${assetPath}`,
  );
}
for (const match of html.matchAll(/(?:src|href)="\.\/(assets\/[^"?#]+)"/g)) {
  assert.ok(
    precached.includes(`/${match[1]}`),
    `asset used by the page is precached so it survives a dropped hotspot: ${match[1]}`,
  );
}

// 纯黑白的码比 Instagram 那种渐变名片码更经得起玻璃反光。
const igQrBytes = statSync(resolve(repoRoot, 'nanail/display/assets/instagram-qr.png')).size;
assert.ok(igQrBytes < 20000, 'Instagram QR is a plain black-and-white code, not the gradient nametag');

console.log('NaNail display smoke test passed.');
