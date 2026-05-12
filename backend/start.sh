#!/bin/bash
# Start Bit-Bite Backend (Development)

cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.dependencies_installed" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.dependencies_installed
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env and configure your database connection"
    echo "   For quick testing, you can use SQLite by setting:"
    echo "   DATABASE_URL=sqlite:///bitbite.db"
    echo ""
    read -p "Press Enter to continue..."
fi

# Initialize database if needed
if [ "$1" = "--init" ]; then
    echo "Initializing database..."
    flask --app run:app db init
    flask --app run:app db migrate -m "Initial migration"
    flask --app run:app db upgrade
    echo "✓ Database initialized"
    echo ""
fi

# Check if database is accessible
echo "Starting backend server..."
python run.py
