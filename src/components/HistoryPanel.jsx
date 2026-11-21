import React from 'react';
import {
  PlusIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  Edit2Icon,
  Trash2Icon,
} from './Icons';

export const HistoryPanel = ({
  isHistoryOpen,
  startNewSession,
  isLoading,
  sessions,
  currentSessionId,
  switchSession,
  editingId,
  editValue,
  setEditValue,
  handleRenameSave,
  activeMenu,
  setActiveMenu,
  handleRenameStart,
  handleDeleteSession,
}) => {
  return (
    <div className={`history-panel ${!isHistoryOpen ? 'closed' : ''}`}>
      <div className="history-content">
        <div className="history-header">
          <button onClick={startNewSession} disabled={isLoading} className="new-chat-btn">
            <PlusIcon /> Yeni Proje
          </button>
        </div>
        <div className="session-list">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`session-item ${s.id === currentSessionId ? 'active' : ''}`}
              onClick={() => switchSession(s.id)}
            >
              <div className="session-item-content">
                <MessageSquareIcon />
                {editingId === s.id ? (
                  <input
                    autoFocus
                    className="session-rename-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={handleRenameSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRenameSave();
                      }
                    }}
                  />
                ) : (
                  <span>{s.title}</span>
                )}
              </div>

              {!editingId && (
                <div style={{ position: 'relative' }}>
                  <button
                    className={`session-menu-btn ${activeMenu === s.id ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === s.id ? null : s.id);
                    }}
                  >
                    <MoreVerticalIcon />
                  </button>

                  {activeMenu === s.id && (
                    <div className="session-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="session-dropdown-item"
                        onClick={(e) => handleRenameStart(e, s.id, s.title)}
                      >
                        <Edit2Icon /> Yeniden Adlandır
                      </button>
                      <button
                        className="session-dropdown-item danger"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                      >
                        <Trash2Icon /> Sil
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
