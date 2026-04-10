import { useState, useEffect, useCallback } from 'react';

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
 * Fetches (or mocks) the reputation score for a given address.
 */
export function useReputation(address) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      // In production: const res = await axios.get(`/reputation/${address}`);
      await new Promise((r) => setTimeout(r, 900));
      setData(MOCK_SCORE);
    } catch (e) {
      setError(e.message || 'Failed to load reputation');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}