const getPopupCode = (templateType) => {
  // 1. ŞABLON: YATAY GÖRSEL
  if (templateType === 'horizontal-hero') {
    return `// horizontal-hero Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    title: "YENİ SEZONU KEŞFET",
    description: "Tarzını yenilemenin tam zamanı! Seçili trend ürünlerde kısa süreliğine geçerli net %30 indirim fırsatını kaçırma. Stoklar tükenmeden koleksiyonu incele.",
    ctaText: "ALIŞVERİŞE BAŞLA",
    ctaUrl: "https://example.com/deals",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80"
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    #ca-widget-popup-container.show { opacity: 1; }

    .ca-modal { background: #ffffff; width: 92%; max-width: 680px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); transform: translateY(20px) scale(0.96); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); display: grid; grid-template-columns: 1fr; position: relative; }
    #ca-widget-popup-container.show .ca-modal { transform: translateY(0) scale(1); }

    @media (min-width: 640px) {
      .ca-modal { grid-template-columns: 46% 54%; }
    }

    .ca-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #0f172a; z-index: 10; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .ca-close:hover { background: #fff; transform: scale(1.1); color: #ef4444; }

    .ca-image-side { width: 100%; height: 100%; min-height: 240px; max-height: 320px; object-fit: cover; background: #f1f5f9; cursor: pointer; }
    @media (min-width: 640px) {
      .ca-image-side { max-height: none; }
    }

    .ca-content-side { padding: 40px 32px; display: flex; flex-direction: column; justify-content: center; text-align: left; }
    .ca-title { margin: 0 0 12px 0; font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.25; letter-spacing: -0.5px; }
    .ca-desc { margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #475569; font-weight: 400; }

    .ca-btn { background: #0f172a; color: #fff; border: none; width: 100%; padding: 15px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: center; text-decoration: none; display: inline-block; box-sizing: border-box; }
    .ca-btn:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.25); }
    .ca-btn:active { transform: translateY(0) scale(0.98); }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <button class="ca-close" aria-label="Kapat">×</button>
      <img src="\${TEMPLATE_CONFIG.image}" class="ca-image-side" alt="Campaign Image" />
      <div class="ca-content-side">
        <h2 class="ca-title">\${TEMPLATE_CONFIG.title}</h2>
        <p class="ca-desc">\${TEMPLATE_CONFIG.description}</p>
        <button class="ca-btn" id="ca-cta-btn">\${TEMPLATE_CONFIG.ctaText}</button>
      </div>
    </div>
  \`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 500);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = (e) => { if (e.target === container) closePopup(); };

  container.querySelector('#ca-cta-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      console.log("Editör Modu: Yönlendirme engellendi.");
      return;
    }
    // [TRACKING_CLICK]
    const parentLink = e.currentTarget.closest('a');
    const currentHref = parentLink ? parentLink.getAttribute('href') : e.currentTarget.getAttribute('href');
    window.location.href = currentHref || TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 2. ŞABLON: GERİ SAYIM SAYACI (Split Countdown)
  if (templateType === 'split-countdown') {
    return `// split-countdown Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    title: "Sınırlı Teklif",
    subtitle: "SON ŞANS",
    ctaText: "İNDİRİMİ YAKALA",
    ctaUrl: "https://example.com/deals",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80",
    endDate: new Date(Date.now() + 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    #ca-widget-popup-container.show { opacity: 1; }

    .ca-modal { width: 92%; max-width: 720px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.4); transform: translateY(20px) scale(0.96); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); display: grid; grid-template-columns: 1fr; background: #fff; position: relative; }
    #ca-widget-popup-container.show .ca-modal { transform: translateY(0) scale(1); }

    @media (min-width: 640px) {
      .ca-modal { grid-template-columns: 42% 58%; }
    }

    .ca-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: rgba(0,0,0,0.05); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #0f172a; z-index: 10; transition: 0.2s; }
    .ca-close:hover { background: rgba(0,0,0,0.1); transform: scale(1.1); }
    .ca-image-side { width: 100%; height: 100%; min-height: 240px; max-height: 320px; object-fit: cover; background: #f1f5f9; cursor: pointer; }
    @media (min-width: 640px) { .ca-image-side { max-height: none; } }
    .ca-right { padding: 48px 32px; text-align: center; display: flex; flex-direction: column; justify-content: center; }
    .ca-subtitle { font-size: 12px; letter-spacing: 2px; font-weight: 800; color: #ec4899; text-transform: uppercase; margin: 0 0 8px 0; }
    .ca-title { font-size: 32px; font-weight: 900; margin: 0 0 24px 0; color: #0f172a; line-height: 1.1; letter-spacing: -0.5px; }

    .ca-timer { display: flex; justify-content: center; gap: 12px; margin-bottom: 32px; }
    .ca-time-box { width: 64px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px 0; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .ca-time-val { font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1; }
    .ca-time-lbl { font-size: 10px; margin-top: 6px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .ca-timer[data-hide-d="true"] .box-d { display: none !important; }
    .ca-timer[data-hide-h="true"] .box-h { display: none !important; }
    .ca-timer[data-hide-m="true"] .box-m { display: none !important; }
    .ca-timer[data-hide-s="true"] .box-s { display: none !important; }
    .ca-btn { background: #0f172a; color: #fff; border: none; width: 100%; padding: 16px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s; box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.4); text-decoration: none; display: inline-block; box-sizing: border-box; }
    .ca-btn:hover { background: #1e293b; transform: translateY(-2px); }
    .ca-btn:active { transform: translateY(0); }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <button class="ca-close" aria-label="Kapat">×</button>
      <img src="\${TEMPLATE_CONFIG.image}" class="ca-image-side" alt="Campaign Image" />
      <div class="ca-right">
        <p class="ca-subtitle">\${TEMPLATE_CONFIG.subtitle}</p>
        <h2 class="ca-title">\${TEMPLATE_CONFIG.title}</h2>
        <div class="ca-timer" data-end-date="\${TEMPLATE_CONFIG.endDate}" data-hide-d="true">
          <div class="ca-time-box box-d">
            <span class="ca-time-val" id="ca-d">00</span>
            <span class="ca-time-lbl">GÜN</span>
          </div>
          <div class="ca-time-box box-h">
            <span class="ca-time-val" id="ca-h">00</span>
            <span class="ca-time-lbl">SAAT</span>
          </div>
          <div class="ca-time-box box-m">
            <span class="ca-time-val" id="ca-m">00</span>
            <span class="ca-time-lbl">DAK</span>
          </div>
          <div class="ca-time-box box-s">
            <span class="ca-time-val" id="ca-s">00</span>
            <span class="ca-time-lbl">SAN</span>
          </div>
        </div>
        <button class="ca-btn" id="ca-cta-btn">\${TEMPLATE_CONFIG.ctaText}</button>
      </div>
    </div>
  \`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  let timerInterval;

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => {
      container.remove();
      style.remove();
      clearInterval(timerInterval);
    }, 500);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = (e) => { if (e.target === container) closePopup(); };

  container.querySelector('#ca-cta-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      console.log("Editör Modu: Yönlendirme engellendi.");
      return;
    }
    // [TRACKING_CLICK]
    const parentLink = e.currentTarget.closest('a');
    const currentHref = parentLink ? parentLink.getAttribute('href') : e.currentTarget.getAttribute('href');
    window.location.href = currentHref || TEMPLATE_CONFIG.ctaUrl;
  };

  timerInterval = setInterval(() => {
    const timerContainer = container.querySelector('.ca-timer');
    const dateStr = (timerContainer && timerContainer.getAttribute('data-end-date'))
      ? timerContainer.getAttribute('data-end-date')
      : TEMPLATE_CONFIG.endDate;
    const countDownDate = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      if (document.getElementById("ca-d")) document.getElementById("ca-d").innerText = "00";
      if (document.getElementById("ca-h")) document.getElementById("ca-h").innerText = "00";
      if (document.getElementById("ca-m")) document.getElementById("ca-m").innerText = "00";
      if (document.getElementById("ca-s")) document.getElementById("ca-s").innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const elD = document.getElementById("ca-d");
    const elH = document.getElementById("ca-h");
    const elM = document.getElementById("ca-m");
    const elS = document.getElementById("ca-s");

    if (elD) elD.innerText = days < 10 ? "0" + days : days;
    if (elH) elH.innerText = hours < 10 ? "0" + hours : hours;
    if (elM) elM.innerText = minutes < 10 ? "0" + minutes : minutes;
    if (elS) elS.innerText = seconds < 10 ? "0" + seconds : seconds;
  }, 1000);

  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 3. ŞABLON: SADECE GÖRSEL
  if (templateType === 'image-only') {
    return `// image-only Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    desktopImage: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&h=450&q=80",
    mobileImage: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=400&h=500&q=80",
    ctaUrl: "https://example.com/deals"
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); z-index: 99999; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    #ca-widget-popup-container.show { opacity: 1; }

    .ca-modal { position: relative; width: 90%; max-width: 800px; transform: scale(0.95) translateY(20px); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; justify-content: center; align-items: center; }
    #ca-widget-popup-container.show .ca-modal { transform: scale(1) translateY(0); }

    .ca-close { position: absolute; top: -16px; right: -16px; width: 36px; height: 36px; background: #fff; border: 2px solid #e2e8f0; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #0f172a; z-index: 10; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .ca-close:hover { color: #ef4444; border-color: #ef4444; }

    .ca-img-link { display: block; width: 100%; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-decoration: none; cursor: pointer; }
    .ca-desktop-img, .ca-mobile-img { width: 100%; height: auto; display: block; object-fit: cover; border-radius: 16px; }
    .ca-mobile-img { display: none; }

    @media (max-width: 768px) {
      .ca-desktop-img { display: none; }
      .ca-mobile-img { display: block; }
      .ca-modal { max-width: 400px; }
      .ca-close { top: -12px; right: -12px; width: 32px; height: 32px; font-size: 18px; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <button class="ca-close" aria-label="Kapat">×</button>
      <a href="\${TEMPLATE_CONFIG.ctaUrl}" id="ca-cta-link" class="ca-img-link">
        <img src="\${TEMPLATE_CONFIG.desktopImage}" class="ca-desktop-img" alt="Desktop Campaign" />
        <img src="\${TEMPLATE_CONFIG.mobileImage}" class="ca-mobile-img" alt="Mobile Campaign" />
      </a>
    </div>
  \`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 400);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = (e) => { if (e.target === container) closePopup(); };

  container.querySelector('#ca-cta-link').onclick = (e) => {
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      e.preventDefault();
      return;
    }
    // [TRACKING_CLICK]
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 4. ŞABLON: E-POSTA BÜLTENİ
  if (templateType === 'email-subscription') {
    return `// email-subscription Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    title: "BÜLTENİMİZE KATILIN",
    description: "En yeni koleksiyonlar, özel indirimler ve trendlerden ilk siz haberdar olun. Hemen kaydolun, ilk alışverişinizde %15 indirim kazanın!",
    inputPlaceholder: "E-posta adresinizi girin",
    ctaText: "KAYDOL VE KAZAN",
    ctaUrl: "https://example.com/deals",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80"
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    #ca-widget-popup-container.show { opacity: 1; }

    .ca-modal { background: #ffffff; width: 92%; max-width: 680px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); transform: translateY(20px) scale(0.96); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); display: grid; grid-template-columns: 1fr; position: relative; }
    #ca-widget-popup-container.show .ca-modal { transform: translateY(0) scale(1); }

    @media (min-width: 640px) {
      .ca-modal { grid-template-columns: 46% 54%; }
    }

    .ca-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #0f172a; z-index: 10; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

    .ca-image-side { width: 100%; height: 100%; min-height: 240px; max-height: 320px; object-fit: cover; background: #f1f5f9; cursor: pointer; }
    @media (min-width: 640px) {
      .ca-image-side { max-height: none; }
    }

    .ca-content-side { padding: 40px 32px; display: flex; flex-direction: column; justify-content: center; text-align: left; gap: 12px; }
    .ca-title { margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.25; letter-spacing: -0.5px; }
    .ca-desc { margin: 0 0 4px 0; font-size: 14px; line-height: 1.6; color: #475569; font-weight: 400; }

    .ca-input { width: 100%; padding: 14px 16px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 14px; color: #0f172a; outline: none; transition: border-color 0.2s; background: #f8fafc; box-sizing: border-box; }
    .ca-input:focus { border-color: #3b82f6; background: #fff; }

    .ca-btn { background: #0f172a; color: #fff; border: none; width: 100%; padding: 15px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: center; text-decoration: none; display: inline-block; box-sizing: border-box; margin-top: 4px; }
    .ca-btn:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.25); }
    .ca-btn:active { transform: translateY(0) scale(0.98); }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <button class="ca-close" aria-label="Kapat">×</button>
      <img src="\${TEMPLATE_CONFIG.image}" class="ca-image-side" alt="Campaign Image" />
      <div class="ca-content-side">
        <h2 class="ca-title">\${TEMPLATE_CONFIG.title}</h2>
        <p class="ca-desc">\${TEMPLATE_CONFIG.description}</p>
        <input type="email" class="ca-input" placeholder="\${TEMPLATE_CONFIG.inputPlaceholder}" id="ca-email-input" />
        <button class="ca-btn" id="ca-cta-btn">\${TEMPLATE_CONFIG.ctaText}</button>
      </div>
    </div>
  \`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 500);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = (e) => { if (e.target === container) closePopup(); };

  container.querySelector('#ca-cta-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      console.log("Editör Modu: Kayıt engellendi.");
      return;
    }
    const emailVal = container.querySelector('#ca-email-input').value;
    console.log("Kaydedilen E-posta:", emailVal);
    // [TRACKING_CLICK]
    closePopup();
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 5. ŞABLON: NPS / ALIŞVERİŞ MEMNUNİYET ANKETİ
  if (templateType === 'nps-survey') {
    return `// nps-survey Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    title: "Alışveriş deneyiminiz nasıldı?",
    description: "Bizi arkadaşlarınıza veya meslektaşlarınıza tavsiye etme olasılığınız nedir?",
    lowLabel: "Kesinlikle Tavsiye Etmem",
    highLabel: "Kesinlikle Tavsiye Ederim",
    ctaText: "GÖNDER"
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    #ca-widget-popup-container.show { opacity: 1; }

    .ca-modal { background: #ffffff; width: 92%; max-width: 600px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); transform: translateY(20px) scale(0.96); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); position: relative; padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    #ca-widget-popup-container.show .ca-modal { transform: translateY(0) scale(1); }

    .ca-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: transparent; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #94a3b8; z-index: 10; transition: color 0.2s ease; }
    .ca-close:hover { color: #ef4444; }

    .ca-title { margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3; letter-spacing: -0.5px; }
    .ca-desc { margin: 0; font-size: 15px; line-height: 1.6; color: #475569; font-weight: 400; max-width: 480px; }

    .ca-nps-scale { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; width: 100%; margin: 16px 0 8px 0; }
    .ca-nps-btn { width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #fff; color: #334155; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; padding: 0; }
    .ca-nps-btn:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; transform: translateY(-2px); }
    .ca-nps-btn.selected { background: #3b82f6; border-color: #3b82f6; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }

    .ca-nps-labels { display: flex; justify-content: space-between; width: 100%; max-width: 500px; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; margin-top: -8px; margin-bottom: 8px; padding: 0 4px; }

    .ca-submit-btn { background: #0f172a; color: #fff; border: none; padding: 15px 40px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: center; text-decoration: none; opacity: 0.4; pointer-events: none; }
    .ca-submit-btn.active { opacity: 1; pointer-events: auto; }
    .ca-submit-btn.active:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.25); }
    .ca-submit-btn.active:active { transform: translateY(0) scale(0.98); }

    @media (max-width: 480px) {
      .ca-modal { padding: 32px 20px; }
      .ca-nps-scale { gap: 6px; }
      .ca-nps-btn { width: 38px; height: 38px; font-size: 14px; }
      .ca-nps-labels { display: none; }
    }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <button class="ca-close" aria-label="Kapat">×</button>
      <h2 class="ca-title">\${TEMPLATE_CONFIG.title}</h2>
      <p class="ca-desc">\${TEMPLATE_CONFIG.description}</p>
      <div class="ca-nps-scale">
        <button class="ca-nps-btn" data-value="1">1</button>
        <button class="ca-nps-btn" data-value="2">2</button>
        <button class="ca-nps-btn" data-value="3">3</button>
        <button class="ca-nps-btn" data-value="4">4</button>
        <button class="ca-nps-btn" data-value="5">5</button>
        <button class="ca-nps-btn" data-value="6">6</button>
        <button class="ca-nps-btn" data-value="7">7</button>
        <button class="ca-nps-btn" data-value="8">8</button>
        <button class="ca-nps-btn" data-value="9">9</button>
        <button class="ca-nps-btn" data-value="10">10</button>
      </div>
      <div class="ca-nps-labels">
        <span>\${TEMPLATE_CONFIG.lowLabel}</span>
        <span>\${TEMPLATE_CONFIG.highLabel}</span>
      </div>
      <button class="ca-submit-btn" id="ca-submit-btn">\${TEMPLATE_CONFIG.ctaText}</button>
    </div>
  \`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  let selectedValue = null;
  const npsBtns = container.querySelectorAll('.ca-nps-btn');
  const submitBtn = container.querySelector('#ca-submit-btn');

  npsBtns.forEach(btn => {
    btn.onclick = (e) => {
      if (window.__CA_EDIT_MODE__) {
        e.preventDefault();
      }
      npsBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedValue = btn.getAttribute('data-value');
      submitBtn.classList.add('active');
    };
  });

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 500);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = (e) => { if (e.target === container) closePopup(); };

  submitBtn.onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      console.log("Editör Modu: Form gönderimi engellendi. Seçilen Değer:", selectedValue);
      return;
    }
    console.log("Kullanıcının verdiği puan:", selectedValue);
    // [TRACKING_CLICK]
    closePopup();
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 6. ŞABLON: KUPON KODU / EXIT-INTENT
  if (templateType === 'coupon-code') {
    return `// coupon-code Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    title: "GİTMEDEN ÖNCE!",
    description: "Sepetindeki ürünleri %20 indirimle almak için aşağıdaki kodu kullanabilirsin.",
    couponCode: "FIRSAT20",
    ctaText: "ALIŞVERİŞE DEVAM ET",
    ctaUrl: "https://example.com/deals"
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: none; }
    #ca-widget-popup-container.show { opacity: 1; pointer-events: auto; }

    .ca-modal { background: #ffffff; width: 92%; max-width: 480px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); transform: translateY(20px) scale(0.96); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); position: relative; padding: 48px 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    #ca-widget-popup-container.show .ca-modal { transform: translateY(0) scale(1); }

    .ca-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: transparent; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #94a3b8; z-index: 10; transition: color 0.2s ease; }
    .ca-close:hover { color: #ef4444; }

    .ca-title { margin: 0; font-size: 32px; font-weight: 900; color: #ef4444; line-height: 1.1; letter-spacing: -0.5px; }
    .ca-desc { margin: 8px 0 16px 0; font-size: 16px; line-height: 1.6; color: #475569; font-weight: 400; }

    .ca-coupon-box { display: flex; align-items: center; justify-content: space-between; border: 2px dashed #cbd5e1; padding: 12px 16px; border-radius: 12px; background: #f8fafc; width: 100%; margin-bottom: 24px; box-sizing: border-box; }
    .ca-coupon-text { font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #0f172a; margin: 0; }
    .ca-copy-btn { background: #e2e8f0; color: #0f172a; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 14px; }
    .ca-copy-btn:hover { background: #cbd5e1; }

    .ca-btn { background: #0f172a; color: #fff; border: none; width: 100%; padding: 16px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: center; text-decoration: none; display: inline-block; box-sizing: border-box; }
    .ca-btn:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.25); }
    .ca-btn:active { transform: translateY(0) scale(0.98); }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <button class="ca-close" aria-label="Kapat">×</button>
      <h2 class="ca-title">\${TEMPLATE_CONFIG.title}</h2>
      <p class="ca-desc">\${TEMPLATE_CONFIG.description}</p>
      <div class="ca-coupon-box">
        <span class="ca-coupon-text" id="ca-code-txt">\${TEMPLATE_CONFIG.couponCode}</span>
        <button class="ca-copy-btn" id="ca-copy-btn">KOPYALA</button>
      </div>
      <button class="ca-btn" id="ca-cta-btn">\${TEMPLATE_CONFIG.ctaText}</button>
    </div>
  \`;
  document.body.appendChild(container);

  const showPopup = () => {
    if (!container.classList.contains('show')) {
      container.classList.add('show');
    }
  };

  if (window.__CA_EDIT_MODE__) {
    setTimeout(showPopup, 50);
  } else {
    const exitListener = (e) => {
      if (e.clientY < 15) {
        showPopup();
        document.removeEventListener('mouseout', exitListener);
      }
    };
    document.addEventListener('mouseout', exitListener);
  }

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 500);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = (e) => { if (e.target === container) closePopup(); };

  container.querySelector('#ca-copy-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__) {
      console.log("Editör Modu: Kopyalama engellendi.");
      return;
    }
    const currentCode = container.querySelector('#ca-code-txt').innerText;
    navigator.clipboard.writeText(currentCode);
    e.target.innerText = "KOPYALANDI!";
    setTimeout(() => { e.target.innerText = "KOPYALA"; }, 2000);
  };

  container.querySelector('#ca-cta-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      console.log("Editör Modu: Yönlendirme engellendi.");
      return;
    }
    // [TRACKING_CLICK]
    const parentLink = e.currentTarget.closest('a');
    const currentHref = parentLink ? parentLink.getAttribute('href') : e.currentTarget.getAttribute('href');
    window.location.href = currentHref || TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 7. ŞABLON: EVET / HAYIR (Mikro-Taahhüt)
  if (templateType === 'yes-no-action') {
    return `// yes-no-action Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    title: "İlk Siparişine Özel %20 İndirim",
    description: "Sana özel tanımlanan bu indirimi hemen sepetinde kullanmak ister misin?",
    yesText: "EVET, İNDİRİMİ İSTİYORUM",
    yesUrl: "https://example.com/deals",
    noText: "Hayır, tam fiyat ödemeyi tercih ederim"
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    #ca-widget-popup-container.show { opacity: 1; }

    .ca-modal { background: #ffffff; width: 92%; max-width: 450px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); transform: translateY(20px) scale(0.96); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); position: relative; padding: 40px 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    #ca-widget-popup-container.show .ca-modal { transform: translateY(0) scale(1); }

    .ca-title { margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1.2; letter-spacing: -0.5px; }
    .ca-desc { margin: 8px 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; font-weight: 400; }

    .ca-actions { display: flex; flex-direction: column; gap: 12px; width: 100%; }

    .ca-btn-yes { background: #10b981; color: #fff; border: none; width: 100%; padding: 16px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: center; text-decoration: none; display: inline-block; box-sizing: border-box; }
    .ca-btn-yes:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3); }

    .ca-btn-no { background: transparent; color: #94a3b8; border: none; padding: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-decoration: underline; transition: color 0.2s; }
    .ca-btn-no:hover { color: #475569; }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <h2 class="ca-title">\${TEMPLATE_CONFIG.title}</h2>
      <p class="ca-desc">\${TEMPLATE_CONFIG.description}</p>
      <div class="ca-actions">
        <button class="ca-btn-yes" id="ca-yes-btn">\${TEMPLATE_CONFIG.yesText}</button>
        <button class="ca-btn-no" id="ca-no-btn">\${TEMPLATE_CONFIG.noText}</button>
      </div>
    </div>
  \`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 500);
  };

  container.querySelector('#ca-no-btn').onclick = (e) => {
    e.preventDefault();
    closePopup();
  };

  container.querySelector('#ca-yes-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      console.log("Editör Modu: Yönlendirme engellendi.");
      return;
    }
    // [TRACKING_CLICK]
    const parentLink = e.currentTarget.closest('a');
    const currentHref = parentLink ? parentLink.getAttribute('href') : e.currentTarget.getAttribute('href');
    window.location.href = currentHref || TEMPLATE_CONFIG.yesUrl;
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  // 8. ŞABLON: BASİT POPUP (Basic Text)
  if (templateType === 'basic-text') {
    return `// basic-text Şablonu
(function () {
  if (document.getElementById('ca-widget-popup-container')) return;

  const TEMPLATE_CONFIG = {
    title: "Özel Bir Duyurumuz Var",
    description: "Siz değerli müşterilerimize özel hazırladığımız yeni koleksiyonumuzu incelemek için hemen tıklayın.",
    ctaText: "DETAYLARI İNCELE",
    ctaUrl: "https://example.com/deals"
  };

  const style = document.createElement('style');
  style.id = 'ca-popup-style';
  style.innerHTML = \`
    #ca-widget-popup-container { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; opacity: 0; transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    #ca-widget-popup-container.show { opacity: 1; }

    .ca-modal { background: #ffffff; width: 92%; max-width: 450px; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); transform: translateY(20px) scale(0.96); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); position: relative; padding: 48px 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    #ca-widget-popup-container.show .ca-modal { transform: translateY(0) scale(1); }

    .ca-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; background: transparent; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #94a3b8; z-index: 10; transition: color 0.2s ease; }
    .ca-close:hover { color: #ef4444; }

    .ca-title { margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; line-height: 1.25; letter-spacing: -0.5px; }
    .ca-desc { margin: 8px 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; font-weight: 400; }

    .ca-btn { background: #0f172a; color: #fff; border: none; width: 100%; padding: 15px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); text-align: center; text-decoration: none; display: inline-block; box-sizing: border-box; }
    .ca-btn:hover { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.25); }
    .ca-btn:active { transform: translateY(0) scale(0.98); }
  \`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'ca-widget-popup-container';
  container.innerHTML = \`
    <div class="ca-modal">
      <button class="ca-close" aria-label="Kapat">×</button>
      <h2 class="ca-title">\${TEMPLATE_CONFIG.title}</h2>
      <p class="ca-desc">\${TEMPLATE_CONFIG.description}</p>
      <button class="ca-btn" id="ca-cta-btn">\${TEMPLATE_CONFIG.ctaText}</button>
    </div>
  \`;
  document.body.appendChild(container);

  setTimeout(() => container.classList.add('show'), 50);

  const closePopup = () => {
    if (window.__CA_EDIT_MODE__) return;
    container.classList.remove('show');
    setTimeout(() => { container.remove(); style.remove(); }, 500);
  };

  container.querySelector('.ca-close').onclick = closePopup;
  container.onclick = (e) => { if (e.target === container) closePopup(); };

  container.querySelector('#ca-cta-btn').onclick = (e) => {
    e.preventDefault();
    if (window.__CA_EDIT_MODE__ || window.self !== window.top) {
      console.log("Editör Modu: Yönlendirme engellendi.");
      return;
    }
    // [TRACKING_CLICK]
    const parentLink = e.currentTarget.closest('a');
    const currentHref = parentLink ? parentLink.getAttribute('href') : e.currentTarget.getAttribute('href');
    window.location.href = currentHref || TEMPLATE_CONFIG.ctaUrl;
  };
  // [TRACKING_IMPRESSION]
})();
`;
  }

  return "";
};

const POPUP_TEMPLATES = [
  {
    id: 'image-only',
    title: '📱 Görsel Odaklı Tasarım',
    description: 'Masaüstü ve mobil cihazlara özel ayrı kreatifler sunmanızı sağlayan, metinsiz ve yüksek etkileşimli tam ekran şablon.',
    color: '#8b5cf6',
    badge: 'En Pratik',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    code: getPopupCode('image-only')
  },
  {
    id: 'basic-text',
    title: '📝 Minimalist Duyuru',
    description: 'Ziyaretçilerinizi yormadan net bir mesaj ve odaklanmış bir aksiyon çağrısı (CTA) sunan kurumsal bilgilendirme şablonu.',
    color: '#64748b',
    code: getPopupCode('basic-text')
  },
  {
    id: 'split-countdown',
    title: '⏳ Aciliyet (FOMO) Sayacı',
    description: 'Dinamik geri sayım sayacı ile kaybetme korkusu (FOMO) yaratarak anlık satın alma oranlarınızı maksimize eden kurgu.',
    color: '#ec4899',
    badge: 'Popüler',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    code: getPopupCode('split-countdown')
  },
  {
    id: 'horizontal-hero',
    title: '🖼️ Gelişmiş Kampanya',
    description: 'Zengin görsel kullanımı ve tipografik hiyerarşiyi birleştirerek marka kimliğinizi öne çıkaran premium kampanya şablonu.',
    color: '#0f172a',
    code: getPopupCode('horizontal-hero')
  },
  {
    id: 'coupon-code',
    title: '✂️ Çıkış Niyeti (Exit-Intent)',
    description: 'Sayfayı terk etme eğilimindeki ziyaretçileri algılayıp anında kopyalanabilir bir teklif sunarak sepet terk oranlarını düşüren kurgu.',
    color: '#ef4444',
    badge: 'Kaçan Sepet',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    code: getPopupCode('coupon-code')
  },
  {
    id: 'email-subscription',
    title: '📧 Lead Toplama (Bülten)',
    description: 'Etkili bir görsel ve optimize edilmiş veri giriş formu ile e-posta veri tabanınızı ve abone sayınızı hızla büyüten şablon.',
    color: '#3b82f6',
    badge: 'Data Toplama',
    badgeColor: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    code: getPopupCode('email-subscription')
  },
  {
    id: 'yes-no-action',
    title: '⚖️ İkili Seçenek (Mikro-Taahhüt)',
    description: 'Psikolojik yönlendirme teknikleri kullanarak ziyaretçiyi ilk aksiyona ikna eden ve yüksek dönüşüm sağlayan ara katman şablonu.',
    color: '#f59e0b',
    badge: 'Yüksek Dönüşüm',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    code: getPopupCode('yes-no-action')
  },
  {
    id: 'nps-survey',
    title: '⭐ Müşteri Memnuniyeti (NPS)',
    description: 'Saf ve minimal arayüzü sayesinde kullanıcı deneyimini pürüzsüzce ölçümleyen ve Net Tavsiye Skoru (NPS) toplayan anket kurgusu.',
    color: '#10b981',
    code: getPopupCode('nps-survey')
  }
];

export { getPopupCode, POPUP_TEMPLATES };
