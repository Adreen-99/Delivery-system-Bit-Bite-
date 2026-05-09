#!/usr/bin/env python3
"""Reset and reseed database"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ['DATABASE_URL'] = 'sqlite:///demo.db'

from app import create_app
from app.extensions import db

app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()
    print("✓ Database reset")

from seed import seed_database
seed_database()
