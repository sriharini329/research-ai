import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ArrowLeft, Copy, Check, Quote, Share2 } from 'lucide-react';

export default function Cite({ user, paper, showToast, goBack }) {
  const [style, setStyle] = useState('IEEE'); // IEEE | APA | MLA | Chicago | BibTeX
  const [citation, setCitation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const styles = ['IEEE', 'APA', 'MLA', 'Chicago', 'BibTeX'];

  useEffect(() => {
    fetchCitation();
  }, [style]);

  const fetchCitation = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const text = await api.citePaper(paper.id, style);
      setCitation(text);
    } catch (err) {
      showToast(err.message, 'error');
      setCitation('Failed to generate citation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!citation || loading) return;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    showToast('Citation copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cite-view fade-in">
      <header className="cite-header row">
        <button className="back-btn" onClick={goBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="cite-header-title overflow-hidden">
          <h2>Generate Citation</h2>
          <p className="cite-subtitle">{paper.title}</p>
        </div>
      </header>

      {/* Style selector chips */}
      <section className="cite-styles-container">
        <h3>Citation Style</h3>
        <div className="cite-style-selector row">
          {styles.map(s => (
            <button 
              key={s} 
              className={`cite-style-btn ${style === s ? 'active' : ''}`}
              onClick={() => setStyle(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Citation Box Output */}
      <section className="citation-box-section flex-1">
        <div className="app-card citation-output-card">
          <div className="citation-card-header row space-between">
            <span className="style-badge">{style} Style Citation</span>
            <Quote size={20} className="quote-icon" />
          </div>

          <div className="citation-body">
            {loading ? (
              <div className="citations-loader-inner">
                <div className="app-loader" />
                <p>Generating citation style...</p>
              </div>
            ) : (
              <div className="citation-text-container">
                {style === 'BibTeX' ? (
                  <pre className="bibtex-code">{citation}</pre>
                ) : (
                  <p className="citation-text">{citation}</p>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleCopy} 
            disabled={loading || !citation} 
            className={`primary-btn copy-citation-btn ${copied ? 'success-btn' : ''}`}
          >
            {copied ? (
              <>
                <Check size={18} /> Copied!
              </>
            ) : (
              <>
                <Copy size={18} /> Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </section>

      {/* local styling for cite */}
      <style>{`
        .cite-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .cite-header {
          gap: 16px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }

        .cite-header-title {
          flex: 1;
        }

        .cite-header h2 {
          font-size: 18px;
        }

        .cite-subtitle {
          color: var(--muted);
          font-size: 12.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        .cite-styles-container h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 12px;
        }

        .cite-style-selector {
          gap: 8px;
          flex-wrap: wrap;
        }

        .cite-style-btn {
          border: 1px solid var(--border);
          background-color: var(--surface);
          color: var(--muted);
          font-weight: 700;
          font-size: 13.5px;
          padding: 8px 18px;
          border-radius: 12px;
          cursor: pointer;
          transition: var(--transition);
        }

        .cite-style-btn:hover {
          color: var(--primary);
          border-color: var(--primary);
        }

        .cite-style-btn.active {
          background-color: var(--chip-bg);
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Citation output container */
        .citation-output-card {
          padding: 28px;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .citation-card-header {
          margin-bottom: 16px;
        }

        .style-badge {
          background-color: var(--primary-glow);
          color: var(--primary-dark);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .quote-icon {
          color: var(--muted);
          opacity: 0.3;
        }

        .citation-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 16px 0;
        }

        .citation-text-container {
          width: 100%;
          text-align: left;
        }

        .citation-text {
          font-size: 16px;
          line-height: 1.6;
          color: var(--ink);
          font-style: italic;
        }

        .bibtex-code {
          font-family: 'Courier New', Courier, monospace;
          background-color: var(--background);
          border: 1px solid var(--border);
          padding: 16px;
          border-radius: var(--radius-md);
          font-size: 13px;
          line-height: 1.5;
          overflow-x: auto;
          color: var(--ink);
        }

        .copy-citation-btn {
          margin-top: 16px;
        }

        .success-btn {
          background: linear-gradient(135deg, #10B981, #059669) !important;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4) !important;
        }

        .citations-loader-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--muted);
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
