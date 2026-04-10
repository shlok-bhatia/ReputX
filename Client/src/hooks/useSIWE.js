import { useState, useCallback } from 'react';
import api from '../config/axios';

/**
 * Hook for Sign-In With Ethereum (SIWE) flow.
 * 1. GET /auth/nonce?address=...
 * 2. User signs the nonce (via MetaMask, or mock if MetaMask unavailable)
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
      // Step 1 — fetch nonce and message from backend
      const { data: nonceData } = await api.get(`/api/auth/nonce?address=${address}`);
      const nonce = nonceData.nonce;
      const message = nonceData.message;

      let signature;

      // Step 2 — sign message with MetaMask or fall back to mock
      if (window.ethereum) {
        try {
          signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, address],
          });
        } catch (signErr) {
          setError('User rejected the signature request');
          setLoading(false);
          return null;
        }
      } else {
        // Mock signature when MetaMask is not available
        signature = `mock-sig-${nonce}`;
      }

      // Step 3 — verify signature with backend
      const { data: verifyData } = await api.post('/api/auth/verify', {
        address,
        signature,
      });

      setLoading(false);
      return verifyData; // { token, address }
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e.message || 'SIWE failed';
      setError(msg);
      setLoading(false);
      return null;
    }
  }, []);

  return { signIn, loading, error };
}
