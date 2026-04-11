import React, { useState, useEffect,useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ScoreCard from '../components/ScoreCard';
import BadgeShelf from '../components/BadgeShelf';
import ProfileToggle from '../components/ProfileToggle';
import ReviewSection from '../components/ReviewSection';
import WalletConnect from '../components/WalletConnect';
import { useWalletContext } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { useReputation } from '../hooks/useReputation';
import { formatAddress } from '../config/formatAddress';
import api from '../config/axios';
import './Profile.css';
import './Home.css';

const STATS_TEMPLATE = [
  { icon: '🔄', label: 'Transactions', key: 'transactionCount', fallback: '0', colorClass: 'stat-card__icon--tx' },
  { icon: '🖼️', label: 'NFTs Held',     key: 'nftHoldings',      fallback: '0',    colorClass: 'stat-card__icon--nft' },
  { icon: '🗳️', label: 'DAO Votes',     key: 'daoVotes',         fallback: '0',    colorClass: 'stat-card__icon--dao' },
  { icon: '📜', label: 'Contracts',     key: 'uniqueContracts',  fallback: '0',    colorClass: 'stat-card__icon--con' },
];

const TIMELINE = [
 
];

export default function Profile() {
  const { address: paramAddress } = useParams();
  const { walletAddress, ensName } = useWalletContext();
  const { isAuthenticated } = useAuth();
  
  // Use param address if provided, otherwise use current wallet address
  const profileAddress = paramAddress || walletAddress;
  const isOwnProfile = profileAddress === walletAddress;
  
  const { data, loading } = useReputation(profileAddress);
  const [isPublic, setIsPublic] = useState(false);
  const [privacyUpdating, setPrivacyUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Fetch profile data (including display name, bio, etc.)
  useEffect(() => {
    if (!profileAddress) return;
    
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/api/profile/${profileAddress}`);
        setProfileData(res.data);
        setIsPublic(res.data.isPublic || false);
      } catch (err) {
        console.warn('Failed to fetch profile data:', err);
      }
    };
    
    fetchProfile();
  }, [profileAddress]);

  const score  = data?.score !== undefined ? data.score : '-';
  const tier   = data?.tier  || 'NA';
  const badges = data?.badges || [];
  const sybil  = data?.sybilRisk || 'NA';
  const breakdown = data?.breakdown || {};

  const formatWalletAge = (dateString) => {
    if (!dateString) return 'NA';
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (days < 1) return 'New';
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.floor(days / 30)}mo`;
    return `${(days / 365).toFixed(1)}y`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 800);
  
    return () => clearTimeout(timer);
  }, []);
  // Build stats from breakdown data
  const stats = STATS_TEMPLATE.map(s => ({
    ...s,
    value: breakdown[s.key] != null ? String(breakdown[s.key]) : s.fallback,
  }));

  // Toggle profile visibility via API
  const handleVisibilityToggle = useCallback(async (newValue) => {
    if (!isOwnProfile) return; // Prevent toggling other profiles
    
    setIsPublic(newValue);

    if (!isAuthenticated) return;

    setPrivacyUpdating(true);
    try {
      await api.put('/api/profile/visibility', { isPublic: newValue });
    } catch (err) {
      console.warn('[Profile] Failed to update visibility:', err.message);
      // Revert on failure
      setIsPublic(!newValue);
    } finally {
      setPrivacyUpdating(false);
    }
  }, [isAuthenticated, isOwnProfile]);

  return (
    <>
      {!isAuthenticated && <WalletConnect hideClose={true} onClose={() => {}} />}
      <div className="profile-page" id="profile-page" style={!isAuthenticated ? { filter: 'blur(8px)', maxHeight: '100vh', overflow: 'hidden' } : {}}>
        <div className="profile-content" style={!isAuthenticated ? { pointerEvents: 'none' } : {}}>
        {/* ── Trust Velocity (Score Ring) ── */}
        <div className="trust-velocity-card">
          <span className="trust-velocity-card__label">Reputation Score</span>
          <ScoreCard score={score} size={200} strokeWidth={8} />
          <div className="trust-velocity-card__tier">{tier}</div>
          {loading && <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 8 }}>Loading from chain...</div>}
        </div>

        {/* ── Stats Row ── */}
        <div className="stats-row">
          {stats.map(({ icon, label, value, colorClass }, i) => (
            <div
              className="stat-card"
              key={label}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="stat-card__icon-row">
                <span className={`stat-card__icon ${colorClass}`}>{icon}</span>
              </div>
              <span className="stat-card__type">{label}</span>
              <span className="stat-card__value">{value}</span>
            </div>
          ))}
        </div>

        {/* ── Badges ── */}
        <BadgeShelf earnedBadges={badges} />

        {/* ── Identity Card ── */}
        <div className="identity-card">
          <h2 className="identity-card__name">
            {profileData?.ensName || profileData?.displayName || ensName || 'Vault User'}
            <span className="identity-card__verified">✓</span>
          </h2>
          <div className="identity-card__address">
            <span>{formatAddress(profileAddress || walletAddress || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}</span>
            <button
              onClick={() => navigator.clipboard.writeText(profileAddress || walletAddress || '')}
              title="Copy address"
            >
              📋
            </button>
          </div>

          <div className="identity-card__stats">
            <div>
              <div className="identity-stat__label">Wallet Age</div>
              <div className="identity-stat__value">{formatWalletAge(profileData?.memberSince)}</div>
            </div>
            <div>
              <div className="identity-stat__label">Sybil Risk</div>
              <div className="identity-stat__value identity-stat__value--low">
                {sybil} <span style={{ fontSize: '0.65rem' }}>●</span>
              </div>
            </div>
          </div>

          {isOwnProfile && <ProfileToggle isPublic={isPublic} onToggle={handleVisibilityToggle} />}
        </div>

        {/* ── Timeline ── */}
        <div className="timeline-section">
          <h3 className="timeline-section__title">History</h3>
          <div className="timeline">
            {TIMELINE.map(({ date, title, desc, dot }, i) => (
              <div className="timeline-item" key={i}>
                <div className={`timeline-dot timeline-dot--${dot}`} />
                <div className="timeline-body">
                  <span className="timeline-body__date" style={dot === 'purple' ? { color: 'var(--accent-purple)' } : {}}>{date}</span>
                  <p className="timeline-body__title">{title}</p>
                  <p className="timeline-body__desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Peer Reviews & Votes ── */}
        <ReviewSection profileAddress={profileAddress} />

        {/* ── Upgrade CTA ── */}
        <div className="upgrade-cta">
          <div className="upgrade-cta__icon">🚀</div>
          <div className="upgrade-cta__text">
            <h3 className="upgrade-cta__title">Ready for Tier 5?</h3>
            <p className="upgrade-cta__desc">
              Complete 2 more governance votes to unlock Guardian rewards.
            </p>
          </div>
          <button className="upgrade-cta__btn" id="view-requirements-btn">View Requirements</button>
        </div>
      </div>
    </div>
    </>
  );
}
