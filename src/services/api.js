const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Görsel dosyası okunamadı.'));
    reader.readAsDataURL(file);
  });

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
    img.src = src;
  });

/**
 * Reads an uploaded image file and compresses/downscales it via Canvas when supported.
 * Falls back cleanly to the raw data URL for SVGs or environments without Canvas.
 */
export const compressImageToDataUrl = async (file, maxWidth = 960, quality = 0.82) => {
  if (!file) {
    throw new Error('Geçersiz görsel dosyası.');
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  if (
    typeof rawDataUrl !== 'string' ||
    file.type === 'image/svg+xml' ||
    typeof document === 'undefined'
  ) {
    return rawDataUrl;
  }

  try {
    const img = await loadImageElement(rawDataUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) return rawDataUrl;

    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    let compressed = canvas.toDataURL('image/webp', quality);
    if (!compressed || !compressed.startsWith('data:image/webp')) {
      compressed = canvas.toDataURL('image/jpeg', quality);
    }

    if (scale === 1 && compressed.length > rawDataUrl.length) {
      return rawDataUrl;
    }

    return compressed || rawDataUrl;
  } catch {
    return rawDataUrl;
  }
};

export const generateCampaignCall = async (campaignType, userRequest, images, generatedCode) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  const response = await fetch(`${apiBase}/api/generate-campaign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaignType,
      userRequest,
      images,
      generatedCode,
    }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const validationMsg = Array.isArray(data.validationErrors)
      ? data.validationErrors.join(' ')
      : '';
    throw new Error(
      data.error || validationMsg || `Sunucu hatası oluştu (HTTP ${response.status}).`
    );
  }

  return {
    code: data.code,
    mode: data.mode || 'llm',
    provider: data.provider || 'unknown',
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
  };
};
