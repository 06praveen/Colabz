import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('colabz_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('colabz_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on application startup
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('colabz_token');
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authService.getMe();
        const dataObj = response?.data || response;
        const freshUser = dataObj?.user || response?.user;
        if (isMounted && freshUser) {
          setUser(freshUser);
          setToken(storedToken);
          localStorage.setItem('colabz_user', JSON.stringify(freshUser));
        } else if (isMounted) {
          const savedUser = localStorage.getItem('colabz_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            setToken(storedToken);
          }
        }
      } catch (err) {
        // Token is invalid or expired
        if (isMounted) {
          localStorage.removeItem('colabz_token');
          localStorage.removeItem('colabz_user');
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for 401 session expiration from API interceptor
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('colabz_token');
      localStorage.removeItem('colabz_user');
    };

    window.addEventListener('colabz_auth_expired', handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('colabz_auth_expired', handleAuthExpired);
    };
  }, []);

  // Real Login Handler
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const dataObj = response?.data || response;
      const loggedInUser = dataObj?.user || response?.user;
      const receivedToken = dataObj?.token || response?.token;

      if (receivedToken) {
        localStorage.setItem('colabz_token', receivedToken);
        setToken(receivedToken);
      }
      if (loggedInUser) {
        localStorage.setItem('colabz_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      return { success: true, user: loggedInUser, token: receivedToken };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Invalid email or password';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Real Signup Handler
  const signup = useCallback(async (nameOrData, username, email, password) => {
    setLoading(true);
    try {
      let payload = {};
      if (typeof nameOrData === 'object') {
        payload = nameOrData;
      } else {
        payload = { name: nameOrData, username, email, password };
      }

      const response = await authService.register(payload);
      const dataObj = response?.data || response;
      const newUser = dataObj?.user || response?.user;
      const receivedToken = dataObj?.token || response?.token;

      if (receivedToken) {
        localStorage.setItem('colabz_token', receivedToken);
        setToken(receivedToken);
      }
      if (newUser) {
        localStorage.setItem('colabz_user', JSON.stringify(newUser));
        setUser(newUser);
      }

      return { success: true, user: newUser, token: receivedToken };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors[0]?.message
          : null) ||
        err.message ||
        'Failed to create account';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync / Update local user profile state
  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser) return;
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updatedUser };
      localStorage.setItem('colabz_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Logout Handler
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('colabz_token');
      localStorage.removeItem('colabz_user');
      setUser(null);
      setToken(null);
      // Cleanly disconnect active socket
      try {
        disconnectSocket();
      } catch {
        // ignore
      }
    }
  }, []);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        signup,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
