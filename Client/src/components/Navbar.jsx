import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWalletContext } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { formatAddress } from '../config/formatAddress';
import './Navbar.css';

export default function Navbar({ onConnectClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, walletAddress, disconnect } = useWalletContext();
  const { logout, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/profile', label: 'Profile' },
  ];

  const handleDisconnect = () => {
    disconnect();
    logout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (term) {
      if (term.startsWith('0x') && term.length >= 42) {
        navigate(`/profile/${term}`);
      } else {
        // Here we could handle ENS searching if we build a resolution context
        // For now, if they enter something, we just push it
        navigate(`/profile/${term}`);
      }
      setSearchTerm('');
    }
  };

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
        {(location.pathname === '/leaderboard' || location.pathname.startsWith('/profile')) && (
          <form className="navbar__search" onSubmit={handleSearch}>
            <span className="navbar__search-icon" onClick={handleSearch} style={{cursor: 'pointer'}}>🔍</span>
            <input 
              type="text" 
              placeholder="Search Vault (0x...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        )}

        {isConnected ? (
          <button
            className="btn-connect btn-connect--connected"
            id="wallet-connected-btn"
            onClick={handleDisconnect}
            title="Click to disconnect"
          >
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
