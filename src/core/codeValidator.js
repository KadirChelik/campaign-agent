import { buildResponsiveCss } from './responsiveCss.js';

export const CONTAINER_IDS = Object.freeze({
  popup: 'ca-widget-popup-container',
  banner: 'ca-widget-banner-container',
  earlet: 'ca-widget-earlet-container',
});

export const MAX_CODE_LENGTH = 65_000;

const DANGEROUS_PATTERNS = [
  { pattern: /\bdocument\.cookie\b/i, message: 'Disallowed API: document.cookie is not permitted.' },
  { pattern: /\blocalStorage\b/i, message: 'Disallowed API: localStorage is not permitted.' },
  { pattern: /\bsessionStorage\b/i, message: 'Disallowed API: sessionStorage is not permitted.' },
  { pattern: /\bindexedDB\b/i, message: 'Disallowed API: indexedDB is not permitted.' },
  { pattern: /\beval\s*\(/, message: 'Disallowed API: eval() is not permitted.' },
  { pattern: /\bnew\s+Function\s*\(/, message: 'Disallowed API: new Function() is not permitted.' },
  { pattern: /\bfetch\s*\(/, message: 'Disallowed API: fetch() is not permitted.' },
  { pattern: /\bXMLHttpRequest\b/, message: 'Disallowed API: XMLHttpRequest is not permitted.' },
  { pattern: /\bwindow\.top\.location\b/, message: 'Disallowed API: window.top.location is not permitted.' },
  { pattern: /\bparent\.location\b/, message: 'Disallowed API: parent.location is not permitted.' },
  { pattern: /<script[^>]+src\s*=/i, message: 'Disallowed tag: external <script src=...> is not permitted.' },
  { pattern: /\bimport\s*\(/, message: 'Disallowed syntax: dynamic import() is not permitted.' },
];

const COLOR_RULES = [
  { regex: /(?:^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])(k[ıi]rm[ıi]z[ıi]|red)(?=$|[^a-zA-ZçğıöşüÇĞİÖŞÜ])/i, accent: '#dc2626', accentHover: '#b91c1c', surface: '#fef2f2' },
  { regex: /(?:^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])(mavi|blue|lacivert)(?=$|[^a-zA-ZçğıöşüÇĞİÖŞÜ])/i, accent: '#2563eb', accentHover: '#1d4ed8', surface: '#eff6ff' },
  { regex: /(?:^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])(ye[şs]il|green|emerald)(?=$|[^a-zA-ZçğıöşüÇĞİÖŞÜ])/i, accent: '#059669', accentHover: '#047857', surface: '#ecfdf5' },
  { regex: /(?:^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])(mor|purple|violet)(?=$|[^a-zA-ZçğıöşüÇĞİÖŞÜ])/i, accent: '#7c3aed', accentHover: '#6d28d9', surface: '#f5f3ff' },
  { regex: /(?:^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])(turuncu|orange)(?=$|[^a-zA-ZçğıöşüÇĞİÖŞÜ])/i, accent: '#ea580c', accentHover: '#c2410c', surface: '#fff7ed' },
  { regex: /(?:^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])(pembe|pink|rose)(?=$|[^a-zA-ZçğıöşüÇĞİÖŞÜ])/i, accent: '#db2777', accentHover: '#be185d', surface: '#fdf2f8' },
  { regex: /(?:^|[^a-zA-ZçğıöşüÇĞİÖŞÜ])(siyah|dark|gece|karanl[ıi]k|black)(?=$|[^a-zA-ZçğıöşüÇĞİÖŞÜ])/i, accent: '#0f172a', accentHover: '#1e293b', surface: '#1e293b', isDark: true },
];

/**
 * Strip markdown code fences and non-external <script> wrapper tags from LLM output.
 */
export function stripCodeFences(raw) {
  if (typeof raw !== 'string') return '';
  let code = raw.trim();

  const fencedBlockMatch = code.match(/```(?:javascript|js|html)?\s*\r?\n([\s\S]*?)```/i);
  if (fencedBlockMatch && code.indexOf('```') > 0 && code.endsWith('```')) {
    code = fencedBlockMatch[1].trim();
  } else {
    code = code
      .replace(/```(?:javascript|js|html)?/gi, '')
      .replace(/```/g, '')
      .trim();
  }

  code = code
    .replace(/<script(?![^>]*\bsrc\s*=)[^>]*>/gi, '')
    .replace(/<\/script>/gi, '')
    .trim();

  return code;
}

