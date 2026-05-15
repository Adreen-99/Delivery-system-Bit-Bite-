import os
from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    uvicorn.run('wsgi:app', host='0.0.0.0', port=port, workers=2)
