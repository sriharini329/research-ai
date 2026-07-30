import os
import shutil
import sqlite3
import datetime

db_path = os.path.join('instance', 'research_ai.db')
backup_dir = 'backups'

if not os.path.exists(backup_dir):
    os.makedirs(backup_dir)

if os.path.exists(db_path):
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(backup_dir, f'research_ai_backup_{timestamp}.db')
    shutil.copy2(db_path, backup_path)
    print(f"Backup created at: {backup_path}")
else:
    print(f"Database {db_path} not found. Nothing to backup.")

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Try adding paper_id if it's missing
    try:
        cursor.execute("ALTER TABLE notifications ADD COLUMN paper_id INTEGER")
        print("Successfully added paper_id column to notifications table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column paper_id already exists.")
        elif "no such table" in str(e):
            print("Table notifications does not exist yet. It will be created by Flask.")
        else:
            print(f"Could not add column cleanly, recreating notifications table: {e}")
            cursor.execute("DROP TABLE IF EXISTS notifications")
            print("Dropped notifications table.")
    
    conn.commit()
    conn.close()
    
    from research_ai_app import app, db
    with app.app_context():
        db.create_all()
        print("Ran db.create_all() to ensure all tables exist with correct schema.")
        
except Exception as e:
    print(f"Error during migration: {e}")
