from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from app import app, db
from models import Post, User, Category, Tag, Comment

def serialize_post(post):
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "image_url": post.image_url,
        "author": post.author.username,
        "author_id": post.user_id,
        "created_at": post.created_at.isoformat(),
        "categories": [category.name for category in post.categories],
        "tags": [tag.name for tag in post.tags],
        "like_count": len(post.likers)
    }

@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    current_user_id = int(get_jwt_identity())
    
    new_post = Post(title=data.get('title'), content=data.get('content'), image_url=data.get('image_url'), user_id=current_user_id)

    if 'categories' in data:
        for category_name in data['categories']:
            category = Category.query.filter_by(name=category_name).first() or Category(name=category_name)
            new_post.categories.append(category)

    if 'tags' in data:
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first() or Tag(name=tag_name)
            new_post.tags.append(tag)
    
    db.session.add(new_post)
    db.session.commit()
    return jsonify(serialize_post(new_post)), 201

@app.route('/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_name = request.args.get('category', type=str)
    
    query = Post.query
    if category_name:
        query = query.join(Post.categories).filter(Category.name == category_name)
    
    posts_pagination = query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "posts": [serialize_post(post) for post in posts_pagination.items],
        "total_pages": posts_pagination.pages,
        "current_page": posts_pagination.page,
    })

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(serialize_post(post))

@app.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    current_user_id = int(get_jwt_identity())

    if post.user_id != current_user_id:
        return jsonify({"msg": "Forbidden: You are not the author"}), 403

    data = request.get_json()
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    post.image_url = data.get('image_url', post.image_url)
    
    db.session.commit()
    return jsonify(serialize_post(post))

@app.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    current_user_id = int(get_jwt_identity())

    if post.user_id != current_user_id:
        return jsonify({"msg": "Forbidden: You are not the author"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"msg": "Post deleted successfully"}), 200

@app.route('/search', methods=['GET'])
def search_posts():
    query_str = request.args.get('q', '', type=str)

    if not query_str:
        return jsonify({"posts": []})

    search_results = Post.query.join(Post.tags).filter(
        or_(Post.title.ilike(f'%{query_str}%'), Tag.name.ilike(f'%{query_str}%'))
    ).distinct().all()
    
    return jsonify({"posts": [serialize_post(post) for post in search_results]})

@app.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def toggle_like(post_id):
    post = Post.query.get_or_404(post_id)
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    if user in post.likers:
        post.likers.remove(user)
        message = "Post unliked"
    else:
        post.likers.append(user)
        message = "Post liked"
    
    db.session.commit()
    return jsonify({"msg": message, "like_count": len(post.likers)})

@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post = Post.query.get_or_404(post_id)
    comments = sorted(post.comments, key=lambda c: c.created_at)
    return jsonify([{
        "id": comment.id,
        "content": comment.content,
        "author_id": comment.user_id,
        "author": comment.author.username,
        "created_at": comment.created_at.isoformat()
    } for comment in comments])

@app.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    post = Post.query.get_or_404(post_id)
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    new_comment = Comment(
        content=data.get('content'),
        user_id=current_user_id,
        post_id=post.id
    )

    db.session.add(new_comment)
    db.session.commit()
    return jsonify({"msg": "Comment created"}), 201

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    current_user_id = int(get_jwt_identity())

    if comment.user_id != current_user_id:
        return jsonify({"msg": "Forbidden"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"msg": "Comment deleted"}), 200