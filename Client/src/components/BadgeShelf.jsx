import React from 'react';

const ALL_BADGES = [
  { key: 'DAO_VOTER',     icon: '🏛️', name: 'DAO Voter' },
  { key: 'OG_WALLET',     icon: '💎', name: 'OG Wallet' },
  { key: 'ENS_HOLDER',    icon: '🌐', name: 'ENS Holder' },
  { key: 'DIAMOND_HANDS', icon: '💠', name: 'Diamond Hands' },
  { key: 'POWER_USER',    icon: '⚡', name: 'Power User' },
  { key: 'CLEAN_RECORD',  icon: '✅', name: 'Clean Record' },
];

/**
 * Badge shelf — shows earned vs locked badges.
 * Props: earnedBadges (string[]), e.g. ['DAO Voter', 'ENS Holder', 'OG Wallet']
 */
export default function BadgeShelf({ earnedBadges = [] }) {
  const earnedCount = ALL_BADGES.filter(b => earnedBadges.includes(b.key) || earnedBadges.includes(b.name)).length;

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
          const earned = earnedBadges.includes(badge.key) || earnedBadges.includes(badge.name);
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
