import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useWalletContext } from '../context/WalletContext';
import { formatAddress } from '../config/formatAddress';
import './LeaderBoard.css';

const MOCK_ENTRIES = [
  { rank: 1,  ens: 'vitalik.eth',      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', score: 994,  gradient: 'linear-gradient(135deg, #8b5cf6, #00e5ff)' },
  { rank: 2,  ens: 'ether-whale.eth',   address: '0x1234567890abcdef1234567890abcdef12348892', score: 952,  gradient: 'linear-gradient(135deg, #ff2d78, #f59e0b)' },
  { rank: 42, ens: 'guardian.eth',       address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', score: 841,  isYou: true, gradient: 'linear-gradient(135deg, #00e5ff, #4ade80)' },
  { rank: 43, ens: 'satoshi-fan.eth',    address: '0xDEAD000000000000000000000000000000000BEEF', score: 838,  gradient: 'linear-gradient(135deg, #f59e0b, #ff2d78)' },
];

const GRADIENTS = [
  'linear-gradient(135deg, #8b5cf6, #00e5ff)',
  'linear-gradient(135deg, #ff2d78, #f59e0b)',
  'linear-gradient(135deg, #00e5ff, #4ade80)',
  'linear-gradient(135deg, #f59e0b, #ff2d78)',
  'linear-gradient(135deg, #4ade80, #8b5cf6)',
  'linear-gradient(135deg, #60a5fa, #f59e0b)',
];

const FILTERS = ['Top 10', 'Top 100', 'All Time', 'Weekly'];

export default function LeaderBoard() {
  const [activeFilter, setActiveFilter] = useState('Top 10');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { walletAddress } = useWalletContext();

  useEffect(() => {
    let cancelled = false;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const limit = activeFilter === 'Top 10' ? 10 : 100;
        const res = await api.get(`/api/profile/leaderboard?limit=${limit}&page=1`);
        const { leaderboard } = res.data;

        if (!cancelled && leaderboard?.length > 0) {
          const mapped = leaderboard.map((entry, idx) => ({
            rank: entry.rank,
            ens: entry.ensName || formatAddress(entry.address),
            address: entry.address,
            score: entry.score,
            isYou: walletAddress && entry.address === walletAddress.toLowerCase(),
            gradient: GRADIENTS[idx % GRADIENTS.length],
          }));
          setEntries(mapped);
          setTotalCount(mapped.length);
        }
      } catch {
        // Backend unavailable — use mock data
        if (!cancelled) {
          const mockWithYou = MOCK_ENTRIES.map((e) => ({
            ...e,
            isYou: walletAddress && e.address.toLowerCase() === walletAddress.toLowerCase(),
          }));
          setEntries(mockWithYou);
          setTotalCount(12402);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => { cancelled = true; };
  }, [activeFilter, walletAddress]);

  const getRankClass = (entry) => {
    if (entry.isYou) return 'leaderboard-row__rank--you';
    if (entry.rank === 1) return 'leaderboard-row__rank--gold';
    if (entry.rank === 2) return 'leaderboard-row__rank--silver';
    if (entry.rank === 3) return 'leaderboard-row__rank--bronze';
    return '';
  };

  return (
    <div className="leaderboard-page" id="leaderboard-page">
      <div className="leaderboard-content" style={{ position: 'relative' }}>
        <h1 className="leaderboard-content__title">ReputX Reputation</h1>
        <p className="leaderboard-content__desc">
          The definitive index of decentralized trust. Reputation scores are calculated via
          multi-vector consensus including voting history, asset longevity, and on-chain identity verification.
        </p>

        {/* Filters */}
        <div className="leaderboard-filters" id="leaderboard-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`leaderboard-filter-btn${activeFilter === f ? ' active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Column headers */}
        <div className="leaderboard-header">
          <span className="leaderboard-header__col">Rank</span>
          <span className="leaderboard-header__col">Identity / ENS</span>
          <span className="leaderboard-header__col leaderboard-header__col--right">Reputation Score</span>
        </div>

        {/* Rows */}
        <div className="leaderboard-list" id="leaderboard-list">
          {loading ? (
            // Skeleton loading rows
            [1, 2, 3, 4].map((i) => (
              <div key={`skel-${i}`} className="leaderboard-row leaderboard-row--blurred">
                <span className="leaderboard-row__rank" />
                <div className="leaderboard-row__identity">
                  <div className="leaderboard-row__avatar">
                    <div className="leaderboard-avatar-gradient" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div className="leaderboard-row__name">
                    <span className="leaderboard-row__ens skeleton" style={{ width: 120, height: 14, display: 'inline-block' }} />
                    <span className="leaderboard-row__address skeleton" style={{ width: 90, height: 10, display: 'inline-block', marginTop: 4 }} />
                  </div>
                </div>
                <div className="leaderboard-row__score-col">
                  <span className="skeleton" style={{ width: 40, height: 20, display: 'inline-block' }} />
                </div>
              </div>
            ))
          ) : (
            entries.map((entry) => (
              <div
                key={entry.rank}
                className={`leaderboard-row${entry.isYou ? ' leaderboard-row--you' : ''}`}
                style={{ animationDelay: `${entry.rank * 0.05}s` }}
              >
                <span className={`leaderboard-row__rank ${getRankClass(entry)}`}>
                  {String(entry.rank).padStart(2, '0')}
                </span>

                <div className="leaderboard-row__identity">
                  <div className="leaderboard-row__avatar">
                    <div className="leaderboard-avatar-gradient" style={{ background: entry.gradient }} />
                  </div>
                  <div className="leaderboard-row__name">
                    <span className="leaderboard-row__ens">
                      {entry.isYou ? `You (${entry.ens})` : entry.ens}
                      {entry.isYou && (
                        <span className="leaderboard-row__you-badge">✓</span>
                      )}
                    </span>
                    <span className={`leaderboard-row__address${entry.isYou ? ' leaderboard-row__address--you' : ''}`}>
                      {formatAddress(entry.address)}
                    </span>
                  </div>
                </div>

                <div className="leaderboard-row__score-col">
                  <span className={`leaderboard-row__score${entry.isYou ? ' leaderboard-row__score--you' : ''}`}>
                    {entry.score}
                  </span>
                  <div className="leaderboard-row__bar-track">
                    <div
                      className={`leaderboard-row__bar-fill${entry.isYou ? ' leaderboard-row__bar-fill--you' : ''}`}
                      style={{ width: `${(entry.score / 1000) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Blurred skeleton rows */}
          {!loading && [1, 2].map((i) => (
            <div key={`blur-${i}`} className="leaderboard-row leaderboard-row--blurred">
              <span className="leaderboard-row__rank" />
              <div className="leaderboard-row__identity">
                <div className="leaderboard-row__avatar">
                  <div className="leaderboard-avatar-gradient" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div className="leaderboard-row__name">
                  <span className="leaderboard-row__ens skeleton" style={{ width: 120, height: 14, display: 'inline-block' }} />
                  <span className="leaderboard-row__address skeleton" style={{ width: 90, height: 10, display: 'inline-block', marginTop: 4 }} />
                </div>
              </div>
              <div className="leaderboard-row__score-col">
                <span className="skeleton" style={{ width: 40, height: 20, display: 'inline-block' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination footer */}
        <div className="leaderboard-footer" id="leaderboard-footer">
          <span className="leaderboard-footer__count">
            Showing 1–{entries.length} of {totalCount.toLocaleString()} active vault identities
          </span>
          <div className="leaderboard-pagination">
            <button className="pagination-btn" disabled>‹</button>
            <button className="pagination-btn active">1</button>
          </div>
        </div>
      </div>
    </div>
  );
}
