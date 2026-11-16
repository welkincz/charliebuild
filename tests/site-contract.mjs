// Static contract for what visitors, crawlers and link previews see.
// Run: node tests/site-contract.mjs
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const pages = ['index.html', 'tools/index.html', '404.html'];

function meta(html, attr, key) {
  const match = html.match(new RegExp('<meta ' + attr + '="' + key.replace(/[.:]/g, '\\$&') + '" content="([^"]*)"'));
  return match && match[1];
}

function pngSize(path) {
  const buf = readFileSync(path);
  assert.equal(buf.toString('hex', 0, 8), '89504e470d0a1a0a', path + ' is a PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// Every same-site reference resolves to a published file.
for (const page of pages) {
  const html = read(page);
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    let path = ref.split(/[?#]/)[0];
    // Absolute links back to this site count as internal, except tools served by their own Workers.
    if (path.startsWith('https://charliebuild.com/')) {
      path = path.slice('https://charliebuild.com'.length);
      if (/^\/tools\/[^/]+\/$/.test(path)) continue;
    } else if (/^(https?:|mailto:|data:|#)/.test(ref)) continue;
    const target = path.startsWith('/') ? path.slice(1) : resolve(dirname(resolve(root, page)), path).slice(root.length + 1);
    const file = target === '' || target.endsWith('/') ? target + 'index.html' : target;
    assert.ok(existsSync(resolve(root, file)), page + ' links to missing ' + ref);
  }
  assert.doesNotMatch(html, /<script[^>]+src="https?:/, page + ' loads a third-party script, which the CSP blocks');
  assert.match(html, /<link rel="icon" href="\/favicon\.svg"/, page + ' favicon');
}

// In-page anchors on the homepage point at real ids.
const home = read('index.html');
for (const [, id] of home.matchAll(/href="#([^"]+)"/g)) {
  assert.match(home, new RegExp('id="' + id + '"'), 'missing #' + id);
}

// Search and link previews.
assert.match(home, /<title>Charlie Guo — Data engineer in Toronto/);
assert.match(home, /<link rel="canonical" href="https:\/\/charliebuild\.com\/">/);
const description = meta(home, 'name', 'description');
assert.ok(description && description.length >= 70 && description.length <= 170, 'description length ' + (description || '').length);
for (const key of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type']) {
  assert.ok(meta(home, 'property', key), 'homepage ' + key);
}
assert.equal(meta(home, 'name', 'twitter:card'), 'summary_large_image');
const ogImage = meta(home, 'property', 'og:image');
assert.match(ogImage, /^https:\/\/charliebuild\.com\//);
const ogFile = resolve(root, new URL(ogImage).pathname.slice(1));
assert.deepEqual(pngSize(ogFile), { width: 1200, height: 630 });
assert.equal(meta(home, 'property', 'og:image:width'), '1200');
assert.equal(meta(home, 'property', 'og:image:height'), '630');
assert.deepEqual(pngSize(resolve(root, 'apple-touch-icon.png')), { width: 180, height: 180 });

const ld = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(ld, 'JSON-LD block');
const graph = JSON.parse(ld[1])['@graph'];
const person = graph.find((node) => node['@type'] === 'Person');
assert.equal(person.name, 'Charlie Guo');
assert.equal(person.jobTitle, 'Data Engineer');
for (const url of person.sameAs) assert.ok(home.includes('href="' + url), 'sameAs ' + url + ' is linked on the page');

// The positioning reaches a skimmer above the selected work.
const pitch = home.indexOf('class="pitch"');
assert.ok(pitch > home.indexOf('class="wordmark"') && pitch < home.indexOf('id="work"'), 'pitch sits in the hero');
assert.ok(home.indexOf('class="contact"') > home.indexOf('class="small-tools"'), 'contact closes the page');

const tools = read('tools/index.html');
assert.match(tools, /<link rel="canonical" href="https:\/\/charliebuild\.com\/tools\/">/);
assert.ok(meta(tools, 'property', 'og:image'), '/tools og:image');

// Crawling and errors.
const sitemap = read('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]));
assert.ok(locs.length >= 2, 'sitemap urls');
for (const url of locs) {
  assert.equal(url.origin, 'https://charliebuild.com');
  assert.ok(existsSync(resolve(root, url.pathname.slice(1) + 'index.html')), 'sitemap ' + url);
}
assert.match(read('robots.txt'), /^Sitemap: https:\/\/charliebuild\.com\/sitemap\.xml$/m);
assert.match(read('404.html'), /<meta name="robots" content="noindex">/);
assert.match(read('wrangler.jsonc'), /"not_found_handling":\s*"404-page"/);

// Response headers and what never gets published.
const headers = read('_headers');
for (const name of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
  assert.match(headers, new RegExp('^  ' + name + ': ', 'm'), name);
}
assert.match(headers, /connect-src 'self'[^;]*;/, 'edge readout fetches /cdn-cgi/trace from the same origin');
const ignored = read('.assetsignore').split('\n');
for (const internal of ['.git', '.github', '.gitignore', 'node_modules', 'package-lock.json', 'docs', 'tests', 'scripts', 'nanail', 'package.json', 'README.md', 'wrangler.jsonc']) {
  assert.ok(ignored.includes(internal), internal + ' must not be published');
}

console.log('Site contract test passed.');
