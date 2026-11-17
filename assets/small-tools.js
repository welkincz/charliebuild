/**
 * Small tools shown on the homepage and at /tools/.
 *
 * Add a tool to this array, then refresh both pages:
 *   node scripts/render-small-tools.mjs
 *
 * One tool renders as a full-width horizontal card. Two or more
 * switch the list to a two-column grid.
 *
 * @typedef {Object} MortgagePreview
 * @property {number} min Lowest home price, in dollars.
 * @property {number} max Highest home price, in dollars.
 * @property {number} step Slider step, in dollars.
 * @property {number} price Default home price, in dollars.
 * @property {number} downRatio Down payment as a fraction of price. 0.2 skips CMHC.
 *
 * @typedef {Object} SmallTool
 * @property {string} name Tool name only.
 * @property {string} hook One concrete number or outcome.
 * @property {string[]} tags Short mono labels, shown uppercased.
 * @property {string} href Absolute URL on charliebuild.com. Never a pages.dev host.
 * @property {string} image Root-relative optimized screenshot.
 * @property {string} alt What the screenshot shows.
 * @property {number} width Intrinsic image width in pixels.
 * @property {number} height Intrinsic image height in pixels.
 * @property {MortgagePreview} [mortgage] When set, the card carries a home-price slider.
 */

/**
 * Canadian fixed-rate monthly payment, rounded half-up to the cent.
 *
 * Source of truth: welkincz/fun-little-things
 * mortgage/src/lib/mortgage/payment.ts (periodicRate, mortgagePayment)
 * and money.ts (roundCents). Rate and term are that calculator's defaults:
 * 4.50% (scenario.defaultInput and rules.R25), 25 years, monthly payments,
 * semi-annual compounding i = (1 + r/2)^(2/12) − 1. Principal is price minus
 * down payment. CMHC is not applied; the card always passes 20% down.
 *
 * @param {number} price Purchase price in dollars.
 * @param {number} downPayment Down payment in dollars.
 * @returns {number}
 */
export function canadianMonthlyPayment(price, downPayment) {
  const principal = price - downPayment;
  const annualRate = 0.045;
  const paymentsPerYear = 12;
  const periods = 25 * paymentsPerYear;
  if (!(principal > 0) || !(annualRate > 0) || periods <= 0) return 0;
  const i = (1 + annualRate / 2) ** (2 / paymentsPerYear) - 1;
  const raw = (principal * i) / (1 - (1 + i) ** -periods);
  return roundCents(raw);
}

/** Half-up to the cent. Same rule as fun-little-things money.roundCents. */
function roundCents(value) {
  if (!Number.isFinite(value)) return value;
  const sign = Math.sign(value) || 1;
  const cents = Math.round(Math.abs(value) * 100 + 1e-8);
  return (sign * cents) / 100;
}

/**
 * @param {number} price
 * @param {number} [ratio]
 * @returns {number}
 */
function downPaymentFor(price, ratio) {
  return Math.round(price * ratio);
}

/**
 * @param {number} price
 * @returns {string}
 */
function formatCompactPrice(price) {
  if (price >= 1_000_000) {
    const millions = Math.round((price / 1_000_000) * 100) / 100;
    return '$' + String(millions) + 'M';
  }
  return '$' + String(price / 1000) + 'k';
}

/**
 * @param {number} amount
 * @returns {string}
 */
