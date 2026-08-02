import os
import sys
import unittest
import json
import uuid
from datetime import datetime
from research_ai_app import app, db, User, Paper, Notification

class TestRealE2EAPI(unittest.TestCase):
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

    def setUp(self):
        self.email = f'test_e2e_{uuid.uuid4().hex[:8]}@example.com'
        self.password = 'password123'
        self.user_id = None

    def test_01_full_user_journey(self):
        # 1. Signup
        resp = self.client.post(f'/signup', json={
            'name': 'E2E User',
            'email': self.email,
            'password': self.password
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.get_json()
        self.user_id = data.get('user', {}).get('id')
        self.assertIsNotNone(self.user_id)

        # 2. Login
        resp_login = self.client.post(f'/login', json={
            'email': self.email,
            'password': self.password
        })
        self.assertEqual(resp_login.status_code, 200)

        # 3. Update Profile
        resp_prof = self.client.put(f'/profile/{self.user_id}', json={
            'name': 'Updated E2E User'
        })
        self.assertEqual(resp_prof.status_code, 200)

        # 4. Dashboard Stats
        resp_dash = self.client.get(f'/dashboard/{self.user_id}')
        self.assertEqual(resp_dash.status_code, 200)
        dash_data = resp_dash.get_json()
        self.assertIn('total_papers', dash_data)
        
        # 5. Create Note
        resp_note = self.client.post(f'/notes', json={
            'user_id': self.user_id,
            'content': 'E2E Test Note'
        })
        self.assertEqual(resp_note.status_code, 201)

        # 6. Notifications
        resp_notif = self.client.get(f'/notifications/{self.user_id}')
        self.assertEqual(resp_notif.status_code, 200)
        notifs = resp_notif.get_json()
        self.assertTrue(len(notifs) >= 1)

if __name__ == '__main__':
    unittest.main()
