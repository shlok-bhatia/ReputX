import React, { createContext, useContext, useState, useCallback } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected]     = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [ensName, setEnsName]             = useState(null);
  const [isConnecting, setIsConnecting]   = useState(false);

  const connect = useCallback(async (address) => {
    setIsConnecting(true);
    try {
      // Request MetaMask accounts
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const account = address || accounts[0];
        setWalletAddress(account);
        setIsConnected(true);

        // Try to get ENS name if provider supports it
        try {
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const name = await provider.lookupAddress(account);
          setEnsName(name);
        } catch {
          setEnsName(null);
        }
        return account;
      } else {
        // Fallback mock wallet for demo when MetaMask is not installed
        const mockAddress = address || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
        setWalletAddress(mockAddress);
        setEnsName('guardian.eth');
        setIsConnected(true);
        return mockAddress;
      }
    } catch (err) {
      console.error('[WalletContext] Connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
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