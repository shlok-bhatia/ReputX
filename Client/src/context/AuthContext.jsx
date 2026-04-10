import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setAuthToken } from '../config/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [jwt, setJwt]       = useState(() => localStorage.getItem('reputx_token'));
  const [address, setAddress] = useState(() => localStorage.getItem('reputx_address'));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('reputx_token'));

  // Restore auth token on mount
  useEffect(() => {
    if (jwt) {
      setAuthToken(jwt);
    }
  }, []);

  const login = useCallback((token, walletAddress) => {
    setJwt(token);
    setAddress(walletAddress);
    setIsAuthenticated(true);
    setAuthToken(token);
    localStorage.setItem('reputx_token', token);
    localStorage.setItem('reputx_address', walletAddress);
  }, []);

  const logout = useCallback(() => {
    setJwt(null);
    setAddress(null);
    setIsAuthenticated(false);
    setAuthToken(null);
    localStorage.removeItem('reputx_token');
    localStorage.removeItem('reputx_address');
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