import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api';
import toast from 'react-hot-toast';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await getPosts();
        setPosts(data.posts || []);
      } catch (err) {
        toast.error('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading posts...</p>;

  return (
    <div>
      <SearchBar />
      <h1>Latest Posts</h1>
      {posts.length > 0 ? (
        posts.map(post => (
          <Link to={`/posts/${post.id}`} key={post.id} className="post-card">
            <h2>{post.title}</h2>
            <p>by {post.author}</p>
            <small>Likes: {post.like_count}</small>
          </Link>
        ))
      ) : (
        <p>No posts have been created yet.</p>
      )}
    </div>
  );
};

export default Home;