import React from 'react';
import { POPUP_TEMPLATES } from '../templates/popupTemplates';
import { BANNER_TEMPLATES } from '../templates/bannerTemplates';
import { EARLET_TEMPLATES } from '../templates/earletTemplates';

export const TemplateGallery = ({ activeSession, handleTemplateSelect }) => {
  const templates =
    activeSession?.type === 'banner'
      ? BANNER_TEMPLATES
      : activeSession?.type === 'earlet'
        ? EARLET_TEMPLATES
        : POPUP_TEMPLATES;

  return (
    <div className="template-gallery-wrapper">
      <h2>Şablon Galerisi</h2>
      <p className="subtitle">
        Başlamak için hazır bir tasarım seçin, ardından dilediğiniz gibi özelleştirin.
      </p>
      <div className={`template-grid ${activeSession?.type === 'banner' ? 'ca-banner-zoom-grid' : ''}`}>
        {templates.map((tpl) => (
          <div key={tpl.id} className="template-card" onClick={() => handleTemplateSelect(tpl)}>
            <div
              className="template-preview-box"
              style={{
                borderTopColor: tpl.color,
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              <iframe
                srcDoc={`<html><head></head><body style="margin:0;overflow:hidden;background:transparent;"><script>window.__CA_EDIT_MODE__ = true; ${tpl.code}</script></body></html>`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '250%',
                  height: '250%',
                  transform: 'scale(0.4)',
                  transformOrigin: 'top left',
                  border: 'none',
                  pointerEvents: 'none',
                }}
                title={tpl.title}
                tabIndex={-1}
              />
            </div>
            <div className="template-info">
              <h3>{tpl.title}</h3>
              <p>{tpl.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
