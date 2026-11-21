import React from 'react';
import { AlertTriangleIconModal } from './Icons';

export const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  executeBackToTemplates,
}) => {
  if (!showConfirmModal) return null;

  return (
    <div className="custom-confirm-overlay">
      <div className="custom-confirm-modal">
        <div className="custom-confirm-icon">
          <AlertTriangleIconModal />
        </div>
        <h3>Emin misiniz?</h3>
        <p>
          Şablon galerisine dönmek, üzerinde çalıştığınız <b>mevcut tasarımı sıfırlayacaktır.</b>{' '}
          Tasarımınız kalıcı olarak silinecek.
        </p>
        <div className="custom-confirm-actions">
          <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>
            İptal
          </button>
          <button className="btn-confirm" onClick={executeBackToTemplates}>
            Evet, Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
};
