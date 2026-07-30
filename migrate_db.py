import sqlite3

def migrate_db():
    db_path = 'instance/research_ai.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    columns = [
        ('abstract', 'TEXT'),
        ('keywords', 'TEXT'),
        ('references', 'TEXT')
    ]
    
    for col_name, col_type in columns:
        try:
            cursor.execute(f'ALTER TABLE papers ADD COLUMN "{col_name}" {col_type}')
            print(f"Successfully added column {col_name}")
        except sqlite3.OperationalError as e:
            # Column might already exist
            print(f"Error adding {col_name}: {e}")
            
    conn.commit()
    conn.close()

if __name__ == '__main__':
    migrate_db()
