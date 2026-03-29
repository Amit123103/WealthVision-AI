import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.database import engine

def fix_schema():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE predictions ADD COLUMN explainability_data JSON"))
            print("Successfully added explainability_data")
        except Exception as e:
            print(f"Skipped explainability_data: {e}")
            
        try:
            conn.execute(text("ALTER TABLE predictions ADD COLUMN data_sources_used JSON"))
            print("Successfully added data_sources_used")
        except Exception as e:
            print(f"Skipped data_sources_used: {e}")
            
        conn.commit()
    print("Database schema updated!")

if __name__ == "__main__":
    fix_schema()
