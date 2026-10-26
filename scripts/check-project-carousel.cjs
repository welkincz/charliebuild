// Browser-only development check. Uses Playwright, never shipped to visitors.
// Run: node scripts/check-project-carousel.cjs
// PLAYWRIGHT_MODULE may point to an existing Playwright installation.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const output = process.env.SCREENSHOT_DIR || '/tmp/charliebuild-carousel-qa';
mkdirSync(output, { recursive: true });
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});

async function check(browserType, label) {
  const browser = await browserType.launch({ headless: true });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => errors.push(error.message));
  const url = `http://127.0.0.1:${server.address().port}/`;
  try {
    await page.goto(url);
    await page.locator('.project-carousel').waitFor({ timeout: 2500 });
    const track = page.locator('.project-track');
    const nav = page.locator('.project-nav');
    async function selected(name) {
      console.log(label + ': checking ' + name);
      await page.waitForFunction(expected => document.querySelector('.project-nav [aria-current="true"]')?.textContent.trim() === expected, name);
      await page.waitForFunction(expected => {
        const track = document.querySelector('.project-track');
        const slide = track.querySelector('.project-slide.is-active');
        return document.querySelector('.project-nav [aria-current="true"]')?.textContent.trim() === expected && slide && Math.abs(slide.getBoundingClientRect().left - track.getBoundingClientRect().left) < 2;
      }, name);
      assert.equal(await page.locator('.project-slide:not([inert])').count(), 1, 'only the active project accepts focus');
      const positions = { 'NaNail': '01 / 04', 'Advisor Pulse': '02 / 04', 'Orbit': '03 / 04', 'Nova Scotia': '04 / 04' };
      assert.equal(await page.locator('[data-project-position]').textContent(), positions[name]);
      await page.locator('.project-slide.is-active img').evaluate(image => image.decode());
    }
    await selected('NaNail');
    assert.equal(await page.getByRole('button', { name: 'Previous project' }).isDisabled(), true);
    assert.equal(await nav.getByRole('link').count(), 4);
    assert.equal(await page.locator('.project-slide.is-active img').evaluate(image => image.naturalWidth > 0), true, 'selected screenshot loads');
    await page.locator('.projects').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${label}-desktop.png`), fullPage: true });
    await page.locator('.projects').screenshot({ path: path.join(output, `${label}-projects-desktop.png`) });
    await page.getByRole('button', { name: 'Next project' }).click();
    await selected('Advisor Pulse');
    assert.equal(await page.locator('.project-slide.is-active').getByRole('link', { name: 'Open project' }).getAttribute('href'), 'https://pulse.charliebuild.com/');
    await nav.getByRole('link', { name: 'Orbit', exact: true }).click();
    await selected('Orbit');
    await track.focus();
    await page.keyboard.press('End');
    await selected('Nova Scotia');
    assert.equal(await page.getByRole('button', { name: 'Next project' }).isDisabled(), true);
    await page.keyboard.press('Home');
    await selected('NaNail');
    await page.keyboard.press('ArrowRight');
    await selected('Advisor Pulse');
    // Repeated input during motion must advance from the requested destination.
    await page.getByRole('button', { name: 'Next project' }).evaluate(button => { button.click(); button.click(); });
    await selected('Nova Scotia');
    await nav.getByRole('link', { name: 'Advisor Pulse', exact: true }).click();
    await selected('Advisor Pulse');
    await page.setViewportSize({ width: 390, height: 844 });
    await selected('Advisor Pulse');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no mobile document overflow');
    await page.locator('.projects').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${label}-mobile.png`), fullPage: true });
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await nav.getByRole('link', { name: 'NaNail', exact: true }).click();
    await selected('NaNail');
    assert.equal(await track.evaluate(el => getComputedStyle(el).scrollBehavior), 'auto');
    assert.equal(await page.locator('.project-slide').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    await page.locator('.projects').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${label}-mobile-dark.png`), fullPage: true });
    await page.locator('.projects').screenshot({ path: path.join(output, `${label}-projects-mobile-dark.png`) });
    // Rapid selections must settle on the last requested project.
    await nav.getByRole('link', { name: 'Orbit', exact: true }).click();
    await nav.getByRole('link', { name: 'Nova Scotia', exact: true }).click();
    await nav.getByRole('link', { name: 'NaNail', exact: true }).click();
    await selected('NaNail');
    await page.goto(url + '?deep-link#project-orbit');
    await selected('Orbit');
    await page.evaluate(() => { location.hash = '#project-travel'; });
    await selected('Nova Scotia');
    await page.goBack();
    await selected('Orbit');
    assert.deepEqual(errors, [], 'no uncaught browser errors');

    const fallback = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const plain = await fallback.newPage();
    await plain.goto(url);
    assert.equal(await plain.getByRole('link', { name: 'Open project', exact: true }).count(), 4, 'all projects remain reachable without JavaScript');
    await plain.locator('#project-travel').scrollIntoViewIfNeeded();
    assert.equal(await plain.locator('#project-travel').getByRole('link', { name: 'Open project', exact: true }).isVisible(), true);
    assert.equal(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await fallback.close();
    if (label === 'chromium') {
      const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
      const touch = await mobile.newPage();
      await touch.goto(url);
      await touch.locator('.project-track').scrollIntoViewIfNeeded();
      const box = await touch.locator('.project-shot').first().boundingBox();
      const session = await mobile.newCDPSession(touch);
      const y = box.y + Math.min(box.height / 2, 110);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 320, y }] });
      for (let x = 290; x >= 65; x -= 25) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
        await new Promise(resolve => setTimeout(resolve, 25));
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await touch.waitForFunction(() => document.querySelector('.project-nav [aria-current="true"]')?.textContent.trim() === 'Advisor Pulse');
      await mobile.close();
    }
    console.log(`${label}: selection, arrows, keyboard, resize, reduced motion, rapid selection, screenshots and no-JS checks passed`);
  } finally { await browser.close(); }
}

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await check(chromium, 'chromium');
    if (process.env.CHECK_WEBKIT === '1') await check(webkit, 'webkit');
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
