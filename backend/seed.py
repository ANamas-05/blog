from app import app, db
from models import User, Post, Category, Tag, Comment, TokenBlocklist
from faker import Faker
from werkzeug.security import generate_password_hash
import random

fake = Faker()

def seed_db():
    with app.app_context():
        print("Clearing old data...")
        TokenBlocklist.query.delete()
        Comment.query.delete()
        db.session.execute(post_likes.delete())
        db.session.execute(post_tags.delete())
        db.session.execute(post_categories.delete())
        Post.query.delete()
        User.query.delete()
        Category.query.delete()
        Tag.query.delete()
        db.session.commit()

        print("Seeding new data...")

        # Create Users
        users = []
        for i in range(5):
            user = User(
                username=fake.user_name(),
                email=fake.email(),
                password_hash=generate_password_hash('password123')
            )
            users.append(user)
        db.session.add_all(users)
        db.session.commit()

        # Create Categories & Tags
        category_names = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Programming']
        tag_names = ['Python', 'React', 'Flask', 'JavaScript', 'WebDev', 'Cooking', 'Adventure']
        
        categories = [Category(name=name) for name in category_names]
        tags = [Tag(name=name) for name in tag_names]
        db.session.add_all(categories)
        db.session.add_all(tags)
        db.session.commit()

        # Create Posts
        posts = []
        for _ in range(20):
            post = Post(
                title=fake.sentence(nb_words=6).capitalize(),
                content=fake.paragraph(nb_sentences=20),
                author=random.choice(users),
                categories=random.sample(categories, k=random.randint(1, 2)),
                tags=random.sample(tags, k=random.randint(2, 4))
            )
            posts.append(post)
        db.session.add_all(posts)
        db.session.commit()

        print("Database has been seeded!")