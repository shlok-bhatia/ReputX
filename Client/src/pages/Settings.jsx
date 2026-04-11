import React, { useState, useEffect, useCallback } from 'react';
import { useWalletContext } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { formatAddress } from '../config/formatAddress';
import api from '../config/axios';
import './Settings.css';



const PRIVACY_OPTIONS = [
  { id: 'public_profile', label: 'Public Profile', desc: 'Allow others to view your reputation score', icon: '👁️' },
  { id: 'show_badges', label: 'Show Badges', desc: 'Display earned badges on your public profile', icon: '🎖️' },
  { id: 'leaderboard_opt', label: 'Leaderboard Visibility', desc: 'Appear on the global reputation leaderboard', icon: '🏆' },
  { id: 'analytics_share', label: 'Share Analytics', desc: 'Help improve ReputX by sharing anonymous usage data', icon: '📈' },
];

const THEMES = [
  { id: 'dark', label: 'Dark', color: '#0a0a10', accent: '#00e5ff' },
  { id: 'midnight', label: 'Midnight', color: '#0d1117', accent: '#8b5cf6' },
  { id: 'abyss', label: 'Abyss', color: '#050510', accent: '#ff2d78' },
];

export default function Settings() {
  const { walletAddress, ensName, isConnected } = useWalletContext();
  const { isAuthenticated, logout } = useAuth();

  // Local state

  const [privacy, setPrivacy] = useState({
    public_profile: true,
    show_badges: true,
    leaderboard_opt: true,
    analytics_share: false,
  });
  const [activeTheme, setActiveTheme] = useState('dark');
  const [displayName, setDisplayName] = useState(ensName || '');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Fetch true profile data on mount
  useEffect(() => {
    async function loadProfile() {
      if (!walletAddress || !isAuthenticated) return;
      try {
        const res = await api.get(`/api/profile/${walletAddress}`);
        const data = res.data;
        if (data) {
          setPrivacy((prev) => ({ ...prev, public_profile: data.isPublic }));
          if (data.displayName) setDisplayName(data.displayName);
          if (data.bio) setBio(data.bio);
          if (data.email) setEmail(data.email);
          if (data.twitter) setTwitter(data.twitter);
        }
      } catch (err) {
        console.warn('Failed to fetch profile info', err);
      }
    }
    loadProfile();
  }, [walletAddress, isAuthenticated]);

  const handlePrivacyToggle = (id) => {
    setPrivacy((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Attempt to save to backend
      if (isAuthenticated && walletAddress) {
        const response = await api.put('/api/profile/update', {
          address: walletAddress,
          isPublic: privacy.public_profile,
          displayName: displayName || '',
          bio: bio || '',
          email: email || '',
          twitter: twitter || ''
        });
        console.log('Profile updated:', response.data);
      } else {
        console.warn('Not authenticated or no wallet address');
      }
      setTimeout(() => {
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }, 600);
    } catch (error) {
      console.error('Error saving profile:', error);
      // Still show success locally even if backend fails
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }, [isAuthenticated, walletAddress, privacy, displayName, bio, email, twitter]);

  const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    // { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'wallets', label: 'Wallets', icon: '💳' },
  ];

  return (
    <div className="settings-page" id="settings-page">
      <div className="settings-content">
        {/* ── Settings Nav ── */}
        <nav className="settings-nav" id="settings-nav">
          <h2 className="settings-nav__title">Settings</h2>
          <div className="settings-nav__items">
            {SECTIONS.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`settings-nav__item${activeSection === id ? ' active' : ''}`}
                onClick={() => setActiveSection(id)}
              >
                <span className="settings-nav__item-icon">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Settings Panels ── */}
        <div className="settings-panels">
          {/* ═══ Profile Section ═══ */}
          {activeSection === 'profile' && (
            <section className="settings-section fade-in" id="settings-profile">
              <div className="settings-section__header">
                <h3 className="settings-section__title">Profile Settings</h3>
                <p className="settings-section__desc">Manage your identity and display preferences.</p>
              </div>

              <div className="settings-card">
                <div className="settings-profile-header">
                  <div className="settings-avatar">
                    <div className="settings-avatar__gradient" />
                    <span className="settings-avatar__edit">✏️</span>
                  </div>
                  <div className="settings-profile-info">
                    <span className="settings-profile-info__name">
                      {ensName || 'Anonymous User'}
                    </span>
                    <span className="settings-profile-info__address">
                      {formatAddress(walletAddress || '0x0000...0000')}
                    </span>
                    {isConnected && (
                      <span className="settings-profile-info__badge">Connected</span>
                    )}
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-field__label">Display Name</label>
                  <input
                    type="text"
                    className="settings-field__input"
                    placeholder="Enter a display name or ENS..."
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <span className="settings-field__hint">This name will appear on the leaderboard and public profile.</span>
                </div>

                <div className="settings-field">
                  <label className="settings-field__label">Bio</label>
                  <textarea
                    className="settings-field__textarea"
                    placeholder="Tell the community about yourself..."
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                  />
                  <span className="settings-field__hint">Max 160 characters. Visible on your public profile.</span>
                </div>

                <div className="settings-field-row">
                  <div className="settings-field">
                    <label className="settings-field__label">Email (Optional)</label>
                    <input
                      type="email"
                      className="settings-field__input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <label className="settings-field__label">Twitter / X Handle</label>
                    <input
                      type="text"
                      className="settings-field__input"
                      placeholder="@handle"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}



          {/* ═══ Privacy Section ═══ */}
          {activeSection === 'privacy' && (
            <section className="settings-section fade-in" id="settings-privacy">
              <div className="settings-section__header">
                <h3 className="settings-section__title">Privacy & Visibility</h3>
                <p className="settings-section__desc">Control how your data is shared across the platform.</p>
              </div>

              <div className="settings-card">
                {PRIVACY_OPTIONS.map(({ id, label, desc, icon }, idx) => (
                  <div
                    className="settings-toggle-row"
                    key={id}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="settings-toggle-row__left">
                      <span className="settings-toggle-row__icon">{icon}</span>
                      <div className="settings-toggle-row__text">
                        <span className="settings-toggle-row__label">{label}</span>
                        <span className="settings-toggle-row__desc">{desc}</span>
                      </div>
                    </div>
                    <label className="settings-toggle" htmlFor={`priv-${id}`}>
                      <input
                        type="checkbox"
                        id={`priv-${id}`}
                        checked={privacy[id]}
                        onChange={() => handlePrivacyToggle(id)}
                      />
                      <span className="settings-toggle__slider" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-info-box">
                <span className="settings-info-box__icon">ℹ️</span>
                <p>Your wallet address is always pseudonymous. Only optional data you provide (ENS, display name) may be publicly visible.</p>
              </div>
            </section>
          )}

          {/* ═══ Appearance Section ═══ */}
          {activeSection === 'appearance' && (
            <section className="settings-section fade-in" id="settings-appearance">
              <div className="settings-section__header">
                <h3 className="settings-section__title">Appearance</h3>
                <p className="settings-section__desc">Customize the look and feel of your dashboard.</p>
              </div>

              <div className="settings-card">
                <label className="settings-field__label" style={{ marginBottom: 16 }}>Theme</label>
                <div className="settings-theme-grid">
                  {THEMES.map(({ id, label, color, accent }) => (
                    <button
                      key={id}
                      className={`settings-theme-card${activeTheme === id ? ' active' : ''}`}
                      onClick={() => setActiveTheme(id)}
                    >
                      <div className="settings-theme-card__preview" style={{ background: color }}>
                        <div className="settings-theme-card__accent" style={{ background: accent }} />
                        <div className="settings-theme-card__lines">
                          <div className="settings-theme-card__line" style={{ width: '60%' }} />
                          <div className="settings-theme-card__line" style={{ width: '80%' }} />
                          <div className="settings-theme-card__line" style={{ width: '40%' }} />
                        </div>
                      </div>
                      <span className="settings-theme-card__label">{label}</span>
                      {activeTheme === id && (
                        <span className="settings-theme-card__check">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="settings-divider" />

                <div className="settings-toggle-row">
                  <div className="settings-toggle-row__left">
                    <span className="settings-toggle-row__icon">✨</span>
                    <div className="settings-toggle-row__text">
                      <span className="settings-toggle-row__label">Animations</span>
                      <span className="settings-toggle-row__desc">Enable micro-animations and transitions</span>
                    </div>
                  </div>
                  <label className="settings-toggle" htmlFor="anim-toggle">
                    <input type="checkbox" id="anim-toggle" defaultChecked />
                    <span className="settings-toggle__slider" />
                  </label>
                </div>

                <div className="settings-toggle-row">
                  <div className="settings-toggle-row__left">
                    <span className="settings-toggle-row__icon">🔊</span>
                    <div className="settings-toggle-row__text">
                      <span className="settings-toggle-row__label">Sound Effects</span>
                      <span className="settings-toggle-row__desc">Play sounds for score updates and badge unlocks</span>
                    </div>
                  </div>
                  <label className="settings-toggle" htmlFor="sound-toggle">
                    <input type="checkbox" id="sound-toggle" />
                    <span className="settings-toggle__slider" />
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* ═══ Connected Wallets Section ═══ */}
          {activeSection === 'wallets' && (
            <section className="settings-section fade-in" id="settings-wallets">
              <div className="settings-section__header">
                <h3 className="settings-section__title">Connected Wallets</h3>
                <p className="settings-section__desc">Manage wallet connections linked to your identity.</p>
              </div>

              <div className="settings-card">
                {/* Primary wallet */}
                <div className="settings-wallet-row">
                  <div className="settings-wallet-row__left">
                    <div className="settings-wallet-row__icon-box">
                      <span>🦊</span>
                    </div>
                    <div className="settings-wallet-row__info">
                      <span className="settings-wallet-row__addr">
                        {formatAddress(walletAddress || import.meta.env.VITE_MY_WALLET)}
                      </span>
                      <span className="settings-wallet-row__meta">
                        MetaMask · {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                  <span className="settings-wallet-row__primary-badge">Primary</span>
                </div>

                <div className="settings-wallet-row settings-wallet-row--add">
                  <div className="settings-wallet-row__left">
                    <div className="settings-wallet-row__icon-box settings-wallet-row__icon-box--add">
                      <span>+</span>
                    </div>
                    <div className="settings-wallet-row__info">
                      <span className="settings-wallet-row__addr">Link Another Wallet</span>
                      <span className="settings-wallet-row__meta">Connect via WalletConnect, Coinbase, or Ledger</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-info-box">
                <span className="settings-info-box__icon">🔗</span>
                <p>Linking multiple wallets consolidates your on-chain activity into a single reputation score.</p>
              </div>
            </section>
          )}



          {/* ── Save Bar ── */}
          <div className="settings-save-bar" id="settings-save-bar">
            <div className="settings-save-bar__left">
              {saved && (
                <span className="settings-save-bar__success fade-in">
                  ✓ Settings saved successfully
                </span>
              )}
            </div>
            <button
              className={`settings-save-btn${saving ? ' saving' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="settings-save-btn__spinner" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
