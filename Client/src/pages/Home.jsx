import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rx-root {
    min-height: 100vh;
    background: #060a14;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 40px 20px;
  }

  .rx-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(30,58,138,0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(30,58,138,0.15) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%);
    pointer-events: none;
  }

  .rx-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(60px);
  }
  .rx-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%);
    top: -120px; left: -140px;
  }
  .rx-orb-2 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(180,140,30,0.16) 0%, transparent 70%);
    bottom: -80px; right: -80px;
  }
  .rx-orb-3 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
    bottom: 20%; left: 10%;
  }

  /* Floating particles */
  .rx-particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(96,165,250,0.35);
    pointer-events: none;
    animation: float-particle linear infinite;
  }

  @keyframes float-particle {
    0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-120px) translateX(30px); opacity: 0; }
  }

  .rx-card {
    position: relative;
    z-index: 2;
    background: rgba(255,255,255,0.03);
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    padding: 52px 56px;
    max-width: 460px;
    width: 100%;
    text-align: center;
    overflow: hidden;
    transition: border-color 0.3s ease;
  }
  .rx-card:hover {
    border-color: rgba(96,165,250,0.2);
  }

  .rx-card-glow {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 220px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,0.7), transparent);
    pointer-events: none;
  }

  .rx-card-shine {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Badge */
  .rx-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(37,99,235,0.1);
    border: 0.5px solid rgba(37,99,235,0.4);
    border-radius: 100px;
    padding: 5px 14px;
    margin-bottom: 32px;
    animation: fadeUp 0.5s 0.1s ease both;
    opacity: 0;
  }
  .rx-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #3b82f6;
    box-shadow: 0 0 8px rgba(59,130,246,0.8);
    animation: pulse-dot 2s ease-in-out infinite;
  }
  .rx-badge-label {
    font-size: 10.5px;
    font-weight: 500;
    color: #60a5fa;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* Logo */
  .rx-logo-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 13px;
    margin-bottom: 10px;
    animation: fadeUp 0.5s 0.18s ease both;
    opacity: 0;
  }
  .rx-logo-icon {
    width: 44px; height: 44px;
    background: linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 100%);
    border-radius: 11px;
    border: 0.5px solid rgba(96,165,250,0.35);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 20px rgba(37,99,235,0.25);
  }
  .rx-logo-wordmark {
    font-family: 'Cinzel', serif;
    font-size: 33px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.05em;
    line-height: 1;
  }
  .rx-logo-wordmark .gold { color: #d4a843; }

  .rx-tagline {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 36px;
    animation: fadeUp 0.5s 0.26s ease both;
    opacity: 0;
  }

  .rx-headline {
    font-size: 22px;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 10px;
    line-height: 1.35;
    animation: fadeUp 0.5s 0.34s ease both;
    opacity: 0;
  }
  .rx-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.42);
    margin-bottom: 38px;
    line-height: 1.7;
    animation: fadeUp 0.5s 0.42s ease both;
    opacity: 0;
  }

  /* Connect Button */
  .rx-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    background: linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%);
    border: 0.5px solid rgba(96,165,250,0.4);
    border-radius: 13px;
    padding: 17px 28px;
    color: #ffffff;
    font-family: 'Outfit', sans-serif;
    font-size: 15.5px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.02em;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    margin-bottom: 30px;
    animation: fadeUp 0.5s 0.5s ease both;
    opacity: 0;
    box-shadow: 0 4px 24px rgba(37,99,235,0.3);
  }
  .rx-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%);
    pointer-events: none;
  }
  .rx-btn::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }
  .rx-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(37,99,235,0.45);
    border-color: rgba(96,165,250,0.65);
  }
  .rx-btn:active {
    transform: translateY(0px) scale(0.99);
    box-shadow: 0 2px 12px rgba(37,99,235,0.3);
  }
  .rx-btn-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Divider */
  .rx-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
    animation: fadeUp 0.5s 0.58s ease both;
    opacity: 0;
  }
  .rx-divider-line {
    flex: 1;
    height: 0.5px;
    background: rgba(255,255,255,0.07);
  }
  .rx-divider-text {
    font-size: 10.5px;
    color: rgba(255,255,255,0.22);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  /* Trust row */
  .rx-trust {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    flex-wrap: wrap;
    animation: fadeUp 0.5s 0.64s ease both;
    opacity: 0;
  }
  .rx-trust-item {
    display: flex; align-items: center; gap: 5px;
  }
  .rx-trust-label {
    font-size: 11px;
    color: rgba(255,255,255,0.28);
    letter-spacing: 0.04em;
  }

  /* Footer */
  .rx-footer {
    position: relative;
    z-index: 2;
    margin-top: 32px;
    font-size: 11px;
    color: rgba(255,255,255,0.18);
    letter-spacing: 0.07em;
    animation: fadeUp 0.5s 0.72s ease both;
    opacity: 0;
  }

  /* Keyframes */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(0.65); opacity: 0.5; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 520px) {
    .rx-card { padding: 40px 28px; }
    .rx-logo-wordmark { font-size: 27px; }
    .rx-trust { gap: 14px; }
  }
