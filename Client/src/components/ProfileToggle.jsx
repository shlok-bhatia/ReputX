import React from 'react';

/**
 * Privacy toggle for public/private profile.
 * Props: isPublic, onToggle
 */
export default function ProfileToggle({ isPublic = false, onToggle }) {
  return (
    <div className="identity-card__privacy" id="privacy-toggle">
      <span className="identity-card__privacy-label">
        🔒 Privacy Protocol
      </span>
      <label className="toggle">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => onToggle && onToggle(!isPublic)}
        />
        <span className="toggle__slider" />
      </label>
    </div>
  );
}
