@echo off
REM Start Bit-Bite Backend (Windows)
cd /d "%~dp0"

if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

if not exist "venv\.dependencies_installed" (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo. > venv\.dependencies_installed
)

if not exist ".env" (
    copy .env.example .env
    echo.
    echo NOTE: Please edit .env and configure your database connection
    echo For quick testing with SQLite, set: DATABASE_URL=sqlite:///bitbite.db
    echo.
    pause
)

if "%1"=="--init" (
    echo Initializing database...
    flask --app run:app db init
    flask --app run:app db migrate -m "Initial migration"
    flask --app run:app db upgrade
    echo Database initialized
    echo.
)

echo Starting backend server...
python run.py
