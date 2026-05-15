from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    db.create_all()


@app.route("/api/health")
def health():
    return {"status": "ok"}, 200