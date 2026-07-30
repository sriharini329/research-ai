import os
import sys
import unittest
import json
import base64
from io import BytesIO
from datetime import datetime
import requests

BASE_URL = 'http://127.0.0.1:5000'

class TestRealE2EAPI(unittest.TestCase):
    def setUp(self):
        # Generate random unique emails for each run
        import uuid
        self.email = f'test_e2e_{uuid.uuid4().hex[:8]}@example.com'
        self.password = 'password123'
        self.user_id = None

    def test_01_full_user_journey(self):
        # 1. Signup
        resp = requests.post(f'{BASE_URL}/signup', json={
            'name': 'E2E User',
            'email': self.email,
            'password': self.password
        })
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.user_id = data.get('user', {}).get('id')
        self.assertIsNotNone(self.user_id)

        # 2. Login
        resp_login = requests.post(f'{BASE_URL}/login', json={
            'email': self.email,
            'password': self.password
        })
        self.assertEqual(resp_login.status_code, 200)

        # 3. Update Profile
        resp_prof = requests.put(f'{BASE_URL}/profile/{self.user_id}', json={
            'name': 'Updated E2E User'
        })
        self.assertEqual(resp_prof.status_code, 200)

        # 4. Dashboard Stats
        resp_dash = requests.get(f'{BASE_URL}/dashboard/{self.user_id}')
        self.assertEqual(resp_dash.status_code, 200)
        dash_data = resp_dash.json()
        self.assertIn('total_papers', dash_data)
        
        # 5. Create Note
        resp_note = requests.post(f'{BASE_URL}/notes', json={
            'user_id': self.user_id,
            'content': 'E2E Test Note'
        })
        self.assertEqual(resp_note.status_code, 201)

        # 6. Notifications
        resp_notif = requests.get(f'{BASE_URL}/notifications/{self.user_id}')
        self.assertEqual(resp_notif.status_code, 200)
        notifs = resp_notif.json()
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

    suite = unittest.TestLoader().loadTestsFromTestCase(TestRealE2EAPI)
    with open('test_results_real_backend.json', 'w') as f:
        runner = JSONTestRunner(stream=sys.stderr, verbosity=2)
        result = runner.run(suite)
        json.dump({
            'total': result.testsRun,
            'passed': result.testsRun - len(result.failures) - len(result.errors),
            'failed': len(result.failures) + len(result.errors),
            'details': result.results
        }, f, indent=4)
