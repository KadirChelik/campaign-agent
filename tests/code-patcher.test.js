import { describe, expect, it } from 'vitest';
import {
  buildPreviewDocument,
  patchTemplateConfig,
  patchVisualEdits,
} from '../src/core/codePatcher.js';

describe('codePatcher', () => {
  describe('patchTemplateConfig', () => {
    it('updates banner and earlet TEMPLATE_CONFIG positioning fields cleanly', () => {
      const sampleBanner = `
        const TEMPLATE_CONFIG = {
          message: "Test",
          positionMode: "fixed-top",
          inlineTarget: ".header",
          inlineRelation: "afterend"
        };
      `;

      const patchedBanner = patchTemplateConfig(sampleBanner, {
        positionMode: 'inline',
        inlineTarget: '#hero-section',
        inlineRelation: 'beforebegin',
      });

      expect(patchedBanner).toContain('positionMode: "inline"');
      expect(patchedBanner).toContain('inlineTarget: "#hero-section"');
      expect(patchedBanner).toContain('inlineRelation: "beforebegin"');
      expect(patchedBanner).toContain('message: "Test"');

      const sampleEarlet = `
        const TEMPLATE_CONFIG = {
          earletPos: "center-right",
          offsetX: "0",
          offsetY: "0"
        };
      `;

      const patchedEarlet = patchTemplateConfig(sampleEarlet, {
        earletPos: 'bottom-left',
        offsetX: 24,
        offsetY: '32',
      });

      expect(patchedEarlet).toContain('earletPos: "bottom-left"');
      expect(patchedEarlet).toContain('offsetX: "24"');
      expect(patchedEarlet).toContain('offsetY: "32"');
    });
  });

  describe('patchVisualEdits', () => {
    it('replaces existing container.innerHTML and updates container style', () => {
      const baseJs = `
        const container = document.createElement('div');
        container.id = 'ca-widget-popup-container';
        container.innerHTML = \`<div class="ca-modal">Old</div>\`;
        document.body.appendChild(container);
      `;

      const patched = patchVisualEdits(
        baseJs,
        '<div class="ca-modal">New `Text` ${1}</div>',
        'background-color: rgb(255, 255, 255);'
      );

      expect(patched).toContain('New \\`Text\\` \\${1}');
      expect(patched).not.toContain('Old');
      expect(patched).toContain('container.style.cssText = "background-color: rgb(255, 255, 255);";');
    });

    it('appends CA Visual Editor Patch fallback when innerHTML assignment is absent and avoids duplicates', () => {
      const customJs = `
        (function () {
          const box = document.createElement('div');
          box.id = 'ca-widget-banner-container';
          const textNode = document.createTextNode('Hello');
          box.appendChild(textNode);
          document.body.appendChild(box);
        })();
      `;

      const patched1 = patchVisualEdits(customJs, '<span>Updated 1</span>', 'padding: 12px;');
      expect(patched1).toContain('// --- CA Visual Editor Patch ---');
      expect(patched1).toContain('document.querySelector(\'[id^="ca-widget-"]\')');
      expect(patched1).toContain('<span>Updated 1</span>');
      expect(patched1).toContain('_agent.style.cssText = "padding: 12px;";');

      const patched2 = patchVisualEdits(patched1, '<span>Updated 2</span>', '');
      expect(patched2.match(/\/\/ --- CA Visual Editor Patch ---/g)?.length).toBe(1);
      expect(patched2).toContain('<span>Updated 2</span>');
      expect(patched2).not.toContain('<span>Updated 1</span>');
    });
  });

  describe('buildPreviewDocument', () => {
    it('injects error tracker, wrapper, rewritten append calls, and tracking logs into storefront HTML', () => {
      const storeHtml = '<!doctype html><html><head></head><body><main id="store-root"></main></body></html>';
      const widgetCode = `
        (function () {
          if (document.getElementById('ca-widget-popup-container')) return;
          const style = document.createElement('style');
          document.head.appendChild(style);
          const container = document.createElement('div');
          container.id = 'ca-widget-popup-container';
          document.body.appendChild(container);
          document.body.append(document.createComment('x'));
          // [TRACKING_IMPRESSION]
          // [TRACKING_CLICK]
        })();
      `;

      const doc = buildPreviewDocument(storeHtml, widgetCode);
      expect(doc).toContain("type: 'IFRAME_ERROR'");
      expect(doc).toContain('<div id="ca-campaign-wrapper"></div><script>');
      expect(doc).toContain("console.log('Campaign Impression Event')");
      expect(doc).toContain("console.log('Campaign Click Event')");
      expect(doc).toContain("document.getElementById('ca-campaign-wrapper').appendChild");
      expect(doc).toContain("document.getElementById('ca-campaign-wrapper').append(");
      expect(doc).not.toContain('document.body.appendChild');
      expect(doc).not.toContain('document.head.appendChild');
      expect(doc).toContain('</body>');
    });
  });
});
