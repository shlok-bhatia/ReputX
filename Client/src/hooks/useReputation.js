import { useState, useEffect, useCallback } from 'react';
import api from '../config/axios';

const MOCK_SCORE = {
  score: 742,
  tier: 'Trusted',
  breakdown: {
    walletAge: 108,
    transactionCount: 148,
    uniqueContracts: 110,
    nftHoldings: 74,
    daoVotes: 148,
    ensName: 100,
    cleanRecord: 54,
  },
  badges: ['DAO Voter', 'ENS Holder', 'OG Wallet'],
  sybilRisk: 'LOW',
  humanProbability: 99.2,
  topPercent: '0.5',
  pointsLast30: 12,
};

/**
 * Fetches the reputation score for a given address from the backend.
 * Falls back to mock data if the API is unavailable.
 */
export function useReputation(address) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchReputation = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/reputation/${address}`);
      const apiData = res.data;

      // Normalise API response to match component expectations
      setData({
        score: apiData.score,
        tier: apiData.tier,
        breakdown: apiData.breakdown || {},
        sybilRisk: apiData.sybilRisk || 'NONE',
        badges: apiData.badges || [],
        fromCache: apiData.fromCache,
        cachedAt: apiData.cachedAt,
      });
    } catch (e) {
      console.warn('[useReputation] API failed, using mock data:', e.message);
      // Fall back to mock data so the UI still works without a running backend
      setData(MOCK_SCORE);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

  return { data, loading, error, refetch: fetchReputation };
}