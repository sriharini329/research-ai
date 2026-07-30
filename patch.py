import os

with open('research_ai_app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert Model and helper function
model_code = """
class Notification(db.Model):
    __tablename__ = 'notifications'
    id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    paper_id    = db.Column(db.Integer, db.ForeignKey('papers.id'), nullable=True)
    title       = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon        = db.Column(db.String(50), nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    is_read     = db.Column(db.Boolean, default=False)

def create_notification(user_id, title, description, icon, paper_id=None):
    try:
        n = Notification(
            user_id=user_id,
            paper_id=paper_id,
            title=title,
            description=description,
            icon=icon
        )
        db.session.add(n)
        db.session.commit()
    except Exception as e:
        print(f"Failed to create notification: {e}")
        db.session.rollback()
"""
target_model_loc = "class Note(db.Model):\n"
content = content.replace(target_model_loc, model_code + "\n" + target_model_loc)

# 2. Endpoints
endpoints_code = """
# ─────────────────────────────────────────
# NOTIFICATIONS ENDPOINTS
# ─────────────────────────────────────────

@app.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    try:
        notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
        return jsonify([{
            'id': n.id, 'paper_id': n.paper_id, 'title': n.title,
            'description': n.description, 'icon': n.icon,
            'created_at': n.created_at.isoformat(), 'is_read': n.is_read
        } for n in notifs]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/read_all', methods=['POST'])
def read_all_notifications():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/<int:n_id>/read', methods=['POST'])
def read_notification(n_id):
    try:
        n = Notification.query.get(n_id)
        if n:
            n.is_read = True
            db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/<int:n_id>', methods=['DELETE'])
def delete_notification(n_id):
    try:
        n = Notification.query.get(n_id)
        if n:
            db.session.delete(n)
            db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/clear_all', methods=['DELETE'])
def clear_all_notifications():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        Notification.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ─────────────────────────────────────────
# HOME DASHBOARD (aggregate endpoint)
"""
content = content.replace("# ─────────────────────────────────────────\n# HOME DASHBOARD (aggregate endpoint)", endpoints_code)

# 3. Inject hooks

# upload/analyze
content = content.replace(
    "db.session.add(paper)\n        db.session.commit()\n\n        return jsonify({", 
    "db.session.add(paper)\n        db.session.commit()\n\n        create_notification(user_id, 'Paper analysis completed', f'Your paper \"{paper.title}\" has been analyzed and is ready to view.', 'Icons.check_circle_outline', paper.id)\n\n        return jsonify({"
)

# Login
content = content.replace(
    "return jsonify({'message': 'Login successful'",
    "create_notification(user.id, 'Login successful', 'Welcome back to ResearchAI!', 'Icons.login')\n        return jsonify({'message': 'Login successful'"
)

# Profile Update
content = content.replace(
    "return jsonify({'message': 'Profile updated'})",
    "create_notification(user_id, 'Profile updated', 'Your profile information has been successfully updated.', 'Icons.person_outline')\n        return jsonify({'message': 'Profile updated'})"
)

# toggle_favorite
content = content.replace(
    "return jsonify({'message': 'Updated', 'is_favorite': p.is_favorite}), 200",
    """if p.is_favorite:
            create_notification(p.user_id, 'Paper bookmarked', f'"{p.title}" was added to your favorites.', 'Icons.bookmark_border', p.id)
        return jsonify({'message': 'Updated', 'is_favorite': p.is_favorite}), 200"""
)

# delete_paper
content = content.replace(
    "return jsonify({'message': 'Paper deleted'}), 200",
    "create_notification(p.user_id, 'Paper deleted', f'\"{p.title}\" was removed from your library.', 'Icons.delete_outline')\n        return jsonify({'message': 'Paper deleted'}), 200"
)

# save_chat_message
content = content.replace(
    "db.session.add(ChatMessage(paper_id=paper_id, user_id=user_id, role=role, text=text))\n        db.session.commit()",
    """db.session.add(ChatMessage(paper_id=paper_id, user_id=user_id, role=role, text=text))
        db.session.commit()
        if role == 'user':
            create_notification(user_id, 'AI Chat question asked', 'You asked a question in the chat.', 'Icons.chat_bubble_outline', paper_id)"""
)

# ask_paper
content = content.replace(
    "db.session.add(ai_msg)\n        db.session.commit()\n\n        return jsonify({'answer': answer}), 200",
    """db.session.add(ai_msg)
        db.session.commit()
        create_notification(user_id, 'AI Chat response received', 'AI has responded to your question.', 'Icons.quickreply_outlined', paper_id)
        return jsonify({'answer': answer}), 200"""
)

# add_note
content = content.replace(
    "return jsonify({'message': 'Note added', 'id': note.id}), 201",
    """create_notification(note.user_id, 'Notes created', 'A new note was successfully created.', 'Icons.note_add_outlined', note.paper_id)
        return jsonify({'message': 'Note added', 'id': note.id}), 201"""
)

# cite_paper
content = content.replace(
    "return jsonify({'style': style, 'citation': result.strip()}), 200",
    "create_notification(p.user_id, 'Citation generated', f'{style} citation was generated for \"{p.title}\".', 'Icons.format_quote', p.id)\n        return jsonify({'style': style, 'citation': result.strip()}), 200"
)

with open('research_ai_app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched successfully")
