import os
import json
from research_ai_app import app, db, User, Paper, Notification

def run_tests():
    with app.app_context():
        # 1. Create a test user
        user = User.query.filter_by(email='test_integration@example.com').first()
        if not user:
            user = User(name='Test', email='test_integration@example.com', password='pwd')
            db.session.add(user)
            db.session.commit()
            print("Created test user.")
        
        # 2. Add a notification via the helper directly
        from research_ai_app import create_notification
        create_notification(user.id, "Test Notif", "Testing paper_id", "Icons.test", paper_id=None)
        print("Created test notification.")
        
        # 3. Check if paper_id column exists and notification is readable
        notifs = Notification.query.filter_by(user_id=user.id).all()
        print(f"User has {len(notifs)} notifications.")
        for n in notifs:
            print(f"- {n.title}: paper_id={n.paper_id}")
            
        print("All database tests passed.")

if __name__ == '__main__':
    run_tests()
