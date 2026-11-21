export const MOCK_STOREFRONTS = [
  {
    id: 'nordic-wear',
    name: 'Nordic Wear — Moda Mağazası',
    html: `<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nordic Wear — Moda Mağazası</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #fafaf9; color: #18181b; scrollbar-width: none; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
    .nw-promo { background: #18181b; color: #f4f4f5; text-align: center; padding: 9px 16px; font-size: 12px; font-weight: 500; letter-spacing: 0.4px; }
    .nw-header { background: #ffffff; border-bottom: 1px solid #e4e4e7; position: sticky; top: 0; z-index: 20; }
    .nw-header-inner { max-width: 1180px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .nw-brand { font-size: 20px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #09090b; }
    .nw-nav { display: flex; gap: 24px; font-size: 14px; font-weight: 500; color: #52525b; }
    .nw-nav a { color: inherit; text-decoration: none; }
    .nw-actions { display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; }
    .nw-pill { background: #f4f4f5; padding: 7px 14px; border-radius: 999px; color: #18181b; }
    .nw-hero { max-width: 1180px; margin: 28px auto; padding: 0 24px; }
    .nw-hero-card { border-radius: 20px; padding: 64px 48px; background: linear-gradient(120deg, #18181b 0%, #3f3f46 55%, #71717a 100%); color: #ffffff; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: center; }
    .nw-eyebrow { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.4px; background: rgba(255,255,255,0.14); padding: 6px 12px; border-radius: 999px; margin-bottom: 16px; }
    .nw-hero h1 { margin: 0 0 14px 0; font-size: 40px; line-height: 1.15; font-weight: 800; letter-spacing: -0.8px; }
    .nw-hero p { margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #d4d4d8; max-width: 480px; }
    .nw-hero-btn { display: inline-block; background: #ffffff; color: #09090b; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; }
    .nw-hero-visual { background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); border: 1px solid rgba(255,255,255,0.16); border-radius: 16px; padding: 28px; text-align: center; }
    .nw-hero-stat { font-size: 32px; font-weight: 800; margin-bottom: 6px; }
    .nw-hero-sub { font-size: 13px; color: #e4e4e7; }
    .nw-section { max-width: 1180px; margin: 36px auto; padding: 0 24px; }
    .nw-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px; }
    .nw-section-head h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .nw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .nw-card { background: #ffffff; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden; }
    .nw-thumb { height: 190px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #52525b; }
    .nw-card-body { padding: 16px; }
    .nw-cat { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; margin-bottom: 4px; }
    .nw-title { font-size: 15px; font-weight: 600; margin: 0 0 8px 0; }
    .nw-price { font-size: 15px; font-weight: 700; color: #09090b; }
    .nw-footer { background: #ffffff; border-top: 1px solid #e4e4e7; margin-top: 48px; padding: 28px 24px; text-align: center; font-size: 13px; color: #71717a; }
    @media (max-width: 768px) {
      .nw-nav { display: none; }
      .nw-hero-card { grid-template-columns: 1fr; padding: 36px 24px; }
      .nw-hero h1 { font-size: 28px; }
      .nw-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .nw-grid { grid-template-columns: 1fr; }
      .nw-header-inner { padding: 12px 16px; }
      .nw-hero, .nw-section { padding: 0 16px; }
    }
  </style>
</head>
<body>
  <div id="promo-strip" class="nw-promo">2.000 TL üzeri tüm siparişlerde ücretsiz hızlı kargo ve 30 gün kolay iade</div>
  <header id="store-header" class="header nw-header">
    <div class="nw-header-inner">
      <div class="nw-brand">NORDIC WEAR</div>
      <nav class="nw-nav">
        <a href="#featured-products">Yeni Sezon</a>
        <a href="#featured-products">Dış Giyim</a>
        <a href="#featured-products">Triko</a>
        <a href="#featured-products">Aksesuar</a>
      </nav>
      <div class="nw-actions">
        <span class="nw-pill">Sepet (2)</span>
      </div>
    </div>
  </header>
  <main>
    <section id="hero-section" class="nw-hero">
      <div class="nw-hero-card">
        <div>
          <span class="nw-eyebrow">Sonbahar / Kış Koleksiyonu</span>
          <h1>Minimalist Çizgiler, Doğal Dokular</h1>
          <p>İskandinav tasarım anlayışıyla üretilen zamansız dış giyim ve kapsül gardırop parçalarını keşfedin.</p>
          <a href="#featured-products" class="nw-hero-btn">Koleksiyonu Keşfet</a>
        </div>
        <div class="nw-hero-visual">
          <div class="nw-hero-stat">%100 Merinos</div>
          <div class="nw-hero-sub">Sürdürülebilir yün &amp; organik pamuk seçkisi</div>
        </div>
      </div>
    </section>
    <section id="featured-products" class="nw-section">
      <div class="nw-section-head">
        <h2>Öne Çıkan Parçalar</h2>
        <span style="font-size:13px;color:#71717a;">12 ürün listeleniyor</span>
      </div>
      <div class="nw-grid">
        <article class="nw-card">
          <div class="nw-thumb" style="background:linear-gradient(135deg,#e4e4e7,#f4f4f5);">Yün Kaşe Kaban</div>
          <div class="nw-card-body">
            <div class="nw-cat">Dış Giyim</div>
            <h3 class="nw-title">Oslo Kruvaze Kaban</h3>
            <div class="nw-price">4.890 TL</div>
          </div>
        </article>
        <article class="nw-card">
          <div class="nw-thumb" style="background:linear-gradient(135deg,#d6d3d1,#f5f5f4);">Balıkçı Yaka Triko</div>
          <div class="nw-card-body">
            <div class="nw-cat">Triko</div>
            <h3 class="nw-title">Bergen Merinos Kazak</h3>
            <div class="nw-price">2.190 TL</div>
          </div>
        </article>
        <article class="nw-card">
          <div class="nw-thumb" style="background:linear-gradient(135deg,#cbd5e1,#f1f5f9);">Oversize Gömlek</div>
          <div class="nw-card-body">
            <div class="nw-cat">Üst Giyim</div>
            <h3 class="nw-title">Malmö Poplin Gömlek</h3>
            <div class="nw-price">1.540 TL</div>
          </div>
        </article>
        <article class="nw-card">
          <div class="nw-thumb" style="background:linear-gradient(135deg,#e2e8f0,#f8fafc);">Deri Tote Çanta</div>
          <div class="nw-card-body">
            <div class="nw-cat">Aksesuar</div>
            <h3 class="nw-title">Kopenhag Günlük Çanta</h3>
            <div class="nw-price">3.290 TL</div>
          </div>
        </article>
      </div>
    </section>
  </main>
  <footer id="store-footer" class="nw-footer">
    © 2026 Nordic Wear Demo Storefront — Campaign Agent Studio Preview
  </footer>
</body>
</html>`,
  },
  {
    id: 'volt-tech',
    name: 'VoltTech — Teknoloji Mağazası',
    html: `<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VoltTech — Teknoloji Mağazası</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; scrollbar-width: none; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
    .vt-promo { background: #2563eb; color: #ffffff; text-align: center; padding: 9px 16px; font-size: 12px; font-weight: 600; }
    .vt-header { background: #0f172a; color: #f8fafc; position: sticky; top: 0; z-index: 20; }
    .vt-header-inner { max-width: 1180px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .vt-brand { font-size: 20px; font-weight: 800; letter-spacing: -0.4px; color: #38bdf8; }
    .vt-nav { display: flex; gap: 22px; font-size: 14px; color: #cbd5e1; }
    .vt-nav a { color: inherit; text-decoration: none; }
    .vt-badge { background: rgba(56, 189, 248, 0.16); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    .vt-hero { max-width: 1180px; margin: 28px auto; padding: 0 24px; }
    .vt-hero-card { background: linear-gradient(135deg, #0f172a 0%, #1e293b 65%, #1d4ed8 100%); color: #ffffff; border-radius: 20px; padding: 56px 44px; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
    .vt-hero h1 { margin: 0 0 12px 0; font-size: 38px; line-height: 1.15; font-weight: 800; }
    .vt-hero p { margin: 0 0 24px 0; color: #cbd5e1; font-size: 15px; max-width: 520px; line-height: 1.6; }
    .vt-btn { display: inline-block; background: #38bdf8; color: #0f172a; padding: 12px 22px; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; }
    .vt-chip { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); padding: 20px 24px; border-radius: 16px; min-width: 220px; text-align: center; }
    .vt-section { max-width: 1180px; margin: 32px auto; padding: 0 24px; }
    .vt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .vt-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .vt-thumb { height: 140px; border-radius: 10px; background: linear-gradient(135deg, #e0f2fe, #eff6ff); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #1d4ed8; font-size: 13px; }
    .vt-card h3 { margin: 0; font-size: 15px; font-weight: 700; }
    .vt-spec { font-size: 12px; color: #64748b; }
    .vt-price { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: auto; }
    .vt-footer { border-top: 1px solid #e2e8f0; background: #ffffff; margin-top: 48px; padding: 24px; text-align: center; font-size: 13px; color: #64748b; }
    @media (max-width: 768px) {
      .vt-nav { display: none; }
      .vt-hero-card { flex-direction: column; align-items: flex-start; padding: 36px 24px; }
      .vt-hero h1 { font-size: 28px; }
      .vt-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .vt-grid { grid-template-columns: 1fr; }
      .vt-hero, .vt-section { padding: 0 16px; }
    }
  </style>
</head>
<body>
  <div id="promo-strip" class="vt-promo">Seçili ses ve masaüstü ekipmanlarında 12 aya varan taksit fırsatı</div>
  <header id="store-header" class="header vt-header">
    <div class="vt-header-inner">
      <div class="vt-brand">VoltTech</div>
      <nav class="vt-nav">
        <a href="#featured-products">Ses Sistemleri</a>
        <a href="#featured-products">Klavye &amp; Mouse</a>
        <a href="#featured-products">Monitörler</a>
        <a href="#featured-products">Aksesuar</a>
      </nav>
      <div class="vt-badge">Sepet: 1 Ürün</div>
    </div>
  </header>
  <main>
    <section id="hero-section" class="vt-hero">
      <div class="vt-hero-card">
        <div>
          <h1>Çalışma Masanı Yeni Nesil Donanımla Güçlendir</h1>
          <p>Düşük gecikmeli kablosuz kulaklıklar, hot-swap mekanik klavyeler ve USB-C hub çözümleri stokta.</p>
          <a href="#featured-products" class="vt-btn">Fırsatları İncele</a>
        </div>
        <div class="vt-chip">
          <div style="font-size:28px;font-weight:800;">24 Saat</div>
          <div style="font-size:13px;color:#cbd5e1;margin-top:4px;">Aynı gün kargo avantajı</div>
        </div>
      </div>
    </section>
    <section id="featured-products" class="vt-section">
      <h2 style="margin:0 0 18px 0;font-size:22px;">Çok Satan Donanımlar</h2>
      <div class="vt-grid">
        <article class="vt-card">
          <div class="vt-thumb">ANC Studio Kulaklık</div>
          <h3>VoltPulse Pro ANC</h3>
          <div class="vt-spec">45 saat pil • Hi-Res Audio</div>
          <div class="vt-price">5.490 TL</div>
        </article>
        <article class="vt-card">
          <div class="vt-thumb">75% Mekanik Klavye</div>
          <h3>KeyForge K75 Wireless</h3>
          <div class="vt-spec">Alüminyum gövde • Hot-Swap</div>
          <div class="vt-price">3.790 TL</div>
        </article>
        <article class="vt-card">
          <div class="vt-thumb">4K USB-C Monitör</div>
          <h3>VisionAir 27&quot; IPS</h3>
          <div class="vt-spec">90W PD • %99 DCI-P3</div>
          <div class="vt-price">14.990 TL</div>
        </article>
        <article class="vt-card">
          <div class="vt-thumb">GaN 100W Şarj</div>
          <h3>ChargeCore Trio GaN</h3>
          <div class="vt-spec">3 Port USB-C • Kompakt</div>
          <div class="vt-price">1.690 TL</div>
        </article>
      </div>
    </section>
  </main>
  <footer id="store-footer" class="vt-footer">
    © 2026 VoltTech Demo Storefront — Campaign Agent Studio Preview
  </footer>
</body>
</html>`,
  },
  {
    id: 'flow-metric',
    name: 'FlowMetric — SaaS Landing',
    html: `<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FlowMetric — SaaS Landing</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; scrollbar-width: none; }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
    .fm-promo { background: #ecfeff; color: #0e7490; border-bottom: 1px solid #cffafe; text-align: center; padding: 8px 16px; font-size: 12px; font-weight: 600; }
    .fm-header { background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 20; }
    .fm-header-inner { max-width: 1120px; margin: 0 auto; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .fm-brand { font-size: 19px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .fm-dot { width: 10px; height: 10px; border-radius: 3px; background: linear-gradient(135deg, #06b6d4, #6366f1); display: inline-block; }
    .fm-nav { display: flex; gap: 22px; font-size: 14px; color: #475569; font-weight: 500; }
    .fm-nav a { color: inherit; text-decoration: none; }
    .fm-cta-sm { background: #0f172a; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; }
    .fm-hero { max-width: 1120px; margin: 36px auto; padding: 0 24px; text-align: center; }
    .fm-hero-box { background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%); border: 1px solid #e2e8f0; border-radius: 24px; padding: 56px 32px; }
    .fm-hero h1 { margin: 0 auto 14px auto; max-width: 680px; font-size: 40px; line-height: 1.15; font-weight: 800; letter-spacing: -0.9px; }
    .fm-hero p { margin: 0 auto 24px auto; max-width: 560px; font-size: 16px; line-height: 1.6; color: #475569; }
    .fm-btn-primary { display: inline-block; background: linear-gradient(135deg, #0891b2, #4f46e5); color: #ffffff; padding: 13px 26px; border-radius: 10px; font-weight: 700; font-size: 14px; text-decoration: none; }
    .fm-section { max-width: 1120px; margin: 36px auto; padding: 0 24px; }
    .fm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .fm-plan { border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; background: #ffffff; }
    .fm-plan.highlight { border-color: #6366f1; box-shadow: 0 12px 30px -10px rgba(99, 102, 241, 0.2); }
    .fm-plan h3 { margin: 0 0 8px 0; font-size: 17px; }
    .fm-price { font-size: 28px; font-weight: 800; margin: 8px 0 12px 0; }
    .fm-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin: 0; }
    .fm-footer { border-top: 1px solid #e2e8f0; margin-top: 48px; padding: 24px; text-align: center; font-size: 13px; color: #64748b; }
    @media (max-width: 768px) {
      .fm-nav { display: none; }
      .fm-hero h1 { font-size: 28px; }
      .fm-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .fm-hero, .fm-section { padding: 0 16px; }
      .fm-hero-box { padding: 36px 20px; }
    }
  </style>
</head>
<body>
  <div id="promo-strip" class="fm-promo">FlowMetric v2.4 yayında — Yıllık planlarda 2 ay ücretsiz kullanım</div>
  <header id="store-header" class="header fm-header">
    <div class="fm-header-inner">
      <div class="fm-brand"><span class="fm-dot"></span> FlowMetric</div>
      <nav class="fm-nav">
        <a href="#featured-products">Özellikler</a>
        <a href="#featured-products">Fiyatlandırma</a>
        <a href="#featured-products">Entegrasyonlar</a>
      </nav>
      <a href="#featured-products" class="fm-cta-sm">Ücretsiz Dene</a>
    </div>
  </header>
  <main>
    <section id="hero-section" class="fm-hero">
      <div class="fm-hero-box">
        <h1>Ürün Analitiği ve Dönüşüm Hunileri Tek Panelde</h1>
        <p>Ekiplerin kullanıcı davranışlarını gerçek zamanlı izleyip dakikalar içinde A/B deneyleri kurgulamasını sağlayan modern SaaS altyapısı.</p>
        <a href="#featured-products" class="fm-btn-primary">14 Gün Ücretsiz Başla</a>
      </div>
    </section>
    <section id="featured-products" class="fm-section">
      <div class="fm-grid">
        <div class="fm-plan">
          <h3>Starter</h3>
          <div class="fm-price">$0 <span style="font-size:13px;font-weight:500;color:#64748b;">/ay</span></div>
          <p class="fm-desc">Aylık 50K event takibi, temel huni raporları ve ekip içi paylaşım.</p>
        </div>
        <div class="fm-plan highlight">
          <h3>Growth</h3>
          <div class="fm-price">$49 <span style="font-size:13px;font-weight:500;color:#64748b;">/ay</span></div>
          <p class="fm-desc">Sınırsız segmentasyon, kohort analizi ve webhook otomasyonları.</p>
        </div>
        <div class="fm-plan">
          <h3>Enterprise</h3>
          <div class="fm-price">$199 <span style="font-size:13px;font-weight:500;color:#64748b;">/ay</span></div>
          <p class="fm-desc">Özel veri ambarı senkronizasyonu, SSO ve SLA desteği.</p>
        </div>
      </div>
    </section>
  </main>
  <footer id="store-footer" class="fm-footer">
    © 2026 FlowMetric Demo Landing — Campaign Agent Studio Preview
  </footer>
</body>
</html>`,
  },
];

export const getMockStorefrontHtml = (storefrontId) => {
  const matched = MOCK_STOREFRONTS.find((store) => store.id === storefrontId);
  return (matched || MOCK_STOREFRONTS[0]).html;
};
