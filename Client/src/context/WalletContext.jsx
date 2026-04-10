import React, { createContext, useContext, useState, useCallback } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected]   = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [ensName, setEnsName]           = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async (address) => {
    setIsConnecting(true);
    // Simulate connection delay
    await new Promise((r) => setTimeout(r, 600));
    setWalletAddress(address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
    setEnsName('guardian.eth');
    setIsConnected(true);
    setIsConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setEnsName(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{ isConnected, walletAddress, ensName, isConnecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used inside WalletProvider');
  return ctx;
}