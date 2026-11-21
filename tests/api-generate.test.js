import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, {
  __resetRateLimitsForTests,
  handleGenerateRequest,
} from '../api/generate-campaign.js';
import { validateCampaignCode } from '../src/core/codeValidator.js';

function createMockReq({ method = 'POST', headers = {}, bodyText = '', ip = '127.0.0.1' } = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.headers = { 'x-forwarded-for': ip, ...headers };
  req.socket = { remoteAddress: ip };
  req.destroy = vi.fn();

  queueMicrotask(() => {
    if (bodyText) {
      req.emit('data', Buffer.from(bodyText, 'utf8'));
    }
    req.emit('end');
  });

  return req;
}

function createMockRes() {
  const headers = {};
  let rawBody = '';
  return {
    statusCode: 200,
    setHeader(key, val) {
      headers[key.toLowerCase()] = String(val);
    },
    getHeader(key) {
      return headers[key.toLowerCase()];
    },
    end(chunk = '') {
      rawBody += chunk;
    },
    get headers() {
      return headers;
    },
    get json() {
      return rawBody ? JSON.parse(rawBody) : null;
    },
  };
}

describe('api/generate-campaign', () => {
  const savedEnv = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  };

  beforeEach(() => {
    __resetRateLimitsForTests();
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    if (savedEnv.GEMINI_API_KEY !== undefined) process.env.GEMINI_API_KEY = savedEnv.GEMINI_API_KEY;
    else delete process.env.GEMINI_API_KEY;
    if (savedEnv.GROQ_API_KEY !== undefined) process.env.GROQ_API_KEY = savedEnv.GROQ_API_KEY;
    else delete process.env.GROQ_API_KEY;
    if (savedEnv.OPENROUTER_API_KEY !== undefined) {
      process.env.OPENROUTER_API_KEY = savedEnv.OPENROUTER_API_KEY;
    } else {
      delete process.env.OPENROUTER_API_KEY;
    }
  });

  it('handles OPTIONS preflight (204), non-POST (405), invalid JSON (400), and oversized payload (413)', async () => {
    const optRes = createMockRes();
    await handler(createMockReq({ method: 'OPTIONS' }), optRes);
    expect(optRes.statusCode).toBe(204);
    expect(optRes.getHeader('access-control-allow-methods')).toContain('POST');

    const getRes = createMockRes();
    await handler(createMockReq({ method: 'GET' }), getRes);
    expect(getRes.statusCode).toBe(405);

    const badJsonRes = createMockRes();
    await handler(createMockReq({ bodyText: '{broken' }), badJsonRes);
    expect(badJsonRes.statusCode).toBe(400);

    const bigBody = JSON.stringify({
      campaignType: 'popup',
      userRequest: 'x'.repeat(520 * 1024),
    });
    const bigRes = createMockRes();
    await handler(createMockReq({ bodyText: bigBody }), bigRes);
    expect(bigRes.statusCode).toBe(413);
  });

  it('returns 400 for invalid payloads', async () => {
    const invalidType = await handleGenerateRequest({
      campaignType: 'invalid',
      userRequest: 'Make popup',
    });
    expect(invalidType.status).toBe(400);

    const emptyRequest = await handleGenerateRequest({
      campaignType: 'popup',
      userRequest: '   ',
    });
    expect(emptyRequest.status).toBe(400);

    const tooLongRequest = await handleGenerateRequest({
      campaignType: 'banner',
      userRequest: 'a'.repeat(1501),
    });
    expect(tooLongRequest.status).toBe(400);

    const tooManyImages = await handleGenerateRequest({
      campaignType: 'popup',
      userRequest: 'Use images',
      images: [
        { url: 'https://example.com/1.png' },
        { url: 'https://example.com/2.png' },
        { url: 'https://example.com/3.png' },
      ],
    });
    expect(tooManyImages.status).toBe(400);

    const unsafeImage = await handleGenerateRequest({
      campaignType: 'popup',
      userRequest: 'Use image',
      images: [{ url: 'http://insecure.example/a.png' }],
    });
    expect(unsafeImage.status).toBe(400);

    const badGeneratedCode = await handleGenerateRequest({
      campaignType: 'popup',
      userRequest: 'Edit code',
      generatedCode: 12345,
    });
    expect(badGeneratedCode.status).toBe(400);
  });

  it('enforces per-IP rate limiting (15/min) and returns 429 with Retry-After', async () => {
    const validBody = JSON.stringify({
      campaignType: 'popup',
      userRequest: 'Siyah %20 indirim popup',
    });

    for (let i = 0; i < 15; i += 1) {
      const res = createMockRes();
      await handler(createMockReq({ bodyText: validBody, ip: '203.0.113.10' }), res);
      expect(res.statusCode).toBe(200);
    }

    const limitedRes = createMockRes();
    await handler(createMockReq({ bodyText: validBody, ip: '203.0.113.10' }), limitedRes);
    expect(limitedRes.statusCode).toBe(429);
    expect(Number(limitedRes.getHeader('retry-after'))).toBeGreaterThanOrEqual(1);

    // Different IP should still be allowed.
    const otherIpRes = createMockRes();
    await handler(createMockReq({ bodyText: validBody, ip: '203.0.113.11' }), otherIpRes);
    expect(otherIpRes.statusCode).toBe(200);
  });

  it('falls back to deterministic demo mode when no LLM keys exist', async () => {
    const res = await handleGenerateRequest(
      {
        campaignType: 'earlet',
        userRequest: 'Mor renkli %25 indirim kulakçığı',
      },
      { env: {} }
    );

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('demo');
    expect(res.body.provider).toBe('local-demo');
    expect(Array.isArray(res.body.warnings)).toBe(true);
    expect(validateCampaignCode(res.body.code, 'earlet').ok).toBe(true);
  });

  it('retries validation failures up to 2 times and returns 200 on repair or 422 after 3 failures', async () => {
    const validPopup = `(function () {
      if (document.getElementById('ca-widget-popup-container')) return;
      const el = document.createElement('div');
      el.id = 'ca-widget-popup-container';
      document.body.appendChild(el);
    })();`;

    const mockRepairSuccess = vi
      .fn()
      .mockResolvedValueOnce(`(function () { eval('bad'); })();`)
      .mockResolvedValueOnce(validPopup);

    const repairedRes = await handleGenerateRequest(
      { campaignType: 'popup', userRequest: 'Minimal indirim popup' },
      { generateWithProvider: mockRepairSuccess }
    );

    expect(repairedRes.status).toBe(200);
    expect(repairedRes.body.mode).toBe('llm');
    expect(repairedRes.body.code).toContain('ca-widget-popup-container');
    expect(mockRepairSuccess).toHaveBeenCalledTimes(2);
    expect(mockRepairSuccess.mock.calls[1][0].validationErrors.length).toBeGreaterThan(0);

    const mockAlwaysInvalid = vi
      .fn()
      .mockResolvedValue(`(function () { fetch('https://bad.example'); })();`);

    const failedRes = await handleGenerateRequest(
      { campaignType: 'banner', userRequest: 'Top banner' },
      { generateWithProvider: mockAlwaysInvalid }
    );

    expect(failedRes.status).toBe(422);
    expect(mockAlwaysInvalid).toHaveBeenCalledTimes(3);
    expect(Array.isArray(failedRes.body.validationErrors)).toBe(true);
    expect(failedRes.body.validationErrors.length).toBeGreaterThan(0);
  });

  it('falls back across Gemini -> Groq when Gemini fails HTTP 429 and sends multimodal inlineData', async () => {
    const validBanner = `\`\`\`javascript
    (function () {
      if (document.getElementById('ca-widget-banner-container')) return;
      const el = document.createElement('div');
      el.id = 'ca-widget-banner-container';
      document.body.appendChild(el);
    })();
    \`\`\``;

    const mockFetch = vi.fn(async (url, init) => {
      if (String(url).includes('generativelanguage.googleapis.com')) {
        const parsed = JSON.parse(init.body);
        expect(parsed.contents[0].parts.some((p) => p.inlineData?.data === 'QUJD')).toBe(true);
        return { ok: false, status: 429 };
      }
      if (String(url).includes('api.groq.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{ message: { content: validBanner } }],
          }),
        };
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    const result = await handleGenerateRequest(
      {
        campaignType: 'banner',
        userRequest: 'Üst banner hazırla',
        images: [{ base64: 'data:image/png;base64,QUJD', mimeType: 'image/png' }],
      },
      {
        env: {
          GEMINI_API_KEY: 'test-gemini',
          GROQ_API_KEY: 'test-groq',
        },
        fetchImpl: mockFetch,
      }
    );

    expect(result.status).toBe(200);
    expect(result.body.mode).toBe('llm');
    expect(result.body.provider).toContain('groq:');
    expect(result.body.code).not.toContain('```');
    expect(result.body.code).toContain('ca-widget-banner-container');
    // 2 Gemini default models + 1 Groq call = 3 fetch invocations
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
