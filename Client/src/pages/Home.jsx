import React, { useEffect, useState } from 'react';
import { scoreToFraction } from '../utils/scoreUtils';
import './Home.css';

export default function Home({ onConnectClick }) {
  const [scoreVisible, setScoreVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setScoreVisible(true), 300);
    return () => clearTimeout(t);
  }, []);



  const demoScore = 842;
  const fraction = scoreToFraction(demoScore);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <>
     
    <div className="home" id="home-page">
     
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__content fade-in">
          <h1 className="hero__heading">
            Your Wallet is Your<br />
            <span>Reputation</span>
          </h1>
          {/* <p className="hero__subtext">
            Analyze on-chain activity. Build trust. Unlock Web3 with a decentralized identity
            score that reflects your true contribution to the ecosystem.
          </p> */}
          <div className="hero__actions">
            <button className="btn-primary" id="hero-connect-btn"  onClick={onConnectClick}>
              Connect Wallet →
            </button>
          </div>
        </div>

        {/* Hero visual — network graph */}
        <div className="hero__visual fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="hero__graph-box">
            <div className="hero__nodes">
              <div className="node node--center" />
              <div className="node node--a" />
              <div className="node node--b" />
              <div className="node node--c" />
              <div className="node node--d" />
              <div className="node node--e" />
              <div className="node node--f" />
              <div className="node node--g" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="features" id="features-section">
        {/* Reputation Score Card */}
        <div className="feature-card feature-card--score" style={{ animationDelay: '0.1s' }}>
          <span className="feature-card__eyebrow">Identity Core</span>
          <h2 className="feature-card__title">Reputation Score</h2>
          <p className="feature-card__desc">
            A dynamic 0–1000 scale calculating your reliability based on age, volume, and cross-chain interactions.
          </p>

          <div className="feature-score-display">
            {/* Mini score ring */}
            <div className="score-hexagon">
              <svg className="score-ring-svg" width="88" height="88" viewBox="0 0 88 88">
                <circle
                  cx="44" cy="44" r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="6"
                />
                <circle
                  cx="44" cy="44" r={radius}
                  fill="none"
                  stroke="url(#homeScoreGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={String(scoreVisible ? circumference * (1 - fraction) : circumference)}
                />
                <defs>
                  <linearGradient id="homeScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="score-hexagon__value">
                <span className="score-hexagon__num">{demoScore}</span>
              </div>
            </div>

            <div className="feature-score-meta">
              <div className="feature-score-meta__item">
                <span className="feature-score-meta__dot" />
                Top 0.5% of Ecosystem
              </div>
              <div className="feature-score-meta__item">
                <span className="feature-score-meta__dot" style={{ background: 'var(--accent-green)' }} />
                +12 pts last 30 days
              </div>
            </div>
          </div>
        </div>

        {/* Sybil Detection Card */}
        <div className="feature-card feature-card--sybil" style={{ animationDelay: '0.2s' }}>
          <div className="feature-card__icon">🛡️</div>
          <h2 className="feature-card__title">Sybil Detection</h2>
          <p className="feature-card__desc">
           Reputation Engine patterns identifying organic human behavior vs. automated bot farming scripts.
          </p>
          <div className="sybil-bar">
            <div className="sybil-bar__header">
              <span>Human Probability</span>
              <span className="sybil-bar__pct">99.2%</span>
            </div>
            <div className="sybil-bar__track">
              <div className="sybil-bar__fill" style={{ width: '99.2%' }} />
            </div>
          </div>
        </div>

        {/* Governance Alpha Card */}
        <div className="feature-card feature-card--gov" style={{ animationDelay: '0.3s' }}>
          <div className="feature-card__icon--gov">🏛️</div>
          <h2 className="feature-card__title">Governance Alpha</h2>
          <p className="feature-card__desc">
            Track participation in Tally, Snapshot, and on-chain voting to prove governance commitment.
          </p>
          <div className="gov-avatars">
            <div className="gov-avatar" />
            <div className="gov-avatar" style={{ background: 'linear-gradient(135deg, #ff2d78, #f59e0b)' }} />
            <div className="gov-avatar" style={{ background: 'linear-gradient(135deg, #00e5ff, #4ade80)' }} />
            <div className="gov-avatar gov-avatar--count">+2</div>
          </div>
        </div>

        {/* On-chain Badges Card */}
        <div className="feature-card feature-card--badges" style={{ animationDelay: '0.4s' }}>
          <div className="feature-card__header-row">
            <div>
              <h2 className="feature-card__title">On-chain Badges</h2>
              <p className="feature-card__desc">
                Non-transferable proof of skills and achievement earned throughout the metaverse.
              </p>
            </div>
            <span className="feature-card__view-all">View All ↗</span>
          </div>
          <div className="badges-grid">
            <div className="badge-item">💜</div>
            <div className="badge-item">⚡</div>
            <div className="badge-item">🎖️</div>
            <div className="badge-item">🔱</div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta-section" id="cta-section">
        <h2 className="cta-section__title">Ready to claim your Vault?</h2>
        <p className="cta-section__sub">
          Join 500,000+ users building trust in the next generation of the internet.
        </p>
        <div className="cta-section__actions">
          <button className="btn-primary" onClick={onConnectClick}>Mint Your ID</button>
          {/* <button className="btn-secondary">Learn More</button> */}
        </div>
      </section>
    </div>
    </>
  );
}