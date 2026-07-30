import os
import sys
import unittest
import json
import base64
from io import BytesIO
from datetime import datetime

# Adjust path if needed
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from research_ai_app import app, db, User, Paper, Notification, SupportMessage

class TestComprehensiveAPI(unittest.TestCase):
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
        pass

    def test_01_signup_and_login(self):
        resp = self.client.post('/signup', json={
            'name': 'Test User',
            'email': 'test1@example.com',
            'password': 'password123'
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.get_json()
        self.assertIn('user', data)

        resp2 = self.client.post('/login', json={
            'email': 'test1@example.com',
            'password': 'password123'
        })
        self.assertEqual(resp2.status_code, 200)
        data2 = resp2.get_json()
        self.assertIn('user', data2)

    def test_02_invalid_login(self):
        resp = self.client.post('/login', json={
            'email': 'invalid@example.com',
            'password': 'wrong'
        })
        self.assertEqual(resp.status_code, 401)

    def test_03_profile_update(self):
        self.client.post('/signup', json={'name': 'User 3', 'email': 'test3@example.com', 'password': 'pwd'})
        with app.app_context():
            user = User.query.filter_by(email='test3@example.com').first()
            uid = user.id
            
        resp = self.client.put(f'/profile/{uid}', json={
            'name': 'Updated User 3',
            'field_of_study': 'Computer Science',
            'university': 'Test Uni'
        })
        self.assertEqual(resp.status_code, 200)
        
        resp2 = self.client.get(f'/profile/{uid}')
        self.assertEqual(resp2.status_code, 200)
        data = resp2.get_json()
        self.assertEqual(data['name'], 'Updated User 3')

    def test_04_paper_upload_and_library(self):
        self.client.post('/signup', json={'name': 'User 4', 'email': 'test4@example.com', 'password': 'pwd'})
        with app.app_context():
            user = User.query.filter_by(email='test4@example.com').first()
            uid = user.id
            
        # Instead of calling full analyze which needs Groq, let's insert a paper manually and test library endpoints
        with app.app_context():
            paper = Paper(
                user_id=uid,
                title='Test Paper',
                authors='Author A',
                abstract='Abstract',
                content='Content',
                summary='Summary',
                references='Refs',
                file_name='test.pdf'
            )
            db.session.add(paper)
            db.session.commit()
            pid = paper.id

        # GET /papers/<user_id>
        resp = self.client.get(f'/papers/{uid}')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.get_json()) >= 1)
        
        # GET /papers/detail/<paper_id>
        resp_detail = self.client.get(f'/papers/detail/{pid}')
        self.assertEqual(resp_detail.status_code, 200)
        self.assertEqual(resp_detail.get_json()['title'], 'Test Paper')
        
        # Favorite
        resp_fav = self.client.post(f'/papers/{pid}/favorite')
        self.assertEqual(resp_fav.status_code, 200)
        
        # Reading List Status
        resp_status = self.client.put(f'/papers/{pid}/status', json={'status': 'reading'})
        self.assertEqual(resp_status.status_code, 200)
        
        # Delete paper
        resp_del = self.client.delete(f'/papers/{pid}')
        self.assertEqual(resp_del.status_code, 200)

    def test_05_dashboard_stats(self):
        self.client.post('/signup', json={'name': 'User 5', 'email': 'test5@example.com', 'password': 'pwd'})
        with app.app_context():
            uid = User.query.filter_by(email='test5@example.com').first().id
            
        resp = self.client.get(f'/dashboard/{uid}')
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertIn('total_papers', data)
        self.assertIn('recent_papers', data)

    def test_06_support(self):
        resp = self.client.post('/support', json={
            'name': 'Help',
            'email': 'help@example.com',
            'subject': 'Issue',
            'message': 'Cannot login'
        })
        self.assertEqual(resp.status_code, 201)

    def test_07_notes_and_notifications(self):
        self.client.post('/signup', json={'name': 'User 7', 'email': 'test7@example.com', 'password': 'pwd'})
        with app.app_context():
            uid = User.query.filter_by(email='test7@example.com').first().id
            
        resp = self.client.post('/notes', json={
            'user_id': uid,
            'content': 'My Test Note'
        })
        self.assertEqual(resp.status_code, 201)
        
        resp_notif = self.client.get(f'/notifications/{uid}')
        self.assertEqual(resp_notif.status_code, 200)
        notifs = resp_notif.get_json()
        self.assertTrue(len(notifs) >= 1)

if __name__ == '__main__':
    class JSONTestResult(unittest.TextTestResult):
        def __init__(self, stream, descriptions, verbosity):
            super().__init__(stream, descriptions, verbosity)
            self.results = []
            
        def addSuccess(self, test):
            super().addSuccess(test)
            self.results.append({'test': test._testMethodName, 'status': 'PASSED'})
            
        def addFailure(self, test, err):
            super().addFailure(test, err)
            self.results.append({'test': test._testMethodName, 'status': 'FAILED', 'error': str(err[1])})
            
        def addError(self, test, err):
            super().addError(test, err)
            self.results.append({'test': test._testMethodName, 'status': 'FAILED', 'error': str(err[1])})

    class JSONTestRunner(unittest.TextTestRunner):
        def _makeResult(self):
            return JSONTestResult(self.stream, self.descriptions, self.verbosity)

    suite = unittest.TestLoader().loadTestsFromTestCase(TestComprehensiveAPI)
    with open('test_results_backend.json', 'w') as f:
        runner = JSONTestRunner(stream=sys.stderr, verbosity=2)
        result = runner.run(suite)
        json.dump({
            'total': result.testsRun,
            'passed': result.testsRun - len(result.failures) - len(result.errors),
            'failed': len(result.failures) + len(result.errors),
            'details': result.results
        }, f, indent=4)
