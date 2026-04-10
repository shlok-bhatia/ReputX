import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [jwt, setJwt]       = useState(null);
  const [address, setAddress] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((token, walletAddress) => {
    setJwt(token);
    setAddress(walletAddress);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setJwt(null);
    setAddress(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ jwt, address, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}