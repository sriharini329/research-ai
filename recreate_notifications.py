import os
import sqlite3

db_path = os.path.join('instance', 'research_ai.db')

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS notifications")
    conn.commit()
    conn.close()
    print("Dropped notifications table to allow full recreation.")
    
    from research_ai_app import app, db
    with app.app_context():
        db.create_all()
        print("Recreated all missing tables including notifications with correct schema.")
except Exception as e:
    print(f"Error: {e}")
