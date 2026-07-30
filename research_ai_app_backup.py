import os
import re
import json
import base64
import fitz
import requests
import pymysql
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.mysql import LONGTEXT
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

pymysql.install_as_MySQLdb()

app = Flask(__name__, static_folder='dist', static_url_path='')
CORS(app)

# Database Connection URL configuration (with SQLite fallback)
db_uri = os.environ.get('DATABASE_URL') or os.environ.get('SQLALCHEMY_DATABASE_URI')
if not db_uri:
    db_uri = 'sqlite:///research_ai.db'
    print("No database URI configured in environment. Using SQLite fallback: sqlite:///research_ai.db")

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'research_ai_secret')

db = SQLAlchemy(app)

# ─────────────────────────────────────────
# GROQ AI CONFIG & FALLBACKS
# ─────────────────────────────────────────

GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL = 'llama-3.3-70b-versatile'
MAX_PAPER_CHARS = 6000

# Load Groq Keys
GROQ_API_KEYS = []
keys_str = os.environ.get('GROQ_API_KEYS') or os.environ.get('GROQ_API_KEY')
print("GROQ_API_KEYS loaded:", keys_str[:10] + "..." if keys_str else "NOT FOUND")
if keys_str:
    GROQ_API_KEYS = [k.strip() for k in keys_str.replace(',', ' ').split() if k.strip()]

if not GROQ_API_KEYS:
    print("WARNING: No GROQ_API_KEYS defined in environment. Running in Mock AI Mode.")


def _clip(text):
    if text and len(text) > MAX_PAPER_CHARS:
        return text[:MAX_PAPER_CHARS] + '\n\n[...truncated...]'
    return text or ''


def _clip_end(text):
    if not text:
        return ""
    if len(text) <= MAX_PAPER_CHARS:
        return text
    return text[-MAX_PAPER_CHARS:]


