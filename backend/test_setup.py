#!/usr/bin/env python3
"""
Test database creation with SQLite (no PostgreSQL required)
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Override config to use SQLite
os.environ['DATABASE_URL'] = 'sqlite:///test.db'

from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    print("Dropping all tables (if exist)...")
    db.drop_all()
    print("Creating all tables with SQLite...")
    db.create_all()
    print("✓ Tables created successfully!")

    # Show table names
    from sqlalchemy import inspect, text
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\nTables created: {', '.join(tables)}")

    # Count records - skip 'order' table if exists (it's a reserved keyword)
    print("\nTable contents:")
    for table in tables:
        try:
            result = db.session.execute(text(f"SELECT COUNT(*) FROM [{table}]" if table == 'order' else f"SELECT COUNT(*) FROM {table}")).scalar()
            print(f"  {table}: {result} rows")
        except Exception as e:
            print(f"  {table}: error - {e}")

    print(f"\n✓ SQLite test database created at: backend/test.db")
    print("\nNOTE: For production, use PostgreSQL and run:\n  flask --app run:app db init && flask --app run:app db upgrade")
