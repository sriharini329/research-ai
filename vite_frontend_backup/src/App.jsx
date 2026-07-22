import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navigation from './components/Navigation';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Notes from './pages/Notes';
import PaperDetail from './pages/PaperDetail';
import Chat from './pages/Chat';
import Cite from './pages/Cite';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | search | library | profile
  
  // Sub-navigation state
  const [currentView, setCurrentView] = useState({ name: 'main', data: null }); // name: main | upload | notes | detail | chat | cite
  const [toasts, setToasts] = useState([]);

  // Load active session on startup
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await api.currentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Session fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  // Sync theme to document body class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogout = async () => {
    if (!user) return;
    try {
      await api.logout(user.email);
      setUser(null);
      setActiveTab('dashboard');
      setCurrentView({ name: 'main', data: null });
      showToast('Logged out successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const navigateTo = (viewName, data = null) => {
    setCurrentView({ name: viewName, data });
  };

  const goBack = () => {
    setCurrentView({ name: 'main', data: null });
  };

  // Render current tab/sub-view
  const renderContent = () => {
    if (currentView.name === 'upload') {
      return <Upload user={user} showToast={showToast} goBack={goBack} navigateTo={navigateTo} />;
    }
    if (currentView.name === 'notes') {
      return <Notes user={user} showToast={showToast} goBack={goBack} initialPaper={currentView.data} />;
    }
    if (currentView.name === 'detail') {
      return (
        <PaperDetail 
          user={user} 
          paperId={currentView.data.id} 
          showToast={showToast} 
          goBack={goBack} 
          navigateTo={navigateTo} 
        />
      );
    }
    if (currentView.name === 'chat') {
      return <Chat user={user} paper={currentView.data} showToast={showToast} goBack={goBack} />;
    }
    if (currentView.name === 'cite') {
      return <Cite user={user} paper={currentView.data} showToast={showToast} goBack={goBack} />;
    }

    // Main Tab Views
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} showToast={showToast} navigateTo={navigateTo} setActiveTab={setActiveTab} />;
      case 'search':
        return <Search user={user} showToast={showToast} navigateTo={navigateTo} />;
      case 'library':
        return <Library user={user} showToast={showToast} navigateTo={navigateTo} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            setUser={setUser} 
            showToast={showToast} 
            navigateTo={navigateTo} 
            handleLogout={handleLogout} 
            theme={theme}
            toggleTheme={toggleTheme}
          />
        );
      default:
        return <Dashboard user={user} showToast={showToast} navigateTo={navigateTo} setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: theme === 'dark' ? '#09080F' : '#F6F5FB',
        color: theme === 'dark' ? '#F4F3F6' : '#1E1B2E'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--border)',
          borderTop: '4px solid #6C4AE0',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <p style={{ fontFamily: 'Outfit', fontWeight: 600 }}>Loading ResearchAI...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Auth flow if not logged in
  if (!user) {
    return <Auth setUser={setUser} showToast={showToast} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="app-container">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        goBack={goBack} 
        currentView={currentView}
      />
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Toast Notification Banner */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
