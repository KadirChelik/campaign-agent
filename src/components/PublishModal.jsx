import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, CheckIcon, CopyIcon, DownloadIcon } from './Icons';

const getInitialScheduleDates = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const offset = now.getTimezoneOffset() * 60000;
  const start = new Date(now.getTime() - offset);
  const nextWeek = new Date(now.getTime());
  nextWeek.setDate(nextWeek.getDate() + 7);
  const end = new Date(nextWeek.getTime() - offset);

  return {
    start: start.toISOString().slice(0, 16),
    end: end.toISOString().slice(0, 16),
  };
};

export const PublishModal = ({
  isOpen,
  onClose,
  generatedCode = '',
  campaignType = 'popup',
  hasImpressionEvent = false,
  hasClickEvent = false,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [startDate, setStartDate] = useState(() => getInitialScheduleDates().start);
  const [endDate, setEndDate] = useState(() => getInitialScheduleDates().end);
  const closeTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsSaved(false);
    setIsCopied(false);
    onClose();
  };

  const handleDownloadJs = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ca-${campaignType || 'widget'}-widget.js`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard permission unavailable
    }
  };

  const handleSaveSimulation = (e) => {
    e.preventDefault();
    setIsSaved(true);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      handleClose();
    }, 2500);
  };

  return createPortal(
    <div className="publish-modal-overlay" onClick={handleClose}>
      <div className="publish-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="publish-close-btn" onClick={handleClose} aria-label="Kapat">
          <XIcon />
        </button>

        {isSaved ? (
          <div className="publish-success">
            <div className="publish-success-icon">
              <CheckIcon />
            </div>
            <h3>Simülasyon Tamamlandı!</h3>
            <p>
              Hedefleme ve zamanlama kurgusu demo arayüzünde doğrulandı. Gerçek kullanım için
              üretilen .js dosyasını indirip sitenize ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <form className="publish-form" onSubmit={handleSaveSimulation}>
            <h3>Dışa Aktar &amp; Yayın Simülasyonu</h3>
            <p className="publish-desc">
              Üretilen IIFE kampanya betiğini doğrudan .js dosyası olarak indirin, panoya kopyalayın
              veya hedefleme zamanlamasını simüle edin.
            </p>

            <div className="publish-export-actions">
              <button
                type="button"
                className="publish-export-btn primary"
                onClick={handleDownloadJs}
                disabled={!generatedCode}
              >
                <DownloadIcon /> JS Dosyası İndir (.js)
              </button>
              <button
                type="button"
                className="publish-export-btn"
                onClick={handleCopyCode}
                disabled={!generatedCode}
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
            </div>

            {generatedCode && (
              <div className="publish-tracking-row">
                <span className={`publish-tracking-pill ${hasImpressionEvent ? '' : 'inactive'}`}>
                  {hasImpressionEvent ? '✓' : '•'} Impression Hook
                </span>
                <span className={`publish-tracking-pill ${hasClickEvent ? '' : 'inactive'}`}>
                  {hasClickEvent ? '✓' : '•'} Click Hook
                </span>
              </div>
            )}

            <div className="publish-sim-divider">
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e4e4e7' }}>
                Zamanlama &amp; Hedefleme Formu
              </span>
              <span className="publish-demo-badge">Demo Yayın Simülasyonu</span>
            </div>

            <div className="publish-field">
              <label>Kurgu Adı</label>
              <input type="text" required placeholder="Örn: Yaz İndirimi Kampanyası" />
            </div>

            <div className="publish-field">
              <label>Hedef URL Deseni</label>
              <input type="text" required defaultValue="*campaign=preview*" placeholder="Örn: */urunler/*" />
            </div>

            <div className="publish-field-group">
              <div className="publish-field">
                <label>Başlangıç Tarihi</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="publish-field">
                <label>Bitiş Tarihi</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="publish-submit-btn">
              Demo Yayın Simülasyonunu Başlat
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
