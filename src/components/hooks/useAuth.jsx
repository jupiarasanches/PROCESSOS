import { useState, useEffect } from 'react';
import { AuthService } from '@/services';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      setError(err.message);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.login(email, password);
      setCurrentUser(result.user);
      return { success: true, user: result.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateMyUserData = async (updates) => {
    try {
      const updatedUser = await AuthService.updateMyUserData(updates);
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    currentUser,
    loading,
    error,
    login,
    logout,
    refetch: loadCurrentUser,
    updateMyUserData
  };
}
