import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/axios';
import { useWalletContext } from '../context/WalletContext';
import { formatAddress } from '../config/formatAddress';
import './LeaderBoard.css';

const MOCK_ENTRIES = [
  { rank: 1,  ens: 'vitalik.eth',      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', score: 994,  change: +12 },
  { rank: 2,  ens: 'ether-whale.eth',   address: '0x1234567890abcdef1234567890abcdef12348892', score: 952,  change: +8  },
  { rank: 3,  ens: 'defi-wizard.eth',   address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12', score: 948,  change: -2  },
  { rank: 4,  ens: 'nft-sage.eth',      address: '0x2345678901234567890123456789012345678901', score: 935,  change: +5  },
  { rank: 5,  ens: 'chain-oracle.eth',  address: '0x3456789012345678901234567890123456789012', score: 921,  change: +3  },
  { rank: 6,  ens: 'block-knight.eth',  address: '0x4567890123456789012345678901234567890123', score: 910,  change: +1  },
  { rank: 7,  ens: 'gas-guru.eth',      address: '0x5678901234567890123456789012345678901234', score: 897,  change: -4  },
  { rank: 8,  ens: 'yield-hunter.eth',  address: '0x6789012345678901234567890123456789012345', score: 885,  change: +7  },
  { rank: 9,  ens: 'tx-phantom.eth',    address: '0x7890123456789012345678901234567890123456', score: 872,  change: 0   },
  { rank: 10, ens: 'dao-sentinel.eth',  address: '0x8901234567890123456789012345678901234567', score: 868,  change: +2  },
  { rank: 42, ens: 'guardian.eth',       address: import.meta.env.VITE_MY_WALLET, score: 841,  change: +15, isYou: true },
  { rank: 43, ens: 'satoshi-fan.eth',   address: '0xDEAD000000000000000000000000000000000BEEF', score: 838,  change: -1  },
];

const GRADIENTS = [
  'linear-gradient(135deg, #8b5cf6, #00e5ff)',
  'linear-gradient(135deg, #ff2d78, #f59e0b)',
  'linear-gradient(135deg, #00e5ff, #4ade80)',
  'linear-gradient(135deg, #f59e0b, #ff2d78)',
  'linear-gradient(135deg, #4ade80, #8b5cf6)',
  'linear-gradient(135deg, #60a5fa, #f59e0b)',
  'linear-gradient(135deg, #f472b6, #8b5cf6)',
  'linear-gradient(135deg, #34d399, #60a5fa)',
];

const FILTERS = ['Top 10', 'Top 50', 'Top 100', 'All Time', 'Weekly'];
const PER_PAGE = 10;

export default function LeaderBoard() {
  const [activeFilter, setActiveFilter] = useState('Top 10');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [avgScore, setAvgScore] = useState(847);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const { walletAddress } = useWalletContext();

  useEffect(() => {
    let cancelled = false;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const limit = activeFilter === 'Top 10' ? 10 : activeFilter === 'Top 50' ? 50 : 100;
        const res = await api.get(`/api/profile/leaderboard?limit=${limit}&page=${currentPage}`);
        const { leaderboard, total, avgScore: fetchedAvgScore } = res.data;

        if (!cancelled && leaderboard?.length > 0) {
          const mapped = leaderboard.map((entry, idx) => ({
            rank: entry.rank,
            ens: entry.ensName || formatAddress(entry.address),
            address: entry.address,
            score: entry.score,
            change: entry.change || 0,
            isYou: walletAddress && entry.address === walletAddress.toLowerCase(),
            gradient: GRADIENTS[idx % GRADIENTS.length],
          }));
          setEntries(mapped);
          setTotalCount(total || mapped.length);
          if (fetchedAvgScore) setAvgScore(fetchedAvgScore);
        }
      } catch {
        // Backend unavailable — use mock data
        if (!cancelled) {
          const mockWithYou = MOCK_ENTRIES.map((e, idx) => ({
            ...e,
            isYou: walletAddress
              ? e.address.toLowerCase() === walletAddress.toLowerCase()
              : e.isYou,
            gradient: GRADIENTS[idx % GRADIENTS.length],
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
  }, [activeFilter, currentPage, walletAddress]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Search filter
  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.ens.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
    );
  }, [entries, search]);

  // Paginated entries
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PER_PAGE));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return filteredEntries.slice(start, start + PER_PAGE);
  }, [filteredEntries, currentPage]);

  // Find "Your" entry
  const yourEntry = entries.find((e) => e.isYou);

  const getRankClass = (entry) => {
    if (entry.isYou) return 'leaderboard-row__rank--you';
    if (entry.rank === 1) return 'leaderboard-row__rank--gold';
    if (entry.rank === 2) return 'leaderboard-row__rank--silver';
    if (entry.rank === 3) return 'leaderboard-row__rank--bronze';
    return '';
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getChangeClass = (change) => {
    if (change > 0) return 'change--up';
    if (change < 0) return 'change--down';
    return 'change--neutral';
  };

  const formatChange = (change) => {
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return '—';
  };

  return (
    <div className="leaderboard-page" id="leaderboard-page">
      <div className="leaderboard-content" style={{ position: 'relative' }}>
        {/* ── Header Area ── */}
        <div className="leaderboard-top">
          <div className="leaderboard-top__text">
            <h1 className="leaderboard-content__title">ReputX Reputation</h1>
            <p className="leaderboard-content__desc">
              The definitive index of decentralized trust. Reputation scores are calculated via
              multi-vector consensus including voting history, asset longevity, and on-chain identity verification.
            </p>
          </div>

          {/* Stats summary */}
          <div className="leaderboard-stats-row">
            <div className="leaderboard-stat-chip">
              <span className="leaderboard-stat-chip__value">{totalCount.toLocaleString()}</span>
              <span className="leaderboard-stat-chip__label">Active Vaults</span>
            </div>
            <div className="leaderboard-stat-chip">
              <span className="leaderboard-stat-chip__value">{avgScore}</span>
              <span className="leaderboard-stat-chip__label">Avg Score</span>
            </div>
            <div className="leaderboard-stat-chip">
              <span className="leaderboard-stat-chip__value leaderboard-stat-chip__value--green">+4.2%</span>
              <span className="leaderboard-stat-chip__label">Weekly Growth</span>
            </div>
          </div>
        </div>

        {/* ── Your Position Card ── */}
        {yourEntry && (
          <div className="leaderboard-your-position fade-in" id="leaderboard-your-position">
            <div className="leaderboard-your-position__left">
              <div className="leaderboard-your-position__avatar">
                <div className="leaderboard-avatar-gradient" style={{ background: yourEntry.gradient }} />
              </div>
              <div className="leaderboard-your-position__info">
                <span className="leaderboard-your-position__label">Your Position</span>
                <span className="leaderboard-your-position__name">
                  {yourEntry.ens}
                  <span className="leaderboard-your-position__check">✓</span>
                </span>
              </div>
            </div>
            <div className="leaderboard-your-position__right">
              <div className="leaderboard-your-position__metric">
                <span className="leaderboard-your-position__metric-label">Rank</span>
                <span className="leaderboard-your-position__rank">#{yourEntry.rank}</span>
              </div>
              <div className="leaderboard-your-position__divider" />
              <div className="leaderboard-your-position__metric">
                <span className="leaderboard-your-position__metric-label">Score</span>
                <span className="leaderboard-your-position__score">{yourEntry.score}</span>
              </div>
              <div className="leaderboard-your-position__divider" />
              <div className="leaderboard-your-position__metric">
                <span className="leaderboard-your-position__metric-label">Change</span>
                <span className={`leaderboard-your-position__change ${getChangeClass(yourEntry.change)}`}>
                  {formatChange(yourEntry.change)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Filter & Search Row ── */}
        <div className="leaderboard-controls" id="leaderboard-controls">
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
          <div className="leaderboard-search">
            <span className="leaderboard-search__icon">🔍</span>
            <input
              type="text"
              className="leaderboard-search__input"
              placeholder="Search by ENS or address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            {search && (
              <button className="leaderboard-search__clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div className="leaderboard-header">
          <span className="leaderboard-header__col">Rank</span>
          <span className="leaderboard-header__col">Identity / ENS</span>
          <span className="leaderboard-header__col leaderboard-header__col--center">Change</span>
          <span className="leaderboard-header__col leaderboard-header__col--right">Reputation Score</span>
        </div>

        {/* ── Rows ── */}
        <div className="leaderboard-list" id="leaderboard-list">
          {loading ? (
            // Skeleton loading rows
            Array.from({ length: 6 }, (_, i) => (
              <div key={`skel-${i}`} className="leaderboard-row leaderboard-row--skeleton">
                <span className="leaderboard-row__rank">
                  <span className="skeleton" style={{ width: 28, height: 20, display: 'inline-block' }} />
                </span>
                <div className="leaderboard-row__identity">
                  <div className="leaderboard-row__avatar">
                    <div className="leaderboard-avatar-gradient skeleton" />
                  </div>
                  <div className="leaderboard-row__name">
                    <span className="skeleton" style={{ width: 120, height: 14, display: 'inline-block' }} />
                    <span className="skeleton" style={{ width: 90, height: 10, display: 'inline-block', marginTop: 4 }} />
                  </div>
                </div>
                <div className="leaderboard-row__change-col">
                  <span className="skeleton" style={{ width: 30, height: 14, display: 'inline-block' }} />
                </div>
                <div className="leaderboard-row__score-col">
                  <span className="skeleton" style={{ width: 40, height: 22, display: 'inline-block' }} />
                </div>
              </div>
            ))
          ) : paginatedEntries.length === 0 ? (
            <div className="leaderboard-empty">
              <span className="leaderboard-empty__icon">🔎</span>
              <p>No results found for &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            paginatedEntries.map((entry, idx) => (
              <div
                key={`${entry.rank}-${entry.address}`}
                className={`leaderboard-row${entry.isYou ? ' leaderboard-row--you' : ''}${entry.rank <= 3 ? ' leaderboard-row--podium' : ''}`}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <span className={`leaderboard-row__rank ${getRankClass(entry)}`}>
                  {getMedalEmoji(entry.rank) ? (
                    <span className="leaderboard-row__medal">{getMedalEmoji(entry.rank)}</span>
                  ) : (
                    String(entry.rank).padStart(2, '0')
                  )}
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

                <div className="leaderboard-row__change-col">
                  <span className={`leaderboard-row__change ${getChangeClass(entry.change)}`}>
                    {entry.change > 0 && '▲ '}
                    {entry.change < 0 && '▼ '}
                    {formatChange(entry.change)}
                  </span>
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

          {/* Blurred skeleton rows at the bottom */}
          {!loading && paginatedEntries.length > 0 && (
            [1, 2].map((i) => (
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
                <div className="leaderboard-row__change-col">
                  <span className="skeleton" style={{ width: 30, height: 14, display: 'inline-block' }} />
                </div>
                <div className="leaderboard-row__score-col">
                  <span className="skeleton" style={{ width: 40, height: 20, display: 'inline-block' }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination footer ── */}
        <div className="leaderboard-footer" id="leaderboard-footer">
          <span className="leaderboard-footer__count">
            Showing {Math.min((currentPage - 1) * PER_PAGE + 1, filteredEntries.length)}–{Math.min(currentPage * PER_PAGE, filteredEntries.length)} of {totalCount.toLocaleString()} active vault identities
          </span>
          <div className="leaderboard-pagination">
            <button
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn${currentPage === page ? ' active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="pagination-ellipsis">…</span>
                <button
                  className={`pagination-btn${currentPage === totalPages ? ' active' : ''}`}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
