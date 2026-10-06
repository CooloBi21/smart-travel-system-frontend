import { useEffect, useState } from 'react';
import { getMeApi, loginApi, registerApi } from '../api/auth.api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getMeApi();
        const currentUser = response?.user || response;

        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await loginApi(email, password);

    const token = response.accessToken || response.token;

    if (!token) {
      throw new Error('Backend không trả access token.');
    }

    localStorage.setItem('token', token);

    const loggedUser = response.user || await getMeApi();
    const currentUser = loggedUser?.user || loggedUser;

    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);

    return currentUser;
  };

  const register = async (payload) => {
    return registerApi(payload);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
