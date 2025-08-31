import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePostButton from './components/CreatePostButton';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SinglePost from './pages/SinglePost';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import PostForm from './pages/PostForm';
import SearchResults from './pages/SearchResults';

// Import Global Stylesheet
import './index.css';

function App() {
  return (
    <div>
      <Toaster position="top-right" />
      <Navbar />
      <main className="container">
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<SinglePost />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/search" element={<SearchResults />} />

          {/* --- Protected Routes for Logged-in Users --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/create-post" element={<PostForm />} />
            <Route path="/edit-post/:id" element={<PostForm />} />
          </Route>

          {/* --- Protected Route for Admin Users Only --- */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
      <CreatePostButton />
    </div>
  );
}

export default App;