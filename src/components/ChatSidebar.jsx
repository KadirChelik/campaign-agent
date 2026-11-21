import React from 'react';
import {
  SidebarIcon,
  AgentMascot,
  ChatAvatar,
  UserAvatarIcon,
  XIcon,
  ImageIcon,
  SendIcon,
} from './Icons';

export const ChatSidebar = ({
  isHistoryOpen,
  setIsHistoryOpen,
  robotAnimation,
  chatContainerRef,
  messages,
  isLoading,
  activeSession,
  handleCampaignSelect,
  currentUploads,
  removeUpload,
  prompt,
  setPrompt,
  resetIdleTimer,
  handlePaste,
  generatePopupCode,
  fileInputRef,
  handleFileUpload,
}) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`icon-btn ${isHistoryOpen ? 'active' : ''}`}
            title="Geçmişi Aç/Kapat"
          >
            <SidebarIcon />
          </button>
          <div className="brand-title">
            <AgentMascot animationType={robotAnimation} />
            <span>Campaign Agent</span>
          </div>
        </div>
      </div>

      <div className="chat-history" ref={chatContainerRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className="message-block">
            <div className="message-avatar-col">
              {msg.type === 'agent' ? (
                <ChatAvatar />
              ) : (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: '#27272a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #3f3f46',
                  }}
                >
                  <UserAvatarIcon />
                </div>
              )}
            </div>

            <div className="message-content-col">
              <div className={`message-sender ${msg.type}`}>
                {msg.type === 'agent' ? 'Campaign Agent' : 'Siz'}
              </div>
              <div className="message-text">{msg.text}</div>

              {msg.images && msg.images.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {msg.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url || img.base64}
                      alt="uploaded"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-block">
            <div className="message-avatar-col">
              <ChatAvatar />
            </div>
            <div className="message-content-col">
              <div className="message-sender agent">Campaign Agent</div>
              <div className="message-text" style={{ color: '#a1a1aa' }}>
                Derleniyor...
              </div>
            </div>
          </div>
        )}
        {activeSession?.stage === 'select_campaign' && !isLoading && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '16px',
              marginLeft: '48px',
              flexWrap: 'wrap',
            }}
          >
            <button onClick={() => handleCampaignSelect('popup')} className="campaign-select-btn">
              Popup
            </button>
            <button onClick={() => handleCampaignSelect('banner')} className="campaign-select-btn">
              Banner
            </button>
            <button onClick={() => handleCampaignSelect('earlet')} className="campaign-select-btn">
              Earlet
            </button>
          </div>
        )}
      </div>

      <div
        className={`input-area-wrapper ${
          activeSession?.stage === 'select_campaign' || activeSession?.stage === 'select_template'
            ? 'hidden-input'
            : ''
        }`}
      >
        <div className="modern-input-box">
          {currentUploads.length > 0 && (
            <div className="upload-preview-bar" style={{ paddingTop: '16px' }}>
              {currentUploads.map((img) => (
                <div key={img.id} className="img-thumb-container">
                  <img src={img.base64} alt="preview" />
                  <button className="img-remove-btn" onClick={() => removeUpload(img.id)}>
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            placeholder="Tasarım isteğinizi buraya yazın..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={resetIdleTimer}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generatePopupCode(false);
              } else {
                resetIdleTimer();
              }
            }}
          />

          <div className="input-bottom-bar">
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              className="action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Görsel Yükle"
              disabled={isLoading}
            >
              <ImageIcon />
            </button>

            <button
              onClick={() => generatePopupCode(false)}
              disabled={isLoading || (!prompt.trim() && currentUploads.length === 0)}
              className="send-btn-modern"
            >
              {isLoading ? (
                'Bekleniyor...'
              ) : (
                <>
                  Gönder <SendIcon />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