def groq_chat(messages, max_tokens=1024, temperature=0.4):
    """Calls Groq chat completions with multi-key fallback and retries. Returns text."""
    import time
    if not GROQ_API_KEYS:
        return "AI summary unavailable because no Groq API key is configured."
        
    max_retries_per_key = 3
    for key in GROQ_API_KEYS:
        for attempt in range(max_retries_per_key):
            try:
                resp = requests.post(
                    GROQ_URL,
                    headers={'Authorization': f'Bearer {key}',
                             'Content-Type': 'application/json'},
                    json={
                        'model': GROQ_MODEL,
                        'messages': messages,
                        'temperature': temperature,
                        'max_tokens': max_tokens,
                        'top_p': 0.9,
                        'stream': False,
                    },
                    timeout=60,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get('choices', [])
                    if choices:
                        return choices[0]['message']['content']

                elif resp.status_code == 429:
                    print(f"Groq Rate Limit (Key {key[:4]}..., Attempt {attempt+1}): {resp.status_code}")
                    time.sleep(2 ** attempt)  # Exponential backoff
                    continue

                else:
                    print(f"Groq Error (Key {key[:4]}...): {resp.status_code} - {resp.text}")
                    break # Skip to next key
            except Exception as e:
                print(f"Groq Exception (Key {key[:4]}...): {e}")
                time.sleep(1)
                continue
    print("All Groq API calls failed.")
    return None
        
    for key in GROQ_API_KEYS:
        try:
            resp = requests.post(
                GROQ_URL,
                headers={'Authorization': f'Bearer {key}',
                         'Content-Type': 'application/json'},
                json={
                    'model': GROQ_MODEL,
                    'messages': messages,
                    'temperature': temperature,
                    'max_tokens': max_tokens,
                    'top_p': 0.9,
                    'stream': False,
                },
                timeout=60,
            )
            if resp.status_code == 200:
                data = resp.json()
                choices = data.get('choices', [])
                if choices:
                    return choices[0]['message']['content']

            elif resp.status_code == 429:
                print("Groq Rate Limit:", resp.status_code)
                print(resp.text)
                continue

            else:
                print("Groq Error:", resp.status_code)
                print(resp.text)
                continue
        except Exception as e:
            print("Groq Exception:", e)
            continue
    # Fallback to mock if API calls fail
    print("All Groq API calls failed.")
    return "AI summary unavailable because no Groq API key is configured."


# ─────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────

class User(db.Model):
    __tablename__ = 'users'
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name       = db.Column(db.String(255), nullable=False)
    email      = db.Column(db.String(255), unique=True, nullable=False)
    password   = db.Column(db.String(255), nullable=False)
    interests  = db.Column(db.Text, nullable=True)   # JSON array string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ActiveSession(db.Model):
    __tablename__ = 'active_sessions'
    id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email    = db.Column(db.String(255), nullable=False)
    login_at = db.Column(db.DateTime, default=datetime.utcnow)


class Paper(db.Model):
    __tablename__ = 'papers'
    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_name   = db.Column(db.String(255), nullable=False)
    title       = db.Column(db.String(500), nullable=False)
    authors     = db.Column(db.String(500), nullable=True)
    year        = db.Column(db.String(10),  nullable=True)
    content     = db.Column(db.Text().with_variant(LONGTEXT, "mysql"), nullable=False)
    summary     = db.Column(db.Text, nullable=True)
    abstract    = db.Column(db.Text, nullable=True)
    keywords    = db.Column(db.Text, nullable=True)
    references  = db.Column(db.Text, nullable=True)
    citations   = db.Column(db.Text, nullable=True)   # IEEE reference list cache
    is_favorite = db.Column(db.Boolean, default=False)
    status      = db.Column(db.String(20), default='toRead')  # toRead|reading|completed
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    paper_id   = db.Column(db.Integer, db.ForeignKey('papers.id'), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role       = db.Column(db.String(10), nullable=False)   # 'user' | 'ai'
    text       = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Note(db.Model):
    __tablename__ = 'notes'
    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    paper_id    = db.Column(db.Integer, db.ForeignKey('papers.id'), nullable=True)
    paper_title = db.Column(db.String(500), nullable=True)
    content     = db.Column(db.Text, nullable=False)
    color       = db.Column(db.String(20), default='#F59E0B')
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)


# ─────────────────────────────────────────
# AUTH ENDPOINTS
# ─────────────────────────────────────────

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data     = request.get_json()
        required = ['name', 'email', 'password']
        if not data or not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        new_user = User(
            name=data['name'], email=data['email'],
            password=generate_password_hash(data['password']),
            interests=json.dumps(data.get('interests', []))
        )
        db.session.add(new_user)
        db.session.commit()
        session = ActiveSession(email=new_user.email)
        db.session.add(session)
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': {
            'id': new_user.id, 'name': new_user.name, 'email': new_user.email,
            'interests': json.loads(new_user.interests or '[]')
        }}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400
        user = User.query.filter_by(email=data['email']).first()
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        session = ActiveSession(email=user.email)
        db.session.add(session)
        db.session.commit()
        return jsonify({'message': 'Login successful', 'user': {
            'id': user.id, 'name': user.name, 'email': user.email,
            'interests': json.loads(user.interests or '[]')
        }}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/get_current_user', methods=['GET'])
def get_current_user():
    try:
        last = ActiveSession.query.order_by(ActiveSession.id.desc()).first()
        if not last:
            return jsonify({'error': 'No active user found'}), 404
        user = User.query.filter_by(email=last.email).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({
            'id': user.id, 'name': user.name, 'email': user.email,
            'interests': json.loads(user.interests or '[]')
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/logout', methods=['POST'])
def logout():
    try:
        data  = request.get_json()
        email = data.get('email') if data else None
        if not email:
            return jsonify({'error': 'Email required'}), 400
        ActiveSession.query.filter_by(email=email).delete()
        db.session.commit()
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/reset_password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'new_password' not in data:
            return jsonify({'error': 'Email and new_password required'}), 400
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({'error': 'No account found for this email'}), 404
        user.password = generate_password_hash(data['new_password'])
        db.session.commit()
        return jsonify({'message': 'Password updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────
# PROFILE ENDPOINTS
# ─────────────────────────────────────────

@app.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({
            'id': user.id, 'name': user.name, 'email': user.email,
            'interests': json.loads(user.interests or '[]'),
            'created_at': user.created_at.strftime('%d %b %Y')
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/profile/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user.name = data.get('name', user.name)
        if 'interests' in data:
            user.interests = json.dumps(data['interests'])
        db.session.commit()
        return jsonify({'message': 'Profile updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/change_password/<int:user_id>', methods=['PUT'])
def change_password(user_id):
    try:
        data = request.get_json()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if not check_password_hash(user.password, data.get('current_password', '')):
            return jsonify({'error': 'Current password is incorrect'}), 401
        user.password = generate_password_hash(data['new_password'])
        db.session.commit()
        return jsonify({'message': 'Password changed'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────
# PAPERS + AI ANALYSIS ENDPOINTS
# ─────────────────────────────────────────

@app.route('/papers/<int:user_id>', methods=['GET'])
def get_papers(user_id):
    try:
        favorite = request.args.get('favorite')
        status   = request.args.get('status')
        query    = Paper.query.filter_by(user_id=user_id)
        if favorite == 'true':
            query = query.filter_by(is_favorite=True)
        if status:
            query = query.filter_by(status=status)
        papers = query.order_by(Paper.created_at.desc()).all()
        return jsonify([{
            'id': p.id, 'file_name': p.file_name, 'title': p.title,
            'authors': p.authors, 'year': p.year, 'summary': p.summary,
            'is_favorite': p.is_favorite, 'status': p.status,
            'created_at': p.created_at.strftime('%d %b %Y')
        } for p in papers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/papers/detail/<int:paper_id>', methods=['GET'])
def get_paper_detail(paper_id):
    try:
        p = Paper.query.get(paper_id)
        if not p:
            return jsonify({'error': 'Paper not found'}), 404
        return jsonify({
            'id': p.id, 'file_name': p.file_name, 'title': p.title,
            'authors': p.authors, 'year': p.year, 'content': p.content,
            'summary': p.summary, 'citations': p.citations,
            'abstract': p.abstract, 'keywords': p.keywords,
            'references': p.references,
            'is_favorite': p.is_favorite, 'status': p.status,
            'created_at': p.created_at.strftime('%d %b %Y')
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



def renumber_references(ref_text):
    if not ref_text or "No references found" in ref_text:
        return ref_text
    
    lines = [line.strip() for line in ref_text.split('\n') if line.strip()]
    renumbered_lines = []
    
    count = 1
    for line in lines:
        if count > 5:
            break
        # Strip existing numbering patterns: [1], 1., 1), etc.
        # This matches leading spaces, optional brackets/parentheses, digits, punctuation, and trailing spaces
        cleaned_line = re.sub(r'^\s*\[?\d+\]?[\.\)]?\s*', '', line)
        if cleaned_line:
            renumbered_lines.append(f"[{count}] {cleaned_line}")
            count += 1
            
    if not renumbered_lines:
        return ref_text
        
    return '\n'.join(renumbered_lines)

@app.route('/papers/analyze', methods=['POST'])
def analyze_paper():
    """Analyze paper using PyMuPDF and Groq as the single source of truth."""
    try:
        data = request.get_json()
        required = ['user_id', 'file_name', 'file_bytes']
        
        if not data or not all(k in data for k in required):
            # Fallback if old clients send 'content' instead of 'file_bytes'
            if 'content' in data and 'file_bytes' not in data:
                pass # We'll handle it
            else:
                return jsonify({'error': 'Missing required fields'}), 400

        user_id = data['user_id']
        file_name = data['file_name']
        
        # Determine text content
        extracted_text = ""
        if 'file_bytes' in data and data['file_bytes']:
            # Decode base64 and parse with fitz
            try:
                pdf_bytes = base64.b64decode(data['file_bytes'])
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                for page in doc:
                    extracted_text += page.get_text("text") + "\n"
            except Exception as e:
                return jsonify({'error': f'Failed to read PDF: {str(e)}'}), 400
        else:
            extracted_text = data.get('content', '')

        if not extracted_text.strip():
            return jsonify({'error': 'No text could be extracted from the file.'}), 400

        # Now extract Metadata via Groq
        meta_json = groq_chat([
            {'role': 'system', 'content': 'You extract bibliographic metadata. Reply ONLY with raw JSON, no markdown, no explanation.'},
            {'role': 'user', 'content': 'From this paper return JSON: {"title":"...","authors":"...","year":"YYYY","abstract":"...","keywords":"..."}. If unknown use "".\n\n' + _clip(extracted_text)}
        ], max_tokens=600, temperature=0.1)
        
        title = file_name.rsplit('.', 1)[0]
        authors = ""
        year = ""
        abstract = ""
        keywords = ""
        
        try:
            clean_json = meta_json.replace('```json', '').replace('```', '').strip()
            import json
            meta = json.loads(clean_json)
            if meta.get('title'): title = meta.get('title')
            authors = meta.get('authors', '')
            year = meta.get('year', '')
            abstract = meta.get('abstract', '')
            keywords = meta.get('keywords', '')
        except Exception:
            pass # fallback to defaults

        # Guarantee fallback for Abstract
        if not abstract or len(abstract.strip()) < 10:
            abstract = groq_chat([
                {'role': 'system', 'content': 'You generate concise abstracts. Return ONLY the abstract text.'},
                {'role': 'user', 'content': 'Generate a concise 1-paragraph abstract for this paper:\n\n' + _clip(extracted_text)}
            ], max_tokens=400)
            if not abstract:
                abstract = "Abstract generation failed, please review the document manually."

        # Guarantee fallback for Keywords
        if not keywords or len(keywords.strip()) < 3:
            keywords = groq_chat([
                {'role': 'system', 'content': 'You generate keywords. Return ONLY a comma separated list of keywords.'},
                {'role': 'user', 'content': 'Generate 5 keywords for this paper:\n\n' + _clip(extracted_text)}
            ], max_tokens=100)
            if not keywords:
                keywords = "Research, Paper, Unclassified"

        # Guarantee fallback for Summary
        summary = groq_chat([
            {'role': 'system', 'content': 'You are ResearchAI. Explain papers in simple, clear language with no jargon.'},
            {'role': 'user', 'content': "Summarize this paper in SIMPLE language with short sections: What it's about, Methods, Key findings, Why it matters, Limitations.\n\n" + _clip(extracted_text)}
        ], max_tokens=1500)
        
        if not summary or len(summary.strip()) < 20:
            summary = "Summary generation failed or the API returned an empty response."

        # Extract References
        # Extract References (maximum 5)
        references = groq_chat([
            {
                'role': 'system',
                'content': '''You are a reference extractor.

        Extract ONLY the first 5 references from the uploaded paper.

        Rules:
        - Return at most 5 references.
        - Copy them exactly as they appear.
        - Do NOT generate new references.
        - Do NOT complete incomplete references.
        - Do NOT reformat.
        - If there are fewer than 5 references, return only those available.
        - If no References section exists, return exactly:
        "No references found in the uploaded paper."
        '''
            },
            {
                'role': 'user',
                'content': _clip_end(extracted_text)
            }
        ], max_tokens=800, temperature=0)
        references = renumber_references(references)
        paper = Paper(
            user_id=user_id,
            file_name=file_name,
            title=title,
            authors=authors,
            year=year,
            abstract=abstract,
            keywords=keywords,
            references=references,
            content=extracted_text,
            summary=summary,
        )

        db.session.add(paper)
        db.session.commit()

        return jsonify({
            'message': 'Paper analyzed',
            'paper': {
                'id': paper.id,
                'file_name': paper.file_name,
                'title': paper.title,
                'authors': paper.authors,
                'year': paper.year,
                'summary': paper.summary,
                'abstract': paper.abstract,
                'keywords': paper.keywords,
                'references': paper.references,
                'is_favorite': paper.is_favorite,
                'status': paper.status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/papers/<int:paper_id>/citations', methods=['GET'])
def paper_citations(paper_id):
    """IEEE reference list (cached after first generation)."""
    try:
        p = Paper.query.get(paper_id)
        if not p:
            return jsonify({'error': 'Paper not found'}), 404

        if p.citations:
            return jsonify({'citations': p.citations}), 200

        result = groq_chat([
            {
                'role': 'system',
                'content': '''You are an IEEE reference extractor.

    Extract ONLY the first 5 references from the uploaded paper.

    Rules:
    - Return at most 5 references.
    - Format them in IEEE style.
    - Do NOT generate any new references.
    - Do NOT suggest related papers.
    - If fewer than 5 references exist, return only those.
    - If no references exist, return exactly:
    "No references found in the uploaded paper."
    '''
            },
            {
                'role': 'user',
                'content': _clip_end(p.content)
            }
        ], max_tokens=800, temperature=0)
        result = renumber_references(result)

        if result is None:
            return jsonify({'error': 'AI is busy right now. Please try again.'}), 503

        p.citations = result
        db.session.commit()

        return jsonify({'citations': result}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/papers/<int:paper_id>/cite', methods=['POST'])
def cite_paper(paper_id):
    """Single citation of the paper in a chosen style (APA/MLA/IEEE/Chicago/BibTeX)."""
    try:
        data  = request.get_json()
        style = data.get('style', 'IEEE') if data else 'IEEE'
        p = Paper.query.get(paper_id)
        if not p:
            return jsonify({'error': 'Paper not found'}), 404
        result = groq_chat([
            {'role': 'system', 'content': f'You generate one accurate {style} citation for the paper.'},
            {'role': 'user',
             'content': f'Generate a single {style}-style citation for THIS paper (the document itself, not its references). Output only the citation text.\n\n' + _clip(p.content)},
        ], max_tokens=400, temperature=0.1)
        if result is None:
            return jsonify({'error': 'AI is busy right now. Please try again.'}), 503
        return jsonify({'style': style, 'citation': result.strip()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/papers/<int:paper_id>/favorite', methods=['POST'])
def toggle_favorite(paper_id):
    try:
        p = Paper.query.get(paper_id)
        if not p:
            return jsonify({'error': 'Paper not found'}), 404
        p.is_favorite = not p.is_favorite
        db.session.commit()
        return jsonify({'message': 'Updated', 'is_favorite': p.is_favorite}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/papers/<int:paper_id>/status', methods=['PUT'])
def set_status(paper_id):
    try:
        data = request.get_json()
        status = data.get('status')
        if status not in ('toRead', 'reading', 'completed'):
            return jsonify({'error': 'Invalid status'}), 400
        p = Paper.query.get(paper_id)
        if not p:
            return jsonify({'error': 'Paper not found'}), 404
        p.status = status
        db.session.commit()
        return jsonify({'message': 'Status updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/papers/<int:paper_id>', methods=['DELETE'])
def delete_paper(paper_id):
    try:
        p = Paper.query.get(paper_id)
        if not p:
            return jsonify({'error': 'Paper not found'}), 404
        ChatMessage.query.filter_by(paper_id=paper_id).delete()
        db.session.delete(p)
        db.session.commit()
        return jsonify({'message': 'Paper deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────
# CHAT ENDPOINTS
# ─────────────────────────────────────────

@app.route('/papers/<int:paper_id>/chat', methods=['GET'])
def get_chat(paper_id):
    try:
        msgs = ChatMessage.query.filter_by(paper_id=paper_id)\
            .order_by(ChatMessage.created_at.asc()).all()
        return jsonify([{
            'id': m.id, 'role': m.role, 'text': m.text,
            'created_at': m.created_at.strftime('%d %b %Y %H:%M')
        } for m in msgs]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/papers/<int:paper_id>/chat', methods=['POST'])
def save_chat_message(paper_id):
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        role = data.get('role')
        text = data.get('text')

        if not text or not role:
            return jsonify({'error': 'role and text are required'}), 400

        p = Paper.query.get(paper_id)
        if not p:
            return jsonify({'error': 'Paper not found'}), 404

        db.session.add(ChatMessage(paper_id=paper_id, user_id=user_id, role=role, text=text))
        db.session.commit()
            
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────
# NOTES ENDPOINTS
# ─────────────────────────────────────────

@app.route('/notes/<int:user_id>', methods=['GET'])
def get_notes(user_id):
    try:
        notes = Note.query.filter_by(user_id=user_id)\
            .order_by(Note.created_at.desc()).all()
        return jsonify([{
            'id': n.id, 'content': n.content, 'paper_title': n.paper_title,
            'color': n.color,
            'created_at': n.created_at.strftime('%d %b %Y')
        } for n in notes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/papers/<int:paper_id>/notes', methods=['GET'])
def get_paper_notes(paper_id):
    try:
        notes = Note.query.filter_by(paper_id=paper_id)\
            .order_by(Note.created_at.desc()).all()
        return jsonify([{
            'id': n.id, 'content': n.content, 'paper_title': n.paper_title,
            'color': n.color,
            'created_at': n.created_at.strftime('%d %b %Y')
        } for n in notes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/notes', methods=['POST'])
def add_note():
    try:
        data     = request.get_json()
        required = ['user_id', 'content']
        if not data or not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        note = Note(
            user_id=data['user_id'], content=data['content'],
            paper_id=data.get('paper_id'),
            paper_title=data.get('paper_title', ''),
            color=data.get('color', '#F59E0B')
        )
        db.session.add(note)
        db.session.commit()
        return jsonify({'message': 'Note added', 'id': note.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        db.session.delete(note)
        db.session.commit()
        return jsonify({'message': 'Note deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────
# HOME DASHBOARD (aggregate endpoint)
# ─────────────────────────────────────────

@app.route('/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    try:
        all_papers = Paper.query.filter_by(user_id=user_id).all()
        recent = Paper.query.filter_by(user_id=user_id)\
            .order_by(Paper.created_at.desc()).limit(4).all()
        notes_count = Note.query.filter_by(user_id=user_id).count()

        return jsonify({
            'total_papers': len(all_papers),
            'favorites': sum(1 for p in all_papers if p.is_favorite),
            'reading': sum(1 for p in all_papers if p.status == 'reading'),
            'completed': sum(1 for p in all_papers if p.status == 'completed'),
            'notes': notes_count,
            'recent_papers': [{
                'id': p.id, 'title': p.title, 'authors': p.authors,
                'year': p.year, 'status': p.status,
                'is_favorite': p.is_favorite
            } for p in recent]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────
# FRONTEND STATIC ASSETS & CATCH-ALL ROUTE
# ─────────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if not os.path.exists(app.static_folder) or not os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return jsonify({
            'message': 'Welcome to ResearchAI API! The React frontend is not built yet. Please build the Vite frontend using "npm run build".'
        }), 200
        
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Read run port from environment, defaulting to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
