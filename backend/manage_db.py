#!/usr/bin/env python3
"""Prepare the database for app startup.

This is intentionally conservative for hosted demos where an older database may
already exist from before Alembic migrations were added.
"""

from sqlalchemy import inspect, text

from app import create_app
from app.extensions import db


ALEMBIC_HEAD = "705a571a26b1"


def table_columns(connection, table_name):
    inspector = inspect(connection)
    if table_name not in inspector.get_table_names():
        return set()
    return {column["name"] for column in inspector.get_columns(table_name)}


def ensure_column(connection, table_name, column_name, ddl):
    if column_name not in table_columns(connection, table_name):
        connection.execute(text(f'ALTER TABLE "{table_name}" ADD COLUMN {ddl}'))
        print(f"Added missing column {table_name}.{column_name}")


def ensure_alembic_stamp(connection):
    connection.execute(
        text(
            "CREATE TABLE IF NOT EXISTS alembic_version "
            "(version_num VARCHAR(32) NOT NULL)"
        )
    )
    existing = connection.execute(text("SELECT version_num FROM alembic_version")).first()
    if existing:
        connection.execute(text("UPDATE alembic_version SET version_num = :version"), {"version": ALEMBIC_HEAD})
    else:
        connection.execute(text("INSERT INTO alembic_version (version_num) VALUES (:version)"), {"version": ALEMBIC_HEAD})
    print(f"Database stamped at Alembic revision {ALEMBIC_HEAD}")


def prepare_database():
    app = create_app()
    with app.app_context():
        db.create_all()
        with db.engine.begin() as connection:
            ensure_column(
                connection,
                "user",
                "role",
                "role VARCHAR(20) NOT NULL DEFAULT 'customer'",
            )
            ensure_column(
                connection,
                "payment",
                "expires_at",
                "expires_at TIMESTAMP NULL",
            )
            ensure_alembic_stamp(connection)
        print("Database is ready")


if __name__ == "__main__":
    prepare_database()
