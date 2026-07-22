import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  ArrowLeft, 
  Star, 
  MoreVertical, 
  ChevronDown, 
  Copy, 
  Share2, 
  MessageSquare, 
  Trash2,
  Bookmark,
  BookOpen,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function PaperDetail({ user, paperId, showToast, goBack, navigateTo }) {
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | content | citations
  
  // Citations states
  const [citations, setCitations] = useState('');
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [citationsLoaded, setCitationsLoaded] = useState(false);

  // Status selection states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [paperId]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const details = await api.getPaperDetail(paperId);
      setPaper(details);
      
      // If citations already cached, load them
      if (details.citations) {
        setCitations(details.citations);
        setCitationsLoaded(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCitationsTabClick = async () => {
    setActiveTab('citations');
    if (citationsLoaded || citationsLoading) return;
    
    setCitationsLoading(true);
    try {
      const list = await api.getCitations(paperId);
      setCitations(list);
      setCitationsLoaded(true);
    } catch (err) {
      showToast(err.message, 'error');
      setCitations('Failed to load citations: ' + err.message);
    } finally {
      setCitationsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!paper) return;
    try {
      const fav = await api.toggleFavorite(paper.id);
      setPaper(prev => ({ ...prev, is_favorite: fav }));
      showToast(fav ? 'Added to favorites' : 'Removed from favorites');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setShowActionDropdown(false);
  };

  const handleStatusChange = async (status) => {
    if (!paper) return;
    try {
      await api.setStatus(paper.id, status);
      setPaper(prev => ({ ...prev, status }));
      showToast(`Status updated to ${status === 'toRead' ? 'To Read' : status === 'reading' ? 'Reading' : 'Completed'}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setShowStatusDropdown(false);
  };

  const handleDeletePaper = async () => {
    if (!paper) return;
    if (!window.confirm(`Are you sure you want to delete "${paper.title}"? This will delete all chat history.`)) {
      return;
    }
    try {
      await api.deletePaper(paper.id);
      showToast('Paper deleted');
      goBack();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setShowActionDropdown(false);
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`);
  };

  const getStatusLabel = (s) => {
    if (s === 'toRead') return 'To Read';
    if (s === 'reading') return 'Reading';
    if (s === 'completed') return 'Completed';
    return 'Status';
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowStatusDropdown(false);
      setShowActionDropdown(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (loading) {
    return (
      <div className="loader-container full-screen-loader">
        <div className="app-loader" />
        <p className="loader-msg">Loading paper details...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="error-view fade-in">
        <h3>Paper not found</h3>
        <button onClick={goBack} className="primary-btn">Go Back</button>
      </div>
    );
  }

  return (
    <div className="paper-detail-view fade-in">
      {/* Top Navigation Header */}
      <header className="detail-header row space-between">
        <button className="back-btn" onClick={goBack}>
          <ArrowLeft size={20} />
        </button>
        
        <div className="row" style={{ gap: '8px' }}>
          <button 
            onClick={handleFavoriteToggle} 
            className="action-icon-btn favorite-btn"
          >
            <Star 
              size={20} 
              className={paper.is_favorite ? 'star-filled-icon' : ''} 
              color={paper.is_favorite ? 'var(--pink)' : 'var(--muted)'}
            />
          </button>
          
          <div className="dropdown-menu-wrapper">
            <button 
              className="action-icon-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setShowActionDropdown(!showActionDropdown);
              }}
            >
              <MoreVertical size={20} />
            </button>

            {showActionDropdown && (
              <div className="dropdown-menu detail-action-dropdown fade-in" onClick={e => e.stopPropagation()}>
                <button onClick={handleFavoriteToggle}>
                  <Star size={14} /> 
                  {paper.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
                </button>
                <button onClick={() => navigateTo('notes', paper)}>
                  <StickyNote size={14} /> Add Notes
                </button>
                <hr className="dropdown-divider" />
                <button onClick={handleDeletePaper} className="delete-btn">
                  <Trash2 size={14} /> Delete Paper
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Title & Metadata Header Area */}
      <section className="paper-title-area">
        <h1>{paper.title}</h1>
        <div className="row space-between paper-meta-row" style={{ marginTop: '12px' }}>
          <span className="paper-authors">
            {paper.authors ? `${paper.authors}` : 'Unknown Authors'} {paper.year ? `(${paper.year})` : ''}
          </span>

          {/* Status Selection Pill */}
          <div className="dropdown-menu-wrapper">
            <div 
              className="status-selector-pill row"
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(!showStatusDropdown);
              }}
            >
              <span className="status-pill-text">{getStatusLabel(paper.status)}</span>
              <ChevronDown size={14} />
            </div>

            {showStatusDropdown && (
              <div className="dropdown-menu status-dropdown fade-in" onClick={e => e.stopPropagation()}>
                <button onClick={() => handleStatusChange('toRead')} className={paper.status === 'toRead' ? 'active-status' : ''}>
                  <Bookmark size={14} /> To Read
                </button>
                <button onClick={() => handleStatusChange('reading')} className={paper.status === 'reading' ? 'active-status' : ''}>
                  <BookOpen size={14} /> Reading
                </button>
                <button onClick={() => handleStatusChange('completed')} className={paper.status === 'completed' ? 'active-status' : ''}>
                  <CheckCircle size={14} /> Completed
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Document Tab Selector Bar */}
      <section className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button 
          className={`tab-btn ${activeTab === 'citations' ? 'active' : ''}`}
          onClick={handleCitationsTabClick}
        >
          Citations
        </button>
      </section>

      {/* Dynamic Tab Body Panel */}
      <section className="detail-tab-body flex-1">
        {activeTab === 'overview' && (
          <div className="app-card detail-card fade-in">
            <div className="card-header row space-between">
              <div className="row" style={{ gap: '8px', color: 'var(--primary)' }}>
                <FileText size={18} />
                <h3>Summary</h3>
              </div>
              <button 
                onClick={() => handleCopyToClipboard(paper.summary, 'Summary')}
                className="copy-btn row"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
            <hr className="card-divider" />
            <div className="card-body-text markdown-render text-ink">
              {paper.summary ? (
                paper.summary.split('\n\n').map((para, idx) => {
                  if (para.startsWith('### ')) {
                    return <h4 key={idx} className="summary-heading">{para.replace('### ', '')}</h4>;
                  }
                  if (para.startsWith('- ')) {
                    return (
                      <ul key={idx} className="summary-bullet-list">
                        {para.split('\n').map((li, lidx) => (
                          <li key={lidx}>{li.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx} className="summary-paragraph">{para}</p>;
                })
              ) : (
                <p className="loading-placeholder">AI summary is currently loading...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="app-card detail-card fade-in">
            <div className="card-header row space-between">
              <div className="row" style={{ gap: '8px', color: 'var(--primary)' }}>
                <FileText size={18} />
                <h3>Full Text</h3>
              </div>
              <button 
                onClick={() => handleCopyToClipboard(paper.content, 'Full text')}
                className="copy-btn row"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
            <hr className="card-divider" />
            <div className="card-body-text full-text-pane">
              <p>{paper.content || 'No text extracted from this document.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'citations' && (
          <div className="app-card detail-card fade-in">
            <div className="card-header row space-between">
              <div className="row" style={{ gap: '8px', color: 'var(--primary)' }}>
                <FileText size={18} />
                <h3>References (IEEE)</h3>
              </div>
              {citationsLoaded && !citationsLoading && (
                <button 
                  onClick={() => handleCopyToClipboard(citations, 'Citations list')}
                  className="copy-btn row"
                >
                  <Copy size={14} /> Copy
                </button>
              )}
            </div>
            <hr className="card-divider" />
            <div className="card-body-text citations-pane">
              {citationsLoading ? (
                <div className="citations-loader-inner">
                  <div className="app-loader" />
                  <p>Building IEEE citations list...</p>
                </div>
              ) : (
                <pre>{citations || 'No citations loaded. Click tab to generate.'}</pre>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Floating Bottom Bar Actions */}
      <footer className="detail-bottom-bar row">
        <button 
          onClick={() => navigateTo('cite', paper)} 
          className="secondary-btn flex-1 cite-action-btn"
        >
          <Share2 size={18} /> Cite
        </button>
        <button 
          onClick={() => navigateTo('chat', paper)} 
          className="primary-btn flex-2 chat-action-btn"
        >
          <MessageSquare size={18} /> Chat with Paper
        </button>
      </footer>

      {/* Detail view specific local styling */}
      <style>{`
        .paper-detail-view {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }

        .action-icon-btn {
          background-color: var(--surface);
          border: 1px solid var(--border);
          color: var(--muted);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow);
          transition: var(--transition);
        }

        .action-icon-btn:hover {
          transform: scale(1.05);
          color: var(--primary);
        }

        .paper-title-area h1 {
          font-size: 24px;
          font-weight: 900;
          line-height: 1.35;
        }

        .paper-meta-row {
          align-items: center;
          gap: 16px;
        }

        .paper-authors {
          color: var(--muted);
          font-size: 14.5px;
          font-weight: 500;
        }

        /* Status Pill */
        .status-selector-pill {
          background-color: var(--chip-bg);
          border-radius: 20px;
          padding: 8px 16px;
          cursor: pointer;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--primary-dark);
          transition: var(--transition);
          box-shadow: 0 2px 8px rgba(108,74,224,0.06);
        }

        .status-selector-pill:hover {
          background-color: var(--border);
        }

        .status-dropdown button {
          justify-content: flex-start;
        }

        .active-status {
          background-color: var(--background) !important;
          color: var(--primary) !important;
        }

        .detail-action-dropdown {
          width: 150px;
        }

        /* Tabs Card Panel */
        .detail-card {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          padding: 24px;
        }

        .card-header h3 {
          font-size: 16px;
          font-weight: 800;
        }

        .copy-btn {
          border: none;
          background: none;
          color: var(--muted);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          gap: 6px;
          transition: var(--transition);
        }

        .copy-btn:hover {
          color: var(--primary);
        }

        .card-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 16px 0;
        }

        .card-body-text {
          font-size: 15px;
          line-height: 1.6;
          flex: 1;
        }

        .summary-heading {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
          margin-top: 20px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-heading:first-of-type {
          margin-top: 0;
        }

        .summary-paragraph {
          margin-bottom: 16px;
          color: var(--ink);
        }

        .summary-bullet-list {
          padding-left: 20px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .summary-bullet-list li {
          color: var(--ink);
        }

        .full-text-pane {
          max-height: 480px;
          overflow-y: auto;
          white-space: pre-wrap;
          font-size: 14.5px;
          color: var(--ink);
          padding-right: 8px;
        }

        .citations-pane pre {
          font-family: 'Courier New', Courier, monospace;
          white-space: pre-wrap;
          word-break: break-all;
          font-size: 13.5px;
          color: var(--ink);
        }

        .citations-loader-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 40px 0;
          color: var(--muted);
          font-size: 14px;
        }

        /* Bottom action row */
        .detail-bottom-bar {
          margin-top: 16px;
          gap: 16px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          box-shadow: var(--shadow);
        }

        .cite-action-btn {
          padding: 12px;
        }

        .chat-action-btn {
          padding: 12px;
        }

        .full-screen-loader {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }

        .loader-msg {
          color: var(--muted);
          font-size: 14px;
          margin-top: 16px;
        }

        .error-view {
          text-align: center;
          padding: 56px 0;
        }
      `}</style>
    </div>
  );
}
