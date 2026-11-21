const getEarletCode = (templateType) => {
  const generateEarlet = (config, innerHtml, customCSS = '', customJS = '') => {
    const configString = Object.entries(config)
      .map(([key, val]) => `${key}: ${JSON.stringify(String(val))}`)
      .join(',\n        ');

    return `// ${templateType} Şablonu
(function () {
  if (document.getElementById('ca-widget-earlet-container')) return;

  const TEMPLATE_CONFIG = {
        ${configString}
  };

  let posCSS = '';
  const x = TEMPLATE_CONFIG.offsetX + 'px';
  const y = TEMPLATE_CONFIG.offsetY + 'px';

  if (TEMPLATE_CONFIG.earletPos === 'bottom-right') posCSS = \`bottom: \${y}; right: \${x};\`;
  else if (TEMPLATE_CONFIG.earletPos === 'bottom-left') posCSS = \`bottom: \${y}; left: \${x};\`;
  else if (TEMPLATE_CONFIG.earletPos === 'top-right') posCSS = \`top: \${y}; right: \${x};\`;
  else if (TEMPLATE_CONFIG.earletPos === 'top-left') posCSS = \`top: \${y}; left: \${x};\`;
  else if (TEMPLATE_CONFIG.earletPos === 'center-right') posCSS = \`top: 50%; right: \${x}; transform: translateY(-50%);\`;
  else if (TEMPLATE_CONFIG.earletPos === 'center-left') posCSS = \`top: 50%; left: \${x}; transform: translateY(-50%);\`;
  else if (TEMPLATE_CONFIG.earletPos === 'bottom-center') posCSS = \`bottom: \${y}; left: 50%; transform: translateX(-50%);\`;
  else if (TEMPLATE_CONFIG.earletPos === 'top-center') posCSS = \`top: \${y}; left: 50%; transform: translateX(-50%);\`;

  const style = document.createElement('style');
  style.id = 'ca-earlet-style';
  style.innerHTML = \`
    #ca-widget-earlet-container {
      position: fixed;
      \${posCSS}
      z-index: 2147483647 !important;
      font-family: system-ui, -apple-system, sans-serif;
      transition: opacity 0.4s ease;
      opacity: 0;
      pointer-events: none;
    }
    #ca-widget-earlet-container.show { opacity: 1; pointer-events: auto; }
    ${customCSS}
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-earlet-container';
  container.setAttribute('data-epos', TEMPLATE_CONFIG.earletPos);
  container.setAttribute('data-ex', TEMPLATE_CONFIG.offsetX);
  container.setAttribute('data-ey', TEMPLATE_CONFIG.offsetY);
  container.innerHTML = \`${innerHtml}\`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  setInterval(() => {
    const timerDOM = container.querySelector('.ca-timer');
    if (!timerDOM) return;

    const dateStr = timerDOM.getAttribute('data-end-date') || TEMPLATE_CONFIG.endDate;
    if (!dateStr) return;

    const distance = new Date(dateStr).getTime() - new Date().getTime();

    if (distance < 0) {
      ['d', 'h', 'm', 's'].forEach((id) => {
        const el = document.getElementById('ca-' + id);
        if (el) el.innerText = '00';
      });
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (n) => (n < 10 ? '0' + n : n);
    ['d', 'h', 'm', 's'].forEach((id, i) => {
      const el = document.getElementById('ca-' + id);
      if (el) el.innerText = pad([d, h, m, s][i]);
    });
  }, 1000);

  ${customJS}
  // [TRACKING_IMPRESSION]
})();
`;
  };

  // 1. ŞABLON: GENİŞLEYEN KUPON (Expandable Coupon)
  if (templateType === 'expandable-coupon') {
    return generateEarlet(
      {
        tabText: 'İNDİRİMİ GÖR',
        title: 'Sana Özel Teklif',
        description: 'İlk siparişine özel anında indirim fırsatı.',
        couponCode: 'KAZAN10',
        ctaText: 'KOPYALA',
        earletPos: 'center-right',
        offsetX: '0',
        offsetY: '0'
      },
      `
        <div class="ca-earlet-body">
          <div class="ca-earlet-inner">
            <div class="ca-collapsed-view" id="ca-expand-trigger">
              <svg class="ca-arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span class="ca-tab-text">\${TEMPLATE_CONFIG.tabText}</span>
            </div>
            <div class="ca-expanded-view">
              <button class="ca-close-btn" id="ca-collapse-trigger">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              <h3 class="ca-title">\${TEMPLATE_CONFIG.title}</h3>
              <p class="ca-desc">\${TEMPLATE_CONFIG.description}</p>
              <div class="ca-coupon-box">
                <span class="ca-code" id="ca-code-txt">\${TEMPLATE_CONFIG.couponCode}</span>
              </div>
              <button class="ca-btn" id="ca-copy-btn">\${TEMPLATE_CONFIG.ctaText}</button>
            </div>
          </div>
        </div>
      `,
      `
        #ca-widget-earlet-container { display: flex; }
        .ca-earlet-body { background: #18181b; color: #fff; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; width: 52px; transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        #ca-widget-earlet-container.is-expanded .ca-earlet-body { width: 320px; }

        .ca-earlet-inner { display: flex; width: 372px; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1); }
        #ca-widget-earlet-container.is-expanded .ca-earlet-inner { transform: translateX(-52px); }

        .ca-collapsed-view { width: 52px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 32px 0; cursor: pointer; transition: background 0.2s; }
        .ca-collapsed-view:hover { background: #27272a; }
        .ca-arrow-icon { color: #10b981; }

        .ca-tab-text { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; font-size: 15px; font-weight: 700; color: #f8fafc; letter-spacing: 1px; }

        .ca-expanded-view { width: 320px; flex-shrink: 0; padding: 28px; box-sizing: border-box; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; position: relative; }
        #ca-widget-earlet-container.is-expanded .ca-expanded-view { opacity: 1; pointer-events: auto; transition-delay: 0.1s; }

        .ca-title { font-size: 22px; font-weight: 800; margin: 0 0 8px 0; color: #10b981; }
        .ca-desc { font-size: 14px; color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.5; }

        .ca-coupon-box { display: flex; align-items: center; justify-content: space-between; background: rgba(16, 185, 129, 0.1); border: 1px dashed #10b981; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px; }
        .ca-code { font-size: 20px; font-weight: 900; color: #10b981; letter-spacing: 1px; }
        .ca-btn { background: #10b981; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s; width: 100%; display: block; }
        .ca-btn:hover { background: #059669; transform: scale(1.02); }

        .ca-close-btn { position: absolute; top: 12px; right: 12px; background: transparent; border: none; color: #52525b; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; padding: 0; }
        .ca-close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); transform: translateX(2px); }

        .ca-edit-mode .ca-earlet-body { width: 372px !important; transition: none !important; }
        .ca-edit-mode .ca-earlet-inner { transform: none !important; transition: none !important; }
        .ca-edit-mode .ca-expanded-view { opacity: 1 !important; pointer-events: auto !important; transition: none !important; }
      `,
      `
        setInterval(() => {
          if (window.__CA_EDIT_MODE__) {
            if (!container.classList.contains('ca-edit-mode')) container.classList.add('ca-edit-mode');
          } else {
            if (container.classList.contains('ca-edit-mode')) container.classList.remove('ca-edit-mode');
          }
        }, 150);

        container.querySelector('#ca-expand-trigger').onclick = () => { container.classList.add('is-expanded'); };
        container.querySelector('#ca-collapse-trigger').onclick = () => { container.classList.remove('is-expanded'); };

        container.querySelector('#ca-copy-btn').onclick = (e) => {
          e.preventDefault();
          if (window.__CA_EDIT_MODE__) return;
          navigator.clipboard.writeText(container.querySelector('#ca-code-txt').innerText);
          // [TRACKING_CLICK]
          const btn = e.target; const orig = btn.innerText;
          btn.innerText = "KOPYALANDI!";
          setTimeout(() => { btn.innerText = orig; }, 2000);
        };
      `
    );
  }

  // 2. ŞABLON: NABIZ ATAN BUTON (Pulse FAB)
  if (templateType === 'pulse-fab') {
    const giftSvgDataUrl =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>'
      );

    return generateEarlet(
      {
        iconUrl: giftSvgDataUrl,
        ctaUrl: 'https://example.com/deals',
        earletPos: 'bottom-right',
        offsetX: '24',
        offsetY: '24'
      },
      `
        <button class="ca-close-btn" aria-label="Kapat">×</button>
        <a href="\${TEMPLATE_CONFIG.ctaUrl}" class="ca-fab-btn" id="ca-cta-link">
          <div class="ca-fab-pulse"></div>
          <img src="\${TEMPLATE_CONFIG.iconUrl}" class="ca-fab-icon" alt="Teaser Icon" />
        </a>
      `,
      `
        #ca-widget-earlet-container { display: flex; align-items: center; justify-content: center; }
        .ca-fab-btn { width: 64px; height: 64px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4); text-decoration: none; position: relative; transition: transform 0.2s; }
        .ca-fab-btn:hover { transform: scale(1.05); }
        .ca-fab-icon { width: 32px; height: 32px; object-fit: contain; z-index: 2; }

        .ca-fab-pulse { position: absolute; inset: 0; border-radius: 50%; background: #ef4444; z-index: 1; animation: caPulse 2s infinite; }
        @keyframes caPulse { 0% { transform: scale(1); opacity: 0.6; } 70% { transform: scale(1.4); opacity: 0; } 100% { transform: scale(1.4); opacity: 0; } }

        .ca-close-btn { position: absolute; top: -8px; right: -8px; background: #18181b; color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 20px; height: 20px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; opacity: 0; transition: 0.2s; padding: 0; }
        #ca-widget-earlet-container:hover .ca-close-btn { opacity: 1; }
      `,
      `
        container.querySelector('.ca-close-btn').onclick = () => {
          if (window.__CA_EDIT_MODE__) return;
          container.style.opacity = '0';
          setTimeout(() => { container.remove(); document.getElementById('ca-earlet-style').remove(); }, 400);
        };
        container.querySelector('#ca-cta-link').onclick = (e) => {
          if (window.__CA_EDIT_MODE__ || window.self !== window.top) { e.preventDefault(); return; }
          // [TRACKING_CLICK]
        };
      `
    );
  }

  // 3. ŞABLON: HEDİYE KUTUSU (Gift Box Teaser)
  if (templateType === 'gift-teaser') {
    return generateEarlet(
      {
        title: 'SÜRPRİZ İNDİRİM',
        ctaUrl: 'https://example.com/deals',
        earletPos: 'center-left',
        offsetX: '0',
        offsetY: '0'
      },
      `
        <button class="ca-close-btn" aria-label="Kapat">×</button>
        <a href="\${TEMPLATE_CONFIG.ctaUrl}" class="ca-gift-box" id="ca-cta-link">
          <div class="ca-icon">🎁</div>
          <span class="ca-text">\${TEMPLATE_CONFIG.title}</span>
        </a>
      `,
      `
        .ca-gift-box { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; text-decoration: none; box-shadow: 0 10px 25px rgba(225, 29, 72, 0.4); border: 2px solid #fff; transition: transform 0.2s; }
        .ca-gift-box:hover { transform: translateY(-4px); }

        .ca-icon { font-size: 28px; line-height: 1; margin: 0; animation: shake 3s infinite; }
        .ca-text { font-family: system-ui, sans-serif; font-size: 11px; font-weight: 800; color: #fff; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; width: min-content; }

        @keyframes shake { 0%, 90% { transform: rotate(0deg); } 92% { transform: rotate(15deg); } 94% { transform: rotate(-15deg); } 96% { transform: rotate(10deg); } 98% { transform: rotate(-10deg); } 100% { transform: rotate(0deg); } }

        .ca-close-btn { position: absolute; top: -10px; right: -10px; background: #18181b; color: #fff; border: 2px solid #fff; width: 22px; height: 22px; border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; opacity: 0; transition: 0.2s; padding: 0; }
        #ca-widget-earlet-container:hover .ca-close-btn { opacity: 1; }
      `,
      `
        container.querySelector('.ca-close-btn').onclick = () => {
          if (window.__CA_EDIT_MODE__) return;
          container.style.opacity = '0';
          setTimeout(() => { container.remove(); document.getElementById('ca-earlet-style').remove(); }, 400);
        };
        container.querySelector('#ca-cta-link').onclick = (e) => {
          if (window.__CA_EDIT_MODE__ || window.self !== window.top) { e.preventDefault(); return; }
          // [TRACKING_CLICK]
        };
      `
    );
  }

  // 4. ŞABLON: FLAŞ İNDİRİM HAPI (Pill Timer)
  if (templateType === 'pill-timer') {
    return generateEarlet(
      {
        text: '🔥 Fırsat Bitiyor:',
        ctaUrl: 'https://example.com/deals',
        endDate: new Date(Date.now() + 3600000 - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16),
        earletPos: 'bottom-center',
        offsetX: '0',
        offsetY: '24'
      },
      `
        <button class="ca-close-btn" aria-label="Kapat">×</button>
        <a href="\${TEMPLATE_CONFIG.ctaUrl}" class="ca-pill" id="ca-cta-link">
          <span class="ca-text">\${TEMPLATE_CONFIG.text}</span>
          <div class="ca-timer" data-end-date="\${TEMPLATE_CONFIG.endDate}" data-hide-d="true" data-hide-h="true">
            <div class="ca-box box-d" id="ca-d">00</div><span class="ca-sep box-d">:</span>
            <div class="ca-box box-h" id="ca-h">00</div><span class="ca-sep box-h">:</span>
            <div class="ca-box box-m" id="ca-m">00</div><span class="ca-sep box-m">:</span>
            <div class="ca-box box-s" id="ca-s">00</div>
          </div>
        </a>
      `,
      `
        .ca-pill { background: #0f172a; border-radius: 40px; padding: 8px 16px 8px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); transition: 0.2s; }
        .ca-pill:hover { background: #1e293b; transform: translateY(-2px); }

        .ca-text { font-family: system-ui, sans-serif; font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; }

        .ca-timer { display: flex; align-items: center; gap: 4px; }
        .ca-box { background: #ef4444; color: #fff; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 6px; }
        .ca-sep { color: #94a3b8; font-weight: bold; }

        .ca-close-btn { position: absolute; top: -10px; right: -10px; background: #fff; color: #000; border: 1px solid #e2e8f0; width: 22px; height: 22px; border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; opacity: 0; transition: 0.2s; padding: 0; }
        #ca-widget-earlet-container:hover .ca-close-btn { opacity: 1; }

        .ca-timer[data-hide-d="true"] .box-d { display: none !important; }
        .ca-timer[data-hide-h="true"] .box-h { display: none !important; }
        .ca-timer[data-hide-m="true"] .box-m { display: none !important; }
        .ca-timer[data-hide-s="true"] .box-s { display: none !important; }
      `,
      `
        container.querySelector('.ca-close-btn').onclick = () => {
          if (window.__CA_EDIT_MODE__) return;
          container.style.opacity = '0';
          setTimeout(() => { container.remove(); document.getElementById('ca-earlet-style').remove(); }, 400);
        };

        container.querySelector('#ca-cta-link').onclick = (e) => {
          if (window.__CA_EDIT_MODE__ || window.self !== window.top) { e.preventDefault(); return; }
          // [TRACKING_CLICK]
        };
      `
    );
  }

  // 5. ŞABLON: ÇOKLU İKON MENÜSÜ (Sidebar Menu)
  if (templateType === 'sidebar-menu') {
    return generateEarlet(
      {
        earletPos: 'center-left',
        offsetX: '0',
        offsetY: '0'
      },
      `
        <div class="ca-sidebar-wrapper">
          <a href="https://example.com/collection" class="ca-sidebar-link">
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" alt="Yeni Sezon" class="ca-sidebar-img">
            <span class="ca-tooltip">Yeni Sezon</span>
          </a>
          <a href="https://example.com/deals" class="ca-sidebar-link">
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80" alt="Fırsatlar" class="ca-sidebar-img">
            <span class="ca-tooltip">Fırsatlar</span>
          </a>
          <a href="https://example.com/collection" class="ca-sidebar-link">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80" alt="Çok Satanlar" class="ca-sidebar-img">
            <span class="ca-tooltip">Çok Satanlar</span>
          </a>
          <a href="https://example.com/deals" class="ca-sidebar-link">
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80" alt="Aksesuar" class="ca-sidebar-img">
            <span class="ca-tooltip">Aksesuar</span>
          </a>
        </div>
      `,
      `
        .ca-sidebar-wrapper { background-color: #0a2140; width: 60px; height: 275px; border-radius: 0 10px 10px 0; display: flex; flex-direction: column; justify-content: space-between; padding: 10px 5px; box-sizing: border-box; box-shadow: 2px 0 10px rgba(0,0,0,0.2); pointer-events: auto; }

        #ca-widget-earlet-container[data-epos*="right"] .ca-sidebar-wrapper { border-radius: 10px 0 0 10px; box-shadow: -2px 0 10px rgba(0,0,0,0.2); }

        .ca-sidebar-link { position: relative; display: flex; align-items: center; justify-content: center; width: 100%; cursor: pointer; text-decoration: none; }
        .ca-sidebar-img { width: 44px; height: 44px; object-fit: cover; transition: transform 0.2s; border-radius: 6px; }
        .ca-sidebar-link:hover .ca-sidebar-img { transform: scale(1.1); }

        .ca-tooltip { position: absolute; left: calc(100% + 10px); background-color: #0a2140; color: white; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s, transform 0.2s; transform: translateX(-10px); z-index: 10001; }
        .ca-sidebar-link:hover .ca-tooltip { opacity: 1; transform: translateX(0); }

        #ca-widget-earlet-container[data-epos*="right"] .ca-tooltip { left: auto; right: calc(100% + 10px); transform: translateX(10px); }
        #ca-widget-earlet-container[data-epos*="right"] .ca-sidebar-link:hover .ca-tooltip { transform: translateX(0); }

        @media only screen and (max-width: 768px) {
          .ca-sidebar-wrapper { width: 42px; height: 180px; padding: 6px 4px; }
          .ca-sidebar-img { width: 32px; height: 32px; }
          .ca-tooltip { display: none !important; }
        }

        .ca-edit-mode .ca-sidebar-wrapper { height: auto; gap: 16px; width: 70px; }
        .ca-edit-mode .ca-sidebar-link { flex-direction: column; }
        .ca-edit-mode .ca-tooltip { position: static; opacity: 1 !important; transform: none !important; display: block; margin-top: 6px; padding: 4px; font-size: 11px; pointer-events: auto; text-align: center; white-space: normal; }
      `,
      `
        setInterval(() => {
          if (window.__CA_EDIT_MODE__) {
            if (!container.classList.contains('ca-edit-mode')) container.classList.add('ca-edit-mode');
          } else {
            if (container.classList.contains('ca-edit-mode')) container.classList.remove('ca-edit-mode');
          }
        }, 150);

        const links = container.querySelectorAll('.ca-sidebar-link');
        links.forEach((link) => {
          link.onclick = (e) => {
            if (window.__CA_EDIT_MODE__ || window.self !== window.top) { e.preventDefault(); return; }
            // [TRACKING_CLICK]
          };
        });
      `
    );
  }

  return '';
};

