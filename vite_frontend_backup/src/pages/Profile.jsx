import React, { useState } from 'react';
import { api } from '../api';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LifeBuoy, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  Sun, 
  Moon, 
  Lock, 
  X, 
  Check, 
  ChevronRight,
  BrainCircuit,
  MessageSquareShare
} from 'lucide-react';

export default function Profile({ user, setUser, showToast, navigateTo, handleLogout, theme, toggleTheme }) {
  const [name, setName] = useState(user.name);
  const [selectedInterests, setSelectedInterests] = useState(user.interests || []);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Dialog Overlays
  const [activeModal, setActiveModal] = useState(null); // null | password | support | help | feedback | terms | privacy

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const interestsList = [
    'AI / ML', 'Data Science', 'NLP', 'Computer Vision',
    'Healthcare', 'Education', 'Robotics', 'Cybersecurity',
    'Blockchain', 'IoT', 'Other'
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUpdating(true);
    try {
      await api.updateProfile(user.id, { name: name.trim(), interests: selectedInterests });
      setUser(prev => ({ ...prev, name: name.trim(), interests: selectedInterests }));
      showToast('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.changePassword(user.id, currentPassword, newPassword);
      showToast('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveModal(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  return (
    <div className="profile-view fade-in">
      <header className="profile-header">
        <h1>My Profile</h1>
      </header>

      {/* User Info Overview Header Card */}
      <section className="app-card user-overview-card row space-between">
        <div className="row" style={{ gap: '18px' }}>
          <div className="avatar-circle">
            <User size={32} />
          </div>
          <div>
            <h2 className="user-name-title">{user.name}</h2>
            <p className="user-email-subtitle">{user.email}</p>
          </div>
        </div>
        
        <button 
          className="secondary-btn edit-profile-toggle-btn"
          onClick={() => {
            setName(user.name);
            setSelectedInterests(user.interests || []);
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </section>

      {/* Profile Editor (Inline edit block) */}
      {isEditing && (
        <section className="app-card editor-card fade-in">
          <h3>Edit Profile Information</h3>
          <form onSubmit={handleUpdateProfile} style={{ marginTop: '16px' }}>
            <div className="auth-field">
              <label className="input-label">Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field input-field-no-icon"
                required
              />
            </div>

            <div className="auth-field" style={{ marginTop: '16px' }}>
              <label className="input-label">Research Interests</label>
              <div className="interests-selection-row">
                {interestsList.map(interest => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`interest-tag-btn ${active ? 'active' : ''}`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={updating} className="primary-btn save-profile-btn">
              {updating ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </section>
      )}

      {/* Settings Options List */}
      <section className="settings-list-section">
        <div className="settings-list bg-surface-card">
          {/* Theme switcher option */}
          <div className="settings-item row space-between">
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              {theme === 'dark' ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--primary)" />}
              <span>Theme Preference</span>
            </div>
            <button className="theme-toggle-pill row" onClick={toggleTheme}>
              <span className={`theme-pill-slider ${theme === 'dark' ? 'dark' : ''}`} />
              <span className="pill-option active-label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          <div className="settings-item row space-between pointer" onClick={() => setActiveModal('password')}>
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              <Lock size={20} color="var(--primary)" />
              <span>Change Password</span>
            </div>
            <ChevronRight size={18} className="arrow-muted" />
          </div>

          <div className="settings-item row space-between pointer" onClick={() => setActiveModal('support')}>
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              <LifeBuoy size={20} color="var(--primary)" />
              <span>Contact Support</span>
            </div>
            <ChevronRight size={18} className="arrow-muted" />
          </div>

          <div className="settings-item row space-between pointer" onClick={() => setActiveModal('help')}>
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              <HelpCircle size={20} color="var(--primary)" />
              <span>Help Center & FAQs</span>
            </div>
            <ChevronRight size={18} className="arrow-muted" />
          </div>

          <div className="settings-item row space-between pointer" onClick={() => setActiveModal('feedback')}>
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              <MessageSquareShare size={20} color="var(--primary)" />
              <span>Submit Feedback</span>
            </div>
            <ChevronRight size={18} className="arrow-muted" />
          </div>

          <div className="settings-item row space-between pointer" onClick={() => setActiveModal('terms')}>
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              <FileText size={20} color="var(--primary)" />
              <span>Terms of Service</span>
            </div>
            <ChevronRight size={18} className="arrow-muted" />
          </div>

          <div className="settings-item row space-between pointer" onClick={() => setActiveModal('privacy')}>
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <span>Privacy Policy</span>
            </div>
            <ChevronRight size={18} className="arrow-muted" />
          </div>

          <hr className="settings-divider" />

          {/* Logout button */}
          <div className="settings-item row space-between pointer text-error" onClick={handleLogout}>
            <div className="row settings-item-label" style={{ gap: '14px' }}>
              <LogOut size={20} />
              <span>Log Out</span>
            </div>
          </div>
        </div>
      </section>

      {/* DIALOG OVERLAYS PANEL */}

      {/* Change password modal */}
      {activeModal === 'password' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header row space-between">
              <h3>Change Password</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleChangePassword} style={{ marginTop: '20px' }} className="row-column-gap">
              <div className="auth-field">
                <label className="input-label">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="input-field input-field-no-icon"
                  required
                />
              </div>
              <div className="auth-field" style={{ marginTop: '14px' }}>
                <label className="input-label">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input-field input-field-no-icon"
                  required
                />
              </div>
              <div className="auth-field" style={{ marginTop: '14px' }}>
                <label className="input-label">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input-field input-field-no-icon"
                  required
                />
              </div>
              <button type="submit" disabled={passwordLoading} className="primary-btn" style={{ marginTop: '24px' }}>
                {passwordLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Support details modal */}
      {activeModal === 'support' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content text-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header row space-between">
              <h3>Contact Support</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <div className="dialog-body-text" style={{ marginTop: '20px' }}>
              <p>Need assistance or ran into a bug? Our engineering support team is here to help.</p>
              <div className="support-details-box">
                <span className="support-detail-label">Support Email:</span>
                <strong className="support-detail-value">support@researchai.io</strong>
                <span className="support-detail-label" style={{ marginTop: '12px' }}>Operational Hours:</span>
                <strong className="support-detail-value">9:00 AM – 6:00 PM EST, Mon-Fri</strong>
              </div>
              <p className="support-notice">We aim to respond to all inquiries within 24 business hours.</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Center details modal */}
      {activeModal === 'help' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content text-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header row space-between">
              <h3>Help Center & FAQ</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <div className="dialog-body-text help-dialog" style={{ marginTop: '20px' }}>
              <div className="faq-item">
                <h4>How do I upload research papers?</h4>
                <p>Navigate to the "Upload Paper" action on the Home dashboard or Library. Select a PDF, DOCX, or TXT file. The system will parse the text and prepare an AI summary.</p>
              </div>
              <div className="faq-item">
                <h4>Is my uploaded data private?</h4>
                <p>Yes. All uploaded documents are parsed client-side and saved into your private database space. We do not use your papers for public model training.</p>
              </div>
              <div className="faq-item">
                <h4>Why is AI Chat responding in Mock Mode?</h4>
                <p>This happens when no Groq API Key has been configured in the backend environment. Set `GROQ_API_KEYS` in your workspace `.env` file to activate live Llama analysis.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit feedback details modal */}
      {activeModal === 'feedback' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content text-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header row space-between">
              <h3>Submit Feedback</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              showToast("Feedback submitted! Thank you.");
              setActiveModal(null);
            }} style={{ marginTop: '20px' }} className="row-column-gap">
              <p>We value your ideas! Tell us what you like or what features we should build next.</p>
              <textarea 
                placeholder="Share your thoughts here..." 
                className="note-textarea"
                rows={5}
                required
                style={{ marginTop: '12px' }}
              />
              <button type="submit" className="primary-btn" style={{ marginTop: '20px' }}>
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Terms of Service modal */}
      {activeModal === 'terms' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content text-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header row space-between">
              <h3>Terms of Service</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <div className="dialog-body-text legal-scroll" style={{ marginTop: '20px' }}>
              <h4>1. Acceptance of Terms</h4>
              <p>By registering for and using ResearchAI, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must refrain from using the platform.</p>
              <h4>2. Permitted Use</h4>
              <p>ResearchAI provides academic tools for document parsing, summarization, and citation export. Users are responsible for complying with the copyright licenses of uploaded research articles.</p>
              <h4>3. Limitation of Liability</h4>
              <p>ResearchAI is provided "as is". AI summaries, citation formatting, and chatbot answers are generated for convenience and must be verified by academic authors before publication.</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy modal */}
      {activeModal === 'privacy' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content text-left" onClick={e => e.stopPropagation()}>
            <div className="modal-header row space-between">
              <h3>Privacy Policy</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}><X size={18} /></button>
            </div>
            <div className="dialog-body-text legal-scroll" style={{ marginTop: '20px' }}>
              <h4>1. Data Collection</h4>
              <p>We store your account credentials, interests, uploaded documents, citations, and research notes in a local SQLite database space to enable offline-ready services.</p>
              <h4>2. Data Processing</h4>
              <p>Text extraction is done client-side within your browser. Analysis summaries and chat grounding requests are compiled and sent directly to the Groq APIs if an API key is set.</p>
              <h4>3. Data Integrity</h4>
              <p>We do not share, sell, or analyze your research papers for commercial targeting. Your data belongs strictly to you.</p>
            </div>
          </div>
        </div>
      )}

      {/* local styling for profile */}
      <style>{`
        .profile-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .profile-header {
          margin-bottom: 4px;
        }

        .profile-header h1 {
          font-size: 26px;
          font-weight: 900;
        }

        /* Overview card */
        .user-overview-card {
          padding: 24px;
          align-items: center;
        }

        .avatar-circle {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7C4DFF, #5E35E0);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 14px rgba(108,74,224,0.3);
        }

        .user-name-title {
          font-size: 20px;
          font-weight: 800;
        }

        .user-email-subtitle {
          color: var(--muted);
          font-size: 14px;
          margin-top: 2px;
        }

        .edit-profile-toggle-btn {
          width: auto;
          padding: 8px 18px;
          font-size: 13.5px;
        }

        /* Editor Card */
        .editor-card h3 {
          font-size: 15px;
          font-weight: 800;
        }

        .interests-selection-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .save-profile-btn {
          margin-top: 24px;
        }

        /* Settings Options List */
        .bg-surface-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .settings-item {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          transition: var(--transition);
        }

        .settings-item:last-child {
          border-bottom: none;
        }

        .settings-item:hover:not(.text-error) {
          background-color: var(--background);
        }

        .settings-item-label {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--ink);
        }

        .arrow-muted {
          color: var(--muted);
        }

        .settings-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 0;
        }

        .text-error {
          color: var(--error) !important;
        }

        .text-error:hover {
          background-color: rgba(229, 72, 77, 0.06);
        }

        .text-error span {
          color: var(--error) !important;
        }

        /* Theme Toggle Pill Slider button */
        .theme-toggle-pill {
          background-color: var(--chip-bg);
          border: 1px solid var(--border);
          border-radius: 20px;
          width: 82px;
          height: 32px;
          position: relative;
          padding: 0 10px;
          justify-content: flex-end;
          cursor: pointer;
        }

        .theme-pill-slider {
          position: absolute;
          left: 4px;
          top: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--primary);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(108,74,224,0.3);
        }

        .theme-pill-slider.dark {
          transform: translateX(50px);
        }

        .pill-option {
          font-size: 11px;
          font-weight: 800;
          color: var(--muted);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .pill-option:first-of-type {
          left: 12px;
        }

        .pill-option.active-label {
          color: var(--primary-dark);
          right: 12px;
        }

        /* Support dialog text styling */
        .dialog-body-text {
          font-size: 14.5px;
          color: var(--muted);
          line-height: 1.55;
        }

        .support-details-box {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          margin: 16px 0;
          display: flex;
          flex-direction: column;
        }

        .support-detail-label {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
        }

        .support-detail-value {
          font-size: 15px;
          color: var(--ink);
          margin-top: 2px;
        }

        .support-notice {
          font-size: 12px;
          text-align: center;
        }

        /* FAQ list styling */
        .help-dialog {
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .faq-item h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .faq-item p {
          font-size: 13px;
          color: var(--muted);
        }

        /* Legal scroll formatting */
        .legal-scroll {
          max-height: 350px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .legal-scroll h4 {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ink);
          margin-top: 16px;
          margin-bottom: 4px;
        }

        .legal-scroll p {
          font-size: 12.5px;
          color: var(--muted);
          margin-bottom: 12px;
        }

        .legal-scroll h4:first-of-type {
          margin-top: 0;
        }

        .text-left {
          text-align: left;
        }

        .row-column-gap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
