from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)

    origins = app.config.get('CORS_ORIGINS', '*')
    if isinstance(origins, str):
        origins = [o.strip() for o in origins.split(',')]

    CORS(app, resources={r"/api/*": {"origins": origins, "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]}})

    db.init_app(app)
    migrate.init_app(app, db)

    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
