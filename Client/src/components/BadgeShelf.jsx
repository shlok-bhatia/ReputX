import React from 'react';

const ALL_BADGES = [
  { key: 'dao_voter',     icon: '🏛️', name: 'DAO Voter' },
  { key: 'og_wallet',     icon: '💎', name: 'OG Wallet' },
  { key: 'ens_holder',    icon: '🌐', name: 'ENS Holder' },
  { key: 'diamond_hands', icon: '💠', name: 'Diamond Hands' },
  { key: 'power_user',    icon: '⚡', name: 'Power User' },
  { key: 'clean_record',  icon: '✅', name: 'Clean Record' },
];

/**
 * Badge shelf — shows earned vs locked badges.
 * Props: earnedBadges (string[]), e.g. ['DAO Voter', 'ENS Holder', 'OG Wallet']
 */
export default function BadgeShelf({ earnedBadges = [] }) {
  const earnedCount = ALL_BADGES.filter(b => earnedBadges.includes(b.name)).length;

  return (
    <div className="badges-section" id="badge-shelf">
      <div className="badges-section__header">
        <h3 className="badges-section__title">Reputation Badges</h3>
        <span className="badges-section__count">
          <span>{earnedCount}</span> / {ALL_BADGES.length} Earned
        </span>
      </div>

      <div className="profile-badges-grid">
        {ALL_BADGES.map((badge) => {
          const earned = earnedBadges.includes(badge.name);
          return (
            <div
              key={badge.key}
              className={`profile-badge ${earned ? 'profile-badge--earned' : 'profile-badge--locked'}`}
              id={`badge-${badge.key}`}
            >
              <div className="profile-badge__icon">
                {badge.icon}
                {earned && (
                  <span className="profile-badge__earned-check">✓</span>
                )}
              </div>
              <span className="profile-badge__name">{badge.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
