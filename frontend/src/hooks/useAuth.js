import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');

        if (response.data.success && response.data.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  return { user, loading, logout };
};
