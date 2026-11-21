import {
  CONTAINER_IDS,
  MAX_CODE_LENGTH,
  buildDemoFallbackCode,
  validateCampaignCode,
} from '../src/core/codeValidator.js';

const MAX_BODY_BYTES = 512 * 1024;
const MAX_USER_REQUEST_LENGTH = 1500;
const MAX_IMAGES = 2;
const REQUEST_TIMEOUT_MS = 25_000;
const VALIDATION_MAX_RETRIES = 2;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const RATE_LIMIT_MAX_BUCKETS = 1000;

const DEFAULT_GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_OPENROUTER_MODEL = 'openrouter/free';
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const rateLimitStore = new Map();

class PayloadTooLargeError extends Error {
  constructor() {
    super('Payload too large.');
    this.name = 'PayloadTooLargeError';
  }
}

export function __resetRateLimitsForTests() {
  rateLimitStore.clear();
}

function pruneExpiredRateLimits(now) {
  if (rateLimitStore.size < RATE_LIMIT_MAX_BUCKETS) return;
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now >= bucket.resetAt) {
      rateLimitStore.delete(key);
    }
  }
  while (rateLimitStore.size >= RATE_LIMIT_MAX_BUCKETS) {
    const oldestKey = rateLimitStore.keys().next().value;
    if (oldestKey === undefined) break;
    rateLimitStore.delete(oldestKey);
  }
}

function checkRateLimit(ip) {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);
  if (existing && now < existing.resetAt) {
    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }
    existing.count += 1;
    return { allowed: true };
  }
  if (existing) {
    rateLimitStore.delete(ip);
  }
  pruneExpiredRateLimits(now);
  rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  return { allowed: true };
}

function getClientIp(req) {
  const headers = req.headers || {};
  const forwarded = headers['x-forwarded-for'];
  const realIp = headers['x-real-ip'];
  const forwardedFirst = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
    ?.split(',')[0]
    ?.trim();
  const realIpFirst = (Array.isArray(realIp) ? realIp[0] : realIp)?.trim();
  return forwardedFirst || realIpFirst || req.socket?.remoteAddress || 'unknown';
}

function sendJson(res, status, body, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  for (const [key, value] of Object.entries({ ...CORS_HEADERS, ...extraHeaders })) {
    res.setHeader(key, value);
  }
  res.end(JSON.stringify(body));
}

async function readNodeJsonBody(req) {
  const contentLength = req.headers?.['content-length'];
  if (contentLength !== undefined) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_BODY_BYTES) {
      throw new PayloadTooLargeError();
    }
  }

  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES) {
        throw new PayloadTooLargeError();
      }
      return req.body ? JSON.parse(req.body) : null;
    }
    if (Buffer.isBuffer(req.body)) {
      if (req.body.byteLength > MAX_BODY_BYTES) {
        throw new PayloadTooLargeError();
      }
      const rawText = req.body.toString('utf8');
      return rawText ? JSON.parse(rawText) : null;
    }
    if (typeof req.body === 'object') {
      const serialized = JSON.stringify(req.body);
      if (Buffer.byteLength(serialized, 'utf8') > MAX_BODY_BYTES) {
        throw new PayloadTooLargeError();
      }
      return req.body;
    }
  }

  const rawText = await new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let settled = false;

    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    req.on('data', (chunk) => {
      if (settled) return;
      const buf = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk;
      totalBytes += buf.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        if (typeof req.destroy === 'function') {
          req.destroy();
        }
        fail(new PayloadTooLargeError());
        return;
      }
      chunks.push(buf);
    });

    req.on('end', () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', (err) => fail(err));
  });

  return rawText ? JSON.parse(rawText) : null;
}

function isValidImageSource(src) {
  if (typeof src !== 'string') return false;
  const trimmed = src.trim();
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/.test(trimmed) || /^https:\/\/\S+$/i.test(trimmed);
}

function validatePayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, status: 400, message: 'Invalid JSON request body.' };
  }

  const { campaignType, userRequest, images, generatedCode } = raw;

  if (typeof campaignType !== 'string' || !CONTAINER_IDS[campaignType]) {
    return {
      ok: false,
      status: 400,
      message: 'campaignType must be one of: popup, banner, earlet.',
    };
  }

  let normalizedImages = [];
  if (images !== undefined && images !== null) {
    if (!Array.isArray(images)) {
      return { ok: false, status: 400, message: 'images must be an array.' };
    }
    if (images.length > MAX_IMAGES) {
      return { ok: false, status: 400, message: `At most ${MAX_IMAGES} images are allowed.` };
    }
    for (const item of images) {
      if (!item || typeof item !== 'object') {
        return { ok: false, status: 400, message: 'Each image entry must be an object.' };
      }
      const urlCandidate = typeof item.url === 'string' ? item.url.trim() : '';
      const base64Candidate = typeof item.base64 === 'string' ? item.base64.trim() : '';

      if (urlCandidate && !isValidImageSource(urlCandidate)) {
        return {
          ok: false,
          status: 400,
          message: 'Image url must be a valid data:image/... base64 URI or https:// URL.',
        };
      }
      if (base64Candidate && !isValidImageSource(base64Candidate)) {
        return {
          ok: false,
          status: 400,
          message: 'Image base64 must be a valid data:image/... base64 URI.',
        };
      }
      const resolvedSrc = urlCandidate || base64Candidate;
      if (!resolvedSrc) {
        return {
          ok: false,
          status: 400,
          message: 'Each image must provide a valid url or base64 source.',
        };
      }

      normalizedImages.push({
        src: resolvedSrc,
        base64: base64Candidate || (urlCandidate.startsWith('data:image/') ? urlCandidate : ''),
        mimeType: typeof item.mimeType === 'string' && item.mimeType.startsWith('image/') ? item.mimeType : 'image/jpeg',
        width: Number.isFinite(Number(item.width)) ? Number(item.width) : undefined,
        height: Number.isFinite(Number(item.height)) ? Number(item.height) : undefined,
      });
    }
  }

  let normalizedRequest = '';
  if (userRequest !== undefined && userRequest !== null) {
    if (typeof userRequest !== 'string') {
      return { ok: false, status: 400, message: 'userRequest must be a string.' };
    }
    normalizedRequest = userRequest.trim();
  }

  if (normalizedRequest.length > MAX_USER_REQUEST_LENGTH) {
    return {
      ok: false,
      status: 400,
      message: `userRequest must be at most ${MAX_USER_REQUEST_LENGTH} characters.`,
    };
  }

  if (!normalizedRequest && normalizedImages.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'userRequest is required unless at least one image is attached.',
    };
  }

  let normalizedExistingCode = '';
  if (generatedCode !== undefined && generatedCode !== null) {
    if (typeof generatedCode !== 'string') {
      return { ok: false, status: 400, message: 'generatedCode must be a string.' };
    }
    if (generatedCode.length > MAX_CODE_LENGTH) {
      return {
        ok: false,
        status: 400,
        message: `generatedCode exceeds ${MAX_CODE_LENGTH} characters.`,
      };
    }
    normalizedExistingCode = generatedCode;
  }

  return {
    ok: true,
    data: {
      campaignType,
      userRequest: normalizedRequest,
      images: normalizedImages,
      generatedCode: normalizedExistingCode,
    },
  };
}

function buildSystemPrompt(campaignType) {
  const containerId = CONTAINER_IDS[campaignType];
  const baseRules = `You are Campaign Agent, an expert frontend UI/UX code generator that creates self-contained, modern e-commerce campaign widgets (Popup, Banner, Earlet) in pure JavaScript.
Your job is to either generate a new widget or safely modify the existing widget code without breaking its DOM structure.

STRICT RULES:
1. CONTAINER ISOLATION & FIXED ID:
   - You MUST use the exact container ID '${containerId}' for this ${campaignType} widget.
   - Set z-index: 2147483647 !important; on '#${containerId}' and scope all CSS selectors under '#${containerId}' or 'ca-' classes.
   - Do NOT invent random container IDs.

2. TRACKING COMMENT HOOKS:
   - Leave exact comment markers where tracking fires:
     - Impression: // [TRACKING_IMPRESSION]
     - CTA Click: // [TRACKING_CLICK]

3. IIFE WRAPPER & DUPLICATE-MOUNT GUARD:
   - Wrap all code in an IIFE: (function () { ... })();
   - Start with the duplicate-mount guard:
     var containerId = '${containerId}';
     if (document.getElementById(containerId)) return;

4. PURE JAVASCRIPT OUTPUT ONLY:
   - Return ONLY executable JavaScript. Do NOT wrap output in markdown fences (\`\`\`js) or <script> tags.
   - NEVER use: eval(, new Function(, fetch(, XMLHttpRequest, document.cookie, localStorage, sessionStorage, indexedDB, window.top.location, parent.location, <script src=...>, or dynamic import(.

5. DOM & VISUAL EDITOR COMPATIBILITY:
   - Preserve any existing id="ca-el-...", data-ca-styles, data-epos, contenteditable, and TEMPLATE_CONFIG fields when editing existing code.
   - Check window.__CA_EDIT_MODE__ before closing, navigating, or mutating document.body layout margins.`;

  let specificRules = '';
  if (campaignType === 'popup') {
    specificRules = `
6. POPUP RULES:
   - Center the modal overlay across the viewport with backdrop blur and smooth cubic-bezier entrance animation.
   - Include a styled '.ca-modal' card and an accessible '.ca-close' button that removes the container and injected <style> when clicked (unless window.__CA_EDIT_MODE__ is truthy).`;
  } else if (campaignType === 'banner') {
    specificRules = `
6. BANNER RULES:
   - Do NOT render a full-screen dark backdrop overlay.
   - Support TEMPLATE_CONFIG with positionMode ("fixed-top", "fixed-bottom", or "inline"), inlineTarget, and inlineRelation ("beforebegin" / "afterend").
   - Only adjust document.body padding/margin when !window.__CA_EDIT_MODE__.`;
  } else if (campaignType === 'earlet') {
    specificRules = `
6. EARLET RULES:
   - Keep '#${containerId}' position: fixed without blocking page scroll.
   - Support TEMPLATE_CONFIG with earletPos, offsetX, and offsetY and store data-epos, data-ex, data-ey attributes on the container.
   - Include collapsed ('.ca-collapsed') and expanded ('.ca-expanded') states.`;
  }

  return `${baseRules}\n${specificRules}`;
}

