import { rgbToHex, buildResponsiveCss } from './responsiveCss';
import { getToolbarCSS, getIframeCSS, getToolbarHTML, fontFamilies } from './editorToolbar';
import { compressImageToDataUrl } from '../services/api';

export const initEditorEngine = (currentSessionId) => {
  const iframe = document.querySelector('iframe');
  if (!iframe || !iframe.contentDocument) return;
  const doc = iframe.contentDocument;
  const mainDoc = document;

  const existingToolbar = mainDoc.getElementById('ca-editor-toolbar');
  if (existingToolbar) existingToolbar.remove();
  const existingStyle = mainDoc.getElementById('ca-toolbar-style');
  if (existingStyle) existingStyle.remove();

  mainDoc.querySelectorAll('.ca-dropdown-menu').forEach((el) => el.remove());

  const sessionId = currentSessionId;
  window.__ca_history = window.__ca_history || {};
  window.__ca_historyIndex = window.__ca_historyIndex || {};

  if (!window.__ca_history[sessionId]) {
    window.__ca_history[sessionId] = [];
    window.__ca_historyIndex[sessionId] = -1;
  }

  let activeElement = null;
  let isDragging = false;
  let savedLeft = null;
  let savedTop = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let saveTimeoutId = null;

  const saveState = (immediate = false, syncToParent = true) => {
    const executeSave = () => {
      const clone = doc.body.cloneNode(true);
      const selected = clone.querySelectorAll('.ca-selected-element');
      selected.forEach((el) => {
        el.classList.remove('ca-selected-element');
        if (el.getAttribute('contenteditable') === 'true') {
          el.removeAttribute('contenteditable');
        }
      });

      const agentContainer = clone.querySelector('[id^="ca-widget-"]');
      if (syncToParent && agentContainer) {
        const inner = agentContainer.innerHTML;
        const cStyle = agentContainer.getAttribute('style') || '';
        window.parent.postMessage(
          {
            type: 'PATCH_JS_CODE',
            innerHtml: inner,
            containerStyle: cStyle,
            fullHtml: agentContainer.outerHTML,
          },
          '*'
        );
      }

      const html = clone.innerHTML;
      let hist = window.__ca_history[sessionId];
      const idx = window.__ca_historyIndex[sessionId];

      if (idx >= 0 && hist[idx] === html) return;

      hist = hist.slice(0, idx + 1);
      hist.push(html);
      window.__ca_history[sessionId] = hist;
      window.__ca_historyIndex[sessionId] = hist.length - 1;
    };

    if (immediate === true) {
      clearTimeout(saveTimeoutId);
      executeSave();
    } else {
      clearTimeout(saveTimeoutId);
      saveTimeoutId = setTimeout(executeSave, 300);
    }
  };

  const restoreState = () => {
    const hist = window.__ca_history[sessionId];
    const idx = window.__ca_historyIndex[sessionId];
    if (!hist || typeof hist[idx] === 'undefined') return;

    const tb = mainDoc.getElementById('ca-editor-toolbar');
    if (tb) tb.classList.remove('ca-visible');
    activeElement = null;
    doc.body.innerHTML = hist[idx];

    const clone = doc.body.cloneNode(true);
    const agentContainer = clone.querySelector('[id^="ca-widget-"]');
    if (agentContainer) {
      window.parent.postMessage(
        {
          type: 'PATCH_JS_CODE',
          innerHtml: agentContainer.innerHTML,
          containerStyle: agentContainer.getAttribute('style') || '',
          fullHtml: agentContainer.outerHTML,
        },
        '*'
      );
    }
  };

  const undo = () => {
    if (window.__ca_historyIndex[sessionId] > 0) {
      window.__ca_historyIndex[sessionId]--;
      restoreState();
    }
  };

  const redo = () => {
    const hist = window.__ca_history[sessionId] || [];
    if (window.__ca_historyIndex[sessionId] < hist.length - 1) {
      window.__ca_historyIndex[sessionId]++;
      restoreState();
    }
  };

  const handleKeydown = (e) => {
    if (!iframe.contentWindow || !iframe.contentWindow.__CA_EDIT_MODE__) return;

    const isZ = e.key.toLowerCase() === 'z';
    const isY = e.key.toLowerCase() === 'y';
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;

    if (isCmdOrCtrl && isZ) {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) redo();
      else undo();
    } else if (isCmdOrCtrl && isY) {
      e.preventDefault();
      e.stopPropagation();
      redo();
    }
  };

  if (mainDoc._caKeydownListener) {
    mainDoc.removeEventListener('keydown', mainDoc._caKeydownListener);
  }
  if (doc._caKeydownListener) {
    doc.removeEventListener('keydown', doc._caKeydownListener);
  }

  mainDoc._caKeydownListener = handleKeydown;
  mainDoc.addEventListener('keydown', handleKeydown);

  doc._caKeydownListener = handleKeydown;
  doc.addEventListener('keydown', handleKeydown);

  const style = mainDoc.createElement('style');
  style.id = 'ca-toolbar-style';
  style.innerHTML = getToolbarCSS();
  mainDoc.head.appendChild(style);

  const existingIframeStyle = doc.getElementById('ca-iframe-editor-style');
  if (!existingIframeStyle) {
    const iframeStyle = doc.createElement('style');
    iframeStyle.id = 'ca-iframe-editor-style';
    iframeStyle.innerHTML = getIframeCSS();
    doc.head.appendChild(iframeStyle);
  }

  const toolbar = mainDoc.createElement('div');
  toolbar.id = 'ca-editor-toolbar';
  toolbar.innerHTML = getToolbarHTML();

  const ideWindow = mainDoc.querySelector('.ide-window');
  if (ideWindow) {
    ideWindow.style.position = 'relative';
    ideWindow.appendChild(toolbar);
  } else {
    mainDoc.body.appendChild(toolbar);
  }

  const renderResponsiveStyles = () => {
    const elements = doc.querySelectorAll('[data-ca-styles]');
    const entries = [];

    elements.forEach((element) => {
      const id = element.id;
      if (!id) return;
      try {
        const rawAttr = element.getAttribute('data-ca-styles');
        if (rawAttr && rawAttr.startsWith('{')) {
          entries.push({ id, styles: JSON.parse(rawAttr) });
        }
      } catch {
        // ignore invalid JSON attribute
      }
    });

    const cssText = buildResponsiveCss(entries);
    const agentContainer = doc.querySelector('[id^="ca-widget-"]');
    if (agentContainer) {
      let styleTag = agentContainer.querySelector('.ca-visual-edits');
      if (!cssText.trim()) {
        if (styleTag) styleTag.remove();
        return;
      }
      if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.className = 'ca-visual-edits';
        agentContainer.prepend(styleTag);
      }
      styleTag.innerHTML = cssText;
    }
  };

  setTimeout(() => {
    renderResponsiveStyles();
    saveState(false, false);
  }, 300);

  const applyStyle = (el, prop, val, shouldSave = true) => {
    if (!el) return;
    const iframeEl = document.querySelector('iframe');
    const currentWidth = iframeEl ? iframeEl.clientWidth : window.innerWidth;
    const deviceMode = currentWidth <= 480 ? 'mobile' : currentWidth <= 768 ? 'tablet' : 'desktop';

    if (!el.id) el.id = 'ca-el-' + Math.random().toString(36).slice(2, 11);

    let stylesObj = {};
    try {
      const rawAttr = el.getAttribute('data-ca-styles');
      if (rawAttr && rawAttr.startsWith('{')) {
        stylesObj = JSON.parse(rawAttr);
      }
    } catch {
      // ignore invalid JSON attribute
    }

    if (!stylesObj[deviceMode]) stylesObj[deviceMode] = {};
    stylesObj[deviceMode][prop] = val;
    el.setAttribute('data-ca-styles', JSON.stringify(stylesObj));

    renderResponsiveStyles();
    if (shouldSave) saveState();
  };

  toolbar.addEventListener('mousedown', (e) => {
    if (e.target.closest('button, input, select, .ca-dropdown-item, .ca-spinners')) return;

    isDragging = true;
    iframe.style.pointerEvents = 'none';
    mainDoc.body.style.userSelect = 'none';

    const rect = toolbar.getBoundingClientRect();
    const parentRect = toolbar.parentElement.getBoundingClientRect();

    if (savedLeft === null) {
      toolbar.style.transform = 'none';
      toolbar.style.left = rect.left - parentRect.left + 'px';
      toolbar.style.top = rect.top - parentRect.top + 'px';
      toolbar.style.bottom = 'auto';
    }
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
  });

  if (mainDoc._caMousemoveListener) {
    mainDoc.removeEventListener('mousemove', mainDoc._caMousemoveListener);
  }
  if (mainDoc._caMouseupListener) {
    mainDoc.removeEventListener('mouseup', mainDoc._caMouseupListener);
  }

  mainDoc._caMousemoveListener = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const parentRect = toolbar.parentElement.getBoundingClientRect();
    savedLeft = e.clientX - dragOffsetX - parentRect.left;
    savedTop = e.clientY - dragOffsetY - parentRect.top;
    toolbar.style.left = savedLeft + 'px';
    toolbar.style.top = savedTop + 'px';
    toolbar.style.bottom = 'auto';
  };

  mainDoc._caMouseupListener = () => {
    if (isDragging) {
      isDragging = false;
      iframe.style.pointerEvents = 'auto';
      mainDoc.body.style.userSelect = '';
    }
  };

  mainDoc.addEventListener('mousemove', mainDoc._caMousemoveListener);
  mainDoc.addEventListener('mouseup', mainDoc._caMouseupListener);

  if (mainDoc._caSpinnerListener) {
    mainDoc.removeEventListener('click', mainDoc._caSpinnerListener);
    mainDoc.removeEventListener('wheel', mainDoc._caWheelListener);
  }

  const handleValueAdjust = (wrapper, isUp) => {
    const numInput = wrapper.querySelector('.ca-number-input');
    const sizeInput = wrapper.querySelector('.ca-size-input');

    if (numInput) {
      if (isUp) numInput.stepUp(2);
      else numInput.stepDown(2);
      numInput.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (sizeInput) {
      let val = sizeInput.value;
      if (!val || val === 'auto') val = '100px';
      const match = val.match(/^(-?[\d.]+)(.*)$/);
      if (match) {
        let num = parseFloat(match[1]);
        const unit = match[2] || 'px';
        num += isUp ? 2 : -2;
        sizeInput.value = num + unit;
        sizeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  mainDoc._caSpinnerListener = (e) => {
    const upBtn = e.target.closest('.ca-spin-up');
    const downBtn = e.target.closest('.ca-spin-down');
    if (upBtn || downBtn) {
      e.stopPropagation();
      const wrapper = (upBtn || downBtn).closest('.ca-num-wrapper');
      handleValueAdjust(wrapper, !!upBtn);
    }
  };

  mainDoc._caWheelListener = (e) => {
    const wrapper = e.target.closest('.ca-num-wrapper');
    if (wrapper) {
      e.preventDefault();
      handleValueAdjust(wrapper, e.deltaY < 0);
    }
  };

  mainDoc.addEventListener('click', mainDoc._caSpinnerListener);
  mainDoc.addEventListener('wheel', mainDoc._caWheelListener, { passive: false });

  const closeAllDropdowns = () => {
    mainDoc.querySelectorAll('.ca-dropdown-menu.show').forEach((menu) => {
      menu.classList.remove('show');
      const originalParentId = menu.getAttribute('data-parent-id');
      if (originalParentId) {
        const parent = mainDoc.getElementById(originalParentId);
        if (parent) parent.appendChild(menu);
      }
    });

    if (doc) {
      doc.querySelectorAll('.ca-nav-highlight').forEach((el) => el.classList.remove('ca-nav-highlight'));
    }
  };

  if (mainDoc._caOutsideClickListener) {
    mainDoc.removeEventListener('click', mainDoc._caOutsideClickListener, true);
  }
  mainDoc._caOutsideClickListener = (e) => {
    if (!e.target.closest('.ca-dropdown-menu') && !e.target.closest('.ca-dropdown-btn')) {
      closeAllDropdowns();
    }
  };
  mainDoc.addEventListener('click', mainDoc._caOutsideClickListener, true);

  toolbar.addEventListener('scroll', closeAllDropdowns);

  const setupDropdown = (btnId, menuId) => {
    const menu = mainDoc.getElementById(menuId);
    const btn = mainDoc.getElementById(btnId);
    if (!menu || !btn) return;
    const parent = menu.parentElement;
    parent.id = parent.id || 'ca-dropdown-wrapper-' + btnId;
    menu.setAttribute('data-parent-id', parent.id);

    btn.onclick = (e) => {
      e.stopPropagation();
      const isShowing = menu.classList.contains('show');
      closeAllDropdowns();

      if (!isShowing) {
        menu.classList.add('show');
        mainDoc.body.appendChild(menu);

        const rect = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = rect.bottom + 8 + 'px';
        menu.style.left = rect.left + rect.width / 2 + 'px';
        menu.style.transform = 'translateX(-50%)';
        menu.style.zIndex = '2147483647';

        setTimeout(() => {
          const menuRect = menu.getBoundingClientRect();
          if (menuRect.right > window.innerWidth) {
            menu.style.left = window.innerWidth - menuRect.width - 10 + 'px';
            menu.style.transform = 'none';
          } else if (menuRect.left < 0) {
            menu.style.left = '10px';
            menu.style.transform = 'none';
          }
        }, 0);

        if (menuId === 'ca-link-menu') {
          const input = menu.querySelector('input');
          if (input) input.focus();
        }
      }
    };
  };

  setupDropdown('ca-font-family-btn', 'ca-font-family-menu');
  setupDropdown('ca-weight-btn', 'ca-weight-menu');
  setupDropdown('ca-align-btn', 'ca-align-menu');
  setupDropdown('ca-padding-btn', 'ca-padding-menu');
  setupDropdown('ca-margin-btn', 'ca-margin-menu');
  setupDropdown('ca-link-btn', 'ca-link-menu');
  setupDropdown('ca-size-btn', 'ca-size-menu');
  setupDropdown('ca-timer-btn', 'ca-timer-menu');
  setupDropdown('ca-position-btn', 'ca-position-menu');

  let syncTimeoutId = null;
  const forceSyncToReact = (immediate = false) => {
    const executeSync = () => {
      const cloneDoc = doc.body.cloneNode(true);
      const agentContainer = cloneDoc.querySelector('[id^="ca-widget-"]');
      if (agentContainer) {
        agentContainer.classList.remove('ca-selected-element');
        agentContainer.removeAttribute('contenteditable');
        agentContainer.querySelectorAll('.ca-selected-element').forEach((el) => {
          el.classList.remove('ca-selected-element');
          el.removeAttribute('contenteditable');
        });
        const inner = agentContainer.innerHTML;
        const cStyle = agentContainer.getAttribute('style') || '';
        window.parent.postMessage(
          {
            type: 'PATCH_JS_CODE',
            innerHtml: inner,
            containerStyle: cStyle,
            fullHtml: agentContainer.outerHTML,
          },
          '*'
        );
      }
    };

    if (immediate === true) {
      clearTimeout(syncTimeoutId);
      executeSync();
    } else {
      clearTimeout(syncTimeoutId);
      syncTimeoutId = setTimeout(executeSync, 300);
    }
  };

  const ePosDropdown = mainDoc.getElementById('ca-earlet-pos-dropdown');
  const ePosSelect = mainDoc.getElementById('ca-epos-select');
  const ePosX = mainDoc.getElementById('ca-epos-x');
  const ePosY = mainDoc.getElementById('ca-epos-y');

  const applyLiveEarletPos = () => {
    const earlet = doc.getElementById('ca-widget-earlet-container');
    if (!earlet) return;

    const pos = ePosSelect.value;
    const x = ePosX.value + 'px';
    const y = ePosY.value + 'px';

    earlet.setAttribute('data-epos', pos);
    earlet.setAttribute('data-ex', ePosX.value);
    earlet.setAttribute('data-ey', ePosY.value);

    applyStyle(earlet, 'top', 'auto', false);
    applyStyle(earlet, 'bottom', 'auto', false);
    applyStyle(earlet, 'left', 'auto', false);
    applyStyle(earlet, 'right', 'auto', false);
    applyStyle(earlet, 'transform', 'none', false);

    if (pos === 'bottom-right') {
      applyStyle(earlet, 'bottom', y, false);
      applyStyle(earlet, 'right', x, false);
    } else if (pos === 'bottom-left') {
      applyStyle(earlet, 'bottom', y, false);
      applyStyle(earlet, 'left', x, false);
    } else if (pos === 'top-right') {
      applyStyle(earlet, 'top', y, false);
      applyStyle(earlet, 'right', x, false);
    } else if (pos === 'top-left') {
      applyStyle(earlet, 'top', y, false);
      applyStyle(earlet, 'left', x, false);
    } else if (pos === 'center-right') {
      applyStyle(earlet, 'top', '50%', false);
      applyStyle(earlet, 'right', x, false);
      applyStyle(earlet, 'transform', 'translateY(-50%)', false);
    } else if (pos === 'center-left') {
      applyStyle(earlet, 'top', '50%', false);
      applyStyle(earlet, 'left', x, false);
      applyStyle(earlet, 'transform', 'translateY(-50%)', false);
    } else if (pos === 'bottom-center') {
      applyStyle(earlet, 'bottom', y, false);
      applyStyle(earlet, 'left', '50%', false);
      applyStyle(earlet, 'transform', 'translateX(-50%)', false);
    } else if (pos === 'top-center') {
      applyStyle(earlet, 'top', y, false);
      applyStyle(earlet, 'left', '50%', false);
      applyStyle(earlet, 'transform', 'translateX(-50%)', false);
    }

    forceSyncToReact(true);
    saveState(true);
  };

  if (ePosSelect) ePosSelect.onchange = applyLiveEarletPos;
  if (ePosX) {
    ePosX.oninput = applyLiveEarletPos;
    ePosX.onchange = applyLiveEarletPos;
  }
  if (ePosY) {
    ePosY.oninput = applyLiveEarletPos;
    ePosY.onchange = applyLiveEarletPos;
  }

  setupDropdown('ca-earlet-pos-btn', 'ca-earlet-pos-menu');

  doc.addEventListener('mousedown', (e) => {
    if (!iframe.contentWindow.__CA_EDIT_MODE__) return;
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'button' || tag === 'select') {
      e.preventDefault();
    }
  });

  if (doc._caHoverOver) doc.removeEventListener('mouseover', doc._caHoverOver);
  if (doc._caHoverOut) doc.removeEventListener('mouseout', doc._caHoverOut);

  let hoveredElement = null;
  doc._caHoverOver = (e) => {
    if (!iframe.contentWindow.__CA_EDIT_MODE__) return;
    if (isDragging) return;
    let target = e.target;
    if (doc.getElementById('ca-picker-style-tag')) return;

    if (!target.closest('[id^="ca-widget-"]')) {
      const earlet = doc.getElementById('ca-widget-earlet-container');
      const banner = doc.getElementById('ca-widget-banner-container');
      const popup = doc.querySelector('.ca-modal') || doc.getElementById('ca-widget-popup-container');

      if (earlet) target = earlet;
      else if (banner) target = banner;
      else if (popup) target = popup;
      else {
        if (hoveredElement) {
          hoveredElement.classList.remove('ca-hover-element');
          hoveredElement = null;
        }
        return;
      }
    } else if (
      target.id === 'ca-widget-popup-container' ||
      target === doc.body ||
      target === doc.documentElement
    ) {
      const modal = doc.querySelector('.ca-modal');
      if (modal) target = modal;
    } else if (
      target.id === 'ca-widget-banner-container' ||
      target.id === 'ca-widget-earlet-container'
    ) {
      target = doc.getElementById(target.id);
    }

    if (target && target.classList.contains('ca-selected-element')) {
      if (hoveredElement) {
        hoveredElement.classList.remove('ca-hover-element');
        hoveredElement = null;
      }
      return;
    }

    if (hoveredElement !== target) {
      if (hoveredElement) hoveredElement.classList.remove('ca-hover-element');
      if (target && target !== doc.body && target !== doc.documentElement) {
        hoveredElement = target;
        hoveredElement.classList.add('ca-hover-element');
      } else {
        hoveredElement = null;
      }
    }
  };

  doc._caHoverOut = () => {
    if (hoveredElement) {
      hoveredElement.classList.remove('ca-hover-element');
      hoveredElement = null;
    }
  };

  doc.addEventListener('mouseover', doc._caHoverOver);
  doc.addEventListener('mouseout', doc._caHoverOut);

  doc.body.addEventListener(
    'click',
    (e) => {
      if (!iframe.contentWindow.__CA_EDIT_MODE__) return;
      if (doc.getElementById('ca-picker-style-tag')) return;

      let target = e.target;
      const originalTag = target.tagName.toLowerCase();

      if (
        originalTag === 'a' ||
        target.closest('a') ||
        originalTag === 'input' ||
        originalTag === 'textarea' ||
        originalTag === 'button'
      ) {
        e.preventDefault();
      }
      e.stopPropagation();
      closeAllDropdowns();

      if (!target.closest('[id^="ca-widget-"]')) {
        const earlet = doc.getElementById('ca-widget-earlet-container');
        const banner = doc.getElementById('ca-widget-banner-container');
        const popup = doc.querySelector('.ca-modal') || doc.getElementById('ca-widget-popup-container');

        if (earlet) target = earlet;
        else if (banner) target = banner;
        else if (popup) target = popup;
        else {
          if (activeElement) {
            activeElement.classList.remove('ca-selected-element');
            activeElement.contentEditable = 'false';
            activeElement = null;
          }
          toolbar.classList.remove('ca-visible');
          return;
        }
      } else if (target.id === 'ca-widget-popup-container' || target === doc.body) {
        const modal = doc.querySelector('.ca-modal');
        if (modal) target = modal;
      } else if (
        target.id === 'ca-widget-banner-container' ||
        target.id === 'ca-widget-earlet-container'
      ) {
        target = doc.getElementById(target.id);
      }

      if (hoveredElement) {
        hoveredElement.classList.remove('ca-hover-element');
        hoveredElement = null;
      }

      if (activeElement) {
        activeElement.classList.remove('ca-selected-element');
        activeElement.contentEditable = 'false';
      }

      activeElement = target;

      if (activeElement === doc.body || activeElement === doc.documentElement) {
        toolbar.classList.remove('ca-visible');
        return;
      }

      activeElement.classList.add('ca-selected-element');
      const tag = activeElement.tagName.toLowerCase();
      const isImg = tag === 'img';

      const timerContainer = activeElement.closest('.ca-timer');
      const isInsideTimer = timerContainer !== null;

      const timerDropdown = mainDoc.getElementById('ca-timer-dropdown');
      if (timerDropdown) timerDropdown.style.display = isInsideTimer ? 'block' : 'none';

      if (isInsideTimer) {
        const currentEnd = timerContainer.getAttribute('data-end-date');
        if (currentEnd) {
          const timerInput = mainDoc.getElementById('ca-timer-input');
          if (timerInput) timerInput.value = currentEnd;
        }
        const chkD = mainDoc.getElementById('ca-chk-d');
        if (chkD) chkD.checked = timerContainer.getAttribute('data-hide-d') !== 'true';
        const chkH = mainDoc.getElementById('ca-chk-h');
        if (chkH) chkH.checked = timerContainer.getAttribute('data-hide-h') !== 'true';
        const chkM = mainDoc.getElementById('ca-chk-m');
        if (chkM) chkM.checked = timerContainer.getAttribute('data-hide-m') !== 'true';
        const chkS = mainDoc.getElementById('ca-chk-s');
        if (chkS) chkS.checked = timerContainer.getAttribute('data-hide-s') !== 'true';
      }

      mainDoc.getElementById('ca-text-color-group').style.display = isImg ? 'none' : 'flex';
      mainDoc.getElementById('ca-font-family-dropdown').style.display = isImg ? 'none' : 'block';
      mainDoc.getElementById('ca-font-size-group').style.display = isImg ? 'none' : 'flex';
      mainDoc.getElementById('ca-weight-dropdown').style.display = isImg ? 'none' : 'block';
      mainDoc.getElementById('ca-align-dropdown').style.display = isImg ? 'none' : 'block';
      mainDoc.getElementById('ca-edit-btn').style.display = isImg ? 'none' : 'flex';
      mainDoc.getElementById('ca-image-btn').style.display = isImg ? 'flex' : 'none';

      const earletContainer = doc.getElementById('ca-widget-earlet-container');
      const bannerContainer = doc.getElementById('ca-widget-banner-container');
      const posDropdown = mainDoc.getElementById('ca-position-dropdown');

      if (earletContainer) {
        if (ePosDropdown) ePosDropdown.style.display = 'block';
        if (posDropdown) posDropdown.style.display = 'none';
        if (ePosSelect) ePosSelect.value = earletContainer.getAttribute('data-epos') || 'bottom-right';
        if (ePosX) ePosX.value = earletContainer.getAttribute('data-ex') || '20';
        if (ePosY) ePosY.value = earletContainer.getAttribute('data-ey') || '20';
      } else if (bannerContainer) {
        if (ePosDropdown) ePosDropdown.style.display = 'none';
        if (posDropdown) posDropdown.style.display = 'block';
      } else {
        if (ePosDropdown) ePosDropdown.style.display = 'none';
        if (posDropdown) posDropdown.style.display = 'none';
      }

      if (savedLeft !== null && savedTop !== null) {
        toolbar.style.transform = 'none';
        toolbar.style.left = savedLeft + 'px';
        toolbar.style.top = savedTop + 'px';
        toolbar.style.bottom = 'auto';
      } else {
        toolbar.style.transform = 'translateX(-50%)';
        toolbar.style.left = '50%';
        toolbar.style.top = '100px';
        toolbar.style.bottom = 'auto';
      }

      const activeStyles = window.getComputedStyle(activeElement);
      mainDoc.getElementById('ca-color-picker').value = rgbToHex(activeStyles.color);
      mainDoc.getElementById('ca-bg-picker').value = rgbToHex(activeStyles.backgroundColor);

      const currentFs = parseInt(activeStyles.fontSize, 10);
      mainDoc.getElementById('ca-font-size-input').value = Number.isNaN(currentFs) ? 16 : currentFs;

      const currentFf = activeStyles.fontFamily;
      let ffName = 'Sistem Fontu';
      const matchedFont = fontFamilies.find(
        (f) =>
          currentFf.includes(f.name.split(' ')[0]) ||
          f.value.includes(currentFf.split(',')[0].replace(/['"]/g, ''))
      );
      if (matchedFont) ffName = matchedFont.name;
      else if (currentFf) ffName = currentFf.split(',')[0].replace(/['"]/g, '').substring(0, 12);
      mainDoc.querySelector('#ca-font-family-btn span').innerText = ffName;

      let weight = parseInt(activeStyles.fontWeight, 10);
      if (Number.isNaN(weight)) weight = 400;
      mainDoc.querySelector('#ca-weight-btn span').innerText =
        weight >= 700 ? 'Kalın' : weight >= 600 ? 'Yarı Kalın' : weight >= 500 ? 'Orta' : 'Normal';

      const align = activeStyles.textAlign || 'left';
      let alignIcon =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>';
      if (align === 'center') {
        alignIcon =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>';
      } else if (align === 'right') {
        alignIcon =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>';
      }
      mainDoc.getElementById('ca-align-btn').innerHTML = alignIcon;

      const elStyle = activeElement.style;
      mainDoc.getElementById('ca-width-input').value = elStyle.width || activeStyles.width || 'auto';
      mainDoc.getElementById('ca-height-input').value = elStyle.height || activeStyles.height || 'auto';
      mainDoc.getElementById('ca-radius-input').value = parseInt(activeStyles.borderRadius, 10) || 0;

      ['pt', 'pr', 'pb', 'pl'].forEach((dir, i) => {
        const prop = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'][i];
        mainDoc.getElementById(`ca-${dir}`).value = parseInt(activeStyles[prop], 10) || 0;
      });
      ['mt', 'mr', 'mb', 'ml'].forEach((dir, i) => {
        const prop = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'][i];
        mainDoc.getElementById(`ca-${dir}`).value = parseInt(activeStyles[prop], 10) || 0;
      });

      const parentLink = activeElement.closest('a');
      mainDoc.getElementById('ca-link-input').value = parentLink
        ? parentLink.getAttribute('href')
        : activeElement.getAttribute('href') || '';
      toolbar.classList.add('ca-visible');
    },
    true
  );

  const triggerEdit = (el) => {
    if (!el) return;
    const tag = el.tagName.toLowerCase();

    if (tag === 'input' || tag === 'textarea') {
      const currentPlaceholder = el.getAttribute('placeholder') || '';
      el.value = currentPlaceholder;
      el.focus();
      el.select();

      const onKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.blur();
        }
      };

      const onBlur = () => {
        if (el.value.trim() !== '') el.setAttribute('placeholder', el.value);
        el.value = '';
        forceSyncToReact();
        saveState();
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('keydown', onKeyDown);
      };

      el.addEventListener('blur', onBlur);
      el.addEventListener('keydown', onKeyDown);
    } else if (
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'b', 'strong', 'button', 'a'].includes(tag)
    ) {
      el.contentEditable = 'true';
      el.focus();

      const onInput = () => {
        forceSyncToReact();
      };
      el.addEventListener('input', onInput);

      const onKeyDownEdit = (e) => {
        if (e.key === ' ' && (tag === 'button' || tag === 'a')) {
          e.preventDefault();
          doc.execCommand('insertText', false, ' ');
        }
      };
      el.addEventListener('keydown', onKeyDownEdit);

      try {
        const range = doc.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = iframe.contentWindow.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch {
        // ignore selection range issues
      }

      const onBlur = () => {
        saveState();
        el.removeEventListener('blur', onBlur);
        el.removeEventListener('input', onInput);
        el.removeEventListener('keydown', onKeyDownEdit);
        el.contentEditable = 'false';
      };
      el.addEventListener('blur', onBlur);
    }
  };

  doc.body.addEventListener('dblclick', (e) => {
    if (!iframe.contentWindow.__CA_EDIT_MODE__) return;
    if (!e.target.closest('[id^="ca-widget-"]')) return;
    if (activeElement) {
      e.stopPropagation();
      triggerEdit(activeElement);
    }
  });

  const bindToolbarEvents = () => {
    ['ca-link-menu', 'ca-timer-menu', 'ca-position-menu'].forEach((id) => {
      const el = mainDoc.getElementById(id);
      if (el) el.onclick = (e) => e.stopPropagation();
    });

    const timerInput = mainDoc.getElementById('ca-timer-input');
    if (timerInput) {
      timerInput.onchange = (e) => {
        if (activeElement) {
          const tc = activeElement.closest('.ca-timer');
          if (tc) {
            tc.setAttribute('data-end-date', e.target.value);
            forceSyncToReact(true);
            saveState(true);
          }
        }
      };
    }

    ['d', 'h', 'm', 's'].forEach((unit) => {
      const chk = mainDoc.getElementById(`ca-chk-${unit}`);
      if (chk) {
        chk.onchange = (e) => {
          if (activeElement) {
            const tc = activeElement.closest('.ca-timer');
            if (tc) {
              if (e.target.checked) tc.removeAttribute(`data-hide-${unit}`);
              else tc.setAttribute(`data-hide-${unit}`, 'true');
              forceSyncToReact(true);
              saveState(true);
            }
          }
        };
      }
    });

    mainDoc.getElementById('ca-color-picker').oninput = (e) =>
      applyStyle(activeElement, 'color', e.target.value, false);
    mainDoc.getElementById('ca-color-picker').onchange = (e) =>
      applyStyle(activeElement, 'color', e.target.value, true);

    mainDoc.getElementById('ca-bg-picker').oninput = (e) =>
      applyStyle(activeElement, 'backgroundColor', e.target.value, false);
    mainDoc.getElementById('ca-bg-picker').onchange = (e) =>
      applyStyle(activeElement, 'backgroundColor', e.target.value, true);

    mainDoc.getElementById('ca-radius-input').oninput = (e) =>
      applyStyle(activeElement, 'borderRadius', e.target.value + 'px', true);
    mainDoc.getElementById('ca-width-input').onchange = (e) => {
      const val = e.target.value;
      applyStyle(activeElement, 'width', val, false);
      applyStyle(activeElement, 'maxWidth', val === 'auto' ? '' : val, true);
    };
    mainDoc.getElementById('ca-height-input').onchange = (e) => {
      const val = e.target.value;
      applyStyle(activeElement, 'height', val, false);
      applyStyle(activeElement, 'maxHeight', val === 'auto' ? '' : val, true);
    };
    mainDoc.getElementById('ca-font-size-input').oninput = (e) =>
      applyStyle(activeElement, 'fontSize', e.target.value + 'px', true);

    [
      'pt:paddingTop',
      'pr:paddingRight',
      'pb:paddingBottom',
      'pl:paddingLeft',
      'mt:marginTop',
      'mr:marginRight',
      'mb:marginBottom',
      'ml:marginLeft',
    ].forEach((item) => {
      const [id, prop] = item.split(':');
      mainDoc.getElementById(`ca-${id}`).oninput = (e) =>
        applyStyle(activeElement, prop, e.target.value + 'px', true);
    });

    mainDoc.querySelectorAll('#ca-font-family-menu .ca-dropdown-item').forEach((item) => {
      item.onclick = (e) => {
        e.stopPropagation();
        applyStyle(activeElement, 'fontFamily', item.getAttribute('data-value'), true);
        mainDoc.querySelector('#ca-font-family-btn span').innerText =
          item.querySelector('span').innerText;
        closeAllDropdowns();
      };
    });

    mainDoc.querySelectorAll('#ca-weight-menu .ca-dropdown-item').forEach((item) => {
      item.onclick = (e) => {
        e.stopPropagation();
        applyStyle(activeElement, 'fontWeight', item.getAttribute('data-value'), true);
        mainDoc.querySelector('#ca-weight-btn span').innerText =
          item.querySelector('span').innerText;
        closeAllDropdowns();
      };
    });

    mainDoc.querySelectorAll('#ca-align-menu .ca-dropdown-item').forEach((item) => {
      item.onclick = (e) => {
        e.stopPropagation();
        applyStyle(activeElement, 'textAlign', item.getAttribute('data-value'), true);
        let alignIcon =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>';
        if (item.getAttribute('data-value') === 'center') {
          alignIcon =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>';
        } else if (item.getAttribute('data-value') === 'right') {
          alignIcon =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>';
        }
        mainDoc.getElementById('ca-align-btn').innerHTML = alignIcon;
        closeAllDropdowns();
      };
    });

    mainDoc.getElementById('ca-edit-btn').onclick = (e) => {
      e.stopPropagation();
      triggerEdit(activeElement);
    };

    mainDoc.getElementById('ca-image-btn').onclick = (e) => {
      e.stopPropagation();
      if (!activeElement || activeElement.tagName.toLowerCase() !== 'img') return;
      const fileInput = doc.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        try {
          if (!activeElement.id) {
            activeElement.id = 'ca-el-' + Math.random().toString(36).slice(2, 11);
          }
          const dataUrl = await compressImageToDataUrl(file);
          activeElement.src = dataUrl;
          forceSyncToReact(true);
          saveState(true);
        } catch (err) {
          console.error('Görsel sıkıştırma hatası:', err);
        }
      };
      fileInput.click();
    };

    mainDoc.getElementById('ca-link-save-btn').onclick = (e) => {
      e.stopPropagation();
      if (!activeElement) return;
      const url = mainDoc.getElementById('ca-link-input').value;
      if (url) {
        const parentLink = activeElement.closest('a');
        if (parentLink) {
          parentLink.href = url;
        } else if (activeElement.tagName.toLowerCase() === 'a') {
          activeElement.href = url;
        } else {
          const link = doc.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.style.color = 'inherit';
          link.style.textDecoration = 'none';
          const currentDisplay = window.getComputedStyle(activeElement).display;
          link.style.display = currentDisplay === 'inline' ? 'inline-block' : currentDisplay;
          const isPopupBtn =
            activeElement.classList.contains('ca-btn') &&
            activeElement.closest('.ca-modal') !== null;
          if (activeElement.style.width === '100%' || isPopupBtn) {
            link.style.width = '100%';
            if (link.style.display === 'inline-block') link.style.display = 'block';
          }
          activeElement.parentNode.insertBefore(link, activeElement);
          link.appendChild(activeElement);
          activeElement.classList.remove('ca-selected-element');
          activeElement = link;
          activeElement.classList.add('ca-selected-element');
        }
        forceSyncToReact();
        saveState();
        closeAllDropdowns();
      }
    };

    mainDoc.getElementById('ca-delete-btn').onclick = () => {
      if (activeElement) {
        saveState();
        activeElement.remove();
        forceSyncToReact();
        saveState();
        toolbar.classList.remove('ca-visible');
        activeElement = null;
      }
    };

    mainDoc.getElementById('ca-close-btn').onclick = () => {
      if (activeElement) {
        activeElement.classList.remove('ca-selected-element');
        activeElement.contentEditable = 'false';
        activeElement = null;
      }
      toolbar.classList.remove('ca-visible');
    };

    const posModeEl = mainDoc.getElementById('ca-pos-mode');
    const inlineSettingsEl = mainDoc.getElementById('ca-inline-settings');
    const posTargetEl = mainDoc.getElementById('ca-pos-target');
    const posRelEl = mainDoc.getElementById('ca-pos-relation');
    const pickerBtn = mainDoc.getElementById('ca-picker-btn');
    const parentBtn = mainDoc.getElementById('ca-parent-btn');
    const childBtn = mainDoc.getElementById('ca-child-btn');
    const applyBtn = mainDoc.getElementById('ca-pos-apply-btn');

    const getUniqueSelector = (element) => {
      const path = [];
      let current = element;
      while (
        current &&
        current.nodeType === Node.ELEMENT_NODE &&
        current.tagName.toLowerCase() !== 'html'
      ) {
        if (current.id && !current.id.startsWith('ca-')) {
          path.unshift('#' + current.id);
          break;
        }
        let index = 1;
        let sibling = current.previousElementSibling;
        while (sibling) {
          index++;
          sibling = sibling.previousElementSibling;
        }
        path.unshift(current.tagName.toLowerCase() + ':nth-child(' + index + ')');
        current = current.parentNode;
      }
      return path.join(' > ');
    };

    const applyPositioning = () => {
      window.parent.postMessage(
        {
          type: 'UPDATE_CONFIG',
          updates: {
            positionMode: posModeEl?.value || 'fixed-top',
            inlineTarget: posTargetEl?.value || '',
            inlineRelation: posRelEl?.value || 'afterend',
          },
        },
        '*'
      );
    };

    const flashHighlight = (selectorStr) => {
      doc.querySelectorAll('.ca-nav-highlight').forEach((el) => el.classList.remove('ca-nav-highlight'));
      try {
        const targetEl = doc.querySelector(selectorStr);
        if (targetEl) targetEl.classList.add('ca-nav-highlight');
      } catch {
        // ignore invalid CSS selector
      }
    };

    if (posModeEl) {
      posModeEl.onchange = (e) => {
        inlineSettingsEl.style.display = e.target.value === 'inline' ? 'flex' : 'none';
      };
    }

    if (applyBtn) {
      applyBtn.onclick = (e) => {
        e.stopPropagation();
        applyPositioning();
        closeAllDropdowns();
      };
    }

    if (parentBtn) {
      parentBtn.onclick = (e) => {
        e.stopPropagation();
        const currentPath = posTargetEl.value.trim();
        if (!currentPath) return;
        const parts = currentPath.split(' > ');
        if (parts.length > 1) {
          parts.pop();
          const newPath = parts.join(' > ');
          posTargetEl.value = newPath;
          flashHighlight(newPath);
          parentBtn.style.background = '#3b82f6';
          setTimeout(() => {
            parentBtn.style.background = 'rgba(255,255,255,0.1)';
          }, 400);
        }
      };
    }

    if (childBtn) {
      childBtn.onclick = (e) => {
        e.stopPropagation();
        const currentPath = posTargetEl.value.trim();
        const fullPath = window.__ca_last_full_path || '';
        if (!currentPath || !fullPath) return;
        const currentParts = currentPath.split(' > ');
        const fullParts = fullPath.split(' > ');
        if (currentParts.length < fullParts.length) {
          const nextParts = fullParts.slice(0, currentParts.length + 1);
          const newPath = nextParts.join(' > ');
          posTargetEl.value = newPath;
          flashHighlight(newPath);
          childBtn.style.background = '#3b82f6';
          setTimeout(() => {
            childBtn.style.background = 'rgba(255,255,255,0.1)';
          }, 400);
        }
      };
    }

    if (pickerBtn) {
      pickerBtn.onclick = (e) => {
        e.stopPropagation();
        const handleMouseOver = (ev) => {
          ev.stopPropagation();
          ev.target.classList.add('ca-picker-hover');
        };
        const handleMouseOut = (ev) => {
          ev.stopPropagation();
          ev.target.classList.remove('ca-picker-hover');
        };
        const handleClick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          ev.target.classList.remove('ca-picker-hover');
          const selector = getUniqueSelector(ev.target);
          posTargetEl.value = selector;
          window.__ca_last_full_path = selector;
          flashHighlight(selector);
          doc.removeEventListener('mouseover', handleMouseOver);
          doc.removeEventListener('mouseout', handleMouseOut);
          doc.removeEventListener('click', handleClick, true);
          const pStyle = doc.getElementById('ca-picker-style-tag');
          if (pStyle) pStyle.remove();
        };

        const pickerStyle = doc.createElement('style');
        pickerStyle.id = 'ca-picker-style-tag';
        pickerStyle.innerHTML =
          '* { cursor: crosshair !important; } .ca-picker-hover { outline: 3px dashed #ef4444 !important; outline-offset: -3px !important; background: rgba(239,68,68,0.2) !important; transition: none !important; }';
        doc.head.appendChild(pickerStyle);

        doc.addEventListener('mouseover', handleMouseOver);
        doc.addEventListener('mouseout', handleMouseOut);
        doc.addEventListener('click', handleClick, true);
      };
    }
  };
  bindToolbarEvents();
};
