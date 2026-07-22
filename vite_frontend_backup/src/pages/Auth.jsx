import React, { useState } from 'react';
import { api } from '../api';
import { Brain, Mail, Lock, User, Eye, EyeOff, KeyRound, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function Auth({ setUser, showToast, theme, toggleTheme }) {
  const [mode, setMode] = useState('login'); // login | signup | interests | forgot
  const [loading, setLoading] = useState(false);
  const [obscure, setObscure] = useState(true);

  // Field states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [tempUser, setTempUser] = useState(null); // hold user object after signup to choose interests

  // Interest options
  const interestsList = [
    'AI / ML', 'Data Science', 'NLP', 'Computer Vision',
    'Healthcare', 'Education', 'Robotics', 'Cybersecurity',
    'Blockchain', 'IoT', 'Other'
  ];
  const [selectedInterests, setSelectedInterests] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await api.login(email.trim(), password);
      setUser(user);
      showToast(`Welcome back, ${user.name}!`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await api.signup(name.trim(), email.trim(), password);
      setTempUser(user);
      setMode('interests');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email.trim() || !newPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email.trim(), newPassword);
      showToast('Password reset successfully. You can now login.');
      setMode('login');
      setPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInterestsSubmit = async () => {
    if (!tempUser) return;
    setLoading(true);
    try {
      await api.updateProfile(tempUser.id, { interests: selectedInterests });
      setUser({ ...tempUser, interests: selectedInterests });
      showToast(`Welcome to ResearchAI, ${tempUser.name}!`);
    } catch (err) {
      // non-blocking fallback if update fails
      setUser({ ...tempUser, interests: selectedInterests });
    } finally {
      setLoading(false);
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
    <div className="auth-page-container">
      {/* Theme Toggle Button */}
      <button onClick={toggleTheme} className="auth-theme-toggle">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="auth-card fade-in">
        {/* Main Logo Container */}
        {mode !== 'interests' && (
          <div className="auth-logo-wrapper">
            <div className="auth-logo">
              <Brain size={38} color="#FFFFFF" />
            </div>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <>
            <div className="auth-header">
              <h1>Welcome Back!</h1>
              <p>Login to continue</p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-field">
                <label className="input-label">Email</label>
                <div className="input-field-wrapper">
                  <span className="input-field-icon">@</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="input-label">Password</label>
                <div className="input-field-wrapper">
                  <KeyRound className="input-field-icon" size={18} />
                  <input
                    type={obscure ? 'password' : 'text'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setObscure(!obscure)}
                    className="password-suffix"
                  >
                    {obscure ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-forgot-link">
                <button type="button" onClick={() => setMode('forgot')}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-footer">
              <span>Don't have an account? </span>
              <button onClick={() => setMode('signup')} className="text-link-btn">
                Sign Up
              </button>
            </div>
          </>
        )}

        {/* SIGNUP MODE */}
        {mode === 'signup' && (
          <>
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Sign up to start analyzing papers</p>
            </div>

            <form onSubmit={handleSignup} className="auth-form">
              <div className="auth-field">
                <label className="input-label">Name</label>
                <div className="input-field-wrapper">
                  <User className="input-field-icon" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="input-label">Email</label>
                <div className="input-field-wrapper">
                  <span className="input-field-icon">@</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="input-label">Password</label>
                <div className="input-field-wrapper">
                  <KeyRound className="input-field-icon" size={18} />
                  <input
                    type={obscure ? 'password' : 'text'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setObscure(!obscure)}
                    className="password-suffix"
                  >
                    {obscure ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? 'Creating...' : 'Sign Up'}
              </button>
            </form>

            <div className="auth-footer">
              <span>Already have an account? </span>
              <button onClick={() => setMode('login')} className="text-link-btn">
                Login
              </button>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <>
            <div className="auth-header">
              <h1>Reset Password</h1>
              <p>Enter email and choose a new password</p>
            </div>

            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-field">
                <label className="input-label">Registered Email</label>
                <div className="input-field-wrapper">
                  <span className="input-field-icon">@</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="Enter account email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="input-label">New Password</label>
                <div className="input-field-wrapper">
                  <KeyRound className="input-field-icon" size={18} />
                  <input
                    type={obscure ? 'password' : 'text'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setObscure(!obscure)}
                    className="password-suffix"
                  >
                    {obscure ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? 'Resetting...' : 'Update Password'}
              </button>
            </form>

            <div className="auth-footer">
              <button onClick={() => setMode('login')} className="text-link-btn flex-center gap-1">
                <ArrowLeft size={16} /> Back to Login
              </button>
            </div>
          </>
        )}

        {/* INTERESTS SELECTION ONBOARDING */}
        {mode === 'interests' && (
          <div className="interests-onboarding">
            <h1>Select Your Interests</h1>
            <p className="interests-subtitle">Choose your research areas to customize your feed</p>
            
            <div className="interests-tags-container">
              {interestsList.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`interest-tag-btn ${isSelected ? 'active' : ''}`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleInterestsSubmit} 
              disabled={loading} 
              className="primary-btn interests-continue-btn"
            >
              {loading ? 'Saving...' : 'Continue to Workspace'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        .auth-page-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--background);
          z-index: 1000;
          overflow-y: auto;
          padding: 20px;
        }

        .auth-theme-toggle {
          position: absolute;
          top: 24px;
          right: 24px;
          border: 1px solid var(--border);
          background-color: var(--surface);
          color: var(--ink);
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

        .auth-theme-toggle:hover {
          transform: scale(1.05);
        }

        .auth-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
        }

        .auth-logo-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .auth-logo {
          width: 76px;
          height: 76px;
          background: linear-gradient(135deg, #7C4DFF, #5E35E0);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(108, 74, 224, 0.35);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-header h1 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .auth-header p {
          color: var(--muted);
          font-size: 15px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-field {
          text-align: left;
        }

        .auth-forgot-link {
          text-align: right;
          margin-top: -6px;
        }

        .auth-forgot-link button {
          border: none;
          background: none;
          color: var(--primary);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }

        .auth-forgot-link button:hover {
          text-decoration: underline;
        }

        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: var(--muted);
        }

        .text-link-btn {
          border: none;
          background: none;
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
        }

        .text-link-btn:hover {
          text-decoration: underline;
        }

        .flex-center {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gap-1 {
          gap: 6px;
        }

        /* Interests onboarding screen styles */
        .interests-onboarding h1 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
          text-align: center;
        }

        .interests-subtitle {
          color: var(--muted);
          font-size: 14px;
          margin-bottom: 28px;
          text-align: center;
        }

        .interests-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 32px;
          justify-content: center;
        }

        .interest-tag-btn {
          border: none;
          background-color: var(--chip-bg);
          color: var(--ink);
          font-size: 14px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 30px;
          cursor: pointer;
          transition: var(--transition);
        }

        .interest-tag-btn.active {
          background: linear-gradient(135deg, #7C4DFF, #5E35E0);
          color: white;
          box-shadow: 0 4px 10px rgba(108, 74, 224, 0.25);
        }

        .interest-tag-btn:hover:not(.active) {
          background-color: var(--border);
        }

        .interests-continue-btn {
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
