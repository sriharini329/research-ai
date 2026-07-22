import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search as SearchIcon, FileText, ChevronRight, SlidersHorizontal, Star } from 'lucide-react';

export default function Search({ user, showToast, navigateTo }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  
  // Search Filter status
  const [statusFilter, setStatusFilter] = useState('all'); // all | toRead | reading | completed
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAllPapers();
  }, [user.id]);

  const loadAllPapers = async () => {
    try {
      const list = await api.getPapers(user.id);
      setPapers(list);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPapers = papers.filter(p => {
    const q = query.toLowerCase();
    
    // Text search matching
    const matchesQuery = 
      p.title?.toLowerCase().includes(q) || 
      p.authors?.toLowerCase().includes(q) ||
      p.year?.toLowerCase().includes(q) ||
      p.file_name?.toLowerCase().includes(q);

    // Status matching
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="search-view fade-in">
      {/* Top Header */}
      <header className="search-header row space-between">
        <h1>Find Papers</h1>
        <button 
          className={`filter-toggle-btn row ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
      </header>

      {/* Search Input Box */}
      <section className="search-input-area">
        <div className="search-input-wrapper row">
          <SearchIcon size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search papers by title, author, year..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input-field"
          />
        </div>

        {/* Expandable filters drawer */}
        {showFilters && (
          <div className="filters-panel app-card fade-in">
            <h4>Filter by Reading Status</h4>
            <div className="filter-chips-row row">
              <button 
                className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'toRead' ? 'active' : ''}`}
                onClick={() => setStatusFilter('toRead')}
              >
                To Read
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'reading' ? 'active' : ''}`}
                onClick={() => statusFilter !== 'reading' ? setStatusFilter('reading') : setStatusFilter('all')}
              >
                Reading
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Results List */}
      <section className="search-results flex-1">
        {loading ? (
          <div className="loader-container">
            <div className="app-loader" />
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="search-empty-results">
            <p>
              {query 
                ? `No papers found matching "${query}"`
                : "Search across your uploaded research files."}
            </p>
          </div>
        ) : (
          <div className="results-list">
            {filteredPapers.map(p => (
              <div 
                key={p.id} 
                className="app-card paper-tile row space-between"
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
                      {p.authors || 'Unknown Authors'} {p.year ? `(${p.year})` : ''} • {p.status === 'toRead' ? 'To Read' : p.status === 'reading' ? 'Reading' : 'Completed'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="arrow-muted" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* local styling for search */}
      <style>{`
        .search-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
        }

        .search-header h1 {
          font-size: 26px;
          font-weight: 900;
        }

        .filter-toggle-btn {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 16px;
          color: var(--muted);
          cursor: pointer;
          gap: 8px;
          font-size: 13.5px;
          font-weight: 700;
          box-shadow: var(--shadow);
          transition: var(--transition);
        }

        .filter-toggle-btn:hover, .filter-toggle-btn.active {
          color: var(--primary);
          border-color: var(--primary);
        }

        .search-input-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .search-input-wrapper {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 18px;
          box-shadow: var(--shadow);
        }

        .search-icon {
          color: var(--muted);
          margin-right: 12px;
        }

        .search-input-field {
          border: none;
          background: none;
          outline: none;
          font-size: 15px;
          color: var(--ink);
          width: 100%;
        }

        /* Filter Panel */
        .filters-panel {
          padding: 16px;
          background-color: var(--surface);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filters-panel h4 {
          font-size: 12.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 0.5px;
        }

        .filter-chips-row {
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-chip {
          border: 1px solid var(--border);
          background-color: var(--background);
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 700;
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: var(--transition);
        }

        .filter-chip:hover, .filter-chip.active {
          background-color: var(--chip-bg);
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Empty state styling */
        .search-empty-results {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          text-align: center;
          color: var(--muted);
          font-size: 14.5px;
        }

        .star-filled-icon {
          fill: var(--pink);
          color: var(--pink);
        }

        .arrow-muted {
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
