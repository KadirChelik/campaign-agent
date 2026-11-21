import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { initEditorEngine } from './core/editorEngine';
import { MOCK_STOREFRONTS, getMockStorefrontHtml } from './core/mockStorefronts';
import { patchTemplateConfig, patchVisualEdits, buildPreviewDocument } from './core/codePatcher';
import { TemplateGallery } from './components/TemplateGallery';
import { HistoryPanel } from './components/HistoryPanel';
import { ChatSidebar } from './components/ChatSidebar';
import { AlertTriangleIcon, WrenchIcon, CheckIcon, CopyIcon } from './components/Icons';
import { ConfirmModal } from './components/ConfirmModal';
import { EditorHeader } from './components/EditorHeader';
import { compressImageToDataUrl, generateCampaignCall } from './services/api';
import { PublishModal } from './components/PublishModal';

const CAMPAIGN_TYPES = {
  POPUP: 'popup',
  BANNER: 'banner',
  EARLET: 'earlet',
};

const STORAGE_KEY = 'ca_workspace_sessions';
const WELCOME_TEXT =
  'Merhaba! Ben Campaign Agent.\nSitenize nasıl bir kampanya bileşeni eklemek istersiniz?';

const createDefaultSession = (id = 'default', type = CAMPAIGN_TYPES.POPUP) => ({
  id,
  title: 'Yeni Proje',
  type,
  stage: 'select_campaign',
  messages: [{ type: 'agent', text: WELCOME_TEXT }],
  generatedCode: '',
});

const loadInitialSessions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore corrupted localStorage data
  }
  return [createDefaultSession()];
};

