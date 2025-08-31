from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity 
from app import app
from models import User
from post_routes import serialize_post
from decorators import admin_required

@app.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if user:
        return jsonify({
            "id": user.id,
            "username": user.username,
            "role": user.role
        })
    return jsonify({"msg": "User not found"}), 404

@app.route('/users/<string:username>', methods=['GET'])
def get_user_profile(username):
    user = User.query.filter_by(username=username).first_or_404()
    
    posts = sorted(user.posts, key=lambda p: p.created_at, reverse=True)

    return jsonify({
        "username": user.username,
        "bio": user.bio,
        "posts": [serialize_post(post) for post in posts]
    })

@app.route('/admin/users', methods=['GET'])
@admin_required()
def get_all_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    } for user in users])