/**
 * Small tools shown on the homepage and at /tools.
 *
 * Add a tool to this array, then refresh both pages:
 *   node scripts/render-small-tools.mjs
 *
 * @typedef {Object} SmallTool
 * @property {string} name Tool name only.
 * @property {string} hook One concrete number or outcome.
 * @property {string} href Absolute URL on charliebuild.com. Never a pages.dev host.
 * @property {string} image Root-relative optimized screenshot.
 * @property {string} alt What the screenshot shows.
 * @property {number} width Intrinsic image width in pixels.
 * @property {number} height Intrinsic image height in pixels.
 */

/** @type {SmallTool[]} */
export const smallTools = [
  {
    name: 'Canadian mortgage calculator',
    hook: '$800k · 20% down · $3,542/mo',
    href: 'https://charliebuild.com/tools/mortgage/',
    image: '/assets/tools/mortgage.webp',
    alt: 'Canadian mortgage calculator, first screen: an $800,000 home, 20% down, 4.50% interest, 25 years, and a payment of $3,542 per month.',
    width: 1280,
    height: 730,
  },
];

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
export function renderSmallToolCard(tool) {
  return [
    '<li>',
    '  <a class="tool-card" href="' + escapeHtml(tool.href) + '">',
    '    <img class="tool-shot" src="' + escapeHtml(tool.image) + '" alt="' + escapeHtml(tool.alt) + '" width="' + String(tool.width) + '" height="' + String(tool.height) + '" loading="lazy" decoding="async">',
    '    <span class="tool-body">',
    '      <span class="tool-name">' + escapeHtml(tool.name) + '</span>',
    '      <span class="tool-hook">' + escapeHtml(tool.hook) + '</span>',
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
  return tools.map((tool) => renderSmallToolCard(tool)).join('\n');
}