function App() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState(loadInitialSessions);
  const [currentSessionId, setCurrentSessionId] = useState(() => loadInitialSessions()[0].id);
  const [selectedStorefront, setSelectedStorefront] = useState(MOCK_STOREFRONTS[0].id);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [device, setDevice] = useState('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const [iframeError, setIframeError] = useState(null);
  const [robotAnimation, setRobotAnimation] = useState('none');
  const lastActivityRef = useRef(0);

  const [currentUploads, setCurrentUploads] = useState([]);
  const fileInputRef = useRef(null);
  const iframeRef = useRef(null);
  const chatContainerRef = useRef(null);
  const containerRef = useRef(null);

  const draftCodeRef = useRef('');
  const isVisualUpdateRef = useRef(false);

  const [previewScale, setPreviewScale] = useState(1);

  const activeSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const campaignType = activeSession?.type || CAMPAIGN_TYPES.POPUP;
  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession]);
  const generatedCode = activeSession ? activeSession.generatedCode : '';

  const handleBackToTemplates = () => {
    setShowConfirmModal(true);
  };

  const executeBackToTemplates = () => {
    setShowConfirmModal(false);
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) return { ...s, stage: 'select_template', generatedCode: '' };
        return s;
      })
    );
    setActiveTab('edit');
    draftCodeRef.current = '';

    const tb = document.getElementById('ca-editor-toolbar');
    if (tb) {
      tb.classList.remove('ca-visible');
      tb.style.display = 'none';
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || (error.message && error.message.includes('quota'))) {
        alert(
          'Tarayıcı hafızası (LocalStorage) doldu! Yeni projeleri kaydetmek için eski projelerinizi silmelisiniz.'
        );
      }
    }
  }, [sessions]);

  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;

      let targetW = 1440;
      let targetH = 900;
      if (device === 'tablet') {
        targetW = 768;
        targetH = 1024;
      }
      if (device === 'mobile') {
        targetW = 375;
        targetH = 812;
      }

      const scaleX = containerW / targetW;
      const scaleY = containerH / targetH;
      const scale = Math.min(scaleX, scaleY) * (device === 'desktop' ? 1 : 0.95);
      setPreviewScale(scale);
      window.__ca_preview_scale = scale;
    };

    const timerId = setTimeout(calculateScale, 10);
    window.addEventListener('resize', calculateScale);

    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('resize', calculateScale);
      resizeObserver.disconnect();
    };
  }, [device, activeTab, isHistoryOpen, activeSession?.stage]);

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.source !== iframeRef.current?.contentWindow) return;

      if (e.data.type === 'IFRAME_ERROR') {
        setIframeError({ message: e.data.message, line: e.data.lineno });
      }

      if (e.data.type === 'UPDATE_CONFIG') {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              const newCode = patchTemplateConfig(s.generatedCode, e.data.updates);
              draftCodeRef.current = newCode;
              return { ...s, generatedCode: newCode };
            }
            return s;
          })
        );
      }

      if (e.data.type === 'PATCH_JS_CODE') {
        isVisualUpdateRef.current = true;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              const currentCode = s.generatedCode;
              const isRawJS = currentCode && !currentCode.trim().startsWith('<');
              const updatedCode = isRawJS
                ? patchVisualEdits(currentCode, e.data.innerHtml, e.data.containerStyle || '')
                : e.data.fullHtml;

              draftCodeRef.current = updatedCode;
              return { ...s, generatedCode: updatedCode };
            }
            return s;
          })
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentSessionId]);

  const hasImpressionEvent = generatedCode.includes('// [TRACKING_IMPRESSION]');
  const hasClickEvent = generatedCode.includes('// [TRACKING_CLICK]');

  const updateActiveSession = (newMessages, newCode) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          let newTitle = s.title;
          if (s.title === 'Yeni Proje' && newMessages.length > 1) {
            const firstUserMsg = newMessages.find((m) => m.type === 'user');
            if (firstUserMsg && firstUserMsg.text) {
              newTitle = firstUserMsg.text.substring(0, 22) + '...';
            } else if (firstUserMsg && firstUserMsg.images) {
              newTitle = 'Görselli Proje';
            }
          }
          const updatedCode = newCode !== undefined ? newCode : s.generatedCode;
          return { ...s, messages: newMessages, generatedCode: updatedCode, title: newTitle };
        }
        return s;
      })
    );
  };

  const handleCampaignSelect = (type) => {
    const userMsg = {
      type: 'user',
      text: `${type === 'popup' ? 'Popup' : type === 'banner' ? 'Banner' : 'Earlet'} kurgulamak istiyorum.`,
    };
    const typeName = type === 'popup' ? 'Popup' : type === 'banner' ? 'Banner' : 'Kulakçık';
    const agentMsg = {
      type: 'agent',
      text: `Harika seçim! Sağdaki galeriden size uygun bir ${typeName} şablonu seçerek başlayın.`,
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            type,
            stage: 'select_template',
            messages: [...s.messages, userMsg, agentMsg],
          };
        }
        return s;
      })
    );
  };

  const handleTemplateSelect = (template) => {
    const userMsg = { type: 'user', text: `"${template.title}" şablonunu seçtim.` };
    const agentMsg = {
      type: 'agent',
      text: 'Harika seçim! Şablonu çalışma alanına aktardım.\nSağ taraftan önizleyebilir, metin ve renkleri değiştirebilir ya da benden yeni eklemeler yapmamı isteyebilirsiniz.',
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            stage: 'active',
            messages: [...s.messages, userMsg, agentMsg],
          };
        }
        return s;
      })
    );

    setTimeout(() => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return { ...s, generatedCode: template.code };
          }
          return s;
        })
      );
    }, 50);
  };

  const handleTabChange = (newTab) => {
    if (activeTab === 'edit' && draftCodeRef.current && draftCodeRef.current !== generatedCode) {
      updateActiveSession(messages, draftCodeRef.current);
      draftCodeRef.current = '';
    }
    setActiveTab(newTab);
  };

  const startNewSession = () => {
    if (isLoading) return;
    const newId = Date.now().toString();
    setSessions((prev) => [createDefaultSession(newId, campaignType), ...prev]);
    setCurrentSessionId(newId);
    setPrompt('');
    setCurrentUploads([]);
    setActiveTab('edit');
    draftCodeRef.current = '';
    setIframeError(null);
    if (window.innerWidth < 768) setIsHistoryOpen(false);
  };

  const switchSession = (id) => {
    if (isLoading || id === currentSessionId) return;
    if (activeTab === 'edit' && draftCodeRef.current) {
      updateActiveSession(messages, draftCodeRef.current);
    }
    const targetSession = sessions.find((s) => s.id === id);
    if (targetSession) {
      setCurrentSessionId(id);
      setPrompt('');
      setCurrentUploads([]);
      setIframeError(null);
      draftCodeRef.current = '';
    }
  };

  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    setActiveMenu(null);
    const newSessions = sessions.filter((s) => s.id !== id);
    if (newSessions.length === 0) {
      const newId = Date.now().toString();
      setSessions([createDefaultSession(newId, CAMPAIGN_TYPES.POPUP)]);
      setCurrentSessionId(newId);
    } else {
      setSessions(newSessions);
      if (currentSessionId === id) switchSession(newSessions[0].id);
    }
  };

  const handleRenameStart = (e, id, currentTitle) => {
    e.stopPropagation();
    setActiveMenu(null);
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const handleRenameSave = () => {
    if (editValue.trim()) {
      setSessions((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, title: editValue.trim() } : s))
      );
    }
    setEditingId(null);
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const scrollToBottom = (isSmooth = true) => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: isSmooth ? 'smooth' : 'auto',
      });
    };

    scrollToBottom(true);

    const timeoutId = setTimeout(() => {
      scrollToBottom(false);
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [messages, activeSession?.stage]);

  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isLoading) {
      setRobotAnimation('none');
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return undefined;
    lastActivityRef.current = Date.now();
    let animResetTimer = null;

    const intervalId = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= 10000) {
        const animations = ['wave', 'nod'];
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];
        setRobotAnimation(randomAnim);
        lastActivityRef.current = Date.now();
        animResetTimer = setTimeout(() => {
          setRobotAnimation('none');
        }, 1000);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      if (animResetTimer) clearTimeout(animResetTimer);
    };
  }, [isLoading]);

  const handleFileUpload = (e) => {
    processFiles(Array.from(e.target.files || []));
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    const files = [];
    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    processFiles(files);
  };

  const removeUpload = (idToRemove) => {
    setCurrentUploads((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const processFiles = async (files) => {
    if (!files.length) return;
    const availableSlots = Math.max(0, 2 - currentUploads.length);
    if (availableSlots === 0) {
      alert('En fazla 2 görsel yükleyebilirsiniz.');
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      alert('En fazla 2 görsel eklenebilir; ilk uygun görseller alındı.');
    }

    setIsLoading(true);

    for (const file of filesToProcess) {
      try {
        const dataUrl = await compressImageToDataUrl(file);
        const dimensions = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = dataUrl;
        });

        const mimeMatch = typeof dataUrl === 'string' ? dataUrl.match(/^data:(image\/[^;]+);/i) : null;
        const mimeType = mimeMatch ? mimeMatch[1] : file.type || 'image/jpeg';
        const imageId = `__CA_IMG_${Date.now()}_${Math.floor(Math.random() * 1000)}__`;

        setCurrentUploads((prev) => [
          ...prev,
          {
            id: imageId,
            base64: dataUrl,
            url: dataUrl,
            mimeType,
            width: dimensions.width,
            height: dimensions.height,
          },
        ]);
      } catch (err) {
        console.error('Görsel yükleme hatası:', err);
        alert(err.message || 'Görsel işlenirken bir hata oluştu.');
      }
    }

    setIsLoading(false);
  };

  const generatePopupCode = async (isAutoFix = false, fixPrompt = '') => {
    if (!isAutoFix && !prompt.trim() && currentUploads.length === 0) return;

    lastActivityRef.current = Date.now();
    setRobotAnimation('thinking');
    setIframeError(null);

    const userRequest = isAutoFix ? fixPrompt : prompt;
    const uploadedImagesForThisMessage = [...currentUploads];

    if (!isAutoFix) {
      setPrompt('');
      setCurrentUploads([]);
    }

    let currentCodeToSend = generatedCode;
    if (activeTab === 'edit' && draftCodeRef.current && draftCodeRef.current !== generatedCode) {
      currentCodeToSend = draftCodeRef.current;
      updateActiveSession(messages, currentCodeToSend);
    }

    const newMessages = [
      ...messages,
      {
        type: 'user',
        text: userRequest || `Bu görselleri kullanarak bir ${campaignType} hazırla.`,
        images: uploadedImagesForThisMessage,
      },
    ];
    updateActiveSession(newMessages, currentCodeToSend);
    setIsLoading(true);

    try {
      const apiImages = uploadedImagesForThisMessage.map(
        ({ base64, url, mimeType, width, height }) => ({
          url: url || base64,
          mimeType,
          width,
          height,
        })
      );

      const { code, mode, warnings } = await generateCampaignCall(
        campaignType,
        userRequest,
        apiImages,
        currentCodeToSend
      );

      const baseMsg = isAutoFix
        ? 'Hata tespit edildi ve kod başarıyla onarıldı!'
        : `${campaignType} tasarımını başarıyla derledim! Tuvalden inceleyebilirsiniz.`;
      const demoNote =
        mode === 'demo'
          ? '\n\n(Demo Modu: API anahtarı olmadan kural tabanlı önizleme uygulandı)'
          : '';
      const warningNote =
        mode !== 'demo' && Array.isArray(warnings) && warnings.length > 0
          ? `\n\nNot: ${warnings[0]}`
          : '';

      const updatedMessages = [
        ...newMessages,
        { type: 'agent', text: `${baseMsg}${demoNote}${warningNote}` },
      ];

      updateActiveSession(updatedMessages, code);
      draftCodeRef.current = '';
      setActiveTab('edit');
    } catch (error) {
      console.error('Backend Hatası:', error);
      const errorText = `Bir sorun oluştu: ${error.message}`;
      updateActiveSession([...newMessages, { type: 'agent', text: errorText }], currentCodeToSend);
    } finally {
      setIsLoading(false);
      setRobotAnimation('none');
      lastActivityRef.current = Date.now();
    }
  };

  const handleAutoFix = () => {
    if (!iframeError) return;
    const fixPrompt = `Yazdığın kodda şu hatayı aldım: "${iframeError.message}" (Satır: ${iframeError.line}). Lütfen SADECE bu hatayı gider ve düzeltilmiş saf JS kodunu tekrar ver.`;
    generatePopupCode(true, fixPrompt);
  };

  useEffect(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return;
      const doc = iframe.contentDocument;
      const mainDoc = document;

      if (iframe.contentWindow) {
        iframe.contentWindow.__CA_EDIT_MODE__ = activeTab === 'edit';
      }

      if (activeTab === 'edit' && activeSession?.stage === 'active') {
        initEditorEngine(currentSessionId);
        const tb = mainDoc.getElementById('ca-editor-toolbar');
        if (tb) tb.style.display = 'flex';
      } else {
        const tb = mainDoc.getElementById('ca-editor-toolbar');
        if (tb) {
          tb.style.display = 'none';
          tb.classList.remove('ca-visible');
        }
        const selected = doc.querySelectorAll('.ca-selected-element');
        selected.forEach((el) => {
          el.classList.remove('ca-selected-element');
          if (el.getAttribute('contenteditable') === 'true') {
            el.removeAttribute('contenteditable');
          }
        });
      }
    } catch {
      // ignore iframe access issues during mount
    }
  }, [activeTab, activeSession?.stage, currentSessionId]);

  useEffect(() => {
    if (isVisualUpdateRef.current) {
      isVisualUpdateRef.current = false;
      return;
    }

    if (iframeRef.current) {
      const storeHtml = getMockStorefrontHtml(selectedStorefront);
      iframeRef.current.srcdoc = buildPreviewDocument(storeHtml, generatedCode);
    }
  }, [generatedCode, selectedStorefront, refreshKey]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    if (activeSession && activeSession.title) {
      document.title = `${activeSession.title} — Campaign Agent`;
    } else {
      document.title = 'Campaign Agent — AI No-Code Widget Studio';
    }
  }, [activeSession]);

  return (
    <div className="app-container">
      <HistoryPanel
        isHistoryOpen={isHistoryOpen}
        startNewSession={startNewSession}
        isLoading={isLoading}
        sessions={sessions}
        currentSessionId={currentSessionId}
        switchSession={switchSession}
        editingId={editingId}
        editValue={editValue}
        setEditValue={setEditValue}
        handleRenameSave={handleRenameSave}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        handleRenameStart={handleRenameStart}
        handleDeleteSession={handleDeleteSession}
      />

      <ChatSidebar
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        robotAnimation={robotAnimation}
        chatContainerRef={chatContainerRef}
        messages={messages}
        isLoading={isLoading}
        activeSession={activeSession}
        handleCampaignSelect={handleCampaignSelect}
        currentUploads={currentUploads}
        removeUpload={removeUpload}
        prompt={prompt}
        setPrompt={setPrompt}
        resetIdleTimer={resetIdleTimer}
        handlePaste={handlePaste}
        generatePopupCode={generatePopupCode}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
      />

      <div className="main-panel">
        <div className="ide-window">
          {activeSession?.stage === 'select_template' ? (
            <TemplateGallery
              activeSession={activeSession}
              handleTemplateSelect={handleTemplateSelect}
            />
          ) : (
            <>
              <EditorHeader
                currentSessionId={currentSessionId}
                activeSession={activeSession}
                activeTab={activeTab}
                handleTabChange={handleTabChange}
                handleBackToTemplates={handleBackToTemplates}
                selectedStorefront={selectedStorefront}
                onSelectStorefront={setSelectedStorefront}
                device={device}
                setDevice={setDevice}
                generatedCode={generatedCode}
                setRefreshKey={setRefreshKey}
                onPublishClick={() => setIsPublishModalOpen(true)}
              />

              <div className="content-area" style={{ position: 'relative' }}>
                {iframeError && (activeTab === 'preview' || activeTab === 'edit') && (
                  <div className="error-banner">
                    <div className="error-content">
                      <div className="error-title">
                        <AlertTriangleIcon /> JS Hatası Tespit Edildi!
                      </div>
                      <div className="error-text">
                        {iframeError.message} (Satır: {iframeError.line})
                      </div>
                    </div>
                    <button className="auto-fix-btn" onClick={handleAutoFix} disabled={isLoading}>
                      <WrenchIcon /> {isLoading ? 'Onarılıyor...' : 'Oto-Fix'}
                    </button>
                  </div>
                )}

                <div
                  className={`preview-container ${activeTab === 'code' ? 'hidden' : ''}`}
                  ref={containerRef}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    backgroundColor: '#18181b',
                  }}
                >
                  <div
                    key={`preview-box-${currentSessionId}`}
                    className="smooth-entry"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: device === 'desktop' ? 1440 : device === 'tablet' ? 768 : 375,
                      height: device === 'desktop' ? 900 : device === 'tablet' ? 1024 : 812,
                      transform: `translate(-50%, -50%) scale(${previewScale})`,
                      transformOrigin: 'center center',
                      transition: 'width 0.3s, height 0.3s, transform 0.3s',
                      backgroundColor: '#fff',
                      borderRadius: device === 'desktop' ? '16px' : '36px',
                      border: device === 'desktop' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      boxShadow:
                        device === 'desktop'
                          ? 'none'
                          : '0 0 0 2px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden',
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      title="preview"
                      onLoad={() => {
                        if (iframeRef.current && iframeRef.current.contentWindow) {
                          iframeRef.current.contentWindow.__CA_EDIT_MODE__ = activeTab === 'edit';
                        }
                        if (activeTab === 'edit') initEditorEngine(currentSessionId);
                      }}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                </div>

                <div
                  key={`code-${currentSessionId}`}
                  className={`code-wrapper ${activeTab === 'code' ? 'active' : ''} smooth-entry`}
                >
                  {generatedCode ? (
                    <>
                      <textarea
                        className="code-box"
                        value={generatedCode}
                        onChange={(e) => {
                          updateActiveSession(messages, e.target.value);
                          setIframeError(null);
                        }}
                        spellCheck="false"
                      />
                      <button
                        onClick={copyCode}
                        className={`copy-fab ${isCopied ? 'copied' : ''}`}
                      >
                        {isCopied ? (
                          <>
                            <CheckIcon /> Kopyalandı
                          </>
                        ) : (
                          <>
                            <CopyIcon /> Kodu Kopyala
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="code-box" style={{ color: 'var(--text-muted)' }}>
                      // Kodunuz burada derlenecek...
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showConfirmModal && (
        <ConfirmModal
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          executeBackToTemplates={executeBackToTemplates}
        />
      )}

      {isPublishModalOpen && (
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          generatedCode={generatedCode}
          campaignType={campaignType}
          hasImpressionEvent={hasImpressionEvent}
          hasClickEvent={hasClickEvent}
        />
      )}
    </div>
  );
}

export default App;
