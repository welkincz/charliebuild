// Prints resume/index.html to a text-based, single-column PDF that ATS parsers read in order.
// Run on macOS: node scripts/render-resume.cjs
// RESUME_PHONE=... RESUME_OUT=/somewhere/private.pdf adds a phone number for a version you
// send directly; that file must never be committed.
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const out = process.env.RESUME_OUT || path.join(root, 'resume', 'Chaozheng-Charlie-Guo-Data-Engineer-Resume.pdf');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(root, 'resume', 'index.html'));
  if (process.env.RESUME_PHONE) {
    await page.evaluate((phone) => {
      const contact = document.querySelector('.contact');
      contact.firstChild.textContent = contact.firstChild.textContent.replace('Toronto, ON |', 'Toronto, ON | ' + phone + ' |');
    }, process.env.RESUME_PHONE);
  }
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: out, format: 'Letter', printBackground: false, preferCSSPageSize: true, tagged: true, outline: false });
  await browser.close();
  console.log('Wrote ' + out);
})();
