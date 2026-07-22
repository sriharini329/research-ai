import React from 'react';
import { Home, Search, Folder, User, BrainCircuit } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, goBack, currentView }) {
  const items = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Folder },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <BrainCircuit size={24} />
          </div>
          <span className="brand-name">ResearchAI</span>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && currentView.name === 'main';
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  goBack(); // Close any active sub-view
                }}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && currentView.name === 'main';
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                goBack(); // Close any active sub-view
              }}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* CSS Styles Local to Navigation */}
      <style>{`
        /* Sidebar styles */
        .desktop-sidebar {
          width: 260px;
          background-color: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 24px;
          height: 100vh;
          transition: var(--transition);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7C4DFF, #5E35E0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--ink);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border: none;
          background: none;
          border-radius: var(--radius-md);
          color: var(--muted);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
          width: 100%;
        }

        .sidebar-nav-item:hover {
          background-color: var(--background);
          color: var(--primary);
        }

        .sidebar-nav-item.active {
          background-color: var(--chip-bg);
          color: var(--primary);
        }

        /* Mobile bottom nav styles */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background-color: var(--surface);
          border-top: 1px solid var(--border);
          justify-content: space-around;
          align-items: center;
          z-index: 100;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: none;
          background: none;
          color: var(--muted);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          flex: 1;
          height: 100%;
        }

        .mobile-nav-item.active {
          color: var(--primary);
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none;
          }
          .mobile-bottom-nav {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
