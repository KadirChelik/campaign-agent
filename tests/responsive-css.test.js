import { describe, expect, it } from 'vitest';
import { buildResponsiveCss, rgbToHex } from '../src/core/responsiveCss.js';

describe('responsiveCss', () => {
  describe('rgbToHex', () => {
    it('converts rgb and rgba strings to lowercase 6-digit hex', () => {
      expect(rgbToHex('rgb(255, 0, 128)')).toBe('#ff0080');
      expect(rgbToHex('rgba(15, 23, 42, 0.85)')).toBe('#0f172a');
      expect(rgbToHex('rgb(16 185 129)')).toBe('#10b981');
      expect(rgbToHex('#1DB3D6')).toBe('#1db3d6');
    });

    it('falls back to #000000 for transparent or invalid inputs', () => {
      expect(rgbToHex('transparent')).toBe('#000000');
      expect(rgbToHex('rgba(0, 0, 0, 0)')).toBe('#000000');
      expect(rgbToHex('')).toBe('#000000');
      expect(rgbToHex(null)).toBe('#000000');
    });
  });

  describe('buildResponsiveCss', () => {
    it('isolates desktop, tablet, and mobile rules inside separate media queries with !important', () => {
      const css = buildResponsiveCss([
        {
          id: 'ca-el-title',
          styles: {
            desktop: { fontSize: '28px', color: '#0f172a' },
            tablet: { fontSize: '22px' },
            mobile: { fontSize: '18px', textAlign: 'center' },
          },
        },
        {
          id: 'ca-el-btn',
          styles: {
            mobile: { width: '100% !important' },
          },
        },
      ]);

      expect(css).toContain('@media (min-width: 769px)');
      expect(css).toContain('#ca-el-title { font-size: 28px !important; color: #0f172a !important; }');

      expect(css).toContain('@media (min-width: 481px) and (max-width: 768px)');
      expect(css).toContain('#ca-el-title { font-size: 22px !important; }');

      expect(css).toContain('@media (max-width: 480px)');
      expect(css).toContain('#ca-el-title { font-size: 18px !important; text-align: center !important; }');
      expect(css).toContain('#ca-el-btn { width: 100% !important; }');
      expect(css).not.toContain('!important !important');
    });

    it('returns empty string for empty or malformed entries', () => {
      expect(buildResponsiveCss([])).toBe('');
      expect(buildResponsiveCss([{ id: '', styles: { desktop: { color: 'red' } } }])).toBe('');
    });
  });
});
