import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ArrowLeft, Plus, Trash, X, StickyNote } from 'lucide-react';

export default function Notes({ user, showToast, goBack, initialPaper }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Note fields
  const [noteContent, setNoteContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#F59E0B'); // Default orange

  const colors = [
    { value: '#F59E0B', label: 'Orange' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#10B981', label: 'Green' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#7C4DFF', label: 'Purple' }
  ];

  useEffect(() => {
    loadNotes();
    // If opened with initialPaper, open add note modal automatically
    if (initialPaper) {
      setShowAddModal(true);
    }
  }, [user.id, initialPaper]);

  const loadNotes = async () => {
    try {
      const list = await api.getNotes(user.id);
      setNotes(list);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      showToast('Please enter note contents', 'error');
      return;
    }
    
    try {
      const paperId = initialPaper ? initialPaper.id : null;
      const paperTitle = initialPaper ? initialPaper.title : '';
      
      await api.addNote(user.id, noteContent.trim(), paperId, paperTitle, selectedColor);
      showToast('Note added successfully');
      
      setNoteContent('');
      setSelectedColor('#F59E0B');
      setShowAddModal(false);
      loadNotes();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.deleteNote(noteId);
      showToast('Note deleted');
      loadNotes();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Convert HEX to translucent RGBA for card backgrounds to look light and premium
  const hexToRgba = (hex, alpha = 0.15) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="notes-view fade-in">
      {/* Header */}
      <header className="notes-header row space-between">
        <div className="row" style={{ gap: '16px' }}>
          <button className="back-btn" onClick={goBack}>
            <ArrowLeft size={20} />
          </button>
          <h2>Research Notes</h2>
        </div>
        
        <button className="primary-btn add-note-btn row" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> New Note
        </button>
      </header>

      {/* Linked paper indicator */}
      {initialPaper && (
        <div className="linked-paper-banner row space-between">
          <span>Adding note linked to: <strong>{initialPaper.title}</strong></span>
          <button onClick={() => showToast("Note will be saved as general note instead")} className="unlink-btn">General</button>
        </div>
      )}

      {/* Notes Grid Display */}
      <section className="notes-content flex-1">
        {loading ? (
          <div className="loader-container">
            <div className="app-loader" />
          </div>
        ) : notes.length === 0 ? (
          <div className="app-card empty-notes-card">
            <StickyNote size={48} className="empty-icon text-orange" />
            <h3>No notes yet</h3>
            <p>Create sticky research notes or link them to academic papers.</p>
            <button onClick={() => setShowAddModal(true)} className="primary-btn empty-upload-btn">
              Add Note
            </button>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <div 
                key={note.id} 
                className="note-card"
                style={{ 
                  backgroundColor: hexToRgba(note.color, 0.12),
                  borderLeft: `5px solid ${note.color}`
                }}
              >
                <div className="note-content-area">
                  <div className="note-content">{note.content}</div>
                </div>

                <div className="note-footer">
                  <div className="note-meta-details">
                    <span className="note-date">{note.created_at}</span>
                    {note.paper_title && (
                      <span className="note-link-tag overflow-hidden" title={note.paper_title}>
                        • {note.paper_title}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="delete-note-btn"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Note Modal Dialog */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content add-note-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header row space-between">
              <h3>Create Research Note</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddNote} style={{ marginTop: '20px' }} className="row-column-gap">
              <div className="auth-field">
                <label className="input-label">Note Content</label>
                <textarea 
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Type your summary, thought or reference note here..."
                  className="note-textarea"
                  rows={6}
                  required
                />
              </div>

              {/* Color Picker */}
              <div className="auth-field" style={{ marginTop: '16px' }}>
                <label className="input-label">Card Color Theme</label>
                <div className="color-picker-row row">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      className={`color-dot-btn ${selectedColor === c.value ? 'selected' : ''}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setSelectedColor(c.value)}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {initialPaper && (
                <div className="linked-paper-field">
                  <span className="info-label">Linked Article:</span>
                  <span className="info-val">{initialPaper.title}</span>
                </div>
              )}

              <button type="submit" className="primary-btn save-note-submit">
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* local styling for notes */}
      <style>{`
        .notes-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
        }

        .add-note-btn {
          width: auto;
          padding: 8px 18px;
          font-size: 13.5px;
        }

        .linked-paper-banner {
          background-color: var(--chip-bg);
          border: 1px solid var(--border);
          border-left: 4px solid var(--primary);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
        }

        .unlink-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
        }

        .empty-notes-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 56px 24px;
          text-align: center;
          margin-top: 16px;
        }

        /* Note card elements overrides */
        .note-meta-details {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(30, 27, 46, 0.6);
          overflow: hidden;
          flex: 1;
        }

        .note-link-tag {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }

        .delete-note-btn {
          background: none;
          border: none;
          color: rgba(30, 27, 46, 0.4);
          cursor: pointer;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .delete-note-btn:hover {
          background-color: rgba(229, 72, 77, 0.1);
          color: var(--error);
        }

        /* Modal styling */
        .modal-header h3 {
          font-size: 18px;
          font-weight: 800;
        }

        .note-textarea {
          width: 100%;
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          font-size: 14.5px;
          color: var(--ink);
          outline: none;
          resize: none;
          transition: var(--transition);
        }

        .note-textarea:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-glow);
        }

        /* Color picker dots */
        .color-picker-row {
          gap: 12px;
          margin-top: 6px;
        }

        .color-dot-btn {
          border: 2px solid transparent;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          transition: var(--transition);
        }

        .color-dot-btn:hover {
          transform: scale(1.15);
        }

        .color-dot-btn.selected {
          border-color: var(--ink);
          transform: scale(1.1);
        }

        .linked-paper-field {
          margin-top: 16px;
          font-size: 13.5px;
          background-color: var(--background);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-weight: 600;
          color: var(--muted);
          font-size: 11.5px;
        }

        .info-val {
          font-weight: 700;
          color: var(--ink);
        }

        .save-note-submit {
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}
