from flask import Flask
from flask_cors import CORS
from .extensions import db, migrate

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    db.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
