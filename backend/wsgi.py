from app import create_app

app = create_app()


@app.route("/api/health")
def health():
    return {"status": "ok"}, 200