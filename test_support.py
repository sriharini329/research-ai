import os
import sys

from research_ai_app import app, db, SupportMessage

def test_support_system():
    with app.test_client() as client:
        with app.app_context():
            # First make sure the table exists
            db.create_all()
            
        print("Submitting support request...")
        resp = client.post('/support', json={
            'name': 'Integration Test',
            'email': 'test@researchai.com',
            'subject': 'Test Subject',
            'message': 'This is a test message.'
        })
        
        print(f"Response code: {resp.status_code}")
        assert resp.status_code == 201, "Expected 201 Created"
        
        data = resp.get_json()
        print(f"Response JSON: {data}")
        ticket_id = data.get('ticket_id')
        assert ticket_id, "Ticket ID not returned"
        assert ticket_id.startswith("SUP-"), "Ticket ID should start with SUP-"
        
        print(f"Checking DB for Ticket: {ticket_id}")
        with app.app_context():
            msg = SupportMessage.query.filter_by(ticket_id=ticket_id).first()
            assert msg, "Support request was not saved in DB"
            assert msg.name == 'Integration Test'
            assert msg.email == 'test@researchai.com'
            assert msg.subject == 'Test Subject'
            assert msg.message == 'This is a test message.'
            assert msg.status == 'Open'
            print("DB check passed!")
            print("End-to-End Test for Support feature PASSED!")

if __name__ == '__main__':
    test_support_system()
