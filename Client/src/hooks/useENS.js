import { useState, useEffect } from 'react';

/**
 * Resolves ENS name for a given wallet address.
 * Falls back to null if not found.
 */
export function useENS(address) {
  const [ensName, setEnsName] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) { setEnsName(null); return; }

    setLoading(true);
    // In production: call GET /profile/:address and read ens field
    setTimeout(() => {
      // Mock: only known addresses resolve
      const mock = {
        '0x71C7656EC7ab88b098defB751B7401B5f6d8976F': 'guardian.eth',
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045': 'vitalik.eth',
      };
      setEnsName(mock[address] || null);
      setLoading(false);
    }, 400);
  }, [address]);

  return { ensName, loading };
}