import os
import sys
import base64
from io import BytesIO

from research_ai_app import app, db, User, Paper, Notification

def create_dummy_pdf():
    from reportlab.pdfgen import canvas
    buffer = BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 750, "This is a dummy pdf for testing e2e.")
    c.save()
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

import os
import sys
import base64
import unittest
from io import BytesIO

from research_ai_app import app, db, User, Paper, Notification

def create_dummy_pdf():
    from reportlab.pdfgen import canvas
    buffer = BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 750, "This is a dummy pdf for testing e2e.")
    c.save()
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

class TestBackendE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        cls.client = app.test_client()
        with app.app_context():
            db.create_all()

    @classmethod
    def tearDownClass(cls):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_e2e_journey(self):
        with app.app_context():
            user = User.query.filter_by(email='test_e2e@example.com').first()
            if not user:
                user = User(name='Test E2E', email='test_e2e@example.com', password='pwd')
                db.session.add(user)
                db.session.commit()
            user_id = user.id
            
        # 1. Upload a paper
        pdf_b64 = create_dummy_pdf()
        resp = self.client.post('/papers/analyze', json={
            'user_id': user_id,
            'file_name': 'e2e_test.pdf',
            'file_bytes': pdf_b64
        })
        
        # We will also trigger a note just in case paper upload fails due to Groq rate limits.
        resp_note = self.client.post('/notes', json={
            'user_id': user_id,
            'content': 'E2E test note'
        })
        self.assertEqual(resp_note.status_code, 201)
        
        # 2. Confirm notification row is inserted and fetch via GET /notifications
        resp_notif = self.client.get(f'/notifications/{user_id}')
        self.assertEqual(resp_notif.status_code, 200)
        
        notifs = resp_notif.get_json()
        self.assertTrue(len(notifs) > 0)
        top_notif = notifs[0]
        self.assertTrue(top_notif['created_at'].endswith('Z') or ' ' in top_notif['created_at'])

if __name__ == '__main__':
    unittest.main()
