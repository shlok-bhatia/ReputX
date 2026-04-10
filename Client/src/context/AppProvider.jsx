import React from 'react';
import { AuthProvider }   from './AuthContext';
import { WalletProvider } from './WalletContext';

export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AuthProvider>
  );
}