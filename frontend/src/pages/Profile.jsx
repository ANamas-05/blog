import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProfile, deleteAccount } from '../api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (username) {
        try {
          setLoading(true);
          const { data } = await getProfile(username);
          setProfile(data);
        } catch (err) {
          toast.error('User not found.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [username]);
  
  const handleDeleteAccount = async () => {
      if (window.confirm('Are you sure you want to permanently delete your account and all your data? This action cannot be undone.')) {
          try {
              await deleteAccount();
              toast.success('Account deleted successfully.');
              logout();
              navigate('/');
          } catch (err) {
              toast.error('Failed to delete account.');
          }
      }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Failed to load profile.</p>;
  
  const isOwnProfile = user && user.username === profile.username;

  return (
    <div>
      <h2>{profile.username}'s Profile</h2>
      {profile.bio && <p>{profile.bio}</p>}
      
      {isOwnProfile && (
        <div className="profile-settings">
            <h3>Account Settings</h3>
            <div className="settings-buttons">
                <button onClick={logout}>Logout</button>
                <button onClick={handleDeleteAccount} className="button-delete">Delete My Account</button>
            </div>
        </div>
      )}
      
      <hr style={{margin: '2rem 0'}}/>

      <h3>Posts by {profile.username}</h3>
      {profile.posts.length > 0 ? (
        profile.posts.map(post => (
          <div key={post.id} className="post-card">
            <Link to={`/posts/${post.id}`}><h4>{post.title}</h4></Link>
          </div>
        ))
      ) : (
        <p>This user has not created any posts yet.</p>
      )}
    </div>
  );
};

export default Profile;