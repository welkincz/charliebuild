/**
 * Small tools shown on the homepage and at /tools/.
 *
 * Add a tool to this array, then refresh both pages:
 *   node scripts/render-small-tools.mjs
 *
 * One tool renders as a full-width horizontal card. Two or more
 * switch the list to a two-column grid.
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
 */

/** @type {SmallTool[]} */
export const smallTools = [
  {
    name: 'Canadian mortgage calculator',
    hook: '$800k · 20% down · $3,542/mo',
    tags: ['React', 'Live'],
    href: 'https://charliebuild.com/tools/mortgage/?p=800000&d=160000',
    image: '/assets/tools/mortgage.webp',
    alt: 'Payment of $3,542 per month beside the home price slider at $800,000.',
    width: 1880,
    height: 455,
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
export function renderSmallToolCard(tool) {
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
  return '<ul class="tool-grid" data-layout="' + layout + '">\n'
    + tools.map((tool) => renderSmallToolCard(tool)).join('\n')
    + '\n</ul>';
}
