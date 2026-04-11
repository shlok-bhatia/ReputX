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
  stats: {
    transactionCount: 300,
    uniqueContracts: 45,
    nftHoldings: 12,
    daoVotes: 50,
  },
};

/**
 * Fetches the reputation score AND badges for a given address from the backend.
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
      // Fetch reputation score and badges in parallel
      const [scoreRes, badgeRes] = await Promise.allSettled([
        api.get(`/api/reputation/${address}`),
        api.get(`/api/badges/${address}`),
      ]);

      const apiData = scoreRes.status === 'fulfilled' ? scoreRes.value.data : null;
      const badgeData = badgeRes.status === 'fulfilled' ? badgeRes.value.data : null;

      if (!apiData) {
        // Both failed — fall back to mock
        throw new Error('Reputation API unavailable');
      }

      // Map badge types from API to display labels
      const badgeLabels = badgeData?.badges?.map(b => b.label || b.type) || [];

      // Normalise API response to match component expectations
      setData({
        score: apiData.score,
        tier: apiData.tier,
        breakdown: apiData.breakdown || {},
        stats: apiData.stats || {},
        sybilRisk: apiData.sybilRisk || 'NONE',
        badges: badgeLabels,
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