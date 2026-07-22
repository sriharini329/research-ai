import React, { useState, useRef } from 'react';
import { api } from '../api';
import { UploadCloud, ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export default function Upload({ user, showToast, goBack, navigateTo }) {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | parsing | analyzing | done
  const [fileName, setFileName] = useState('');
  const [progressMsg, setProgressMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Main file extractor & backend sender logic
  const processFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'docx', 'txt'];
    if (!allowed.includes(ext)) {
      showToast('Unsupported file type. Please upload a PDF, DOCX, or TXT file.', 'error');
      return;
    }

    setFileName(file.name);
    setStatus('parsing');
    setProgressMsg('Reading file contents client-side...');

    try {
      let extractedText = '';
      
      // 1) Parse file client-side
      if (ext === 'txt') {
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(new Error('Failed to read text file.'));
          reader.readAsText(file);
        });
      } else if (ext === 'docx') {
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const arrayBuffer = e.target.result;
              const result = await window.mammoth.extractRawText({ arrayBuffer });
              resolve(result.value);
            } catch (err) {
              reject(new Error('Failed to extract Word text: ' + err.message));
            }
          };
          reader.onerror = () => reject(new Error('Error loading Word file.'));
          reader.readAsArrayBuffer(file);
        });
      } else if (ext === 'pdf') {
        extractedText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async function() {
            try {
              const typedarray = new Uint8Array(this.result);
              const pdfjsLib = window['pdfjs-dist/build/pdf'];
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
              
              const pdf = await pdfjsLib.getDocument(typedarray).promise;
              let text = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
              }
              resolve(text);
            } catch (err) {
              reject(new Error('Failed to parse PDF document text: ' + err.message));
            }
          };
          reader.onerror = () => reject(new Error('Error loading PDF file.'));
          reader.readAsArrayBuffer(file);
        });
      }

      const cleanText = extractedText.trim();
      if (!cleanText) {
        throw new Error('Document seems to be empty or contains only scanned images.');
      }

      // 2) Send to backend for AI summary & metadata parsing
      setStatus('analyzing');
      setProgressMsg('Extracting metadata and generating AI summary...');

      const result = await api.analyzePaper(user.id, file.name, cleanText);
      
      setStatus('done');
      showToast('Paper analyzed successfully!');
      
      // Auto redirect to the paper details after analysis
      setTimeout(() => {
        navigateTo('detail', result.paper);
      }, 1200);

    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      setStatus('idle');
    }
  };

  return (
    <div className="upload-view fade-in">
      <header className="page-header row">
        <button className="back-btn" onClick={goBack}>
          <ArrowLeft size={20} />
        </button>
        <h2>Upload Research Paper</h2>
      </header>

      {status === 'idle' ? (
        <div className="upload-container">
          <form 
            id="file-upload-form" 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            className={`file-drop-area ${dragActive ? 'drag-active' : ''}`}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              id="input-file-upload" 
              multiple={false} 
              onChange={handleChange} 
              accept=".pdf,.docx,.txt"
              style={{ display: 'none' }}
            />
            
            <div className="drop-content">
              <div className="upload-icon-circle">
                <UploadCloud size={36} color="var(--primary)" />
              </div>
              <h3>Drag & drop your file here</h3>
              <p className="subtext">or click to browse your folders</p>
              
              <button type="button" onClick={onButtonClick} className="primary-btn browse-btn">
                Browse Files
              </button>
              
              <span className="file-info-label">Supports: PDF, Word (.docx), TXT</span>
            </div>
          </form>
        </div>
      ) : (
        <div className="app-card processing-card fade-in">
          <div className="processing-content">
            {status === 'parsing' && (
              <>
                <div className="spinner blue-spinner" />
                <h3>Reading Document...</h3>
                <p className="processing-file">{fileName}</p>
                <p className="processing-step">{progressMsg}</p>
              </>
            )}

            {status === 'analyzing' && (
              <>
                <div className="spinner purple-spinner" />
                <h3>Analyzing Paper...</h3>
                <p className="processing-file">{fileName}</p>
                <p className="processing-step">{progressMsg}</p>
              </>
            )}

            {status === 'done' && (
              <>
                <div className="success-icon-container">
                  <CheckCircle2 size={56} color="var(--success)" />
                </div>
                <h3>Analysis Complete!</h3>
                <p className="processing-file">{fileName}</p>
                <p className="processing-step">Redirecting to paper dashboard...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* local upload styling */}
      <style>{`
        .upload-view {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .page-header {
          gap: 16px;
        }

        .back-btn {
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

        .back-btn:hover {
          transform: scale(1.05);
          color: var(--primary);
        }

        .upload-container {
          width: 100%;
        }

        .file-drop-area {
          border: 2px dashed rgba(108, 74, 224, 0.4);
          background-color: var(--surface);
          border-radius: 20px;
          padding: 56px 24px;
          text-align: center;
          transition: var(--transition);
          box-shadow: var(--shadow);
        }

        .file-drop-area.drag-active {
          border-color: var(--primary);
          background-color: var(--chip-bg);
          transform: scale(1.01);
        }

        .drop-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .upload-icon-circle {
          width: 78px;
          height: 78px;
          background-color: var(--primary-glow);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .file-drop-area h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
        }

        .subtext {
          color: var(--muted);
          font-size: 13.5px;
          margin-top: -8px;
        }

        .browse-btn {
          width: auto;
          padding: 12px 28px;
          margin-top: 10px;
          font-size: 14px;
        }

        .file-info-label {
          color: var(--muted);
          font-size: 12px;
          margin-top: 8px;
        }

        /* Processing spinner layout */
        .processing-card {
          padding: 56px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 380px;
        }

        .processing-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          max-width: 420px;
        }

        .processing-file {
          font-weight: 700;
          font-size: 15px;
          color: var(--ink);
          word-break: break-all;
        }

        .processing-step {
          font-size: 13.5px;
          color: var(--muted);
        }

        .spinner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 4px solid var(--border);
          animation: spin 1.2s linear infinite;
        }

        .blue-spinner {
          border-top-color: var(--blue);
        }

        .purple-spinner {
          border-top-color: var(--primary);
        }

        .success-icon-container {
          animation: scalePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes scalePop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
