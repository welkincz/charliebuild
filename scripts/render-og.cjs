// Renders the social preview image and touch icon from source files.
// Run on macOS (the page uses Avenir Next): node scripts/render-og.cjs   (PLAYWRIGHT_MODULE may point to an existing Playwright install)
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch();
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.goto('file://' + path.join(__dirname, 'og', 'og.html'));
  await og.screenshot({ path: path.join(root, 'assets', 'og.png') });

  const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
  // Same mark as favicon.svg, full-bleed because iOS rounds the corners itself.
  const mark = readFileSync(path.join(root, 'favicon.svg'), 'utf8').replace(/ rx="3\.5"/, '').replace('<svg ', '<svg width="180" height="180" ');
  await icon.setContent('<style>html,body{margin:0;background:#1B222B}</style>' + mark);
  await icon.screenshot({ path: path.join(root, 'apple-touch-icon.png') });
  await browser.close();
  console.log('Rendered assets/og.png and apple-touch-icon.png.');
})();
