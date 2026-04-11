import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../config/axios';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [isConnected, setIsConnected]     = useState(() => !!localStorage.getItem('reputx_address'));
  const [walletAddress, setWalletAddress] = useState(() => localStorage.getItem('reputx_address'));
  const [ensName, setEnsName]             = useState(() => localStorage.getItem('reputx_ens') || null);
  const [isConnecting, setIsConnecting]   = useState(false);

  // Fetch ENS name from database
  const fetchENSFromDB = useCallback(async (address) => {
    console.log("check");
    try {
      const res = await api.get(`/api/profile/${address}`);
      const dbEnsName = res.data.ensName || null;
      console.log(res.data);
      if (dbEnsName) {
        setEnsName(dbEnsName);
        localStorage.setItem('reputx_ens', dbEnsName);
        return dbEnsName;
      }
    } catch (err) { 
      console.warn('[WalletContext] Failed to fetch ENS from DB:', err.message);
    }
    return null;
  }, []);

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
        localStorage.setItem('reputx_address', account);

        // Try to get ENS name from on-chain first
        let resolvedName = null;
        try {
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum);
          resolvedName = await provider.lookupAddress(account);
          if (resolvedName) {
            setEnsName(resolvedName);
            localStorage.setItem('reputx_ens', resolvedName);
          }
        } catch {
          console.warn('[WalletContext] ENS resolution failed, fetching from DB...');
        }

        // If on-chain ENS resolution failed, fetch from database
        if (!resolvedName) {
          await fetchENSFromDB(account);
        }

        return account;
      } else {
        // Fallback mock wallet for demo when MetaMask is not installed
        const mockAddress = address || import.meta.env.VITE_MY_WALLET;
        setWalletAddress(mockAddress);
        setIsConnected(true);
        localStorage.setItem('reputx_address', mockAddress);

        // Fetch ENS from database for mock wallet
        await fetchENSFromDB(mockAddress);

        return mockAddress;
      }
    } catch (err) {
      console.error('[WalletContext] Connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchENSFromDB]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setEnsName(null);
    localStorage.removeItem('reputx_address');
    localStorage.removeItem('reputx_ens');
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