function formatDollars(amount) {
  const whole = Math.round(amount);
  return '$' + String(Math.abs(whole)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Whole dollars, matching the static hook ("$3,542/mo").
 * @param {number} payment
 * @returns {string}
 */
function formatMonthlyPayment(payment) {
  return formatDollars(payment) + '/mo';
}

/**
 * @param {number} price
 * @param {number} ratio
 * @returns {string}
 */
function mortgageHook(price, ratio) {
  const down = downPaymentFor(price, ratio);
  const payment = canadianMonthlyPayment(price, down);
  return formatCompactPrice(price) + ' · ' + Math.round(ratio * 100) + '% down · ' + formatMonthlyPayment(payment);
}

/**
 * @param {number} price
 * @param {number} ratio
 * @returns {string}
 */
function mortgageToolHref(price, ratio) {
  const down = downPaymentFor(price, ratio);
  return 'https://charliebuild.com/tools/mortgage/?p=' + price + '&d=' + down;
}

const mortgagePrice = 800_000;
const mortgagePreview = {
  min: 400_000,
  max: 2_000_000,
  step: 10_000,
  price: mortgagePrice,
  downRatio: 0.2,
};

/** @type {SmallTool[]} */
export const smallTools = [
  {
    name: 'Canadian mortgage calculator',
    hook: mortgageHook(mortgagePrice, mortgagePreview.downRatio),
    tags: ['React', 'Live'],
    href: mortgageToolHref(mortgagePrice, mortgagePreview.downRatio),
    image: '/assets/tools/mortgage.webp',
    alt: 'Payment frequency control from the mortgage calculator, with Monthly selected.',
    width: 772,
    height: 196,
    mortgage: mortgagePreview,
  },
];

/**
 * @param {SmallTool[]} tools
 * @returns {'single' | 'grid'}
 */
export function smallToolsLayout(tools) {
  return tools.length === 1 ? 'single' : 'grid';
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * @param {SmallTool} tool
 * @returns {string}
 */
function renderMortgageCard(tool) {
  const preview = tool.mortgage;
  const price = preview.price;
  const ratio = preview.downRatio;
  const href = escapeHtml(tool.href);
  const tags = tool.tags.map((tag) => escapeHtml(tag)).join(' · ');
  const priceText = formatCompactPrice(price);
  const paymentText = formatDollars(canadianMonthlyPayment(price, downPaymentFor(price, ratio)));
  return [
    '<li>',
    '  <div class="tool-card" data-mortgage-card data-down-ratio="' + escapeHtml(ratio) + '">',
    '    <div class="tool-lead">',
    '      <a class="tool-copy-link" href="' + href + '">',
    '        <span class="tool-tags">' + tags + '</span>',
    '        <span class="tool-name">' + escapeHtml(tool.name) + '</span>',
    '      </a>',
    '      <p class="tool-pay" aria-live="polite">',
    '        <span class="tool-pay-figure" data-mortgage-payment>' + escapeHtml(paymentText) + '</span>',
    '        <span class="tool-pay-suffix">/mo</span>',
    '      </p>',
    '      <span class="tool-hook">' + String(Math.round(ratio * 100)) + '% down</span>',
    '    </div>',
    '    <div class="tool-controls">',
    '      <label class="tool-price">',
    '        <span class="tool-price-head">',
    '          <span class="tool-price-label">Home price</span>',
    '          <span class="tool-price-value" data-mortgage-price>' + escapeHtml(priceText) + '</span>',
    '        </span>',
    '        <input type="range" min="' + String(preview.min) + '" max="' + String(preview.max) + '" step="' + String(preview.step) + '" value="' + String(price) + '" aria-valuetext="' + escapeHtml(formatDollars(price)) + '">',
    '      </label>',
    '      <a class="tool-open-link" href="' + href + '">',
    '        <span class="tool-open">Open tool <span class="tool-open-arrow" aria-hidden="true">→</span></span>',
    '      </a>',
    '    </div>',
    '  </div>',
    '</li>',
  ].join('\n');
}

/**
 * @param {SmallTool} tool
 * @returns {string}
 */
export function renderSmallToolCard(tool) {
  if (tool.mortgage) return renderMortgageCard(tool);
  const tags = tool.tags.map((tag) => escapeHtml(tag)).join(' · ');
  return [
    '<li>',
    '  <a class="tool-card" href="' + escapeHtml(tool.href) + '">',
    '    <span class="tool-shot-frame">',
    '      <img class="tool-shot" src="' + escapeHtml(tool.image) + '" alt="' + escapeHtml(tool.alt) + '" width="' + String(tool.width) + '" height="' + String(tool.height) + '" loading="lazy" decoding="async">',
    '    </span>',
    '    <span class="tool-body">',
    '      <span class="tool-tags">' + tags + '</span>',
    '      <span class="tool-name">' + escapeHtml(tool.name) + '</span>',
    '      <span class="tool-hook">' + escapeHtml(tool.hook) + '</span>',
    '      <span class="tool-open">Open tool <span class="tool-open-arrow" aria-hidden="true">→</span></span>',
    '    </span>',
    '  </a>',
    '</li>',
  ].join('\n');
}

/**
 * @param {SmallTool[]} [tools]
 * @returns {string}
 */
export function renderSmallToolsList(tools = smallTools) {
  const layout = smallToolsLayout(tools);
  const list = '<ul class="tool-grid" data-layout="' + layout + '">\n'
    + tools.map((tool) => renderSmallToolCard(tool)).join('\n')
    + '\n</ul>';
  if (!tools.some((tool) => tool.mortgage)) return list;
  return list + '\n<script type="module" src="/assets/small-tools.js"></script>';
}

/**
 * @param {HTMLInputElement} input
 */
function paintRange(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const span = max - min;
  const pct = span > 0 ? ((value - min) / span) * 100 : 0;
  input.style.setProperty('--fill', pct + '%');
}

function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Short opacity tick when a figure changes. Skipped while one is already
 * running so a drag does not hold the number faded, and skipped entirely
 * when the reader asks for reduced motion.
 * @param {Element | null} el
 */
function tickNumber(el) {
  if (!el || prefersReducedMotion() || typeof el.animate !== 'function') return;
  if (typeof el.getAnimations === 'function' && el.getAnimations().some((anim) => anim.playState === 'running')) return;
  el.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 140, easing: 'ease-out' });
}

/**
 * @param {Element | null} el
 * @param {string} text
 */
function setNumber(el, text) {
  if (!el || el.textContent === text) return;
  el.textContent = text;
  tickNumber(el);
}

/**
 * @param {ParentNode} root
 */
export function mountMortgageCards(root) {
  const cards = root.querySelectorAll('[data-mortgage-card]');
  for (const card of cards) {
    const input = card.querySelector('input[type="range"]');
    if (!input || input.getAttribute('data-mortgage-bound') === '1') continue;
    input.setAttribute('data-mortgage-bound', '1');
    card.classList.add('is-ready');
    paintRange(input);
    const priceEl = card.querySelector('[data-mortgage-price]');
    const paymentEl = card.querySelector('[data-mortgage-payment]');
    const links = card.querySelectorAll('a[href]');
    const parsed = Number(card.getAttribute('data-down-ratio'));
    const ratio = Number.isFinite(parsed) && parsed > 0 && parsed < 1 ? parsed : 0.2;
    input.addEventListener('input', () => {
      const price = Number(input.value);
      const down = downPaymentFor(price, ratio);
      setNumber(priceEl, formatCompactPrice(price));
      setNumber(paymentEl, formatDollars(canadianMonthlyPayment(price, down)));
      if (links.length > 0) {
        const url = new URL(links[0].href, 'https://charliebuild.com');
        url.searchParams.set('p', String(price));
        url.searchParams.set('d', String(down));
        const href = url.href;
        for (const link of links) link.href = href;
      }
      input.setAttribute('aria-valuetext', formatDollars(price));
      paintRange(input);
    });
  }
}

if (typeof document !== 'undefined') {
  const boot = () => mountMortgageCards(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
