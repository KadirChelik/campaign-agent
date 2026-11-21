import React from 'react';
import {
  ArrowLeftIcon,
  DesktopIcon,
  TabletIcon,
  MobileIcon,
  RefreshIcon,
  Edit2Icon,
  EyeIcon,
  CodeIcon,
  CheckIcon,
} from './Icons';
import { MOCK_STOREFRONTS } from '../core/mockStorefronts';

export const EditorHeader = ({
  currentSessionId,
  activeSession,
  activeTab,
  handleTabChange,
  handleBackToTemplates,
  selectedStorefront,
  onSelectStorefront,
  device,
  setDevice,
  generatedCode,
  setRefreshKey,
  onPublishClick,
}) => {
  return (
    <div className="ide-header smooth-entry" key={`header-${currentSessionId}`}>
      <div className="header-controls">
        <div className="mac-dots">
          <div className="dot red"></div>
          <div className="dot yellow"></div>
          <div className="dot green"></div>
        </div>

        {activeSession?.stage === 'active' && (
          <button
            onClick={handleBackToTemplates}
            className="refresh-btn"
            style={{
              marginLeft: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <ArrowLeftIcon /> Geri
          </button>
        )}

        <div className="storefront-switcher">
          <select
            aria-label="Mock Storefront Seçimi"
            className="storefront-select"
            value={selectedStorefront}
            onChange={(e) => onSelectStorefront(e.target.value)}
          >
            {MOCK_STOREFRONTS.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="header-controls">
        {(activeTab === 'preview' || activeTab === 'edit') && (
          <div className="device-toggle">
            <button
              className={`device-btn ${device === 'desktop' ? 'active' : ''}`}
              onClick={() => setDevice('desktop')}
              title="Masaüstü"
            >
              <DesktopIcon />
            </button>
            <button
              className={`device-btn ${device === 'tablet' ? 'active' : ''}`}
              onClick={() => setDevice('tablet')}
              title="Tablet"
            >
              <TabletIcon />
            </button>
            <button
              className={`device-btn ${device === 'mobile' ? 'active' : ''}`}
              onClick={() => setDevice('mobile')}
              title="Mobil"
            >
              <MobileIcon />
            </button>
          </div>
        )}

        {(activeTab === 'preview' || activeTab === 'edit') && generatedCode && (
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="refresh-btn"
            title="Önizlemeyi Yenile"
          >
            <RefreshIcon />
          </button>
        )}

        <div className="tabs" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => handleTabChange('edit')}
          >
            <Edit2Icon /> Düzenleme
          </button>
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => handleTabChange('preview')}
          >
            <EyeIcon /> Önizleme
          </button>
          <button
            className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => handleTabChange('code')}
          >
            <CodeIcon /> Kaynak Kod
          </button>
        </div>

        <button className="publish-trigger-btn" onClick={onPublishClick}>
          <CheckIcon /> Dışa Aktar
        </button>
      </div>
    </div>
  );
};
