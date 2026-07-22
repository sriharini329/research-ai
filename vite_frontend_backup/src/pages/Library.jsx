import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  FileText, 
  Search, 
  Star, 
  BookOpen, 
  StickyNote, 
  MoreVertical, 
  Trash2, 
  BookOpenCheck,
  Bookmark,
  Share2,
  Trash
} from 'lucide-react';

export default function Library({ user, showToast, navigateTo }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Library filters
  const [activeTab, setActiveTab] = useState('all'); // all | favorite | reading | completed | toRead
  const [activeMenuId, setActiveMenuId] = useState(null); // hold id of paper that has active action dropdown menu

  useEffect(() => {
    loadPapers();
  }, [user.id, activeTab]);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (activeTab === 'favorite') filters.favorite = true;
      else if (activeTab === 'reading') filters.status = 'reading';
      else if (activeTab === 'completed') filters.status = 'completed';
      else if (activeTab === 'toRead') filters.status = 'toRead';
      
      const list = await api.getPapers(user.id, filters);
      setPapers(list);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (e, paper) => {
    e.stopPropagation();
    try {
      const result = await api.toggleFavorite(paper.id);
      showToast(result ? 'Added to favorites' : 'Removed from favorites');
      loadPapers();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setActiveMenuId(null);
  };

  const handleStatusChange = async (e, paper, status) => {
    e.stopPropagation();
    try {
      await api.setStatus(paper.id, status);
      showToast(`Status updated to ${status === 'toRead' ? 'To Read' : status === 'reading' ? 'Reading' : 'Completed'}`);
      loadPapers();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setActiveMenuId(null);
  };

  const handleDeletePaper = async (e, paper) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${paper.title}"? This will delete all chat history.`)) {
      return;
    }
    try {
      await api.deletePaper(paper.id);
      showToast('Paper deleted');
      loadPapers();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setActiveMenuId(null);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredPapers = papers.filter(p => {
    const query = searchQuery.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(query);
    const authorMatch = p.authors?.toLowerCase().includes(query);
    const fileMatch = p.file_name?.toLowerCase().includes(query);
    return titleMatch || authorMatch || fileMatch;
  });

  // Calculate counts for headers
  const getFavoritesCount = papers.filter(p => p.is_favorite).length;
  const getReadingCount = papers.filter(p => p.status === 'reading').length;

  return (
    <div className="library-view fade-in">
      <header className="library-header">
        <h1>My Library</h1>
      </header>

      {/* Quick Access Top Header Cards */}
      <section className="library-quick-cards">
        <div className="quick-card pointer" onClick={() => setActiveTab('favorite')}>
          <Star size={22} className="star-icon text-pink" />
          <span className="quick-card-label">Favorites</span>
        </div>
        <div className="quick-card pointer" onClick={() => setActiveTab('reading')}>
          <Bookmark size={22} className="bookmark-icon text-blue" />
          <span className="quick-card-label">Reading</span>
        </div>
        <div className="quick-card pointer" onClick={() => navigateTo('notes')}>
          <StickyNote size={22} className="notes-icon text-orange" />
          <span className="quick-card-label">My Notes</span>
        </div>
      </section>

      {/* Tabs / Filters and Search row */}
      <section className="library-controls row space-between">
        <div className="library-tabs row">
          <button 
            className={`lib-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`lib-tab-btn ${activeTab === 'toRead' ? 'active' : ''}`}
            onClick={() => setActiveTab('toRead')}
          >
            To Read
          </button>
          <button 
            className={`lib-tab-btn ${activeTab === 'reading' ? 'active' : ''}`}
            onClick={() => setActiveTab('reading')}
          >
            Reading
          </button>
          <button 
            className={`lib-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        <div className="lib-search-box row">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search papers..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="lib-search-input"
          />
        </div>
      </section>

      {/* Paper List Content */}
      <section className="library-content flex-1">
        {loading ? (
          <div className="loader-container">
            <div className="app-loader" />
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="app-card empty-library-card">
            <FileText size={48} className="empty-icon" />
            <h3>No papers found</h3>
            <p>
              {searchQuery 
                ? "No documents match your active search terms." 
                : "Your collection is empty. Upload papers to build your library."}
            </p>
            {!searchQuery && (
              <button onClick={() => navigateTo('upload')} className="primary-btn empty-upload-btn">
                Upload Paper
              </button>
            )}
          </div>
        ) : (
          <div className="papers-list">
            {filteredPapers.map(p => (
              <div 
                key={p.id} 
                className="app-card paper-tile library-paper-tile row space-between"
                onClick={() => navigateTo('detail', p)}
              >
                <div className="row flex-1 overflow-hidden" style={{ gap: '16px' }}>
                  <div className="paper-tile-icon">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="row" style={{ gap: '8px' }}>
                      <h4 className="paper-tile-title">{p.title}</h4>
                      {p.is_favorite && <Star size={14} className="star-filled-icon" />}
                    </div>
                    <p className="paper-tile-meta">
                      {p.authors || 'Unknown Authors'} • {p.year || 'N/A'} • {p.file_name}
                    </p>
                  </div>
                </div>

                <div className="row" style={{ gap: '12px' }}>
                  {/* Status chip */}
                  <span className={`status-badge ${p.status}`}>
                    {p.status === 'toRead' ? 'To Read' : p.status === 'reading' ? 'Reading' : 'Completed'}
                  </span>

                  {/* Actions vertical dropdown */}
                  <div className="dropdown-menu-wrapper">
                    <button 
                      className="more-actions-btn"
                      onClick={(e) => toggleMenu(e, p.id)}
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeMenuId === p.id && (
                      <div className="dropdown-menu fade-in" onClick={e => e.stopPropagation()}>
                        <button onClick={(e) => handleFavoriteToggle(e, p)}>
                          <Star size={14} /> 
                          {p.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={(e) => handleStatusChange(e, p, 'toRead')}>
                          <Bookmark size={14} /> Move to "To Read"
                        </button>
                        <button onClick={(e) => handleStatusChange(e, p, 'reading')}>
                          <BookOpen size={14} /> Move to "Reading"
                        </button>
                        <button onClick={(e) => handleStatusChange(e, p, 'completed')}>
                          <BookOpenCheck size={14} /> Move to "Completed"
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={(e) => navigateTo('cite', p)}>
                          <Share2 size={14} /> Cite Paper
                        </button>
                        <button onClick={(e) => navigateTo('notes', p)}>
                          <StickyNote size={14} /> Add Notes
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={(e) => handleDeletePaper(e, p)} className="delete-btn">
                          <Trash size={14} /> Delete Paper
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* local styling for library */}
      <style>{`
        .library-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
        }

        .library-header {
          margin-bottom: 4px;
        }

        .library-header h1 {
          font-size: 26px;
          font-weight: 900;
        }

        /* Top quick cards */
        .library-quick-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .quick-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: var(--shadow);
          transition: var(--transition);
        }

        .quick-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary);
        }

        .quick-card-label {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ink);
        }

        .text-pink { color: var(--pink) !important; }
        .text-blue { color: var(--blue) !important; }
        .text-orange { color: var(--orange) !important; }

        /* Controls bar */
        .library-controls {
          gap: 16px;
          flex-wrap: wrap;
        }

        .library-tabs {
          border-bottom: 2px solid var(--border);
          gap: 16px;
        }

        .lib-tab-btn {
          border: none;
          background: none;
          padding: 8px 12px;
          font-size: 14.5px;
          font-weight: 700;
          color: var(--muted);
          cursor: pointer;
          position: relative;
          transition: var(--transition);
        }

        .lib-tab-btn:hover, .lib-tab-btn.active {
          color: var(--primary);
        }

        .lib-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--primary);
          border-radius: 3px;
        }

        .lib-search-box {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 14px;
          width: 280px;
          box-shadow: var(--shadow);
        }

        @media (max-width: 768px) {
          .lib-search-box {
            width: 100%;
          }
        }

        .search-icon {
          color: var(--muted);
          margin-right: 8px;
        }

        .lib-search-input {
          border: none;
          background: none;
          outline: none;
          color: var(--ink);
          font-size: 14px;
          width: 100%;
        }

        /* Empty state */
        .empty-library-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 56px 24px;
          text-align: center;
          margin-top: 16px;
        }

        .empty-icon {
          color: var(--muted);
          opacity: 0.6;
          margin-bottom: 16px;
        }

        .empty-library-card h3 {
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .empty-library-card p {
          color: var(--muted);
          font-size: 13.5px;
          margin-bottom: 20px;
        }

        /* Paper Tile styling updates */
        .library-paper-tile {
          margin-bottom: 10px;
        }

        .star-filled-icon {
          fill: var(--pink);
          color: var(--pink);
        }

        .status-badge {
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .status-badge.toRead { background-color: rgba(139, 138, 153, 0.12); color: var(--muted); }
        .status-badge.reading { background-color: rgba(59, 130, 246, 0.12); color: #2563EB; }
        .status-badge.completed { background-color: rgba(20, 184, 166, 0.12); color: #0D9488; }

        /* Dropdown options menu */
        .dropdown-menu-wrapper {
          position: relative;
        }

        .more-actions-btn {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .more-actions-btn:hover {
          background-color: var(--chip-bg);
          color: var(--primary);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 36px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 10;
          width: 180px;
          padding: 6px 0;
          display: flex;
          flex-direction: column;
        }

        .dropdown-menu button {
          background: none;
          border: none;
          padding: 10px 16px;
          text-align: left;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: var(--transition);
          width: 100%;
        }

        .dropdown-menu button:hover {
          background-color: var(--background);
          color: var(--primary);
        }

        .dropdown-menu button.delete-btn {
          color: var(--error);
        }

        .dropdown-menu button.delete-btn:hover {
          background-color: rgba(229, 72, 77, 0.08);
          color: var(--error);
        }

        .dropdown-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 4px 0;
        }

        .pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
