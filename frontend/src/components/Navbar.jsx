import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const profileIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/">Blog Home</Link>
      </div>
      <div className="navbar-links" style={{ display: 'flex', alignItems: 'center' }}>
        {user ? (
          <>
            {user.role === 'admin' && <Link to="/admin">Admin Panel</Link>}
            <button onClick={logout}>Logout</button>
            <Link to={`/profile/${user.username}`} title="My Profile">
              {profileIcon}
            </Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;