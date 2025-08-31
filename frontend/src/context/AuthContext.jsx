import React, { createContext, useState, useEffect, useMemo } from 'react';
import { loginApi, logoutApi, setAuthToken, getMeApi } from '../api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const { data } = await getMeApi();
          setUser(data);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setTokenState(null);
          console.error("Session restore failed, token cleared.", error);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const u = res?.data?.user;
    const t = res?.data?.access_token;

    if (!t || !u) throw new Error('Unexpected login response');

    setAuthToken(t);
    setTokenState(t);
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    return u;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Server logout failed", error);
    } finally {
      setUser(null);
      setTokenState(null);
      setAuthToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    loading,
    isAdmin: !!user && user.role === 'admin',
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};