const EARLET_TEMPLATES = [
  {
    id: 'expandable-coupon',
    title: '🎁 Genişleyen Kupon (Tavsiye)',
    description: 'Ekranın sağ kenarında usulca duran ve tıklandığında büyüyerek indirim kodu veren yüksek dönüşümlü kurgu.',
    color: '#10b981',
    badge: 'En Etkili',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    code: getEarletCode('expandable-coupon')
  },
  {
    id: 'pulse-fab',
    title: '💬 Nabız Atan Buton',
    description: 'Ekranın köşesinde hızlı erişim butonu gibi duran ve nabız (pulse) animasyonuyla tıklamaya teşvik eden ikonik kulakçık.',
    color: '#ef4444',
    code: getEarletCode('pulse-fab')
  },
  {
    id: 'gift-teaser',
    title: '🎀 Sürpriz Hediye Kutusu',
    description: 'Ekranın sol kenarına yapışık duran, titreme (shake) efekti ile merak uyandıran cazip hediye kutusu.',
    color: '#e11d48',
    code: getEarletCode('gift-teaser')
  },
  {
    id: 'pill-timer',
    title: '⏳ Flaş İndirim Hapı',
    description: 'Ekranın altında yüzen minimal hap formunda aciliyet (FOMO) sayacı.',
    color: '#0f172a',
    badge: 'Aciliyet',
    badgeColor: '#ffffff',
    badgeBg: '#3f3f46',
    code: getEarletCode('pill-timer')
  },
  {
    id: 'sidebar-menu',
    title: '📱 Çoklu İkon Menüsü',
    description: 'Ekranın kenarına sabitlenen ve üzerine gelindiğinde isimleri çıkan dikey kısayol ikon menüsü.',
    color: '#0a2140',
    badge: 'Menü',
    badgeColor: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    code: getEarletCode('sidebar-menu')
  }
];

export { getEarletCode, EARLET_TEMPLATES };
