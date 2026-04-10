import React, { useState } from 'react';
import { useWalletContext } from '../context/WalletContext';
import { formatAddress } from '../config/formatAddress';
import './WalletConnect.css';

const WALLETS = [
  { id: 'metamask',  name: 'MetaMask',        iconClass: 'wallet-option__icon--metamask', emoji: '🦊', popular: true },
  { id: 'rainbow',   name: 'Rainbow',          iconClass: 'wallet-option__icon--rainbow',  emoji: '🌈', popular: false },
  { id: 'coinbase',  name: 'Coinbase Wallet',  iconClass: 'wallet-option__icon--coinbase', emoji: '🔵', popular: false },
  { id: 'wc',        name: 'WalletConnect',    iconClass: 'wallet-option__icon--wc',       emoji: '🔗', popular: false },
];

export default function WalletConnect({ onClose }) {
  const { connect, isConnected, walletAddress } = useWalletContext();
  const [connecting, setConnecting] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);

  const handleSelect = async (walletId) => {
    setConnecting(walletId);
    await connect();
    setConnecting(null);
    onClose();
    setShowToast(true);
    setTimeout(() => {
      setToastExiting(true);
      setTimeout(() => { setShowToast(false); setToastExiting(false); }, 300);
    }, 3500);
  };

  const closeToast = () => {
    setToastExiting(true);
    setTimeout(() => { setShowToast(false); setToastExiting(false); }, 300);
  };

  return (
    <>
      {/* Modal overlay */}
      <div className="modal-overlay" id="wallet-modal-overlay" onClick={onClose}>
        <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
          <button className="wallet-modal__close" onClick={onClose} aria-label="Close">✕</button>

          <h2 className="wallet-modal__title">Connect Your Wallet</h2>
          <p className="wallet-modal__sub">Select your preferred entry point to the Vault.</p>

          <div className="wallet-options">
            {WALLETS.map((w) => (
              <button
                key={w.id}
                className="wallet-option"
                id={`wallet-option-${w.id}`}
                onClick={() => handleSelect(w.id)}
                disabled={connecting !== null}
              >
                <div className={`wallet-option__icon ${w.iconClass}`}>{w.emoji}</div>
                <span className="wallet-option__name">{w.name}</span>
                {w.popular && <span className="wallet-option__popular">Popular</span>}
                {!w.popular && <span className="wallet-option__arrow">›</span>}
              </button>
            ))}
          </div>

          <p className="wallet-modal__terms">
            By connecting, you agree to our{' '}
            <a href="#">Privacy Protocol</a> and{' '}
            <a href="#">Decentralized Terms</a>.
          </p>
        </div>
      </div>

      {/* Toast */}
      {showToast && isConnected && (
        <div className={`toast${toastExiting ? ' toast--exit' : ''}`} id="wallet-connected-toast">
          <div className="toast__icon">✓</div>
          <div className="toast__body">
            <span className="toast__title">Wallet Connected</span>
            <span className="toast__address">{formatAddress(walletAddress)}</span>
          </div>
          <button className="toast__close" onClick={closeToast}>✕</button>
        </div>
      )}
    </>
  );
}
