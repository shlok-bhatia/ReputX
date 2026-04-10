import { useState, useEffect } from 'react';
import api from '../config/axios';

/**
 * Resolves ENS name for a given wallet address by calling the backend profile API.
 * Falls back to mock data if the API is unavailable.
 */
export function useENS(address) {
  const [ensName, setEnsName] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) { setEnsName(null); return; }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await api.get(`/profile/${address}`);
        if (!cancelled) {
          setEnsName(res.data.ensName || null);
        }
      } catch {
        // Fallback mock ENS lookup if backend is unavailable
        if (!cancelled) {
          const mock = {
            '0x71c7656ec7ab88b098defb751b7401b5f6d8976f': 'guardian.eth',
            '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': 'vitalik.eth',
          };
          setEnsName(mock[address.toLowerCase()] || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [address]);

  return { ensName, loading };
}