import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check localStorage on mount

  // On mount: try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('saree_token');
    const stored = localStorage.getItem('saree_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        localStorage.removeItem('saree_token');
        localStorage.removeItem('saree_user');
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem('saree_token', token);
    localStorage.setItem('saree_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    saveSession(data.token, data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveSession(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('saree_token');
    localStorage.removeItem('saree_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
