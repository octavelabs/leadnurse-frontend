import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { logoutUser } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Silently check if the httpOnly cookie is valid and hydrate user state
  const loadUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch {
      setUser(null); // not logged in — this is fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // Called after a successful login — cookie is already set server-side
  const login = (userData) => {
    setUser(userData);
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    if (from && from.startsWith('/') && !from.startsWith('//')) {
      navigate(from, { replace: true });
    } else {
      navigate(userData.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  };

  // Re-hydrate user state from server (after profile/avatar update)
  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    try { await logoutUser(); } catch { /* ignore errors — clear client state regardless */ }
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = { user, loading, login, logout, refreshUser, isAdmin: user?.role === 'ADMIN' };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