/**
 * Validate generated campaign widget JS for container isolation, safety, and JS syntax.
 * @param {string} rawCode
 * @param {'popup'|'banner'|'earlet'} campaignType
 * @returns {{ ok: boolean, code: string, errors: string[] }}
 */
export function validateCampaignCode(rawCode, campaignType) {
  const code = stripCodeFences(rawCode);
  const errors = [];

  const expectedContainerId = CONTAINER_IDS[campaignType];
  if (!expectedContainerId) {
    errors.push(`Invalid campaignType "${String(campaignType)}". Expected popup, banner, or earlet.`);
  }

  if (!code) {
    errors.push('Generated code is empty.');
    return { ok: false, code, errors };
  }

  if (code.length > MAX_CODE_LENGTH) {
    errors.push(`Generated code exceeds maximum length of ${MAX_CODE_LENGTH} characters.`);
  }

  if (expectedContainerId && !code.includes(expectedContainerId)) {
    errors.push(`Missing required container ID "${expectedContainerId}".`);
  }

  const hasDuplicateGuard = /\bgetElementById\s*\(/.test(code);
  const hasIifeWrapper = /\(\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*=>)/.test(code);
  if (!hasDuplicateGuard && !hasIifeWrapper) {
    errors.push('Code must include a duplicate-mount guard (document.getElementById) or an IIFE wrapper.');
  }

  for (const rule of DANGEROUS_PATTERNS) {
    if (rule.pattern.test(code)) {
      errors.push(rule.message);
    }
  }

  try {
    // Validate JS syntax without executing the snippet.
    new Function(code);
  } catch (err) {
    errors.push(`JavaScript syntax error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    ok: errors.length === 0,
    code,
    errors,
  };
}

function extractColorTheme(userRequest) {
  const hexMatch = userRequest.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
  for (const rule of COLOR_RULES) {
    if (rule.regex.test(userRequest)) {
      return {
        accent: hexMatch ? hexMatch[0] : rule.accent,
        accentHover: hexMatch ? hexMatch[0] : rule.accentHover,
        surface: rule.surface,
        isDark: Boolean(rule.isDark),
      };
    }
  }
  if (hexMatch) {
    return {
      accent: hexMatch[0],
      accentHover: hexMatch[0],
      surface: '#f8fafc',
      isDark: false,
    };
  }
  return {
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    surface: '#eff6ff',
    isDark: false,
  };
}

function extractDiscount(userRequest) {
  const match = userRequest.match(/%\s*(\d{1,2})\b|\b(\d{1,2})\s*%/);
  return match ? match[1] || match[2] : null;
}

function extractQuotedStrings(userRequest) {
  const results = [];
  const regex = /"([^"\n]{2,80})"|'([^'\n]{2,80})'/g;
  let match = regex.exec(userRequest);
  while (match !== null) {
    const val = (match[1] || match[2] || '').trim();
    if (val) results.push(val);
    match = regex.exec(userRequest);
  }
  return results;
}

const TEMPLATE_TEXT_KEYS = [
  'title',
  'subtitle',
  'description',
  'ctaText',
  'badgeText',
  'couponCode',
  'timerTitle',
  'tabText',
  'yesText',
  'noText',
  'placeholder',
  'buttonText',
  'message',
  'code',
  'image',
  'desktopImage',
  'mobileImage',
  'desktopImg',
  'mobileImg',
  'ctaUrl',
];

const STYLE_REQUEST_REGEX =
  /(renk|rengi|arkaplan|arka\s*plan|background|color|boyut|font|yaz[ıi]\s*tipi|yuvarla|radius|k[öo][şs]e|kenar|tema|koyu|a[çc][ıi]k|dark|light|siyah|beyaz|k[ıi]rm[ıi]z[ıi]|mavi|lacivert|ye[şs]il|mor|turuncu|pembe|sar[ıi]|alt[ıi]n|stil|style|tasar[ıi]m|ortala|hizala|geni[şs]lik|y[üu]kseklik|padding|margin|bo[şs]luk|kal[ıi]n|bold|#(?:[0-9a-fA-F]{3,6})\b)/i;

function extractTemplateConfigStrings(code) {
  const map = {};
  if (typeof code !== 'string' || !code) return map;
  const blockMatch = code.match(/TEMPLATE_CONFIG\s*=\s*\{([\s\S]*?)\};/);
  if (!blockMatch) return map;
  const block = blockMatch[1];

  for (const key of TEMPLATE_TEXT_KEYS) {
    const propRegex = new RegExp(`\\b${key}\\s*:\\s*(["'\`])((?:\\\\[\\s\\S]|(?!\\1)[^\\\\])*)\\1`);
    const m = block.match(propRegex);
    if (m) {
      map[key] = m[2]
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\`/g, '`')
        .replace(/\\n/g, '\n');
    }
  }
  return map;
}

function decodeHtmlEntities(str) {
  return String(str || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function extractDataCaStyleMap(code) {
  const result = new Map();
  if (typeof code !== 'string' || !code) return result;

  const tagRegex = /<[a-zA-Z0-9]+\b[^>]*\bdata-ca-styles=(['"])([\s\S]*?)\1[^>]*>/gi;
  let match = tagRegex.exec(code);
  while (match !== null) {
    const fullTag = match[0];
    const rawJson = decodeHtmlEntities(match[2]).trim();
    const idMatch = fullTag.match(/\bid=(['"])([^'"]+)\1/i);
    if (idMatch && rawJson.startsWith('{')) {
      try {
        result.set(idMatch[2], {
          raw: rawJson,
          parsed: JSON.parse(rawJson),
        });
      } catch {
        // ignore malformed data-ca-styles JSON
      }
    }
    match = tagRegex.exec(code);
  }
  return result;
}

function extractMainStyleBlock(code) {
  if (typeof code !== 'string' || !code) return '';
  const m = code.match(/style\.(?:innerHTML|textContent)\s*=\s*(['"`])([\s\S]*?)\1/);
  return m ? m[2].trim() : '';
}

/**
 * Reconciles AI-edited widget code against previous code so that:
 * 1. Changes made to TEMPLATE_CONFIG fields also update baked literal HTML in container.innerHTML.
 * 2. Stale visual-editor `!important` rules (`data-ca-styles` & `.ca-visual-edits`) do not block new AI style edits,
 *    while any `data-ca-styles` explicitly updated by the AI are rebuilt into `.ca-visual-edits`.
 */
export function reconcileAiEditedCode(newCode, previousCode = '', userRequest = '') {
  if (typeof newCode !== 'string' || !newCode.trim()) return newCode || '';
  if (typeof previousCode !== 'string' || !previousCode.trim()) return newCode;

  let code = newCode;

  // 1. Sync TEMPLATE_CONFIG changes into baked literal container.innerHTML
  const prevConfig = extractTemplateConfigStrings(previousCode);
  const nextConfig = extractTemplateConfigStrings(code);

  const innerHtmlRegex =
    /\b(?!style\b)([a-zA-Z0-9_$]+\.innerHTML\s*=\s*)(['"`])((?:\\[\s\S]|(?!\2)[^\\])*)\2/g;
  code = code.replace(innerHtmlRegex, (fullMatch, prefix, quote, body) => {
    let innerBody = body;
    let innerChanged = false;

    for (const key of TEMPLATE_TEXT_KEYS) {
      const oldVal = prevConfig[key];
      const newVal = nextConfig[key];
      if (
        oldVal &&
        newVal &&
        oldVal !== newVal &&
        oldVal.length >= 2 &&
        innerBody.includes(oldVal) &&
        !innerBody.includes(`TEMPLATE_CONFIG.${key}`)
      ) {
        innerBody = innerBody.split(oldVal).join(newVal);
        innerChanged = true;
      }
    }

    return innerChanged ? `${prefix}${quote}${innerBody}${quote}` : fullMatch;
  });

  // 2. Reconcile data-ca-styles and <style class="ca-visual-edits">
  const hasVisualEditsInNew =
    /data-ca-styles=/i.test(code) || /class=(['"])ca-visual-edits\1/i.test(code);

  if (hasVisualEditsInNew) {
    const prevStyleMap = extractDataCaStyleMap(previousCode);
    const nextStyleMap = extractDataCaStyleMap(code);
    const mainStyleChanged =
      extractMainStyleBlock(code) !== extractMainStyleBlock(previousCode);
    const styleRequested = STYLE_REQUEST_REGEX.test(userRequest || '');

    const keptEntries = [];
    for (const [id, info] of nextStyleMap.entries()) {
      const prevInfo = prevStyleMap.get(id);
      const isUnchangedFromPrev = prevInfo && prevInfo.raw === info.raw;
      if (isUnchangedFromPrev && (mainStyleChanged || styleRequested)) {
        // Strip stale unchanged data-ca-styles attribute for this element so new CSS rules take effect
        const attrRegex = new RegExp(
          `(<[^>]*\\bid=(['"])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\2[^>]*?)\\s+data-ca-styles=(['"])[\\s\\S]*?\\3`,
          'gi'
        );
        code = code.replace(attrRegex, '$1');
        const attrBeforeIdRegex = new RegExp(
          `(<[^>]*?)\\s+data-ca-styles=(['"])[\\s\\S]*?\\2([^>]*\\bid=(['"])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\4)`,
          'gi'
        );
        code = code.replace(attrBeforeIdRegex, '$1$3');
      } else {
        keptEntries.push({ id, styles: info.parsed });
      }
    }

    const rebuiltVisualCss = buildResponsiveCss(keptEntries).trim();
    const visualStyleTagRegex =
      /<style\b[^>]*class=(['"])ca-visual-edits\1[^>]*>[\s\S]*?<\/style>\s*/gi;

    if (rebuiltVisualCss) {
      if (visualStyleTagRegex.test(code)) {
        code = code.replace(
          visualStyleTagRegex,
          `<style class="ca-visual-edits">${rebuiltVisualCss}</style>`
        );
      }
    } else {
      code = code.replace(visualStyleTagRegex, '');
    }
  }

  return code;
}

function extractNaturalFieldEdits(userRequest) {
  const edits = {};
  if (typeof userRequest !== 'string' || !userRequest.trim()) return edits;

  const titleMatch = userRequest.match(
    /ba[şs]l[ıi][ğg][ıi]\s+(?:["']([^"'\n]{2,90})["']|([^,.\n]{2,60}?))\s+(?:yap|olsun|olarak\s+de[ğg]i[şs]tir|yaz)/i
  );
  if (titleMatch) {
    edits.title = (titleMatch[1] || titleMatch[2] || '').trim();
  }

  const ctaMatch = userRequest.match(
    /(?:buton\s+yaz[ıi]s[ıi]n[ıi]|buton\s+metnini|butonu|cta\s+yaz[ıi]s[ıi]n[ıi])\s+(?:["']([^"'\n]{2,60})["']|([^,.\n]{2,40}?))\s+(?:yap|olsun|olarak\s+de[ğg]i[şs]tir|yaz)/i
  );
  if (ctaMatch) {
    const candidate = (ctaMatch[1] || ctaMatch[2] || '').trim();
    if (
      candidate &&
      !/(k[ıi]rm[ıi]z[ıi]|mavi|lacivert|ye[şs]il|mor|turuncu|pembe|siyah|beyaz|sar[ıi]|red|blue|green|purple|orange|pink|dark|black|yuvarlak|b[üu]y[üu]k|k[üu][çc][üu]k)/i.test(
        candidate
      )
    ) {
      edits.ctaText = candidate;
    }
  }

  return edits;
}

function patchExistingWidgetCode(existingCode, campaignType, userRequest) {
  const containerId = CONTAINER_IDS[campaignType];
  const theme = extractColorTheme(userRequest);
  const discount = extractDiscount(userRequest);
  const quoted = extractQuotedStrings(userRequest);
  const naturalEdits = extractNaturalFieldEdits(userRequest);

  let updated = existingCode.replace(/\n*\/\/ --- CA Demo Theme Patch ---[\s\S]*$/m, '').trim();

  if (discount) {
    updated = updated.replace(/%\d{1,2}\b/g, `%${discount}`);
  }

  let newTitle = naturalEdits.title || null;
  let newCta = naturalEdits.ctaText || null;

  if (quoted.length > 0) {
    const firstQuote = quoted[0];
    if (/(buton|button|cta)/i.test(userRequest) && !newCta) {
      newCta = firstQuote;
    } else if (/(ba[şs]l[ıi]k|title)/i.test(userRequest) && !newTitle) {
      newTitle = firstQuote;
    } else if (!newTitle) {
      newTitle = firstQuote;
    }
    if (quoted.length > 1 && !newCta) {
      newCta = quoted[1];
    }
  }

  if (newCta) {
    const safeCta = JSON.stringify(newCta);
    if (/ctaText\s*:\s*["'`][^"'`]*["'`]/.test(updated)) {
      updated = updated.replace(/ctaText\s*:\s*["'`][^"'`]*["'`]/, `ctaText: ${safeCta}`);
    }
    updated = updated.replace(
      /(<(?:button|a)\b[^>]*\bclass=(['"])[^'"]*\bca-btn\b[^'"]*\2[^>]*>)([\s\S]*?)(<\/(?:button|a)>)/i,
      (_, openTag, _q, oldInner, closeTag) =>
        oldInner.includes('TEMPLATE_CONFIG.') ? _ : `${openTag}${newCta}${closeTag}`
    );
  }

  if (newTitle) {
    const safeTitle = JSON.stringify(newTitle);
    if (/title\s*:\s*["'`][^"'`]*["'`]/.test(updated)) {
      updated = updated.replace(/title\s*:\s*["'`][^"'`]*["'`]/, `title: ${safeTitle}`);
    } else if (/message\s*:\s*["'`][^"'`]*["'`]/.test(updated)) {
      updated = updated.replace(/message\s*:\s*["'`][^"'`]*["'`]/, `message: ${safeTitle}`);
    }
    updated = updated.replace(
      /(<(?:h1|h2|h3|div|span)\b[^>]*\bclass=(['"])[^'"]*\bca-title\b[^'"]*\2[^>]*>)([\s\S]*?)(<\/(?:h1|h2|h3|div|span)>)/i,
      (_, openTag, _q, oldInner, closeTag) =>
        oldInner.includes('TEMPLATE_CONFIG.') ? _ : `${openTag}${newTitle}${closeTag}`
    );
  }

  updated = reconcileAiEditedCode(updated, existingCode, userRequest);

  const modalBg = theme.isDark ? '#0f172a' : '';
  const modalFg = theme.isDark ? '#f8fafc' : '';
  const patchCss = [
    `#${containerId} .ca-btn, #${containerId} #ca-cta-btn { background: ${theme.accent} !important; border-color: ${theme.accent} !important; color: #ffffff !important; }`,
    `#${containerId} .ca-btn:hover, #${containerId} #ca-cta-btn:hover { background: ${theme.accentHover} !important; }`,
    theme.isDark && campaignType === 'popup'
      ? `#${containerId} .ca-modal { background: ${modalBg} !important; color: ${modalFg} !important; } #${containerId} .ca-title, #${containerId} .ca-desc { color: ${modalFg} !important; }`
      : '',
    theme.isDark && campaignType !== 'popup'
      ? `#${containerId}, #${containerId} .ca-earlet-body { background: ${modalBg} !important; color: ${modalFg} !important; }`
      : '',
    `@media (max-width: 640px) { #${containerId} .ca-btn { width: 100% !important; } }`,
  ]
    .filter(Boolean)
    .join(' ');

  const patchBlock = `

// --- CA Demo Theme Patch ---
;(function () {
  var container = document.getElementById(${JSON.stringify(containerId)});
  if (!container) return;
  var existingPatch = document.getElementById('ca-demo-patch-style');
  if (existingPatch) existingPatch.remove();
  var patchStyle = document.createElement('style');
  patchStyle.id = 'ca-demo-patch-style';
  patchStyle.textContent = ${JSON.stringify(patchCss)};
  document.head.appendChild(patchStyle);
})();`;

  return `${updated}${patchBlock}`;
}

/**
 * Deterministic demo-mode fallback generator when no API key is configured
 * or upstream LLM providers fail.
 * @param {'popup'|'banner'|'earlet'} campaignType
 * @param {string} userRequest
 * @param {string} [existingCode]
 * @returns {string}
 */
export function buildDemoFallbackCode(campaignType, userRequest = '', existingCode = '') {
  const normalizedType = CONTAINER_IDS[campaignType] ? campaignType : 'popup';
  const promptText = typeof userRequest === 'string' ? userRequest.trim() : '';

  if (typeof existingCode === 'string' && existingCode.trim()) {
    const existingCheck = validateCampaignCode(existingCode, normalizedType);
    if (existingCheck.ok) {
      const patched = patchExistingWidgetCode(existingCheck.code, normalizedType, promptText);
      if (validateCampaignCode(patched, normalizedType).ok) {
        return patched;
      }
    }
  }

  const theme = extractColorTheme(promptText);
  const discount = extractDiscount(promptText);
  const quoted = extractQuotedStrings(promptText);
  const containerId = CONTAINER_IDS[normalizedType];

  const defaultTitle =
    normalizedType === 'popup'
      ? discount
        ? `Seçili Ürünlerde %${discount} İndirim`
        : 'Özel Kampanya Fırsatı'
      : normalizedType === 'banner'
        ? discount
          ? `Flaş Kampanya: Tüm sepette net %${discount} indirim!`
          : 'Yeni Sezon Fırsatları Başladı! İlk siparişe özel avantajları keşfet.'
        : discount
          ? `%${discount} İndirim Kodu`
          : 'Sana Özel Avantaj';

  const title = quoted[0] || (promptText && promptText.length <= 72 ? promptText : defaultTitle);
  const description =
    promptText && promptText.length > 0
      ? `Kampanya özeti: ${promptText.slice(0, 140)}`
      : 'Sınırlı süreli özel fırsatı kaçırmayın.';
  const ctaText = quoted[1] || (normalizedType === 'earlet' ? 'KODU KULLAN' : 'Fırsatı İncele');
  const badgeText = discount ? `%${discount} İNDİRİM` : 'KAMPANYA';

  const configObj = {
    title,
    description,
    badgeText,
    ctaText,
    ctaUrl: 'https://example.com/deals',
    ...(normalizedType === 'banner'
      ? {
          positionMode: 'fixed-top',
          inlineTarget: '#store-header',
          inlineRelation: 'afterend',
        }
      : {}),
    ...(normalizedType === 'earlet'
      ? {
          tabText: badgeText,
          couponCode: discount ? `CA${discount}` : 'CA2026',
          earletPos: 'bottom-right',
          offsetX: '20',
          offsetY: '20',
        }
      : {}),
  };

  const bgColor = theme.isDark ? '#0f172a' : '#ffffff';
  const textColor = theme.isDark ? '#f8fafc' : '#0f172a';
  const mutedColor = theme.isDark ? '#cbd5e1' : '#475569';

  if (normalizedType === 'popup') {
    return `(function () {
  var containerId = ${JSON.stringify(containerId)};
  if (document.getElementById(containerId)) return;

  var TEMPLATE_CONFIG = ${JSON.stringify(configObj, null, 2)};
  var esc = function (value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.textContent = [
    '#' + containerId + ' { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.52); backdrop-filter: blur(8px); z-index: 2147483647 !important; display: flex; align-items: center; justify-content: center; padding: 16px; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1); }',
    '#' + containerId + '.show { opacity: 1; }',
    '#' + containerId + ' .ca-modal { position: relative; width: 100%; max-width: 480px; background: ${bgColor}; color: ${textColor}; border-radius: 20px; padding: 32px 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3); text-align: center; transform: translateY(16px) scale(0.97); transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }',
    '#' + containerId + '.show .ca-modal { transform: translateY(0) scale(1); }',
    '#' + containerId + ' .ca-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border: none; border-radius: 50%; background: rgba(148, 163, 184, 0.2); color: ${textColor}; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }',
    '#' + containerId + ' .ca-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: ${theme.surface}; color: ${theme.accent}; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 14px; }',
    '#' + containerId + ' .ca-title { margin: 0 0 10px 0; font-size: 24px; font-weight: 800; line-height: 1.25; color: ${textColor}; }',
    '#' + containerId + ' .ca-desc { margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: ${mutedColor}; }',
    '#' + containerId + ' .ca-btn { width: 100%; padding: 14px 20px; border: none; border-radius: 12px; background: ${theme.accent}; color: #ffffff; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }',
    '#' + containerId + ' .ca-btn:hover { background: ${theme.accentHover}; transform: translateY(-1px); }',
    '@media (max-width: 640px) { #' + containerId + ' .ca-modal { padding: 24px 20px; } #' + containerId + ' .ca-title { font-size: 20px; } }'
  ].join('\\n');
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.id = containerId;
  container.innerHTML =
    '<div class="ca-modal">' +
      '<button class="ca-close" aria-label="Kapat">&times;</button>' +
      '<span class="ca-badge">' + esc(TEMPLATE_CONFIG.badgeText) + '</span>' +
      '<h2 class="ca-title">' + esc(TEMPLATE_CONFIG.title) + '</h2>' +
      '<p class="ca-desc">' + esc(TEMPLATE_CONFIG.description) + '</p>' +
      '<button class="ca-btn" id="ca-cta-btn">' + esc(TEMPLATE_CONFIG.ctaText) + '</button>' +
    '</div>';
  document.body.appendChild(container);

  setTimeout(function () { container.classList.add('show'); }, 40);

  var closePopup = function () {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(function () { container.remove(); style.remove(); }, 300);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = function (e) { if (e.target === container) closePopup(); };
  container.querySelector('#ca-cta-btn').onclick = function (e) {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) return;
    // [TRACKING_CLICK]
    window.location.href = TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();`;
  }

  if (normalizedType === 'banner') {
    return `(function () {
  var containerId = ${JSON.stringify(containerId)};
  if (document.getElementById(containerId)) return;

  var TEMPLATE_CONFIG = ${JSON.stringify(configObj, null, 2)};
  var esc = function (value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var posCSS = 'position: fixed; top: 0; left: 0; width: 100%; transform: translateY(-100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);';
  var showCSS = 'transform: translateY(0);';
  if (TEMPLATE_CONFIG.positionMode === 'fixed-bottom') {
    posCSS = 'position: fixed; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);';
  } else if (TEMPLATE_CONFIG.positionMode === 'inline') {
    posCSS = 'position: relative; width: 100%; display: block; opacity: 0; transition: opacity 0.35s ease;';
    showCSS = 'opacity: 1;';
  }

  var style = document.createElement('style');
  style.id = 'ca-banner-style';
  style.textContent = [
    '#' + containerId + ' { ' + posCSS + ' background: #0f172a; color: #f8fafc; z-index: 2147483647 !important; display: flex; align-items: center; justify-content: center; padding: 12px 44px; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16); }',
    '#' + containerId + '.show { ' + showCSS + ' }',
    '#' + containerId + ' .ca-banner-content { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; text-align: center; }',
    '#' + containerId + ' .ca-badge { background: ${theme.accent}; color: #ffffff; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }',
    '#' + containerId + ' .ca-text { font-size: 14px; font-weight: 500; margin: 0; color: #f8fafc; }',
    '#' + containerId + ' .ca-btn { background: ${theme.accent}; color: #ffffff; border: none; padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }',
    '#' + containerId + ' .ca-btn:hover { background: ${theme.accentHover}; }',
    '#' + containerId + ' .ca-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; }',
    '@media (max-width: 640px) { #' + containerId + ' { padding: 12px 36px 12px 12px; } #' + containerId + ' .ca-banner-content { gap: 8px; flex-direction: column; } }'
  ].join('\\n');
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.id = containerId;
  container.innerHTML =
    '<div class="ca-banner-content">' +
      '<span class="ca-badge">' + esc(TEMPLATE_CONFIG.badgeText) + '</span>' +
      '<span class="ca-text">' + esc(TEMPLATE_CONFIG.title) + '</span>' +
      '<button class="ca-btn" id="ca-cta-btn">' + esc(TEMPLATE_CONFIG.ctaText) + '</button>' +
    '</div>' +
    '<button class="ca-close" aria-label="Kapat">&times;</button>';

  if (TEMPLATE_CONFIG.positionMode === 'inline' && TEMPLATE_CONFIG.inlineTarget) {
    var targetEl = document.querySelector(TEMPLATE_CONFIG.inlineTarget);
    if (targetEl) {
      targetEl.insertAdjacentElement(TEMPLATE_CONFIG.inlineRelation || 'afterend', container);
    } else {
      document.body.appendChild(container);
    }
  } else {
    document.body.appendChild(container);
  }

  setTimeout(function () { container.classList.add('show'); }, 40);

  container.querySelector('.ca-close').onclick = function () {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(function () { container.remove(); style.remove(); }, 350);
  };

  container.querySelector('#ca-cta-btn').onclick = function (e) {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) return;
    // [TRACKING_CLICK]
    window.location.href = TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();`;
  }

  return `(function () {
  var containerId = ${JSON.stringify(containerId)};
  if (document.getElementById(containerId)) return;

  var TEMPLATE_CONFIG = ${JSON.stringify(configObj, null, 2)};
  var esc = function (value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var x = (TEMPLATE_CONFIG.offsetX || '20') + 'px';
  var y = (TEMPLATE_CONFIG.offsetY || '20') + 'px';
  var posCSS = 'bottom: ' + y + '; right: ' + x + ';';
  if (TEMPLATE_CONFIG.earletPos === 'bottom-left') posCSS = 'bottom: ' + y + '; left: ' + x + ';';
  else if (TEMPLATE_CONFIG.earletPos === 'top-right') posCSS = 'top: ' + y + '; right: ' + x + ';';
  else if (TEMPLATE_CONFIG.earletPos === 'top-left') posCSS = 'top: ' + y + '; left: ' + x + ';';
  else if (TEMPLATE_CONFIG.earletPos === 'center-right') posCSS = 'top: 50%; right: ' + x + '; transform: translateY(-50%);';
  else if (TEMPLATE_CONFIG.earletPos === 'center-left') posCSS = 'top: 50%; left: ' + x + '; transform: translateY(-50%);';
  else if (TEMPLATE_CONFIG.earletPos === 'bottom-center') posCSS = 'bottom: ' + y + '; left: 50%; transform: translateX(-50%);';
  else if (TEMPLATE_CONFIG.earletPos === 'top-center') posCSS = 'top: ' + y + '; left: 50%; transform: translateX(-50%);';

  var style = document.createElement('style');
  style.id = 'ca-earlet-style';
  style.textContent = [
    '#' + containerId + ' { position: fixed; ' + posCSS + ' z-index: 2147483647 !important; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.35s ease; }',
    '#' + containerId + '.show { opacity: 1; }',
    '#' + containerId + ' .ca-earlet-body { background: ${bgColor}; color: ${textColor}; border-radius: 16px; box-shadow: 0 16px 36px rgba(15, 23, 42, 0.24); border: 1px solid rgba(148, 163, 184, 0.25); overflow: hidden; }',
    '#' + containerId + ' .ca-collapsed { display: flex; align-items: center; gap: 8px; padding: 12px 18px; background: ${theme.accent}; color: #ffffff; font-weight: 700; font-size: 13px; cursor: pointer; }',
    '#' + containerId + ' .ca-expanded { display: none; width: 270px; padding: 20px; position: relative; }',
    '#' + containerId + '.ca-open .ca-collapsed { display: none; }',
    '#' + containerId + '.ca-open .ca-expanded { display: block; }',
    '#' + containerId + ' .ca-close { position: absolute; top: 10px; right: 10px; background: transparent; border: none; color: ${mutedColor}; font-size: 18px; cursor: pointer; }',
    '#' + containerId + ' .ca-title { margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: ${textColor}; }',
    '#' + containerId + ' .ca-desc { margin: 0 0 14px 0; font-size: 13px; color: ${mutedColor}; line-height: 1.5; }',
    '#' + containerId + ' .ca-btn { width: 100%; padding: 11px 14px; border: none; border-radius: 10px; background: ${theme.accent}; color: #ffffff; font-size: 13px; font-weight: 700; cursor: pointer; }',
    '#' + containerId + ' .ca-btn:hover { background: ${theme.accentHover}; }'
  ].join('\\n');
  document.head.appendChild(style);

  var container = document.createElement('div');
  container.id = containerId;
  container.setAttribute('data-epos', TEMPLATE_CONFIG.earletPos);
  container.setAttribute('data-ex', TEMPLATE_CONFIG.offsetX);
  container.setAttribute('data-ey', TEMPLATE_CONFIG.offsetY);
  container.innerHTML =
    '<div class="ca-earlet-body">' +
      '<div class="ca-collapsed" id="ca-expand-trigger">' + esc(TEMPLATE_CONFIG.tabText) + '</div>' +
      '<div class="ca-expanded">' +
        '<button class="ca-close" id="ca-collapse-trigger" aria-label="Küçült">&times;</button>' +
        '<h3 class="ca-title">' + esc(TEMPLATE_CONFIG.title) + '</h3>' +
        '<p class="ca-desc">' + esc(TEMPLATE_CONFIG.description) + '</p>' +
        '<button class="ca-btn" id="ca-cta-btn">' + esc(TEMPLATE_CONFIG.ctaText) + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(container);

  setTimeout(function () { container.classList.add('show'); }, 40);

  container.querySelector('#ca-expand-trigger').onclick = function () {
    container.classList.add('ca-open');
  };
  container.querySelector('#ca-collapse-trigger').onclick = function () {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('ca-open');
  };
  container.querySelector('#ca-cta-btn').onclick = function (e) {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) return;
    // [TRACKING_CLICK]
    window.location.href = TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();`;
}