`;

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
      fill="rgba(255,255,255,0.12)" stroke="#93c5fd" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="14" rx="3" stroke="white" strokeWidth="1.5" />
    <path d="M16 13C16 13.5523 15.5523 14 15 14C14.4477 14 14 13.5523 14 13C14 12.4477 14.4477 12 15 12C15.5523 12 16 12.4477 16 13Z" fill="white" />
    <path d="M2 10H22" stroke="white" strokeWidth="1.5" />
  </svg>
);

const TrustIcon = ({ type }) => {
  if (type === "shield")
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L2 4V8C2 11.3 4.7 14.3 8 15C11.3 14.3 14 11.3 14 8V4L8 1Z"
          stroke="#d4a843" strokeWidth="1" strokeLinejoin="round" fill="rgba(212,168,67,0.1)" />
        <path d="M5.5 8L7 9.5L10.5 6" stroke="#d4a843" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (type === "zero")
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#d4a843" strokeWidth="1" fill="rgba(212,168,67,0.1)" />
        <path d="M5.5 8H10.5M8 5.5V10.5" stroke="#d4a843" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="5" width="10" height="8" rx="2" stroke="#d4a843" strokeWidth="1" fill="rgba(212,168,67,0.1)" />
      <path d="M6 5V4C6 2.9 6.9 2 8 2C9.1 2 10 2.9 10 4V5" stroke="#d4a843" strokeWidth="1" strokeLinecap="round" />
      <circle cx="8" cy="9" r="1" fill="#d4a843" />
    </svg>
  );
};

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 3 + 2,
  left: `${Math.random() * 100}%`,
  bottom: `${Math.random() * 30}%`,
  duration: `${Math.random() * 6 + 5}s`,
  delay: `${Math.random() * 6}s`,
}));

export default function ReputXSignIn() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setConnected(true);
    }, 2000);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="rx-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
      `}</style>

      {/* Background layers */}
      <div className="rx-grid" />
      <div className="rx-orb rx-orb-1" />
      <div className="rx-orb rx-orb-2" />
      <div className="rx-orb rx-orb-3" />

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="rx-particle"
          style={{
            width: p.size, height: p.size,
            left: p.left, bottom: p.bottom,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Main card */}
      <div className="rx-card">
        <div className="rx-card-glow" />
        <div className="rx-card-shine" />

        {/* Live badge */}
        <div className="rx-badge">
          <div className="rx-badge-dot" />
          <span className="rx-badge-label">Web3 Reputation Layer</span>
        </div>

        {/* Logo */}
        <div className="rx-logo-row">
          <div className="rx-logo-icon">
            <ShieldIcon />
          </div>
          <div className="rx-logo-wordmark">
            Reput<span className="gold">X</span>
          </div>
        </div>

        <p className="rx-tagline">On-Chain Trust Protocol</p>

        <h1 className="rx-headline">Verify your on-chain identity</h1>
        <p className="rx-sub">
          Connect your wallet to access your reputation score,
          credentials, and trust network.
        </p>

        {/* CTA */}
        <button className="rx-btn" onClick={handleConnect} disabled={loading || connected}>
          {loading ? (
            <div className="rx-btn-spinner" />
          ) : connected ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" />
                <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Wallet Connected
            </>
          ) : (
            <>
              <WalletIcon />
              Connect Wallet
            </>
          )}
        </button>

        {/* Trust divider */}
        <div className="rx-divider">
          <div className="rx-divider-line" />
          <span className="rx-divider-text">Secured by</span>
          <div className="rx-divider-line" />
        </div>

        {/* Trust indicators */}
        <div className="rx-trust">
          {[
            { type: "shield", label: "Non-custodial" },
            { type: "zero",   label: "Zero-knowledge" },
            { type: "lock",   label: "End-to-end encrypted" },
          ].map(({ type, label }) => (
            <div className="rx-trust-item" key={type}>
              <TrustIcon type={type} />
              <span className="rx-trust-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="rx-footer">© 2026 ReputX Protocol · All rights reserved</p>
    </div>
  );
}