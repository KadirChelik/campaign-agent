import { rgbToHex, buildResponsiveCss } from './responsiveCss';

export { rgbToHex, buildResponsiveCss };

export const fontFamilies = [
  { name: 'Sistem Fontu', value: 'system-ui, -apple-system, sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { name: 'Times New', value: '"Times New Roman", Times, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Impact', value: 'Impact, Charcoal, sans-serif' },
];

export const fontFamilyHtml = fontFamilies
  .map(
    (f) =>
      `<div class="ca-dropdown-item ca-ff-item" data-value='${f.value}'><span style="font-family: ${f.value}">${f.name}</span></div>`
  )
  .join('');

export const numInput = (id) => `
    <div class="ca-num-wrapper">
        <input type="number" id="${id}" class="ca-number-input" step="1" min="0">
        <div class="ca-spinners">
            <span class="ca-spin-up"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></span>
            <span class="ca-spin-down"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        </div>
    </div>
`;

export const getToolbarCSS = () => `
        #ca-editor-toolbar {
            position: absolute;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px;
            padding: 8px 16px;
            display: flex; gap: 10px;
            z-index: 2147483647 !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            align-items: center; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif;
            visibility: hidden; opacity: 0; transition: opacity 0.25s ease-in-out;
            font-size: 10px;
            width: max-content;
            max-width: 90%;
            overflow-x: auto;
            overflow-y: hidden;
            flex-wrap: nowrap;
            justify-content: flex-start;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.3) transparent;
            cursor: move;
        }

        #ca-editor-toolbar::-webkit-scrollbar { height: 4px; }
        #ca-editor-toolbar::-webkit-scrollbar-track { background: transparent; border-radius: 4px; }
        #ca-editor-toolbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 4px; }

        #ca-editor-toolbar.ca-visible { visibility: visible; opacity: 1; }
        #ca-editor-toolbar * { flex-shrink: 0; }

        .ca-drag-handle { display: flex; align-items: center; justify-content: center; color: #475569; padding-right: 4px; cursor: move; }
        .ca-drag-handle:active { cursor: grabbing; }
        .ca-tool-group { display: flex; align-items: center; gap: 6px; }
        .ca-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.1); margin: 0 2px; }

        #ca-editor-toolbar button, .ca-icon-wrapper, .ca-dropdown-btn, input { cursor: pointer; }
        #ca-editor-toolbar button, .ca-icon-wrapper {
            background: transparent; border: none; color: #94a3b8; padding: 6px;
            border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        #ca-editor-toolbar button:hover { background: rgba(255,255,255,0.1); color: #fff; }
        #ca-delete-btn:hover { background: rgba(239, 68, 68, 0.2) !important; color: #ef4444 !important; }
        #ca-edit-btn:hover { background: rgba(59, 130, 246, 0.2) !important; color: #3b82f6 !important; }
        #ca-image-btn:hover { background: rgba(16, 185, 129, 0.2) !important; color: #10b981 !important; }

        #ca-editor-toolbar input[type="color"] {
            -webkit-appearance: none; border: none; width: 24px; height: 24px;
            border-radius: 50%; background: transparent; padding: 0;
        }
        #ca-editor-toolbar input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
        #ca-editor-toolbar input[type="color"]::-webkit-color-swatch { border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; }

        .ca-dropdown { position: relative; }
        .ca-dropdown-btn {
            background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important;
            padding: 6px 10px !important; color: #e2e8f0 !important; border-radius: 6px;
            display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 10px !important; white-space: nowrap;
        }
        .ca-dropdown-btn:hover { border-color: rgba(255,255,255,0.3) !important; }
        .ca-icon-only-btn { padding: 6px !important; gap: 0 !important; }

        .ca-dropdown-menu {
            display: none; flex-direction: column; gap: 2px; min-width: 140px;
            background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
            padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 2147483647; cursor: default;
        }
        .ca-dropdown-menu.show { display: flex !important; }

        .ca-scrollable-menu { max-height: 240px; overflow-y: auto; }
        .ca-scrollable-menu::-webkit-scrollbar { width: 4px; }
        .ca-scrollable-menu::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .ca-scrollable-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

        .ca-dropdown-item {
            padding: 8px 12px; border-radius: 6px; cursor: pointer; display: flex;
            align-items: center; justify-content: space-between; color: #cbd5e1; font-size: 10px; transition: background 0.2s, color 0.2s;
        }
        .ca-dropdown-item:hover { background: #3b82f6; color: #fff; }

        .ca-num-wrapper { position: relative; display: inline-flex; align-items: center; }
        .ca-number-input {
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0;
            border-radius: 6px; padding: 6px 20px 6px 10px;
            font-size: 10px; width: 60px; text-align: left; outline: none; transition: border 0.2s;
            -moz-appearance: textfield; cursor: text;
        }
        .ca-number-input::-webkit-outer-spin-button, .ca-number-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .ca-number-input:focus { border-color: #3b82f6; }

        .ca-spinners { position: absolute; right: 4px; display: flex; flex-direction: column; gap: 2px; }
        .ca-spinners span {
            cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center;
            padding: 1px; border-radius: 3px; transition: all 0.15s;
            user-select: none;
            -webkit-user-select: none;
        }
        .ca-spinners span:hover { color: #fff; background: rgba(255,255,255,0.15); }
        .ca-spinners svg { width: 10px; height: 10px; stroke: currentColor; stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        .ca-text-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 6px; padding: 6px 20px 6px 10px; font-size: 10px; width: 75px; outline: none; transition: border 0.2s; box-sizing: border-box; }
        .ca-text-input:focus { border-color: #3b82f6; }
        .ca-text-input option { background: #0f172a; color: #fff; }
        .ca-spacing-panel { display: flex; flex-direction: column; gap: 6px; padding: 4px; }
        .ca-spacing-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 10px; color: #94a3b8; }

        .ca-link-wrapper { display: flex; gap: 6px; padding: 4px; align-items: center; }
        .ca-link-wrapper input {
            background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white;
            padding: 8px; border-radius: 6px; width: 180px; font-size: 10px; outline: none; cursor: text;
        }
        .ca-link-wrapper input:focus { border-color: #3b82f6; }
        .ca-link-wrapper button { background: #3b82f6 !important; color: white !important; padding: 8px 12px !important; font-size: 10px; font-weight: bold; border-radius: 6px; }
        .ca-link-wrapper button:hover { background: #2563eb !important; }
        .ca-selected-element { outline: 2px solid #3b82f6 !important; outline-offset: 4px; border-radius: 2px; }
        .ca-selected-element[contenteditable="true"] { outline: 2px dashed #ef4444 !important; cursor: text; }
        #ca-timer-input::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
            opacity: 0.6;
            transition: 0.2s;
        }
        #ca-timer-input::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
        }
`;

export const getIframeCSS = () => `
        @keyframes caHoverGlow {
            0% { outline: 2px solid rgba(59, 130, 246, 0); outline-offset: -2px; }
            100% { outline: 4px solid rgba(59, 130, 246, 0.6); outline-offset: 2px; }
        }

        .ca-hover-element {
            animation: caHoverGlow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
            cursor: pointer !important;
        }

        .ca-selected-element {
            outline: 4px solid #2563eb !important;
            outline-offset: 2px !important;
            cursor: pointer;
            transition: none !important;
            animation: none !important;
        }

        .ca-selected-element[contenteditable="true"] {
            outline: 3px dashed #ef4444 !important;
            outline-offset: 3px !important;
            cursor: text;
        }

        .ca-nav-highlight {
            outline: 4px solid #ef4444 !important;
            outline-offset: 2px !important;
            background: rgba(239, 68, 68, 0.15) !important;
            transition: outline-color 0.2s ease !important;
        }
`;

export const getToolbarHTML = () => `
        <div class="ca-drag-handle" title="Sürükle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>
        <div class="ca-tool-group" id="ca-text-color-group" title="Metin Rengi"><input type="color" id="ca-color-picker"></div>
        <div class="ca-tool-group" id="ca-bg-group" title="Arka Plan Rengi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <input type="color" id="ca-bg-picker">
        </div>
        <div class="ca-divider"></div>

        <div class="ca-dropdown" id="ca-font-family-dropdown">
            <button class="ca-dropdown-btn" id="ca-font-family-btn" style="min-width: 110px;">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px;">Sistem Fontu</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="ca-dropdown-menu ca-scrollable-menu" id="ca-font-family-menu" style="min-width: 140px;">${fontFamilyHtml}</div>
        </div>

        <div class="ca-tool-group" id="ca-font-size-group" title="Yazı Boyutu (px)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
            ${numInput('ca-font-size-input')}
        </div>

        <div class="ca-dropdown" id="ca-weight-dropdown">
            <button class="ca-dropdown-btn" id="ca-weight-btn" style="min-width: 90px;">
                <span>Normal</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-weight-menu">
                <div class="ca-dropdown-item" data-value="400"><span>Normal</span></div>
                <div class="ca-dropdown-item" data-value="500"><span>Orta</span></div>
                <div class="ca-dropdown-item" data-value="600"><span>Yarı Kalın</span></div>
                <div class="ca-dropdown-item" data-value="700"><span>Kalın</span></div>
            </div>
        </div>

        <div class="ca-dropdown" id="ca-align-dropdown">
            <button class="ca-dropdown-btn ca-icon-only-btn" id="ca-align-btn" title="Hizalama">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-align-menu" style="min-width: 120px;">
                <div class="ca-dropdown-item" data-value="left"><span>Sola Yasla</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg></div>
                <div class="ca-dropdown-item" data-value="center"><span>Ortala</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg></div>
                <div class="ca-dropdown-item" data-value="right"><span>Sağa Yasla</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg></div>
            </div>
        </div>

        <div class="ca-divider"></div>
        <div class="ca-dropdown" id="ca-size-dropdown">
            <button class="ca-icon-only-btn" id="ca-size-btn" title="Genişlik & Yükseklik (W/H)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-size-menu" style="min-width: 140px;">
                <div class="ca-spacing-panel">
                    <div class="ca-spacing-row">
                        <span title="Genişlik (örn: 100%, 250px)">Genişlik</span>
                        <div class="ca-num-wrapper">
                            <input type="text" id="ca-width-input" class="ca-text-input ca-size-input" placeholder="auto">
                            <div class="ca-spinners"><span class="ca-spin-up"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></span><span class="ca-spin-down"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></span></div>
                        </div>
                    </div>
                    <div class="ca-spacing-row">
                        <span title="Yükseklik (örn: 100%, 250px)">Yükseklik</span>
                        <div class="ca-num-wrapper">
                            <input type="text" id="ca-height-input" class="ca-text-input ca-size-input" placeholder="auto">
                            <div class="ca-spinners"><span class="ca-spin-up"><svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg></span><span class="ca-spin-down"><svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="ca-tool-group" title="Köşe Yuvarlama (px)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6" ry="6"></rect></svg>
            ${numInput('ca-radius-input')}
        </div>

        <div class="ca-dropdown" id="ca-padding-dropdown">
            <button class="ca-icon-only-btn" id="ca-padding-btn" title="İç Boşluk (Padding)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="8" y="8" width="8" height="8" rx="1" ry="1"></rect></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-padding-menu" style="min-width: 140px;">
                <div class="ca-spacing-panel">
                    <div class="ca-spacing-row"><span>Üst</span>${numInput('ca-pt')}</div>
                    <div class="ca-spacing-row"><span>Sağ</span>${numInput('ca-pr')}</div>
                    <div class="ca-spacing-row"><span>Alt</span>${numInput('ca-pb')}</div>
                    <div class="ca-spacing-row"><span>Sol</span>${numInput('ca-pl')}</div>
                </div>
            </div>
        </div>

        <div class="ca-dropdown" id="ca-margin-dropdown">
            <button class="ca-icon-only-btn" id="ca-margin-btn" title="Dış Boşluk (Margin)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-dasharray="2 2"></rect><rect x="8" y="8" width="8" height="8" rx="1" ry="1"></rect></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-margin-menu" style="min-width: 140px;">
                <div class="ca-spacing-panel">
                    <div class="ca-spacing-row"><span>Üst</span>${numInput('ca-mt')}</div>
                    <div class="ca-spacing-row"><span>Sağ</span>${numInput('ca-mr')}</div>
                    <div class="ca-spacing-row"><span>Alt</span>${numInput('ca-mb')}</div>
                    <div class="ca-spacing-row"><span>Sol</span>${numInput('ca-ml')}</div>
                </div>
            </div>
        </div>

        <div class="ca-divider"></div>

        <button id="ca-edit-btn" title="Metni Düzenle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>

        <button id="ca-image-btn" title="Görseli Değiştir" style="display:none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>

        <div class="ca-dropdown" id="ca-link-dropdown">
            <button class="ca-icon-only-btn" id="ca-link-btn" title="Link Ekle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-link-menu" style="min-width: 260px; right: 0; left: auto; transform: none;">
                <div class="ca-link-wrapper">
                    <input type="text" id="ca-link-input" placeholder="https://example.com">
                    <button id="ca-link-save-btn">Ekle</button>
                </div>
            </div>
        </div>

        <button id="ca-delete-btn" title="Elementi Sil">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>

        <button id="ca-close-btn" title="Editörü Kapat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="ca-dropdown" id="ca-timer-dropdown" style="display:none;">
            <button class="ca-dropdown-btn ca-icon-only-btn" id="ca-timer-btn" title="Sayaç Ayarları">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-timer-menu" style="min-width: 180px; padding: 12px; gap: 12px;">
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <label style="color:#94a3b8; font-size:10px;">Bitiş Tarihi</label>
                    <input type="datetime-local" id="ca-timer-input" class="ca-text-input" style="width: 100%;">
                </div>
                <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
                    <label style="color:#94a3b8; font-size:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:4px;">Gösterilecek Birimler</label>
                    <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer; font-size:11px;"><input type="checkbox" id="ca-chk-d"> Gün</label>
                    <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer; font-size:11px;"><input type="checkbox" id="ca-chk-h"> Saat</label>
                    <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer; font-size:11px;"><input type="checkbox" id="ca-chk-m"> Dakika</label>
                    <label style="display:flex; align-items:center; gap:6px; color:#cbd5e1; cursor:pointer; font-size:11px;"><input type="checkbox" id="ca-chk-s"> Saniye</label>
                </div>
            </div>
        </div>
        <div class="ca-dropdown" id="ca-earlet-pos-dropdown" style="display:none;">
            <button class="ca-dropdown-btn ca-icon-only-btn" id="ca-earlet-pos-btn" title="Kulakçık Konumu ve Kaydırma">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"></path><path d="M20 8v8"></path><path d="M4 8v8"></path><path d="M8 4h8"></path><path d="M8 20h8"></path><circle cx="19" cy="19" r="1"></circle></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-earlet-pos-menu" style="min-width: 180px; padding: 12px; gap: 12px;">
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <label style="color:#94a3b8; font-size:10px;">Ekrana Sabitleme</label>
                    <select id="ca-epos-select" class="ca-text-input" style="width:100%; cursor:pointer;">
                        <option value="bottom-right">↘️ Sağ Alt</option>
                        <option value="bottom-left">↙️ Sol Alt</option>
                        <option value="top-right">↗️ Sağ Üst</option>
                        <option value="top-left">↖️ Sol Üst</option>
                        <option value="center-right">➡️ Sağ Orta</option>
                        <option value="center-left">⬅️ Sol Orta</option>
                    </select>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <label style="color:#94a3b8; font-size:10px;">Hassas Ayar (Uzaklık px)</label>
                    <div style="display:flex; gap:8px;">
                        <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
                            <span style="font-size:9px; color:#64748b;">X (Yatay)</span>
                            <input type="number" id="ca-epos-x" class="ca-text-input" style="width:100%; padding-right:8px;" value="20">
                        </div>
                        <div style="flex:1; display:flex; flex-direction:column; gap:2px;">
                            <span style="font-size:9px; color:#64748b;">Y (Dikey)</span>
                            <input type="number" id="ca-epos-y" class="ca-text-input" style="width:100%; padding-right:8px;" value="20">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="ca-dropdown" id="ca-position-dropdown">
            <button class="ca-dropdown-btn ca-icon-only-btn" id="ca-position-btn" title="Konum & Yerleşim (Sayfa İçi)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </button>
            <div class="ca-dropdown-menu" id="ca-position-menu" style="min-width: 250px; padding: 12px; gap: 12px;">
                <div style="display:flex; flex-direction:column; gap:6px;">
                    <label style="color:#94a3b8; font-size:10px;">Görünüm Modu</label>
                    <select id="ca-pos-mode" class="ca-text-input" style="width:100%; cursor:pointer;">
                        <option value="fixed-top">📌 Ekrana Sabit - Üstte</option>
                        <option value="fixed-bottom">📌 Ekrana Sabit - Altta</option>
                        <option value="inline">🎯 Sayfa İçi (Inline)</option>
                    </select>
                </div>
                <div id="ca-inline-settings" style="display:none; flex-direction:column; gap:8px; margin-top:6px; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
                    <label style="color:#94a3b8; font-size:10px;">Hedef Element (Sayfadan Seç)</label>
                    <div style="display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.2); padding:6px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; gap:4px;">
                            <input type="text" id="ca-pos-target" class="ca-text-input" style="flex:1; font-family:monospace; font-size:9px; color:#a78bfa;" placeholder="#store-header vb.">
                            <button id="ca-picker-btn" style="background:#3b82f6; border:none; border-radius:4px; color:#fff; cursor:pointer; width:30px; display:flex; align-items:center; justify-content:center; transition:0.2s;" title="Sayfadan Seç">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19 12c0-3.86-3.14-7-7-7"></path><path d="M5 12c0 3.86 3.14 7 7 7"></path></svg>
                            </button>
                        </div>
                        <div style="display:flex; gap:4px;">
                            <button id="ca-parent-btn" style="flex:1; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.1); border-radius:4px; color:#e2e8f0; cursor:pointer; padding:6px 0; font-size:10px; display:flex; align-items:center; justify-content:center; gap:4px; transition:0.2s;" title="Bir dış (üst) kutuya genişle">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg> Dışa Çık
                            </button>
                            <button id="ca-child-btn" style="flex:1; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.1); border-radius:4px; color:#e2e8f0; cursor:pointer; padding:6px 0; font-size:10px; display:flex; align-items:center; justify-content:center; gap:4px; transition:0.2s;" title="Bir iç (alt) kutuya daral">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg> İçe Gir
                            </button>
                        </div>
                    </div>
                    <label style="color:#94a3b8; font-size:10px; margin-top:2px;">Konumlandırma Türü</label>
                    <select id="ca-pos-relation" class="ca-text-input" style="width:100%; cursor:pointer;">
                        <option value="beforebegin">🔺 Dışına (Üstüne)</option>
                        <option value="afterend">🔻 Dışına (Altına)</option>
                        <option value="afterbegin">📥 İçine (En Başına)</option>
                        <option value="beforeend">📤 İçine (En Sonuna)</option>
                    </select>
                </div>
                <button id="ca-pos-apply-btn" style="background:#10b981; border:none; border-radius:6px; color:#fff; cursor:pointer; padding:8px; font-size:11px; font-weight:bold; margin-top:4px; width:100%; transition:0.2s;">Uygula & Yenile</button>
            </div>
        </div>
`;
