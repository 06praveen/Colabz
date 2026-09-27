import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock Login Handler (Prepares frontend architecture for Phase 6 API)
  const login = async (email, password) => {
    setLoading(true);
    // Simulate frontend validation & response
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          name: email.split('@')[0],
          email: email,
          avatar: null,
          role: 'DEVELOPER'
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        setLoading(false);
        resolve({ success: true, user: mockUser });
      }, 600);
    });
  };

  // Mock Signup Handler
  const signup = async (name, email, password) => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          name,
          email,
          avatar: null,
          role: 'OWNER'
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        setLoading(false);
        resolve({ success: true, user: mockUser });
      }, 600);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout }}>
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
