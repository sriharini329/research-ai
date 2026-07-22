import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  UploadCloud, 
  HelpCircle, 
  Search, 
  Folder, 
  Bell, 
  FileText, 
  ChevronRight,
  BookOpen,
  CheckCircle,
  Star,
  StickyNote,
  X
} from 'lucide-react';

export default function Dashboard({ user, showToast, navigateTo, setActiveTab }) {
  const [stats, setStats] = useState({
    total_papers: 0,
    favorites: 0,
    reading: 0,
    completed: 0,
    notes: 0,
    recent_papers: []
  });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    { id: 1, title: 'Welcome to ResearchAI!', text: 'Start by uploading your first research paper in PDF, Docx, or TXT format.', time: 'Just now' },
    { id: 2, title: 'Mock AI Mode Active', text: 'If you have not set your Groq API Key in a .env file, mock answers will be served.', time: '5m ago' },
    { id: 3, title: 'Workspace Initialized', text: 'A local SQLite database has been configured successfully.', time: '1h ago' }
  ];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await api.getDashboard(user.id);
        setStats(data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user.id]);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const actionCards = [
    { id: 'upload', label: 'Upload Paper', desc: 'Add new articles', icon: UploadCloud, color: 'var(--blue)', onClick: () => navigateTo('upload') },
    { id: 'ask', label: 'Ask Question', desc: 'Grounded paper Q&A', icon: HelpCircle, color: 'var(--orange)', onClick: () => {
      // If we have papers, go to chat of the most recent one, otherwise prompt upload
      if (stats.recent_papers.length > 0) {
        navigateTo('chat', stats.recent_papers[0]);
      } else {
        showToast('Please upload a paper first to start chatting.', 'error');
        navigateTo('upload');
      }
    }},
    { id: 'search', label: 'Find Papers', desc: 'Search collections', icon: Search, color: 'var(--teal)', onClick: () => setActiveTab('search') },
    { id: 'library', label: 'My Library', desc: 'View all documents', icon: Folder, color: 'var(--pink)', onClick: () => setActiveTab('library') },
  ];

  return (
    <div className="dashboard-view fade-in">
      {/* Top Header */}
      <header className="dashboard-header row space-between">
        <div>
          <h1>{getGreeting()}, {user.name}!</h1>
          <p className="subtitle">What would you like to do today?</p>
        </div>
        <div className="header-actions">
          <button 
            className="notifications-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={22} />
            <span className="bell-badge">3</span>
          </button>
        </div>
      </header>

      {/* Notifications Drawer Dialog overlay */}
      {showNotifications && (
        <div className="notifications-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notifications-drawer fade-in" onClick={e => e.stopPropagation()}>
            <div className="drawer-header row space-between">
              <h3>System Notifications</h3>
              <button className="close-btn" onClick={() => setShowNotifications(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">
              {mockNotifications.map(n => (
                <div key={n.id} className="notification-item">
                  <div className="row space-between">
                    <span className="notification-title">{n.title}</span>
                    <span className="notification-time">{n.time}</span>
                  </div>
                  <p className="notification-text">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Grid */}
      <section className="action-grid">
        {actionCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="app-card action-card" onClick={c.onClick}>
              <div 
                className="action-card-icon-container" 
                style={{ backgroundColor: c.color + '1F', color: c.color }}
              >
                <Icon size={24} />
              </div>
              <h3 className="action-card-label">{c.label}</h3>
              <p className="action-card-desc">{c.desc}</p>
            </div>
          );
        })}
      </section>

      {/* Analytics Metric Cards */}
      <section className="dashboard-metrics">
        <div className="metric-card bg-surface" onClick={() => setActiveTab('library')}>
          <div className="metric-row row">
            <div className="metric-icon-box blue"><BookOpen size={18} /></div>
            <div className="metric-info">
              <span className="metric-value">{stats.total_papers}</span>
              <span className="metric-label">Total Papers</span>
            </div>
          </div>
        </div>
        <div className="metric-card bg-surface" onClick={() => setActiveTab('library')}>
          <div className="metric-row row">
            <div className="metric-icon-box pink"><Star size={18} /></div>
            <div className="metric-info">
              <span className="metric-value">{stats.favorites}</span>
              <span className="metric-label">Favorites</span>
            </div>
          </div>
        </div>
        <div className="metric-card bg-surface" onClick={() => setActiveTab('library')}>
          <div className="metric-row row">
            <div className="metric-icon-box orange"><BookOpen size={18} /></div>
            <div className="metric-info">
              <span className="metric-value">{stats.reading}</span>
              <span className="metric-label">Reading</span>
            </div>
          </div>
        </div>
        <div className="metric-card bg-surface" onClick={() => setActiveTab('library')}>
          <div className="metric-row row">
            <div className="metric-icon-box teal"><CheckCircle size={18} /></div>
            <div className="metric-info">
              <span className="metric-value">{stats.completed}</span>
              <span className="metric-label">Completed</span>
            </div>
          </div>
        </div>
        <div className="metric-card bg-surface" onClick={() => navigateTo('notes')}>
          <div className="metric-row row">
            <div className="metric-icon-box yellow"><StickyNote size={18} /></div>
            <div className="metric-info">
              <span className="metric-value">{stats.notes}</span>
              <span className="metric-label">Saved Notes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Papers List */}
      <section className="recent-papers-section">
        <h2 className="section-title">Recent Papers</h2>
        {loading ? (
          <div className="loader-container">
            <div className="app-loader" />
          </div>
        ) : stats.recent_papers.length === 0 ? (
          <div className="app-card empty-dashboard-card">
            <FileText size={48} className="empty-card-icon" />
            <h3>No papers yet</h3>
            <p>Upload your first research paper to get started</p>
            <button onClick={() => navigateTo('upload')} className="primary-btn empty-upload-btn">
              <UploadCloud size={16} /> Upload First Paper
            </button>
          </div>
        ) : (
          <div className="recent-list">
            {stats.recent_papers.map(p => (
              <div 
                key={p.id} 
                className="app-card paper-tile"
                onClick={() => navigateTo('detail', p)}
              >
                <div className="paper-tile-icon">
                  <FileText size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="paper-tile-title">{p.title}</h4>
                  <p className="paper-tile-meta">
                    {p.authors || 'Unknown Authors'} • {p.year || 'N/A'} • {p.status === 'toRead' ? 'To Read' : p.status === 'reading' ? 'Reading' : 'Completed'}
                  </p>
                </div>
                <div className="paper-tile-action">
                  <ChevronRight size={20} className="arrow-icon" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* local styling for dashboard */}
      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-header {
          margin-bottom: 8px;
        }

        .dashboard-header h1 {
          font-size: 26px;
          font-weight: 900;
        }

        .subtitle {
          color: var(--muted);
          font-size: 15px;
          margin-top: 4px;
        }

        .notifications-bell {
          background-color: var(--surface);
          border: 1px solid var(--border);
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink);
          cursor: pointer;
          position: relative;
          box-shadow: var(--shadow);
          transition: var(--transition);
        }

        .notifications-bell:hover {
          transform: scale(1.05);
          color: var(--primary);
        }

        .bell-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: var(--error);
          color: white;
          font-size: 10px;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          border-radius: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--surface);
        }

        /* Notifications Overlay Panel */
        .notifications-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(9, 8, 15, 0.25);
          backdrop-filter: blur(2px);
          z-index: 1000;
        }

        .notifications-drawer {
          position: absolute;
          top: 80px;
          right: 32px;
          width: 360px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 20px;
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .notifications-drawer {
            top: 60px;
            right: 16px;
            width: calc(100vw - 32px);
          }
        }

        .drawer-header h3 {
          font-size: 16px;
          font-weight: 800;
        }

        .close-btn {
          border: none;
          background: none;
          color: var(--muted);
          cursor: pointer;
        }

        .notification-item {
          border-bottom: 1px solid var(--border);
          padding-bottom: 12px;
        }

        .notification-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .notification-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ink);
        }

        .notification-time {
          font-size: 11px;
          color: var(--muted);
        }

        .notification-text {
          font-size: 12.5px;
          color: var(--muted);
          margin-top: 4px;
          line-height: 1.4;
        }

        /* Action card descriptions */
        .action-card-desc {
          font-size: 12.5px;
          color: var(--muted);
          margin-top: 4px;
        }

        /* Analytics counters row */
        .dashboard-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .metric-card {
          flex: 1;
          min-width: 140px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: var(--transition);
        }

        .metric-card:hover {
          transform: translateY(-1px);
          border-color: var(--primary);
        }

        .metric-icon-box {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
        }

        .metric-icon-box.blue { background-color: rgba(59, 130, 246, 0.1); color: var(--blue); }
        .metric-icon-box.pink { background-color: rgba(236, 72, 153, 0.1); color: var(--pink); }
        .metric-icon-box.orange { background-color: rgba(245, 158, 11, 0.1); color: var(--orange); }
        .metric-icon-box.teal { background-color: rgba(20, 184, 166, 0.1); color: var(--teal); }
        .metric-icon-box.yellow { background-color: rgba(245, 158, 11, 0.15); color: #D97706; }

        .metric-info {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.1;
        }

        .metric-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          margin-top: 2px;
        }

        /* Recent Papers section styles */
        .section-title {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 16px;
        }

        .empty-dashboard-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .empty-card-icon {
          color: var(--muted);
          opacity: 0.6;
          margin-bottom: 16px;
        }

        .empty-dashboard-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .empty-dashboard-card p {
          font-size: 13.5px;
          color: var(--muted);
          margin-bottom: 20px;
        }

        .empty-upload-btn {
          width: auto;
          padding: 10px 20px;
          font-size: 13.5px;
        }

        .arrow-icon {
          color: var(--muted);
          transition: var(--transition);
        }

        .paper-tile:hover .arrow-icon {
          transform: translateX(4px);
          color: var(--primary);
        }

        .loader-container {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }

        .app-loader {
          width: 32px;
          height: 32px;
          border: 3.5px solid var(--border);
          border-top: 3.5px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .bg-surface {
          background-color: var(--surface);
        }

        .overflow-hidden {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
