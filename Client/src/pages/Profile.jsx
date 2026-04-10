import React, { useState } from 'react';
import ScoreCard from '../components/ScoreCard';
import BadgeShelf from '../components/BadgeShelf';
import ProfileToggle from '../components/ProfileToggle';
import { useWalletContext } from '../context/WalletContext';
import { useReputation } from '../hooks/useReputation';
import { formatAddress } from '../config/formatAddress';
import './Profile.css';

const STATS = [
  { icon: '🔄', label: 'Transactions', value: '1,240', colorClass: 'stat-card__icon--tx' },
  { icon: '🖼️', label: 'NFTs Held',     value: '42',    colorClass: 'stat-card__icon--nft' },
  { icon: '🗳️', label: 'DAO Votes',     value: '15',    colorClass: 'stat-card__icon--dao' },
  { icon: '📜', label: 'Contracts',     value: '88',    colorClass: 'stat-card__icon--con' },
];

const TIMELINE = [
  { date: 'March 2024', title: 'Tier "Trusted" Achieved',        desc: 'Crossed 700 Reputation threshold.', dot: 'cyan' },
  { date: 'January 2024', title: '1,000 Transactions Milestone', desc: 'Processed on Ethereum Mainnet.',    dot: 'purple' },
  { date: 'Late 2023', title: 'Genesis Contribution',            desc: 'First DAO governance participation.', dot: 'gray' },
];

export default function Profile() {
  const { walletAddress, ensName } = useWalletContext();
  const { data } = useReputation(walletAddress);
  const [isPublic, setIsPublic] = useState(false);

  const score  = data?.score || 742;
  const tier   = data?.tier  || 'Trusted';
  const badges = data?.badges || ['DAO Voter', 'ENS Holder', 'OG Wallet'];
  const sybil  = data?.sybilRisk || 'LOW';

  return (
    <div className="profile-page" id="profile-page">
      <div className="profile-content">
        {/* ── Trust Velocity (Score Ring) ── */}
        <div className="trust-velocity-card">
          <span className="trust-velocity-card__label">Reputation Score</span>
          <ScoreCard score={score} size={200} strokeWidth={8} />
          <div className="trust-velocity-card__tier">{tier}</div>
        </div>

        {/* ── Stats Row ── */}
        <div className="stats-row">
          {STATS.map(({ icon, label, value, colorClass }, i) => (
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
            {ensName || 'vitalik.eth'}
            <span className="identity-card__verified">✓</span>
          </h2>
          <div className="identity-card__address">
            <span>{formatAddress(walletAddress || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}</span>
            <button
              onClick={() => navigator.clipboard.writeText(walletAddress || '')}
              title="Copy address"
            >
              📋
            </button>
          </div>

          <div className="identity-card__stats">
            <div>
              <div className="identity-stat__label">Wallet Age</div>
              <div className="identity-stat__value">3.2 Years</div>
            </div>
            <div>
              <div className="identity-stat__label">Sybil Risk</div>
              <div className="identity-stat__value identity-stat__value--low">
                {sybil} <span style={{ fontSize: '0.65rem' }}>●</span>
              </div>
            </div>
          </div>

          <ProfileToggle isPublic={isPublic} onToggle={setIsPublic} />
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
  );
}
