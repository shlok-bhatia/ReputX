import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletContext } from '../context/WalletContext';
import { formatAddress } from '../config/formatAddress';
import './Navbar.css';

export default function Navbar({ onConnectClick }) {
  const location = useLocation();
  const { isConnected, walletAddress } = useWalletContext();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/" className="navbar__logo">
        ReputX
      </Link>

      <div className="navbar__nav">
        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`navbar__nav-link${location.pathname === path ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="navbar__right">
        {(location.pathname === '/leaderboard' || location.pathname === '/profile') && (
          <div className="navbar__search">
            <span className="navbar__search-icon">🔍</span>
            <input type="text" placeholder="Search Vault..." />
          </div>
        )}

        {isConnected ? (
          <button className="btn-connect btn-connect--connected" id="wallet-connected-btn">
            {formatAddress(walletAddress)}
          </button>
        ) : (
          <button className="btn-connect" id="connect-wallet-btn" onClick={onConnectClick}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
