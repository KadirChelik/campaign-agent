const getBannerCode = (templateType) => {
  // 1. ŞABLON: KLASİK ÜST BİLGİ (Top Announcement)
  if (templateType === 'top-announcement') {
    return `// top-announcement Şablonu
(function () {
  if (document.getElementById('ca-widget-banner-container')) return;

  const TEMPLATE_CONFIG = {
    message: "🎉 Yaz Fırsatları Başladı! Tüm ürünlerde net %20 indirim.",
    ctaText: "Hemen İncele",
    ctaUrl: "https://example.com/deals",
    positionMode: "fixed-top",
    inlineTarget: "#store-header",
    inlineRelation: "afterend"
  };

  let posCSS = '';
  let showCSS = '';
  if (TEMPLATE_CONFIG.positionMode === 'fixed-top') {
    posCSS = 'position: fixed; top: 0; left: 0; width: 100%; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'fixed-bottom') {
    posCSS = 'position: fixed; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'inline') {
    posCSS = 'position: relative; width: 100%; display: block; clear: both; flex: 0 0 100%; box-sizing: border-box; opacity: 0; transition: opacity 0.4s ease;';
    showCSS = 'opacity: 1;';
  }

  const style = document.createElement('style');
  style.id = 'ca-banner-style';
  style.innerHTML = \`
    #ca-widget-banner-container { \${posCSS} background: #0f172a; color: #fff; z-index: 2147483647 !important; display: flex; align-items: center; justify-content: center; padding: 12px 40px; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    #ca-widget-banner-container.show { \${showCSS} }

    .ca-banner-content { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; text-align: center; }
    .ca-text { font-size: 14px; font-weight: 500; margin: 0; line-height: 1.4; color: #f8fafc; }

    .ca-btn { background: #3b82f6; color: #fff; border: none; padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: 0.2s; white-space: nowrap; }
    .ca-btn:hover { background: #2563eb; transform: translateY(-1px); }

    .ca-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: 0.2s; }
    .ca-close:hover { color: #fff; background: rgba(255,255,255,0.1); }

    @media (max-width: 640px) {
      #ca-widget-banner-container { padding: 12px 32px 12px 12px; }
      .ca-banner-content { gap: 8px; flex-direction: column; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-banner-container';
  container.innerHTML = \`
    <div class="ca-banner-content">
      <span class="ca-text">\${TEMPLATE_CONFIG.message}</span>
      <button class="ca-btn" id="ca-cta-btn">\${TEMPLATE_CONFIG.ctaText}</button>
    </div>
    <button class="ca-close" aria-label="Kapat">×</button>
  \`;

  if (TEMPLATE_CONFIG.positionMode === 'inline' && TEMPLATE_CONFIG.inlineTarget) {
    const targetElement = document.querySelector(TEMPLATE_CONFIG.inlineTarget);
    if (targetElement) {
      targetElement.insertAdjacentElement(TEMPLATE_CONFIG.inlineRelation, container);
    } else {
      document.body.appendChild(container);
    }
  } else {
    document.body.appendChild(container);
  }

  setTimeout(() => container.classList.add('show'), 50);

  const closeBanner = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 400);
  };

  container.querySelector('.ca-close').onclick = closeBanner;

  container.querySelector('#ca-cta-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) return;
    // [TRACKING_CLICK]
    const parentLink = e.currentTarget.closest('a');
    window.location.href = parentLink ? parentLink.getAttribute('href') : TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 2. ŞABLON: ACİLİYET ŞERİDİ (Sticky Countdown)
  if (templateType === 'sticky-countdown') {
    return `// sticky-countdown Şablonu
(function () {
  if (document.getElementById('ca-widget-banner-container')) return;

  const TEMPLATE_CONFIG = {
    message: "Flaş İndirim Sona Eriyor:",
    ctaText: "ALIŞVERİŞE BAŞLA",
    ctaUrl: "https://example.com/deals",
    endDate: new Date(Date.now() + 14400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    positionMode: "fixed-top",
    inlineTarget: "#store-header",
    inlineRelation: "afterend"
  };

  let posCSS = '';
  let showCSS = '';
  if (TEMPLATE_CONFIG.positionMode === 'fixed-top') {
    posCSS = 'position: fixed; top: 0; left: 0; width: 100%; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'fixed-bottom') {
    posCSS = 'position: fixed; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'inline') {
    posCSS = 'position: relative; width: 100vw !important; max-width: 100vw !important; margin-left: calc(-50vw + 50%) !important; display: block !important; clear: both !important; flex: 0 0 100vw !important; box-sizing: border-box; opacity: 0; transition: opacity 0.4s ease;';
    showCSS = 'opacity: 1;';
  }

  const style = document.createElement('style');
  style.id = 'ca-banner-style';
  style.innerHTML = \`
    #ca-widget-banner-container { \${posCSS} background: #ef4444; color: #fff; z-index: 2147483647 !important; display: flex; align-items: center; justify-content: center; padding: 10px 40px; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
    #ca-widget-banner-container.show { \${showCSS} }

    .ca-banner-content { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; text-align: center; }
    .ca-text { font-size: 15px; font-weight: 700; margin: 0; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }

    .ca-timer { display: flex; align-items: center; gap: 6px; }
    .ca-time-box { background: #fff; color: #ef4444; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 14px; min-width: 32px; display: flex; align-items: center; justify-content: center; }
    .ca-time-sep { color: #fff; font-weight: 800; }

    .ca-btn { background: #18181b; color: #fff; border: none; padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none; transition: 0.2s; white-space: nowrap; margin-left: 8px; display: inline-block; }
    .ca-btn:hover { background: #27272a; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

    .ca-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: rgba(255,255,255,0.8); font-size: 20px; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: 0.2s; }
    .ca-close:hover { color: #fff; background: rgba(0,0,0,0.1); }

    .ca-timer[data-hide-d="true"] .box-d, .ca-timer[data-hide-d="true"] .sep-d { display: none !important; }
    .ca-timer[data-hide-h="true"] .box-h, .ca-timer[data-hide-h="true"] .sep-h { display: none !important; }
    .ca-timer[data-hide-m="true"] .box-m, .ca-timer[data-hide-m="true"] .sep-m { display: none !important; }
    .ca-timer[data-hide-s="true"] .box-s { display: none !important; }

    .ca-timer[data-hide-s="true"] .sep-m { display: none !important; }
    .ca-timer[data-hide-s="true"][data-hide-m="true"] .sep-h { display: none !important; }
    .ca-timer[data-hide-s="true"][data-hide-m="true"][data-hide-h="true"] .sep-d { display: none !important; }

    @media (max-width: 768px) {
      #ca-widget-banner-container { padding: 12px 32px 12px 12px; }
      .ca-banner-content { gap: 8px; flex-direction: column; }
      .ca-btn { margin-left: 0; width: 100%; text-align: center; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-banner-container';
  container.innerHTML = \`
    <div class="ca-banner-content">
      <span class="ca-text">\${TEMPLATE_CONFIG.message}</span>
      <div class="ca-timer" data-end-date="\${TEMPLATE_CONFIG.endDate}" data-hide-d="true">
        <div class="ca-time-box box-d" id="ca-d">00</div><span class="ca-time-sep sep-d">:</span>
        <div class="ca-time-box box-h" id="ca-h">00</div><span class="ca-time-sep sep-h">:</span>
        <div class="ca-time-box box-m" id="ca-m">00</div><span class="ca-time-sep sep-m">:</span>
        <div class="ca-time-box box-s" id="ca-s">00</div>
      </div>
      <a href="\${TEMPLATE_CONFIG.ctaUrl}" class="ca-btn" id="ca-cta-btn">\${TEMPLATE_CONFIG.ctaText}</a>
    </div>
    <button class="ca-close" aria-label="Kapat">×</button>
  \`;

  if (TEMPLATE_CONFIG.positionMode === 'inline' && TEMPLATE_CONFIG.inlineTarget) {
    const targetElement = document.querySelector(TEMPLATE_CONFIG.inlineTarget);
    if (targetElement) { targetElement.insertAdjacentElement(TEMPLATE_CONFIG.inlineRelation, container); }
    else { document.body.appendChild(container); }
  } else {
    document.body.appendChild(container);
  }

  setTimeout(() => container.classList.add('show'), 50);

  let timerInterval;

  const closeBanner = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); clearInterval(timerInterval); }, 400);
  };

  container.querySelector('.ca-close').onclick = closeBanner;

  container.querySelector('#ca-cta-btn').onclick = (e) => {
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) { e.preventDefault(); return; }
    // [TRACKING_CLICK]
  };

  timerInterval = setInterval(() => {
    const timerDOM = document.querySelector('.ca-timer');
    if (!timerDOM) return;

    const dateStr = timerDOM.getAttribute('data-end-date') || TEMPLATE_CONFIG.endDate;
    const distance = new Date(dateStr).getTime() - new Date().getTime();

    if (distance < 0) {
      if (document.getElementById("ca-d")) document.getElementById("ca-d").innerText = "00";
      if (document.getElementById("ca-h")) document.getElementById("ca-h").innerText = "00";
      if (document.getElementById("ca-m")) document.getElementById("ca-m").innerText = "00";
      if (document.getElementById("ca-s")) document.getElementById("ca-s").innerText = "00";
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    const elD = document.getElementById("ca-d"); if (elD) elD.innerText = d < 10 ? "0" + d : d;
    const elH = document.getElementById("ca-h"); if (elH) elH.innerText = h < 10 ? "0" + h : h;
    const elM = document.getElementById("ca-m"); if (elM) elM.innerText = m < 10 ? "0" + m : m;
    const elS = document.getElementById("ca-s"); if (elS) elS.innerText = s < 10 ? "0" + s : s;
  }, 1000);

  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 3. ŞABLON: KUPON KOPYALAMA BARI (Coupon Reveal)
  if (templateType === 'coupon-reveal') {
    return `// coupon-reveal Şablonu
(function () {
  if (document.getElementById('ca-widget-banner-container')) return;

  const TEMPLATE_CONFIG = {
    message: "İlk alışverişinize özel net %15 İndirim Kodunuz:",
    couponCode: "MERHABA15",
    ctaText: "KOPYALA",
    positionMode: "fixed-bottom",
    inlineTarget: "#store-header",
    inlineRelation: "afterend"
  };

  let posCSS = '';
  let showCSS = '';
  if (TEMPLATE_CONFIG.positionMode === 'fixed-top') {
    posCSS = 'position: fixed; top: 0; left: 0; width: 100%; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'fixed-bottom') {
    posCSS = 'position: fixed; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'inline') {
    posCSS = 'position: relative; width: 100vw !important; max-width: 100vw !important; margin-left: calc(-50vw + 50%) !important; display: block !important; clear: both !important; flex: 0 0 100vw !important; box-sizing: border-box; opacity: 0; transition: opacity 0.4s ease;';
    showCSS = 'opacity: 1;';
  }

  const style = document.createElement('style');
  style.id = 'ca-banner-style';
  style.innerHTML = \`
    #ca-widget-banner-container { \${posCSS} background: #10b981; color: #fff; z-index: 2147483647 !important; display: flex; align-items: center; justify-content: center; padding: 12px 40px; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
    #ca-widget-banner-container.show { \${showCSS} }

    .ca-banner-content { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; text-align: center; }
    .ca-text { font-size: 15px; font-weight: 600; margin: 0; color: #fff; }

    .ca-coupon-box { display: flex; align-items: center; background: rgba(255,255,255,0.2); border: 1px dashed rgba(255,255,255,0.6); padding: 4px 4px 4px 12px; border-radius: 8px; gap: 12px; }
    .ca-coupon-code { font-size: 16px; font-weight: 900; letter-spacing: 1px; color: #fff; }

    .ca-btn { background: #fff; color: #10b981; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s; }
    .ca-btn:hover { background: #f8fafc; transform: scale(1.05); }

    .ca-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: rgba(255,255,255,0.8); font-size: 20px; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: 0.2s; }
    .ca-close:hover { color: #fff; background: rgba(0,0,0,0.1); }

    @media (max-width: 640px) {
      #ca-widget-banner-container { padding: 12px 32px 12px 12px; }
      .ca-banner-content { gap: 10px; flex-direction: column; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-banner-container';
  container.innerHTML = \`
    <div class="ca-banner-content">
      <span class="ca-text">\${TEMPLATE_CONFIG.message}</span>
      <div class="ca-coupon-box">
        <span class="ca-coupon-code" id="ca-code-txt">\${TEMPLATE_CONFIG.couponCode}</span>
        <button class="ca-btn" id="ca-copy-btn">\${TEMPLATE_CONFIG.ctaText}</button>
      </div>
    </div>
    <button class="ca-close" aria-label="Kapat">×</button>
  \`;

  if (TEMPLATE_CONFIG.positionMode === 'inline' && TEMPLATE_CONFIG.inlineTarget) {
    const targetElement = document.querySelector(TEMPLATE_CONFIG.inlineTarget);
    if (targetElement) { targetElement.insertAdjacentElement(TEMPLATE_CONFIG.inlineRelation, container); }
    else { document.body.appendChild(container); }
  } else {
    document.body.appendChild(container);
  }

  setTimeout(() => container.classList.add('show'), 50);

  const closeBanner = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 400);
  };

  container.querySelector('.ca-close').onclick = closeBanner;

  container.querySelector('#ca-copy-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__) return;

    const codeToCopy = container.querySelector('#ca-code-txt').innerText;
    navigator.clipboard.writeText(codeToCopy);

    const btn = e.target;
    const originalText = btn.innerText;
    btn.innerText = "KOPYALANDI!";
    btn.style.background = "#059669";
    btn.style.color = "#fff";

    // [TRACKING_CLICK]

    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = "#fff";
      btn.style.color = "#10b981";
    }, 2000);
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 4. ŞABLON: KAYAN KAMPANYA ŞERİDİ (Fade / Looping Text)
  if (templateType === 'looping-text-banner') {
    return `// looping-text-banner Şablonu
(function () {
  if (document.getElementById('ca-widget-banner-container')) return;

  const TEMPLATE_CONFIG = {
    text1: "⚡ Tüm Siparişlerde Ücretsiz Kargo",
    text2: "🔥 Yeni Sezon Ürünlerinde %10 İndirim",
    text3: "🎁 Bültene Kaydol, Fırsatları İlk Sen Yakala",
    ctaUrl: "https://example.com/deals",
    positionMode: "fixed-top",
    inlineTarget: "#store-header",
    inlineRelation: "afterend"
  };

  let posCSS = '';
  let showCSS = '';
  if (TEMPLATE_CONFIG.positionMode === 'fixed-top') {
    posCSS = 'position: fixed; top: 0; left: 0; width: 100%; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'fixed-bottom') {
    posCSS = 'position: fixed; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'inline') {
    posCSS = 'position: relative; width: 100vw !important; max-width: 100vw !important; margin-left: calc(-50vw + 50%) !important; display: block !important; clear: both !important; flex: 0 0 100vw !important; box-sizing: border-box; opacity: 0; transition: opacity 0.4s ease;';
    showCSS = 'opacity: 1;';
  }

  const style = document.createElement('style');
  style.id = 'ca-banner-style';
  style.innerHTML = \`
    #ca-widget-banner-container { \${posCSS} background: #000000; color: #fff; z-index: 2147483647 !important; font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; }
    #ca-widget-banner-container.show { \${showCSS} }

    .ca-slider-wrapper {
      display: grid;
      width: 100%;
      align-items: center;
      min-height: 40px;
    }

    .ca-slide {
      grid-area: 1 / 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: color 0.2s;
      white-space: normal;
      line-height: 1.5;
      padding: 10px 48px;
      box-sizing: border-box;
      opacity: 0;
      pointer-events: none;
      animation: caFade 9s infinite;
    }
    .ca-slide:hover { color: #a1a1aa; }

    .ca-slide:nth-child(1) { animation-delay: 0s; }
    .ca-slide:nth-child(2) { animation-delay: 3s; }
    .ca-slide:nth-child(3) { animation-delay: 6s; }

    @keyframes caFade {
      0% { opacity: 0; pointer-events: none; }
      5%, 28% { opacity: 1; pointer-events: auto; }
      33%, 100% { opacity: 0; pointer-events: none; }
    }

    .ca-edit-mode .ca-slider-wrapper {
      display: flex !important;
      flex-direction: column !important;
      padding: 8px 0 !important;
    }
    .ca-edit-mode .ca-slide {
      grid-area: auto !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      animation: none !important;
      position: relative !important;
      padding: 10px 40px !important;
      border-bottom: 1px dashed rgba(255,255,255,0.15);
    }
    .ca-edit-mode .ca-slide:last-child { border-bottom: none; }

    .ca-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #52525b; font-size: 20px; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: 0.2s; z-index: 10; padding: 0; line-height: 1; }
    .ca-close:hover { color: #fff; background: rgba(255,255,255,0.1); }

    @media (max-width: 640px) {
      .ca-slide { font-size: 11px; padding: 12px 40px; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-banner-container';
  container.innerHTML = \`
    <button class="ca-close" aria-label="Kapat">×</button>
    <div class="ca-slider-wrapper">
      <span class="ca-slide" id="ca-txt-1">\${TEMPLATE_CONFIG.text1}</span>
      <span class="ca-slide" id="ca-txt-2">\${TEMPLATE_CONFIG.text2}</span>
      <span class="ca-slide" id="ca-txt-3">\${TEMPLATE_CONFIG.text3}</span>
    </div>
  \`;

  if (TEMPLATE_CONFIG.positionMode === 'inline' && TEMPLATE_CONFIG.inlineTarget) {
    const targetElement = document.querySelector(TEMPLATE_CONFIG.inlineTarget);
    if (targetElement) { targetElement.insertAdjacentElement(TEMPLATE_CONFIG.inlineRelation, container); }
    else { document.body.appendChild(container); }
  } else {
    document.body.appendChild(container);
  }

  setTimeout(() => container.classList.add('show'), 50);

  const editTimer = setInterval(() => {
    if (window.__CA_EDIT_MODE__) {
      if (!container.classList.contains('ca-edit-mode')) {
        container.classList.add('ca-edit-mode');
      }
    } else {
      if (container.classList.contains('ca-edit-mode')) {
        container.classList.remove('ca-edit-mode');
      }
    }
  }, 150);

  const closeBanner = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); clearInterval(editTimer); }, 400);
  };

  container.querySelector('.ca-close').onclick = closeBanner;

  container.querySelectorAll('.ca-slide').forEach(slide => {
    slide.onclick = () => {
      if (window.__CA_EDIT_MODE__ || window.self !== window.top) return;
      // [TRACKING_CLICK]
      window.location.href = TEMPLATE_CONFIG.ctaUrl;
    };
  });

  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 5. ŞABLON: GÖRSEL ODAKLI BANNER (Image Only)
  if (templateType === 'image-only-banner') {
    return `// image-only-banner Şablonu
(function () {
  if (document.getElementById('ca-widget-banner-container')) return;

  const TEMPLATE_CONFIG = {
    desktopImg: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&h=100&q=80",
    mobileImg: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=600&h=150&q=80",
    ctaUrl: "https://example.com/deals",
    positionMode: "fixed-top",
    inlineTarget: "#store-header",
    inlineRelation: "afterend"
  };

  let posCSS = '';
  let showCSS = '';
  if (TEMPLATE_CONFIG.positionMode === 'fixed-top') {
    posCSS = 'position: fixed; top: 0; left: 0; width: 100%; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'fixed-bottom') {
    posCSS = 'position: fixed; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'inline') {
    posCSS = 'position: relative; width: 100%; display: block; clear: both; flex: 0 0 100%; box-sizing: border-box; opacity: 0; transition: opacity 0.4s ease;';
    showCSS = 'opacity: 1;';
  }

  const style = document.createElement('style');
  style.id = 'ca-banner-style';
  style.innerHTML = \`
    #ca-widget-banner-container { \${posCSS} z-index: 2147483647 !important; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    #ca-widget-banner-container.show { \${showCSS} }

    .ca-banner-link { display: block; position: relative; width: 100%; text-decoration: none; cursor: pointer; }

    .ca-desktop-img { width: 100%; height: auto; min-height: 40px; display: block; object-fit: cover; }
    .ca-mobile-img { width: 100%; height: auto; min-height: 40px; display: none; object-fit: cover; }

    .ca-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.4); border: none; color: #fff; font-size: 20px; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: 0.2s; z-index: 10; backdrop-filter: blur(4px); }
    .ca-close:hover { background: rgba(0,0,0,0.8); }

    @media (max-width: 768px) {
      .ca-desktop-img { display: none !important; }
      .ca-mobile-img { display: block !important; }
      .ca-close { right: 8px; width: 24px; height: 24px; font-size: 16px; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-banner-container';
  container.innerHTML = \`
    <div class="ca-banner-link" id="ca-cta-link">
      <img src="\${TEMPLATE_CONFIG.desktopImg}" class="ca-desktop-img" alt="Masaüstü Kampanya Bannerı" />
      <img src="\${TEMPLATE_CONFIG.mobileImg}" class="ca-mobile-img" alt="Mobil Kampanya Bannerı" />
      <button class="ca-close" aria-label="Kapat">×</button>
    </div>
  \`;

  if (TEMPLATE_CONFIG.positionMode === 'inline' && TEMPLATE_CONFIG.inlineTarget) {
    const targetElement = document.querySelector(TEMPLATE_CONFIG.inlineTarget);
    if (targetElement) { targetElement.insertAdjacentElement(TEMPLATE_CONFIG.inlineRelation, container); }
    else { document.body.appendChild(container); }
  } else {
    document.body.appendChild(container);
  }

  setTimeout(() => container.classList.add('show'), 50);

  const closeBanner = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 400);
  };

  container.querySelector('.ca-close').onclick = (e) => {
    e.stopPropagation();
    closeBanner();
  };

  container.querySelector('#ca-cta-link').onclick = (e) => {
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) { e.preventDefault(); return; }
    // [TRACKING_CLICK]
    window.location.href = TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 6. ŞABLON: GÖRSEL ODAKLI SAYAÇLI BANNER (Image + Timer)
  if (templateType === 'image-with-timer-banner') {
    return `// image-with-timer-banner Şablonu
(function () {
  if (document.getElementById('ca-widget-banner-container')) return;

  const TEMPLATE_CONFIG = {
    desktopImg: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&h=120&q=80",
    mobileImg: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=600&h=200&q=80",
    timerTitle: "FIRSAT BİTİYOR:",
    endDate: new Date(Date.now() + 14400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    ctaUrl: "https://example.com/deals",
    positionMode: "fixed-top",
    inlineTarget: "#store-header",
    inlineRelation: "afterend"
  };

  let posCSS = '';
  let showCSS = '';
  if (TEMPLATE_CONFIG.positionMode === 'fixed-top') {
    posCSS = 'position: fixed; top: 0; left: 0; width: 100%; transform: translateY(-100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'fixed-bottom') {
    posCSS = 'position: fixed; bottom: 0; left: 0; width: 100%; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);';
    showCSS = 'transform: translateY(0);';
  } else if (TEMPLATE_CONFIG.positionMode === 'inline') {
    posCSS = 'position: relative; width: 100vw !important; max-width: 100vw !important; margin-left: calc(-50vw + 50%) !important; display: block !important; clear: both !important; flex: 0 0 100vw !important; box-sizing: border-box; opacity: 0; transition: opacity 0.4s ease;';
    showCSS = 'opacity: 1;';
  }

  const style = document.createElement('style');
  style.id = 'ca-banner-style';
  style.innerHTML = \`
    #ca-widget-banner-container { \${posCSS} z-index: 2147483647 !important; background: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
    #ca-widget-banner-container.show { \${showCSS} }

    .ca-banner-link { display: flex; width: 100%; text-decoration: none; cursor: pointer; position: relative; align-items: center; justify-content: center; }

    .ca-desktop-img { width: 100%; height: auto; min-height: 40px; display: block; object-fit: cover; }
    .ca-mobile-img { width: 100%; height: auto; min-height: 40px; display: none; object-fit: cover; }

    .ca-timer-wrapper {
      position: absolute; right: 48px; top: 50%; transform: translateY(-50%);
      display: flex; align-items: center; gap: 8px;
      background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px);
      padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .ca-timer-title { color: #fff; font-size: 13px; font-weight: 800; text-transform: uppercase; margin-right: 4px; letter-spacing: 0.5px; }

    .ca-timer { display: flex; align-items: center; gap: 4px; }
    .ca-time-box { background: #fff; color: #000; padding: 4px 6px; border-radius: 4px; font-weight: 800; font-size: 14px; min-width: 28px; display: flex; align-items: center; justify-content: center; }
    .ca-time-sep { color: #fff; font-weight: 800; }

    .ca-close { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.4); border: none; color: #fff; font-size: 20px; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: 0.2s; z-index: 10; backdrop-filter: blur(4px); }
    .ca-close:hover { background: rgba(0,0,0,0.8); }

    .ca-timer[data-hide-d="true"] .box-d { display: none !important; }
    .ca-timer[data-hide-h="true"] .box-h { display: none !important; }
    .ca-timer[data-hide-m="true"] .box-m { display: none !important; }
    .ca-timer[data-hide-s="true"] .box-s { display: none !important; }

    @media (max-width: 768px) {
      .ca-desktop-img { display: none !important; }
      .ca-mobile-img { display: block !important; }
      .ca-timer-wrapper {
        right: auto; left: 50%; top: auto; bottom: 12px;
        transform: translateX(-50%);
        padding: 6px 12px;
        width: max-content;
      }
      .ca-timer-title { display: none; }
      .ca-time-box { font-size: 12px; min-width: 24px; padding: 2px 4px; }
      .ca-close { right: 8px; width: 24px; height: 24px; font-size: 16px; top: 16px; transform: none; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-banner-container';
  container.innerHTML = \`
    <div class="ca-banner-link" id="ca-cta-link">
      <img src="\${TEMPLATE_CONFIG.desktopImg}" class="ca-desktop-img" alt="Masaüstü Banner" />
      <img src="\${TEMPLATE_CONFIG.mobileImg}" class="ca-mobile-img" alt="Mobil Banner" />
      <div class="ca-timer-wrapper">
        <span class="ca-timer-title">\${TEMPLATE_CONFIG.timerTitle}</span>
        <div class="ca-timer" data-end-date="\${TEMPLATE_CONFIG.endDate}" data-hide-d="true">
          <div class="ca-time-box box-d" id="ca-d">00</div><span class="ca-time-sep box-d">:</span>
          <div class="ca-time-box box-h" id="ca-h">00</div><span class="ca-time-sep box-h">:</span>
          <div class="ca-time-box box-m" id="ca-m">00</div><span class="ca-time-sep box-m">:</span>
          <div class="ca-time-box box-s" id="ca-s">00</div>
        </div>
      </div>
      <button class="ca-close" aria-label="Kapat">×</button>
    </div>
  \`;

  if (TEMPLATE_CONFIG.positionMode === 'inline' && TEMPLATE_CONFIG.inlineTarget) {
    const targetElement = document.querySelector(TEMPLATE_CONFIG.inlineTarget);
    if (targetElement) { targetElement.insertAdjacentElement(TEMPLATE_CONFIG.inlineRelation, container); }
    else { document.body.appendChild(container); }
  } else {
    document.body.appendChild(container);
  }

  setTimeout(() => container.classList.add('show'), 50);

  let timerInterval;

  const closeBanner = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); clearInterval(timerInterval); }, 400);
  };

  container.querySelector('.ca-close').onclick = (e) => {
    e.stopPropagation();
    closeBanner();
  };

  container.querySelector('#ca-cta-link').onclick = (e) => {
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) { e.preventDefault(); return; }
    // [TRACKING_CLICK]
    window.location.href = TEMPLATE_CONFIG.ctaUrl;
  };

  timerInterval = setInterval(() => {
    const timerContainer = container.querySelector('.ca-timer');
    if (!timerContainer) return;

    const dateStr = timerContainer.getAttribute('data-end-date') || TEMPLATE_CONFIG.endDate;
    const distance = new Date(dateStr).getTime() - new Date().getTime();

    if (distance < 0) {
      if (document.getElementById("ca-d")) document.getElementById("ca-d").innerText = "00";
      if (document.getElementById("ca-h")) document.getElementById("ca-h").innerText = "00";
      if (document.getElementById("ca-m")) document.getElementById("ca-m").innerText = "00";
      if (document.getElementById("ca-s")) document.getElementById("ca-s").innerText = "00";
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    const elD = document.getElementById("ca-d"); if (elD) elD.innerText = d < 10 ? "0" + d : d;
    const elH = document.getElementById("ca-h"); if (elH) elH.innerText = h < 10 ? "0" + h : h;
    const elM = document.getElementById("ca-m"); if (elM) elM.innerText = m < 10 ? "0" + m : m;
    const elS = document.getElementById("ca-s"); if (elS) elS.innerText = s < 10 ? "0" + s : s;
  }, 1000);

  // [TRACKING_IMPRESSION]
})();
`;
  }

  return "";
};

const BANNER_TEMPLATES = [
  {
    id: 'top-announcement',
    title: '📢 Üst Bilgi Çubuğu',
    description: 'Ziyaretçilerinizi rahatsız etmeden sayfanın en üstünde kampanya duyurusu yapan minimal şerit.',
    color: '#3b82f6',
    badge: 'Klasik',
    badgeColor: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    code: getBannerCode('top-announcement')
  },
  {
    id: 'looping-text-banner',
    title: '🔄 Kayan Kampanya Şeridi',
    description: 'Birden fazla kampanyayı (örn: Ücretsiz Kargo, İndirim vb.) pürüzsüz bir animasyonla sırayla gösteren premium siyah bant.',
    color: '#18181b',
    badge: 'Popüler',
    badgeColor: '#ffffff',
    badgeBg: '#3f3f46',
    code: getBannerCode('looping-text-banner')
  },
  {
    id: 'sticky-countdown',
    title: '⏳ Aciliyet Şeridi',
    description: 'Canlı geri sayım sayacı ile sayfanın üstüne sabitlenerek güçlü bir kaybetme korkusu (FOMO) yaratan kurgu.',
    color: '#ef4444',
    badge: 'Yüksek Dönüşüm',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    code: getBannerCode('sticky-countdown')
  },
  {
    id: 'coupon-reveal',
    title: '🎁 Kupon Kopyalama Barı',
    description: 'Sayfanın en altına sabitlenen ve tek tıkla indirim kodunu müşterinin panosuna kopyalayan akıllı şerit.',
    color: '#10b981',
    code: getBannerCode('coupon-reveal')
  },
  {
    id: 'image-only-banner',
    title: '🖼️ Görsel Odaklı Banner',
    description: 'Metinsiz, tamamen marka tasarımınıza ait olan, masaüstü ve mobil için ayrı görseller ekleyebileceğiniz şerit.',
    color: '#8b5cf6',
    badge: 'Yeni',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    code: getBannerCode('image-only-banner')
  },
  {
    id: 'image-with-timer-banner',
    title: '⏱️ Görsel + Sayaçlı Banner',
    description: 'Zengin kampanya görsellerinizin üzerinde dinamik bir geri sayım sayacı göstererek yüksek aciliyet (FOMO) yaratan profesyonel şerit.',
    color: '#f59e0b',
    badge: 'Premium',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    code: getBannerCode('image-with-timer-banner')
  }
];

export { getBannerCode, BANNER_TEMPLATES };
