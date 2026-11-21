const CONFIG_STRING_FIELDS = [
  'positionMode',
  'inlineTarget',
  'inlineRelation',
  'earletPos',
  'offsetX',
  'offsetY',
];

const escapeForTemplateLiteral = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

const findContainerVarName = (code) => {
  const idMatch = code.match(/([a-zA-Z0-9_$]+)\.id\s*=\s*['"]ca-widget-/);
  if (idMatch) return idMatch[1];

  const divMatch = code.match(
    /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*document\.createElement\(\s*['"]div['"]\s*\)/i
  );
  return divMatch ? divMatch[1] : 'container';
};

/**
 * Updates TEMPLATE_CONFIG positioning fields inside generated campaign JS.
 */
export const patchTemplateConfig = (code, updates = {}) => {
  if (typeof code !== 'string' || !code) return code || '';
  if (!updates || typeof updates !== 'object') return code;

  let nextCode = code;
  for (const field of CONFIG_STRING_FIELDS) {
    const val = updates[field];
    if (val === undefined || val === null) continue;
    if (
      (field === 'positionMode' || field === 'inlineRelation' || field === 'earletPos') &&
      val === ''
    ) {
      continue;
    }

    const pattern = new RegExp(`(${field}\\s*:\\s*)(?:(["'\`])[^"'\\n\\r]*\\2|-?\\d+)`);
    if (pattern.test(nextCode)) {
      const serialized = JSON.stringify(String(val));
      nextCode = nextCode.replace(pattern, (_, prefix) => `${prefix}${serialized}`);
    }
  }

  return nextCode;
};

/**
 * Syncs visual editor DOM edits back into generated JS widget code.
 */
export const patchVisualEdits = (code, innerHtml, containerStyle = '') => {
  if (typeof code !== 'string' || !code) return code || '';
  if (code.trim().startsWith('<')) return code;

  const escapedInnerHtml = escapeForTemplateLiteral(innerHtml);
  const varName = findContainerVarName(code);
  const innerHtmlRegex = new RegExp(
    `(${varName}\\.innerHTML\\s*=\\s*)(['"\`])((?:\\\\[\\s\\S]|(?!\\2)[^\\\\])*)\\2(\\s*;?)`,
    'i'
  );

  let nextCode = code.replace(/\n\n\/\/ --- CA Visual Editor Patch ---[\s\S]*/, '');
  const hasStyle = typeof containerStyle === 'string' && containerStyle.trim().length > 0;
  const styleLiteral = hasStyle ? JSON.stringify(containerStyle) : '';

  if (innerHtmlRegex.test(nextCode)) {
    const styleRegex = new RegExp(
      `${varName}\\.style\\.cssText\\s*=\\s*(['"\`])(?:\\\\[\\s\\S]|(?!\\1)[^\\\\])*\\1\\s*;?`,
      'g'
    );
    const hasExistingStyleRule = hasStyle && styleRegex.test(nextCode);

    nextCode = nextCode.replace(innerHtmlRegex, (_, prefix, _quote, _oldBody, suffix) => {
      const baseReplacement = `${prefix}\`\n${escapedInnerHtml}\n\`${suffix || ';'}`;
      if (hasStyle && !hasExistingStyleRule) {
        return `${baseReplacement}\n    ${varName}.style.cssText = ${styleLiteral};`;
      }
      return baseReplacement;
    });

    if (hasExistingStyleRule) {
      nextCode = nextCode.replace(styleRegex, () => `${varName}.style.cssText = ${styleLiteral};`);
    }

    return nextCode;
  }

  const styleLine = hasStyle ? `\n    _agent.style.cssText = ${styleLiteral};` : '';
  const patchScript =
    `\n\n// --- CA Visual Editor Patch ---\n` +
    `setTimeout(() => {\n` +
    `  const _agent = document.querySelector('[id^="ca-widget-"]');\n` +
    `  if (_agent) {\n` +
    `    _agent.innerHTML = \`${escapedInnerHtml}\`;${styleLine}\n` +
    `  }\n` +
    `}, 50);\n`;

  return nextCode + patchScript;
};

/**
 * Builds the sandboxed preview srcdoc document combining a storefront and widget code.
 */
export const buildPreviewDocument = (storeHtml, generatedCode) => {
  const safePreviewCode = (generatedCode || '')
    .replace(/\/\/\s*\[TRACKING_IMPRESSION\]/g, "console.log('Campaign Impression Event')")
    .replace(/\/\/\s*\[TRACKING_CLICK\]/g, "console.log('Campaign Click Event')");

  const errorTrackingScript = `
        <script>
          window.onerror = function(message, source, lineno) {
            if (source && source !== '' && source !== 'about:srcdoc') return true;
            if (typeof message === 'string' && message.includes('Script error')) return true;
            window.parent.postMessage({ type: 'IFRAME_ERROR', message: message, lineno: lineno }, '*');
            return true;
          };
          window.addEventListener('unhandledrejection', function(e) {
            e.preventDefault();
          });
        </script>
      `;

  let trimmedCode = safePreviewCode.trim();
  if (trimmedCode.startsWith('function') && trimmedCode.endsWith(')();')) {
    trimmedCode = '(' + trimmedCode;
  }

  const isRawJS = Boolean(trimmedCode) && !trimmedCode.startsWith('<');
  if (isRawJS) {
    trimmedCode = trimmedCode
      .replace(
        /document\.body\.appendChild/g,
        "document.getElementById('ca-campaign-wrapper').appendChild"
      )
      .replace(
        /document\.head\.appendChild/g,
        "document.getElementById('ca-campaign-wrapper').appendChild"
      )
      .replace(
        /document\.body\.append\(/g,
        "document.getElementById('ca-campaign-wrapper').append("
      )
      .replace(
        /document\.head\.append\(/g,
        "document.getElementById('ca-campaign-wrapper').append("
      );
  }

  const campaignCode = trimmedCode
    ? isRawJS
      ? `<div id="ca-campaign-wrapper"></div><script>${trimmedCode}</script>`
      : `<div id="ca-campaign-wrapper">${trimmedCode}</div>`
    : `<div id="ca-campaign-wrapper"></div>`;

  const baseHtml =
    typeof storeHtml === 'string' && storeHtml.trim()
      ? storeHtml
      : '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body></body></html>';

  const inject = `${errorTrackingScript}${campaignCode}`;
  if (/<\/body>/i.test(baseHtml)) {
    return baseHtml.replace(/<\/body>/i, () => `${inject}</body>`);
  }
  return baseHtml + inject;
};
