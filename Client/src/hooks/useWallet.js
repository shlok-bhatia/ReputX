import { useWalletContext } from '../context/WalletContext';

/**
 * Thin wrapper around WalletContext for convenience.
 * Returns: { isConnected, walletAddress, ensName, isConnecting, connect, disconnect }
 */
export function useWallet() {
  return useWalletContext();
}