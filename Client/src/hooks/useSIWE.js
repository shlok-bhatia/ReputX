import { useState, useCallback } from 'react';
import api from '../config/axios';

/**
 * Hook for Sign-In With Ethereum (SIWE) flow.
 * 1. GET /auth/nonce?address=...
 * 2. User signs the nonce (mock — MetaMask in production)
 * 3. POST /auth/verify { address, signature }
 * 4. Returns JWT on success
 */
export function useSIWE() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const signIn = useCallback(async (address) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1 — fetch nonce
      const { data: nonceData } = await api.get(`/auth/nonce?address=${address}`);
      const nonce = nonceData.nonce;

      // Step 2 — sign nonce (mock for now; real: signMessage via wagmi)
      const signature = `mock-sig-${nonce}`;

      // Step 3 — verify
      const { data: verifyData } = await api.post('/auth/verify', {
        address,
        signature,
      });

      setLoading(false);
      return verifyData; // { token, address }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'SIWE failed');
      setLoading(false);
      return null;
    }
  }, []);

  return { signIn, loading, error };
}
