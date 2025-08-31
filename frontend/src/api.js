import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('accessToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

const existingToken = localStorage.getItem('accessToken');
if (existingToken) {
  setAuthToken(existingToken);
}

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
    }
    return Promise.reject(err);
  }
);

// Auth
export const loginApi = (credentials) => apiClient.post('/login', credentials);
export const registerApi = (data) => apiClient.post('/register', data);
export const deleteAccount = () => apiClient.delete('/account');
export const logoutApi = () => apiClient.post('/logout');
export const getMeApi = () => apiClient.get('/me');

// Posts
export const getPosts = (params) => apiClient.get('/posts', { params });
export const getPost = (id) => apiClient.get(`/posts/${id}`);
export const createPost = (data) => apiClient.post('/posts', data);
export const updatePostApi = (id, data) => apiClient.put(`/posts/${id}`, data);
export const deletePostApi = (id) => apiClient.delete(`/posts/${id}`);
export const searchPosts = (q) => apiClient.get('/search', { params: { q } });
export const toggleLike = (id) => apiClient.post(`/posts/${id}/like`);

// Comments
export const getComments = (postId) => apiClient.get(`/posts/${postId}/comments`);
export const addComment = (postId, commentData) => apiClient.post(`/posts/${postId}/comments`, commentData);
export const deleteComment = (id) => apiClient.delete(`/comments/${id}`);

// Uploads
export const uploadImage = (formData) => apiClient.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Users & Admin
export const getProfile = (username) => apiClient.get(`/users/${username}`);
export const getAllUsers = () => apiClient.get('/admin/users');