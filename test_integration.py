import os
import json
import unittest
from research_ai_app import app, db, User, Paper, Notification, create_notification

class TestDatabaseIntegration(unittest.TestCase):
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

    def test_01_database_notification_creation(self):
        with app.app_context():
            # 1. Create a test user
            user = User.query.filter_by(email='test_integration@example.com').first()
            if not user:
                user = User(name='Test', email='test_integration@example.com', password='pwd')
                db.session.add(user)
                db.session.commit()
            
            # 2. Add a notification via the helper directly
            create_notification(user.id, "Test Notif", "Testing paper_id", "Icons.test", paper_id=None)
            
            # 3. Check if paper_id column exists and notification is readable
            notifs = Notification.query.filter_by(user_id=user.id).all()
            self.assertTrue(len(notifs) >= 1)
            found = False
            for n in notifs:
                if n.title == "Test Notif":
                    found = True
                    self.assertIsNone(n.paper_id)
            self.assertTrue(found)

if __name__ == '__main__':
    unittest.main()