function buildUserPrompt(data) {
  let text = `Campaign Type: ${data.campaignType.toUpperCase()}\nUser Request: ${data.userRequest || 'Design a high-converting widget matching the attached visual reference.'}`;

  if (data.images.length > 0) {
    const assetLines = data.images.map((img, idx) => {
      const dims = img.width && img.height ? ` (${img.width}x${img.height}px)` : '';
      if (img.src.startsWith('https://')) {
        return `Image ${idx + 1}${dims}: ${img.src}`;
      }
      return `Image ${idx + 1}${dims}: attached inline; if embedding it inside an <img> tag, use the exact placeholder "__CA_UPLOADED_IMG_${idx}__".`;
    });
    text += `\n\nAttached Images:\n${assetLines.join('\n')}`;
  }

  if (data.generatedCode) {
    text = `Existing Widget Code:\n${data.generatedCode}\n\nApply ONLY the requested changes cleanly to this existing code:\n${text}`;
  }

  return text;
}

function buildRepairPrompt(basePrompt, previousCode, errors) {
  return `${basePrompt}

Your previous output failed validation with these errors:
- ${errors.join('\n- ')}

Previous invalid output:
${previousCode}

Fix ALL errors above and return ONLY valid, safe JavaScript with no markdown fences or disallowed APIs.`;
}

function applyUploadedImageTokens(code, images) {
  let out = code;
  images.forEach((img, idx) => {
    const token = `__CA_UPLOADED_IMG_${idx}__`;
    if (out.includes(token)) {
      out = out.split(token).join(img.src);
    }
  });
  return out;
}

async function callWithTimeout(fetchImpl, url, init) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function invokeGeminiRest({ apiKey, model, systemPrompt, userPrompt, images, fetchImpl }) {
  const parts = [{ text: userPrompt }];
  for (const img of images) {
    const dataUrl = img.base64 || (img.src.startsWith('data:image/') ? img.src : '');
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex > 0) {
      const meta = dataUrl.slice(0, commaIndex);
      const base64Body = dataUrl.slice(commaIndex + 1);
      const mimeMatch = meta.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64$/i);
      parts.push({
        inlineData: {
          mimeType: mimeMatch ? mimeMatch[1] : img.mimeType || 'image/jpeg',
          data: base64Body,
        },
      });
    }
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await callWithTimeout(fetchImpl, endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();

  if (!text) {
    throw new Error('Gemini API returned empty content.');
  }
  return text;
}

