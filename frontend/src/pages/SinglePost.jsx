import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getPost, deletePostApi, toggleLike, getComments, addComment, deleteComment } from '../api';
import toast from 'react-hot-toast';

const SinglePost = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const postRes = await getPost(id);
      setPost(postRes.data);
      const commentsRes = await getComments(id);
      setComments(commentsRes.data);
    } catch (err) {
      toast.error('Could not fetch post details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePostDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePostApi(id);
        toast.success('Post deleted successfully');
        navigate('/');
      } catch (err) {
        toast.error('Failed to delete post.');
      }
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Please log in to like a post.');
    try {
      const res = await toggleLike(id);
      setPost({ ...post, like_count: res.data.like_count });
      toast.success(res.data.msg);
    } catch (err) {
      toast.error('Failed to update like.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment(id, { content: newComment });
      setNewComment('');
      fetchData();
    } catch (err) {
      toast.error('Failed to post comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
        try {
            await deleteComment(commentId);
            fetchData();
            toast.success("Comment deleted.");
        } catch (err) {
            toast.error('Failed to delete comment.');
        }
    }
  };
  
  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  const isAuthor = user && user.id === post.author_id;

  return (
    <div>
      {isAuthor && (
        <div className="author-controls">
          <Link to={`/edit-post/${post.id}`}><button>Edit Post</button></Link>
          <button onClick={handlePostDelete} className="button-delete">Delete Post</button>
        </div>
      )}

      <h1>{post.title}</h1>
      <p>by <Link to={`/profile/${post.author}`}>{post.author}</Link></p>
      {post.image_url && <img src={post.image_url} alt={post.title} style={{ maxWidth: '100%', borderRadius: '8px' }} />}
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleLike}>
          👍 Like ({post.like_count})
        </button>
      </div>

      <hr style={{margin: '2rem 0'}}/>
      
      <div className="comment-section">
        <h3>Comments ({comments.length})</h3>
        {user ? (
          <form onSubmit={handleCommentSubmit}>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              required
              rows="3"
            />
            <button type="submit">Post Comment</button>
          </form>
        ) : (
          <p><Link to="/login">Log in</Link> to post a comment.</p>
        )}

        <div style={{ marginTop: '20px' }}>
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <p className="comment-author">
                <Link to={`/profile/${comment.author}`}>{comment.author}</Link>
              </p>
              <p>{comment.content}</p>
              {(user && (user.id === comment.author_id || user.role === 'admin')) && (
                  <button onClick={() => handleDeleteComment(comment.id)} style={{color: 'red'}}>
                    Delete
                  </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SinglePost;