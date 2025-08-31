import os
import click
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Configurations ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['UPLOAD_FOLDER'] = 'uploads'

# --- Initialize Extensions ---
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# --- JWT Blocklist Configuration ---
from models import TokenBlocklist

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return token is not None

# --- Import Models & Routes ---
from models import User, Post, Category, Tag, Comment
import auth_routes
import post_routes
import user_routes
import upload_routes

# --- Base Route ---
@app.route('/')
def home():
    return "Blogging Web Application Backend is running!"

# --- Custom CLI Commands ---
@app.cli.command("promote-admin")
@click.argument("username")
def promote_admin(username):
    """Promotes a user to the admin role."""
    user = User.query.filter_by(username=username).first()
    if user:
        user.role = 'admin'
        db.session.commit()
        print(f"User {username} has been promoted to admin.")
    else:
        print(f"User {username} not found.")

@app.cli.command("seed")
def seed():
    """Seeds the database with sample data."""
    from seed import seed_db
    seed_db()

if __name__ == '__main__':
    app.run(debug=True)