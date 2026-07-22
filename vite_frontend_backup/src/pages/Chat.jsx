import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';

export default function Chat({ user, paper, showToast, goBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answering, setAnswering] = useState(false);
  const scrollRef = useRef(null);

  const presets = [
    'What is the main contribution of this paper?',
    'Explain the methodology simply',
    'What are the limitations?'
  ];

  useEffect(() => {
    loadChatHistory();
  }, [paper.id]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getChat(paper.id);
      // Map API role mapping to front end props (role === 'user' => isUser = true)
      setMessages(history.map(m => ({
        id: m.id,
        text: m.text,
        isUser: m.role === 'user'
      })));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, answering]);

  const handleSend = async (textToSend) => {
    const q = (textToSend || question).trim();
    if (!q || answering) return;

    setQuestion('');
    setMessages(prev => [...prev, { text: q, isUser: true }]);
    setAnswering(true);
    
    try {
      const answer = await api.askPaper(paper.id, user.id, q);
      setMessages(prev => [...prev, { text: answer, isUser: false }]);
    } catch (err) {
      showToast(err.message, 'error');
      setMessages(prev => [...prev, { text: `Error: ${err.message}`, isUser: false }]);
    } finally {
      setAnswering(false);
    }
  };

  return (
    <div className="chat-view fade-in">
      {/* Header */}
      <header className="chat-header row">
        <button className="back-btn" onClick={goBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="chat-header-title overflow-hidden">
          <h2>Chat with Paper</h2>
          <p className="chat-subtitle">{paper.title}</p>
        </div>
      </header>

      {/* Message Screen Area */}
      <section className="chat-message-pane flex-1" ref={scrollRef}>
        {loading ? (
          <div className="loader-container">
            <div className="app-loader" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <Sparkles size={28} />
            </div>
            <h3>Ask anything about this paper</h3>
            <p>I will answer grounded strictly in the contents of the document.</p>
            
            <div className="chat-presets-grid">
              {presets.map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(p)}
                  className="preset-btn"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.isUser ? 'user' : 'ai'}`}>
                {m.text}
              </div>
            ))}
            {answering && (
              <div className="chat-bubble ai typing-indicator">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Message Input Composer Footer */}
      <footer className="chat-input-composer row">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="composer-form row"
        >
          <input 
            type="text" 
            placeholder="Ask a question..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            disabled={answering || loading}
            className="composer-input"
          />
          <button 
            type="submit" 
            disabled={answering || !question.trim()}
            className="composer-send-btn row"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>

      {/* local styling for chat */}
      <style>{`
        .chat-view {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .chat-header {
          gap: 16px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }

        .chat-header-title {
          flex: 1;
        }

        .chat-header h2 {
          font-size: 18px;
        }

        .chat-subtitle {
          color: var(--muted);
          font-size: 12.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        /* Message panel */
        .chat-message-pane {
          overflow-y: auto;
          padding: 24px 8px;
          display: flex;
          flex-direction: column;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
        }

        .chat-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 16px;
          margin: auto;
          max-width: 440px;
        }

        .chat-empty-icon {
          width: 56px;
          height: 56px;
          background-color: var(--primary-glow);
          color: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .chat-empty-state h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .chat-empty-state p {
          color: var(--muted);
          font-size: 13.5px;
          margin-bottom: 24px;
          line-height: 1.4;
        }

        .chat-presets-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .preset-btn {
          border: none;
          background-color: var(--chip-bg);
          color: var(--primary-dark);
          font-size: 13.5px;
          font-weight: 600;
          padding: 12px 16px;
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          transition: var(--transition);
          width: 100%;
        }

        .preset-btn:hover {
          background-color: var(--border);
          transform: translateY(-1px);
        }

        /* Composer inputs */
        .chat-input-composer {
          padding: 12px 16px;
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
          margin-top: 16px;
        }

        .composer-form {
          width: 100%;
          gap: 12px;
        }

        .composer-input {
          flex: 1;
          border: none;
          background-color: var(--background);
          padding: 12px 16px;
          border-radius: 24px;
          outline: none;
          font-size: 14.5px;
          color: var(--ink);
          transition: var(--transition);
        }

        .composer-input:focus {
          box-shadow: inset 0 0 0 1px var(--primary);
        }

        .composer-send-btn {
          border: none;
          background: linear-gradient(135deg, #7C4DFF, #5E35E0);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 10px rgba(108,74,224,0.25);
          flex-shrink: 0;
        }

        .composer-send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .composer-send-btn:disabled {
          background: var(--border);
          color: var(--muted);
          box-shadow: none;
          cursor: not-allowed;
        }

        /* Typing loader indicator bubble */
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 18px;
        }

        .typing-indicator .dot {
          width: 6px;
          height: 6px;
          background-color: var(--muted);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
