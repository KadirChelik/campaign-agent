/**
 * Converts a CSS rgb(...) or rgba(...) string to a 6-digit hex color.
 * Returns '#000000' for invalid or fully transparent values.
 */
export const rgbToHex = (rgbString) => {
  if (typeof rgbString !== 'string') return '#000000';
  const trimmed = rgbString.trim().toLowerCase();
  if (!trimmed || trimmed === 'transparent') return '#000000';
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;

  const match = trimmed.match(
    /^rgba?\(\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)\s*[,\s]\s*([0-9.]+)(?:\s*[,/]\s*([0-9.]+))?\s*\)$/i
  );

  if (!match) {
    const nums = trimmed.match(/\d+/g);
    if (!nums || nums.length < 3) return '#000000';
    if (nums.length >= 4 && Number(nums[3]) === 0) return '#000000';
    const [r, g, b] = nums
      .slice(0, 3)
      .map((n) => Math.max(0, Math.min(255, Math.round(Number(n)))));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  if (match[4] !== undefined && parseFloat(match[4]) === 0) {
    return '#000000';
  }

  const clamp = (n) => Math.max(0, Math.min(255, Math.round(Number(n))));
  const r = clamp(match[1]);
  const g = clamp(match[2]);
  const b = clamp(match[3]);

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const toKebabCase = (prop) => prop.replace(/([A-Z])/g, '-$1').toLowerCase();

const makeRules = (deviceStyles) => {
  if (!deviceStyles || typeof deviceStyles !== 'object') return '';
  const rules = [];
  for (const [prop, val] of Object.entries(deviceStyles)) {
    if (val === undefined || val === null) continue;
    const strVal = String(val).trim();
    if (!strVal) continue;
    const cleanVal = strVal.replace(/\s*!important\s*$/i, '');
    rules.push(`${toKebabCase(prop)}: ${cleanVal} !important;`);
  }
  return rules.join(' ');
};

/**
 * Generates breakpoint-isolated CSS rules from visual editor element entries.
 * @param {Array<{ id: string, styles: { desktop?: Record<string, string>, tablet?: Record<string, string>, mobile?: Record<string, string> } }>} entries
 * @returns {string}
 */
export const buildResponsiveCss = (entries) => {
  if (!Array.isArray(entries) || entries.length === 0) return '';

  let desktopCss = '';
  let tabletCss = '';
  let mobileCss = '';

  for (const entry of entries) {
    if (!entry || !entry.id || !entry.styles || typeof entry.styles !== 'object') {
      continue;
    }

    const { id, styles } = entry;
    const desktopRules = makeRules(styles.desktop);
    const tabletRules = makeRules(styles.tablet);
    const mobileRules = makeRules(styles.mobile);

    if (desktopRules) desktopCss += `  #${id} { ${desktopRules} }\n`;
    if (tabletRules) tabletCss += `  #${id} { ${tabletRules} }\n`;
    if (mobileRules) mobileCss += `  #${id} { ${mobileRules} }\n`;
  }

  const blocks = [];
  if (desktopCss) blocks.push(`@media (min-width: 769px) {\n${desktopCss}}`);
  if (tabletCss) blocks.push(`@media (min-width: 481px) and (max-width: 768px) {\n${tabletCss}}`);
  if (mobileCss) blocks.push(`@media (max-width: 480px) {\n${mobileCss}}`);

  return blocks.join('\n');
};