async function invokeOpenAICompatible({ endpoint, apiKey, model, extraHeaders, systemPrompt, userPrompt, fetchImpl }) {
  const response = await callWithTimeout(fetchImpl, endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    throw new Error(`Provider API HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Provider API returned empty content.');
  }
  return text.trim();
}

function buildProviderTargets(env) {
  const targets = [];

  const geminiKey = env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    const customModel = env.GEMINI_MODEL?.trim();
    const models = customModel
      ? [customModel, ...DEFAULT_GEMINI_MODELS.filter((m) => m !== customModel)]
      : [...DEFAULT_GEMINI_MODELS];
    for (const model of models) {
      targets.push({
        name: `gemini:${model}`,
        call: ({ systemPrompt, userPrompt, images, fetchImpl }) =>
          invokeGeminiRest({ apiKey: geminiKey, model, systemPrompt, userPrompt, images, fetchImpl }),
      });
    }
  }

  const groqKey = env.GROQ_API_KEY?.trim();
  if (groqKey) {
    const groqModel = env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
    targets.push({
      name: `groq:${groqModel}`,
      call: ({ systemPrompt, userPrompt, fetchImpl }) =>
        invokeOpenAICompatible({
          endpoint: GROQ_CHAT_URL,
          apiKey: groqKey,
          model: groqModel,
          systemPrompt,
          userPrompt,
          fetchImpl,
        }),
    });
  }

  const openRouterKey = env.OPENROUTER_API_KEY?.trim();
  if (openRouterKey) {
    const openRouterModel = env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
    targets.push({
      name: `openrouter:${openRouterModel}`,
      call: ({ systemPrompt, userPrompt, fetchImpl }) =>
        invokeOpenAICompatible({
          endpoint: OPENROUTER_CHAT_URL,
          apiKey: openRouterKey,
          model: openRouterModel,
          extraHeaders: { 'X-Title': 'Campaign Agent' },
          systemPrompt,
          userPrompt,
          fetchImpl,
        }),
    });
  }

  return targets;
}

/**
 * Core request processor shared by Node HTTP handler and Vitest tests.
 * @param {object} payload
 * @param {object} [options]
 * @returns {Promise<{ status: number, body: object, headers?: Record<string, string> }>}
 */
export async function handleGenerateRequest(payload, options = {}) {
  const validation = validatePayload(payload);
  if (!validation.ok) {
    return {
      status: validation.status,
      body: { error: validation.message },
    };
  }

  const data = validation.data;
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || fetch;
  const systemPrompt = buildSystemPrompt(data.campaignType);
  const baseUserPrompt = buildUserPrompt(data);

  const hasCustomGenerator = typeof options.generateWithProvider === 'function';
  const targets = hasCustomGenerator
    ? [
        {
          name: 'custom-provider',
          call: ({ systemPrompt: sys, userPrompt, images, attempt, validationErrors }) =>
            options.generateWithProvider({
              campaignType: data.campaignType,
              userRequest: data.userRequest,
              generatedCode: data.generatedCode,
              images,
              systemPrompt: sys,
              userPrompt,
              attempt,
              validationErrors,
            }),
        },
      ]
    : buildProviderTargets(env);

  if (targets.length === 0) {
    return {
      status: 200,
      body: {
        code: buildDemoFallbackCode(data.campaignType, data.userRequest, data.generatedCode),
        mode: 'demo',
        provider: 'local-demo',
        warnings: ['No LLM API keys configured; running deterministic local demo mode.'],
      },
    };
  }

  let currentPrompt = baseUserPrompt;
  let lastValidationErrors = [];
  let sawLlmResponse = false;
  const providerErrors = [];
  const failedTargetIndices = new Set();

  for (let attempt = 0; attempt <= VALIDATION_MAX_RETRIES; attempt += 1) {
    let attemptRawCode = null;
    let attemptProviderName = null;

    for (let idx = 0; idx < targets.length; idx += 1) {
      if (failedTargetIndices.has(idx)) continue;
      const target = targets[idx];
      try {
        attemptRawCode = await target.call({
          systemPrompt,
          userPrompt: currentPrompt,
          images: data.images,
          fetchImpl,
          attempt,
          validationErrors: lastValidationErrors,
        });
        attemptProviderName = target.name;
        break;
      } catch (err) {
        failedTargetIndices.add(idx);
        providerErrors.push(`${target.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (attemptRawCode === null) {
      break;
    }

    sawLlmResponse = true;
    const withImages = applyUploadedImageTokens(attemptRawCode, data.images);
    const check = validateCampaignCode(withImages, data.campaignType);

    if (check.ok) {
      return {
        status: 200,
        body: {
          code: check.code,
          mode: 'llm',
          provider: attemptProviderName,
        },
      };
    }

    lastValidationErrors = check.errors;
    currentPrompt = buildRepairPrompt(baseUserPrompt, check.code, check.errors);
  }

  if (sawLlmResponse) {
    return {
      status: 422,
      body: {
        error: 'Generated code failed safety and syntax validation.',
        validationErrors: lastValidationErrors,
      },
    };
  }

  return {
    status: 200,
    body: {
      code: buildDemoFallbackCode(data.campaignType, data.userRequest, data.generatedCode),
      mode: 'demo',
      provider: 'local-demo',
      warnings: [
        'Upstream LLM providers unavailable; falling back to local demo mode.',
        ...providerErrors.slice(0, 3),
      ],
    },
  };
}

export default async function handler(req, res) {
  const method = req.method || 'GET';

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      res.setHeader(key, value);
    }
    res.end();
    return;
  }

  if (method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    sendJson(
      res,
      429,
      { error: 'Too many requests. Please try again shortly.' },
      { 'Retry-After': String(rateLimit.retryAfterSec) }
    );
    return;
  }

  let parsedBody;
  try {
    parsedBody = await readNodeJsonBody(req);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      sendJson(res, 413, { error: 'Payload too large.' });
      return;
    }
    sendJson(res, 400, { error: 'Invalid JSON body.' });
    return;
  }

  const result = await handleGenerateRequest(parsedBody);
  sendJson(res, result.status, result.body, result.headers || {});
}
