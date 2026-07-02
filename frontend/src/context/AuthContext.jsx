import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const response = await api.post('/login', {
        username_or_email: usernameOrEmail,
        password,
      });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      await fetchProfile();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      await api.post('/register', {
        username,
        email,
        password,
      });
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
