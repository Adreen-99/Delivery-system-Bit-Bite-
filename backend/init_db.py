#!/usr/bin/env python3
"""
Quick database initialization script.
This bypasses Flask-Migrate and creates tables directly.
Use only for development/testing.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    print("Creating all tables...")
    db.create_all()
    print("✓ Tables created successfully!")

    # Show table names
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\nTables created: {', '.join(tables)}")

    print("\nNow run: python seed.py (or flask shell) to add sample data")
